import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, XCircle, Clock, Award, HelpCircle, 
  ArrowLeft, ArrowRight, RefreshCw, AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiRequest } from '../../lib/api';

export default function QuizRunner() {
  const { id: quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(1200); // 20 mins
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadQuiz() {
      try {
        const data = await apiRequest(`/assessments/quiz/${quizId}`);
        setQuiz(data);
      } catch (err) {
        console.error('Failed to load quiz:', err);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (!quiz || result) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [quiz, result]);

  const handleSelectOption = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const res = await apiRequest(`/assessments/quiz/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          answers,
          timeTakenSeconds: 1200 - timeLeftSeconds
        })
      });
      setResult(res);

      if (res.passed) {
        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch {}
      }
    } catch (err) {
      alert('Quiz submission failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading examination environment...</div>;
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 space-y-4">
        <p>No questions configured for this assessment.</p>
        <button onClick={() => navigate(-1)} className="text-brand-600 font-bold">← Return</button>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQIdx];
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-6 md:p-12 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto w-full space-y-6 animate-fade-in">
        {/* Results Screen */}
        {result ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-modal text-center space-y-6">
            {result.passed ? (
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <AlertCircle className="w-10 h-10" />
              </div>
            )}

            <div className="space-y-2">
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                result.passed ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
              }`}>
                {result.passed ? 'Assessment Passed' : 'Needs Retake'}
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900">
                Score: {result.percentage}% ({result.earnedScore}/{result.maxScore} pts)
              </h2>
              <p className="text-xs text-slate-500">
                Required passing threshold: {result.passingScore}% • Points awarded for completion
              </p>
            </div>

            {/* Question by question review */}
            <div className="space-y-3 text-left pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Answer Review</h4>
              {result.questionResults?.map((qr, idx) => (
                <div key={idx} className={`p-4 rounded-xl border text-xs space-y-1 ${
                  qr.isCorrect ? 'bg-emerald-50/30 border-emerald-200' : 'bg-rose-50/30 border-rose-200'
                }`}>
                  <div className="flex items-center space-x-2 font-bold text-slate-900">
                    {qr.isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                    <span>{idx + 1}. {qr.questionText}</span>
                  </div>
                  {qr.explanation && (
                    <p className="text-[11px] text-slate-600 pl-6 pt-1">
                      <strong>Explanation:</strong> {qr.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <Link
                to="/app/learner"
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Return to Dashboard
              </Link>
              {!result.passed && (
                <button
                  onClick={() => {
                    setResult(null);
                    setAnswers({});
                    setCurrentQIdx(0);
                    setTimeLeftSeconds(1200);
                  }}
                  className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Retake Exam
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Live Exam Test View */
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-modal space-y-6">
            {/* Top Bar with Timer */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-brand-700 uppercase tracking-widest block">Examination</span>
                <h3 className="text-base font-bold text-slate-900">{quiz.title}</h3>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 font-mono text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
              </div>
            </div>

            {/* Question Counter */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Question {currentQIdx + 1} of {quiz.questions.length}</span>
              <span>Points: {currentQ?.points || 10}</span>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {currentQ.question_text}
              </h2>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {currentQ.options?.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition flex items-center justify-between ${
                      String(answers[currentQ.id]) === String(opt.id)
                        ? 'border-brand-600 bg-brand-50/50 text-brand-900 font-bold shadow-subtle'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{opt.option_text}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      String(answers[currentQ.id]) === String(opt.id) ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300'
                    }`}>
                      {String(answers[currentQ.id]) === String(opt.id) && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation & Submit Bar */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                onClick={() => setCurrentQIdx(Math.max(0, currentQIdx - 1))}
                disabled={currentQIdx === 0}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30"
              >
                Previous
              </button>

              {currentQIdx < quiz.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQIdx(currentQIdx + 1)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                >
                  Next Question →
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  {submitting ? 'Evaluating...' : 'Submit & Grade Exam'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
