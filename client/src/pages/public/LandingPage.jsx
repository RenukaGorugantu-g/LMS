import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, CheckCircle2, Play, BarChart3, ShieldCheck, 
  Target, Layers, Award, Users, BookOpen, Clock, ChevronRight,
  TrendingUp, Compass, Cpu, FileCheck, HelpCircle, Network, Flame, Zap
} from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-500 selection:text-white font-sans">
      <PublicNavbar />

      {/* 1. HERO SECTION (Thrive-style High Impact) */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-gradient-to-b from-slate-50/70 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Social proof avatar badge */}
          <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 mb-8 shadow-2xs hover:shadow-xs transition">
            <div className="flex -space-x-2 overflow-hidden">
              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="" />
              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="" />
              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" alt="" />
            </div>
            <span>Trusted by <strong>500+ enterprises</strong> &amp; 5M+ learners</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.1]">
            Learning and development that goes <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800">beyond completions</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
            AI where it matters, human where it counts. Combine an enterprise LMS, modern LXP, AI authoring studio, SCORM 1.2/2004, skills mapping, and social learning into one unified experience.
          </p>

          {/* Primary CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 text-sm font-extrabold text-white bg-slate-900 hover:bg-slate-800 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 hover:scale-[1.02]"
            >
              <span>See MapleLMS in action →</span>
            </Link>
            <Link
              to="/ai-course-creator"
              className="w-full sm:w-auto px-7 py-4 text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-2xl transition flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Explore AI Studio</span>
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-4 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-2xl transition flex items-center justify-center space-x-1.5"
            >
              <span>⚡ 1-Click Role Switcher Demo</span>
            </Link>
          </div>

          {/* Review badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="text-amber-500">★★★★★</span> 4.9/5 on G2
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> ISO 27001 &amp; SOC2 Certified
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" /> SCORM 1.2 &amp; 2004 4th Ed.
            </span>
          </div>

          {/* HERO VISUAL: The Hub & Visual Builder Preview */}
          <div className="mt-16 max-w-5xl mx-auto rounded-3xl border border-slate-200/80 bg-white p-3 shadow-2xl">
            <div className="bg-slate-900 rounded-2xl overflow-hidden text-left border border-slate-800">
              {/* Fake top bar */}
              <div className="h-11 border-b border-slate-800 px-4 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="ml-2 font-mono text-[11px] text-slate-400">maplelms.com/hub/overview</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-700/50">
                  Live Production System
                </span>
              </div>

              {/* Dashboard Content Grid */}
              <div className="p-8 space-y-6 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
                {/* Hero Card: Continue Learning */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10 shadow-sm">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
                        Continue Learning
                      </span>
                      <span className="text-xs text-slate-400">• 18 mins remaining</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-white">
                      Zero Trust Cloud Architecture &amp; Identity Federation
                    </h3>
                    <p className="text-xs text-slate-300">
                      Module 2: Continuous Mutual TLS Handshakes and Session Verification
                    </p>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3 p-0.5 border border-slate-700">
                      <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>
                  <Link to="/learning/crs-infosec-101" className="px-6 py-3 rounded-xl bg-white text-slate-950 text-xs font-extrabold hover:bg-slate-100 flex items-center space-x-2 transition self-start md:self-auto shadow-sm">
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Resume Module</span>
                  </Link>
                </div>

                {/* 3 Metric Preview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                      <span>Skills Matrix Progress</span>
                      <Target className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-2xl font-extrabold text-white">88% Target Match</div>
                    <p className="text-[11px] text-slate-400">Zero Trust &amp; Cloud Security verified</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                      <span>SCORM Engine Telemetry</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-extrabold text-white">100% Passing</div>
                    <p className="text-[11px] text-slate-400">Real CMI commits synchronized</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                      <span>Kiki AI Content Creator</span>
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-2xl font-extrabold text-white">8-Step Studio</div>
                    <p className="text-[11px] text-slate-400">93/100 Course Readiness audit</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CLIENT LOGOS TICKER (Thrive-style Loved by teams) */}
      <section className="py-12 border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
            Empowering modern high-performance teams worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition duration-300">
            <span className="font-extrabold text-xl tracking-tighter text-slate-800">VOLVO</span>
            <span className="font-extrabold text-xl tracking-tighter text-slate-800">BRITISH AIRWAYS</span>
            <span className="font-extrabold text-xl tracking-tighter text-slate-800">BURGER KING</span>
            <span className="font-extrabold text-xl tracking-tighter text-slate-800">VODAFONE</span>
            <span className="font-extrabold text-xl tracking-tighter text-slate-800">AVON</span>
            <span className="font-extrabold text-xl tracking-tighter text-slate-800">SPECSAVERS</span>
          </div>
        </div>
      </section>

      {/* 3. FOUR EXPERIENCES GRID (Experience, Learning, Authoring, Governance) */}
      <section className="py-24 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Zap className="w-3.5 h-3.5" /> Complete Learning Ecosystem
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              One platform. Infinite ways to grow.
            </h2>
            <p className="text-base text-slate-600">
              Replace fragmented tools with a single modern workspace for learners, creators, managers, and enterprise administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1: The Hub */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">The Hub: Consumer-Grade LXP</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Personalized recommendations, daily learning streaks, 5-minute microlearning quick hits, and collaborative spaces designed to spark daily engagement.
                </p>
              </div>
              <Link to="/learning" className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1">
                Explore The Hub →
              </Link>
            </div>

            {/* Card 2: AI Course Creator */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-300 transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">AI Studio &amp; Multi-Block Builder</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Craft courses from scratch with video lectures, key takeaways callout cards, and formative quizzes—or let AI synthesize 8-step blueprints in seconds.
                </p>
              </div>
              <Link to="/ai-course-creator" className="text-xs font-bold text-purple-600 hover:underline inline-flex items-center gap-1">
                Explore Course Creation →
              </Link>
            </div>

            {/* Card 3: SCORM Compliance */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Enterprise SCORM 1.2 &amp; 2004</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  100% standards-compliant CMI runtime data tracking with real in-flight telemetry logs, manifest parsing, and verifiable digital certificates.
                </p>
              </div>
              <Link to="/scorm" className="text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1">
                Explore SCORM Engine →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-indigo-300 border border-white/10">
            Ready to upgrade your enterprise learning?
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Deliver learning that your people genuinely love.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join forward-thinking companies developing skills, driving compliance, and scaling team capabilities with MapleLMS.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl text-xs font-extrabold transition shadow-lg hover:scale-105"
            >
              Start Instant Evaluation →
            </Link>
            <Link
              to="/request-demo"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl text-xs font-bold transition"
            >
              Schedule a Custom Demo
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
