'use client';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

export default function CancelPage() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const reference    = params.reference;
  const token        = searchParams.get('token');

  const [status,  setStatus]  = useState('idle'); // idle | confirming | loading | success | error | already
  const [message, setMessage] = useState('');

  if (!reference || !token) {
    return <Layout><Error msg="Invalid cancellation link." /></Layout>;
  }

  async function cancelBooking() {
    setStatus('loading');
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/cancel`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ reference, token }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.includes('already')) {
          setStatus('already');
          setMessage(data.error);
        } else {
          setStatus('error');
          setMessage(data.error ?? 'Something went wrong.');
        }
        return;
      }
      setStatus('success');
    } catch {
      setStatus('error');
      setMessage('Could not connect. Please try again.');
    }
  }

  return (
    <Layout>
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <span className="material-symbols-outlined" style={{ fontSize:48, color: status==='success' ? 'var(--green)' : 'var(--amber)', display:'block', marginBottom:12 }}>
          {status==='success' ? 'check_circle' : 'event_busy'}
        </span>
        <p style={{ fontSize:18, fontWeight:500 }}>
          {status==='success' ? 'Booking cancelled' : 'Cancel your booking'}
        </p>
        <p style={{ fontSize:13, color:'var(--muted)', marginTop:6, fontFamily:'monospace' }}>{reference}</p>
      </div>

      {status === 'idle' && (
        <>
          <p style={{ fontSize:13, color:'var(--muted)', textAlign:'center', marginBottom:24, lineHeight:1.6 }}>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </p>
          <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
            <button onClick={() => window.history.back()} style={{ padding:'10px 24px' }}>Keep booking</button>
            <button onClick={cancelBooking} className="danger" style={{ padding:'10px 24px' }}>Yes, cancel it</button>
          </div>
        </>
      )}

      {status === 'loading' && (
        <p style={{ textAlign:'center', color:'var(--muted)', fontSize:13 }}>Cancelling...</p>
      )}

      {status === 'success' && (
        <p style={{ textAlign:'center', fontSize:13, color:'var(--muted)', lineHeight:1.6 }}>
          Your booking <strong>{reference}</strong> has been successfully cancelled. If you have any questions, please call us directly.
        </p>
      )}

      {(status === 'error' || status === 'already') && (
        <div style={{ background:'var(--red-bg)', color:'var(--red)', padding:'12px 16px', borderRadius:'var(--radius)', fontSize:13, textAlign:'center' }}>
          {message}
        </div>
      )}
    </Layout>
  );
}

function Layout({ children }) {
  useEffect(() => {
    const saved = localStorage.getItem('theme') ?? 'light';
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:24 }}>
      <div style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'40px 36px', width:'100%', maxWidth:420 }}>
        {children}
      </div>
    </div>
  );
}

function Error({ msg }) {
  return <p style={{ textAlign:'center', color:'var(--red)', fontSize:14 }}>{msg}</p>;
}
