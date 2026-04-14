'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { formatDatetime } from '@/lib/formatters';

const API = () => process.env.NEXT_PUBLIC_API_URL;

const STATUS_META = {
  available: { label:'Available',  bg:'var(--green-bg)',  color:'var(--green)',  icon:'check_circle'   },
  assigned:  { label:'Assigned',   bg:'var(--blue-bg)',   color:'var(--blue)',   icon:'assignment_ind' },
  on_trip:   { label:'On trip',    bg:'var(--amber-bg)',  color:'var(--amber)',  icon:'directions_car' },
  off_duty:  { label:'Off duty',   bg:'var(--gray-bg)',   color:'var(--gray)',   icon:'do_not_disturb' },
};

const VEHICLE_TYPES = ['sedan','suv','van','bus'];
const STATUS_FILTERS = ['all','available','assigned','on_trip','off_duty'];

function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.available;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:500, background:m.bg, color:m.color, whiteSpace:'nowrap' }}>
      <span className="material-symbols-outlined" style={{ fontSize:13 }}>{m.icon}</span>
      {m.label}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:60, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 16px' }}>
      <div style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'24px 28px', width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <p style={{ fontSize:15, fontWeight:500 }}>{title}</p>
          <button onClick={onClose} style={{ border:'none', background:'none', fontSize:20, color:'var(--muted)', padding:0 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const emptyDriver = {
  full_name:'', phone:'', email:'', vehicle_type:'sedan',
  vehicle_make:'', vehicle_model:'', plate_number:'',
  available_from:'08:00', available_until:'20:00', notes:'',
};

function DriverForm({ initial, onSave, onCancel, saving, error }) {
  const [form, setForm] = useState(initial);
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const s = { width:'100%', padding:'7px 10px', fontSize:13, marginTop:4 };

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div style={{ gridColumn:'1/-1' }}>
          <label style={{ fontSize:12, color:'var(--muted)' }}>Full name</label>
          <input required value={form.full_name} onChange={f('full_name')} style={s} />
        </div>
        <div>
          <label style={{ fontSize:12, color:'var(--muted)' }}>Phone</label>
          <input required value={form.phone} onChange={f('phone')} placeholder="+234..." style={s} />
        </div>
        <div>
          <label style={{ fontSize:12, color:'var(--muted)' }}>Email (optional)</label>
          <input type="email" value={form.email} onChange={f('email')} style={s} />
        </div>
        <div>
          <label style={{ fontSize:12, color:'var(--muted)' }}>Vehicle type</label>
          <select value={form.vehicle_type} onChange={f('vehicle_type')} style={s}>
            {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize:12, color:'var(--muted)' }}>Plate number</label>
          <input value={form.plate_number} onChange={f('plate_number')} placeholder="e.g. ABC-123-XY" style={s} />
        </div>
        <div>
          <label style={{ fontSize:12, color:'var(--muted)' }}>Vehicle make</label>
          <input value={form.vehicle_make} onChange={f('vehicle_make')} placeholder="e.g. Toyota" style={s} />
        </div>
        <div>
          <label style={{ fontSize:12, color:'var(--muted)' }}>Vehicle model</label>
          <input value={form.vehicle_model} onChange={f('vehicle_model')} placeholder="e.g. Camry" style={s} />
        </div>
        <div>
          <label style={{ fontSize:12, color:'var(--muted)' }}>Available from</label>
          <input type="time" value={form.available_from} onChange={f('available_from')} style={s} />
        </div>
        <div>
          <label style={{ fontSize:12, color:'var(--muted)' }}>Available until</label>
          <input type="time" value={form.available_until} onChange={f('available_until')} style={s} />
        </div>
        <div style={{ gridColumn:'1/-1' }}>
          <label style={{ fontSize:12, color:'var(--muted)' }}>Notes (optional)</label>
          <input value={form.notes} onChange={f('notes')} placeholder="Any additional notes" style={s} />
        </div>
      </div>
      {error && <p style={{ fontSize:12, color:'var(--red)', background:'var(--red-bg)', padding:'8px 10px', borderRadius:'var(--radius)' }}>{error}</p>}
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:4 }}>
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary" disabled={saving}>{saving ? 'Saving...' : 'Save driver'}</button>
      </div>
    </form>
  );
}

