import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, XCircle, Search, Award, Calendar, Building2, User, ArrowRight } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';

export default function VerifyCertificatePage() {
  const { code: urlCode } = useParams();
  const [searchCode, setSearchCode] = useState(urlCode || 'STRATA-SEC-VERIFY-9842');
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verify = async (codeToVerify) => {
    if (!codeToVerify) return;
    setLoading(true);
    setError('');
    setCertData(null);
    try {
      const data = await apiRequest(`/certificates/verify/${encodeURIComponent(codeToVerify)}`);
      setCertData(data);
    } catch (err) {
      setError(err.message || 'Certificate verification failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlCode) {
      verify(urlCode);
    } else {
      verify('STRATA-SEC-VERIFY-9842');
    }
  }, [urlCode]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNavbar />

      <section className="py-16 bg-slate-50 border-b border-slate-200 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Official Credential Verification Authority
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Verify the authenticity and completion status of credentials issued by the Strata Learning Experience Platform.
          </p>

          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verify(searchCode);
            }}
            className="pt-4 max-w-md mx-auto flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Enter Certificate ID or Verification Code..."
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>
      </section>

      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
            <XCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-rose-900">Verification Unsuccessful</h3>
            <p className="text-xs text-rose-700 max-w-md mx-auto">{error}</p>
          </div>
        )}

        {certData && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-modal overflow-hidden animate-fade-in">
            {/* Header Status */}
            <div className="bg-emerald-50 border-b border-emerald-100 p-6 text-center space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>OFFICIALLY VERIFIED CREDENTIAL</span>
              </div>
              <p className="text-xs text-emerald-700 font-medium">
                Issued by {certData.issuer}
              </p>
            </div>

            {/* Certificate Body */}
            <div className="p-8 space-y-8">
              <div className="text-center space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">This certifies that</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{certData.learnerName}</h2>
                <p className="text-xs text-slate-500">has successfully mastered and satisfied all curriculum requirements for</p>
                <h3 className="text-lg sm:text-xl font-extrabold text-brand-900 pt-1">{certData.courseTitle}</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Organization</span>
                  <span className="font-semibold text-slate-800">{certData.organizationName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Issue Date</span>
                  <span className="font-semibold text-slate-800">{certData.issueDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Certificate #</span>
                  <span className="font-mono text-slate-800">{certData.certificateNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Grade / Score</span>
                  <span className="font-bold text-emerald-600">{certData.grade} (Passed)</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-400 gap-4">
                <span>Verified At: {new Date(certData.verifiedAt).toLocaleString()}</span>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
                >
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <PublicFooter />
    </div>
  );
}
