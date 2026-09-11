import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Layers, Sparkles, FolderArchive, 
  Award, BarChart3, Users, Network, Target, Bell, 
  Building2, History, Settings, FileCheck, Compass, CheckCircle2,
  Calendar, Flame, Trophy, User, PlusCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('maple_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('maple_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const role = user?.role || 'LEARNER';

  // Define role navigation trees
  const getNavItems = () => {
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      return [
        {
          group: 'Platform Core',
          items: [
            { label: 'Dashboard', to: role === 'SUPER_ADMIN' ? '/app/superadmin' : '/app/admin', icon: LayoutDashboard },
            { label: 'Leaderboard & Hub', to: '/app/leaderboard', icon: Trophy, badge: 'Hub' }
          ]
        },
        {
          group: 'Learning & Content',
          items: [
            { label: 'Create New Course', to: '/app/courses/new', icon: PlusCircle, badge: 'New', highlight: true },
            { label: 'AI Course Studio', to: '/app/ai-studio', icon: Sparkles, badge: 'AI' },
            { label: 'Courses Directory', to: '/app/courses', icon: BookOpen },
            { label: 'Learning Paths', to: '/app/learning-paths', icon: Layers },
            { label: 'SCORM Packages', to: '/app/scorm', icon: FolderArchive },
            { label: 'Assessments & Grading', to: '/app/assessments', icon: FileCheck },
            { label: 'Certificates', to: '/app/certificates', icon: Award }
          ]
        },
        {
          group: 'Organization & People',
          items: [
            { label: 'Users & Cohorts', to: '/app/users', icon: Users },
            { label: 'Teams & Groups', to: '/app/teams', icon: Network },
            { label: 'Skills & Competencies', to: '/app/skills', icon: Target },
            ...(role === 'SUPER_ADMIN' ? [{ label: 'Enterprise Tenants', to: '/app/organizations', icon: Building2 }] : [])
          ]
        },
        {
          group: 'Governance & Insights',
          items: [
            { label: 'Platform Analytics', to: '/app/analytics', icon: BarChart3 },
            { label: 'Broadcast Announcements', to: '/app/announcements', icon: Bell },
            { label: 'Audit Trail', to: '/app/audit-logs', icon: History },
            { label: 'Tenant Settings', to: '/app/settings', icon: Settings }
          ]
        }
      ];
    }

    if (role === 'COURSE_CREATOR') {
      return [
        {
          group: 'Workspace',
          items: [
            { label: 'Creator Dashboard', to: '/app/creator', icon: LayoutDashboard },
            { label: 'Leaderboard & Hub', to: '/app/leaderboard', icon: Trophy, badge: 'Hub' }
          ]
        },
        {
          group: 'Authoring Studio',
          items: [
            { label: 'Create New Course', to: '/app/courses/new', icon: PlusCircle, badge: 'New', highlight: true },
            { label: 'AI Course Studio', to: '/app/ai-studio', icon: Sparkles, badge: 'AI' },
            { label: 'My Courses Catalog', to: '/app/courses', icon: BookOpen },
            { label: 'SCORM Packages', to: '/app/scorm', icon: FolderArchive },
            { label: 'Learning Paths', to: '/app/learning-paths', icon: Layers }
          ]
        },
        {
          group: 'Evaluation & Oversight',
          items: [
            { label: 'Grading Queue', to: '/app/grading', icon: CheckCircle2, badge: 'Queue' },
            { label: 'My Team Roster', to: '/app/my-team', icon: Network, badge: 'Manager' },
            { label: 'Users & Cohorts', to: '/app/users', icon: Users },
            { label: 'Skills Matrix', to: '/app/skills', icon: Target },
            { label: 'Course Analytics', to: '/app/analytics', icon: BarChart3 },
            { label: 'Issued Credentials', to: '/app/certificates', icon: Award }
          ]
        }
      ];
    }

    // LEARNER Navigation
    return [
      {
        group: 'Personal Learning',
        items: [
          { label: 'Home Dashboard', to: '/app/learner', icon: LayoutDashboard },
          { label: 'My Active Learning', to: '/app/my-learning', icon: BookOpen },
          { label: 'Explore Catalog', to: '/app/explore', icon: Compass },
          { label: 'Learning Paths', to: '/app/learning-paths', icon: Layers }
        ]
      },
      {
        group: 'Gamification & Mastery',
        items: [
          { label: 'Leaderboard & Ranks', to: '/app/leaderboard', icon: Trophy, badge: 'Live', highlight: true },
          { label: 'Achievements & Badges', to: '/app/achievements', icon: Flame },
          { label: 'Skills Matrix', to: '/app/skills', icon: Target },
          { label: 'My Certificates', to: '/app/certificates', icon: Award }
        ]
      },
      {
        group: 'Communications',
        items: [
          { label: 'Announcements', to: '/app/announcements', icon: Bell },
          { label: 'My Profile & Bio', to: '/app/profile', icon: User }
        ]
      }
    ];
  };

  const navGroups = getNavItems();

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white border-r border-slate-200/80 flex flex-col justify-between flex-shrink-0 min-h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out shadow-xs select-none relative z-20`}
    >
      {/* Top Collapse Toggle Bar */}
      <div className={`px-3 py-3 border-b border-slate-100 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Workspace Nav
          </span>
        )}
        <button
          onClick={toggleCollapsed}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition flex items-center justify-center"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          )}
        </button>
      </div>

      {/* Nav Groups */}
      <div className={`p-3 space-y-5 overflow-y-auto flex-1 ${isCollapsed ? 'px-2' : 'px-3.5'}`}>
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed ? (
              <h4 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {group.group}
              </h4>
            ) : (
              gIdx > 0 && <div className="h-px bg-slate-100 my-2 mx-2" />
            )}

            <div className="space-y-1 pt-0.5">
              {group.items.map((item, iIdx) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to || (
                  item.to !== '/app/learner' && 
                  item.to !== '/app/admin' && 
                  item.to !== '/app/superadmin' && 
                  item.to !== '/app/creator' && 
                  location.pathname.startsWith(item.to)
                );

                if (isCollapsed) {
                  return (
                    <div key={iIdx} className="relative group/tooltip flex justify-center py-0.5">
                      <NavLink
                        to={item.to}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-red-50 text-red-600 shadow-xs border border-red-200/80 font-bold'
                            : item.highlight
                            ? 'text-red-600 hover:bg-red-50/60'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-red-600' : ''}`} />
                      </NavLink>

                      {/* Floating Tooltip */}
                      <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-2xl z-50 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-all scale-95 group-hover/tooltip:scale-100 whitespace-nowrap flex items-center gap-1.5">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-600 text-white uppercase">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={iIdx}
                    to={item.to}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-red-50 text-red-700 shadow-xs border border-red-200/70 font-bold'
                        : item.highlight
                        ? 'text-red-600 hover:bg-red-50/50 hover:text-red-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${
                        isActive
                          ? 'text-red-600'
                          : item.highlight
                          ? 'text-red-600'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        item.badge === 'Studio' || item.badge === 'AI' 
                          ? 'bg-purple-100 text-purple-700'
                          : item.badge === 'New' || item.badge === 'Live'
                          ? 'bg-red-100 text-red-700 font-extrabold'
                          : item.badge === 'Hub'
                          ? 'bg-amber-100 text-amber-700 font-extrabold'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Role Badge in Sidebar */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        {!isCollapsed ? (
          <div className="bg-white border border-slate-200/80 rounded-xl p-3 flex items-center justify-between shadow-xs">
            <div className="min-w-0">
              <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400 block mb-0.5">Role Workspace</span>
              <span className="text-xs font-bold text-slate-800 truncate block">
                {role === 'COURSE_CREATOR' ? 'Course Creator' : role.replace('_', ' ')}
              </span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs ring-4 ring-emerald-100"></div>
          </div>
        ) : (
          <div className="flex justify-center relative group/tooltip">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs text-xs font-extrabold text-slate-800">
              🍁
            </div>
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-2xl z-50 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-all scale-95 group-hover/tooltip:scale-100 whitespace-nowrap">
              {role === 'COURSE_CREATOR' ? 'Course Creator' : role.replace('_', ' ')}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
