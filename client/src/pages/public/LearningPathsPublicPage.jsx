import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, CheckCircle2, ArrowRight, BookOpen, Award, Target } from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';

export default function LearningPathsPublicPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNavbar />

      <section className="py-20 bg-slate-50 border-b border-slate-200 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Curated Journeys
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
            Structured Learning Paths that build mastery.
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Guide employees from foundational understanding to advanced leadership through structured multi-course roadmaps.
          </p>
          <div className="pt-4 flex items-center justify-center gap-4">
            <Link
              to="/app/learning-paths"
              className="px-6 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-card transition flex items-center space-x-2"
            >
              <span>Explore Paths in App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Executive Technology Leadership & Architecture',
              role: 'Principal Architect / Engineering Director',
              hours: '18 hours',
              courses: ['Cloud Native Architecture', 'Enterprise Security & Zero Trust', 'Strategic Decision Making'],
              badge: 'Flagship'
            },
            {
              title: 'Enterprise Security & Compliance Mastery',
              role: 'Security Engineer / SOC Analyst',
              hours: '12 hours',
              courses: ['Information Security 101', 'Global Compliance & Ethics 2026'],
              badge: 'Mandatory'
            },
            {
              title: 'Applied Enterprise AI Engineering & Ops',
              role: 'AI / ML Engineer',
              hours: '15 hours',
              courses: ['Generative AI in Enterprise Workflows', 'Cloud Native Architecture'],
              badge: 'Emerging'
            }
          ].map((path, idx) => (
            <div key={idx} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">{path.badge}</span>
                <h3 className="text-base font-bold text-slate-900">{path.title}</h3>
                <p className="text-xs text-slate-500 font-medium">Target: {path.role} • {path.hours}</p>
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Curriculum Sequence:</p>
                  {path.courses.map((c, cIdx) => (
                    <div key={cIdx} className="text-xs text-slate-700 flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold flex items-center justify-center">{cIdx + 1}</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link to="/app/learning-paths" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1">
                <span>View Learning Pathway</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
