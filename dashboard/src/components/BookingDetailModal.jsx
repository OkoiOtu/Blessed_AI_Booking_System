'use client';
import { formatDatetime, formatDuration, formatPhone } from '@/lib/formatters';
import StatusBadge from './StatusBadge';

export default function BookingDetailModal({ booking, onClose }) {
  if (!booking) return null;

  const fields = [
    { label:'Reference',      value: booking.reference },
    { label:'Caller name',    value: booking.caller_name },
    { label:'Phone',          value: formatPhone(booking.caller_phone) },
    { label:'Pickup time',    value: formatDatetime(booking.pickup_datetime) },
    { label:'Pickup address', value: booking.pickup_address },
    { label:'Drop-off',       value: booking.dropoff_address || '—' },
    { label:'Duration',       value: formatDuration(booking.duration_hours) },
    { label:'SMS sent',       value: booking.sms_sent ? 'Yes' : 'No' },
    { label:'Created',        value: formatDatetime(booking.created) },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:60, background:'rgba(0,0,0,0.4)' }} />
      <div style={{
        position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        zIndex:70, width:480, maxWidth:'90vw',
        background:'var(--surface)', border:'0.5px solid var(--border)',
        borderRadius:'var(--radius-lg)', padding:'28px',
        maxHeight:'85vh', overflowY:'auto',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div>
            <p style={{ fontSize:15, fontWeight:500 }}>Booking details</p>
            <p style={{ fontSize:12, color:'var(--muted)', marginTop:2, fontFamily:'monospace' }}>{booking.reference}</p>
          </div>
          <button onClick={onClose} style={{ border:'none', background:'none', fontSize:20, color:'var(--muted)', padding:0 }}>✕</button>
        </div>

        <div style={{ marginBottom:18 }}>
          <StatusBadge status={booking.status || 'confirmed'} />
        </div>

        <div style={{ display:'flex', flexDirection:'column' }}>
          {fields.map(({ label, value }) => (
            <div key={label} style={{ display:'grid', gridTemplateColumns:'140px 1fr', padding:'10px 0', borderBottom:'0.5px solid var(--border)' }}>
              <p style={{ fontSize:12, color:'var(--muted)', paddingTop:1 }}>{label}</p>
              <p style={{ fontSize:13, color:'var(--text)', wordBreak:'break-word' }}>{value || '—'}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop:20, display:'flex', justifyContent:'flex-end' }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
}
