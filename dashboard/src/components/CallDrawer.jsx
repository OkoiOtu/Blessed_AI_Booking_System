'use client';
import { formatDatetime } from '../lib/formatters';
import StatusBadge from './StatusBadge';

export default function CallDrawer({ call, onClose }) {
  if (!call) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 40,
        }}
      />

      {/* Drawer panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 480, maxWidth: '90vw',
        background: 'var(--surface)',
        borderLeft: '0.5px solid var(--border)',
        zIndex: 50,
        overflowY: 'auto',
        padding: '28px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontWeight: 500, fontSize: 15 }}>Call details</p>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 18, color: 'var(--muted)', padding: 0 }}>✕</button>
        </div>

        {/* Meta */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
          {[
            ['Phone',    call.caller_phone],
            ['Date',     formatDatetime(call.created)],
            ['Duration', call.duration_secs ? `${Math.round(call.duration_secs / 60)}m` : '—'],
            ['Outcome',  <StatusBadge key="s" status={call.outcome} />],
          ].map(([label, value]) => (
            <div key={label}>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: 13 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Recording */}
        {call.recording_url && (
          <div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Recording</p>
            <audio controls src={call.recording_url} style={{ width: '100%' }} />
          </div>
        )}

        {/* Transcript */}
        {call.transcript && (
          <div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Transcript</p>
            <div style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius)',
              padding: '12px 14px',
              fontSize: 13,
              lineHeight: 1.8,
              whiteSpace: 'pre-line',
              color: 'var(--text)',
            }}>
              {call.transcript}
            </div>
          </div>
        )}

        {!call.transcript && !call.recording_url && (
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>No transcript or recording available.</p>
        )}
      </div>
    </>
  );
}
