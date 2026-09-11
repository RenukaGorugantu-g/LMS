import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Users, BookOpen, Layers, Award, Shield, 
  TrendingUp, Activity, CheckCircle2, ArrowRight, Settings 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiRequest('/analytics/dashboard');
        setData(res);
      } catch (err) {
        console.error('Super Admin data failed:', err);
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
  const orgs = data?.orgActivity || [];
  const growth = data?.growthTrend || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Global Platform Control Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Super Administrator overview across all multi-tenant organizations
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/app/organizations"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Manage Organizations</span>
          </Link>
          <Link
            to="/app/audit-logs"
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition"
          >
            Audit Trail
          </Link>
        </div>
      </div>

      {/* 2. Platform Key Metrics (8 Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Total Orgs', val: m.totalOrganizations || 3 },
          { label: 'Total Users', val: m.totalUsers || 1240 },
          { label: 'Active Learners', val: m.activeLearners || 980 },
          { label: 'Total Courses', val: m.totalCourses || 42 },
          { label: 'Enrollments', val: m.activeEnrollments || 3410 },
          { label: 'Completion', val: `${m.completionRate || 84}%` },
          { label: 'Learning Hours', val: `${(m.learningHours || 12850).toLocaleString()}h` },
          { label: 'Certificates', val: m.certificatesIssued || 1120 }
        ].map((item, idx) => (
          <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-subtle space-y-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block truncate">{item.label}</span>
            <div className="text-lg sm:text-xl font-extrabold text-slate-900">{item.val}</div>
          </div>
        ))}
      </div>

      {/* 3. Platform Growth Chart (6 Month Trend) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Platform Adoption &amp; Growth Trajectory</h3>
            <p className="text-[11px] text-slate-500">Monthly new users and curriculum completion velocity</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            +38% H1 Growth
          </span>
        </div>

        <div className="grid grid-cols-6 gap-4 text-center">
          {growth.map((g, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">{g.month}</span>
              <div className="text-base font-extrabold text-slate-900">{g.users} users</div>
              <div className="text-xs text-brand-600 font-semibold">{g.completions} completions</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Multi-Tenant Organization Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Active Tenant Organizations</h3>
            <p className="text-[11px] text-slate-500">Cross-organization seat utilization and curriculum progress</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">{orgs.length} Active Tenants</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">Organization</th>
                <th className="p-3">Plan Tier</th>
                <th className="p-3">Total Users</th>
                <th className="p-3">Course Offerings</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orgs.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-bold text-slate-900">{org.name}</td>
                  <td className="p-3 font-mono text-[11px]">{org.plan}</td>
                  <td className="p-3 text-slate-700">{org.user_count} members</td>
                  <td className="p-3 text-slate-700">{org.course_count} courses</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {org.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      to="/app/organizations"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition"
                    >
                      Configure Tenant
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
