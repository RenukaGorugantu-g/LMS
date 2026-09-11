import express from 'express';
import { query, get, run } from '../db/database.js';
import { authenticate, requirePermission, logAudit } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. List Organizations (Super Admin or Current Org)
router.get('/', authenticate, async (req, res) => {
  if (req.user.role === 'SUPER_ADMIN') {
    const orgs = await query(`
      SELECT o.*,
             (SELECT COUNT(*) FROM users WHERE org_id = o.id) AS user_count,
             (SELECT COUNT(*) FROM courses WHERE org_id = o.id) AS course_count
      FROM organizations o
      ORDER BY o.created_at DESC
    `);
    return res.json(orgs);
  }

  const org = await get('SELECT * FROM organizations WHERE id = ?', [req.user.org_id]);
  res.json([org]);
});

// 2. Get Organization Details
router.get('/:id', authenticate, async (req, res) => {
  const org = await get('SELECT * FROM organizations WHERE id = ?', [req.params.id]);
  if (!org) return res.status(404).json({ error: 'Organization not found' });
  try {
    org.settings = JSON.parse(org.settings_json || '{}');
  } catch {
    org.settings = {};
  }
  res.json(org);
});

// 3. Update Organization Branding & Settings
router.put('/:id', authenticate, requirePermission('settings.manage'), async (req, res) => {
  const { name, brandColor, logoUrl, domain, settings } = req.body;
  const org = await get('SELECT * FROM organizations WHERE id = ?', [req.params.id]);
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  await run(
    `UPDATE organizations SET 
       name = COALESCE(?, name),
       brand_color = COALESCE(?, brand_color),
       logo_url = COALESCE(?, logo_url),
       domain = COALESCE(?, domain),
       settings_json = COALESCE(?, settings_json),
       updated_at = datetime('now')
     WHERE id = ?`,
    [name, brandColor, logoUrl, domain, settings ? JSON.stringify(settings) : null, req.params.id]
  );

  await logAudit(req.params.id, req.user.id, 'ORGANIZATION_SETTINGS_UPDATED', 'ORGANIZATION', req.params.id, { name, brandColor });

  const updated = await get('SELECT * FROM organizations WHERE id = ?', [req.params.id]);
  res.json(updated);
});

export default router;
