import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderArchive, Upload, Play, CheckCircle2, FileText, 
  Terminal, ArrowRight, RefreshCw, AlertCircle, Clock 
} from 'lucide-react';
import { apiRequest } from '../../lib/api';

export default function ScormPackagesView() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAttemptPkg, setSelectedAttemptPkg] = useState(null);
  const [attemptsList, setAttemptsList] = useState([]);

  useEffect(() => {
    loadPackages();
  }, []);

  async function loadPackages() {
    try {
      const data = await apiRequest('/scorm/packages');
      setPackages(data);
    } catch (err) {
      console.error('Failed to load SCORM packages:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('packageZip', selectedFile);

    try {
      await apiRequest('/scorm/upload', {
        method: 'POST',
        body: formData
      });
      setSelectedFile(null);
      await loadPackages();
      alert('SCORM package successfully validated, extracted, and registered!');
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleViewAttempts = async (pkg) => {
    setSelectedAttemptPkg(pkg);
    try {
      const atts = await apiRequest(`/scorm/attempts/${pkg.id}`);
      setAttemptsList(atts);
    } catch (err) {
      console.error('Failed to load attempts:', err);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <FolderArchive className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              SCORM Package Management &amp; Runtime Telemetry
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real SCORM 1.2 &amp; SCORM 2004 runtime packages with native CMI state persistence
          </p>
        </div>
      </div>

      {/* Package Upload Form */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Upload New SCORM ZIP Archive</h3>
        <p className="text-xs text-slate-500">
          Accepts standards-compliant SCORM 1.2 or SCORM 2004 ZIP packages containing <code className="text-slate-800 font-mono">imsmanifest.xml</code>.
        </p>

        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="file"
            accept=".zip"
            required
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
          />
          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-50 transition flex items-center space-x-2"
          >
            {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{uploading ? 'Processing Package...' : 'Upload & Register Package'}</span>
          </button>
        </form>
      </div>

      {/* Packages Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Registered SCORM Packages</span>
          <span className="text-xs text-slate-500">{packages.length} Active Packages</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-4">Package Title</th>
                <th className="p-4">Version</th>
                <th className="p-4">Launch Entry File</th>
                <th className="p-4">Size</th>
                <th className="p-4">Total Attempts</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-50 transition">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{pkg.title}</div>
                    <span className="text-[11px] text-slate-400 font-mono">{pkg.id}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      pkg.version === '2004' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      SCORM {pkg.version}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-600">{pkg.entry_point}</td>
                  <td className="p-4 text-slate-500">{Math.round((pkg.size_bytes || 45000) / 1024)} KB</td>
                  <td className="p-4 font-bold text-slate-800">{pkg.total_attempts || 0}</td>
                  <td className="p-4 text-right space-x-2">
                    <a
                      href={`/scorm-content/${pkg.package_dir}/${pkg.entry_point}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition inline-flex items-center space-x-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Launch SCO</span>
                    </a>
                    <button
                      onClick={() => handleViewAttempts(pkg)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition"
                    >
                      Inspect Attempts
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attempts Modal Drawer */}
      {selectedAttemptPkg && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-modal border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Learner Attempts: {selectedAttemptPkg.title}</h3>
                <span className="text-[11px] text-slate-500">SCORM {selectedAttemptPkg.version} CMI Audit</span>
              </div>
              <button
                onClick={() => setSelectedAttemptPkg(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
              {attemptsList.length === 0 ? (
                <p className="text-slate-400 text-center py-6">No learner attempts recorded yet.</p>
              ) : (
                attemptsList.map((att) => (
                  <div key={att.id} className="p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{att.learner_name} ({att.learner_email})</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        att.status === 'completed' || att.status === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {att.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center space-x-4">
                      <span>Score: <strong>{att.score_raw || att.score_scaled * 100 || 0}%</strong></span>
                      <span>Session Time: <strong>{att.session_time || '00:00:00'}</strong></span>
                      <span>Started: <strong>{new Date(att.started_at).toLocaleDateString()}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
