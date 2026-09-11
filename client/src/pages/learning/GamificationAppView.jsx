import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { 
  Flame, Award, Trophy, Zap, ShieldCheck, Users, CheckCircle2, 
  Search, Filter, Sparkles, Star, TrendingUp, Medal, Crown,
  ArrowUpRight, Clock, Target, ChevronRight, Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function GamificationAppView() {
    const { user, gamification } = useAuth();
  const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard' | 'badges' | 'streaks'
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState('MONTH');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  const streakDays = gamification?.streak_days || 1;
  const totalPoints = gamification?.points || 100;

  useEffect(() => {
    async function loadLeaderboard() {
      setLoadingLeaderboard(true);
      try {
        let endpoint = '/users/leaderboard?';
        if (selectedDept && selectedDept !== 'ALL') endpoint += `department=${encodeURIComponent(selectedDept)}&`;
        if (searchQuery) endpoint += `search=${encodeURIComponent(searchQuery)}&`;
        const data = await apiRequest(endpoint);
        if (Array.isArray(data)) {
          setLeaderboardData(data);
        }
      } catch (err) {
        console.error('Failed to load real leaderboard:', err);
      } finally {
        setLoadingLeaderboard(false);
      }
    }
    const timer = setTimeout(loadLeaderboard, 150);
    return () => clearTimeout(timer);
  }, [selectedDept, searchQuery]);


  const badges = [
    { 
      id: 'b1', 
      title: 'Zero Trust Certified', 
      desc: 'Achieved 100% on the Enterprise Zero Trust Architecture assessment', 
      rarity: 'Legendary', 
      rarityColor: 'from-amber-500 to-yellow-600 text-amber-700 bg-amber-50 border-amber-200', 
      icon: ShieldCheck, 
      earned: true, 
      date: 'Earned 2 days ago',
      xp: '+500 XP'
    },
    { 
      id: 'b2', 
      title: 'Curriculum Finisher', 
      desc: 'Mastered your first accredited enterprise certification track', 
      rarity: 'Epic', 
      rarityColor: 'from-purple-500 to-indigo-600 text-purple-700 bg-purple-50 border-purple-200', 
      icon: Award, 
      earned: true, 
      date: 'Earned 10 days ago',
      xp: '+350 XP'
    },
    { 
      id: 'b3', 
      title: '7-Day Learning Streak', 
      desc: 'Completed lessons and assessments for 7 consecutive calendar days', 
      rarity: 'Rare', 
      rarityColor: 'from-rose-500 to-red-600 text-rose-700 bg-rose-50 border-rose-200', 
      icon: Flame, 
      earned: true, 
      date: 'Earned 5 days ago',
      xp: '+200 XP'
    },
    { 
      id: 'b4', 
      title: 'Speed Scholar', 
      desc: 'Finished an accredited course 48 hours ahead of target due date', 
      rarity: 'Rare', 
      rarityColor: 'from-blue-500 to-cyan-600 text-blue-700 bg-blue-50 border-blue-200', 
      icon: Zap, 
      earned: false, 
      date: 'Locked — 1 course in progress',
      xp: '+250 XP'
    },
    { 
      id: 'b5', 
      title: 'Peer Contributor', 
      desc: 'Received instructor recognition on a lab design submission', 
      rarity: 'Common', 
      rarityColor: 'from-emerald-500 to-teal-600 text-emerald-700 bg-emerald-50 border-emerald-200', 
      icon: Users, 
      earned: true, 
      date: 'Earned 3 days ago',
      xp: '+150 XP'
    },
    { 
      id: 'b6', 
      title: 'Resilience Architect', 
      desc: 'Completed all 5 fault-injection chaos engineering scenarios', 
      rarity: 'Legendary', 
      rarityColor: 'from-amber-500 to-yellow-600 text-amber-700 bg-amber-50 border-amber-200', 
      icon: Trophy, 
      earned: false, 
      date: 'Locked — 3 of 5 completed',
      xp: '+600 XP'
    }
  ];

  const streakMilestones = [
    { days: 3, label: '3-Day Spark', reward: '+50 XP', completed: true },
    { days: 7, label: '7-Day Flame', reward: '+150 XP', completed: true },
    { days: 14, label: '14-Day Blaze', reward: '+300 XP', completed: false, current: true, remaining: '2 days to go' },
    { days: 30, label: '30-Day Inferno', reward: '+750 XP', completed: false },
    { days: 100, label: '100-Day Legend', reward: '+2,500 XP & Physical Plaque', completed: false }
  ];

  const filteredCohort = leaderboardData;
  const top3 = leaderboardData.slice(0, 3);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-2xl bg-red-50 text-red-600 border border-red-200/80">
              🍁
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  MapleLMS Gamification &amp; Leaderboard Hub
                </h1>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  Live Cohort
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Enterprise competency rankings, capability milestones, and peer achievements for Acme Global
              </p>
            </div>
          </div>
        </div>

        {/* View switcher tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cohort Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'badges'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Badges Showcase
          </button>
          <button
            onClick={() => setActiveTab('streaks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'streaks'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Streak Milestones
          </button>
        </div>
      </div>

      {/* Hero Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-subtle flex items-center space-x-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Daily Learning Streak</span>
            <div className="text-2xl font-black text-slate-900">{streakDays} Days 🔥</div>
            <span className="text-[11px] font-semibold text-emerald-600">+250 XP at 14 days</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-subtle flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200/60">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Maple XP</span>
            <div className="text-2xl font-black text-slate-900">{totalPoints.toLocaleString()} pts</div>
            <span className="text-[11px] font-semibold text-purple-600">Tier 4: Expert Level</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-subtle flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200/60">
            <Medal className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Cohort Standing</span>
            <div className="text-2xl font-black text-indigo-700">Rank #1 👑</div>
            <span className="text-[11px] font-semibold text-slate-500">Top 1% across Org</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-subtle flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Verified Credentials</span>
            <div className="text-2xl font-black text-slate-900">4 Badges</div>
            <span className="text-[11px] font-semibold text-emerald-600">98% Avg Exam Score</span>
          </div>
        </div>
      </div>

      {activeTab === 'leaderboard' && (
        <div className="space-y-8">
          {/* TOP 3 PODIUM */}
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="text-center space-y-1 mb-8">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 text-amber-300 border border-white/10 inline-block">
                Podium of Excellence
              </span>
              <h2 className="text-2xl font-black tracking-tight">Acme Global Top Performers</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Celebrating exceptional commitment to skill mastery, active streaks, and examination excellence.
              </p>
            </div>

            {/* Podium Display (2nd - 1st - 3rd) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-end max-w-4xl mx-auto pt-4">
              {/* 2nd Place (Silver) */}
              <div className="order-2 sm:order-1 flex flex-col items-center text-center space-y-3">
                <div className="relative">
                  <img
                    src={top3[1].avatar}
                    alt={top3[1].name}
                    className="w-16 h-16 rounded-full border-4 border-slate-300 object-cover shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow-md">
                    2
                  </div>
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-sm text-white">{top3[1].name}</h3>
                  <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{top3[1].title}</p>
                  <div className="text-xs font-black text-slate-300 pt-1">{top3[1].points.toLocaleString()} XP</div>
                </div>
                <div className="w-full bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3 h-28 flex flex-col justify-center items-center shadow-inner">
                  <span className="text-2xl font-black text-slate-400">🥈 2nd</span>
                  <span className="text-[11px] text-slate-400 mt-1">{top3[1].department}</span>
                </div>
              </div>

              {/* 1st Place (Gold - Elevated) */}
              <div className="order-1 sm:order-2 flex flex-col items-center text-center space-y-3 -mt-6 sm:-mt-10">
                <Crown className="w-8 h-8 text-amber-400 animate-bounce" />
                <div className="relative">
                  <img
                    src={top3[0].avatar}
                    alt={top3[0].name}
                    className="w-20 h-20 rounded-full border-4 border-amber-400 object-cover shadow-2xl ring-4 ring-amber-400/30"
                  />
                  <div className="absolute -bottom-2.5 -right-1.5 w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg">
                    1
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <h3 className="font-black text-base text-amber-300">{top3[0].name}</h3>
                    {top3[0].isCurrent && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 uppercase">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 truncate max-w-[200px]">{top3[0].title}</p>
                  <div className="text-sm font-black text-amber-400 pt-1">{top3[0].points.toLocaleString()} XP</div>
                </div>
                <div className="w-full bg-gradient-to-t from-amber-500/20 to-amber-500/10 border-2 border-amber-400/40 rounded-2xl p-4 h-36 flex flex-col justify-center items-center shadow-xl">
                  <span className="text-3xl font-black text-amber-400">🥇 1st</span>
                  <span className="text-xs font-extrabold text-amber-200 mt-1">{top3[0].streak} Day Streak 🔥</span>
                  <span className="text-[10px] text-amber-300/80">{top3[0].badge}</span>
                </div>
              </div>

              {/* 3rd Place (Bronze) */}
              <div className="order-3 flex flex-col items-center text-center space-y-3">
                <div className="relative">
                  <img
                    src={top3[2].avatar}
                    alt={top3[2].name}
                    className="w-16 h-16 rounded-full border-4 border-amber-700 object-cover shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-md">
                    3
                  </div>
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-sm text-white">{top3[2].name}</h3>
                  <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{top3[2].title}</p>
                  <div className="text-xs font-black text-amber-600 pt-1">{top3[2].points.toLocaleString()} XP</div>
                </div>
                <div className="w-full bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3 h-24 flex flex-col justify-center items-center shadow-inner">
                  <span className="text-2xl font-black text-amber-600">🥉 3rd</span>
                  <span className="text-[11px] text-slate-400 mt-1">{top3[2].department}</span>
                </div>
              </div>
            </div>
          </div>

          {/* COHORT LEADERBOARD TABLE & FILTERS */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by name, title, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-800"
                />
              </div>

              {/* Department Dropdown & Timeframe */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                >
                  <option value="ALL">All Departments</option>
                  <option value="Security & Cloud">Security &amp; Cloud</option>
                  <option value="Architecture">Architecture</option>
                  <option value="DevOps & SRE">DevOps &amp; SRE</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product & Operations">Product &amp; Operations</option>
                </select>

                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                >
                  <option value="MONTH">This Month</option>
                  <option value="WEEK">This Week</option>
                  <option value="ALL_TIME">All-Time High</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Learner</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Streak</th>
                    <th className="py-3 px-4">Certificates</th>
                    <th className="py-3 px-4">Exam Accuracy</th>
                    <th className="py-3 px-4 text-right">Maple XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredCohort.map((person) => (
                    <tr
                      key={person.rank}
                      className={`transition hover:bg-slate-50/80 ${
                        person.isCurrent ? 'bg-red-50/40 font-semibold' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 font-black">
                        {person.rank === 1 && <span className="text-amber-500 font-bold text-sm">🥇 #1</span>}
                        {person.rank === 2 && <span className="text-slate-400 font-bold text-sm">🥈 #2</span>}
                        {person.rank === 3 && <span className="text-amber-700 font-bold text-sm">🥉 #3</span>}
                        {person.rank > 3 && <span className="text-slate-500 font-mono">#{person.rank}</span>}
                      </td>

                      {/* Learner Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={person.avatar}
                            alt={person.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-slate-900">{person.name}</span>
                              {person.isCurrent && (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700 uppercase">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500">{person.title}</span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60">
                          {person.department}
                        </span>
                      </td>

                      {/* Streak */}
                      <td className="py-3.5 px-4 font-extrabold text-slate-700">
                        <span className="flex items-center space-x-1">
                          <Flame className="w-3.5 h-3.5 text-amber-500" />
                          <span>{person.streak} days</span>
                        </span>
                      </td>

                      {/* Certs */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200/80">
                          {person.certs} Verified
                        </span>
                      </td>

                      {/* Accuracy */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {person.accuracy}
                      </td>

                      {/* XP Points */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-black text-slate-900 text-sm">
                          {person.points.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block">XP</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Milestone Badges &amp; Credentials</h3>
              <p className="text-xs text-slate-500">Earn verifiable digital tokens as you master curriculum competencies</p>
            </div>
            <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
              4 of 6 Unlocked (67%)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={`rounded-3xl border p-6 flex flex-col justify-between space-y-4 transition-all ${
                    badge.earned
                      ? 'bg-white border-slate-200 shadow-subtle hover:shadow-card'
                      : 'bg-slate-50/50 border-slate-200/60 opacity-60'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${badge.rarityColor}`}>
                        {badge.rarity}
                      </span>
                      <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                        {badge.xp}
                      </span>
                    </div>

                    <div className="flex items-start space-x-3.5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                        badge.earned ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-200 text-slate-400'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{badge.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{badge.desc}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">{badge.date}</span>
                    {badge.earned ? (
                      <span className="flex items-center gap-1 font-bold text-emerald-600 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Unlocked</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-bold text-slate-400 text-xs">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'streaks' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-subtle space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <Flame className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Current Streak: {streakDays} Consecutive Days</h3>
                  <p className="text-xs text-slate-500">Log in and complete at least one lesson or assessment each day to maintain momentum</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Next Milestone</span>
                <span className="text-sm font-black text-amber-600">14-Day Blaze (2 days away)</span>
              </div>
            </div>

            {/* Progression roadmap */}
            <div className="space-y-4 pt-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Streak Milestones Roadmap</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {streakMilestones.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                      m.completed
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                        : m.current
                        ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/30'
                        : 'bg-slate-50 border-slate-200 opacity-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          {m.days} Days
                        </span>
                        {m.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : m.current ? (
                          <Flame className="w-4 h-4 text-amber-600 animate-pulse" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                      <h5 className="font-extrabold text-xs text-slate-900 mt-1">{m.label}</h5>
                    </div>
                    <div className="text-[11px] font-bold text-red-600">
                      {m.reward}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
