import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, BookOpen, Layers, Award, AlertTriangle, BarChart3, 
  Download, Plus, CheckCircle2, ShieldCheck, ArrowRight 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiRequest('/analytics/dashboard');
        setData(res);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="p-8 max-w-7xl mx-auto animate-pulse space-y-6"><div className="h-10 bg-slate-200 rounded w-1/3"></div><div className="h-64 bg-slate-200 rounded-2xl"></div></div>;
  }

  const m = data?.metrics || {};
  const depts = data?.departmentPerformance || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* 1. Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Operational Administration Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organization overview for {user?.org_name || 'Acme Global Technologies'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/api/analytics/export?type=enrollments"
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Compliance CSV</span>
          </a>
          <Link
            to="/app/users"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Learners</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Learners', val: m.learners || 450, sub: 'Active personnel' },
          { label: 'Total Courses', val: m.courses || 28, sub: 'Catalog offerings' },
          { label: 'Enrollments', val: m.enrollments || 1150, sub: 'Active & completed' },
          { label: 'Completion Rate', val: `${m.completionRate || 86}%`, sub: 'Above target (80%)' },
          { label: 'Overdue Compliance', val: m.overdueLearning || 14, sub: 'Requires reminder', alert: true },
          { label: 'Certificates Issued', val: m.certificatesIssued || 380, sub: 'Verifiable records' }
        ].map((item, idx) => (
          <div key={idx} className={`p-4 rounded-xl border space-y-1 ${
            item.alert ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200 shadow-subtle'
          }`}>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{item.label}</span>
            <div className={`text-2xl font-extrabold ${item.alert ? 'text-amber-900' : 'text-slate-900'}`}>
              {item.val}
            </div>
            <p className="text-[11px] text-slate-400">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* 3. Department Performance Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Department Learning Performance</h3>
            <p className="text-[11px] text-slate-500">Benchmark completion velocity and participation across corporate divisions</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">5 Divisions Tracked</span>
        </div>

        <div className="space-y-4">
          {depts.map((d, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{d.department}</span>
                  <span className="text-[11px] text-slate-400">({d.learners} learners)</span>
                </div>
                <span className="font-extrabold text-slate-800">{d.completion}% Completed</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full ${
                    d.completion >= 90 ? 'bg-emerald-500' : d.completion >= 80 ? 'bg-brand-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${d.completion}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Two-Column Operational Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Compliance Due Date Management</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            14 learners currently have courses approaching or past official compliance due dates. Broadcast automated email reminders directly from here.
          </p>
          <div className="pt-2">
            <button
              onClick={() => alert('Automated compliance nudge broadcasted to 14 learners.')}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition"
            >
              Broadcast Due-Date Reminders →
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Enterprise AI Studio Usage</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Instructional designers have authored 5 courses with an average Course Readiness Score of 91/100.
          </p>
          <div className="pt-2">
            <Link
              to="/app/ai-studio"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition inline-block"
            >
              Open AI Authoring Studio →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
