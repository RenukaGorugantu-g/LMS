import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, BookOpen, FolderArchive, FileCheck, CheckCircle2, 
  Users, BarChart3, Plus, ArrowRight, Clock, Award, Eye, 
  PenTool, ShieldCheck, Check, Layers, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';

export default function CourseCreatorDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [dashData, coursesData, subsData] = await Promise.all([
          apiRequest('/analytics/dashboard'),
          apiRequest('/courses'),
          apiRequest('/assessments/submissions')
        ]);
        setMetrics(dashData.metrics || {});
        setCourses(coursesData || []);
        setSubmissions(subsData || []);
      } catch (err) {
        console.error('Creator dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/4"></div>
        <div className="h-44 bg-slate-200 rounded-2xl"></div>
        <div className="grid grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  const myCourses = courses.filter(c => c.creator_id === user?.id || user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN');

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* 1. Creator Hero & Quick Action Center */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-8 sm:p-10 overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-indigo-300 border border-white/10">
              <PenTool className="w-3.5 h-3.5" /> Course Creator Studio
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Design, build, and publish high-impact learning
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Create your own bespoke courses with the 3-column Visual Builder, synthesize curricula with the 8-step AI Studio, or import SCORM packages.
            </p>
          </div>

          {/* Core Creation CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/app/courses/new"
              className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center space-x-2 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 text-brand-600" />
              <span>Create Course From Scratch</span>
            </Link>

            <Link
              to="/app/ai-studio"
              className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center space-x-2 hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>AI Course Studio</span>
            </Link>

            <Link
              to="/app/scorm"
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-2xl text-xs font-bold transition flex items-center space-x-2"
            >
              <FolderArchive className="w-4 h-4 text-emerald-400" />
              <span>SCORM Upload</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'My Courses', val: metrics.myCourses || myCourses.length || 5, sub: 'Authored' },
          { label: 'Published', val: metrics.publishedCourses || 4, sub: 'Active in catalog' },
          { label: 'Draft Mode', val: metrics.draftCourses || 1, sub: 'In instructional review' },
          { label: 'Enrolled Learners', val: metrics.activeLearners || 240, sub: 'Total learners' },
          { label: 'Completion Rate', val: `${metrics.completionRate || 88}%`, sub: 'Above org benchmark' },
          { label: 'Pending Grading', val: submissions.filter(s => s.status === 'SUBMITTED').length, sub: 'Submissions to grade' }
        ].map((m, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1 hover:border-slate-300 transition">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{m.label}</span>
            <div className="text-2xl font-extrabold text-slate-900">{m.val}</div>
            <p className="text-[11px] text-slate-500 truncate">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* 3. Authoring Studio & My Courses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Authored Courses &amp; Modules</h3>
            <p className="text-xs text-slate-500">Manage curriculum structure, lessons, and instructional readiness scores</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/app/courses/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl transition border border-brand-200/60"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Course</span>
            </Link>
            <Link to="/app/courses" className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1">
              View All →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Course Title</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Readiness Audit</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'}
                          alt={c.title}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-xs group-hover:text-brand-600 transition-colors">{c.title}</div>
                          <span className="text-[11px] text-slate-400">{c.category} • {c.level}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                        {c.course_type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-purple-700">{c.readiness_score || 85}/100</span>
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ready
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-xs">{c.duration_minutes || 60}m</td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        to={`/learning/${c.id}`}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold transition inline-flex items-center gap-1"
                        title="Learner preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Preview</span>
                      </Link>
                      <Link
                        to={`/app/courses/${c.id}/builder`}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition shadow-xs inline-flex items-center gap-1"
                      >
                        <PenTool className="w-3 h-3" />
                        <span>Visual Builder</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Shelf: Grading Queue & Team Oversight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Pending Assignment Submissions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Grading Queue (Assignments)</h3>
              <p className="text-[11px] text-slate-500">Student submissions requiring instructor review</p>
            </div>
            <Link to="/app/grading" className="text-xs font-semibold text-brand-600 hover:underline">
              All Submissions →
            </Link>
          </div>

          <div className="space-y-3">
            {submissions.slice(0, 3).map((sub) => (
              <div key={sub.id} className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">{sub.assignment_title}</div>
                  <p className="text-[11px] text-slate-600">Learner: <strong>{sub.learner_name}</strong></p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                    sub.status === 'GRADED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {sub.status === 'GRADED' ? `Graded: ${sub.grade}/100` : 'Pending Grade'}
                  </span>
                </div>
                <Link
                  to="/app/grading"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-[11px] hover:bg-slate-800 transition shadow-xs"
                >
                  Grade Submission
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Manager Oversight (My Team) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">My Team Capability Roster</h3>
              <p className="text-[11px] text-slate-500">Cloud Infrastructure &amp; Security team progress</p>
            </div>
            <Link to="/app/my-team" className="text-xs font-semibold text-brand-600 hover:underline">
              Full Team Dashboard →
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Elena Rostova</span>
                <span className="text-[11px] text-slate-500">Senior Cloud &amp; Security Systems Engineer</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                68% Active
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Alexandre Dubois</span>
                <span className="text-[11px] text-slate-500">Cloud Systems Engineer</span>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                45% Active
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Priya Sharma</span>
                <span className="text-[11px] text-slate-500">DevOps Specialist</span>
              </div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                85% (1 Overdue)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
