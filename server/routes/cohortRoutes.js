import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, get, run } from '../db/database.js';
import { authenticate, requirePermission, logAudit } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. List All Cohorts with Aggregate Progress & Member Counts
router.get('/', authenticate, async (req, res) => {
  try {
    const cohorts = await query(`
      SELECT c.*,
             u.first_name || ' ' || u.last_name AS lead_name,
             u.avatar_url AS lead_avatar,
             (SELECT COUNT(*) FROM cohort_members WHERE cohort_id = c.id) AS member_count,
             (SELECT COUNT(*) FROM cohort_courses WHERE cohort_id = c.id) AS course_count
      FROM cohorts c
      LEFT JOIN users u ON c.lead_manager_id = u.id
      WHERE c.org_id = ? OR ? = 'SUPER_ADMIN'
      ORDER BY c.created_at DESC
    `, [req.user.org_id, req.user.role]);

    for (const ch of cohorts) {
      // Calculate aggregate progress for cohort members in assigned courses
      const progressStats = await get(`
        SELECT AVG(e.progress_percent) AS avg_progress,
               COUNT(CASE WHEN e.status = 'COMPLETED' THEN 1 END) AS completed_enrollments,
               COUNT(e.id) AS total_enrollments
        FROM cohort_members cm
        JOIN cohort_courses cc ON cm.cohort_id = cc.cohort_id
        LEFT JOIN enrollments e ON e.user_id = cm.user_id AND e.course_id = cc.course_id
        WHERE cm.cohort_id = ?
      `, [ch.id]);

      ch.avg_progress = Math.round(progressStats?.avg_progress || 0);
      ch.completed_enrollments = progressStats?.completed_enrollments || 0;
      ch.total_enrollments = progressStats?.total_enrollments || 0;

      // Sample avatar preview (up to 4 members)
      ch.sample_members = await query(`
        SELECT u.id, u.first_name, u.last_name, u.avatar_url
        FROM cohort_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.cohort_id = ?
        LIMIT 4
      `, [ch.id]);
    }

    res.json(cohorts);
  } catch (err) {
    console.error('Failed to get cohorts:', err);
    res.status(500).json({ error: 'Failed to fetch cohorts' });
  }
});

// 2. Get Cohort Details (Members with progress & Assigned Courses)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const cohort = await get(`
      SELECT c.*,
             u.first_name || ' ' || u.last_name AS lead_name,
             u.avatar_url AS lead_avatar,
             u.email AS lead_email
      FROM cohorts c
      LEFT JOIN users u ON c.lead_manager_id = u.id
      WHERE c.id = ?
    `, [req.params.id]);

    if (!cohort) return res.status(404).json({ error: 'Cohort not found' });

    // Members list with their individual course progress
    const members = await query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.avatar_url, u.title, u.department, u.status,
             gp.streak_days, gp.points, gp.rank_title,
             cm.joined_at
      FROM cohort_members cm
      JOIN users u ON cm.user_id = u.id
      LEFT JOIN gamification_profiles gp ON u.id = gp.user_id
      WHERE cm.cohort_id = ?
      ORDER BY u.last_name ASC
    `, [req.params.id]);

    // Assigned courses
    const courses = await query(`
      SELECT c.id, c.title, c.category, c.level, c.thumbnail_url, c.duration_minutes,
             cc.assigned_at
      FROM cohort_courses cc
      JOIN courses c ON cc.course_id = c.id
      WHERE cc.cohort_id = ?
      ORDER BY cc.assigned_at DESC
    `, [req.params.id]);

    // For each member, attach progress for each course
    for (const member of members) {
      const enrollments = await query(`
        SELECT e.course_id, e.status, e.progress_percent, e.due_date, e.completed_at
        FROM enrollments e
        WHERE e.user_id = ? AND e.course_id IN (
          SELECT course_id FROM cohort_courses WHERE cohort_id = ?
        )
      `, [member.id, req.params.id]);

      const enrMap = {};
      for (const enr of enrollments) {
        enrMap[enr.course_id] = enr;
      }
      member.courses_progress = enrMap;

      const totalCourses = courses.length;
      const completedCourses = enrollments.filter(e => e.status === 'COMPLETED').length;
      const avgProgress = enrollments.length > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percent || 0), 0) / (totalCourses || 1))
        : 0;

      member.completed_count = completedCourses;
      member.overall_cohort_progress = avgProgress;
    }

    cohort.members = members;
    cohort.courses = courses;

    res.json(cohort);
  } catch (err) {
    console.error('Failed to get cohort details:', err);
    res.status(500).json({ error: 'Failed to fetch cohort details' });
  }
});

