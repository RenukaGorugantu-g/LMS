import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, CheckCircle2, ArrowRight, Clock, Plus, BookOpen } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function LearningPathsAppView() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadPaths() {
      try {
        const data = await apiRequest('/learning-paths');
        setPaths(data);
      } catch (err) {
        console.error('Learning paths error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPaths();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-700">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Learning Paths
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential multi-course pathways designed for deep role-based capability progression
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {paths.map((path) => (
          <div
            key={path.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle hover:shadow-card transition flex flex-col justify-between"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 uppercase">
                  {path.course_count || 3} Courses Sequence
                </span>
                <span className="text-xs text-slate-400 font-mono">{path.duration_hours}h total</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">{path.title}</h3>
                <p className="text-xs text-slate-500">{path.target_role}</p>
                <p className="text-xs text-slate-600 line-clamp-2 pt-1">{path.description}</p>
              </div>

              {user?.role === 'LEARNER' && (
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Pathway Progress</span>
                    <span>{path.learner_progress_percent || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-600 h-full rounded-full"
                      style={{ width: `${path.learner_progress_percent || 0}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Verifiable Certificate on Finish</span>
              <button
                onClick={() => alert(`Enrolled in ${path.title}. Curricula synchronized.`)}
                className="font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
              >
                <span>Inspect Pathway</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
