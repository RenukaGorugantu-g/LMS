import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Bell, Search, ChevronDown, Check, Shield, User, LogOut, 
  Sparkles, Layers, BookOpen, BarChart3, Users, Flame, Award, Plus, Compass,
  ChevronRight, Trophy, Zap, ExternalLink, Settings, FolderArchive, CheckCircle2,
  HelpCircle, Command, Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';

export default function Navbar({ onOpenCommandPalette }) {
  const { user, gamification, unreadCount, switchRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Dropdown states
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifFilter, setNotifFilter] = useState('ALL'); // 'ALL' or 'UNREAD'

  // Refs for click outside
  const createRef = useRef(null);
  const roleRef = useRef(null);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (createRef.current && !createRef.current.contains(e.target)) setCreateDropdownOpen(false);
      if (roleRef.current && !roleRef.current.contains(e.target)) setRoleDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifDropdownOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rolesList = [
    { id: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full multi-tenant platform governance & audit', icon: Shield, color: 'text-purple-700 bg-purple-50 border-purple-200' },
    { id: 'ADMIN', label: 'Operational Admin', desc: 'Enterprise cohorts, categories & compliance', icon: Layers, color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { id: 'COURSE_CREATOR', label: 'Course Creator / Manager', desc: 'Content authoring studio, AI copilot & grading', icon: Sparkles, color: 'text-rose-700 bg-rose-50 border-rose-200' },
    { id: 'LEARNER', label: 'Learner Experience', desc: 'Personalized hub, course player & leaderboard', icon: BookOpen, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
  ];

  const handleRoleSelect = async (roleId) => {
    setRoleDropdownOpen(false);
    await switchRole(roleId);
    if (roleId === 'LEARNER') navigate('/app/learner');
    else if (roleId === 'COURSE_CREATOR') navigate('/app/creator');
    else if (roleId === 'ADMIN') navigate('/app/admin');
    else if (roleId === 'SUPER_ADMIN') navigate('/app/superadmin');
  };

  const handleOpenNotifs = async () => {
    const nextState = !notifDropdownOpen;
    setNotifDropdownOpen(nextState);
    if (nextState) {
      try {
        const notifs = await apiRequest('/notifications');
        if (Array.isArray(notifs)) setNotifications(notifs);
      } catch {}
    }
  };

  // Derive Contextual Breadcrumb based on URL
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.startsWith('/app/courses/new')) return { section: 'Authoring Studio', page: 'Create Course' };
    if (path.includes('/builder')) return { section: 'Authoring Studio', page: 'Course Builder' };
    if (path.startsWith('/app/ai-studio')) return { section: 'Authoring Studio', page: 'AI Course Studio' };
    if (path.startsWith('/app/courses')) return { section: 'Learning & Content', page: 'Courses Catalog' };
    if (path.startsWith('/app/users')) return { section: 'Organization & People', page: 'Users & Cohorts' };
    if (path.startsWith('/app/teams')) return { section: 'Organization & People', page: 'Teams & Groups' };
    if (path.startsWith('/app/skills')) return { section: 'Organization & People', page: 'Skills Matrix' };
    if (path.startsWith('/app/leaderboard')) return { section: 'Gamification & Mastery', page: 'Leaderboard & Hub' };
    if (path.startsWith('/app/analytics')) return { section: 'Governance & Insights', page: 'Platform Analytics' };
    if (path.startsWith('/app/scorm')) return { section: 'Learning & Content', page: 'SCORM Packages' };
    if (path.startsWith('/app/learner')) return { section: 'Personal Learning', page: 'Learner Hub' };
    if (path.startsWith('/app/creator')) return { section: 'Authoring Studio', page: 'Creator Studio' };
    if (path.startsWith('/app/admin')) return { section: 'Governance', page: 'Admin Operations' };
    if (path.startsWith('/app/superadmin')) return { section: 'Platform Core', page: 'Super Admin Command' };
    return { section: 'MapleLMS', page: 'Enterprise Workspace' };
  };

  const currentRoleInfo = rolesList.find(r => r.id === user?.role) || rolesList[3];
  const breadcrumb = getBreadcrumbs();
  const canCreate = user?.role === 'COURSE_CREATOR' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const filteredNotifs = notifFilter === 'UNREAD' 
    ? notifications.filter(n => !n.is_read) 
    : notifications;

  return (
    <header className="h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between transition-all shadow-xs">
      {/* Left Section: Brand, Breadcrumb & Organization */}
      <div className="flex items-center space-x-3.5 min-w-0">
        <Link to="/" className="flex items-center space-x-2.5 group flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 flex items-center justify-center text-white font-extrabold text-sm shadow-xs group-hover:scale-105 group-hover:shadow-red-500/20 transition-all">
            🍁
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              Maple<span className="text-red-600">LMS</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200/80 uppercase tracking-wider">
              Enterprise
            </span>
          </div>
        </Link>

        {/* Separator */}
        <span className="hidden lg:inline-block text-slate-300 font-light">/</span>

        {/* Dynamic Contextual Breadcrumb */}
        <div className="hidden lg:flex items-center text-xs space-x-1.5 min-w-0">
          <span className="text-slate-400 font-medium truncate">{breadcrumb.section}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          <span className="font-bold text-slate-800 truncate">{breadcrumb.page}</span>
        </div>

        {/* Organization Status Pill */}
        <div className="hidden xl:flex items-center text-[11px] font-semibold text-slate-600 bg-slate-100/70 border border-slate-200/80 px-2.5 py-1 rounded-full shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 ring-2 ring-emerald-200/60 animate-pulse"></span>
          <span className="truncate max-w-[150px]">{user?.org_name || 'Acme Global Technologies'}</span>
        </div>
      </div>

      {/* Middle Section: Global Search Bar */}
      <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-4 lg:mx-8">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-400 bg-slate-50/80 border border-slate-200/80 rounded-xl hover:bg-slate-100/90 hover:border-slate-300 hover:text-slate-600 transition shadow-2xs group"
        >
          <div className="flex items-center space-x-2.5 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span className="truncate">Search courses, cohorts, skills, lessons...</span>
          </div>
          <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500 shadow-2xs">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Quick Create, Role Switcher, Gamification, Notifications, Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Quick Create Action Menu */}
        {canCreate && (
          <div className="relative" ref={createRef}>
            <button
              onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs hover:shadow-red-600/20 active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Create</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${createDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {createDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">Create New Asset</p>
                  <p className="text-[11px] text-slate-500">Choose an authoring or management pathway</p>
                </div>
                <div className="py-1 space-y-0.5">
                  <Link
                    to="/app/ai-studio"
                    onClick={() => setCreateDropdownOpen(false)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-purple-50/70 border border-transparent hover:border-purple-200 flex items-start gap-3 transition group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-purple-900">AI Course Studio</span>
                        <span className="text-[9px] font-extrabold bg-purple-600 text-white px-1.5 py-0.2 rounded-full">AI</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Synthesize customized course curriculum with AI</p>
                    </div>
                  </Link>

                  <Link
                    to="/app/courses/new"
                    onClick={() => setCreateDropdownOpen(false)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-start gap-3 transition group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Course from Scratch</span>
                      <p className="text-[11px] text-slate-500">Clean-slate course builder with zero filler</p>
                    </div>
                  </Link>

                  <Link
                    to="/app/users"
                    onClick={() => setCreateDropdownOpen(false)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-start gap-3 transition group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Learner Cohort</span>
                      <p className="text-[11px] text-slate-500">Group learners with course auto-enrollment</p>
                    </div>
                  </Link>

                  <Link
                    to="/app/scorm"
                    onClick={() => setCreateDropdownOpen(false)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-start gap-3 transition group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <FolderArchive className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">SCORM Package</span>
                      <p className="text-[11px] text-slate-500">Upload standard SCORM 1.2 or 2004 archive</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Role Switcher Pill for instant platform evaluation */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className={`flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border shadow-2xs transition-all ${currentRoleInfo.color} active:scale-98`}
            title="Instant Role Switcher for Platform Evaluation"
          >
            <currentRoleInfo.icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline truncate max-w-[120px]">{currentRoleInfo.label}</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${roleDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 mb-1.5 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">Switch Evaluation Role</p>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200/70">
                    Live Demo
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Test the 4 distinct enterprise user workflows</p>
              </div>
              <div className="space-y-1">
                {rolesList.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleRoleSelect(r.id)}
                    className={`w-full text-left p-2.5 rounded-xl flex items-start space-x-3 transition ${
                      user?.role === r.id ? 'bg-indigo-50/70 border border-indigo-200/80 shadow-2xs' : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg border mt-0.5 ${r.color}`}>
                      <r.icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{r.label}</span>
                        {user?.role === r.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Gamification Status Capsule (Streak & Points) */}
        <div className="hidden lg:flex items-center space-x-1.5 text-xs font-bold">
          <Link
            to="/app/leaderboard"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-amber-50/90 text-amber-900 border border-amber-200/80 rounded-xl shadow-2xs hover:bg-amber-100/80 transition"
            title="Active Learning Streak"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{gamification?.streak_days || 12}d</span>
          </Link>
          <Link
            to="/app/leaderboard"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-indigo-50/90 text-indigo-900 border border-indigo-200/80 rounded-xl shadow-2xs hover:bg-indigo-100/80 transition"
            title="Earned Mastery XP"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
            <span>{gamification?.points?.toLocaleString() || '2,450'}</span>
          </Link>
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleOpenNotifs}
            className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition active:scale-95"
            title="Notifications Center"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNotifFilter(notifFilter === 'ALL' ? 'UNREAD' : 'ALL')}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <Filter className="w-3 h-3" />
                    <span>{notifFilter === 'ALL' ? 'Unread only' : 'Show all'}</span>
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await apiRequest('/notifications/read-all', { method: 'POST' });
                        setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
                      } catch {}
                    }}
                    className="text-[11px] font-bold text-red-600 hover:underline"
                  >
                    Mark read
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 mt-1">
                {filteredNotifs.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-slate-700">You're all caught up!</p>
                    <p className="text-[11px] text-slate-400">No unread notifications right now.</p>
                  </div>
                ) : (
                  filteredNotifs.map(n => (
                    <div key={n.id} className={`p-3 text-xs rounded-xl transition ${n.is_read ? 'opacity-70 hover:opacity-100' : 'bg-red-50/30'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-slate-900">{n.title}</p>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {new Date(n.created_at || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center space-x-2 p-0.5 rounded-xl hover:ring-2 hover:ring-red-200 transition ring-1 ring-slate-200 active:scale-95"
          >
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
              alt={user?.first_name}
              className="w-8 h-8 rounded-xl object-cover"
            />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3 border-b border-slate-100 bg-slate-50/60 rounded-xl mb-1.5">
                <div className="flex items-center gap-2.5">
                  <img
                    src={user?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                    alt={user?.first_name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.first_name} {user?.last_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 px-1.5 py-0.2 rounded">
                        {user?.department || 'Executive Operations'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-1 space-y-0.5">
                <Link
                  to="/app/profile"
                  onClick={() => setUserDropdownOpen(false)}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center justify-between transition"
                >
                  <div className="flex items-center space-x-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Profile &amp; Bio</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                </Link>

                <Link
                  to="/app/leaderboard"
                  onClick={() => setUserDropdownOpen(false)}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center justify-between transition"
                >
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>Leaderboard &amp; Badges</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-full">Top</span>
                </Link>

                <Link
                  to="/"
                  onClick={() => setUserDropdownOpen(false)}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center justify-between transition"
                >
                  <div className="flex items-center space-x-2">
                    <Compass className="w-3.5 h-3.5 text-slate-400" />
                    <span>Public Catalog &amp; Portal</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-300" />
                </Link>

                <div className="pt-1 mt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center space-x-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
