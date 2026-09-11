import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { query, get, run } from '../db/database.js';
import { authenticate, requirePermission, logAudit } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${uuidv4().slice(0, 8)}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

const router = express.Router();

// 0. Media File Upload Endpoint (Thumbnails, Inside Images, Videos, Documents)
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

// 1. List Courses (Role-aware & search/filter enabled)
router.get('/', authenticate, async (req, res) => {
  const { search, category, level, status } = req.query;
  const isLearner = req.user.role === 'LEARNER';
  const isCreator = req.user.role === 'COURSE_CREATOR';

  let sql = `
    SELECT c.*, 
           u.first_name || ' ' || u.last_name AS creator_name,
           (SELECT COUNT(*) FROM course_modules WHERE course_id = c.id) AS module_count,
           (SELECT COUNT(*) FROM lessons l JOIN course_modules m ON l.module_id = m.id WHERE m.course_id = c.id) AS lesson_count,
           (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) AS active_enrollments_count
    FROM courses c
    JOIN users u ON c.creator_id = u.id
    WHERE 1=1
  `;
  const params = [];

  // Scoping: Learners only see published courses in their org
  if (isLearner) {
    sql += ` AND c.status = 'PUBLISHED' AND c.org_id = ?`;
    params.push(req.user.org_id);
  } else if (isCreator) {
    // Creator sees their own courses + org published courses
    sql += ` AND (c.creator_id = ? OR c.org_id = ?)`;
    params.push(req.user.id, req.user.org_id);
  } else if (req.user.role === 'ADMIN') {
    sql += ` AND c.org_id = ?`;
    params.push(req.user.org_id);
  }
  // SUPER_ADMIN sees across all organizations

  if (search) {
    sql += ` AND (c.title LIKE ? OR c.description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    sql += ` AND c.category = ?`;
    params.push(category);
  }
  if (level) {
    sql += ` AND c.level = ?`;
    params.push(level);
  }
  if (status && !isLearner) {
    sql += ` AND c.status = ?`;
    params.push(status);
  }

  sql += ` ORDER BY c.created_at DESC`;

  const courses = await query(sql, params);

  // If learner, attach their personal enrollment state
  if (isLearner) {
    const enrollments = await query(
      `SELECT course_id, status AS enrollment_status, progress_percent, due_date, certificate_id
       FROM enrollments WHERE user_id = ?`,
      [req.user.id]
    );
    const enrMap = {};
    for (const e of enrollments) {
      enrMap[e.course_id] = e;
    }

    for (const c of courses) {
      const enr = enrMap[c.id];
      c.is_enrolled = !!enr;
      c.enrollment_status = enr ? enr.enrollment_status : 'NOT_ENROLLED';
      c.progress_percent = enr ? enr.progress_percent : 0;
      c.due_date = enr ? enr.due_date : null;
      c.certificate_id = enr ? enr.certificate_id : null;
    }
  }

  res.json(courses);
});

// 2. Course Details (Full hierarchical tree: Course -> Modules -> Lessons + Quiz / SCORM / Assignment info)
router.get('/:id', authenticate, async (req, res) => {
  const course = await get(
    `SELECT c.*, 
            u.first_name || ' ' || u.last_name AS creator_name,
            u.avatar_url AS creator_avatar,
            o.name AS organization_name
     FROM courses c
     JOIN users u ON c.creator_id = u.id
     JOIN organizations o ON c.org_id = o.id
     WHERE c.id = ?`,
    [req.params.id]
  );

  if (!course) return res.status(404).json({ error: 'Course not found' });

  // Get modules
  const modules = await query(
    `SELECT * FROM course_modules WHERE course_id = ? ORDER BY order_index ASC`,
    [course.id]
  );

  for (const mod of modules) {
    const lessons = await query(
      `SELECT l.*, 
              lc.body_text, lc.video_url, lc.audio_url, lc.pdf_url, lc.scorm_package_id, lc.embed_url, lc.metadata_json,
              q.id AS quiz_id, q.passing_score AS quiz_passing_score,
              a.id AS assignment_id, a.max_points AS assignment_max_points
       FROM lessons l
       LEFT JOIN lesson_contents lc ON l.id = lc.lesson_id
       LEFT JOIN quizzes q ON l.id = q.lesson_id
       LEFT JOIN assignments a ON l.id = a.lesson_id
       WHERE l.module_id = ?
       ORDER BY l.order_index ASC`,
      [mod.id]
    );

    // Parse metadata_json if present
    for (const l of lessons) {
      if (l.metadata_json) {
        try {
          l.metadata_json = typeof l.metadata_json === 'string' ? JSON.parse(l.metadata_json) : l.metadata_json;
        } catch {}
      }
    }

    // If user is learner, attach lesson completion state
    if (req.user) {
      const lessonProgress = await query(
        `SELECT lesson_id, status FROM lesson_progress WHERE user_id = ? AND lesson_id IN (${lessons.map(() => '?').join(',') || "''"})`,
        [req.user.id, ...lessons.map(l => l.id)]
      );
      const progMap = {};
      for (const p of lessonProgress) {
        progMap[p.lesson_id] = p.status;
      }
      for (const l of lessons) {
        l.is_completed = progMap[l.id] === 'COMPLETED';
      }
    }

    mod.lessons = lessons;
  }

  course.modules = modules;

  // Attached SCORM package info if any
  const scormPkg = await get('SELECT * FROM scorm_packages WHERE course_id = ?', [course.id]);
  course.scorm_package = scormPkg || null;

  // Attached skills
  const skills = await query(
    `SELECT s.id, s.name, s.category, cs.points_awarded
     FROM skills s
     JOIN course_skills cs ON s.id = cs.skill_id
     WHERE cs.course_id = ?`,
    [course.id]
  );
  course.skills = skills;

  // Learner Enrollment Status
  const enrollment = await get(
    `SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?`,
    [req.user.id, course.id]
  );
  course.enrollment = enrollment || null;

  res.json(course);
});

// 3. Enroll Learner in Course
router.post('/:id/enroll', authenticate, async (req, res) => {
  const courseId = req.params.id;
  const userId = req.body.userId || req.user.id;
  const course = await get('SELECT * FROM courses WHERE id = ?', [courseId]);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const existing = await get('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, courseId]);
  if (existing) {
    return res.json({ message: 'Already enrolled', enrollment: existing });
  }

  const enrollmentId = 'enr-' + uuidv4().slice(0, 8);
  await run(
    `INSERT INTO enrollments (id, user_id, course_id, org_id, status, progress_percent, started_at, last_accessed_at, due_date)
     VALUES (?, ?, ?, ?, 'IN_PROGRESS', 0, datetime('now'), datetime('now'), datetime('now', '+30 days'))`,
    [enrollmentId, userId, courseId, course.org_id]
  );

  const created = await get('SELECT * FROM enrollments WHERE id = ?', [enrollmentId]);
  await logAudit(course.org_id, req.user.id, 'COURSE_ENROLLMENT', 'COURSE', courseId, { enrolledUserId: userId });

  res.json({ message: 'Enrolled successfully', enrollment: created });
});

// 4. Mark Lesson Complete & Advance Course Progress
router.post('/:id/lessons/:lessonId/complete', authenticate, async (req, res) => {
  const { id: courseId, lessonId } = req.params;
  const userId = req.user.id;

  let enrollment = await get('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, courseId]);
  if (!enrollment) {
    // Auto-enroll if accessing lesson
    const course = await get('SELECT org_id FROM courses WHERE id = ?', [courseId]);
    const enrollmentId = 'enr-' + uuidv4().slice(0, 8);
    await run(
      `INSERT INTO enrollments (id, user_id, course_id, org_id, status, progress_percent) VALUES (?, ?, ?, ?, 'IN_PROGRESS', 0)`,
      [enrollmentId, userId, courseId, course.org_id]
    );
    enrollment = await get('SELECT * FROM enrollments WHERE id = ?', [enrollmentId]);
  }

  // Update or insert lesson_progress
  const existingProg = await get('SELECT id FROM lesson_progress WHERE user_id = ? AND lesson_id = ?', [userId, lessonId]);
  if (existingProg) {
    await run(
      "UPDATE lesson_progress SET status = 'COMPLETED', completed_at = datetime('now') WHERE id = ?",
      [existingProg.id]
    );
  } else {
    await run(
      `INSERT INTO lesson_progress (id, user_id, lesson_id, enrollment_id, status, completed_at)
       VALUES (?, ?, ?, ?, 'COMPLETED', datetime('now'))`,
      ['lp-' + uuidv4().slice(0, 8), userId, lessonId, enrollment.id]
    );
  }

  // Calculate new course progress percentage
  const totalLessonsRes = await get(
    `SELECT COUNT(*) AS total FROM lessons l
     JOIN course_modules m ON l.module_id = m.id
     WHERE m.course_id = ?`,
    [courseId]
  );
  const totalLessons = totalLessonsRes?.total || 1;

  const completedLessonsRes = await get(
    `SELECT COUNT(DISTINCT lp.lesson_id) AS completed
     FROM lesson_progress lp
     JOIN lessons l ON lp.lesson_id = l.id
     JOIN course_modules m ON l.module_id = m.id
     WHERE m.course_id = ? AND lp.user_id = ? AND lp.status = 'COMPLETED'`,
    [courseId, userId]
  );
  const completedCount = completedLessonsRes?.completed || 1;
  const newProgress = Math.min(100, Math.round((completedCount / totalLessons) * 100));

  let isNowCompleted = newProgress >= 100;
  let certificateId = enrollment.certificate_id;

  // Award gamification points (+50 pts for lesson)
  await run('UPDATE gamification_profiles SET points = points + 50 WHERE user_id = ?', [userId]);

  if (isNowCompleted && !enrollment.completed_at) {
    // Issue Certificate!
    certificateId = 'cert-' + uuidv4().slice(0, 8);
    const certNumber = 'CERT-STRATA-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const verifyCode = 'STRATA-VERIFY-' + uuidv4().slice(0, 8).toUpperCase();

    const courseData = await get('SELECT title, org_id FROM courses WHERE id = ?', [courseId]);
    const orgData = await get('SELECT name FROM organizations WHERE id = ?', [courseData.org_id]);

    await run(
      `INSERT INTO certificates (id, certificate_number, user_id, course_id, org_id, issue_date, expiry_date, verification_code, metadata_json)
       VALUES (?, ?, ?, ?, ?, date('now'), date('now', '+2 years'), ?, ?)`,
      [
        certificateId,
        certNumber,
        userId,
        courseId,
        courseData.org_id,
        verifyCode,
        JSON.stringify({
          courseTitle: courseData.title,
          orgName: orgData?.name || 'Strata LXP Enterprise',
          recipientName: `${req.user.first_name} ${req.user.last_name}`,
          score: 100
        })
      ]
    );

    await run(
      "UPDATE enrollments SET status = 'COMPLETED', progress_percent = 100, completed_at = datetime('now'), certificate_id = ? WHERE id = ?",
      [certificateId, enrollment.id]
    );

    // Award bonus points for full course completion (+200 pts)
    await run('UPDATE gamification_profiles SET points = points + 200 WHERE user_id = ?', [userId]);

    // Send in-app notification
    await run(
      `INSERT INTO notifications (id, user_id, org_id, title, message, type, action_url)
       VALUES (?, ?, ?, 'Certificate Issued!', ?, 'SUCCESS', '/certificates')`,
      [
        'notif-' + uuidv4().slice(0, 8),
        userId,
        courseData.org_id,
        `Congratulations! You have completed "${courseData.title}". Certificate ${certNumber} is now available.`
      ]
    );
  } else {
    await run(
      "UPDATE enrollments SET progress_percent = ?, last_accessed_at = datetime('now') WHERE id = ?",
      [newProgress, enrollment.id]
    );
  }

  res.json({
    success: true,
    progressPercent: newProgress,
    isCompleted: isNowCompleted,
    certificateId
  });
});

// 5. Create Course (Course Creator / Admin)
router.post('/', authenticate, requirePermission('course.create'), async (req, res) => {
  const { title, description, category, level, durationMinutes, courseType, passingScore, thumbnailUrl } = req.body;
  const courseId = 'crs-' + uuidv4().slice(0, 8);
  const slug = (title || 'new-course').toLowerCase().replace(/[^a-z0-9]+/g, '-');

  await run(
    `INSERT INTO courses (id, org_id, creator_id, title, slug, description, category, level, course_type, duration_minutes, thumbnail_url, status, readiness_score, passing_score)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', 65, ?)`,
    [
      courseId,
      req.user.org_id,
      req.user.id,
      title,
      slug,
      description || '',
      category || 'Enterprise Training',
      level || 'INTERMEDIATE',
      courseType || 'STANDARD',
      durationMinutes || 60,
      thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      passingScore || 80
    ]
  );

  const created = await get('SELECT * FROM courses WHERE id = ?', [courseId]);
  await logAudit(req.user.org_id, req.user.id, 'COURSE_CREATED', 'COURSE', courseId, { title });

  res.status(201).json(created);
});

