import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { get, query, run } from '../db/database.js';
import { authenticate, logAudit } from '../middleware/authMiddleware.js';
import { syncUserToSupabaseAuth, sendSupabasePasswordRecovery } from '../db/supabase.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'strata-enterprise-secret-key-2026';

// 1. List demo accounts for 1-click evaluation
router.get('/demo-accounts', async (req, res) => {
  const users = await query(`
    SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.title, u.avatar_url, u.org_id,
           o.name AS org_name
    FROM users u
    JOIN organizations o ON u.org_id = o.id
    WHERE u.id IN ('usr-superadmin', 'usr-admin', 'usr-creator', 'usr-learner')
    ORDER BY CASE u.role 
      WHEN 'SUPER_ADMIN' THEN 1
      WHEN 'ADMIN' THEN 2
      WHEN 'COURSE_CREATOR' THEN 3
      WHEN 'LEARNER' THEN 4
    END
  `);
  res.json(users);
});

// 2. 1-Click Role Switcher for seamless evaluation
router.post('/switch-role', async (req, res) => {
  const role = req.body.role || req.body.targetRole;
  const user = await get(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.avatar_url, u.role, u.title, u.department, u.org_id,
            o.name AS org_name, o.brand_color
     FROM users u
     JOIN organizations o ON u.org_id = o.id
     WHERE u.role = ?
     LIMIT 1`,
    [role]
  );

  if (!user) {
    return res.status(404).json({ error: `No demo user found for role ${role}` });
  }

  const token = jwt.sign({ id: user.id, role: user.role, org_id: user.org_id }, JWT_SECRET, { expiresIn: '7d' });

  // Load permissions
  const permRows = await query(
    `SELECT p.code FROM permissions p
     JOIN role_permissions rp ON p.id = rp.permission_id
     WHERE rp.role = ?`,
    [user.role]
  );
  user.permissions = permRows.map(r => r.code);
  user.name = `${user.first_name} ${user.last_name}`;

  await logAudit(user.org_id, user.id, 'USER_ROLE_SWITCH', 'USER', user.id, { switchedToRole: role });

  res.json({ token, user });
});

// 3. Real User Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, fullName, role, orgName, title, department } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await get('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please sign in.' });
    }

    // Parse name
    let fName = firstName?.trim();
    let lName = lastName?.trim();
    if (!fName && fullName) {
      const parts = fullName.trim().split(' ');
      fName = parts[0];
      lName = parts.slice(1).join(' ') || 'User';
    }
    if (!fName) fName = cleanEmail.split('@')[0];
    if (!lName) lName = 'Member';

    const validRole = ['SUPER_ADMIN', 'ADMIN', 'COURSE_CREATOR', 'LEARNER'].includes(role) ? role : 'COURSE_CREATOR';
    const passwordHash = bcrypt.hashSync(password, 10);
    const userId = 'usr-' + uuidv4().slice(0, 8);

    // Organization handling
    let orgId = 'org-acme';
    if (orgName && orgName.trim() && orgName.trim() !== 'Acme Global Technologies') {
      const orgSlug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const existingOrg = await get('SELECT id FROM organizations WHERE slug = ?', [orgSlug]);
      if (existingOrg) {
        orgId = existingOrg.id;
      } else {
        orgId = 'org-' + uuidv4().slice(0, 8);
        await run(
          `INSERT INTO organizations (id, name, slug, brand_color, plan, status) VALUES (?, ?, ?, '#dc2626', 'ENTERPRISE', 'ACTIVE')`,
          [orgId, orgName.trim(), orgSlug]
        );
      }
    }

    // Insert real user into database
    await run(
      `INSERT INTO users (id, org_id, email, password_hash, first_name, last_name, avatar_url, role, title, department, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [
        userId,
        orgId,
        cleanEmail,
        passwordHash,
        fName,
        lName,
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        validRole,
        title || (validRole === 'COURSE_CREATOR' ? 'Lead Curriculum Designer' : validRole === 'ADMIN' ? 'Enterprise Administrator' : 'Software Engineer'),
        department || 'Engineering & Product'
      ]
    );

    // Initialize gamification profile
    await run(
      `INSERT OR REPLACE INTO gamification_profiles (user_id, points, streak_days, rank_title, last_streak_date)
       VALUES (?, 100, 1, 'Apprentice', date('now'))`,
      [userId]
    );

    // Mirror user in Supabase Auth cloud asynchronously
    syncUserToSupabaseAuth(cleanEmail, password, {
      first_name: fName,
      last_name: lName,
      role: validRole,
      org_id: orgId
    }).catch(err => console.warn('Supabase sync background note:', err));

    const org = await get('SELECT name, brand_color FROM organizations WHERE id = ?', [orgId]);
    const token = jwt.sign({ id: userId, role: validRole, org_id: orgId }, JWT_SECRET, { expiresIn: '7d' });

    // Load permissions
    const permRows = await query(
      `SELECT p.code FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role = ?`,
      [validRole]
    );

    const user = {
      id: userId,
      email: cleanEmail,
      first_name: fName,
      last_name: lName,
      name: `${fName} ${lName}`,
      role: validRole,
      org_id: orgId,
      org_name: org?.name || 'MapleLMS Enterprise',
      brand_color: org?.brand_color || '#dc2626',
      title: title || (validRole === 'COURSE_CREATOR' ? 'Lead Curriculum Designer' : 'Learner'),
      department: department || 'Engineering & Product',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      permissions: permRows.map(r => r.code)
    };

    await logAudit(orgId, userId, 'USER_REGISTERED', 'USER', userId, { email: cleanEmail, role: validRole });

    res.status(201).json({ token, user, message: 'Account registered successfully.' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// 4. Real Password Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await get(
      `SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, u.avatar_url, u.role, u.title, u.department, u.status, u.org_id,
              o.name AS org_name, o.brand_color
       FROM users u
       JOIN organizations o ON u.org_id = o.id
       WHERE LOWER(u.email) = ?`,
      [cleanEmail]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, org_id: user.org_id }, JWT_SECRET, { expiresIn: '7d' });

    const permRows = await query(
      `SELECT p.code FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role = ?`,
      [user.role]
    );
    user.permissions = permRows.map(r => r.code);
    user.name = `${user.first_name} ${user.last_name}`;
    delete user.password_hash;

    await logAudit(user.org_id, user.id, 'USER_LOGIN', 'USER', user.id, { email: cleanEmail });

    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// 5. Forgot Password Request
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await get('SELECT id, email, first_name FROM users WHERE LOWER(email) = ?', [cleanEmail]);

    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email address, a password reset link has been issued.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenId = 'tok-' + uuidv4().slice(0, 8);
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    // Invalidate prior active tokens
    await run("UPDATE password_reset_tokens SET used_at = datetime('now') WHERE user_id = ? AND used_at IS NULL", [user.id]);

    // Insert new token valid for 1 hour
    await run(
      `INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
       VALUES (?, ?, ?, ?)`,
      [tokenId, user.id, resetToken, expiresAt]
    );

    // Also notify Supabase Auth recovery in background
    sendSupabasePasswordRecovery(cleanEmail).catch(e => console.warn('Supabase recover note:', e));

    const resetLink = `/reset-password?token=${resetToken}`;

    res.json({
      success: true,
      message: 'Password reset instructions generated successfully.',
      resetToken,
      resetLink
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Could not process password reset' });
  }
});

// 6. Reset Password Execution
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const tokenRecord = await get(
      `SELECT id, user_id, expires_at, used_at FROM password_reset_tokens
       WHERE token = ?`,
      [token]
    );

    if (!tokenRecord) {
      return res.status(400).json({ error: 'Invalid or unrecognized reset token' });
    }

    if (tokenRecord.used_at) {
      return res.status(400).json({ error: 'This reset token has already been used. Please request a new one.' });
    }

    const isExpired = new Date(tokenRecord.expires_at).getTime() < Date.now();
    if (isExpired) {
      return res.status(400).json({ error: 'This reset token has expired. Please request a new one.' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    await run("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?", [newHash, tokenRecord.user_id]);
    await run("UPDATE password_reset_tokens SET used_at = datetime('now') WHERE id = ?", [tokenRecord.id]);

    const updatedUser = await get('SELECT id, email, org_id FROM users WHERE id = ?', [tokenRecord.user_id]);
    if (updatedUser) {
      await logAudit(updatedUser.org_id, updatedUser.id, 'PASSWORD_RESET', 'USER', updatedUser.id, { email: updatedUser.email });
    }

    res.json({
      success: true,
      message: 'Your password has been successfully reset. You can now sign in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// 7. Current Authenticated Session
router.get('/me', authenticate, async (req, res) => {
  // Get gamification profile
  const gamification = await get('SELECT * FROM gamification_profiles WHERE user_id = ?', [req.user.id]);
  const unreadNotifs = await get('SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0', [req.user.id]);

  res.json({
    user: req.user,
    gamification: gamification || { points: 0, streak_days: 0, rank_title: 'Practitioner' },
    unreadNotificationsCount: unreadNotifs?.count || 0
  });
});

export default router;
