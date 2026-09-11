import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, CheckCircle2, ArrowRight, Download, PieChart, TrendingUp, Users } from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';

export default function AnalyticsPublicPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNavbar />

      <section className="py-20 bg-slate-50 border-b border-slate-200 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Executive Intelligence
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
            Enterprise analytics that prove learning ROI.
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Role-scoped analytics dashboards that deliver the exact insights needed by Super Admins, operational leaders, instructional authors, and individual learners.
          </p>
          <div className="pt-4 flex items-center justify-center gap-4">
            <Link
              to="/app/analytics"
              className="px-6 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-card transition flex items-center space-x-2"
            >
              <span>Explore Analytics (Live)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-2">
            <div className="text-3xl font-extrabold text-slate-900">84.2%</div>
            <p className="text-xs font-bold text-slate-700">Course Completion Rate</p>
            <p className="text-[11px] text-slate-500">Benchmark across 3 enterprise tenants</p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-2">
            <div className="text-3xl font-extrabold text-slate-900">12,850h</div>
            <p className="text-xs font-bold text-slate-700">Total Learning Delivered</p>
            <p className="text-[11px] text-slate-500">Multimodal video, SCORM &amp; labs</p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-2">
            <div className="text-3xl font-extrabold text-slate-900">94.8%</div>
            <p className="text-xs font-bold text-slate-700">Assessment Pass Rate</p>
            <p className="text-[11px] text-slate-500">Standard 80% passing threshold</p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-2">
            <div className="text-3xl font-extrabold text-slate-900">1,120</div>
            <p className="text-xs font-bold text-slate-700">Verifiable Certs Issued</p>
            <p className="text-[11px] text-slate-500">Digitally authenticated</p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
