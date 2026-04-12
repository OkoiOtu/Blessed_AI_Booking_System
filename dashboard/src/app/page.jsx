'use client';
import { useEffect, useState, useRef } from 'react';
import { timeAgo } from '@/lib/formatters';
import StatusBadge from '@/components/StatusBadge';
import pb from '@/lib/pb';

const STAT_CARDS = [
  { key:'bookings.confirmed', label:'Confirmed',  color:'var(--accent)',  icon:'event_available' },
  { key:'bookings.on_trip',   label:'On trip',    color:'var(--blue)',    icon:'directions_car'  },
  { key:'bookings.completed', label:'Completed',  color:'var(--green)',   icon:'task_alt'        },
  { key:'bookings.cancelled', label:'Cancelled',  color:'var(--red)',     icon:'cancel'          },
];

const LEAD_CARDS = [
  { key:'leads.new',      label:'New leads',      color:'var(--amber)',  icon:'mark_unread_chat_alt' },
  { key:'leads.reviewed', label:'Leads reviewed', color:'var(--purple)', icon:'rate_review'          },
  { key:'leads.closed',   label:'Leads closed',   color:'var(--gray)',   icon:'check_circle'         },
];

// Module-level cache — survives page navigation
let cachedStats  = null;
let cachedRecent = [];

function getVal(stats, key) {
  if (!stats) return null; // null = still loading
  const [group, field] = key.split('.');
  return stats?.[group]?.[field] ?? 0;
}

function Icon({ name }) {
  return <span className="material-symbols-outlined" style={{ fontSize:20 }}>{name}</span>;
}

function StatCard({ label, color, icon, value }) {
  return (
    <div style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'16px 18px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <p style={{ fontSize:12, color:'var(--muted)', lineHeight:1.4 }}>{label}</p>
        <span className="material-symbols-outlined" style={{ fontSize:18, color, flexShrink:0 }}>{icon}</span>
      </div>
      <p style={{ fontSize:26, fontWeight:500, color }}>
        {value === null ? '—' : value}
      </p>
    </div>
  );
}

export default function OverviewPage() {
  const [stats,    setStats]    = useState(cachedStats);
  const [recent,   setRecent]   = useState(cachedRecent);
  const [fetching, setFetching] = useState(false);
  const mounted = useRef(false);

  async function load() {
    if (fetching) return;
    setFetching(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL;
      if (!API) return;

      const [statsRes, rb, rl] = await Promise.all([
        fetch(`${API}/stats`).then(r => { if (!r.ok) throw new Error('stats failed'); return r.json(); }),
        fetch(`${API}/bookings?perPage=5`).then(r => r.json()),
        fetch(`${API}/leads?perPage=5`).then(r => r.json()),
      ]);

      if (!mounted.current) return;

      const combined = [
        ...(rb.items ?? []).map(i => ({ ...i, _type:'booking' })),
        ...(rl.items ?? []).map(i => ({ ...i, _type:'lead'    })),
      ].sort((a,z) => new Date(z.created)-new Date(a.created)).slice(0,8);

      cachedStats  = statsRes;
      cachedRecent = combined;
      setStats(statsRes);
      setRecent(combined);
    } catch (err) {
      console.error('[overview] load failed:', err.message);
      // Don't clear existing stats on error — keep showing last known values
    } finally {
      if (mounted.current) setFetching(false);
    }
  }

  useEffect(() => {
    mounted.current = true;
    load();

    let unsubB = ()=>{}, unsubL = ()=>{};
    pb.collection('bookings').subscribe('*', () => { if (mounted.current) load(); }, { requestKey:null })
      .then(fn => { unsubB = fn; }).catch(()=>{});
    pb.collection('leads').subscribe('*', () => { if (mounted.current) load(); }, { requestKey:null })
      .then(fn => { unsubL = fn; }).catch(()=>{});

    return () => { mounted.current = false; unsubB(); unsubL(); };
  }, []);

  return (
    <div style={{ width:'100%' }}>
      <h1 style={{ fontSize:20, fontWeight:500, marginBottom:24 }}>Overview</h1>

      {/* Booking stats */}
      <p style={{ fontSize:11, color:'var(--muted)', marginBottom:10, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.06em' }}>Bookings</p>
      <div className="stat-grid-bookings" style={{ marginBottom:24 }}>
        {STAT_CARDS.map(({ key, label, color, icon }) => (
          <StatCard key={key} label={label} color={color} icon={icon} value={getVal(stats, key)} />
        ))}
      </div>

      {/* Lead stats */}
      <p style={{ fontSize:11, color:'var(--muted)', marginBottom:10, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.06em' }}>Leads</p>
      <div className="stat-grid-leads" style={{ marginBottom:32 }}>
        {LEAD_CARDS.map(({ key, label, color, icon }) => (
          <StatCard key={key} label={label} color={color} icon={icon} value={getVal(stats, key)} />
        ))}
      </div>

      {/* Recent activity */}
      <div style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <p style={{ fontWeight:500 }}>Recent activity</p>
          {fetching && <span style={{ fontSize:11, color:'var(--muted)' }}>Refreshing...</span>}
        </div>

        {recent.length === 0 && !fetching ? (
          <p style={{ padding:'24px 20px', color:'var(--muted)' }}>No activity yet.</p>
        ) : recent.length === 0 ? (
          <p style={{ padding:'24px 20px', color:'var(--muted)' }}>Loading...</p>
        ) : (
          <div className="table-scroll">
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:500 }}>
              <thead>
                <tr style={{ borderBottom:'0.5px solid var(--border)' }}>
                  {['Type','Phone','Detail','When','Status'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'8px 16px', fontSize:12, color:'var(--muted)', fontWeight:500, whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map(item => (
                  <tr key={item.id} style={{ borderBottom:'0.5px solid var(--border)' }}>
                    <td style={{ padding:'10px 16px' }}>
                      <span style={{ fontSize:11, fontWeight:500, padding:'2px 8px', borderRadius:20, whiteSpace:'nowrap', background:item._type==='booking'?'var(--accent-bg)':'var(--gray-bg)', color:item._type==='booking'?'var(--accent)':'var(--gray)' }}>
                        {item._type}
                      </span>
                    </td>
                    <td style={{ padding:'10px 16px', color:'var(--muted)', fontSize:13, whiteSpace:'nowrap' }}>{item.caller_phone}</td>
                    <td style={{ padding:'10px 16px', fontSize:13 }}>
                      {item._type==='booking' ? item.reference : (item.summary?.split('\n')[0] ?? '—')}
                    </td>
                    <td style={{ padding:'10px 16px', fontSize:12, color:'var(--muted)', whiteSpace:'nowrap' }}>{timeAgo(item.created)}</td>
                    <td style={{ padding:'10px 16px' }}>
                      <StatusBadge status={item._type==='booking' ? (item.status||'confirmed') : item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
