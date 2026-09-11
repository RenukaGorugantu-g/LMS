import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, Download, Share2, ExternalLink, ShieldCheck, Calendar, ArrowRight } from 'lucide-react';
import { apiRequest } from '../../lib/api';

export default function CertificatesAppView() {
  const [certificates, setCertificates] = useState([]);
  const [activeCert, setActiveCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCerts() {
      try {
        const data = await apiRequest('/certificates');
        setCertificates(data);
      } catch (err) {
        console.error('Certificates load failed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCerts();
  }, []);

  if (loading) {
    return <div className="p-8 max-w-7xl mx-auto animate-pulse space-y-4"><div className="h-10 bg-slate-200 rounded w-1/4"></div></div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Award className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Official Certificates &amp; Verifiable Credentials
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Digitally signed enterprise credentials verified by the MapleLMS Credential Authority
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle hover:shadow-card transition flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  Verified Credential
                </span>
                <span className="text-xs text-slate-400 font-mono">{cert.issue_date}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{cert.course_title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Issued to: <strong>{cert.learner_name}</strong></p>
                <p className="text-[11px] text-slate-400 font-mono mt-2">ID: {cert.certificate_number}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <a
                href={`/verify/${cert.verification_code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 font-semibold hover:underline flex items-center space-x-1"
              >
                <span>Public Verification</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => setActiveCert(cert)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
              >
                View Certificate
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Printable Certificate Modal */}
      {activeCert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full space-y-8 shadow-2xl border-4 border-slate-900">
            {/* Certificate Graphic Frame */}
            <div className="border-2 border-slate-200 p-8 rounded-2xl text-center space-y-6 bg-slate-50/40 relative">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center justify-center">🍁</div>
                  <span className="font-bold text-sm tracking-wider text-slate-900">MAPLELMS CREDENTIAL AUTHORITY</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">{activeCert.certificate_number}</span>
              </div>

              <div className="space-y-3 py-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block">Certificate of Completion</span>
                <p className="text-xs text-slate-500">This certifies that</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{activeCert.learner_name}</h2>
                <p className="text-xs text-slate-500">has successfully mastered all curricular competencies for</p>
                <h3 className="text-lg font-bold text-brand-900">{activeCert.course_title}</h3>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-[11px] text-slate-600">
                <div>
                  <span className="font-bold block text-slate-900">{activeCert.organization_name}</span>
                  <span className="text-slate-400">Accredited Organization</span>
                </div>
                <div>
                  <span className="font-bold block text-slate-900">{activeCert.issue_date}</span>
                  <span className="text-slate-400">Date of Issuance</span>
                </div>
                <div>
                  <span className="font-bold block text-emerald-600">Verified Authentic</span>
                  <span className="text-slate-400">Tamper-Evident Sign</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Download PDF</span>
              </button>
              <button
                onClick={() => setActiveCert(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
