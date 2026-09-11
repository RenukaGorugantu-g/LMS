import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, Shield, CheckCircle2, Play, Code2, ArrowRight, Terminal } from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';

export default function ScormPublicPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNavbar />

      <section className="py-20 bg-slate-50 border-b border-slate-200 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Native Runtime Standards
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
            Real SCORM 1.2 &amp; SCORM 2004 Engine.
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Not a static zip upload. Strata provides full runtime execution, manifest parsing, SCO launch detection, and persistent CMI data modeling.
          </p>
          <div className="pt-4 flex items-center justify-center gap-4">
            <Link
              to="/learning/crs-sec-101"
              className="px-6 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-card transition flex items-center space-x-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Live SCORM 1.2 Course</span>
            </Link>
            <Link
              to="/request-demo"
              className="px-6 py-3 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition"
            >
              Request Technical Spec
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SCORM 1.2 Box */}
          <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-4">
            <div className="inline-block px-3 py-1 rounded-md bg-blue-50 text-blue-800 text-xs font-bold">
              SCORM 1.2 Implementation
            </div>
            <h3 className="text-xl font-bold text-slate-900">window.API Adapter Bridge</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Exposes standard 8-method CMI JavaScript interface to child iframes. Stores lesson status, raw scores (0-100), suspend data, session time, and bookmarks with transactional commit validation.
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> <span>LMSInitialize("") &amp; LMSFinish("") lifecycle management</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> <span>LMSGetValue() / LMSSetValue() for all standard CMI keys</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> <span>LMSCommit("") with automatic backend synchronization</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> <span>LMSGetLastError() &amp; diagnostic code lookup</span></li>
            </ul>
          </div>

          {/* SCORM 2004 Box */}
          <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-subtle space-y-4">
            <div className="inline-block px-3 py-1 rounded-md bg-purple-50 text-purple-800 text-xs font-bold">
              SCORM 2004 (4th Edition)
            </div>
            <h3 className="text-xl font-bold text-slate-900">window.API_1484_11 Adapter Bridge</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full 2004 data model support including scaled scoring (-1.0 to 1.0), separate completion vs success statuses, ISO 8601 interval timing (PT5M30S), and objective sequencing.
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-purple-600" /> <span>Initialize("") &amp; Terminate("") execution</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-purple-600" /> <span>cmi.completion_status &amp; cmi.success_status tracking</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-purple-600" /> <span>cmi.score.scaled &amp; cmi.score.raw normalization</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-purple-600" /> <span>cmi.suspend_data state retention across browser sessions</span></li>
            </ul>
          </div>
        </div>

        {/* Live Debug Drawer Demo */}
        <div className="p-8 rounded-2xl border border-slate-200 bg-slate-900 text-white space-y-4 shadow-card">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold font-mono">SCORM Engine In-Flight Telemetry</h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">STATUS: COMMITTED (HTTP 200)</span>
          </div>

          <div className="font-mono text-xs text-slate-300 space-y-1.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <p className="text-slate-500">// Real-time SCORM 1.2 event trace captured from active learner session</p>
            <p className="text-slate-300">[14:32:01.210] <span className="text-brand-400">CALL</span> LMSInitialize("")</p>
            <p className="text-emerald-400">[14:32:01.215] <span className="text-emerald-400">RETN</span> LMSInitialize → "true" (Session att-9841 initialized)</p>
            <p className="text-slate-300">[14:32:01.220] <span className="text-brand-400">CALL</span> LMSGetValue("cmi.core.lesson_status")</p>
            <p className="text-emerald-400">[14:32:01.222] <span className="text-emerald-400">RETN</span> LMSGetValue → "incomplete"</p>
            <p className="text-slate-300">[14:32:01.225] <span className="text-brand-400">CALL</span> LMSGetValue("cmi.suspend_data")</p>
            <p className="text-emerald-400">[14:32:01.228] <span className="text-emerald-400">RETN</span> LMSGetValue → &apos;&#123;&quot;q1Answered&quot;:true,&quot;lastBookmark&quot;:&quot;section-2&quot;&#125;&apos;</p>
            <p className="text-purple-300">[14:35:42.810] <span className="text-purple-400">SET </span> LMSSetValue("cmi.core.score.raw", "100")</p>
            <p className="text-purple-300">[14:35:42.814] <span className="text-purple-400">SET </span> LMSSetValue("cmi.core.lesson_status", "completed")</p>
            <p className="text-amber-300">[14:35:42.820] <span className="text-amber-400">COMM</span> LMSCommit("") → Synchronized to SQLite scorm_runtime_data</p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