// 6. Update Course
router.put('/:id', authenticate, requirePermission('course.update'), async (req, res) => {
  const { title, description, category, level, durationMinutes, passingScore, status, thumbnailUrl } = req.body;
  const course = await get('SELECT * FROM courses WHERE id = ?', [req.params.id]);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  await run(
    `UPDATE courses SET 
       title = COALESCE(?, title),
       description = COALESCE(?, description),
       category = COALESCE(?, category),
       level = COALESCE(?, level),
       duration_minutes = COALESCE(?, duration_minutes),
       passing_score = COALESCE(?, passing_score),
       status = COALESCE(?, status),
       thumbnail_url = COALESCE(?, thumbnail_url),
       updated_at = datetime('now')
     WHERE id = ?`,
    [title, description, category, level, durationMinutes, passingScore, status, thumbnailUrl, req.params.id]
  );

  const updated = await get('SELECT * FROM courses WHERE id = ?', [req.params.id]);
  res.json(updated);
});

// 7. Publish Course
router.post('/:id/publish', authenticate, requirePermission('course.publish'), async (req, res) => {
  const course = await get('SELECT * FROM courses WHERE id = ?', [req.params.id]);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const nextStatus = course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
  await run('UPDATE courses SET status = ?, updated_at = datetime("now") WHERE id = ?', [nextStatus, course.id]);

  await logAudit(course.org_id, req.user.id, 'COURSE_STATUS_CHANGE', 'COURSE', course.id, { from: course.status, to: nextStatus });

  res.json({ message: `Course ${nextStatus.toLowerCase()}`, status: nextStatus });
});

