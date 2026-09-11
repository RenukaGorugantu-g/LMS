import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Layers, Sparkles, BookOpen, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PublicNavbar from '../../components/layout/PublicNavbar';

export default function LoginPage() {
  const [email, setEmail] = useState('elena.rostova@acmeglobal.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();

  const demoRoles = [
    {
      role: 'LEARNER',
      title: 'Learner Experience',
      name: 'Elena Rostova',
      email: 'elena.rostova@acmeglobal.com',
      desc: 'Consumer-grade learning hub, continue learning, personal skills & achievements',
      icon: BookOpen,
      color: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-900',
      badge: 'bg-emerald-100 text-emerald-800'
    },
    {
      role: 'COURSE_CREATOR',
      title: 'Course Creator & Manager',
      name: 'David Chen',
      email: 'creator@acmeglobal.com',
      desc: 'AI Course Studio, visual curriculum builder, SCORM uploader, My Team & grading queue',
      icon: Sparkles,
      color: 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-900',
      badge: 'bg-indigo-100 text-indigo-800'
    },
    {
      role: 'ADMIN',
      title: 'Operational Admin',
      name: 'Sarah Jenkins',
      email: 'admin@acmeglobal.com',
      desc: 'Learners directory, department compliance, course enrollments & organization analytics',
      icon: Layers,
      color: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-900',
      badge: 'bg-blue-100 text-blue-800'
    },
    {
      role: 'SUPER_ADMIN',
      title: 'Super Admin',
      name: 'Marcus Vance',
      email: 'superadmin@stratalms.com',
      desc: 'Complete multi-tenant platform authority, organization switcher, audit logs & settings',
      icon: Shield,
      color: 'border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-purple-900',
      badge: 'bg-purple-100 text-purple-800'
    }
  ];

  const handleInstantSwitch = async (roleName) => {
    setIsSubmitting(true);
    try {
      await switchRole(roleName);
      if (roleName === 'LEARNER') navigate('/app/learner');
      else if (roleName === 'COURSE_CREATOR') navigate('/app/creator');
      else if (roleName === 'ADMIN') navigate('/app/admin');
      else if (roleName === 'SUPER_ADMIN') navigate('/app/superadmin');
    } catch (err) {
      setError(err.message || 'Role switch failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'LEARNER') navigate('/app/learner');
      else if (loggedInUser.role === 'COURSE_CREATOR') navigate('/app/creator');
      else if (loggedInUser.role === 'ADMIN') navigate('/app/admin');
      else if (loggedInUser.role === 'SUPER_ADMIN') navigate('/app/superadmin');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign in to Strata LXP
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Choose a pre-configured enterprise role for instant evaluation, or authenticate with credentials.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 max-w-xl mx-auto w-full">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: 1-Click Role Switcher */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Instant Evaluation Role Switcher</h3>
                <p className="text-[11px] text-slate-500">1-click login into each distinct product role</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                Live Data Active
              </span>
            </div>

            <div className="space-y-2.5">
              {demoRoles.map((d, idx) => (
                <button
                  key={idx}
                  onClick={() => handleInstantSwitch(d.role)}
                  disabled={isSubmitting}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex items-start space-x-3 group ${d.color}`}
                >
                  <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-subtle mt-0.5">
                    <d.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition">
                        {d.title}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${d.badge}`}>
                        {d.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">{d.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 self-center transition" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Standard Password Form */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Enterprise Credentials</h3>
              <p className="text-[11px] text-slate-500">Authenticate with corporate email and password</p>
            </div>

            <form onSubmit={handleStandardLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <Link to="/forgot-password" className="text-[11px] text-red-600 font-bold hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition flex items-center justify-center space-x-1.5"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 flex flex-col items-center space-y-2 text-center">
              <div className="text-xs text-slate-500">
                <span>Don't have an account? </span>
                <Link to="/signup" className="text-red-600 font-bold hover:underline">
                  Create an account
                </Link>
              </div>
              <Link to="/request-demo" className="text-xs text-slate-400 hover:text-slate-600">
                Need enterprise SSO or a custom tenant? Request a demo
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
