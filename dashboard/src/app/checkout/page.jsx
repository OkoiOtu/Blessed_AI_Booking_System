'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useCompany } from '@/lib/companyContext';
import { api } from '@/lib/api';

const PLAN_DETAILS = {
  professional: {
    name:     'Professional',
    priceNGN: '₦49,000',
    priceUSD: '$49',
    period:   'per month',
    features: [
      'Unlimited bookings',
      'Driver management',
      'Revenue tracking + CSV exports',
      'Pricing rules engine',
      'Up to 10 team members',
      'SMS reminders and admin alerts',
      'Priority support',
    ],
  },
};

const PAGE_STYLE = { minHeight:'100vh', background:'#0a0a0f', color:'#fff', fontFamily:'DM Sans, sans-serif', display:'flex', flexDirection:'column' };
const GRID_BG    = { position:'fixed', inset:0, zIndex:0, pointerEvents:'none', backgroundImage:'linear-gradient(rgba(108,99,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(108,99,255,0.04) 1px,transparent 1px)', backgroundSize:'60px 60px' };
const GLOW       = { position:'fixed', width:400, height:400, borderRadius:'50%', background:'rgba(108,99,255,0.14)', filter:'blur(80px)', top:'10%', left:'50%', transform:'translateX(-50%)', pointerEvents:'none', zIndex:0 };

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const plan         = searchParams.get('plan') ?? 'professional';
  const { user }     = useAuth();
  const { company }  = useCompany();

  const [currency, setCurrency] = useState('NGN');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const planDetail = PLAN_DETAILS[plan];

  async function handlePay() {
    if (!user?.email || !company?.id) {
      setError('Please sign in to your dashboard before upgrading.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res  = await api('/payments/initialize', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          plan,
          companyId: company.id,
          email:     user.email,
          currency,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to initialize payment.');
      // Redirect to Paystack checkout
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!planDetail) {
    return (
      <div style={PAGE_STYLE}>
        <div style={GRID_BG} />
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ textAlign:'center' }}>
            <p style={{ fontSize:18, marginBottom:16 }}>Invalid plan selected.</p>
            <Link href="/plans" style={{ color:'#a78bfa' }}>View available plans →</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');`}</style>
      <div style={PAGE_STYLE}>
        <div style={GRID_BG} />
        <div style={GLOW} />

        {/* Header */}
        <div style={{ padding:'18px 32px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:1 }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:8, fontFamily:'Syne, sans-serif', fontWeight:800, fontSize:20, color:'#fff', textDecoration:'none' }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#6c63ff,#a78bfa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>🚗</div>
            Ariva
          </Link>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:13, color:'rgba(255,255,255,0.3)' }}>Secure checkout</span>
            <span style={{ fontSize:18 }}>🔒</span>
          </div>
        </div>

        {/* Checkout body */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px', position:'relative', zIndex:1 }}>
          <div style={{ width:'100%', maxWidth:860, display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start' }}>

            {/* Left — order summary */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:16, padding:'32px 28px' }}>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginBottom:20 }}>Order summary</p>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, paddingBottom:24, borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <p style={{ fontFamily:'Syne, sans-serif', fontSize:20, fontWeight:700 }}>Ariva {planDetail.name}</p>
                  <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginTop:4 }}>{planDetail.period}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontFamily:'Syne, sans-serif', fontSize:24, fontWeight:700 }}>
                    {currency === 'NGN' ? planDetail.priceNGN : planDetail.priceUSD}
                  </p>
                </div>
              </div>

              <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
                {planDetail.features.map(f => (
                  <li key={f} style={{ fontSize:13, display:'flex', gap:8, color:'rgba(255,255,255,0.7)' }}>
                    <span style={{ color:'#34d399', fontWeight:700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              {company && (
                <div style={{ background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:8, padding:'12px 14px' }}>
                  <p style={{ fontSize:12, color:'#34d399' }}>Activating for: <strong>{company.name}</strong></p>
                </div>
              )}
            </div>

            {/* Right — payment form */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:16, padding:'32px 28px' }}>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginBottom:20 }}>Payment details</p>

              {/* Currency selector */}
              <div style={{ marginBottom:22 }}>
                <label style={{ display:'block', fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.7)', marginBottom:8 }}>Currency</label>
                <div style={{ display:'flex', gap:8 }}>
                  {['NGN','USD'].map(c => (
                    <button key={c} onClick={() => setCurrency(c)} style={{
                      flex:1, padding:'10px', borderRadius:8, fontSize:14, fontWeight:500,
                      textAlign:'center', cursor:'pointer', transition:'all 0.2s',
                      background: currency === c ? '#6c63ff' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${currency === c ? '#6c63ff' : 'rgba(255,255,255,0.12)'}`,
                      color:'#fff',
                    }}>
                      {c === 'NGN' ? '₦ NGN' : '$ USD'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account info */}
              <div style={{ marginBottom:22 }}>
                <label style={{ display:'block', fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.7)', marginBottom:8 }}>Billing email</label>
                <div style={{ padding:'11px 14px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', fontSize:14, color:'rgba(255,255,255,0.6)' }}>
                  {user?.email ?? 'Sign in to continue'}
                </div>
              </div>

              <div style={{ background:'rgba(108,99,255,0.08)', border:'1px solid rgba(108,99,255,0.2)', borderRadius:8, padding:'12px 14px', marginBottom:22 }}>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.6)', lineHeight:1.6 }}>
                  You will be redirected to <strong style={{ color:'#fff' }}>Paystack</strong> to complete your payment securely. We accept cards, bank transfer, and USSD.
                </p>
              </div>

              {error && (
                <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:8, padding:'10px 14px', marginBottom:16 }}>
                  <p style={{ fontSize:13, color:'#fca5a5' }}>{error}</p>
                </div>
              )}

              <button onClick={handlePay} disabled={loading || !user} style={{
                width:'100%', padding:'14px', borderRadius:10, fontSize:15, fontWeight:600,
                fontFamily:'DM Sans, sans-serif', textAlign:'center', cursor: !user || loading ? 'not-allowed' : 'pointer',
                background: !user || loading ? 'rgba(108,99,255,0.4)' : '#6c63ff',
                border:'none', color:'#fff', transition:'all 0.2s', marginBottom:12,
              }}>
                {loading ? 'Redirecting to Paystack...' : `Pay ${currency === 'NGN' ? planDetail.priceNGN : planDetail.priceUSD} →`}
              </button>

              <p style={{ fontSize:11, color:'rgba(255,255,255,0.2)', textAlign:'center' }}>
                Secured by Paystack · Cancel anytime
              </p>

              {!user && (
                <p style={{ textAlign:'center', marginTop:14, fontSize:13, color:'rgba(255,255,255,0.4)' }}>
                  <Link href="/login" style={{ color:'#a78bfa', textDecoration:'none' }}>Sign in</Link> to your dashboard first
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
