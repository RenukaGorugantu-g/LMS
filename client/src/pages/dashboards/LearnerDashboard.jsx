import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, BookOpen, Clock, Target, Award, Flame, CheckCircle2, 
  Calendar, ArrowRight, Sparkles, TrendingUp, AlertTriangle, ShieldCheck,
  MessageSquare, Users, Compass, ChevronRight, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';

export default function LearnerDashboard() {
  const { user, gamification } = useAuth();
  const [courses, setCourses] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [skillSummary, setSkillSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [coursesData, pathsData, skillsData] = await Promise.all([
          apiRequest('/courses'),
          apiRequest('/learning-paths'),
          apiRequest('/skills/my-skills')
        ]);
        setCourses(coursesData);
        setLearningPaths(pathsData);
        setSkillSummary(skillsData);
      } catch (err) {
        console.error('Failed to load learner data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3"></div>
        <div className="h-64 bg-slate-200 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-slate-200 rounded-2xl"></div>
          <div className="h-44 bg-slate-200 rounded-2xl"></div>
          <div className="h-44 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Active in-progress course
  const inProgressCourses = courses.filter(c => c.is_enrolled && c.enrollment_status === 'IN_PROGRESS');
  const overdueCourses = courses.filter(c => c.is_enrolled && c.enrollment_status === 'OVERDUE');
  const heroCourse = inProgressCourses[0] || courses[0];
  const recommendedCourses = courses.filter(c => !c.is_enrolled).slice(0, 3);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in font-sans">
      {/* 1. The Hub Header: Greeting & Streak Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Hub • Personalized Learning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.first_name || 'Elena'} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {user?.title || 'Senior Cloud & Security Systems Engineer'} • {user?.org_name || 'Acme Global Technologies'}
          </p>
        </div>

        {/* Gamification Streak & Points */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2.5 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border border-amber-200/80 rounded-2xl shadow-2xs">
            <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
            <div>
              <span className="block font-extrabold text-xs leading-tight">{gamification?.streak_days || 12} Day Streak</span>
              <span className="text-[10px] text-amber-700 font-semibold">Active learner</span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-900 border border-indigo-200/80 rounded-2xl shadow-2xs">
            <Award className="w-4 h-4 text-indigo-600" />
            <div>
              <span className="block font-extrabold text-xs leading-tight">{gamification?.points?.toLocaleString() || '2,450'} pts</span>
              <span className="text-[10px] text-indigo-700 font-semibold">{gamification?.rank_title || 'Sentinel Rank'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Alert Banner if any */}
      {overdueCourses.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3 text-xs text-amber-950">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <strong className="block font-bold">Action Required: Compliance Deadline Approaching</strong>
              <span>You have {overdueCourses.length} assigned mandatory training module: <em>{overdueCourses[0].title}</em></span>
            </div>
          </div>
          <Link
            to={`/learning/${overdueCourses[0].id}`}
            className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition shadow-2xs"
          >
            Complete Now
          </Link>
        </div>
      )}

      {/* 2. Hero Continue Learning Banner (Thrive Signature Hero) */}
      {heroCourse && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 md:p-10 shadow-lg border border-slate-800">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3.5 max-w-2xl">
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold uppercase tracking-wider text-[10px] border border-indigo-400/30">
                  Continue Learning
                </span>
                <span className="text-slate-400 text-xs">• Last active today</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                {heroCourse.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                {heroCourse.description || 'Master deep technical competencies, security governance, and architectural patterns.'}
              </p>

              {/* Progress bar */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                  <span>Curriculum Progress: {heroCourse.progress_percent || 68}%</span>
                  <span className="text-slate-400 font-normal">Est. 18 mins remaining</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-700"
                    style={{ width: `${heroCourse.progress_percent || 68}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Launch CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                to={`/learning/${heroCourse.id}`}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl text-xs font-extrabold shadow-sm transition-all flex items-center justify-center space-x-2 hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-slate-900" />
                <span>Resume Learning</span>
              </Link>
              <Link
                to="/app/my-learning"
                className="w-full sm:w-auto px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-1.5 border border-white/10"
              >
                <span>View Syllabus</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. Microlearning & Quick Hits Shelf (Thrive Signature Feature) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-0.5">
              <Zap className="w-3.5 h-3.5" /> Microlearning Bites
            </div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">5-Minute Skill Boosts</h3>
          </div>
          <Link to="/app/explore" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
            Browse All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Zero Trust Session Revocation Patterns',
              time: '4 mins',
              category: 'Security',
              format: 'Quick Bite',
              img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=80'
            },
            {
              title: 'SCORM CMI Data Model in 180 Seconds',
              time: '3 mins',
              category: 'Standards',
              format: 'Interactive',
              img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80'
            },
            {
              title: 'Architecting for Multi-Tenant Isolation',
              time: '5 mins',
              category: 'Cloud',
              format: 'Video Bite',
              img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80'
            },
            {
              title: 'Executive Incident Response Playbook',
              time: '6 mins',
              category: 'Governance',
              format: 'Case Study',
              img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80'
            }
          ].map((bite, bIdx) => (
            <div
              key={bIdx}
              onClick={() => heroCourse && (window.location.href = `/learning/${heroCourse.id}`)}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="relative h-28 rounded-xl overflow-hidden bg-slate-900">
                  <img src={bite.img} alt={bite.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-slate-950/80 text-white backdrop-blur-xs">
                      {bite.format}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/60 text-white backdrop-blur-xs">
                    <Clock className="w-3 h-3" /> {bite.time}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider block mb-1">
                    {bite.category}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                    {bite.title}
                  </h4>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-600 font-bold">
                <span>Start bite →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Two-Column Grid: Recommended For Your Role & Social Spaces */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recommended Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Recommended For Your Role &amp; Skills Gap
              </h3>
              <p className="text-xs text-slate-500">AI-curated learning paths to accelerate your career progression</p>
            </div>
            <Link to="/app/explore" className="text-xs font-bold text-indigo-600 hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {recommendedCourses.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <img
                    src={c.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'}
                    alt={c.title}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                        {c.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{c.level}</span>
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{c.title}</h4>
                    <p className="text-[11px] text-slate-500 truncate max-w-md mt-0.5">{c.description}</p>
                  </div>
                </div>

                <Link
                  to={`/learning/${c.id}`}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-2xs flex items-center space-x-1 whitespace-nowrap flex-shrink-0"
                >
                  <span>Enroll</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Thrive Social Learning "Spaces" snippet */}
        <div className="space-y-4">
          <div className="border-b border-slate-200/80 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" /> Community Spaces
            </h3>
            <p className="text-xs text-slate-500">Collaborate with fellow engineers &amp; architects</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-900">#cloud-security</span>
                  <span className="text-[10px] text-slate-400">12m ago</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  "Has anyone implemented automated certificate rotation on Kubernetes ingress with HashiCorp Vault?"
                </p>
                <div className="flex items-center gap-2 text-[10px] text-indigo-600 font-bold pt-1">
                  <span>4 replies</span>
                  <span>•</span>
                  <span>Join thread →</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-900">#scorm-and-lxp</span>
                  <span className="text-[10px] text-slate-400">1h ago</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  "The new CMI runtime debug console makes troubleshooting suspended session data 10x faster!"
                </p>
                <div className="flex items-center gap-2 text-[10px] text-indigo-600 font-bold pt-1">
                  <span>8 replies</span>
                  <span>•</span>
                  <span>Join thread →</span>
                </div>
              </div>
            </div>

            <Link
              to="/app/announcements"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
            >
              <span>Explore All Spaces</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
