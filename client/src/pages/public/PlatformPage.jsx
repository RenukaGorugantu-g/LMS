import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Server, Lock, Cpu, Database, Globe, CheckCircle2, ArrowRight } from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';

export default function PlatformPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNavbar />

      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Platform Architecture</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
            Enterprise infrastructure built for scale.
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Strata LXP combines multi-tenant isolation, granular role permissions, native SCORM runtime execution, and zero-compromise data governance.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-3">
            <Server className="w-6 h-6 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">Multi-Tenant Architecture</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Complete data isolation across organizations. Each tenant maintains independent branding, users, team hierarchies, course catalogs, and compliance policies.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-3">
            <Lock className="w-6 h-6 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Granular RBAC Security</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Built on 23+ fine-grained permissions. Super Admin, Operational Admin, Course Creator, and Learner receive strict, cryptographically verified capability boundaries.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-3">
            <Cpu className="w-6 h-6 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900">Embedded SCORM Bridge</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standards-compliant runtime engine exposing window.API (1.2) and window.API_1484_11 (2004) with bi-directional CMI data model persistence to relational storage.
            </p>
          </div>
        </div>

        {/* Visual Architecture Topology */}
        <div className="p-8 rounded-2xl border border-slate-200 bg-slate-900 text-white space-y-6 shadow-card">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold">Strata LXP Architectural Topology</h3>
            <p className="text-xs text-slate-400">Layered enterprise SaaS blueprint</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="text-brand-400 font-bold block">1. Presentation Layer</span>
              <p className="text-slate-300 font-sans text-[11px]">React 19 SPA, Tailwind CSS design system, responsive viewports, and WCAG accessibility standards.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="text-purple-400 font-bold block">2. Intelligence Layer</span>
              <p className="text-slate-300 font-sans text-[11px]">AI Course Creator studio, blueprint heuristics, real-time Copilot mutations, and Course Readiness audits.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="text-emerald-400 font-bold block">3. Execution Layer</span>
              <p className="text-slate-300 font-sans text-[11px]">Real SCORM 1.2/2004 runtime bridge, multimodal video/audio player, timed exam engine, and certificate signer.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="text-amber-400 font-bold block">4. Persistence Layer</span>
              <p className="text-slate-300 font-sans text-[11px]">Relational SQLite engine with foreign keys, indexes, CMI tracking, immutable audit trails, and multi-tenant scoping.</p>
            </div>
          </div>
        </div>

        <div className="text-center pt-8">
          <Link to="/request-demo" className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition">
            <span>Schedule Architecture Review</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
