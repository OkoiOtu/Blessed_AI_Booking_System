'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';

const API = () => process.env.NEXT_PUBLIC_API_URL;

const SETTINGS_CONFIG = [
  {
    group: 'Customer SMS',
    items: [
      { key:'sms_booking_confirmed', label:'Booking confirmed',   desc:'Send customer an SMS when their booking is confirmed'       },
      { key:'sms_booking_cancelled', label:'Booking cancelled',   desc:'Notify customer when a booking is cancelled'                },
      { key:'sms_reminder_1hr',      label:'1-hour reminder',     desc:'Send customer a reminder SMS 1 hour before pickup'          },
    ],
  },
  {
    group: 'Admin alerts',
    items: [
      { key:'sms_admin_new_booking', label:'New booking alert',   desc:'Send admin an SMS when a new booking is confirmed'          },
      { key:'sms_admin_new_lead',    label:'New lead alert',      desc:'Send admin an SMS when a call is logged as a lead'          },
    ],
  },
];

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={onChange}
      style={{
        width:40, height:22, borderRadius:11, flexShrink:0, cursor:'pointer',
        background: checked ? 'var(--accent)' : 'var(--border)',
        position:'relative', transition:'background 0.2s',
      }}
    >
      <div style={{
        width:16, height:16, borderRadius:'50%', background:'#fff',
        position:'absolute', top:3,
        left: checked ? 21 : 3,
        transition:'left 0.2s',
      }} />
    </div>
  );
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'admin' || user?.role === 'super_admin';

  const [settings, setSettings] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState('');

  async function load() {
    try {
      const res  = await fetch(`${API()}/notifications/settings`);
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error('[notifications]', err.message);
    }
  }

  useEffect(() => { load(); }, []);

  function toggle(key) {
    if (!isAdmin) return;
    setSettings(s => ({ ...s, [key]: !s[key] }));
    setSaved(false);
  }

  async function save() {
    setSaving(true); setError(''); setSaved(false);
    try {
      const res  = await fetch(`${API()}/notifications/settings`, {
        method: 'PATCH', headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to save'); return; }
      setSettings(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  }

  if (!settings) return <p style={{ color:'var(--muted)' }}>Loading...</p>;

  return (
    <div style={{ width:'100%', maxWidth:640 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:500 }}>Notification settings</h1>
        <p style={{ fontSize:13, color:'var(--muted)', marginTop:2 }}>
          Control which SMS notifications are sent automatically.
        </p>
      </div>

      {!isAdmin && (
        <div style={{ background:'var(--amber-bg)', color:'var(--amber)', padding:'10px 14px', borderRadius:'var(--radius)', fontSize:13, marginBottom:20 }}>
          View only. Contact an admin to change notification settings.
        </div>
      )}

      {SETTINGS_CONFIG.map(({ group, items }) => (
        <div key={group} style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden', marginBottom:16 }}>
          <div style={{ padding:'12px 20px', borderBottom:'0.5px solid var(--border)', background:'var(--bg)' }}>
            <p style={{ fontSize:13, fontWeight:500, color:'var(--muted)' }}>{group}</p>
          </div>
          {items.map(({ key, label, desc }) => (
            <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'0.5px solid var(--border)', gap:16 }}>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{label}</p>
                <p style={{ fontSize:12, color:'var(--muted)', lineHeight:1.5 }}>{desc}</p>
              </div>
              <Toggle checked={!!settings[key]} onChange={() => toggle(key)} />
            </div>
          ))}
        </div>
      ))}

      {/* Admin phone override */}
      <div style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'20px', marginBottom:20 }}>
        <p style={{ fontSize:14, fontWeight:500, marginBottom:4 }}>Admin alert number</p>
        <p style={{ fontSize:12, color:'var(--muted)', marginBottom:12, lineHeight:1.5 }}>
          Override the default admin phone number for alerts. Leave blank to use the number in your server environment variables.
        </p>
        <input
          value={settings.admin_phone_override ?? ''}
          onChange={e => { if (isAdmin) { setSettings(s => ({ ...s, admin_phone_override: e.target.value })); setSaved(false); } }}
          placeholder={isAdmin ? "e.g. +2348012345678" : "Set by admin"}
          disabled={!isAdmin}
          style={{ width:'100%', padding:'8px 12px', fontSize:13 }}
        />
      </div>

      {isAdmin && (
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button className="primary" onClick={save} disabled={saving} style={{ padding:'9px 24px' }}>
            {saving ? 'Saving...' : 'Save settings'}
          </button>
          {saved && <span style={{ fontSize:13, color:'var(--green)', display:'flex', alignItems:'center', gap:4 }}>
            <span className="material-symbols-outlined" style={{ fontSize:16 }}>check_circle</span> Saved
          </span>}
          {error && <span style={{ fontSize:13, color:'var(--red)' }}>{error}</span>}
        </div>
      )}
    </div>
  );
}
