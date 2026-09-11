import React, { useState, useEffect } from 'react';
import { CheckCircle2, Award, Clock, ArrowRight, User } from 'lucide-react';
import { apiRequest } from '../../lib/api';

export default function GradingQueueAppView() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [grade, setGrade] = useState(90);
  const [feedback, setFeedback] = useState('Thorough analysis with exceptional attention to operational risk controls.');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    try {
      const data = await apiRequest('/assessments/submissions');
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;

    setSubmitting(true);
    try {
      await apiRequest(`/assessments/submissions/${selectedSub.id}/grade`, {
        method: 'POST',
        body: JSON.stringify({ grade, feedback })
      });
      alert('Grade and feedback saved. Learner notified.');
      setSelectedSub(null);
      await loadSubmissions();
    } catch (err) {
      alert('Grading failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Instructor Grading Queue
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Evaluate practical student assignments and provide qualitative rubric feedback
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Submitted Student Deliverables</span>
          <span className="text-xs text-slate-500">{submissions.length} Submissions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-4">Learner</th>
                <th className="p-4">Assignment &amp; Course</th>
                <th className="p-4">Status</th>
                <th className="p-4">Current Grade</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50 transition">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{sub.learner_name}</div>
                    <span className="text-[11px] text-slate-400">{sub.learner_email}</span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{sub.assignment_title}</div>
                    <span className="text-[11px] text-slate-500">{sub.course_title}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sub.status === 'GRADED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-800">
                    {sub.grade !== null ? `${sub.grade} / ${sub.max_points}` : '—'}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedSub(sub);
                        setGrade(sub.grade || 85);
                        setFeedback(sub.feedback || 'Great practical execution.');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
                    >
                      {sub.status === 'GRADED' ? 'Update Grade' : 'Grade Submission'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grading Review Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-modal border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Grading: {selectedSub.assignment_title}</h3>
                <p className="text-[11px] text-slate-500">Student: {selectedSub.learner_name}</p>
              </div>
              <button onClick={() => setSelectedSub(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-700 block">Student Submission Content:</span>
              <div className="whitespace-pre-line text-slate-800 font-mono text-[11px] bg-white p-3 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
                {selectedSub.submission_text}
              </div>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Grade Score (0 - {selectedSub.max_points || 100})
                </label>
                <input
                  type="number"
                  min="0"
                  max={selectedSub.max_points || 100}
                  required
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instructor Qualitative Feedback</label>
                <textarea
                  rows={3}
                  required
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  {submitting ? 'Submitting...' : 'Save & Publish Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