// 8. Visual Builder: Add Module
router.post('/:id/modules', authenticate, requirePermission('course.update'), async (req, res) => {
  const { title, description, orderIndex } = req.body;
  const moduleId = 'mod-' + uuidv4().slice(0, 8);
  await run(
    `INSERT INTO course_modules (id, course_id, title, description, order_index) VALUES (?, ?, ?, ?, ?)`,
    [moduleId, req.params.id, title, description || '', orderIndex || 99]
  );
  const mod = await get('SELECT * FROM course_modules WHERE id = ?', [moduleId]);
  res.status(201).json(mod);
});

// 8b. Visual Builder: Update Module
router.put('/:id/modules/:moduleId', authenticate, requirePermission('course.update'), async (req, res) => {
  const { title, description, orderIndex } = req.body;
  await run(
    `UPDATE course_modules SET 
       title = COALESCE(?, title),
       description = COALESCE(?, description),
       order_index = COALESCE(?, order_index)
     WHERE id = ? AND course_id = ?`,
    [title, description, orderIndex, req.params.moduleId, req.params.id]
  );
  const mod = await get('SELECT * FROM course_modules WHERE id = ?', [req.params.moduleId]);
  res.json(mod);
});

// 8c. Visual Builder: Delete Module
router.delete('/:id/modules/:moduleId', authenticate, requirePermission('course.update'), async (req, res) => {
  // Delete all lesson contents and progress for lessons in this module
  const lessons = await query('SELECT id FROM lessons WHERE module_id = ?', [req.params.moduleId]);
  for (const l of lessons) {
    await run('DELETE FROM lesson_contents WHERE lesson_id = ?', [l.id]);
    await run('DELETE FROM lesson_progress WHERE lesson_id = ?', [l.id]);
  }
  await run('DELETE FROM lessons WHERE module_id = ?', [req.params.moduleId]);
  await run('DELETE FROM course_modules WHERE id = ? AND course_id = ?', [req.params.moduleId, req.params.id]);
  res.json({ success: true, deletedModuleId: req.params.moduleId });
});

