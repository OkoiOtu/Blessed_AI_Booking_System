'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { checkPasswordStrength } from '@/lib/auth';
import { api } from '@/lib/api';

const STORAGE_KEY = 'ariva_signup';

function readStorage()       { try { const r = sessionStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
function writeStorage(v)     { try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(v)); } catch {} }
function clearStorage()      { try { sessionStorage.removeItem(STORAGE_KEY); } catch {} }

const STEPS = [
  { num:1, label:'Account'  },
  { num:2, label:'Company'  },
  { num:3, label:'Verify'   },
  { num:4, label:'Done'     },
];

/* ─── shared dark-page styles ──────────────────────────────────────────────── */
const PAGE_STYLE = {
  minHeight:'100vh', background:'#0a0a0f', color:'#fff',
  fontFamily:'DM Sans, sans-serif', display:'flex', flexDirection:'column',
};
const GRID_BG = {
  position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
  backgroundImage:'linear-gradient(rgba(108,99,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(108,99,255,0.04) 1px,transparent 1px)',
  backgroundSize:'60px 60px',
};
const GLOW = {
  position:'fixed', width:400, height:400, borderRadius:'50%',
  background:'rgba(108,99,255,0.14)', filter:'blur(80px)',
  top:'10%', left:'50%', transform:'translateX(-50%)', pointerEvents:'none', zIndex:0,
};

/* ─── reusable components ───────────────────────────────────────────────────── */
function StepBar({ current }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', marginBottom:36 }}>
      {STEPS.map((s, i) => (
        <div key={s.num} style={{ display:'flex', alignItems:'center' }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
            <div style={{
              width:30, height:30, borderRadius:'50%', display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:12, fontWeight:600, transition:'all 0.3s',
              background: current > s.num ? '#34d399' : current === s.num ? '#6c63ff' : 'rgba(255,255,255,0.08)',
              color: current >= s.num ? '#fff' : 'rgba(255,255,255,0.3)',
            }}>
              {current > s.num ? '✓' : s.num}
            </div>
            <span style={{ fontSize:10, color: current >= s.num ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)', whiteSpace:'nowrap' }}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ width:52, height:1, background: current > s.num ? '#34d399' : 'rgba(255,255,255,0.1)', margin:'0 8px', marginBottom:18, transition:'background 0.3s' }} />
          )}
        </div>
      ))}
    </div>
  );
}

function Field({ label, type='text', value, onChange, onBlur, placeholder, required, helper, error, children }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:'block', fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.7)', marginBottom:6 }}>
        {label}{required && <span style={{ color:'#f87171', marginLeft:3 }}>*</span>}
      </label>
      {children ?? (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width:'100%', padding:'11px 14px', borderRadius:10, fontSize:14,
            background:'rgba(255,255,255,0.06)', border:`1px solid ${error ? '#f87171' : 'rgba(255,255,255,0.12)'}`,
            color:'#fff', outline:'none', fontFamily:'DM Sans, sans-serif',
          }}
          onFocus={e  => { if (!error) e.target.style.borderColor='rgba(108,99,255,0.6)'; }}
          onBlur={e   => { if (!error) e.target.style.borderColor='rgba(255,255,255,0.12)'; onBlur?.(); }}
        />
      )}
      {error  && <p style={{ fontSize:12, color:'#f87171', marginTop:4 }}>{error}</p>}
      {helper && !error && <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:4 }}>{helper}</p>}
    </div>
  );
}

function PasswordStrengthBar({ password }) {
  const { score, label, color, tips } = checkPasswordStrength(password);
  if (!password) return null;
  return (
    <div style={{ marginTop:8 }}>
      <div style={{ display:'flex', gap:4, marginBottom:5 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            flex:1, height:3, borderRadius:10,
            background: i <= score ? color : 'rgba(255,255,255,0.1)',
            transition:'background 0.3s',
          }} />
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <span style={{ fontSize:11, color, fontWeight:500 }}>{label}</span>
        {tips.length > 0 && (
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', textAlign:'right', maxWidth:'70%' }}>
            {tips[0]}
          </span>
        )}
      </div>
    </div>
  );
}

