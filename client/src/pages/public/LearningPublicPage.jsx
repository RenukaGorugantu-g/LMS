import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Play, CheckCircle2, Award, Flame, Target, ArrowRight } from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';

export default function LearningPublicPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNavbar />

      <section className="py-20 bg-slate-50 border-b border-slate-200 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Learner Experience (LXP)
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
            A learning experience people actually love.
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Clean, distraction-free, and personalized. Combines high-velocity microlearning with deep certification tracks and verifiable milestones.
          </p>
          <div className="pt-4 flex items-center justify-center gap-4">
            <Link
              to="/app/learner"
              className="px-6 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-card transition flex items-center space-x-2"
            >
              <span>Explore Learner Experience (Live)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-3">
            <Play className="w-6 h-6 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">Multimodal Course Player</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Video lecture playback with variable speed, audio podcast streaming, embedded PDF viewers, rich article formatting, and full-screen SCORM modules.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-3">
            <Flame className="w-6 h-6 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">Professional Gamification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Daily learning streaks, points ledger, skill badges, and team leaderboards designed to foster healthy engagement without childish distractions.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-3">
            <Award className="w-6 h-6 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Verifiable Certificates</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Earn digitally verifiable certifications upon completing required curricula and passing summative examinations with 80%+ scores.
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
