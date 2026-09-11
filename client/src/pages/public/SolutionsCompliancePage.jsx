import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ShieldCheck, Clock, FileCheck, CheckCircle2 } from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';

export default function SolutionsCompliancePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNavbar />

      <section className="py-20 bg-slate-50 border-b border-slate-200 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Regulatory Compliance
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
            Frictionless compliance. Audit-ready 365 days a year.
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Eliminate compliance chasing. Automated recertification cycles, countdown reminders, manager escalation dashboards, and verifiable digital certificates.
          </p>
          <div className="pt-4 flex items-center justify-center gap-4">
            <Link to="/learning/crs-comp-401" className="px-6 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-card transition">
              Preview Mandatory Compliance Course
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-3">
            <Clock className="w-6 h-6 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">Automated Expiry Tracking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Define 1-year or 2-year certification validity. Strata automatically alerts learners 30, 14, and 3 days before renewal deadlines.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-3">
            <Award className="w-6 h-6 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">Verifiable Digital Certificates</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every completed compliance course issues a unique certificate number with a live public verification code and downloadable PDF.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">1-Click Auditor Reports</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generate comprehensive CSV exports of learner completion records, time spent, and assessment scores ready for external ISO, SOC-2, and OSHA audits.
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
