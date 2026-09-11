import express from 'express';
import { query, get } from '../db/database.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. List Certificates for Current User or Org
router.get('/', authenticate, async (req, res) => {
  const isLearner = req.user.role === 'LEARNER';
  let sql = `
    SELECT cert.*, 
           c.title AS course_title, c.category AS course_category,
           u.first_name || ' ' || u.last_name AS learner_name,
           u.email AS learner_email,
           o.name AS organization_name,
           o.logo_url AS organization_logo
    FROM certificates cert
    JOIN courses c ON cert.course_id = c.id
    JOIN users u ON cert.user_id = u.id
    JOIN organizations o ON cert.org_id = o.id
    WHERE 1=1
  `;
  const params = [];

  if (isLearner) {
    sql += ' AND cert.user_id = ?';
    params.push(req.user.id);
  } else {
    sql += ' AND cert.org_id = ?';
    params.push(req.user.org_id);
  }

  sql += ' ORDER BY cert.issue_date DESC';

  const certificates = await query(sql, params);
  res.json(certificates);
});

// 2. Certificate Details
router.get('/:id', authenticate, async (req, res) => {
  const cert = await get(
    `SELECT cert.*, 
            c.title AS course_title, c.category AS course_category, c.duration_minutes,
            u.first_name || ' ' || u.last_name AS learner_name,
            u.email AS learner_email,
            u.title AS learner_title,
            o.name AS organization_name,
            o.logo_url AS organization_logo,
            o.brand_color
     FROM certificates cert
     JOIN courses c ON cert.course_id = c.id
     JOIN users u ON cert.user_id = u.id
     JOIN organizations o ON cert.org_id = o.id
     WHERE cert.id = ?`,
    [req.params.id]
  );

  if (!cert) return res.status(404).json({ error: 'Certificate not found' });
  try {
    cert.metadata = JSON.parse(cert.metadata_json || '{}');
  } catch {
    cert.metadata = {};
  }

  res.json(cert);
});

// 3. Public Verification Endpoint (No authentication required!)
router.get('/verify/:code', async (req, res) => {
  const code = req.params.code;
  const cert = await get(
    `SELECT cert.id, cert.certificate_number, cert.issue_date, cert.expiry_date, cert.verification_code, cert.metadata_json,
            c.title AS course_title, c.category,
            u.first_name || ' ' || u.last_name AS learner_name,
            o.name AS organization_name
     FROM certificates cert
     JOIN courses c ON cert.course_id = c.id
     JOIN users u ON cert.user_id = u.id
     JOIN organizations o ON cert.org_id = o.id
     WHERE cert.verification_code = ? OR cert.certificate_number = ?`,
    [code, code]
  );

  if (!cert) {
    return res.status(404).json({
      valid: false,
      message: 'Certificate record not found in Strata global registry. Verification failed.'
    });
  }

  let meta = {};
  try {
    meta = JSON.parse(cert.metadata_json || '{}');
  } catch {}

  res.json({
    valid: true,
    verifiedAt: new Date().toISOString(),
    certificateNumber: cert.certificate_number,
    verificationCode: cert.verification_code,
    learnerName: cert.learner_name,
    courseTitle: cert.course_title,
    organizationName: cert.organization_name,
    issueDate: cert.issue_date,
    expiryDate: cert.expiry_date,
    grade: meta.grade || 'A+',
    issuer: 'Strata Learning Experience Platform Credential Authority'
  });
});

export default router;
