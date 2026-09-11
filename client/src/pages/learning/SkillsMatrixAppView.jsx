import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, CheckCircle2, ArrowRight, BarChart3, AlertCircle, Users, BookOpen } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function SkillsMatrixAppView() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [activeTab, setActiveTab] = useState('MY_SKILLS'); // MY_SKILLS or TEAM_SKILLS
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSkills() {
      try {
        const mySkills = await apiRequest('/skills/my-skills');
        setData(mySkills);

        if (user?.role !== 'LEARNER') {
          const team = await apiRequest('/skills/team-skills');
          setTeamData(team);
        }
      } catch (err) {
        console.error('Skills fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSkills();
  }, [user]);

  if (loading) {
    return <div className="p-8 max-w-7xl mx-auto animate-pulse space-y-4"><div className="h-10 bg-slate-200 rounded w-1/4"></div></div>;
  }

  const skills = data?.skills || [];
  const recCourses = data?.recommendedCourses || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Target className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Skills &amp; Competency Matrix
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            5-tier proficiency modeling, target capability benchmarking, and automated gap mitigation
          </p>
        </div>

        {/* Tab Toggle for Managers / Admins */}
        {user?.role !== 'LEARNER' && (
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('MY_SKILLS')}
              className={`px-4 py-1.5 rounded-lg transition ${
                activeTab === 'MY_SKILLS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Personal Skills Profile
            </button>
            <button
              onClick={() => setActiveTab('TEAM_SKILLS')}
              className={`px-4 py-1.5 rounded-lg transition ${
                activeTab === 'TEAM_SKILLS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Team Capability Heat Map
            </button>
          </div>
        )}
      </div>

      {activeTab === 'MY_SKILLS' ? (
        <div className="space-y-8">
          {/* Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-subtle space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Tracked Skills</span>
              <div className="text-2xl font-bold text-slate-900">{data?.summary?.totalTracked || 7}</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-subtle space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Mastered (Level 4-5)</span>
              <div className="text-2xl font-bold text-emerald-600">{data?.summary?.proficientSkillsCount || 3}</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-subtle space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Identified Skill Gaps</span>
              <div className="text-2xl font-bold text-amber-600">{data?.summary?.skillsWithGapCount || 4}</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-subtle space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Average Level</span>
              <div className="text-2xl font-bold text-slate-900">Level {data?.summary?.averageLevel || '3.3'} / 5</div>
            </div>
          </div>

          {/* Detailed Skill Progression List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Verified Competencies vs Target Role Standard</h3>
              <span className="text-xs text-slate-400">Benchmarked against: Senior Cloud Architect</span>
            </div>

            <div className="space-y-4">
              {skills.map((s) => (
                <div key={s.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-900">{s.name}</span>
                      <span className="text-[11px] text-slate-400 ml-2">({s.category})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-700">Level {s.current_level} / 5</span>
                      {s.gap > 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          Gap: -{s.gap}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          ✓ Target Met
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 5-step visual segments */}
                  <div className="grid grid-cols-5 gap-1.5 h-2">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`rounded-full transition-colors ${
                          lvl <= s.current_level
                            ? 'bg-emerald-500'
                            : lvl <= s.target_level
                            ? 'bg-amber-300'
                            : 'bg-slate-200'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gap Bridging Recommendations */}
          {recCourses.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Recommended Courses to Bridge Identified Gaps</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recCourses.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-subtle flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-purple-700 uppercase">Target: {c.target_skill_name}</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{c.title}</h4>
                      <span className="text-slate-400 text-[11px]">{c.duration_minutes} mins</span>
                    </div>
                    <Link
                      to={`/learning/${c.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-[11px] hover:bg-slate-800"
                    >
                      Enroll
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Team Skills Matrix */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              {teamData?.teamName || 'Cloud Infrastructure & Security'} — Skill Distribution Heat Map
            </h3>
            <p className="text-[11px] text-slate-500">Aggregated team competencies and structural deficiency areas</p>
          </div>

          <div className="space-y-4">
            {teamData?.gapSummary?.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{item.name}</span>
                  <span className="text-slate-500 font-mono">
                    Avg Level: {item.avg_current.toFixed(1)} / Target: {item.avg_target.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-brand-600 h-full rounded-full"
                    style={{ width: `${(item.avg_current / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
