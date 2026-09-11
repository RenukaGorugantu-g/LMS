import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, FileCheck, Layers, Target, BarChart3, Award, 
  Trophy, Users, Smartphone, Building2, Shield, ArrowRight, CheckCircle2 
} from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';

export default function FeaturesPage() {
  const [filter, setFilter] = useState('ALL');

  const categories = ['ALL', 'AUTHORING', 'DELIVERY', 'ANALYTICS', 'ENTERPRISE'];

  const features = [
    {
      title: 'AI Course Creator Studio',
      category: 'AUTHORING',
      desc: 'Dedicated 8-step authoring workflow: Idea → Blueprint → Curriculum → Content → Activities → Assessment → Review → Publish. Never auto-publishes without human sign-off.',
      icon: Sparkles,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      title: 'Native SCORM 1.2 & 2004 Engine',
      category: 'DELIVERY',
      desc: 'True runtime tracking with attempts, launches, score raw/scaled, suspend data bookmarking, and session synchronization back to relational storage.',
      icon: FileCheck,
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      title: 'Sequential Learning Paths',
      category: 'DELIVERY',
      desc: 'Curated pathways combining prerequisite courses, elective tracks, milestone assessments, and cumulative path certifications.',
      icon: Layers,
      color: 'text-brand-600 bg-brand-50'
    },
    {
      title: 'Skills & Competency Frameworks',
      category: 'ENTERPRISE',
      desc: '5-level proficiency scale (Novice to Master). Automatic gap detection comparing current learner capabilities to target role profiles.',
      icon: Target,
      color: 'text-amber-600 bg-amber-50'
    },
    {
      title: '8 Assessment Question Types',
      category: 'AUTHORING',
      desc: 'Single choice, multiple choice, true/false, short answer, long answer, matching pairs, sequence ordering, and branching scenario cases.',
      icon: FileCheck,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'Role-Aware Enterprise Analytics',
      category: 'ANALYTICS',
      desc: 'Custom metrics for each role: Platform health for Super Admin, department performance for Admin, course engagement for Creator, and personal progress for Learner.',
      icon: BarChart3,
      color: 'text-indigo-600 bg-indigo-50'
    },
    {
      title: 'Verifiable Digital Certificates',
      category: 'DELIVERY',
      desc: 'Cryptographically verifiable credentials with unique certificate numbers, QR codes, public verification URL, and PDF print export.',
      icon: Award,
      color: 'text-teal-600 bg-teal-50'
    },
    {
      title: 'Enterprise Gamification',
      category: 'DELIVERY',
      desc: 'Points ledger, daily learning streaks, milestone badges, and opt-in professional leaderboards designed for corporate environments.',
      icon: Trophy,
      color: 'text-rose-600 bg-rose-50'
    },
    {
      title: 'Manager "My Team" Oversight',
      category: 'ENTERPRISE',
      desc: 'Team roster with progress bars, overdue compliance alerts, one-click email nudges, and assignment grading with rubrics.',
      icon: Users,
      color: 'text-sky-600 bg-sky-50'
    },
    {
      title: 'Multi-Tenant Architecture',
      category: 'ENTERPRISE',
      desc: 'Isolated tenant data, custom organization subdomains, branded accent palettes, independent catalogs, and cross-tenant Super Admin.',
      icon: Building2,
      color: 'text-orange-600 bg-orange-50'
    },
    {
      title: 'Audit Logs & Governance',
      category: 'ENTERPRISE',
      desc: 'Immutable audit trails recording user logins, course publications, permission modifications, and grading events for ISO/SOC-2 audits.',
      icon: Shield,
      color: 'text-violet-600 bg-violet-50'
    },
    {
      title: 'Mobile-Responsive Experience',
      category: 'DELIVERY',
      desc: 'Optimized touch navigation, responsive video/SCORM players, offline-capable layout, and seamless desktop-to-mobile handoffs.',
      icon: Smartphone,
      color: 'text-slate-600 bg-slate-50'
    }
  ];

  const filteredFeatures = filter === 'ALL' ? features : features.filter(f => f.category === filter);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNavbar />

      <section className="py-20 bg-slate-50 border-b border-slate-200 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Capabilities Catalog</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
            Every feature engineered for modern learning.
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Explore the complete suite of LMS and LXP capabilities built to power enterprise workforce transformation.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition ${
                  filter === cat
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feat, idx) => (
            <div key={idx} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle hover:shadow-card transition space-y-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feat.color}`}>
                <feat.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-2xl border border-slate-200 bg-slate-900 text-white text-center space-y-4">
          <h3 className="text-2xl font-bold">Ready to evaluate Strata in your environment?</h3>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            Test all features live using our instant 1-click role switcher across Learner, Course Creator, Admin, and Super Admin.
          </p>
          <div className="pt-2">
            <Link to="/login" className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition">
              <span>Launch Live Evaluation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
