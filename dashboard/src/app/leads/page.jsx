'use client';
import { useEffect, useState, useCallback } from 'react';
import LeadCard from '@/components/LeadCard';
import pb from '@/lib/pb';

const STATUSES = ['all', 'new', 'reviewed', 'closed'];

export default function LeadsPage() {
  const [leads,   setLeads]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [filter,  setFilter]  = useState('new');
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);

  const PER_PAGE = 20;
  const API = process.env.NEXT_PUBLIC_API_URL;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, perPage: PER_PAGE });
      if (filter !== 'all') params.set('status', filter);
      const res  = await fetch(`${API}/leads?${params}`);
      const data = await res.json();
      setLeads(data.items ?? []);
      setTotal(data.totalItems ?? 0);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    load();

    let unsub;
    (async () => { unsub = await pb.collection('leads').subscribe('*', () => load()); })();
    return () => unsub?.();
  }, [load]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:500 }}>Leads</h1>
          <p style={{ fontSize:13, color:'var(--muted)', marginTop:2 }}>{total} {filter !== 'all' ? filter : 'total'}</p>
        </div>
        <div style={{ display:'flex', gap:4, background:'var(--bg)', padding:4, borderRadius:'var(--radius)' }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setFilter(s); setPage(1); }} style={{
              border:'none', borderRadius:6, padding:'5px 12px', fontSize:12,
              fontWeight: filter===s ? 500 : 400,
              background: filter===s ? 'var(--surface)' : 'transparent',
              color: filter===s ? 'var(--text)' : 'var(--muted)',
            }}>
              {s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color:'var(--muted)', padding:'24px 0' }}>Loading...</p>
      ) : leads.length === 0 ? (
        <p style={{ color:'var(--muted)', padding:'24px 0' }}>No {filter !== 'all' ? filter : ''} leads.</p>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {leads.map(lead => <LeadCard key={lead.id} lead={lead} onStatusChange={load} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:20 }}>
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>Previous</button>
          <span style={{ padding:'6px 12px', fontSize:13, color:'var(--muted)' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}>Next</button>
        </div>
      )}
    </div>
  );
}
