'use client';
import { useEffect, useState, useRef } from 'react';
import BookingTable from '@/components/BookingTable';
import BookingDetailModal from '@/components/BookingDetailModal';
import pb from '@/lib/pb';

export default function BookingsPage() {
  const [bookings,  setBookings]  = useState([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState('');
  const [query,     setQuery]     = useState('');
  const [loading,   setLoading]   = useState(true);
  const [detailing, setDetailing] = useState(null);
  const mounted = useRef(false);
  const PER_PAGE = 20;

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, perPage: PER_PAGE });
      if (query) params.set('search', query);
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings?${params}`);
      const data = await res.json();
      setBookings(data.items ?? []);
      setTotal(data.totalItems ?? 0);
    } catch (err) {
      console.error('[bookings] fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    mounted.current = true;
    load();

    let unsub = () => {};
    pb.collection('bookings').subscribe('*', () => {
      if (mounted.current) load();
    }, { requestKey: null }).then(fn => { unsub = fn; }).catch(() => {});

    return () => { mounted.current = false; unsub(); };
  }, [page, query]);

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  }

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div style={{ width: '100%' }}>

      <div className="bookings-header">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500 }}>Bookings</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
            {total} confirmed &nbsp;·&nbsp; double-click a row to view details
          </p>
        </div>
        <form onSubmit={handleSearch} className="bookings-header-right">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone, ref..."
            style={{ padding: '6px 12px', width: 220, fontSize: 13 }}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div className="table-scroll">
          {loading ? (
            <p style={{ padding: 24, color: 'var(--muted)' }}>Loading...</p>
          ) : (
            <BookingTable
              bookings={bookings}
              onDoubleClick={b => setDetailing(b)}
            />
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
          <span style={{ padding: '6px 12px', fontSize: 13, color: 'var(--muted)' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
        </div>
      )}

      {detailing && (
        <BookingDetailModal
          booking={detailing}
          onClose={() => setDetailing(null)}
        />
      )}

    </div>
  );
}