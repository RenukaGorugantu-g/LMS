import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { 
  Building2, Globe, Palette, ShieldCheck, CheckCircle2, 
  AlertCircle, Save, Sliders, RefreshCw, Upload, Sparkles, Layers
} from 'lucide-react';

export default function OrganizationSettingsAppView() {
  const { user } = useAuth();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    brandColor: '#2563EB',
    logoUrl: '',
    scormStrictTracking: true,
    autoCertificates: true,
    aiAuthoringEnabled: true,
    selfEnrollment: false,
    gamificationLeaderboard: true
  });

  useEffect(() => {
    fetchOrg();
  }, [user]);

  async function fetchOrg() {
    try {
      setLoading(true);
      const res = await api.get(`/organizations/${user?.org_id || 'org-acme'}`);
      setOrg(res);
      const s = res.settings || {};
      setFormData({
        name: res.name || '',
        domain: res.domain || '',
        brandColor: res.brand_color || '#2563EB',
        logoUrl: res.logo_url || '',
        scormStrictTracking: s.scormStrictTracking !== false,
        autoCertificates: s.autoCertificates !== false,
        aiAuthoringEnabled: s.aiAuthoringEnabled !== false,
        selfEnrollment: s.selfEnrollment === true,
        gamificationLeaderboard: s.gamificationLeaderboard !== false
      });
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load organization settings.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const payload = {
        name: formData.name,
        domain: formData.domain,
        brandColor: formData.brandColor,
        logoUrl: formData.logoUrl,
        settings: {
          scormStrictTracking: formData.scormStrictTracking,
          autoCertificates: formData.autoCertificates,
          aiAuthoringEnabled: formData.aiAuthoringEnabled,
          selfEnrollment: formData.selfEnrollment,
          gamificationLeaderboard: formData.gamificationLeaderboard
        }
      };

      await api.put(`/organizations/${user?.org_id || 'org-acme'}`, payload);
      setSuccessMsg('Organization settings updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update organization settings.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
          <Building2 className="w-4 h-4" /> Multi-Tenant Architecture
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organization & Branding</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure multi-tenant brand customization, domain isolation, SCORM runtime compliance, and AI authoring policies.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form settings */}
        <div className="lg:col-span-2 space-y-8">
          {/* Identity & Domain Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" /> Organization Identity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Company / Tenant Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Dedicated Subdomain / FQDN
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="learn.company.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-mono text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Brand Logo URL (SVG or PNG)
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.svg"
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-mono text-xs text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120&fit=crop' })}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Use Sample
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Primary Brand Accent Color
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={formData.brandColor}
                  onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                  className="w-12 h-10 p-1 bg-white border border-slate-200 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.brandColor}
                  onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                  className="w-32 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase text-slate-800"
                />
                <div className="flex gap-2">
                  {['#2563EB', '#0D9488', '#7C3AED', '#EA580C', '#059669', '#0F172A'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, brandColor: c })}
                      className="w-7 h-7 rounded-lg border border-slate-200 hover:scale-110 transition-transform shadow-xs"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Governance & Policies Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" /> Platform Policies & Engine Controls
            </h2>

            <div className="space-y-4 divide-y divide-slate-100">
              <div className="pt-2 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">SCORM Strict Telemetry Enforcement</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Require compliant CMI runtime commit verification before marking SCORM 1.2 and 2004 lessons completed.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.scormStrictTracking}
                  onChange={(e) => setFormData({ ...formData, scormStrictTracking: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
              </div>

              <div className="pt-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Automated Verifiable Certificate Issuance</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Automatically generate cryptographically hashed certificates upon 100% curriculum completion and passing score.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoCertificates}
                  onChange={(e) => setFormData({ ...formData, autoCertificates: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
              </div>

              <div className="pt-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">AI Studio & Copilot Authoring</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Allow course creators to utilize the 8-step AI course synthesizer and live copilot drawer for blueprints.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.aiAuthoringEnabled}
                  onChange={(e) => setFormData({ ...formData, aiAuthoringEnabled: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
              </div>

              <div className="pt-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Enterprise Gamification & Leaderboard</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Enable XP point tallies, milestone badges, daily streak tracking, and team rankings.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.gamificationLeaderboard}
                  onChange={(e) => setFormData({ ...formData, gamificationLeaderboard: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
              </div>

              <div className="pt-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Open Catalog Self-Enrollment</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Allow authenticated learners to freely enroll in optional elective courses without manager approval.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.selfEnrollment}
                  onChange={(e) => setFormData({ ...formData, selfEnrollment: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving Changes...' : 'Save Organization Settings'}
            </button>
          </div>
        </div>

        {/* Right 1 Col: Live Brand Preview */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 sticky top-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Brand Preview</h3>
            
            <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Mock Header */}
              <div 
                className="p-4 text-white flex items-center justify-between transition-colors"
                style={{ backgroundColor: formData.brandColor }}
              >
                <div className="flex items-center gap-2.5">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo" className="w-7 h-7 rounded object-cover bg-white/20" />
                  ) : (
                    <div className="w-7 h-7 rounded bg-white/20 flex items-center justify-center font-bold text-xs">
                      {formData.name?.slice(0, 2).toUpperCase() || 'ST'}
                    </div>
                  )}
                  <span className="font-bold text-sm tracking-tight">{formData.name || 'Organization'}</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded">
                  Enterprise LXP
                </span>
              </div>

              {/* Mock Body */}
              <div className="p-4 bg-slate-50 space-y-3">
                <div className="h-3 bg-slate-200 rounded-full w-2/3"></div>
                <div className="h-2.5 bg-slate-200 rounded-full w-4/5"></div>
                <div className="pt-2 flex items-center gap-2">
                  <div 
                    className="px-3 py-1 text-[11px] font-semibold text-white rounded-md"
                    style={{ backgroundColor: formData.brandColor }}
                  >
                    Primary Action
                  </div>
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-md">
                    Secondary
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-2 border-t border-slate-100 pt-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Tenant ID:</span>
                <span className="font-mono text-slate-700">{user?.org_id || 'org-acme'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Tier:</span>
                <span className="font-semibold text-emerald-600">Enterprise Dedicated</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Isolated Storage:</span>
                <span className="font-mono text-slate-700">AES-256 GCM</span>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" /> Multi-Tenant Isolation
              </div>
              <p className="text-blue-700 text-[11px] leading-relaxed">
                All learners, course catalogs, SCORM tracking commits, and analytics are scoped strictly to this organization ID.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
