import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('ANNUAL');

  const tiers = [
    {
      name: 'Starter Team',
      priceAnnual: '$6',
      priceMonthly: '$8',
      period: 'per learner / month',
      desc: 'Ideal for fast-growing companies establishing structured onboarding and compliance.',
      features: [
        'Up to 150 active learners',
        'LMS course catalog & video player',
        'Standard SCORM 1.2 runtime tracking',
        'Basic quiz assessments',
        'Certificate issuance',
        'Email & community support'
      ],
      cta: 'Start Free Trial',
      highlight: false
    },
    {
      name: 'Enterprise Growth',
      priceAnnual: '$12',
      priceMonthly: '$15',
      period: 'per learner / month',
      desc: 'Complete LMS & LXP capabilities with AI authoring and native SCORM 2004.',
      features: [
        'Unlimited active learners',
        'AI Course Creator Studio (Unlimited)',
        'Full SCORM 1.2 & 2004 4th Edition Engine',
        'Sequential Learning Paths with prerequisites',
        '5-Tier Skills & Competency Matrix',
        '8 Assessment Question Types & Rubrics',
        'Manager "My Team" oversight portal',
        'Role-scoped enterprise analytics & CSV export',
        'SAML 2.0 / Okta / Azure AD Single Sign-On'
      ],
      cta: 'Request Enterprise Trial',
      highlight: true
    },
    {
      name: 'Global Enterprise & Multi-Tenant',
      priceAnnual: 'Custom',
      priceMonthly: 'Custom',
      period: 'custom volume tiering',
      desc: 'For Fortune 500 enterprises requiring dedicated tenancy, custom SLA, and global data sovereignty.',
      features: [
        'Multi-tenant architecture (Unlimited child orgs)',
        'Custom white-label branding & domains',
        'Dedicated database cluster & encryption keys',
        'Custom integration engineering & SCIM sync',
        'SOC-2 Type II audit reports & 99.99% SLA',
        'Dedicated Strategic Learning Principal'
      ],
      cta: 'Talk to Sales',
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNavbar />

      <section className="py-20 bg-slate-50 border-b border-slate-200 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Transparent Enterprise Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
            Simple, predictable pricing for modern learning.
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Every plan includes our core LMS/LXP engine with zero hidden add-on fees. Scale seats as your workforce expands.
          </p>

          {/* Toggle */}
          <div className="pt-6 inline-flex items-center p-1 bg-white rounded-xl border border-slate-200 shadow-subtle text-xs font-semibold">
            <button
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-4 py-2 rounded-lg transition ${
                billingCycle === 'ANNUAL' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual Billing <span className="text-[10px] text-emerald-400 font-bold ml-1">(Save 20%)</span>
            </button>
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-4 py-2 rounded-lg transition ${
                billingCycle === 'MONTHLY' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-8 border flex flex-col justify-between transition ${
                tier.highlight
                  ? 'border-brand-600 bg-white shadow-card ring-2 ring-brand-600/10'
                  : 'border-slate-200 bg-white shadow-subtle hover:border-slate-300'
              }`}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                  {tier.highlight && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 uppercase">
                      Most Popular
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-extrabold text-slate-900">
                      {billingCycle === 'ANNUAL' ? tier.priceAnnual : tier.priceMonthly}
                    </span>
                    <span className="text-xs text-slate-500">{tier.period}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pt-2">{tier.desc}</p>
                </div>

                <div className="border-t border-slate-100 pt-6 space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Included Capabilities:</p>
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  to="/request-demo"
                  className={`w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                    tier.highlight
                      ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
