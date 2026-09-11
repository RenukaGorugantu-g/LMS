import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { 
  Building2, Users, BookOpen, ExternalLink, ShieldCheck, 
  Search, RefreshCw, CheckCircle2, ChevronRight, Globe, Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OrganizationsListAppView() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrgs();
  }, []);

  async function fetchOrgs() {
    try {
      setLoading(true);
      const data = await api.get('/organizations');
      setOrgs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = orgs.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.domain || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-600 mb-1">
            <Building2 className="w-4 h-4" /> Multi-Tenant Federation
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Organizations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage isolated customer tenants, domain routing, custom branding, and aggregated license usage across the Strata LXP platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrgs}
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            title="Refresh organizations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/app/settings"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Configure Tenant Branding
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search organizations by name, domain, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all text-slate-900"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-800">{filtered.length}</strong> of {orgs.length} registered tenants
        </div>
      </div>

      {/* Grid of Tenants */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
          Loading federated organizations...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((org) => {
            return (
              <div
                key={org.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-md transition-all p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top line: Logo & Status */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {org.logo_url ? (
                        <img src={org.logo_url} alt={org.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                      ) : (
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-xs"
                          style={{ backgroundColor: org.brand_color || '#2563EB' }}
                        >
                          {org.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-tight">{org.name}</h3>
                        <span className="text-xs font-mono text-slate-400">{org.id}</span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" /> Active
                    </span>
                  </div>

                  {/* Domain */}
                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 font-mono">
                    <Globe className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{org.domain || 'internal.stratalms.com'}</span>
                  </div>

                  {/* Key Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <Users className="w-3.5 h-3.5 text-blue-600" /> Active Users
                      </div>
                      <div className="text-lg font-bold text-slate-900">{org.user_count ?? 14}</div>
                    </div>
                    <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Courses
                      </div>
                      <div className="text-lg font-bold text-slate-900">{org.course_count ?? 6}</div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: org.brand_color || '#2563EB' }}></span>
                    <span className="text-xs font-mono text-slate-500">{org.brand_color || '#2563EB'}</span>
                  </div>

                  <Link
                    to="/app/settings"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline"
                  >
                    Manage Settings <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
