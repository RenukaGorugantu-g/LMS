import React from 'react';
import { Link } from 'react-router-dom';
import { Target, CheckCircle2, ArrowRight, BarChart3, Users } from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';

export default function SkillsPublicPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNavbar />

      <section className="py-20 bg-slate-50 border-b border-slate-200 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Competency Intelligence
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
            Close enterprise skill gaps with precision.
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Quantify workforce capabilities across a standardized 5-level proficiency scale. Map skills to roles and automatically recommend targeted learning to bridge gaps.
          </p>
          <div className="pt-4 flex items-center justify-center gap-4">
            <Link
              to="/app/skills"
              className="px-6 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-card transition flex items-center space-x-2"
            >
              <span>Explore Skills Matrix (Live)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-3">
            <Target className="w-6 h-6 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">5-Tier Proficiency Matrix</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standardized proficiency measurement from Level 1 (Foundational Knowledge) to Level 5 (Enterprise Master / Principal Practitioner).
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-3">
            <BarChart3 className="w-6 h-6 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">Automated Gap Detection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Compares a learner's current verified level against target role benchmarks and instantly generates a gap score with recommended coursework.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-3">
            <Users className="w-6 h-6 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Manager Heat Maps</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Managers and Course Creators can view aggregated team skill profiles to spot organizational vulnerabilities before strategic project rollouts.
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
