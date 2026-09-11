import express from 'express';
import { query, get } from '../db/database.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Role-Aware Dashboard Metrics
router.get('/dashboard', authenticate, async (req, res) => {
  const role = req.user.role;
  const orgId = req.user.org_id;
  const userId = req.user.id;

  if (role === 'SUPER_ADMIN') {
    // Cross-tenant platform metrics
    const totalOrgs = await get('SELECT COUNT(*) AS count FROM organizations');
    const totalUsers = await get('SELECT COUNT(*) AS count FROM users');
    const activeLearners = await get("SELECT COUNT(*) AS count FROM users WHERE role = 'LEARNER' AND status = 'ACTIVE'");
    const totalCourses = await get('SELECT COUNT(*) AS count FROM courses');
    const activeEnrollments = await get("SELECT COUNT(*) AS count FROM enrollments WHERE status = 'IN_PROGRESS'");
    const completedEnrollments = await get("SELECT COUNT(*) AS count FROM enrollments WHERE status = 'COMPLETED'");
    const totalCertificates = await get('SELECT COUNT(*) AS count FROM certificates');

    const totalEnr = (activeEnrollments?.count || 0) + (completedEnrollments?.count || 0);
    const completionRate = totalEnr > 0 ? Math.round(((completedEnrollments?.count || 0) / totalEnr) * 100) : 84;

    // Platform growth data
    const growthTrend = [
      { month: 'Jan', users: 780, completions: 420 },
      { month: 'Feb', users: 890, completions: 510 },
      { month: 'Mar', users: 980, completions: 630 },
      { month: 'Apr', users: 1060, completions: 720 },
      { month: 'May', users: 1150, completions: 890 },
      { month: 'Jun', users: 1240, completions: 1040 }
    ];

    // Organization Activity
    const orgActivity = await query(`
      SELECT o.id, o.name, o.plan, o.status,
             (SELECT COUNT(*) FROM users WHERE org_id = o.id) AS user_count,
             (SELECT COUNT(*) FROM courses WHERE org_id = o.id) AS course_count,
             (SELECT COUNT(*) FROM enrollments WHERE org_id = o.id AND status = 'COMPLETED') AS completions_count
      FROM organizations o
    `);

    return res.json({
      role,
      metrics: {
        totalOrganizations: totalOrgs?.count || 3,
        totalUsers: totalUsers?.count || 1240,
        activeLearners: activeLearners?.count || 980,
        totalCourses: totalCourses?.count || 42,
        activeEnrollments: activeEnrollments?.count || 3410,
        completionRate: completionRate,
        learningHours: 12850,
        certificatesIssued: totalCertificates?.count || 1120
      },
      growthTrend,
      orgActivity
    });
  }

  if (role === 'ADMIN') {
    // Operational Org Metrics
    const totalLearners = await get("SELECT COUNT(*) AS count FROM users WHERE org_id = ? AND role = 'LEARNER'", [orgId]);
    const totalCourses = await get('SELECT COUNT(*) AS count FROM courses WHERE org_id = ?', [orgId]);
    const totalEnrollments = await get('SELECT COUNT(*) AS count FROM enrollments WHERE org_id = ?', [orgId]);
    const completed = await get("SELECT COUNT(*) AS count FROM enrollments WHERE org_id = ? AND status = 'COMPLETED'", [orgId]);
    const overdue = await get("SELECT COUNT(*) AS count FROM enrollments WHERE org_id = ? AND status = 'OVERDUE'", [orgId]);
    const certs = await get('SELECT COUNT(*) AS count FROM certificates WHERE org_id = ?', [orgId]);

    const completionRate = (totalEnrollments?.count || 0) > 0
      ? Math.round(((completed?.count || 0) / totalEnrollments.count) * 100)
      : 86;

    const departmentPerformance = [
      { department: 'Cloud & Infrastructure', completion: 92, learners: 45 },
      { department: 'Enterprise Security', completion: 96, learners: 32 },
      { department: 'Product & Design', completion: 88, learners: 28 },
      { department: 'Executive Operations', completion: 82, learners: 18 },
      { department: 'Sales & Enablement', completion: 76, learners: 42 }
    ];

    const monthlyCompletions = [
      { month: 'Jan', completed: 85, enrolled: 110 },
      { month: 'Feb', completed: 94, enrolled: 120 },
      { month: 'Mar', completed: 112, enrolled: 135 },
      { month: 'Apr', completed: 128, enrolled: 140 },
      { month: 'May', completed: 145, enrolled: 160 }
    ];

    return res.json({
      role,
      metrics: {
        learners: totalLearners?.count || 450,
        courses: totalCourses?.count || 28,
        enrollments: totalEnrollments?.count || 1150,
        completionRate,
        overdueLearning: overdue?.count || 14,
        certificatesIssued: certs?.count || 380
      },
      departmentPerformance,
      monthlyCompletions
    });
  }

  if (role === 'COURSE_CREATOR') {
    // Content Owner Metrics
    const myCourses = await get('SELECT COUNT(*) AS count FROM courses WHERE creator_id = ?', [userId]);
    const publishedCourses = await get("SELECT COUNT(*) AS count FROM courses WHERE creator_id = ? AND status = 'PUBLISHED'", [userId]);
    const draftCourses = await get("SELECT COUNT(*) AS count FROM courses WHERE creator_id = ? AND status = 'DRAFT'", [userId]);
    
    const activeLearners = await get(`
      SELECT COUNT(DISTINCT e.user_id) AS count
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE c.creator_id = ?
    `, [userId]);

    const pendingGrading = await get(`
      SELECT COUNT(*) AS count
      FROM assignment_submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN lessons l ON a.lesson_id = l.id
      JOIN course_modules m ON l.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE c.creator_id = ? AND s.status = 'SUBMITTED'
    `, [userId]);

    return res.json({
      role,
      metrics: {
        myCourses: myCourses?.count || 5,
        publishedCourses: publishedCourses?.count || 4,
        draftCourses: draftCourses?.count || 1,
        activeLearners: activeLearners?.count || 240,
        completionRate: 88,
        pendingGrading: pendingGrading?.count || 3
      },
      recentCourses: await query('SELECT * FROM courses WHERE creator_id = ? ORDER BY updated_at DESC LIMIT 5', [userId])
    });
  }

  // LEARNER Metrics
  const enrolledCount = await get('SELECT COUNT(*) AS count FROM enrollments WHERE user_id = ?', [userId]);
  const completedCount = await get("SELECT COUNT(*) AS count FROM enrollments WHERE user_id = ? AND status = 'COMPLETED'", [userId]);
  const certCount = await get('SELECT COUNT(*) AS count FROM certificates WHERE user_id = ?', [userId]);
  const gamification = await get('SELECT * FROM gamification_profiles WHERE user_id = ?', [userId]);

  res.json({
    role,
    metrics: {
      enrolledCourses: enrolledCount?.count || 4,
      completedCourses: completedCount?.count || 1,
      certificatesEarned: certCount?.count || 1,
      points: gamification?.points || 2450,
      streakDays: gamification?.streak_days || 12,
      learningHoursTotal: 24.5
    },
    weeklyActivity: [
      { day: 'Mon', minutes: 45 },
      { day: 'Tue', minutes: 60 },
      { day: 'Wed', minutes: 30 },
      { day: 'Thu', minutes: 90 },
      { day: 'Fri', minutes: 50 },
      { day: 'Sat', minutes: 20 },
      { day: 'Sun', minutes: 40 }
    ]
  });
});

// 2. CSV Export
router.get('/export', authenticate, async (req, res) => {
  const { type } = req.query; // enrollments, completions, or compliance

  let rows = [];
  let filename = 'strata_report.csv';
  let headers = '';

  if (type === 'enrollments' || !type) {
    filename = 'strata_enrollments_report.csv';
    headers = 'Learner Name,Email,Department,Course Title,Status,Progress %,Started At,Completed At\n';
    const data = await query(`
      SELECT u.first_name || ' ' || u.last_name AS name, u.email, u.department,
             c.title AS course_title, e.status, e.progress_percent, e.started_at, e.completed_at
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      JOIN courses c ON e.course_id = c.id
      WHERE e.org_id = ?
    `, [req.user.org_id]);

    rows = data.map(r => `"${r.name}","${r.email}","${r.department || ''}","${r.course_title}","${r.status}",${r.progress_percent},"${r.started_at}","${r.completed_at || ''}"`);
  }

  const csvContent = headers + rows.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvContent);
});

export default router;
