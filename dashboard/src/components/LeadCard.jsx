'use client';
import { timeAgo } from '../lib/formatters';
import StatusBadge from './StatusBadge';
import { api } from '../lib/api';

export default function LeadCard({ lead, onStatusChange }) {
  const call = lead.expand?.call;

  async function updateStatus(newStatus) {
    await api(`/leads/${lead.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
    onStatusChange?.();
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '0.5px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontWeight: 500 }}>{lead.caller_phone || 'Unknown number'}</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{timeAgo(lead.created)}</p>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      {lead.summary && (
        <p style={{ fontSize: 13, color: 'var(--muted)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
          {lead.summary}
        </p>
      )}

      {call?.transcript && (
        <details style={{ fontSize: 12 }}>
          <summary style={{ cursor: 'pointer', color: 'var(--accent)', marginBottom: 6 }}>
            View transcript
          </summary>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {call.transcript}
          </p>
        </details>
      )}

      {lead.status !== 'closed' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {lead.status === 'new' && (
            <button onClick={() => updateStatus('reviewed')}>Mark reviewed</button>
          )}
          <button onClick={() => updateStatus('closed')}>Close</button>
        </div>
      )}
    </div>
  );
}
