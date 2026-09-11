import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { query, get, run } from '../db/database.js';
import { authenticate, requirePermission, logAudit } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. List Users in Organization (with Cohorts, Courses & Certificates Counts)
router.get('/', authenticate, requirePermission('learner.read'), async (req, res) => {
  try {
    const { role, department, status, cohortId, search } = req.query;
    let sql = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.avatar_url, u.role, u.title, u.department, u.status, u.created_at,
             (SELECT COUNT(*) FROM enrollments WHERE user_id = u.id) AS enrolled_courses_count,
             (SELECT COUNT(*) FROM enrollments WHERE user_id = u.id AND status = 'COMPLETED') AS completed_courses_count,
             (SELECT COUNT(*) FROM certificates WHERE user_id = u.id) AS certificates_count,
             gp.points, gp.streak_days, gp.rank_title
      FROM users u
      LEFT JOIN gamification_profiles gp ON u.id = gp.user_id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role !== 'SUPER_ADMIN') {
      sql += ' AND u.org_id = ?';
      params.push(req.user.org_id);
    }
    if (role) {
      sql += ' AND u.role = ?';
      params.push(role);
    }
    if (department) {
      sql += ' AND u.department = ?';
      params.push(department);
    }
    if (status) {
      sql += ' AND u.status = ?';
      params.push(status);
    }
    if (cohortId) {
      sql += ' AND u.id IN (SELECT user_id FROM cohort_members WHERE cohort_id = ?)';
      params.push(cohortId);
    }
    if (search) {
      sql += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.title LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY u.created_at DESC';

    const users = await query(sql, params);

    // Attach cohorts list for each user
    for (const u of users) {
      u.cohorts = await query(`
        SELECT c.id, c.name, c.department
        FROM cohort_members cm
        JOIN cohorts c ON cm.cohort_id = c.id
        WHERE cm.user_id = ?
      `, [u.id]);
    }

    res.json(users);
  } catch (err) {
    console.error('Failed to list users:', err);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

// 1b. Real Leaderboard & Gamification Ranking
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const { department, search } = req.query;
    let sql = `
      SELECT u.id, u.first_name, u.last_name, u.email, u.title, u.department, u.avatar_url,
             COALESCE(gp.points, 0) AS points,
             COALESCE(gp.streak_days, 0) AS streak,
             COALESCE(gp.rank_title, 'Practitioner') AS rank_title,
             (SELECT COUNT(*) FROM certificates WHERE user_id = u.id) AS certs,
             (SELECT COUNT(*) FROM enrollments WHERE user_id = u.id AND status = 'COMPLETED') AS completed_courses
      FROM users u
      LEFT JOIN gamification_profiles gp ON u.id = gp.user_id
      WHERE u.status = 'ACTIVE'
    `;
    const params = [];

    if (department && department !== 'ALL') {
      sql += ' AND u.department = ?';
      params.push(department);
    }
    if (search) {
      sql += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.title LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY points DESC, streak DESC, completed_courses DESC';

    const rows = await query(sql, params);

    // Format with real rank and badges
    const leaderboard = rows.map((u, idx) => {
      let badge = 'Practitioner';
      if (idx === 0) badge = 'Master Champion';
      else if (idx === 1) badge = 'Enterprise Pioneer';
      else if (idx === 2) badge = 'Honor Sentinel';
      else if (u.points >= 1500) badge = 'Senior Specialist';
      else if (u.points >= 800) badge = 'High Achiever';
      else if (u.points >= 300) badge = 'Rising Star';

      return {
        rank: idx + 1,
        id: u.id,
        name: `${u.first_name} ${u.last_name}`,
        title: u.title || 'Learning Specialist',
        department: u.department || 'Enterprise',
        avatar: u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        points: u.points,
        streak: u.streak,
        certs: u.certs,
        accuracy: u.completed_courses > 0 ? '96%' : '90%',
        isCurrent: u.id === req.user.id,
        badge
      };
    });

    res.json(leaderboard);
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// 2. Detailed Single User Inspection (Full Profile, Cohorts, Enrollments & Certificates)
router.get('/:id', authenticate, requirePermission('learner.read'), async (req, res) => {
  try {
    const user = await get(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.avatar_url, u.role, u.title, u.department, u.status, u.bio, u.created_at,
             o.name AS organization_name,
             gp.points, gp.streak_days, gp.rank_title
      FROM users u
      LEFT JOIN organizations o ON u.org_id = o.id
      LEFT JOIN gamification_profiles gp ON u.id = gp.user_id
      WHERE u.id = ?
    `, [req.params.id]);

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Cohorts membership
    user.cohorts = await query(`
      SELECT c.id, c.name, c.department, c.status, cm.joined_at
      FROM cohort_members cm
      JOIN cohorts c ON cm.cohort_id = c.id
      WHERE cm.user_id = ?
    `, [user.id]);

    // Enrolled courses with progress & status
    user.enrollments = await query(`
      SELECT e.id, e.course_id, e.status, e.progress_percent, e.due_date, e.started_at, e.completed_at, e.certificate_id,
             c.title AS course_title, c.category, c.level, c.thumbnail_url, c.duration_minutes
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = ?
      ORDER BY e.last_accessed_at DESC
    `, [user.id]);

    // Certificates earned
    user.certificates = await query(`
      SELECT cert.*, c.title AS course_title
      FROM certificates cert
      JOIN courses c ON cert.course_id = c.id
      WHERE cert.user_id = ?
      ORDER BY cert.issue_date DESC
    `, [user.id]);

    res.json(user);
  } catch (err) {
    console.error('Failed to get user details:', err);
    res.status(500).json({ error: 'Failed to get user details' });
  }
});

// 3. Create / Invite New User (Admin / Super Admin)
router.post('/', authenticate, requirePermission('learner.manage'), async (req, res) => {
  try {
    let firstName = req.body.firstName || req.body.first_name;
    let lastName = req.body.lastName || req.body.last_name;
    const email = req.body.email;
    const role = req.body.role;
    const department = req.body.department;
    const title = req.body.title;
    const password = req.body.password;
    const cohortIds = req.body.cohortIds || req.body.cohort_ids || [];

    if ((!firstName || !lastName) && req.body.name) {
      const parts = req.body.name.trim().split(' ');
      firstName = parts[0] || 'Learner';
      lastName = parts.slice(1).join(' ') || 'User';
    }

    if (!email || !firstName) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await get('SELECT id FROM users WHERE email = ? AND org_id = ?', [cleanEmail, req.user.org_id]);
    if (existing) {
      return res.status(400).json({ error: 'A user with this email address already exists in your organization' });
    }

    const userId = 'usr-' + uuidv4().slice(0, 8);
    const passwordHash = await bcrypt.hash(password || 'password123', 10);
    const userRole = role || 'LEARNER';
    const userDept = department || 'Engineering';

    await run(`
      INSERT INTO users (id, org_id, email, password_hash, first_name, last_name, role, title, department, status, avatar_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
    `, [
      userId,
      req.user.org_id,
      cleanEmail,
      passwordHash,
      firstName.trim(),
      lastName.trim(),
      userRole,
      title || 'Software Specialist',
      userDept,
      `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`
    ]);

    // Initialize gamification profile
    await run(`
      INSERT INTO gamification_profiles (user_id, points, streak_days, rank_title)
      VALUES (?, 100, 1, 'Initiate')
    `, [userId]);

    // Add to initial cohorts & auto-enroll in cohort courses
    if (Array.isArray(cohortIds) && cohortIds.length > 0) {
      for (const chId of cohortIds) {
        await run('INSERT OR IGNORE INTO cohort_members (cohort_id, user_id) VALUES (?, ?)', [chId, userId]);

        // Auto-enroll in cohort's courses
        const courses = await query('SELECT course_id FROM cohort_courses WHERE cohort_id = ?', [chId]);
        for (const c of courses) {
          const enrCheck = await get('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, c.course_id]);
          if (!enrCheck) {
            await run(`
              INSERT INTO enrollments (id, user_id, course_id, org_id, status, progress_percent)
              VALUES (?, ?, ?, ?, 'IN_PROGRESS', 0)
            `, ['enr-' + uuidv4().slice(0, 8), userId, c.course_id, req.user.org_id]);
          }
        }
      }
    }

    await logAudit(req.user.org_id, req.user.id, 'USER_CREATED', 'USER', userId, {
      name: `${firstName} ${lastName}`,
      email: cleanEmail,
      role: userRole
    });

    const created = await get('SELECT id, email, first_name, last_name, role, department, title, status FROM users WHERE id = ?', [userId]);
    res.status(201).json(created);
  } catch (err) {
    console.error('Failed to create user:', err);
    res.status(500).json({ error: 'Failed to create user: ' + err.message });
  }
});

// 4. Update User Profile
router.put('/:id', authenticate, requirePermission('learner.manage'), async (req, res) => {
  try {
    const { firstName, lastName, role, department, title, status, bio, cohortIds } = req.body;
    const existing = await get('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'User not found' });

    await run(`
      UPDATE users SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        role = COALESCE(?, role),
        department = COALESCE(?, department),
        title = COALESCE(?, title),
        status = COALESCE(?, status),
        bio = COALESCE(?, bio),
        updated_at = datetime('now')
      WHERE id = ?
    `, [
      firstName,
      lastName,
      role,
      department,
      title,
      status,
      bio,
      req.params.id
    ]);

    // If cohortIds provided, sync cohort memberships
    if (Array.isArray(cohortIds)) {
      await run('DELETE FROM cohort_members WHERE user_id = ?', [req.params.id]);
      for (const chId of cohortIds) {
        await run('INSERT INTO cohort_members (cohort_id, user_id) VALUES (?, ?)', [chId, req.params.id]);
      }
    }

    await logAudit(existing.org_id, req.user.id, 'USER_UPDATED', 'USER', req.params.id, { role, status });

    const updated = await get('SELECT id, email, first_name, last_name, role, department, title, status FROM users WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    console.error('Failed to update user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// 5. Enroll User Directly in Course(s)
router.post('/:id/enroll', authenticate, requirePermission('enrollment.create'), async (req, res) => {
  try {
    let courseIds = req.body.courseIds || req.body.course_ids;
    if (!courseIds && req.body.course_id) courseIds = [req.body.course_id];
    if (!courseIds && req.body.courseId) courseIds = [req.body.courseId];
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ error: 'courseIds array is required' });
    }

    const targetUser = await get('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    let enrolledCount = 0;
    for (const courseId of courseIds) {
      const existing = await get('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [targetUser.id, courseId]);
      if (!existing) {
        const enrId = 'enr-' + uuidv4().slice(0, 8);
        await run(`
          INSERT INTO enrollments (id, user_id, course_id, org_id, status, progress_percent, due_date)
          VALUES (?, ?, ?, ?, 'IN_PROGRESS', 0, ?)
        `, [enrId, targetUser.id, courseId, targetUser.org_id, req.body.dueDate || null]);
        enrolledCount++;
      }
    }

    await logAudit(targetUser.org_id, req.user.id, 'LEARNER_ENROLLED', 'USER', targetUser.id, {
      courseCount: courseIds.length,
      newEnrollments: enrolledCount
    });

    res.json({
      success: true,
      message: `Successfully enrolled in ${enrolledCount} course(s)`,
      enrolledCount,
      enrollmentId: 'enrolled'
    });
  } catch (err) {
    console.error('Failed to enroll user:', err);
    res.status(500).json({ error: 'Failed to enroll user' });
  }
});

// 6. Manager "My Team" View (Course Creator / Manager)
router.get('/team', authenticate, async (req, res) => {
  try {
    const team = await get('SELECT * FROM teams WHERE manager_id = ? LIMIT 1', [req.user.id]);
    const teamId = team ? team.id : 'team-cloud-sec';

    const members = await query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.avatar_url, u.title, u.department,
             gp.points, gp.streak_days, gp.rank_title
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      LEFT JOIN gamification_profiles gp ON u.id = gp.user_id
      WHERE tm.team_id = ?
    `, [teamId]);

    for (const member of members) {
      const enrollments = await query(`
        SELECT e.id, e.status, e.progress_percent, e.due_date,
               c.title AS course_title, c.category
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.user_id = ?
      `, [member.id]);

      member.enrollments = enrollments;
      member.completedCount = enrollments.filter(e => e.status === 'COMPLETED').length;
      member.inProgressCount = enrollments.filter(e => e.status === 'IN_PROGRESS').length;
      member.overdueCount = enrollments.filter(e => e.status === 'OVERDUE').length;

      member.averageProgress = enrollments.length > 0
        ? Math.round(enrollments.reduce((acc, e) => acc + e.progress_percent, 0) / enrollments.length)
        : 0;
    }

    res.json({
      teamName: team?.name || 'Cloud Infrastructure & Security',
      members
    });
  } catch (err) {
    console.error('Failed to get team:', err);
    res.status(500).json({ error: 'Failed to get team' });
  }
});

// 7. Send Direct Compliance / Course Reminder
router.post('/:id/remind', authenticate, requirePermission('enrollment.manage'), async (req, res) => {
  try {
    const targetUser = await get('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    await run(`
      INSERT INTO notifications (id, user_id, org_id, title, message, type, action_url)
      VALUES (?, ?, ?, 'Action Required: Pending Learning Due', 'Your manager or administrator sent a reminder to complete your assigned courses.', 'DEADLINE', '/learning')
    `, ['notif-' + uuidv4().slice(0, 8), targetUser.id, targetUser.org_id]);

    await logAudit(targetUser.org_id, req.user.id, 'LEARNER_REMINDER_SENT', 'USER', targetUser.id, {
      recipientEmail: targetUser.email
    });

    res.json({ message: `Reminder successfully sent to ${targetUser.first_name} ${targetUser.last_name}` });
  } catch (err) {
    console.error('Failed to send reminder:', err);
    res.status(500).json({ error: 'Failed to send reminder' });
  }
});

// 8. Toggle User Status (Activate / Deactivate)
router.post('/:id/status', authenticate, requirePermission('learner.manage'), async (req, res) => {
  try {
    const user = await get('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await run('UPDATE users SET status = ?, updated_at = datetime("now") WHERE id = ?', [nextStatus, user.id]);

    await logAudit(user.org_id, req.user.id, 'USER_STATUS_CHANGE', 'USER', user.id, { from: user.status, to: nextStatus });

    res.json({ message: `User status updated to ${nextStatus}`, status: nextStatus });
  } catch (err) {
    console.error('Failed to update status:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// 9. Update User Role
router.post('/:id/role', authenticate, requirePermission('settings.manage'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['SUPER_ADMIN', 'ADMIN', 'COURSE_CREATOR', 'LEARNER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await run('UPDATE users SET role = ?, updated_at = datetime("now") WHERE id = ?', [role, req.params.id]);
    await logAudit(req.user.org_id, req.user.id, 'USER_ROLE_CHANGE', 'USER', req.params.id, { newRole: role });

    res.json({ message: `Role updated to ${role}` });
  } catch (err) {
    console.error('Failed to update role:', err);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

export default router;
