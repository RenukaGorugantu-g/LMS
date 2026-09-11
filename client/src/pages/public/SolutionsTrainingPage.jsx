import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Sparkles, BookOpen, Target, ArrowRight } from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';

export default function SolutionsTrainingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNavbar />

      <section className="py-20 bg-slate-50 border-b border-slate-200 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Workforce Enablement
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
            Employee training that drives real performance.
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            From Day 1 onboarding to senior executive coaching. Build continuous capability through structured learning paths, microlearning, and personalized skill gap discovery.
          </p>
          <div className="pt-4 flex items-center justify-center gap-4">
            <Link to="/request-demo" className="px-6 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-card transition">
              Explore Enablement Frameworks
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-3">
            <BookOpen className="w-6 h-6 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">Rapid Cohort Onboarding</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automate new employee onboarding pathways with milestone check-ins, direct mentor assignments, and interactive knowledge checks.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900">AI-Powered Course Generation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enable internal subject matter experts to author production-ready training modules and quizzes in an afternoon using our dedicated AI Studio.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-3">
            <Target className="w-6 h-6 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">Targeted Upskilling</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Identify workforce capability deficiencies using our 5-tier skill matrix and automatically suggest high-impact courses to close the gaps.
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
