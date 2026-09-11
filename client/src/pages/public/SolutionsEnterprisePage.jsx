import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Server, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';

export default function SolutionsEnterprisePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNavbar />

      <section className="py-20 bg-slate-50 border-b border-slate-200 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Enterprise Scale Solution
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
            Powering learning across global organizations.
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Multi-tenant architecture designed to scale seamlessly across subsidiaries, geographical regions, and independent business units.
          </p>
          <div className="pt-4 flex items-center justify-center gap-4">
            <Link to="/request-demo" className="px-6 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-card transition">
              Request Enterprise Briefing
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-3">
            <Server className="w-6 h-6 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">Tenant Data Isolation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every organization operates within an isolated tenant namespace with custom branding, localized policy configurations, and independent security perimeters.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-3">
            <Lock className="w-6 h-6 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">SSO &amp; Directory Sync</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Native SAML 2.0, OIDC, Okta, Azure AD, and Google Workspace integration with automated Just-in-Time (JIT) provisioning and SCIM group mappings.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-3">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900">Immutable Audit Trails</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every administrative action, course publication, permission assignment, and score update is logged with cryptographic timestamps for SOC-2 compliance.
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
