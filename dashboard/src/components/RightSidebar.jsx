'use client';
import { useEffect, useState, useRef } from 'react';
import { timeAgo } from '@/lib/formatters';
import StatusBadge from './StatusBadge';

export default function RightSidebar() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(false);

  async function load() {
    if (!mounted.current) return;
    try {
      const API = process.env.NEXT_PUBLIC_API_URL;
      if (!API) return;
      const [b, l] = await Promise.all([
        fetch(`${API}/bookings?perPage=6`).then(r => r.json()),
        fetch(`${API}/leads?perPage=4&status=new`).then(r => r.json()),
      ]);
      const combined = [
        ...(b.items ?? []).map(i => ({ ...i, _type:'booking' })),
        ...(l.items ?? []).map(i => ({ ...i, _type:'lead'    })),
      ].sort((a,z) => new Date(z.created)-new Date(a.created)).slice(0,10);
      setItems(combined);
    } catch (err) {
      console.error('[sidebar] fetch failed:', err.message);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  useEffect(() => {
    mounted.current = true;
    load();
    const interval = setInterval(load, 15000);
    return () => { mounted.current = false; clearInterval(interval); };
  }, []);

  return (
    <aside style={{
      width:240, flexShrink:0,
      background:'var(--surface)',
      borderLeft:'0.5px solid var(--border)',
      display:'flex', flexDirection:'column',
      height:'100vh', position:'sticky', top:0, overflow:'hidden',
    }}>
      <div style={{ padding:'24px 16px 12px', borderBottom:'0.5px solid var(--border)', flexShrink:0 }}>
        <p style={{ fontSize:13, fontWeight:500 }}>Recent activity</p>
        <p style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>Refreshes every 15s</p>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'4px 0' }}>
        {loading ? (
          <p style={{ padding:'16px', fontSize:12, color:'var(--muted)' }}>Loading...</p>
        ) : items.length === 0 ? (
          <p style={{ padding:'16px', fontSize:12, color:'var(--muted)' }}>No activity yet.</p>
        ) : items.map(item => (
          <div key={item.id} style={{ padding:'10px 16px', borderBottom:'0.5px solid var(--border)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
              <span style={{
                fontSize:11, fontWeight:500, padding:'1px 7px', borderRadius:20,
                background: item._type==='booking' ? 'var(--accent-bg)' : 'var(--amber-bg)',
                color:      item._type==='booking' ? 'var(--accent)'    : 'var(--amber)',
              }}>{item._type}</span>
              <span style={{ fontSize:11, color:'var(--muted)' }}>{timeAgo(item.created)}</span>
            </div>
            <p style={{ fontSize:12, color:'var(--text)', marginBottom:2 }}>
              {item._type==='booking'
                ? `${item.caller_name||'Unknown'} — ${item.reference}`
                : item.caller_phone||'Unknown number'}
            </p>
            {item._type==='booking' && item.pickup_address && (
              <p style={{ fontSize:11, color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {item.pickup_address}
              </p>
            )}
            {item._type==='lead' && <StatusBadge status={item.status} />}
          </div>
        ))}
      </div>
    </aside>
  );
}