function AssignModal({ booking, drivers, onAssign, onClose }) {
  const [selected, setSelected] = useState('');
  const [conflict, setConflict] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const available = drivers.filter(d => d.status !== 'off_duty');

  async function handleAssign() {
    if (!selected) return;
    setSaving(true); setError(''); setConflict(null);
    try {
      const res  = await fetch(`${API()}/drivers/assign`, {
        method: 'POST', headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ bookingId: booking.id, driverId: selected }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setConflict(data.conflict);
        setSaving(false);
        return;
      }
      if (!res.ok) { setError(data.error ?? 'Failed to assign'); setSaving(false); return; }
      onAssign();
    } finally { setSaving(false); }
  }

  return (
    <Modal title={`Assign driver — ${booking.reference}`} onClose={onClose}>
      <div style={{ marginBottom:14 }}>
        <p style={{ fontSize:13, color:'var(--muted)', marginBottom:4 }}>Booking details</p>
        <p style={{ fontSize:13 }}>{formatDatetime(booking.pickup_datetime)} · {booking.duration_hours}h</p>
        <p style={{ fontSize:13, color:'var(--muted)' }}>{booking.pickup_address}</p>
      </div>

      <div style={{ marginBottom:14 }}>
        <label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:6 }}>Select driver</label>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {available.length === 0 ? (
            <p style={{ fontSize:13, color:'var(--muted)' }}>No active drivers available.</p>
          ) : available.map(d => (
            <label key={d.id} style={{
              display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
              border:`0.5px solid ${selected === d.id ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius:'var(--radius)', cursor:'pointer',
              background: selected === d.id ? 'var(--accent-bg)' : 'var(--surface)',
            }}>
              <input type="radio" name="driver" value={d.id}
                checked={selected === d.id}
                onChange={() => { setSelected(d.id); setConflict(null); }}
                style={{ flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:13, fontWeight:500 }}>{d.full_name}</span>
                  <StatusBadge status={d.status} />
                </div>
                <p style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>
                  {d.vehicle_type} {d.plate_number ? `· ${d.plate_number}` : ''} · {d.phone}
                </p>
                {d.current_booking && (
                  <p style={{ fontSize:11, color:'var(--amber)', marginTop:2 }}>
                    Current: {d.current_booking.reference} — {formatDatetime(d.current_booking.pickup_datetime)}
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {conflict && (
        <div style={{ background:'var(--red-bg)', border:'0.5px solid var(--red)', borderRadius:'var(--radius)', padding:'10px 14px', marginBottom:12 }}>
          <p style={{ fontSize:13, color:'var(--red)', fontWeight:500, marginBottom:4 }}>Scheduling conflict</p>
          <p style={{ fontSize:12, color:'var(--red)' }}>
            This driver is already assigned to booking {conflict.reference} at {formatDatetime(conflict.pickup)} for {conflict.duration}h. The time windows overlap.
          </p>
          <p style={{ fontSize:12, color:'var(--red)', marginTop:4 }}>Please choose a different driver or time.</p>
        </div>
      )}

      {error && <p style={{ fontSize:12, color:'var(--red)', marginBottom:10 }}>{error}</p>}

      <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
        <button onClick={onClose}>Cancel</button>
        <button className="primary" onClick={handleAssign} disabled={!selected || saving}>
          {saving ? 'Assigning...' : 'Assign driver'}
        </button>
      </div>
    </Modal>
  );
}

export default function DriversPage() {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'admin';

  const [drivers,    setDrivers]    = useState([]);
  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('all');
  const [showAdd,    setShowAdd]    = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [error,      setError]      = useState('');
  const [saving,     setSaving]     = useState(false);
  const [tab,        setTab]        = useState('drivers');

  async function loadDrivers() {
    setLoading(true);
    try {
      const q    = filter !== 'all' ? `?status=${filter}` : '';
      const res  = await fetch(`${API()}/drivers${q}`);
      const data = await res.json();
      // Always set an array — guard against error objects or non-array responses
      setDrivers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[drivers] loadDrivers failed:', err.message);
      setDrivers([]);
    } finally { setLoading(false); }
  }

  async function loadBookings() {
    try {
      const res  = await fetch(`${API()}/bookings?perPage=50`);
      const data = await res.json();
      setBookings(data.items ?? []);
    } catch {}
  }

  useEffect(() => {
    loadDrivers();
    loadBookings();
    const interval = setInterval(() => { loadDrivers(); loadBookings(); }, 15000);
    return () => clearInterval(interval);
  }, [filter]);

  async function createDriver(form) {
    setSaving(true); setError('');
    try {
      const res  = await fetch(`${API()}/drivers`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to create driver'); return; }
      setShowAdd(false); loadDrivers();
    } finally { setSaving(false); }
  }

  async function updateDriver(form) {
    setSaving(true); setError('');
    try {
      const res  = await fetch(`${API()}/drivers/${editTarget.id}`, {
        method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to update driver'); return; }
      setEditTarget(null); loadDrivers();
    } finally { setSaving(false); }
  }

  async function deactivateDriver(driver) {
    if (!confirm(`Remove ${driver.full_name}? They will no longer appear in the system.`)) return;
    await fetch(`${API()}/drivers/${driver.id}`, { method:'DELETE' });
    loadDrivers();
  }

  async function unassign(bookingId) {
    await fetch(`${API()}/drivers/unassign`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ bookingId }),
    });
    loadBookings(); loadDrivers();
  }

  const unassignedBookings = bookings.filter(b =>
    ['confirmed','assigned'].includes(b.status) && !b.driver
  );

  return (
    <div style={{ width:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, gap:12, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:500 }}>Drivers</h1>
          <p style={{ fontSize:13, color:'var(--muted)', marginTop:2 }}>
            {drivers.filter(d => d.status==='available').length} available · {drivers.filter(d => d.status==='on_trip').length} on trip · {drivers.filter(d => d.status==='assigned').length} assigned
          </p>
        </div>
        {isAdmin && (
          <button className="primary" onClick={() => { setShowAdd(true); setError(''); }}>
            + Add driver
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, background:'var(--bg)', padding:4, borderRadius:'var(--radius)', marginBottom:20, width:'fit-content' }}>
        {[['drivers','Drivers'],['assign','Assign drivers']].map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            border:'none', borderRadius:6, padding:'6px 16px', fontSize:13,
            fontWeight: tab===key ? 500 : 400,
            background: tab===key ? 'var(--surface)' : 'transparent',
            color: tab===key ? 'var(--text)' : 'var(--muted)',
          }}>{label}{key==='assign' && unassignedBookings.length > 0 && (
            <span style={{ marginLeft:6, background:'var(--red)', color:'#fff', borderRadius:20, fontSize:10, padding:'1px 6px' }}>
              {unassignedBookings.length}
            </span>
          )}</button>
        ))}
      </div>

      {/* ── DRIVERS TAB ── */}
      {tab === 'drivers' && (
        <>
          {/* Status filter */}
          <div style={{ display:'flex', gap:4, marginBottom:16, flexWrap:'wrap' }}>
            {STATUS_FILTERS.map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{
                border:'0.5px solid var(--border)', borderRadius:20, padding:'4px 12px', fontSize:12,
                background: filter===s ? 'var(--accent-bg)' : 'var(--surface)',
                color:      filter===s ? 'var(--accent)'    : 'var(--muted)',
                fontWeight: filter===s ? 500 : 400,
              }}>
                {s==='all' ? 'All' : STATUS_META[s]?.label ?? s}
              </button>
            ))}
          </div>

          {loading ? (
            <p style={{ color:'var(--muted)' }}>Loading...</p>
          ) : drivers.length === 0 ? (
            <div style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'48px 24px', textAlign:'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize:36, color:'var(--muted)', display:'block', marginBottom:10 }}>person_add</span>
              <p style={{ color:'var(--muted)', fontSize:14 }}>No drivers yet. Add your first driver above.</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:12 }}>
              {drivers.map(driver => (
                <div key={driver.id} style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'16px 18px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--accent-bg)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:600, flexShrink:0 }}>
                        {driver.full_name[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize:14, fontWeight:500 }}>{driver.full_name}</p>
                        <p style={{ fontSize:12, color:'var(--muted)' }}>{driver.phone}</p>
                      </div>
                    </div>
                    <StatusBadge status={driver.status || 'available'} />
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:12 }}>
                    {driver.vehicle_type && (
                      <p style={{ fontSize:12, color:'var(--muted)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize:14, verticalAlign:'middle', marginRight:4 }}>directions_car</span>
                        {driver.vehicle_make} {driver.vehicle_model} · {driver.vehicle_type} {driver.plate_number ? `· ${driver.plate_number}` : ''}
                      </p>
                    )}
                    {(driver.available_from || driver.available_until) && (
                      <p style={{ fontSize:12, color:'var(--muted)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize:14, verticalAlign:'middle', marginRight:4 }}>schedule</span>
                        {driver.available_from} – {driver.available_until}
                      </p>
                    )}
                    <p style={{ fontSize:12, color:'var(--muted)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize:14, verticalAlign:'middle', marginRight:4 }}>local_shipping</span>
                      {driver.total_trips ?? 0} trips · {driver.total_hours ?? 0}h total
                    </p>
                  </div>

                  {driver.current_booking && (
                    <div style={{ background:'var(--amber-bg)', borderRadius:'var(--radius)', padding:'8px 10px', marginBottom:12 }}>
                      <p style={{ fontSize:12, color:'var(--amber)', fontWeight:500 }}>Current assignment</p>
                      <p style={{ fontSize:12, color:'var(--amber)' }}>{driver.current_booking.reference} — {formatDatetime(driver.current_booking.pickup_datetime)}</p>
                    </div>
                  )}

                  {isAdmin && (
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => { setEditTarget(driver); setError(''); }} style={{ fontSize:12, padding:'4px 10px', flex:1 }}>Edit</button>
                      <button
                        onClick={() => {
                          const next = driver.status === 'off_duty' ? 'available' : 'off_duty';
                          fetch(`${API()}/drivers/${driver.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ status:next }) }).then(loadDrivers);
                        }}
                        style={{ fontSize:12, padding:'4px 10px',
                          background: driver.status==='off_duty' ? 'var(--green-bg)' : 'var(--gray-bg)',
                          color:      driver.status==='off_duty' ? 'var(--green)'    : 'var(--gray)',
                          border:'none',
                        }}
                      >
                        {driver.status === 'off_duty' ? 'Set active' : 'Set off duty'}
                      </button>
                      <button onClick={() => deactivateDriver(driver)} className="danger" style={{ fontSize:12, padding:'4px 10px' }}>Remove</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── ASSIGN TAB ── */}
      {tab === 'assign' && (
        <div>
          <p style={{ fontSize:13, color:'var(--muted)', marginBottom:16 }}>
            Bookings waiting for a driver assignment. Both admins and users can assign drivers.
          </p>

          {unassignedBookings.length === 0 ? (
            <div style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'48px 24px', textAlign:'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize:36, color:'var(--green)', display:'block', marginBottom:10 }}>task_alt</span>
              <p style={{ color:'var(--muted)', fontSize:14 }}>All bookings have drivers assigned.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {unassignedBookings.map(b => (
                <div key={b.id} style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'14px 18px', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                  <div style={{ flex:1, minWidth:200 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontFamily:'monospace', fontSize:12, color:'var(--accent)' }}>{b.reference}</span>
                      <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'var(--amber-bg)', color:'var(--amber)', fontWeight:500 }}>Needs driver</span>
                    </div>
                    <p style={{ fontSize:13 }}>{b.caller_name} · {b.caller_phone}</p>
                    <p style={{ fontSize:12, color:'var(--muted)' }}>{formatDatetime(b.pickup_datetime)} · {b.duration_hours}h</p>
                    <p style={{ fontSize:12, color:'var(--muted)' }}>{b.pickup_address}</p>
                  </div>
                  <button className="primary" onClick={() => setAssignTarget(b)} style={{ fontSize:13, padding:'7px 16px', whiteSpace:'nowrap' }}>
                    Assign driver
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bookings with drivers assigned */}
          {bookings.filter(b => b.driver && ['confirmed','assigned','on_trip'].includes(b.status)).length > 0 && (
            <div style={{ marginTop:28 }}>
              <p style={{ fontSize:13, fontWeight:500, marginBottom:12 }}>Assigned bookings</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {bookings
                  .filter(b => b.driver && ['confirmed','assigned','on_trip'].includes(b.status))
                  .map(b => {
                    const driver = drivers.find(d => d.id === b.driver);
                    return (
                      <div key={b.id} style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'12px 16px', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                        <div style={{ flex:1, minWidth:200 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                            <span style={{ fontFamily:'monospace', fontSize:12, color:'var(--accent)' }}>{b.reference}</span>
                          </div>
                          <p style={{ fontSize:13 }}>{b.caller_name} · {formatDatetime(b.pickup_datetime)}</p>
                          {driver && (
                            <p style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>
                              Driver: <span style={{ color:'var(--text)', fontWeight:500 }}>{driver.full_name}</span> · {driver.phone}
                            </p>
                          )}
                        </div>
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={() => setAssignTarget(b)} style={{ fontSize:12, padding:'4px 10px' }}>Change driver</button>
                          {isAdmin && (
                            <button onClick={() => unassign(b.id)} className="danger" style={{ fontSize:12, padding:'4px 10px' }}>Unassign</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showAdd && isAdmin && (
        <Modal title="Add driver" onClose={() => setShowAdd(false)}>
          <DriverForm initial={emptyDriver} onSave={createDriver} onCancel={() => setShowAdd(false)} saving={saving} error={error} />
        </Modal>
      )}

      {editTarget && isAdmin && (
        <Modal title="Edit driver" onClose={() => setEditTarget(null)}>
          <DriverForm
            initial={{ full_name:editTarget.full_name, phone:editTarget.phone, email:editTarget.email||'', vehicle_type:editTarget.vehicle_type||'sedan', vehicle_make:editTarget.vehicle_make||'', vehicle_model:editTarget.vehicle_model||'', plate_number:editTarget.plate_number||'', available_from:editTarget.available_from||'08:00', available_until:editTarget.available_until||'20:00', notes:editTarget.notes||'' }}
            onSave={updateDriver} onCancel={() => setEditTarget(null)} saving={saving} error={error}
          />
        </Modal>
      )}

      {assignTarget && (
        <AssignModal
          booking={assignTarget}
          drivers={drivers}
          onAssign={() => { setAssignTarget(null); loadBookings(); loadDrivers(); }}
          onClose={() => setAssignTarget(null)}
        />
      )}
    </div>
  );
}
