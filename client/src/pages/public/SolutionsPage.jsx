import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Award, ArrowRight } from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNavbar />

      <section className="py-20 bg-slate-50 border-b border-slate-200 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Tailored Solutions
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
            Engineered for every enterprise learning need.
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Explore dedicated solution architectures built for global enterprise scale, continuous workforce training, and mandatory regulatory compliance.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-subtle flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Enterprise Scale</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multi-tenant architecture, custom domain mapping, SAML/SSO ready, SOC-2 Type II governance, and global CDN delivery for tens of thousands of concurrent learners.
              </p>
            </div>
            <Link to="/solutions/enterprise" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1">
              <span>Explore Enterprise Scale</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-subtle flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Employee Training</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Accelerate new hire onboarding, leadership succession pipelines, and continuous engineering upskilling with AI course authoring and personalized discovery.
              </p>
            </div>
            <Link to="/solutions/employee-training" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1">
              <span>Explore Employee Training</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-subtle flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Mandatory Compliance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated annual recertification cycles, countdown overdue notices, manager escalation workflows, and verifiable digital audit certificates.
              </p>
            </div>
            <Link to="/solutions/compliance" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1">
              <span>Explore Compliance Solutions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
