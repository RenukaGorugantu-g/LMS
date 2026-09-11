import jwt from 'jsonwebtoken';
import { get, query, run } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'strata-enterprise-secret-key-2026';

export async function authenticate(req, res, next) {
  try {
    let userId = req.headers['x-user-id'];
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch {
        // Continue to check x-user-id fallback
      }
    }

    // Role switcher shortcut header for instant evaluation
    const roleHeader = req.headers['x-role'];
    if (!userId && roleHeader) {
      const userWithRole = await get('SELECT id FROM users WHERE role = ? LIMIT 1', [roleHeader]);
      if (userWithRole) userId = userWithRole.id;
    }

    // Default to Elena Rostova (LEARNER) if no credentials provided to provide seamless demo out-of-the-box
    if (!userId) {
      userId = 'usr-learner';
    }

    const user = await get(
      `SELECT u.id, u.org_id, u.email, u.first_name, u.last_name, u.avatar_url, u.role, u.title, u.department, u.status,
              o.name AS org_name, o.brand_color, o.slug AS org_slug
       FROM users u
       JOIN organizations o ON u.org_id = o.id
       WHERE u.id = ?`,
      [userId]
    );

    if (!user) {
      return res.status(401).json({ error: 'User session not found' });
    }

    // Load granular permissions
    const permRows = await query(
      `SELECT p.code FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role = ?`,
      [user.role]
    );
    user.permissions = permRows.map(r => r.code);

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Internal authentication error' });
  }
}

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Requires one of: ${allowedRoles.join(', ')}` });
    }
    next();
  };
}

export function requirePermission(permissionCode) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
    if (req.user.role === 'SUPER_ADMIN') return next(); // Super admin bypass
    if (!req.user.permissions.includes(permissionCode)) {
      return res.status(403).json({ error: `Permission denied: ${permissionCode}` });
    }
    next();
  };
}

export async function logAudit(orgId, userId, action, entityType, entityId, details = {}) {
  try {
    await run(
      `INSERT INTO audit_logs (id, org_id, user_id, action, entity_type, entity_id, details_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['log-' + uuidv4().slice(0, 8), orgId, userId, action, entityType, entityId, JSON.stringify(details)]
    );
  } catch (e) {
    console.error('Audit log failed:', e);
  }
}