// 9. Visual Builder: Add Lesson
router.post('/:id/modules/:moduleId/lessons', authenticate, requirePermission('course.update'), async (req, res) => {
  const { title, lessonType, durationMinutes, bodyText, videoUrl, blocks } = req.body;
  const lessonId = 'les-' + uuidv4().slice(0, 8);

  await run(
    `INSERT INTO lessons (id, module_id, title, lesson_type, duration_minutes, order_index, is_mandatory)
     VALUES (?, ?, ?, ?, ?, 99, 1)`,
    [lessonId, req.params.moduleId, title || 'New Lesson', lessonType || 'TEXT', durationMinutes || 15]
  );

  const metaString = blocks ? JSON.stringify({ blocks }) : '{}';
  await run(
    `INSERT INTO lesson_contents (id, lesson_id, body_text, video_url, metadata_json) VALUES (?, ?, ?, ?, ?)`,
    ['lc-' + uuidv4().slice(0, 8), lessonId, bodyText || '', videoUrl || null, metaString]
  );

  const les = await get('SELECT * FROM lessons WHERE id = ?', [lessonId]);
  if (les) {
    les.body_text = bodyText || '';
    les.video_url = videoUrl || null;
    les.metadata_json = blocks ? { blocks } : {};
  }
  res.status(201).json(les);
});