function PrimaryBtn({ children, onClick, loading, disabled, type='button' }) {
  return (
    <button type={type} onClick={onClick} disabled={loading || disabled} style={{
      width:'100%', padding:'13px', borderRadius:10, fontSize:15, fontWeight:500,
      fontFamily:'DM Sans, sans-serif', textAlign:'center',
      background: loading || disabled ? 'rgba(108,99,255,0.4)' : '#6c63ff',
      border:'none', color:'#fff', cursor: loading || disabled ? 'not-allowed' : 'pointer',
      transition:'all 0.2s', marginTop:8,
    }}>
      {loading ? 'Please wait...' : children}
    </button>
  );
}

function SecondaryBtn({ children, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      width:'100%', padding:'11px', marginTop:10, textAlign:'center',
      background:'transparent', border:'1px solid rgba(255,255,255,0.1)',
      color:'rgba(255,255,255,0.45)', borderRadius:10,
      cursor:'pointer', fontSize:14, fontFamily:'DM Sans, sans-serif',
    }}>
      {children}
    </button>
  );
}

/* ─── Step 1 — Account details ──────────────────────────────────────────────── */
function Step1({ data, onNext }) {
  const [name,    setName]    = useState(data.name    ?? '');
  const [email,   setEmail]   = useState(data.email   ?? '');
  const [pass,    setPass]    = useState(data.pass     ?? '');
  const [confirm, setConfirm] = useState(data.confirm ?? '');
  const [errors,  setErrors]  = useState({});
  const [emailChecking, setEmailChecking] = useState(false);

  const strength = checkPasswordStrength(pass);

  async function checkEmailExists() {
    if (!email.includes('@')) return;
    setEmailChecking(true);
    try {
      const res  = await api(`/auth/check-email?email=${encodeURIComponent(email)}`);
      const json = await res.json();
      if (json.exists) setErrors(p => ({ ...p, email: 'This email is already registered. Sign in instead.' }));
    } catch { /* fail silently — backend will validate on submit */ }
    finally { setEmailChecking(false); }
  }

  function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!name.trim())         errs.name    = 'Full name is required';
    if (!email.includes('@')) errs.email   = 'Enter a valid email address';
    else if (errors.email)    errs.email   = errors.email; // preserve duplicate-check error
    if (pass.length < 8)      errs.pass    = 'Password must be at least 8 characters';
    if (strength.score < 2)   errs.pass    = 'Password is too weak — ' + (strength.tips[0] ?? 'choose a stronger password');
    if (pass !== confirm)      errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onNext({ name, email, pass, confirm });
  }

  return (
    <form onSubmit={submit}>
      <Field label="Full name" value={name} onChange={setName} placeholder="Your full name" required error={errors.name} />
      <Field
        label="Email address"
        type="email"
        value={email}
        onChange={v => { setEmail(v); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
        onBlur={checkEmailExists}
        placeholder="you@company.com"
        required
        error={errors.email}
        helper={emailChecking ? 'Checking availability...' : undefined}
      />
      <div style={{ marginBottom:16 }}>
        <label style={{ display:'block', fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.7)', marginBottom:6 }}>
          Password <span style={{ color:'#f87171', marginLeft:3 }}>*</span>
        </label>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Create a strong password"
          style={{ width:'100%', padding:'11px 14px', borderRadius:10, fontSize:14, background:'rgba(255,255,255,0.06)', border:`1px solid ${errors.pass ? '#f87171' : 'rgba(255,255,255,0.12)'}`, color:'#fff', outline:'none', fontFamily:'DM Sans, sans-serif' }}
          onFocus={e => { if (!errors.pass) e.target.style.borderColor='rgba(108,99,255,0.6)'; }}
          onBlur={e  => { if (!errors.pass) e.target.style.borderColor='rgba(255,255,255,0.12)'; }}
        />
        <PasswordStrengthBar password={pass} />
        {errors.pass && <p style={{ fontSize:12, color:'#f87171', marginTop:4 }}>{errors.pass}</p>}
      </div>
      <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} placeholder="Repeat your password" required error={errors.confirm} />
      <PrimaryBtn type="submit">Continue →</PrimaryBtn>
      <p style={{ textAlign:'center', fontSize:13, color:'rgba(255,255,255,0.3)', marginTop:18 }}>
        Already have an account? <Link href="/login" style={{ color:'#a78bfa', textDecoration:'none' }}>Sign in</Link>
      </p>
    </form>
  );
}

/* ─── Step 2 — Company setup ────────────────────────────────────────────────── */
function Step2({ data, onNext, onBack }) {
  const [companyName,   setCompanyName]   = useState(data.companyName ?? '');
  const [slug,          setSlug]          = useState(data.slug        ?? '');
  const [city,          setCity]          = useState(data.city        ?? 'Lagos');
  const [phone,         setPhone]         = useState(data.phone       ?? '');
  const [logo,          setLogo]          = useState(null);
  const [logoPreview,   setLogoPreview]   = useState(null);
  const [errors,        setErrors]        = useState({});
  const [slugChecking,  setSlugChecking]  = useState(false);

  function handleName(v) {
    setCompanyName(v);
    const derived = v.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    setSlug(derived);
    if (errors.slug) setErrors(p => ({ ...p, slug: '' }));
  }

  async function checkSlugExists() {
    if (!slug.trim()) return;
    setSlugChecking(true);
    try {
      const res  = await api(`/auth/check-slug?slug=${encodeURIComponent(slug)}`);
      const json = await res.json();
      if (json.exists) setErrors(p => ({ ...p, slug: 'This slug is already taken. Try a different company name.' }));
    } catch { /* fail silently */ }
    finally { setSlugChecking(false); }
  }

  function validatePhone() {
    if (!phone.trim()) return;
    const digits = phone.replace(/\D/g, '');
    if (!phone.startsWith('+') || digits.length < 7) {
      setErrors(p => ({ ...p, phone: 'Enter a valid phone number starting with + (e.g. +234...)' }));
    }
  }

  function handleLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setErrors(p => ({ ...p, logo:'Logo must be under 2MB' })); return; }
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
    setErrors(p => ({ ...p, logo: null }));
  }

  function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!companyName.trim()) errs.companyName = 'Company name is required';
    if (!slug.trim())        errs.slug        = 'Slug is required';
    else if (errors.slug)    errs.slug        = errors.slug; // preserve duplicate-check error
    if (errors.phone)        errs.phone       = errors.phone;
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onNext({ companyName, slug, city, phone, logo });
  }

  return (
    <form onSubmit={submit}>
      <Field
        label="Company name"
        value={companyName}
        onChange={handleName}
        onBlur={checkSlugExists}
        placeholder="e.g. Blessed Global Transportation"
        required
        error={errors.companyName}
      />
      <Field
        label="URL slug"
        value={slug}
        onChange={v => { setSlug(v); if (errors.slug) setErrors(p => ({ ...p, slug: '' })); }}
        onBlur={checkSlugExists}
        placeholder="e.g. blessed-global"
        required
        error={errors.slug}
        helper={slugChecking ? 'Checking availability...' : 'Lowercase letters, numbers and hyphens only'}
      />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Field label="City" value={city} onChange={setCity} placeholder="e.g. Lagos" />
        <Field
          label="Business phone"
          value={phone}
          onChange={v => { setPhone(v); if (errors.phone) setErrors(p => ({ ...p, phone: '' })); }}
          onBlur={validatePhone}
          placeholder="+234..."
          error={errors.phone}
        />
      </div>

      {/* Logo upload */}
      <div style={{ marginBottom:16 }}>
        <label style={{ display:'block', fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.7)', marginBottom:6 }}>
          Company logo <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>(optional, max 2MB)</span>
        </label>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          {logoPreview ? (
            <img src={logoPreview} alt="Logo preview" style={{ width:56, height:56, borderRadius:10, objectFit:'cover', border:'1px solid rgba(255,255,255,0.15)' }} />
          ) : (
            <div style={{ width:56, height:56, borderRadius:10, background:'rgba(255,255,255,0.06)', border:'1px dashed rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🏢</div>
          )}
          <label style={{ cursor:'pointer' }}>
            <span style={{ fontSize:13, color:'#a78bfa', border:'1px solid rgba(167,139,250,0.3)', padding:'7px 14px', borderRadius:8, display:'inline-block' }}>
              {logoPreview ? 'Change logo' : 'Upload logo'}
            </span>
            <input type="file" accept="image/*" onChange={handleLogo} style={{ display:'none' }} />
          </label>
          {logoPreview && (
            <button type="button" onClick={() => { setLogo(null); setLogoPreview(null); }} style={{ fontSize:12, color:'rgba(255,255,255,0.35)', background:'none', border:'none', cursor:'pointer', padding:0 }}>Remove</button>
          )}
        </div>
        {errors.logo && <p style={{ fontSize:12, color:'#f87171', marginTop:4 }}>{errors.logo}</p>}
      </div>

      <PrimaryBtn type="submit">Continue →</PrimaryBtn>
      <SecondaryBtn onClick={onBack}>← Back</SecondaryBtn>
    </form>
  );
}

/* ─── Step 3 — Email verification ───────────────────────────────────────────── */
function Step3({ email, onNext, onResend }) {
  const [code,    setCode]    = useState('');
  const [loading, setLoading] = useState(false);
  const [resent,  setResent]  = useState(false);
  const [error,   setError]   = useState('');

  async function handleResend() {
    setResent(false);
    await onResend();
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  }

  // PocketBase sends a verification link, not a code
  // User clicks the link in their email then returns here to continue
  return (
    <div>
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div style={{ fontSize:48, marginBottom:16 }}>📧</div>
        <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:18, fontWeight:600, marginBottom:10 }}>Check your inbox</h3>
        <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.7 }}>
          We sent a verification link to<br/>
          <strong style={{ color:'rgba(255,255,255,0.8)' }}>{email}</strong>
        </p>
        <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginTop:12, lineHeight:1.6 }}>
          Click the link in your email to verify your account, then come back here and click Continue.
        </p>
      </div>

      {error && <p style={{ fontSize:13, color:'#fca5a5', background:'rgba(248,113,113,0.1)', padding:'10px 14px', borderRadius:8, marginBottom:14, textAlign:'center' }}>{error}</p>}

      <PrimaryBtn loading={loading} onClick={() => onNext()}>I've verified — continue →</PrimaryBtn>

      <div style={{ textAlign:'center', marginTop:18 }}>
        <button onClick={handleResend} style={{ fontSize:13, color: resent ? '#34d399' : '#a78bfa', background:'none', border:'none', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
          {resent ? '✓ Verification email sent again' : "Didn't get the email? Resend"}
        </button>
      </div>

      <p style={{ textAlign:'center', fontSize:12, color:'rgba(255,255,255,0.25)', marginTop:12 }}>
        Check your spam folder if you don&apos;t see it within 2 minutes.
      </p>
    </div>
  );
}

