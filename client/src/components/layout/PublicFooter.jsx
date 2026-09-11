import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Globe2, Sparkles, ArrowUpRight } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Col 1: Brand */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-base">
                🍁
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="font-bold text-lg tracking-tight text-white">Maple<span className="text-red-500">LMS</span></span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-red-400">Enterprise</span>
              </div>
            </Link>
            <p className="text-slate-400 max-w-sm leading-relaxed text-[13px]">
              The intelligent enterprise learning management and experience platform. Create, deliver, manage and measure learning from one unified system.
            </p>
            <div className="pt-2 flex items-center space-x-3 text-slate-400 text-xs">
              <span className="flex items-center space-x-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> <span>SOC-2 Type II</span></span>
              <span>•</span>
              <span className="flex items-center space-x-1"><Lock className="w-3.5 h-3.5 text-brand-400" /> <span>GDPR &amp; ISO 27001</span></span>
              <span>•</span>
              <span className="flex items-center space-x-1"><Globe2 className="w-3.5 h-3.5 text-blue-400" /> <span>Global CDN</span></span>
            </div>
          </div>

          {/* Col 2: Platform */}
          <div className="space-y-3">
            <p className="font-semibold text-white uppercase text-[11px] tracking-wider">Platform</p>
            <ul className="space-y-2">
              <li><Link to="/platform" className="hover:text-white transition">Platform Overview</Link></li>
              <li><Link to="/ai-course-creator" className="hover:text-white transition">AI Course Creator</Link></li>
              <li><Link to="/learning" className="hover:text-white transition">Learner Experience (LXP)</Link></li>
              <li><Link to="/learning-paths" className="hover:text-white transition">Learning Paths</Link></li>
              <li><Link to="/scorm" className="hover:text-white transition">SCORM 1.2 &amp; 2004 Engine</Link></li>
              <li><Link to="/skills" className="hover:text-white transition">Skills &amp; Competencies</Link></li>
              <li><Link to="/analytics" className="hover:text-white transition">Enterprise Analytics</Link></li>
            </ul>
          </div>

          {/* Col 3: Solutions */}
          <div className="space-y-3">
            <p className="font-semibold text-white uppercase text-[11px] tracking-wider">Solutions</p>
            <ul className="space-y-2">
              <li><Link to="/solutions/enterprise" className="hover:text-white transition">Enterprise Scale</Link></li>
              <li><Link to="/solutions/employee-training" className="hover:text-white transition">Employee Enablement</Link></li>
              <li><Link to="/solutions/compliance" className="hover:text-white transition">Mandatory Compliance</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition">Pricing &amp; Packaging</Link></li>
              <li><Link to="/request-demo" className="hover:text-white transition">Request Interactive Demo</Link></li>
              <li><Link to="/login" className="hover:text-white text-brand-400 font-semibold transition">Quick Role Switcher</Link></li>
            </ul>
          </div>

          {/* Col 4: Company & Trust */}
          <div className="space-y-3">
            <p className="font-semibold text-white uppercase text-[11px] tracking-wider">Company &amp; Legal</p>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-white transition">About MapleLMS</Link></li>
              <li><Link to="/resources" className="hover:text-white transition">Resource Center</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact Sales &amp; Support</Link></li>
              <li><span className="text-slate-500">Security &amp; Encryption</span></li>
              <li><span className="text-slate-500">Privacy Policy</span></li>
              <li><span className="text-slate-500">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} MapleLMS Learning Technologies Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span>Philosophy: "Learning that moves your people forward."</span>
            <Link to="/login" className="text-brand-400 hover:text-brand-300 flex items-center space-x-1">
              <span>Launch LMS App</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
