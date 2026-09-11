import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, FileText, Cpu, Compass, BookOpen } from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';

export default function AiCourseCreatorPublicPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNavbar />

      <section className="py-20 bg-slate-50 border-b border-slate-200 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Intelligent Instructional Studio
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
            Create learning in hours, not weeks.
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Turn raw ideas, PDFs, or strategic topics into production-ready course blueprints, rich lessons, case studies, and assessments with instructional rigor.
          </p>
          <div className="pt-4 flex items-center justify-center gap-4">
            <Link
              to="/app/ai-studio"
              className="px-6 py-3 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-card transition flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch AI Studio (Live)</span>
            </Link>
            <Link
              to="/request-demo"
              className="px-6 py-3 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition"
            >
              Request Live Walkthrough
            </Link>
          </div>
        </div>
      </section>

      {/* 8-Stage Authoring Pipeline */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">The 8-Stage Instructional Workflow</h2>
          <p className="text-xs text-slate-500">Every AI-authored course follows rigorous pedagogical principles before publication.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', name: 'Idea & Topic Ingestion', desc: 'Accepts prompts, documents, or strategic competency requirements.' },
            { step: '02', name: 'Curriculum Blueprint', desc: 'Synthesizes title, target audience, estimated hours, and module scaffolding.' },
            { step: '03', name: 'Multi-Modal Lessons', desc: 'Drafts in-depth lessons with executive axioms, diagrams, and video frameworks.' },
            { step: '04', name: 'Activities & Scenarios', desc: 'Constructs real-world business case studies and decision-tree simulations.' },
            { step: '05', name: 'Assessment & Rubrics', desc: 'Generates formative quizzes, plausible distractors, and practical assignment briefs.' },
            { step: '06', name: 'Contextual AI Copilot', desc: 'Refine modules on demand: "Rewrite for senior executives" or "Add practical CLI lab".' },
            { step: '07', name: 'Course Readiness Audit', desc: 'Evaluates instructional alignment, engagement, and assigns an objective score (e.g. 88/100).' },
            { step: '08', name: 'Human Approval & Publish', desc: 'Mandatory instructional designer sign-off before learner enrollment. Never auto-publishes.' }
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-2">
              <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">{item.step}</span>
              <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Readiness Score Visual */}
        <div className="p-8 rounded-2xl border border-slate-200 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-card">
          <div className="space-y-3 max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Quality Assurance Engine</span>
            <h3 className="text-2xl font-bold">Course Readiness Score™</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every course created with Strata AI undergoes an automated 7-dimension instructional design audit. Assess content quality, objective alignment, pacing, accessibility, and assessment rigor.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2 flex-shrink-0 w-48">
            <div className="text-4xl font-extrabold text-purple-400">88/100</div>
            <div className="text-xs font-bold text-emerald-400">● READY TO PUBLISH</div>
            <p className="text-[10px] text-slate-500">7 of 7 audits passed</p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
