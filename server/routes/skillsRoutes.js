import express from 'express';
import { query, get, run } from '../db/database.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. List All Skills in Library
router.get('/', authenticate, async (req, res) => {
  const skills = await query(
    `SELECT s.*,
            (SELECT COUNT(*) FROM course_skills WHERE skill_id = s.id) AS course_count
     FROM skills s
     ORDER BY s.category, s.name`
  );
  res.json(skills);
});

// 2. Learner Personal Skills & Gap Analysis
router.get('/my-skills', authenticate, async (req, res) => {
  const userId = req.user.id;

  const userSkills = await query(
    `SELECT s.id, s.name, s.category, s.description,
            us.current_level, us.target_level,
            (us.target_level - us.current_level) AS gap
     FROM user_skills us
     JOIN skills s ON us.skill_id = s.id
     WHERE us.user_id = ?
     ORDER BY gap DESC, us.current_level DESC`,
    [userId]
  );

  // Find recommended courses that bridge the highest skill gaps
  const gapSkillIds = userSkills.filter(s => s.gap > 0).map(s => s.id);
  let recommendedCourses = [];

  if (gapSkillIds.length > 0) {
    const placeholders = gapSkillIds.map(() => '?').join(',');
    recommendedCourses = await query(
      `SELECT DISTINCT c.id, c.title, c.category, c.level, c.thumbnail_url, c.duration_minutes,
              s.name AS target_skill_name
       FROM courses c
       JOIN course_skills cs ON c.id = cs.course_id
       JOIN skills s ON cs.skill_id = s.id
       WHERE cs.skill_id IN (${placeholders}) AND c.status = 'PUBLISHED'
       LIMIT 4`,
      gapSkillIds
    );
  }

  res.json({
    skills: userSkills,
    summary: {
      totalTracked: userSkills.length,
      proficientSkillsCount: userSkills.filter(s => s.current_level >= 4).length,
      skillsWithGapCount: userSkills.filter(s => s.gap > 0).length,
      averageLevel: userSkills.length > 0 ? (userSkills.reduce((acc, s) => acc + s.current_level, 0) / userSkills.length).toFixed(1) : 0
    },
    recommendedCourses
  });
});

// 3. Team Skills Matrix (For Course Creator with manager role or Admin)
router.get('/team-skills', authenticate, async (req, res) => {
  const team = await get('SELECT id, name FROM teams WHERE manager_id = ? LIMIT 1', [req.user.id]);
  const teamId = team ? team.id : 'team-cloud-sec'; // fallback to seeded demo team

  const teamMembers = await query(
    `SELECT u.id, u.first_name || ' ' || u.last_name AS name, u.title, u.avatar_url
     FROM team_members tm
     JOIN users u ON tm.user_id = u.id
     WHERE tm.team_id = ?`,
    [teamId]
  );

  const teamSkillsData = [];
  for (const member of teamMembers) {
    const skills = await query(
      `SELECT s.id, s.name, us.current_level, us.target_level
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       WHERE us.user_id = ?`,
      [member.id]
    );
    teamSkillsData.push({
      member,
      skills
    });
  }

  // Aggregate team gaps
  const gapSummary = await query(`
    SELECT s.name, 
           AVG(us.current_level) AS avg_current,
           AVG(us.target_level) AS avg_target,
           COUNT(*) AS member_count
    FROM user_skills us
    JOIN skills s ON us.skill_id = s.id
    JOIN team_members tm ON us.user_id = tm.user_id
    WHERE tm.team_id = ?
    GROUP BY s.id
    ORDER BY (AVG(us.target_level) - AVG(us.current_level)) DESC
    LIMIT 6
  `, [teamId]);

  res.json({
    teamId,
    teamName: team?.name || 'Cloud Infrastructure & Security',
    teamMembers: teamSkillsData,
    gapSummary
  });
});

// 4. Update Learner Skill Level
router.post('/update', authenticate, async (req, res) => {
  const { skillId, currentLevel, targetLevel } = req.body;
  const userId = req.user.id;

  const existing = await get('SELECT * FROM user_skills WHERE user_id = ? AND skill_id = ?', [userId, skillId]);
  if (existing) {
    await run(
      `UPDATE user_skills SET 
         current_level = COALESCE(?, current_level), 
         target_level = COALESCE(?, target_level), 
         updated_at = datetime('now')
       WHERE user_id = ? AND skill_id = ?`,
      [currentLevel, targetLevel, userId, skillId]
    );
  } else {
    await run(
      `INSERT INTO user_skills (user_id, skill_id, current_level, target_level) VALUES (?, ?, ?, ?)`,
      [userId, skillId, currentLevel || 1, targetLevel || 3]
    );
  }

  res.json({ message: 'Skill level updated successfully' });
});

export default router;
