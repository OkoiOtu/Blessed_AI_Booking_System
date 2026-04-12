'use client';
import { formatDatetime, formatDuration } from '@/lib/formatters';
import StatusBadge from './StatusBadge';

export default function BookingTable({ bookings, onSelect, onDoubleClick }) {
  if (!bookings?.length) {
    return <div style={{ textAlign:'center', padding:'48px 0', color:'var(--muted)' }}>No bookings yet.</div>;
  }

  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ borderBottom:'0.5px solid var(--border)' }}>
            {['Reference','Name','Phone','Pickup time','Pickup address','Duration','Status'].map(h => (
              <th key={h} style={{ textAlign:'left', padding:'8px 12px', fontSize:12, color:'var(--muted)', fontWeight:500 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr
              key={b.id}
              onClick={() => onSelect?.(b)}
              onDoubleClick={() => onDoubleClick?.(b)}
              style={{ borderBottom:'0.5px solid var(--border)', cursor:'pointer' }}
              title="Double-click to view full details"
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ padding:'10px 12px', fontFamily:'monospace', fontSize:12 }}>{b.reference}</td>
              <td style={{ padding:'10px 12px' }}>{b.caller_name}</td>
              <td style={{ padding:'10px 12px', color:'var(--muted)' }}>{b.caller_phone}</td>
              <td style={{ padding:'10px 12px' }}>{formatDatetime(b.pickup_datetime)}</td>
              <td style={{ padding:'10px 12px', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.pickup_address}</td>
              <td style={{ padding:'10px 12px' }}>{formatDuration(b.duration_hours)}</td>
              <td style={{ padding:'10px 12px' }}><StatusBadge status={b.status || 'confirmed'} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
