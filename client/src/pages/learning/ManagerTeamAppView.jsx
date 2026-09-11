import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, CheckCircle2, ArrowRight, Mail, Award, Clock } from 'lucide-react';
import { apiRequest } from '../../lib/api';

export default function ManagerTeamAppView() {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeam() {
      try {
        const data = await apiRequest('/users/team');
        setTeam(data);
      } catch (err) {
        console.error('Manager team load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, []);

  const handleSendReminder = async (memberId, memberName) => {
    try {
      await apiRequest(`/users/${memberId}/remind`, { method: 'POST' });
      alert(`Automated reminder notification successfully delivered to ${memberName}.`);
    } catch (err) {
      alert('Reminder failed: ' + err.message);
    }
  };

  if (loading) {
    return <div className="p-8 max-w-7xl mx-auto animate-pulse space-y-4"><div className="h-10 bg-slate-200 rounded w-1/4"></div></div>;
  }

  const members = team?.members || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Team Capability Oversight
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cohort: {team?.teamName || 'Cloud Infrastructure & Security'} • Manager direct reports
          </p>
        </div>
      </div>

      {/* Team Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={member.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'}
                  alt={member.first_name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{member.first_name} {member.last_name}</h3>
                  <p className="text-xs text-slate-500">{member.title}</p>
                  <p className="text-[11px] text-slate-400">{member.email}</p>
                </div>
              </div>

              {member.overdueCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>{member.overdueCount} Overdue</span>
                </span>
              )}
            </div>

            {/* Metric counters */}
            <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg Progress</span>
                <span className="font-extrabold text-slate-900">{member.averageProgress}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Completed</span>
                <span className="font-extrabold text-emerald-600">{member.completedCount} courses</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Points</span>
                <span className="font-extrabold text-brand-600">{member.points || 0}</span>
              </div>
            </div>

            {/* Enrolled courses breakdown */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Curricula:</span>
              {member.enrollments?.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-[11px]">
                  <span className="truncate max-w-[200px] text-slate-700">{e.course_title}</span>
                  <span className={`font-semibold ${
                    e.status === 'COMPLETED' ? 'text-emerald-600' : e.status === 'OVERDUE' ? 'text-amber-600' : 'text-blue-600'
                  }`}>
                    {e.progress_percent}% ({e.status})
                  </span>
                </div>
              ))}
            </div>

            {/* Manager Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleSendReminder(member.id, `${member.first_name} ${member.last_name}`)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center space-x-1"
              >
                <Mail className="w-3 h-3" />
                <span>Nudge Learner</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