// 9b. Visual Builder: Update Lesson & Save Modular Content Blocks
router.put('/:id/modules/:moduleId/lessons/:lessonId', authenticate, requirePermission('course.update'), async (req, res) => {
  const { title, lessonType, durationMinutes, isMandatory, bodyText, videoUrl, audioUrl, pdfUrl, embedUrl, metadataJson, blocks } = req.body;
  const { lessonId } = req.params;

  await run(
    `UPDATE lessons SET
       title = COALESCE(?, title),
       lesson_type = COALESCE(?, lesson_type),
       duration_minutes = COALESCE(?, duration_minutes),
       is_mandatory = COALESCE(?, is_mandatory)
     WHERE id = ?`,
    [title, lessonType, durationMinutes, isMandatory, lessonId]
  );

  let metaString = null;
  if (metadataJson) {
    metaString = typeof metadataJson === 'string' ? metadataJson : JSON.stringify(metadataJson);
  } else if (blocks) {
    metaString = JSON.stringify({ blocks });
  }

  const existingContent = await get('SELECT id FROM lesson_contents WHERE lesson_id = ?', [lessonId]);
  if (existingContent) {
    await run(
      `UPDATE lesson_contents SET
         body_text = COALESCE(?, body_text),
         video_url = COALESCE(?, video_url),
         audio_url = COALESCE(?, audio_url),
         pdf_url = COALESCE(?, pdf_url),
         embed_url = COALESCE(?, embed_url),
         metadata_json = COALESCE(?, metadata_json),
         updated_at = datetime('now')
       WHERE lesson_id = ?`,
      [bodyText, videoUrl, audioUrl, pdfUrl, embedUrl, metaString, lessonId]
    );
  } else {
    await run(
      `INSERT INTO lesson_contents (id, lesson_id, body_text, video_url, audio_url, pdf_url, embed_url, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['lc-' + uuidv4().slice(0, 8), lessonId, bodyText || '', videoUrl || null, audioUrl || null, pdfUrl || null, embedUrl || null, metaString || '{}']
    );
  }

  const updatedLes = await get(
    `SELECT l.*, lc.body_text, lc.video_url, lc.audio_url, lc.pdf_url, lc.embed_url, lc.metadata_json
     FROM lessons l
     LEFT JOIN lesson_contents lc ON l.id = lc.lesson_id
     WHERE l.id = ?`,
    [lessonId]
  );
  if (updatedLes && updatedLes.metadata_json) {
    try {
      updatedLes.metadata_json = typeof updatedLes.metadata_json === 'string' ? JSON.parse(updatedLes.metadata_json) : updatedLes.metadata_json;
    } catch {}
  }
  res.json(updatedLes);
});

// 9c. Visual Builder: Delete Lesson
router.delete('/:id/modules/:moduleId/lessons/:lessonId', authenticate, requirePermission('course.update'), async (req, res) => {
  const { lessonId } = req.params;
  await run('DELETE FROM lesson_contents WHERE lesson_id = ?', [lessonId]);
  await run('DELETE FROM lesson_progress WHERE lesson_id = ?', [lessonId]);
  await run('DELETE FROM lessons WHERE id = ?', [lessonId]);
  res.json({ success: true, deletedLessonId: lessonId });
});

// 10. Visual Builder: Curriculum Reorder (Drag & Drop for Modules & Lessons)
router.put('/:id/curriculum/reorder', authenticate, requirePermission('course.update'), async (req, res) => {
  const { modules } = req.body; // Array of { id, orderIndex, lessons: [{ id, orderIndex, moduleId }] }
  if (!Array.isArray(modules)) {
    return res.status(400).json({ error: 'modules array is required' });
  }

  for (let mIdx = 0; mIdx < modules.length; mIdx++) {
    const mod = modules[mIdx];
    await run(
      'UPDATE course_modules SET order_index = ? WHERE id = ? AND course_id = ?',
      [mod.orderIndex ?? (mIdx + 1), mod.id, req.params.id]
    );

    if (Array.isArray(mod.lessons)) {
      for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
        const les = mod.lessons[lIdx];
        await run(
          'UPDATE lessons SET order_index = ?, module_id = ? WHERE id = ?',
          [les.orderIndex ?? (lIdx + 1), mod.id, les.id]
        );
      }
    }
  }

  res.json({ success: true, message: 'Curriculum reordered successfully' });
});

export default router;
