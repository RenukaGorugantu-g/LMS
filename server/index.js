import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getDatabase } from './db/database.js';

// Import Route Handlers
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import learningPathRoutes from './routes/learningPathRoutes.js';
import scormRoutes from './routes/scormRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import skillsRoutes from './routes/skillsRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cohortRoutes from './routes/cohortRoutes.js';
import orgRoutes from './routes/orgRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static Assets: SCORM runtime storage & uploads
const SCORM_STORAGE_PATH = path.join(__dirname, 'scorm-storage');
if (!fs.existsSync(SCORM_STORAGE_PATH)) {
  fs.mkdirSync(SCORM_STORAGE_PATH, { recursive: true });
}
app.use('/scorm-content', express.static(SCORM_STORAGE_PATH));

const UPLOADS_PATH = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_PATH)) {
  fs.mkdirSync(UPLOADS_PATH, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_PATH));

// API Routers
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/scorm', scormRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cohorts', cohortRoutes);
app.use('/api/organizations', orgRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/audit', auditRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    platform: 'MapleLMS Enterprise Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend in production
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/scorm-content')) {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    next();
  });
}

// Start Server
async function startServer() {
  try {
    await getDatabase();
    console.log('✓ SQLite database connected');

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Strata LXP Server running on http://localhost:${PORT}`);
      console.log(`📦 SCORM Content Host: http://localhost:${PORT}/scorm-content/`);
      console.log(`⚡ API Endpoints active under /api/*`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
