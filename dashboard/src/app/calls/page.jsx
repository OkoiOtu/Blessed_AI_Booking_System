'use client';
import { useEffect, useState, useRef } from 'react';
import { timeAgo } from '@/lib/formatters';
import StatusBadge from '@/components/StatusBadge';
import CallDrawer from '@/components/CallDrawer';

const API = () => process.env.NEXT_PUBLIC_API_URL;

export default function CallsPage() {
  const [calls,    setCalls]    = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate,   setToDate]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const mounted = useRef(false);
  const PER_PAGE = 25;

  async function load() {
    if (!mounted.current) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, perPage: PER_PAGE });
      if (fromDate) params.set('fromDate', fromDate);
      if (toDate)   params.set('toDate', toDate);
      const res  = await fetch(`${API()}/calls?${params}`);
      const data = await res.json();
      setCalls(data.items ?? []);
      setTotal(data.totalItems ?? 0);
    } catch (err) {
      console.error('[calls] fetch failed:', err.message);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  useEffect(() => {
    mounted.current = true;
    load();
    return () => { mounted.current = false; };
  }, [page, fromDate, toDate]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div style={{ width:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:500 }}>All calls</h1>
          <p style={{ fontSize:13, color:'var(--muted)', marginTop:2 }}>{total} total</p>
        </div>
      </div>

      {/* Date filter */}
      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:16, flexWrap:'wrap' }}>
        <span style={{ fontSize:13, color:'var(--muted)' }}>Filter by date:</span>
        <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }} style={{ padding:'5px 10px', fontSize:13 }} />
        <span style={{ fontSize:13, color:'var(--muted)' }}>to</span>
        <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }} style={{ padding:'5px 10px', fontSize:13 }} />
        {(fromDate || toDate) && (
          <button onClick={() => { setFromDate(''); setToDate(''); setPage(1); }} style={{ fontSize:12, padding:'5px 10px' }}>Clear</button>
        )}
      </div>

      <div style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
        <div className="table-scroll">
          {loading ? (
            <p style={{ padding:24, color:'var(--muted)' }}>Loading...</p>
          ) : calls.length === 0 ? (
            <p style={{ padding:24, color:'var(--muted)' }}>No calls found.</p>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:560 }}>
              <thead>
                <tr style={{ borderBottom:'0.5px solid var(--border)' }}>
                  {['Phone','Date','Duration','Outcome','Transcript',''].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'8px 16px', fontSize:12, color:'var(--muted)', fontWeight:500, whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calls.map(call => (
                  <tr key={call.id} style={{ borderBottom:'0.5px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'10px 16px', whiteSpace:'nowrap' }}>{call.caller_phone||'—'}</td>
                    <td style={{ padding:'10px 16px', fontSize:12, color:'var(--muted)', whiteSpace:'nowrap' }}>{timeAgo(call.created)}</td>
                    <td style={{ padding:'10px 16px', color:'var(--muted)', whiteSpace:'nowrap' }}>
                      {call.duration_secs ? `${Math.round(call.duration_secs/60)}m` : '—'}
                    </td>
                    <td style={{ padding:'10px 16px' }}><StatusBadge status={call.outcome||'incomplete'} /></td>
                    <td style={{ padding:'10px 16px', fontSize:12, color:'var(--muted)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {call.transcript ? call.transcript.slice(0,80)+'…' : '—'}
                    </td>
                    <td style={{ padding:'10px 16px' }}>
                      <button onClick={() => setSelected(call)} style={{ fontSize:12, padding:'4px 10px' }}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16 }}>
          <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}>Previous</button>
          <span style={{ padding:'6px 12px', fontSize:13, color:'var(--muted)' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}>Next</button>
        </div>
      )}

      {selected && <CallDrawer call={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
