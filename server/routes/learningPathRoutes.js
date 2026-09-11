import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, get, run } from '../db/database.js';
import { authenticate, requirePermission, logAudit } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. List Learning Paths
router.get('/', authenticate, async (req, res) => {
  const paths = await query(
    `SELECT lp.*,
            (SELECT COUNT(*) FROM learning_path_courses WHERE path_id = lp.id) AS course_count
     FROM learning_paths lp
     WHERE lp.org_id = ?
     ORDER BY lp.created_at DESC`,
    [req.user.org_id]
  );

  // If learner, attach their calculated path completion % based on the component courses
  if (req.user.role === 'LEARNER') {
    for (const path of paths) {
      const pathCourses = await query(
        `SELECT lpc.course_id, COALESCE(e.progress_percent, 0) AS progress
         FROM learning_path_courses lpc
         LEFT JOIN enrollments e ON lpc.course_id = e.course_id AND e.user_id = ?
         WHERE lpc.path_id = ?`,
        [req.user.id, path.id]
      );
      if (pathCourses.length > 0) {
        const avg = Math.round(pathCourses.reduce((acc, c) => acc + c.progress, 0) / pathCourses.length);
        path.learner_progress_percent = avg;
      } else {
        path.learner_progress_percent = 0;
      }
    }
  }

  res.json(paths);
});

// 2. Learning Path Details with Courses
router.get('/:id', authenticate, async (req, res) => {
  const path = await get('SELECT * FROM learning_paths WHERE id = ?', [req.params.id]);
  if (!path) return res.status(404).json({ error: 'Learning path not found' });

  const courses = await query(
    `SELECT c.id, c.title, c.slug, c.description, c.category, c.level, c.duration_minutes, c.thumbnail_url,
            lpc.order_index, lpc.is_required,
            COALESCE(e.progress_percent, 0) AS progress_percent,
            COALESCE(e.status, 'NOT_STARTED') AS enrollment_status
     FROM learning_path_courses lpc
     JOIN courses c ON lpc.course_id = c.id
     LEFT JOIN enrollments e ON c.id = e.course_id AND e.user_id = ?
     WHERE lpc.path_id = ?
     ORDER BY lpc.order_index ASC`,
    [req.user.id, path.id]
  );

  path.courses = courses;
  if (courses.length > 0) {
    path.progress_percent = Math.round(courses.reduce((acc, c) => acc + c.progress_percent, 0) / courses.length);
  } else {
    path.progress_percent = 0;
  }

  res.json(path);
});

// 3. Create Learning Path
router.post('/', authenticate, requirePermission('course.create'), async (req, res) => {
  const { title, description, targetRole, durationHours, courseIds, isSequential } = req.body;
  const pathId = 'lp-' + uuidv4().slice(0, 8);
  const slug = (title || 'path').toLowerCase().replace(/[^a-z0-9]+/g, '-');

  await run(
    `INSERT INTO learning_paths (id, org_id, title, slug, description, target_role, duration_hours, thumbnail_url, is_sequential)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      pathId,
      req.user.org_id,
      title,
      slug,
      description || '',
      targetRole || 'Enterprise Professional',
      durationHours || 10,
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
      isSequential ? 1 : 0
    ]
  );

  if (Array.isArray(courseIds)) {
    let order = 1;
    for (const cId of courseIds) {
      await run(
        `INSERT INTO learning_path_courses (path_id, course_id, order_index, is_required) VALUES (?, ?, ?, 1)`,
        [pathId, cId, order++]
      );
    }
  }

  const created = await get('SELECT * FROM learning_paths WHERE id = ?', [pathId]);
  await logAudit(req.user.org_id, req.user.id, 'LEARNING_PATH_CREATED', 'LEARNING_PATH', pathId, { title });

  res.status(201).json(created);
});

export default router;
