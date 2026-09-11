import express from 'express';
import { authenticate, requirePermission, logAudit } from '../middleware/authMiddleware.js';
import {
  generateBlueprint,
  createCourseFromBlueprint,
  executeCopilotCommand,
  auditCourseReadiness,
  generateSingleLessonContent,
  generateSingleLessonQuizQuestions,
  enhanceMarkdownContent
} from '../services/aiService.js';
import { query, get } from '../db/database.js';

const router = express.Router();

// 1. Generate Course Blueprint (with precision parameters)
router.post('/blueprint', authenticate, requirePermission('ai.course.create'), async (req, res) => {
  try {
    const { 
      topic, 
      audience, 
      difficulty, 
      estimatedHours, 
      targetModules, 
      pedagogicalStyle, 
      includeQuiz, 
      includeAssignment, 
      includeVideo, 
      tone, 
      learningObjectives 
    } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'Topic or subject prompt is required' });
    }

    const blueprint = await generateBlueprint({ 
      topic: topic.trim(), 
      audience, 
      difficulty, 
      estimatedHours, 
      targetModules, 
      pedagogicalStyle, 
      includeQuiz, 
      includeAssignment, 
      includeVideo, 
      tone, 
      learningObjectives 
    });

    res.json(blueprint);
  } catch (err) {
    console.error('Blueprint generation failed:', err);
    res.status(500).json({ error: 'Failed to generate blueprint: ' + err.message });
  }
});

// 2. Create Full Course from Blueprint (Draft mode - never auto-publishes)
router.post('/create-course', authenticate, requirePermission('ai.course.create'), async (req, res) => {
  try {
    const { blueprint } = req.body;
    if (!blueprint || !blueprint.title) {
      return res.status(400).json({ error: 'Valid blueprint is required' });
    }

    const result = await createCourseFromBlueprint(blueprint, req.user.org_id, req.user.id);
    await logAudit(req.user.org_id, req.user.id, 'AI_COURSE_GENERATED', 'COURSE', result.courseId, { title: result.title });

    res.status(201).json({
      message: 'Course authored by AI Studio saved as Draft for instructional review',
      courseId: result.courseId,
      title: result.title
    });
  } catch (err) {
    console.error('AI Course Creation failed:', err);
    res.status(500).json({ error: 'Failed to create course from blueprint' });
  }
});

// 3. In-Builder Single Lesson Content Generator
router.post('/generate-lesson-content', authenticate, requirePermission('ai.content.generate'), async (req, res) => {
  try {
    const { lessonTitle, moduleTitle, courseTopic, tone } = req.body;
    if (!lessonTitle) {
      return res.status(400).json({ error: 'Lesson title is required' });
    }

    const content = await generateSingleLessonContent({ 
      lessonTitle, 
      moduleTitle: moduleTitle || 'Core Curriculum', 
      courseTopic: courseTopic || lessonTitle, 
      tone: tone || 'PROFESSIONAL' 
    });

    res.json({ content });
  } catch (err) {
    console.error('Generate lesson content failed:', err);
    res.status(500).json({ error: 'Failed to generate lesson content' });
  }
});

// 4. In-Builder Quiz Questions Generator
router.post('/generate-quiz-questions', authenticate, requirePermission('ai.content.generate'), async (req, res) => {
  try {
    const { lessonTitle, moduleTitle, count } = req.body;
    if (!lessonTitle) {
      return res.status(400).json({ error: 'Lesson title is required' });
    }

    const questions = await generateSingleLessonQuizQuestions({ 
      lessonTitle, 
      moduleTitle: moduleTitle || 'Module', 
      count: count || 3 
    });

    res.json({ questions });
  } catch (err) {
    console.error('Generate quiz questions failed:', err);
    res.status(500).json({ error: 'Failed to generate quiz questions' });
  }
});

// 5. In-Builder Content Enhancer
router.post('/enhance-content', authenticate, requirePermission('ai.content.generate'), async (req, res) => {
  try {
    const { text, instruction } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    const enhanced = await enhanceMarkdownContent({ text, instruction });
    res.json({ enhanced });
  } catch (err) {
    console.error('Enhance content failed:', err);
    res.status(500).json({ error: 'Failed to enhance content' });
  }
});

// 6. AI Course Copilot Assistant
router.post('/copilot', authenticate, requirePermission('ai.content.generate'), async (req, res) => {
  try {
    const { courseId, commandText, lessonId } = req.body;
    if (!courseId || !commandText) {
      return res.status(400).json({ error: 'Course ID and command text are required' });
    }

    const result = await executeCopilotCommand(courseId, commandText, lessonId);
    await logAudit(req.user.org_id, req.user.id, 'AI_COPILOT_EXECUTED', 'COURSE', courseId, { commandText });

    res.json(result);
  } catch (err) {
    console.error('AI Copilot execution failed:', err);
    res.status(500).json({ error: err.message || 'AI Copilot execution failed' });
  }
});

// 7. Course Readiness Quality Audit
router.get('/audit/:courseId', authenticate, async (req, res) => {
  try {
    const auditReport = await auditCourseReadiness(req.params.courseId);
    res.json(auditReport);
  } catch (err) {
    console.error('Audit report failed:', err);
    res.status(500).json({ error: err.message || 'Audit report generation failed' });
  }
});

// 8. AI Generation History
router.get('/history', authenticate, async (req, res) => {
  try {
    const jobs = await query(
      `SELECT j.*, 
              c.title AS course_title,
              u.first_name || ' ' || u.last_name AS creator_name
       FROM ai_generation_jobs j
       LEFT JOIN courses c ON j.course_id = c.id
       JOIN users u ON j.user_id = u.id
       WHERE j.org_id = ?
       ORDER BY j.created_at DESC`,
      [req.user.org_id]
    );
    res.json(jobs);
  } catch (err) {
    console.error('Failed to get history:', err);
    res.status(500).json({ error: 'Failed to fetch AI jobs history' });
  }
});

export default router;
