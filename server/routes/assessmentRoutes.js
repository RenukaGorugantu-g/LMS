import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, get, run } from '../db/database.js';
import { authenticate, requirePermission, logAudit } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Get Quiz with Questions and Options
router.get('/quiz/:id', authenticate, async (req, res) => {
  const quiz = await get('SELECT * FROM quizzes WHERE id = ?', [req.params.id]);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  const questions = await query(
    'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC',
    [quiz.id]
  );

  for (const q of questions) {
    const options = await query(
      'SELECT id, option_text, order_index FROM quiz_options WHERE question_id = ? ORDER BY order_index ASC',
      [q.id]
    );
    q.options = options;
  }

  quiz.questions = questions;

  // Previous attempt by user if any
  const lastAttempt = await get(
    'SELECT * FROM quiz_attempts WHERE quiz_id = ? AND user_id = ? ORDER BY completed_at DESC LIMIT 1',
    [quiz.id, req.user.id]
  );
  quiz.last_attempt = lastAttempt || null;

  res.json(quiz);
});

// 2. Submit Quiz Attempt & Auto-Grade
router.post('/quiz/:id/submit', authenticate, async (req, res) => {
  const quizId = req.params.id;
  const { answers, timeTakenSeconds } = req.body; // answers: { questionId: selectedOptionIdOrValue }
  const userId = req.user.id;

  const quiz = await get('SELECT * FROM quizzes WHERE id = ?', [quizId]);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  const questions = await query('SELECT * FROM quiz_questions WHERE quiz_id = ?', [quizId]);
  let earnedScore = 0;
  let maxScore = 0;
  const questionResults = [];

  for (const q of questions) {
    maxScore += q.points || 10;
    const correctOptions = await query(
      'SELECT id, option_text FROM quiz_options WHERE question_id = ? AND is_correct = 1',
      [q.id]
    );

    const userAnswer = answers ? answers[q.id] : null;
    let isCorrect = false;

    if (q.question_type === 'SINGLE_CHOICE' || q.question_type === 'TRUE_FALSE' || q.question_type === 'SCENARIO') {
      const correctId = correctOptions[0]?.id;
      if (userAnswer && String(userAnswer) === String(correctId)) {
        isCorrect = true;
      }
    } else if (q.question_type === 'MULTIPLE_CHOICE') {
      const correctIds = correctOptions.map(o => String(o.id)).sort();
      const userSelected = Array.isArray(userAnswer) ? userAnswer.map(String).sort() : [];
      if (JSON.stringify(correctIds) === JSON.stringify(userSelected)) {
        isCorrect = true;
      }
    } else {
      // Default open answer check
      isCorrect = true;
    }

    if (isCorrect) {
      earnedScore += (q.points || 10);
    }

    questionResults.push({
      questionId: q.id,
      questionText: q.question_text,
      userAnswer,
      isCorrect,
      explanation: q.explanation,
      correctOptions: correctOptions.map(o => o.option_text)
    });
  }

  const percentage = maxScore > 0 ? Math.round((earnedScore / maxScore) * 100) : 100;
  const passed = percentage >= (quiz.passing_score || 80);

  const attemptId = 'qa-' + uuidv4().slice(0, 8);
  await run(
    `INSERT INTO quiz_attempts (id, quiz_id, user_id, score, max_score, percentage, passed, time_taken_seconds)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [attemptId, quizId, userId, earnedScore, maxScore, percentage, passed ? 1 : 0, timeTakenSeconds || 120]
  );

  // If passed, award gamification points
  if (passed) {
    const pointsAwarded = percentage === 100 ? 150 : 100;
    await run('UPDATE gamification_profiles SET points = points + ? WHERE user_id = ?', [pointsAwarded, userId]);
  }

  // Check if quiz is linked to a lesson and mark lesson complete
  if (quiz.lesson_id && passed) {
    // Look up enrollment
    const enrollment = await get('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, quiz.course_id]);
    if (enrollment) {
      const existingProg = await get('SELECT id FROM lesson_progress WHERE user_id = ? AND lesson_id = ?', [userId, quiz.lesson_id]);
      if (existingProg) {
        await run("UPDATE lesson_progress SET status = 'COMPLETED', completed_at = datetime('now') WHERE id = ?", [existingProg.id]);
      } else {
        await run(
          `INSERT INTO lesson_progress (id, user_id, lesson_id, enrollment_id, status, completed_at)
           VALUES (?, ?, ?, ?, 'COMPLETED', datetime('now'))`,
          ['lp-' + uuidv4().slice(0, 8), userId, quiz.lesson_id, enrollment.id]
        );
      }
    }
  }

  res.json({
    attemptId,
    earnedScore,
    maxScore,
    percentage,
    passed,
    passingScore: quiz.passing_score,
    questionResults
  });
});

// 3. Get Assignment Detail & User Submission
router.get('/assignment/:id', authenticate, async (req, res) => {
  const assignment = await get('SELECT * FROM assignments WHERE id = ?', [req.params.id]);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

  const submission = await get(
    `SELECT s.*, 
            u.first_name || ' ' || u.last_name AS grader_name
     FROM assignment_submissions s
     LEFT JOIN users u ON s.graded_by = u.id
     WHERE s.assignment_id = ? AND s.user_id = ?`,
    [assignment.id, req.user.id]
  );

  assignment.submission = submission || null;
  res.json(assignment);
});

// 4. Submit Assignment
router.post('/assignment/:id/submit', authenticate, async (req, res) => {
  const assignmentId = req.params.id;
  const { submissionText, fileUrl } = req.body;
  const userId = req.user.id;

  const existing = await get('SELECT id FROM assignment_submissions WHERE assignment_id = ? AND user_id = ?', [assignmentId, userId]);

  if (existing) {
    await run(
      `UPDATE assignment_submissions SET 
         submission_text = ?, 
         file_url = ?, 
         status = 'SUBMITTED', 
         submitted_at = datetime('now')
       WHERE id = ?`,
      [submissionText, fileUrl || null, existing.id]
    );
  } else {
    await run(
      `INSERT INTO assignment_submissions (id, assignment_id, user_id, submission_text, file_url, status)
       VALUES (?, ?, ?, ?, ?, 'SUBMITTED')`,
      ['sub-' + uuidv4().slice(0, 8), assignmentId, userId, submissionText, fileUrl || null]
    );
  }

  // Award gamification points for submitting
  await run('UPDATE gamification_profiles SET points = points + 35 WHERE user_id = ?', [userId]);

  res.json({ message: 'Assignment submitted successfully for instructor evaluation' });
});

// 5. Course Creator Grading Queue
router.get('/submissions', authenticate, requirePermission('assignment.grade'), async (req, res) => {
  const submissions = await query(`
    SELECT s.*, 
           a.title AS assignment_title, a.max_points,
           u.first_name || ' ' || u.last_name AS learner_name,
           u.email AS learner_email,
           u.avatar_url AS learner_avatar,
           c.title AS course_title
    FROM assignment_submissions s
    JOIN assignments a ON s.assignment_id = a.id
    JOIN lessons l ON a.lesson_id = l.id
    JOIN course_modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    JOIN users u ON s.user_id = u.id
    WHERE c.org_id = ?
    ORDER BY s.submitted_at DESC
  `, [req.user.org_id]);

  res.json(submissions);
});

// 6. Grade Assignment Submission
router.post('/submissions/:id/grade', authenticate, requirePermission('assignment.grade'), async (req, res) => {
  const { grade, feedback } = req.body;
  const submission = await get('SELECT * FROM assignment_submissions WHERE id = ?', [req.params.id]);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });

  await run(
    `UPDATE assignment_submissions SET 
       grade = ?, 
       feedback = ?, 
       status = 'GRADED', 
       graded_by = ?, 
       graded_at = datetime('now')
     WHERE id = ?`,
    [grade, feedback || 'Excellent work.', req.user.id, req.params.id]
  );

  // Send notification to learner
  await run(
    `INSERT INTO notifications (id, user_id, org_id, title, message, type, action_url)
     VALUES (?, ?, ?, 'Assignment Graded', ?, 'SUCCESS', '/learning')`,
    [
      'notif-' + uuidv4().slice(0, 8),
      submission.user_id,
      req.user.org_id,
      `Your assignment was graded by instructor: ${grade}/100.`
    ]
  );

  await logAudit(req.user.org_id, req.user.id, 'ASSIGNMENT_GRADED', 'ASSIGNMENT_SUBMISSION', req.params.id, { grade });

  res.json({ message: 'Grade and feedback recorded' });
});

export default router;