/* ─── Step 4 — Done ──────────────────────────────────────────────────────────── */
function Step4({ companyName }) {
  const router = useRouter();
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ fontSize:52, marginBottom:16 }}>🎉</div>
      <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:22, fontWeight:700, marginBottom:10 }}>You&rsquo;re all set!</h2>
      <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', marginBottom:8, lineHeight:1.7 }}>
        <strong style={{ color:'rgba(255,255,255,0.8)' }}>{companyName}</strong> is ready.
      </p>
      <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:32, lineHeight:1.7 }}>
        Add pricing rules, connect your Twilio number, then make your first test call.
      </p>
      <button onClick={() => { clearStorage(); router.push('/login'); }} style={{
        width:'100%', padding:'13px', borderRadius:10, fontSize:15, fontWeight:500,
        fontFamily:'DM Sans, sans-serif', textAlign:'center',
        background:'#6c63ff', border:'none', color:'#fff', cursor:'pointer',
      }}>
        Sign in to your dashboard →
      </button>
      <p style={{ fontSize:12, color:'rgba(255,255,255,0.25)', marginTop:12 }}>
        Use the email and password you just created.
      </p>
    </div>
  );
}

/* ─── Main signup page ───────────────────────────────────────────────────────── */
export default function SignupPage() {
  const [step,       setStep]       = useState(1);
  const [allData,    setAllData]    = useState({});
  const [hydrated,   setHydrated]   = useState(false);
  const [error,      setError]      = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Restore saved progress on first mount
  useEffect(() => {
    const saved = readStorage();
    if (saved) {
      const data = saved.allData ?? {};
      // Can't resume step 2 without a password — fall back to step 1 with fields pre-filled
      const targetStep = (saved.step === 2 && !data.pass) ? 1 : (saved.step ?? 1);
      setAllData(data);
      setStep(targetStep);
    }
    setHydrated(true);
  }, []);

  // Sync to sessionStorage whenever step or data changes (passwords are never persisted)
  useEffect(() => {
    if (!hydrated) return;
    const { pass, confirm, ...safeData } = allData;
    writeStorage({ step, allData: safeData });
  }, [step, allData, hydrated]);

  async function createAccountAndCompany(companyData = {}) {
    setSubmitting(true);
    setError('');
    try {
      const payload = { ...allData, ...companyData };

      // Single secure backend call — no direct PocketBase access from browser
      const res  = await api(`/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:        payload.name,
          email:       payload.email,
          password:    payload.pass,
          companyName: payload.companyName,
          slug:        payload.slug,
          city:        payload.city   ?? '',
          phone:       payload.phone  ?? '',
          plan:        'starter',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Registration failed. Please try again.');

      setStep(3);
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function resendVerification() {
    await api(`/auth/resend-verification`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: allData.email }),
    });
  }

  const titles = {
    1: { title:'Create your account',   sub:'Start your free Ariva trial'              },
    2: { title:'Set up your company',   sub:'Tell us about your business'              },
    3: { title:'Verify your email',     sub:'One last step before you get started'     },
    4: { title:'',                      sub:''                                         },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        input::placeholder { color: rgba(255,255,255,0.25) !important; }
        input { color-scheme: dark; }
        * { box-sizing: border-box; }
      `}</style>

      <div style={PAGE_STYLE}>
        <div style={GRID_BG} />
        <div style={GLOW} />

        {/* Top bar */}
        <div style={{ padding:'18px 32px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:1 }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:8, fontFamily:'Syne, sans-serif', fontWeight:800, fontSize:20, color:'#fff', textDecoration:'none' }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#6c63ff,#a78bfa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>🚗</div>
            Ariva
          </Link>
          <Link href="/login" style={{ fontSize:13, color:'rgba(255,255,255,0.4)', textDecoration:'none' }}>
            Have an account? <span style={{ color:'#a78bfa' }}>Sign in</span>
          </Link>
        </div>

        {/* Form */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px', position:'relative', zIndex:1 }}>
          <div style={{ width:'100%', maxWidth:460 }}>

            {step < 4 && <StepBar current={step} />}

            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:16, padding:'36px 32px' }}>

              {step < 4 && (
                <div style={{ marginBottom:26 }}>
                  <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:22, fontWeight:700, marginBottom:6 }}>{titles[step].title}</h1>
                  <p style={{ fontSize:14, color:'rgba(255,255,255,0.4)' }}>{titles[step].sub}</p>
                </div>
              )}

              {error && (
                <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:8, padding:'10px 14px', marginBottom:18 }}>
                  <p style={{ fontSize:13, color:'#fca5a5' }}>{error}</p>
                </div>
              )}

              {step === 1 && (
                <Step1 data={allData} onNext={d => { setAllData(p => ({...p,...d})); setStep(2); }} />
              )}
              {step === 2 && (
                <Step2
                  data={allData}
                  onNext={d => {
                    const merged = { ...allData, ...d };
                    setAllData(merged);
                    createAccountAndCompany(merged);
                  }}
                  onBack={() => setStep(1)}
                />
              )}
              {step === 3 && (
                <Step3
                  email={allData.email}
                  onNext={() => setStep(4)}
                  onResend={resendVerification}
                />
              )}
              {step === 4 && <Step4 companyName={allData.companyName} />}
            </div>

            {step < 4 && (
              <p style={{ textAlign:'center', fontSize:12, color:'rgba(255,255,255,0.2)', marginTop:18 }}>
                By signing up you agree to our Terms of Service and Privacy Policy.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
