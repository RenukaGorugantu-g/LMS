import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, BookOpen, Download, ArrowRight } from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';

export default function ResourcesPage() {
  const resources = [
    {
      type: 'Whitepaper',
      title: 'The Enterprise SCORM 2004 Architecture Guide',
      desc: 'Deep-dive into CMI data models, bookmarking, and sequencing in cloud native LMS architectures.',
      pages: '18 pages PDF'
    },
    {
      type: 'Playbook',
      title: 'Instructional Design with Generative AI',
      desc: 'How to formulate course blueprints, build realistic scenario assessments, and audit readiness.',
      pages: '24 pages PDF'
    },
    {
      type: 'Benchmark',
      title: '2026 Enterprise LXP & Skills Maturity Report',
      desc: 'Data benchmarks across 45,000 corporate learners evaluating skill acquisition velocity.',
      pages: '32 pages PDF'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNavbar />

      <section className="py-20 bg-slate-50 border-b border-slate-200 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Knowledge Hub
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Guides, blueprints &amp; research for modern L&amp;D.
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto text-sm">
            Curated instructional design patterns, whitepapers, and operational frameworks.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {resources.map((r, idx) => (
            <div key={idx} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 uppercase">
                  {r.type}
                </span>
                <h3 className="text-base font-bold text-slate-900">{r.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{r.desc}</p>
                <p className="text-[11px] text-slate-400 font-medium">{r.pages}</p>
              </div>
              <button
                onClick={() => alert(`Downloading ${r.title}...`)}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center justify-center space-x-2 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Guide</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
