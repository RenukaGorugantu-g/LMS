import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Layers, Target, Users, X, ArrowRight } from 'lucide-react';
import { apiRequest } from '../../lib/api';

export default function GlobalCommandPalette({ isOpen, onClose }) {
  const [queryText, setQueryText] = useState('');
  const [results, setResults] = useState({ courses: [], paths: [], skills: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      setQueryText('');
      return;
    }

    async function search() {
      setLoading(true);
      try {
        const [courses, paths, skills] = await Promise.all([
          apiRequest(`/courses?search=${encodeURIComponent(queryText)}`),
          apiRequest('/learning-paths'),
          apiRequest('/skills')
        ]);

        const filteredCourses = (courses || []).slice(0, 4);
        const filteredPaths = (paths || []).filter(p => !queryText || p.title.toLowerCase().includes(queryText.toLowerCase())).slice(0, 3);
        const filteredSkills = (skills || []).filter(s => !queryText || s.name.toLowerCase().includes(queryText.toLowerCase())).slice(0, 3);

        setResults({ courses: filteredCourses, paths: filteredPaths, skills: filteredSkills });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(search, 150);
    return () => clearTimeout(timer);
  }, [isOpen, queryText]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-fade-in">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center space-x-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses, modules, learning paths, skills, or members..."
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            className="flex-1 text-sm bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400"
            autoFocus
          />
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-5 text-xs">
          {/* Courses */}
          {results.courses.length > 0 && (
            <div>
              <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-2">Courses</p>
              <div className="space-y-1">
                {results.courses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onClose();
                      navigate(`/learning/${c.id}`);
                    }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded bg-brand-50 text-brand-600">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-brand-600">{c.title}</div>
                        <div className="text-[11px] text-slate-500">{c.category} • {c.level}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Paths */}
          {results.paths.length > 0 && (
            <div>
              <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-2">Learning Paths</p>
              <div className="space-y-1">
                {results.paths.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onClose();
                      navigate(`/app/learning-paths`);
                    }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded bg-purple-50 text-purple-600">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-purple-600">{p.title}</div>
                        <div className="text-[11px] text-slate-500">{p.target_role} • {p.duration_hours} hours</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {results.skills.length > 0 && (
            <div>
              <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-2">Skills</p>
              <div className="space-y-1">
                {results.skills.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onClose();
                      navigate('/app/skills');
                    }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded bg-emerald-50 text-emerald-600">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-emerald-600">{s.name}</div>
                        <div className="text-[11px] text-slate-500">{s.category}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with <strong>Enter</strong> or click</span>
          <span>Press <strong>ESC</strong> to close</span>
        </div>
      </div>
    </div>
  );
}
