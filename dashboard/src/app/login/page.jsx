'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { logEvent } from '@/lib/activityLog';

const MAX_ATTEMPTS_1  = 5;   // lockout after 5 fails
const LOCKOUT_1_MS    = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS_2  = 2;   // lockout after 2 more fails
const LOCKOUT_2_MS    = 30 * 60 * 1000; // 30 minutes

function getLockoutState(email) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`login_attempts_${email}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setLockoutState(email, state) {
  localStorage.setItem(`login_attempts_${email}`, JSON.stringify(state));
}

function clearLockoutState(email) {
  localStorage.removeItem(`login_attempts_${email}`);
}

function checkLockout(email) {
  const state = getLockoutState(email);
  if (!state) return { locked: false, attempts: 0 };

  const now = Date.now();

  if (state.lockedUntil && now < state.lockedUntil) {
    const remaining = Math.ceil((state.lockedUntil - now) / 60000);
    return { locked: true, remaining, attempts: state.attempts };
  }

  // Lockout expired — clear it
  if (state.lockedUntil && now >= state.lockedUntil) {
    // Keep attempt count to enable second-tier lockout
    const updated = { ...state, lockedUntil: null };
    setLockoutState(email, updated);
    return { locked: false, attempts: state.attempts };
  }

  return { locked: false, attempts: state.attempts ?? 0 };
}

function recordFailedAttempt(email) {
  const state = getLockoutState(email) ?? { attempts: 0, tier: 1 };
  const attempts = (state.attempts ?? 0) + 1;
  const tier = state.tier ?? 1;

  let lockedUntil = null;
  let newTier = tier;

  if (tier === 1 && attempts >= MAX_ATTEMPTS_1) {
    lockedUntil = Date.now() + LOCKOUT_1_MS;
    newTier = 2;
  } else if (tier === 2 && attempts >= MAX_ATTEMPTS_1 + MAX_ATTEMPTS_2) {
    lockedUntil = Date.now() + LOCKOUT_2_MS;
    newTier = 2;
  }

  setLockoutState(email, { attempts, lockedUntil, tier: newTier });
  return { attempts, lockedUntil, tier: newTier };
}

function formatTime(ms) {
  const mins = Math.ceil(ms / 60000);
  return `${mins} minute${mins !== 1 ? 's' : ''}`;
}

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [lockInfo, setLockInfo] = useState(null);
  const [countdown, setCountdown] = useState('');

  // Update countdown every second when locked
  useEffect(() => {
    if (!lockInfo?.lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = lockInfo.lockedUntil - Date.now();
      if (remaining <= 0) {
        setLockInfo(null);
        setError('');
        clearInterval(interval);
      } else {
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setCountdown(`${mins}:${secs.toString().padStart(2,'0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockInfo]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const { locked, remaining } = checkLockout(email);
    if (locked) {
      setError(`Too many failed attempts. Try again in ${remaining} minute${remaining !== 1 ? 's' : ''}.`);
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      clearLockoutState(email);
      router.replace('/');
    } catch (err) {
      // Suspended users get a clear message, no lockout counter
      if (err.message === 'SUSPENDED') {
        setError('This account has been suspended. Please contact your administrator.');
        setLoading(false);
        return;
      }
      // Log failed attempt
      await logEvent(
        'login_failed',
        email,
        `Failed login attempt for ${email}`
      );
      const result = recordFailedAttempt(email);

      if (result.lockedUntil) {
        const duration = result.tier === 2 && result.attempts >= MAX_ATTEMPTS_1 + MAX_ATTEMPTS_2
          ? LOCKOUT_2_MS : LOCKOUT_1_MS;
        setLockInfo({ lockedUntil: result.lockedUntil });
        setError(`Too many failed attempts. Account locked for ${formatTime(duration)}.`);
        await logEvent(
          'login_locked',
          email,
          `Account locked for ${formatTime(duration)} after too many failed attempts: ${email}`
        );
      } else {
        const remaining = result.tier === 1
          ? MAX_ATTEMPTS_1 - result.attempts
          : MAX_ATTEMPTS_2 - (result.attempts - MAX_ATTEMPTS_1);
        setError(`Invalid email or password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
      }
    } finally {
      setLoading(false);
    }
  }

  const isLocked = lockInfo && lockInfo.lockedUntil > Date.now();

  return (
    <div style={{
      minHeight:'100vh', display:'flex',
      alignItems:'center', justifyContent:'center',
      background:'var(--bg)',
    }}>
      <div style={{
        background:'var(--surface)', border:'0.5px solid var(--border)',
        borderRadius:'var(--radius-lg)', padding:'40px 36px',
        width:'100%', maxWidth:380,
      }}>
        <div style={{ marginBottom:28 }}>
          <p style={{ fontSize:18, fontWeight:500 }}>AI Booking System</p>
          <p style={{ fontSize:13, color:'var(--muted)', marginTop:4 }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:5 }}>Email</label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              required disabled={isLocked}
              style={{ width:'100%', padding:'8px 12px', fontSize:14 }}
            />
          </div>
          <div>
            <label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:5 }}>Password</label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              required disabled={isLocked}
              style={{ width:'100%', padding:'8px 12px', fontSize:14 }}
            />
          </div>

          {error && (
            <div style={{
              fontSize:13, color:'var(--red)', background:'var(--red-bg)',
              padding:'10px 12px', borderRadius:'var(--radius)', lineHeight:1.5,
            }}>
              <p>{error}</p>
              {isLocked && countdown && (
                <p style={{ marginTop:4, fontWeight:500, fontFamily:'monospace' }}>
                  Time remaining: {countdown}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isLocked}
            style={{
              marginTop:4, padding:'10px', textAlign: 'center',
              background: isLocked ? 'var(--gray-bg)' : 'var(--accent)',
              color: isLocked ? 'var(--gray)' : '#fff',
              border:'none', borderRadius:'var(--radius)',
              fontSize:14, fontWeight:500,
              cursor: isLocked ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : isLocked ? 'Account locked' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}