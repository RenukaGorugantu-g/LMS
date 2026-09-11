import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { 
  Megaphone, Plus, Bell, AlertTriangle, Info, 
  CheckCircle2, Clock, User, X, Send, Filter, RefreshCw
} from 'lucide-react';

export default function AnnouncementsAppView() {
  const { user, hasPermission } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'NORMAL'
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      setLoading(true);
      const data = await api.get('/notifications/announcements');
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    try {
      setSubmitting(true);
      await api.post('/notifications/announcements', formData);
      setShowModal(false);
      setFormData({ title: '', content: '', priority: 'NORMAL' });
      await fetchAnnouncements();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = announcements.filter(a => {
    if (priorityFilter === 'ALL') return true;
    return a.priority === priorityFilter;
  });

  const canCreate = hasPermission('org.manage') || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'COURSE_CREATOR';

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            <Megaphone className="w-4 h-4 text-blue-600" /> Enterprise Communications
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Announcements & Broadcasts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Organization-wide news, compliance deadlines, new course releases, and platform updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnnouncements}
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            title="Refresh announcements"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {canCreate && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" /> New Broadcast
            </button>
          )}
        </div>
      </div>

      {/* Priority Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
        <span className="text-xs font-semibold text-slate-400 uppercase mr-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {['ALL', 'URGENT', 'HIGH', 'NORMAL'].map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              priorityFilter === p
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Announcements Stream */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading announcements...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No announcements posted</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are no organization broadcasts matching your selection.
            </p>
          </div>
        ) : (
          filtered.map((ann) => {
            const isUrgent = ann.priority === 'URGENT';
            const isHigh = ann.priority === 'HIGH';

            return (
              <div
                key={ann.id}
                className={`bg-white rounded-2xl border transition-all p-6 shadow-xs ${
                  isUrgent
                    ? 'border-rose-300 bg-rose-50/20'
                    : isHigh
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                        isUrgent
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : isHigh
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {isUrgent && <AlertTriangle className="w-3 h-3" />}
                      {isHigh && <AlertTriangle className="w-3 h-3" />}
                      {ann.priority}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">{ann.title}</h3>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5" />
                    {ann.created_at ? new Date(ann.created_at).toLocaleDateString() : 'Recent'}
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-4">
                  {ann.content}
                </p>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                    {ann.author_name?.[0] || 'A'}
                  </div>
                  <span>Posted by <strong className="font-semibold text-slate-700">{ann.author_name || 'Admin'}</strong></span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Broadcast Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Create Organization Broadcast</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Broadcast Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Q4 Mandatory Compliance Deadline Approaching"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: 'NORMAL', label: 'Normal', color: 'border-slate-200 hover:bg-slate-50' },
                    { val: 'HIGH', label: 'High Alert', color: 'border-amber-200 hover:bg-amber-50 text-amber-800' },
                    { val: 'URGENT', label: 'Urgent Action', color: 'border-rose-200 hover:bg-rose-50 text-rose-800' }
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p.val })}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                        formData.priority === p.val
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : p.color
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Message Body
                </label>
                <textarea
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write full broadcast details, deadlines, links, and instructions..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