// Helper function to auto-enroll members in cohort courses
async function autoEnrollCohort(orgId, memberIds, courseIds, dueDate = null) {
  if (!memberIds?.length || !courseIds?.length) return;

  for (const userId of memberIds) {
    for (const courseId of courseIds) {
      const existing = await get('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, courseId]);
      if (!existing) {
        const enrId = 'enr-' + uuidv4().slice(0, 8);
        await run(`
          INSERT INTO enrollments (id, user_id, course_id, org_id, status, progress_percent, due_date)
          VALUES (?, ?, ?, ?, 'IN_PROGRESS', 0, ?)
        `, [enrId, userId, courseId, orgId, dueDate || null]);
      }
    }
  }
}

// 3. Create Cohort (with members, courses, and auto-enrollment)
router.post('/', authenticate, requirePermission('learner.manage'), async (req, res) => {
  try {
    const name = req.body.name;
    const description = req.body.description || '';
    const department = req.body.department || 'Enterprise Training';
    const leadManagerId = req.body.leadManagerId || req.body.manager_id || req.user.id;
    const targetCompletionDate = req.body.targetCompletionDate || req.body.target_completion_date || null;
    const memberIds = req.body.memberIds || req.body.member_ids || [];
    const courseIds = req.body.courseIds || req.body.course_ids || [];

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Cohort name is required' });
    }

    const cohortId = 'cohort-' + uuidv4().slice(0, 8);
    await run(`
      INSERT INTO cohorts (id, org_id, name, description, department, lead_manager_id, target_completion_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    `, [
      cohortId,
      req.user.org_id,
      name.trim(),
      description,
      department,
      leadManagerId,
      targetCompletionDate
    ]);

    // Add initial members
    if (Array.isArray(memberIds) && memberIds.length > 0) {
      for (const uid of memberIds) {
        await run('INSERT OR IGNORE INTO cohort_members (cohort_id, user_id) VALUES (?, ?)', [cohortId, uid]);
      }
    }

    // Add initial courses
    if (Array.isArray(courseIds) && courseIds.length > 0) {
      for (const cid of courseIds) {
        await run('INSERT OR IGNORE INTO cohort_courses (cohort_id, course_id) VALUES (?, ?)', [cohortId, cid]);
      }
    }

    // Auto-enroll all members in all cohort courses
    await autoEnrollCohort(req.user.org_id, memberIds, courseIds, targetCompletionDate);

    await logAudit(req.user.org_id, req.user.id, 'COHORT_CREATED', 'COHORT', cohortId, { name, memberCount: memberIds?.length || 0 });

    const created = await get('SELECT * FROM cohorts WHERE id = ?', [cohortId]);
    res.status(201).json(created);
  } catch (err) {
    console.error('Failed to create cohort:', err);
    res.status(500).json({ error: 'Failed to create cohort: ' + err.message });
  }
});

// 4. Update Cohort Details
router.put('/:id', authenticate, requirePermission('learner.manage'), async (req, res) => {
  try {
    const { name, description, department, leadManagerId, targetCompletionDate, status } = req.body;
    const existing = await get('SELECT * FROM cohorts WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Cohort not found' });

    await run(`
      UPDATE cohorts SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        department = COALESCE(?, department),
        lead_manager_id = COALESCE(?, lead_manager_id),
        target_completion_date = COALESCE(?, target_completion_date),
        status = COALESCE(?, status)
      WHERE id = ?
    `, [
      name,
      description,
      department,
      leadManagerId,
      targetCompletionDate,
      status,
      req.params.id
    ]);

    const updated = await get('SELECT * FROM cohorts WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    console.error('Failed to update cohort:', err);
    res.status(500).json({ error: 'Failed to update cohort' });
  }
});

// 5. Delete Cohort
router.delete('/:id', authenticate, requirePermission('learner.manage'), async (req, res) => {
  try {
    const existing = await get('SELECT * FROM cohorts WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Cohort not found' });

    await run('DELETE FROM cohorts WHERE id = ?', [req.params.id]);
    await logAudit(req.user.org_id, req.user.id, 'COHORT_DELETED', 'COHORT', req.params.id, { name: existing.name });

    res.json({ success: true, message: 'Cohort deleted successfully' });
  } catch (err) {
    console.error('Failed to delete cohort:', err);
    res.status(500).json({ error: 'Failed to delete cohort' });
  }
});

