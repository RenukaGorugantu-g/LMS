import express from 'express';
import { query } from '../db/database.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get Audit Logs (Super Admin or Admin)
router.get('/', authenticate, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req, res) => {
  let sql = `
    SELECT al.*, 
           u.first_name || ' ' || u.last_name AS actor_name,
           u.email AS actor_email,
           o.name AS organization_name
    FROM audit_logs al
    JOIN users u ON al.user_id = u.id
    JOIN organizations o ON al.org_id = o.id
    WHERE 1=1
  `;
  const params = [];

  if (req.user.role !== 'SUPER_ADMIN') {
    sql += ' AND al.org_id = ?';
    params.push(req.user.org_id);
  }

  sql += ' ORDER BY al.created_at DESC LIMIT 100';

  const logs = await query(sql, params);
  res.json(logs);
});

export default router;
