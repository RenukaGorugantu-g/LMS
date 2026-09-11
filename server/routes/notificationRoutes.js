import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, get, run } from '../db/database.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Get Current User Notifications
router.get('/', authenticate, async (req, res) => {
  const notifs = await query(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`,
    [req.user.id]
  );
  res.json(notifs);
});

// 2. Mark Notification as Read
router.post('/:id/read', authenticate, async (req, res) => {
  await run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ success: true });
});

// 3. Mark All as Read
router.post('/read-all', authenticate, async (req, res) => {
  await run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
  res.json({ success: true });
});

// 4. Get Announcements
router.get('/announcements', authenticate, async (req, res) => {
  const announcements = await query(`
    SELECT a.*, 
           u.first_name || ' ' || u.last_name AS author_name,
           u.avatar_url AS author_avatar
    FROM announcements a
    JOIN users u ON a.author_id = u.id
    WHERE a.org_id = ?
    ORDER BY a.created_at DESC
  `, [req.user.org_id]);
  res.json(announcements);
});

// 5. Create Announcement (Admin)
router.post('/announcements', authenticate, async (req, res) => {
  const { title, content, priority } = req.body;
  const annId = 'ann-' + uuidv4().slice(0, 8);
  await run(
    `INSERT INTO announcements (id, org_id, title, content, author_id, priority) VALUES (?, ?, ?, ?, ?, ?)`,
    [annId, req.user.org_id, title, content, req.user.id, priority || 'NORMAL']
  );
  const created = await get('SELECT * FROM announcements WHERE id = ?', [annId]);
  res.status(201).json(created);
});

export default router;
