import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Target, Heart, ArrowRight } from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNavbar />

      <section className="py-20 bg-slate-50 border-b border-slate-200 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Our Purpose &amp; Philosophy
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Learning that moves your people forward.
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Strata was founded on a simple conviction: enterprise learning software shouldn't feel like a legacy administrative chore. It should feel fast, intelligent, and human.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-3">
            <h3 className="text-base font-bold text-slate-900">Create Better Learning</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Empower subject matter experts with intelligent AI authoring and visual course design tools that turn complex domain knowledge into structured, engaging curricula in hours.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-3">
            <h3 className="text-base font-bold text-slate-900">Deliver Intelligently</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Meet learners where they are. Personalized recommendations driven by verified skill deficiencies and role pathways, never arbitrary catalogs.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-3">
            <h3 className="text-base font-bold text-slate-900">Measure What Matters</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Move beyond vanity completion ticks. Measure actual competency acquisition, time-to-proficiency, and assessment rigor through verifiable certifications.
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