// 6. Add Members to Cohort (and auto-enroll in all existing cohort courses)
router.post('/:id/members', authenticate, requirePermission('learner.manage'), async (req, res) => {
  try {
    let userIds = req.body.userIds || req.body.user_ids;
    if (!userIds && req.body.user_id) userIds = [req.body.user_id];
    if (!userIds && req.body.userId) userIds = [req.body.userId];
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array is required' });
    }

    const cohort = await get('SELECT * FROM cohorts WHERE id = ?', [req.params.id]);
    if (!cohort) return res.status(404).json({ error: 'Cohort not found' });

    for (const uid of userIds) {
      await run('INSERT OR IGNORE INTO cohort_members (cohort_id, user_id) VALUES (?, ?)', [req.params.id, uid]);
    }

    // Auto-enroll in all courses assigned to this cohort
    const cohortCourses = await query('SELECT course_id FROM cohort_courses WHERE cohort_id = ?', [req.params.id]);
    const courseIds = cohortCourses.map(c => c.course_id);
    await autoEnrollCohort(cohort.org_id, userIds, courseIds, cohort.target_completion_date);

    res.json({ success: true, message: `Added ${userIds.length} members to cohort`, memberCount: userIds.length });
  } catch (err) {
    console.error('Failed to add members:', err);
    res.status(500).json({ error: 'Failed to add members' });
  }
});

// 7. Remove Member from Cohort
router.delete('/:id/members/:userId', authenticate, requirePermission('learner.manage'), async (req, res) => {
  try {
    await run('DELETE FROM cohort_members WHERE cohort_id = ? AND user_id = ?', [req.params.id, req.params.userId]);
    res.json({ success: true, message: 'Member removed from cohort' });
  } catch (err) {
    console.error('Failed to remove member:', err);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// 8. Assign Courses to Cohort (and auto-enroll all cohort members)
router.post('/:id/courses', authenticate, requirePermission('learner.manage'), async (req, res) => {
  try {
    let courseIds = req.body.courseIds || req.body.course_ids;
    if (!courseIds && req.body.course_id) courseIds = [req.body.course_id];
    if (!courseIds && req.body.courseId) courseIds = [req.body.courseId];
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ error: 'courseIds array is required' });
    }

    const cohort = await get('SELECT * FROM cohorts WHERE id = ?', [req.params.id]);
    if (!cohort) return res.status(404).json({ error: 'Cohort not found' });

    for (const cid of courseIds) {
      await run('INSERT OR IGNORE INTO cohort_courses (cohort_id, course_id) VALUES (?, ?)', [req.params.id, cid]);
    }

    // Auto-enroll all cohort members into these newly assigned courses
    const cohortMembers = await query('SELECT user_id FROM cohort_members WHERE cohort_id = ?', [req.params.id]);
    const memberIds = cohortMembers.map(m => m.user_id);
    await autoEnrollCohort(cohort.org_id, memberIds, courseIds, cohort.target_completion_date);

    res.json({ message: `Assigned ${courseIds.length} course(s) to cohort`, courseCount: courseIds.length });
  } catch (err) {
    console.error('Failed to assign courses:', err);
    res.status(500).json({ error: 'Failed to assign courses' });
  }
});

// 9. Remove Course from Cohort
router.delete('/:id/courses/:courseId', authenticate, requirePermission('learner.manage'), async (req, res) => {
  try {
    await run('DELETE FROM cohort_courses WHERE cohort_id = ? AND course_id = ?', [req.params.id, req.params.courseId]);
    res.json({ message: 'Course removed from cohort' });
  } catch (err) {
    console.error('Failed to remove course:', err);
    res.status(500).json({ error: 'Failed to remove course' });
  }
});

// 10. Nudge Cohort (Send reminder notification to members with pending courses)
router.post('/:id/nudge', authenticate, requirePermission('learner.manage'), async (req, res) => {
  try {
    const cohort = await get('SELECT * FROM cohorts WHERE id = ?', [req.params.id]);
    if (!cohort) return res.status(404).json({ error: 'Cohort not found' });

    // Find incomplete members
    const pendingMembers = await query(`
      SELECT DISTINCT u.id, u.first_name, u.email
      FROM cohort_members cm
      JOIN users u ON cm.user_id = u.id
      JOIN cohort_courses cc ON cm.cohort_id = cc.cohort_id
      LEFT JOIN enrollments e ON e.user_id = cm.user_id AND e.course_id = cc.course_id
      WHERE cm.cohort_id = ? AND (e.status IS NULL OR e.status != 'COMPLETED')
    `, [req.params.id]);

    for (const m of pendingMembers) {
      await run(`
        INSERT INTO notifications (id, user_id, org_id, title, message, type, action_url)
        VALUES (?, ?, ?, 'Cohort Milestone Reminder', ?, 'DEADLINE', '/learning')
      `, [
        'notif-' + uuidv4().slice(0, 8),
        m.id,
        cohort.org_id,
        `Friendly reminder from ${req.user.name}: You have pending modules in the "${cohort.name}" cohort.`
      ]);
    }

    res.json({ message: `Reminder sent to ${pendingMembers.length} member(s)`, nudgedCount: pendingMembers.length });
  } catch (err) {
    console.error('Failed to nudge cohort:', err);
    res.status(500).json({ error: 'Failed to nudge cohort' });
  }
});

export default router;
