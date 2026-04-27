'use client';
import Link from 'next/link';
import { useCompany } from '@/lib/companyContext';

/**
 * PLAN_FEATURES defines what each plan can access.
 * feature keys match the 'feature' prop passed to <PlanGate>.
 */
export const PLAN_FEATURES = {
  starter: {
    bookings:        true,   // limited to 50/month
    leads:           true,
    calls:           true,
    calendar:        true,
    customers:       true,
    revenue:         false,  // upgrade needed
    drivers:         false,
    pricing:         false,
    activity:        true,
    users:           false,  // max 1 user (super_admin only)
    settings:        true,
    max_bookings:    50,
    max_users:       1,
  },
  professional: {
    bookings:        true,
    leads:           true,
    calls:           true,
    calendar:        true,
    customers:       true,
    revenue:         true,
    drivers:         true,
    pricing:         true,
    activity:        true,
    users:           true,
    settings:        true,
    max_bookings:    null,   // unlimited
    max_users:       10,
  },
  enterprise: {
    bookings:        true,
    leads:           true,
    calls:           true,
    calendar:        true,
    customers:       true,
    revenue:         true,
    drivers:         true,
    pricing:         true,
    activity:        true,
    users:           true,
    settings:        true,
    max_bookings:    null,
    max_users:       null,
  },
};

export function canAccess(plan, feature) {
  const planConfig = PLAN_FEATURES[plan ?? 'starter'] ?? PLAN_FEATURES.starter;
  return planConfig[feature] ?? true;
}

const UPGRADE_MESSAGES = {
  revenue:  { title:'Revenue tracking', desc:'See detailed revenue charts and export reports. Available on Professional and Enterprise plans.' },
  drivers:  { title:'Driver management', desc:'Assign drivers to bookings and track their status. Available on Professional and Enterprise plans.' },
  pricing:  { title:'Pricing rules', desc:'Set hourly rates, fixed routes and custom pricing. Available on Professional and Enterprise plans.' },
  users:    { title:'Team members', desc:'Add admins and team members to your dashboard. Available on Professional and Enterprise plans.' },
  default:  { title:'Premium feature', desc:'This feature is available on Professional and Enterprise plans.' },
};

/**
 * <PlanGate feature="drivers">
 *   <DriversPage />
 * </PlanGate>
 *
 * Wraps any page/section. If the current company plan doesn't include
 * the feature, shows a blur overlay with upgrade prompt.
 */
export default function PlanGate({ feature, children }) {
  const { company } = useCompany();
  const plan        = company?.plan ?? 'starter';
  const allowed     = canAccess(plan, feature);

  if (allowed) return <>{children}</>;

  const msg = UPGRADE_MESSAGES[feature] ?? UPGRADE_MESSAGES.default;

  return (
    <div style={{ position:'relative', minHeight:400 }}>
      {/* Blurred content underneath */}
      <div style={{ filter:'blur(4px)', pointerEvents:'none', userSelect:'none', opacity:0.5 }}>
        {children}
      </div>

      {/* Upgrade overlay */}
      <div style={{
        position:'absolute', inset:0, zIndex:10,
        display:'flex', alignItems:'center', justifyContent:'center',
        background:'rgba(10,10,15,0.6)', backdropFilter:'blur(2px)',
        borderRadius:'var(--radius-lg)',
      }}>
        <div style={{
          background:'var(--surface)', border:'1px solid rgba(108,99,255,0.3)',
          borderRadius:16, padding:'36px 32px', maxWidth:400, width:'100%',
          margin:'0 20px', textAlign:'center',
          boxShadow:'0 20px 60px rgba(0,0,0,0.4)',
        }}>
          <div style={{ fontSize:40, marginBottom:16 }}>🔒</div>
          <h2 style={{ fontSize:18, fontWeight:700, marginBottom:10, fontFamily:'Syne, sans-serif' }}>
            {msg.title}
          </h2>
          <p style={{ fontSize:13, color:'var(--muted)', lineHeight:1.7, marginBottom:24 }}>
            {msg.desc}
          </p>

          <div style={{ display:'flex', gap:8, justifyContent:'center', flexDirection:'column' }}>
            <a href="/plans" target="_blank" rel="noopener noreferrer" style={{
              display:'block', padding:'12px 24px', borderRadius:10, fontSize:14, fontWeight:500,
              textAlign:'center', background:'#6c63ff', color:'#fff', textDecoration:'none',
            }}>
              View plans & upgrade →
            </a>
            <p style={{ fontSize:12, color:'var(--muted)' }}>
              Current plan: <strong style={{ textTransform:'capitalize', color:'var(--text)' }}>{plan}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * <BookingLimitBanner />
 * Shows a warning banner when approaching or at the booking limit.
 */
export function BookingLimitBanner({ total }) {
  const { company } = useCompany();
  const plan        = company?.plan ?? 'starter';
  const maxBookings = PLAN_FEATURES[plan]?.max_bookings;

  if (!maxBookings) return null; // unlimited plan
  if (total < maxBookings * 0.8) return null; // under 80% — no warning

  const atLimit = total >= maxBookings;

  return (
    <div style={{
      background: atLimit ? 'var(--red-bg)' : 'var(--amber-bg)',
      border: `0.5px solid ${atLimit ? 'var(--red)' : 'var(--amber)'}`,
      borderRadius:'var(--radius)', padding:'12px 16px', marginBottom:20,
      display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10,
    }}>
      <div>
        <p style={{ fontSize:14, fontWeight:500, color: atLimit ? 'var(--red)' : 'var(--amber)' }}>
          {atLimit ? `Booking limit reached (${total}/${maxBookings})` : `Approaching booking limit (${total}/${maxBookings})`}
        </p>
        <p style={{ fontSize:12, color: atLimit ? 'var(--red)' : 'var(--amber)', marginTop:2 }}>
          {atLimit ? 'Upgrade to continue accepting bookings.' : 'Upgrade soon to avoid interruptions.'}
        </p>
      </div>
      <a href="/plans" target="_blank" rel="noopener noreferrer" style={{
        fontSize:13, fontWeight:500, padding:'7px 16px', borderRadius:8,
        background: atLimit ? 'var(--red)' : 'var(--amber)',
        color:'#fff', textDecoration:'none', whiteSpace:'nowrap',
      }}>
        Upgrade plan
      </a>
    </div>
  );
}
