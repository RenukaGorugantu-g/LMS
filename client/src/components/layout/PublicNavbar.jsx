import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronDown, ArrowRight, Menu, X, Sparkles, ShieldCheck, 
  Users, Award, BookOpen, Layers, BarChart3, Compass 
} from 'lucide-react';

export default function PublicNavbar() {
  const [platformOpen, setPlatformOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Lockup */}
        <Link to="/" className="flex items-center space-x-2.5 group flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
            🍁
          </div>
          <div className="flex items-center space-x-2 whitespace-nowrap">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 whitespace-nowrap">
              Maple<span className="text-red-600">LMS</span>
            </span>
            <span className="hidden sm:inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200/80 uppercase tracking-wider whitespace-nowrap">
              Enterprise LXP
            </span>
          </div>
        </Link>

        {/* Desktop Navigation - 4 Clean & Focused Menus */}
        <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-slate-600">
          
          {/* Platform Capabilities Dropdown */}
          <div 
            className="relative" 
            onMouseEnter={() => setPlatformOpen(true)} 
            onMouseLeave={() => setPlatformOpen(false)}
          >
            <button className="flex items-center space-x-1.5 hover:text-slate-900 py-2 transition whitespace-nowrap">
              <span>Platform</span>
              <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${platformOpen ? 'rotate-180' : ''}`} />
            </button>
            {platformOpen && (
              <div className="absolute left-0 mt-1 w-80 bg-white rounded-2xl shadow-modal border border-slate-200/90 p-2 z-50 animate-fade-in">
                <Link to="/platform" className="p-2.5 rounded-xl hover:bg-slate-50 flex items-start space-x-3 transition">
                  <Layers className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Platform Overview</div>
                    <div className="text-[11px] text-slate-500">Unified LMS, LXP, and modern enterprise learning</div>
                  </div>
                </Link>
                <Link to="/scorm" className="p-2.5 rounded-xl hover:bg-slate-50 flex items-start space-x-3 transition">
                  <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">SCORM 1.2 / 2004 Engine</div>
                    <div className="text-[11px] text-slate-500">Standards-compliant runtime with package inspector</div>
                  </div>
                </Link>
                <Link to="/skills" className="p-2.5 rounded-xl hover:bg-slate-50 flex items-start space-x-3 transition">
                  <Compass className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Skills Matrix &amp; Mapping</div>
                    <div className="text-[11px] text-slate-500">Role-based competencies, gap analysis, and growth</div>
                  </div>
                </Link>
                <Link to="/learning-paths" className="p-2.5 rounded-xl hover:bg-slate-50 flex items-start space-x-3 transition">
                  <BookOpen className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Learning Pathways</div>
                    <div className="text-[11px] text-slate-500">Curated step-by-step career and certification tracks</div>
                  </div>
                </Link>
                <Link to="/analytics" className="p-2.5 rounded-xl hover:bg-slate-50 flex items-start space-x-3 transition">
                  <BarChart3 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Enterprise Analytics</div>
                    <div className="text-[11px] text-slate-500">Audit-ready compliance dashboards and learner metrics</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Solutions Dropdown */}
          <div 
            className="relative" 
            onMouseEnter={() => setSolutionsOpen(true)} 
            onMouseLeave={() => setSolutionsOpen(false)}
          >
            <button className="flex items-center space-x-1.5 hover:text-slate-900 py-2 transition whitespace-nowrap">
              <span>Solutions</span>
              <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${solutionsOpen ? 'rotate-180' : ''}`} />
            </button>
            {solutionsOpen && (
              <div className="absolute left-0 mt-1 w-80 bg-white rounded-2xl shadow-modal border border-slate-200/90 p-2 z-50 animate-fade-in">
                <Link to="/solutions/enterprise" className="p-2.5 rounded-xl hover:bg-slate-50 flex items-start space-x-3 transition">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Enterprise LMS / LXP</div>
                    <div className="text-[11px] text-slate-500">Multi-tenant, SSO &amp; compliance governance</div>
                  </div>
                </Link>
                <Link to="/solutions/employee-training" className="p-2.5 rounded-xl hover:bg-slate-50 flex items-start space-x-3 transition">
                  <Users className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Workforce Upskilling</div>
                    <div className="text-[11px] text-slate-500">Onboarding, upskilling &amp; career journeys</div>
                  </div>
                </Link>
                <Link to="/solutions/compliance" className="p-2.5 rounded-xl hover:bg-slate-50 flex items-start space-x-3 transition">
                  <Award className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Compliance &amp; Certifications</div>
                    <div className="text-[11px] text-slate-500">Audit-ready tracking with verifiable certs</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* AI Studio Link */}
          <Link 
            to="/ai-course-creator" 
            className="flex items-center space-x-1.5 text-indigo-600 hover:text-indigo-800 transition whitespace-nowrap group"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span>AI Studio</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/80 uppercase tracking-wider">
              NEW
            </span>
          </Link>

          {/* Pricing */}
          <Link to="/pricing" className="hover:text-slate-900 transition whitespace-nowrap">
            Pricing
          </Link>
        </nav>

        {/* Right CTAs - Streamlined & Balanced */}
        <div className="hidden lg:flex items-center space-x-3 whitespace-nowrap">
          <Link 
            to="/login" 
            className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-2 transition"
          >
            Sign In
          </Link>
          <Link
            to="/request-demo"
            className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-4 py-2.5 rounded-xl transition border border-slate-200/70"
          >
            Book a Demo
          </Link>
          <Link
            to="/login"
            className="text-xs font-extrabold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 px-4 py-2.5 rounded-xl transition shadow-xs flex items-center space-x-1.5 hover:scale-[1.02]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu toggle button */}
        <div className="flex lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-xl px-4 pt-3 pb-6 space-y-4 animate-fade-in">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">Platform</div>
            <Link 
              to="/platform" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"
            >
              <Layers className="w-4 h-4 text-red-600" />
              <span>Platform Overview</span>
            </Link>
            <Link 
              to="/scorm" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>SCORM 1.2 / 2004 Engine</span>
            </Link>
            <Link 
              to="/skills" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Skills Matrix &amp; Mapping</span>
            </Link>
            <Link 
              to="/learning-paths" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Learning Pathways</span>
            </Link>
            <Link 
              to="/analytics" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"
            >
              <BarChart3 className="w-4 h-4 text-amber-600" />
              <span>Analytics &amp; Reporting</span>
            </Link>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">Solutions</div>
            <Link 
              to="/solutions/enterprise" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Enterprise LMS / LXP</span>
            </Link>
            <Link 
              to="/solutions/employee-training" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Workforce Upskilling</span>
            </Link>
            <Link 
              to="/solutions/compliance" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>Compliance &amp; Certifications</span>
            </Link>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <Link 
              to="/ai-course-creator" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/80 rounded-xl transition"
            >
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-950">AI Course Studio</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white uppercase tracking-wider">
                NEW
              </span>
            </Link>
            <Link 
              to="/pricing" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"
            >
              Pricing
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <Link 
              to="/login" 
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Sign In
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/request-demo"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition"
              >
                Book a Demo
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 rounded-xl transition flex items-center justify-center space-x-1"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
