import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { query, get, run } from '../db/database.js';
import { authenticate, requirePermission, logAudit } from '../middleware/authMiddleware.js';
import {
  processScormZip,
  initializeAttempt,
  setCmiValue,
  commitAttempt,
  terminateAttempt
} from '../services/scormService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_TMP_DIR = path.join(__dirname, '..', 'uploads-tmp');

if (!fs.existsSync(UPLOAD_TMP_DIR)) {
  fs.mkdirSync(UPLOAD_TMP_DIR, { recursive: true });
}

const upload = multer({ dest: UPLOAD_TMP_DIR });
const router = express.Router();

// 1. List SCORM Packages
router.get('/packages', authenticate, async (req, res) => {
  const packages = await query(
    `SELECT sp.*, 
            c.title AS course_title,
            (SELECT COUNT(*) FROM scorm_attempts WHERE package_id = sp.id) AS total_attempts
     FROM scorm_packages sp
     LEFT JOIN courses c ON sp.course_id = c.id
     WHERE sp.org_id = ?
     ORDER BY sp.created_at DESC`,
    [req.user.org_id]
  );
  res.json(packages);
});

// 2. SCORM Package Detail
router.get('/packages/:id', authenticate, async (req, res) => {
  const pkg = await get('SELECT * FROM scorm_packages WHERE id = ?', [req.params.id]);
  if (!pkg) return res.status(404).json({ error: 'SCORM package not found' });
  res.json(pkg);
});

// 3. Upload SCORM ZIP
router.post('/upload', authenticate, requirePermission('scorm.upload'), upload.single('packageZip'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No SCORM zip file provided' });
    }

    const { courseId } = req.body;
    const result = await processScormZip(req.file.path, req.user.org_id, courseId || null);

    // Clean up temporary upload
    fs.unlinkSync(req.file.path);

    await logAudit(req.user.org_id, req.user.id, 'SCORM_PACKAGE_UPLOADED', 'SCORM_PACKAGE', result.packageId, {
      title: result.title,
      version: result.version
    });

    res.status(201).json({
      message: 'SCORM package validated, extracted, and registered successfully',
      package: result
    });
  } catch (err) {
    console.error('SCORM upload failed:', err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: err.message || 'SCORM package processing failed' });
  }
});

// 4. CMI Runtime: Initialize Attempt
router.post('/initialize', authenticate, async (req, res) => {
  try {
    const { packageId } = req.body;
    const userId = req.user.id;

    const data = await initializeAttempt(packageId, userId);
    res.json({
      success: true,
      result: 'true',
      ...data
    });
  } catch (err) {
    console.error('SCORM Initialize error:', err);
    res.status(500).json({ success: false, result: 'false', error: err.message });
  }
});

// 5. CMI Runtime: Get Value
router.get('/getvalue', authenticate, async (req, res) => {
  const { attemptId, element } = req.query;
  const row = await get(
    'SELECT element_value FROM scorm_runtime_data WHERE attempt_id = ? AND element_name = ?',
    [attemptId, element]
  );
  res.json({
    element,
    value: row ? row.element_value : ''
  });
});

// 6. CMI Runtime: Set Value
router.post('/setvalue', authenticate, async (req, res) => {
  try {
    const { attemptId, element, value } = req.body;
    await setCmiValue(attemptId, element, value);
    res.json({ success: true, result: 'true' });
  } catch (err) {
    console.error('SCORM SetValue error:', err);
    res.status(500).json({ success: false, result: 'false', error: err.message });
  }
});

// 7. CMI Runtime: Commit
router.post('/commit', authenticate, async (req, res) => {
  try {
    const { attemptId, cmiData } = req.body;
    await commitAttempt(attemptId, cmiData);
    res.json({ success: true, result: 'true' });
  } catch (err) {
    console.error('SCORM Commit error:', err);
    res.status(500).json({ success: false, result: 'false', error: err.message });
  }
});

// 8. CMI Runtime: Terminate
router.post('/terminate', authenticate, async (req, res) => {
  try {
    const { attemptId } = req.body;
    const attempt = await terminateAttempt(attemptId);
    res.json({ success: true, result: 'true', attempt });
  } catch (err) {
    console.error('SCORM Terminate error:', err);
    res.status(500).json({ success: false, result: 'false', error: err.message });
  }
});

// 9. List Learner Attempts for a Package
router.get('/attempts/:packageId', authenticate, async (req, res) => {
  const attempts = await query(
    `SELECT sa.*, 
            u.first_name || ' ' || u.last_name AS learner_name,
            u.email AS learner_email
     FROM scorm_attempts sa
     JOIN users u ON sa.user_id = u.id
     WHERE sa.package_id = ?
     ORDER BY sa.started_at DESC`,
    [req.params.packageId]
  );
  res.json(attempts);
});

export default router;
