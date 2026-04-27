'use client';
import { useCompany } from '@/lib/companyContext';
import Link from 'next/link';

const PLANS = [
  {
    key:      'starter',
    name:     'Starter',
    price:    'Free',
    period:   '',
    desc:     'For testing or small operations.',
    color:    'var(--gray)',
    features: [
      '50 bookings per month',
      'AI voice agent',
      'Bookings, leads and calls dashboard',
      'Calendar and customer history',
      'Activity log',
      '1 user (super admin only)',
      'SMS confirmation',
    ],
    missing: [
      'Revenue tracking',
      'Driver management',
      'Pricing rules',
      'Team members',
    ],
  },
  {
    key:      'professional',
    name:     'Professional',
    price:    '$49',
    period:   '/ month',
    desc:     'For growing transport businesses.',
    color:    '#6c63ff',
    hot:      true,
    features: [
      'Unlimited bookings',
      'AI voice agent + pricing engine',
      'Driver management',
      'Revenue tracking + CSV exports',
      'SMS reminders and admin alerts',
      'Up to 10 team members',
      'All dashboard pages',
      'Priority support',
    ],
  },
  {
    key:      'enterprise',
    name:     'Enterprise',
    price:    'Custom',
    period:   '',
    desc:     'For fleets and multi-location operations.',
    color:    '#a78bfa',
    features: [
      'Everything in Professional',
      'Unlimited team members',
      'Multi-company SaaS setup',
      'Custom AI voice and branding',
      'Dedicated Twilio number',
      'White-label dashboard',
      'SLA and dedicated support',
    ],
  },
];

export default function PlansPage() {
  const { company } = useCompany();
  const currentPlan = company?.plan ?? 'starter';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      <div style={{ minHeight:'100vh', background:'#0a0a0f', color:'#fff', fontFamily:'DM Sans, sans-serif' }}>

        {/* Grid bg */}
        <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', backgroundImage:'linear-gradient(rgba(108,99,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(108,99,255,0.04) 1px,transparent 1px)', backgroundSize:'60px 60px' }} />
        <div style={{ position:'fixed', width:500, height:500, borderRadius:'50%', background:'rgba(108,99,255,0.12)', filter:'blur(80px)', top:'-100px', left:'50%', transform:'translateX(-50%)', pointerEvents:'none', zIndex:0 }} />

        {/* Header */}
        <div style={{ position:'relative', zIndex:1, padding:'24px 48px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:8, fontFamily:'Syne, sans-serif', fontWeight:800, fontSize:20, color:'#fff', textDecoration:'none' }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#6c63ff,#a78bfa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>🚗</div>
            Ariva
          </Link>
          <Link href="/dashboard" style={{ fontSize:13, color:'rgba(255,255,255,0.5)', textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>
            ← Back to dashboard
          </Link>
        </div>

        {/* Content */}
        <div style={{ position:'relative', zIndex:1, maxWidth:1000, margin:'0 auto', padding:'64px 24px' }}>

          <div style={{ textAlign:'center', marginBottom:56 }}>
            {company && (
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(108,99,255,0.12)', border:'1px solid rgba(108,99,255,0.25)', borderRadius:100, padding:'6px 16px', fontSize:13, color:'#a78bfa', marginBottom:20 }}>
                <span>Current plan:</span>
                <strong style={{ textTransform:'capitalize' }}>{currentPlan}</strong>
              </div>
            )}
            <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(32px,5vw,52px)', fontWeight:800, letterSpacing:'-0.03em', marginBottom:16 }}>
              Choose your plan
            </h1>
            <p style={{ fontSize:16, color:'rgba(255,255,255,0.45)', maxWidth:480, margin:'0 auto' }}>
              Upgrade anytime. Downgrade anytime. No contracts.
            </p>
          </div>

          {/* Plan cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16, alignItems:'start' }}>
            {PLANS.map(plan => {
              const isCurrent = currentPlan === plan.key;
              return (
                <div key={plan.key} style={{
                  background: plan.hot ? 'rgba(108,99,255,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isCurrent ? '#34d399' : plan.hot ? 'rgba(108,99,255,0.45)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius:16, padding:'32px 28px', position:'relative',
                }}>
                  {isCurrent && (
                    <div style={{ position:'absolute', top:-11, left:'50%', transform:'translateX(-50%)', background:'#34d399', color:'#000', fontSize:11, fontWeight:700, padding:'3px 14px', borderRadius:100, whiteSpace:'nowrap' }}>
                      Current plan
                    </div>
                  )}
                  {plan.hot && !isCurrent && (
                    <div style={{ position:'absolute', top:-11, left:'50%', transform:'translateX(-50%)', background:'#6c63ff', color:'#fff', fontSize:11, fontWeight:700, padding:'3px 14px', borderRadius:100, whiteSpace:'nowrap' }}>
                      Most popular
                    </div>
                  )}

                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:10 }}>
                    {plan.name}
                  </div>
                  <div style={{ fontFamily:'Syne, sans-serif', fontSize:38, fontWeight:800, lineHeight:1, marginBottom:6 }}>
                    {plan.price}
                    {plan.period && <span style={{ fontSize:15, fontWeight:400, color:'rgba(255,255,255,0.4)' }}> {plan.period}</span>}
                  </div>
                  <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:24 }}>{plan.desc}</p>

                  <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:9, marginBottom:28 }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ fontSize:13, display:'flex', gap:8, alignItems:'flex-start', color:'rgba(255,255,255,0.75)' }}>
                        <span style={{ color:'#34d399', fontWeight:700, flexShrink:0 }}>✓</span> {f}
                      </li>
                    ))}
                    {plan.missing?.map(f => (
                      <li key={f} style={{ fontSize:13, display:'flex', gap:8, alignItems:'flex-start', color:'rgba(255,255,255,0.25)' }}>
                        <span style={{ flexShrink:0 }}>✕</span> {f}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <div style={{ width:'100%', padding:'12px', borderRadius:10, fontSize:14, fontWeight:500, textAlign:'center', background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.3)', color:'#34d399' }}>
                      Your current plan
                    </div>
                  ) : plan.key === 'enterprise' ? (
                    <a href="mailto:hello@ariva.ai" style={{ display:'block', padding:'12px', borderRadius:10, fontSize:14, fontWeight:500, textAlign:'center', background:'transparent', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.7)', textDecoration:'none' }}>
                      Contact us
                    </a>
                  ) : (
                    <Link href={`/checkout?plan=${plan.key}`} style={{
                      display:'block', padding:'12px', borderRadius:10, fontSize:14, fontWeight:500,
                      textAlign:'center', background:'#6c63ff', color:'#fff', textDecoration:'none',
                    }}>
                      Upgrade to {plan.name} →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* FAQ */}
          <div style={{ marginTop:64, textAlign:'center' }}>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.35)' }}>
              Questions? Email us at{' '}
              <a href="mailto:hello@ariva.ai" style={{ color:'#a78bfa', textDecoration:'none' }}>hello@ariva.ai</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
