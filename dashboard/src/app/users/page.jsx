'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';

const MAX_USERS = 10;
const API = () => process.env.NEXT_PUBLIC_API_URL;

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:60, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'24px 28px', width:440, maxWidth:'92vw' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <p style={{ fontSize:15, fontWeight:500 }}>{title}</p>
          <button onClick={onClose} style={{ border:'none', background:'none', fontSize:20, color:'var(--muted)', padding:0 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, confirmLabel, confirmStyle, onConfirm, onCancel }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:80, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'24px 28px', width:360, maxWidth:'92vw' }}>
        <p style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>{title}</p>
        <p style={{ fontSize:13, color:'var(--muted)', marginBottom:24, lineHeight:1.6 }}>{message}</p>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm} className={confirmStyle}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function UserForm({ initial, onSave, onCancel, saving, error, isEdit }) {
  const [form, setForm] = useState(initial);
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const s = { width:'100%', padding:'7px 10px', fontSize:13 };
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div>
        <label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:4 }}>Full name</label>
        <input value={form.full_name} onChange={f('full_name')} style={s} />
      </div>
      <div>
        <label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:4 }}>Email</label>
        <input type="email" required value={form.email} onChange={f('email')} style={s} />
      </div>
      {!isEdit && (
        <div>
          <label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:4 }}>Password (min. 8 characters)</label>
          <input type="password" required minLength={8} value={form.password ?? ''} onChange={f('password')} style={s} />
        </div>
      )}
      <div>
        <label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:4 }}>Role</label>
        <select value={form.role} onChange={f('role')} style={s}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {error && <p style={{ fontSize:12, color:'var(--red)', background:'var(--red-bg)', padding:'8px 10px', borderRadius:'var(--radius)' }}>{error}</p>}
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:4 }}>
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create user'}</button>
      </div>
    </form>
  );
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null); // { type, user }
  const [error, setError]         = useState('');
  const [saving, setSaving]       = useState(false);

  const emptyForm = { full_name:'', email:'', password:'', role:'user' };

  async function load() {
    setLoading(true);
    try {
      const res  = await fetch(`${API()}/users`);
      const data = await res.json();
      setUsers(data.items ?? []);
    } catch (err) {
      console.error('[users page]', err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function createUser(form) {
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API()}/users`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to create user.'); return; }
      setShowAdd(false); load();
    } finally { setSaving(false); }
  }

  async function updateUser(form) {
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API()}/users/${editTarget.id}`, {
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ full_name:form.full_name, email:form.email, role:form.role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to update user.'); return; }
      setEditTarget(null); load();
    } finally { setSaving(false); }
  }

  async function confirmSuspend(u) {
    await fetch(`${API()}/users/${u.id}`, {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ suspended: !u.suspended }),
    });
    setConfirmDialog(null); load();
  }

  async function confirmDelete(u) {
    await fetch(`${API()}/users/${u.id}`, { method:'DELETE' });
    setConfirmDialog(null); load();
  }

  const actionCol = isAdmin ? ['Actions'] : [];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:500 }}>Users</h1>
          <p style={{ fontSize:13, color:'var(--muted)', marginTop:2 }}>{users.length} / {MAX_USERS} users</p>
        </div>
        {isAdmin && users.length < MAX_USERS && (
          <button className="primary" onClick={() => { setShowAdd(true); setError(''); }}>+ Add user</button>
        )}
      </div>

      {!isAdmin && (
        <div style={{ background:'var(--amber-bg)', color:'var(--amber)', padding:'10px 14px', borderRadius:'var(--radius)', fontSize:13, marginBottom:20 }}>
          View only. Contact an admin to make changes.
        </div>
      )}

      <div className="users-table-wrap" style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
        {loading ? (
          <p style={{ padding:24, color:'var(--muted)' }}>Loading...</p>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'0.5px solid var(--border)' }}>
                {['User','Email','Role','Status','Joined',...actionCol].map(h => (
                  <th key={h} style={{ textAlign:'left', padding:'8px 16px', fontSize:12, color:'var(--muted)', fontWeight:500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom:'0.5px solid var(--border)', opacity: u.suspended ? 0.55 : 1 }}>
                  <td style={{ padding:'10px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:30, height:30, borderRadius:'50%', background: u.suspended ? 'var(--gray-bg)' : 'var(--accent-bg)', color: u.suspended ? 'var(--gray)' : 'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:500, flexShrink:0 }}>
                        {(u.full_name||u.email)?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontSize:13 }}>{u.full_name||'—'}</span>
                      {u.id===currentUser?.id && <span style={{ fontSize:10, padding:'1px 6px', borderRadius:20, background:'var(--accent-bg)', color:'var(--accent)' }}>You</span>}
                    </div>
                  </td>
                  <td style={{ padding:'10px 16px', color:'var(--muted)', fontSize:13 }}>{u.email}</td>
                  <td style={{ padding:'10px 16px' }}>
                    <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, fontWeight:500, background: u.role==='admin' ? 'var(--accent-bg)' : 'var(--gray-bg)', color: u.role==='admin' ? 'var(--accent)' : 'var(--gray)' }}>{u.role}</span>
                  </td>
                  <td style={{ padding:'10px 16px' }}>
                    <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, fontWeight:500, background: u.suspended ? 'var(--red-bg)' : 'var(--green-bg)', color: u.suspended ? 'var(--red)' : 'var(--green)' }}>
                      {u.suspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td style={{ padding:'10px 16px', fontSize:12, color:'var(--muted)' }}>
                    {new Date(u.created).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })}
                  </td>
                  {isAdmin && (
                    <td style={{ padding:'10px 16px' }}>
                      {u.id !== currentUser?.id ? (
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={() => { setEditTarget(u); setError(''); }} style={{ fontSize:12, padding:'3px 10px' }}>Edit</button>
                          <button
                            onClick={() => setConfirmDialog({ type:'suspend', user:u })}
                            style={{ fontSize:12, padding:'3px 10px', background: u.suspended ? 'var(--green-bg)' : 'var(--amber-bg)', color: u.suspended ? 'var(--green)' : 'var(--amber)', border:'none' }}
                          >
                            {u.suspended ? 'Reinstate' : 'Suspend'}
                          </button>
                          <button onClick={() => setConfirmDialog({ type:'delete', user:u })} className="danger" style={{ fontSize:12, padding:'3px 10px' }}>Delete</button>
                        </div>
                      ) : <span style={{ fontSize:12, color:'var(--muted)' }}>—</span>}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <Modal title="Add new user" onClose={() => setShowAdd(false)}>
          <UserForm initial={emptyForm} onSave={createUser} onCancel={() => setShowAdd(false)} saving={saving} error={error} isEdit={false} />
        </Modal>
      )}

      {editTarget && (
        <Modal title="Edit user" onClose={() => setEditTarget(null)}>
          <UserForm
            initial={{ full_name:editTarget.full_name??'', email:editTarget.email, role:editTarget.role??'user', password:'' }}
            onSave={updateUser} onCancel={() => setEditTarget(null)} saving={saving} error={error} isEdit={true}
          />
        </Modal>
      )}

      {confirmDialog?.type === 'suspend' && (
        <ConfirmDialog
          title={confirmDialog.user.suspended ? `Reinstate user?` : `Suspend user?`}
          message={confirmDialog.user.suspended
            ? `Reinstate ${confirmDialog.user.email}? They will regain access to the dashboard.`
            : `Suspend ${confirmDialog.user.email}? They will not be able to log in until reinstated.`}
          confirmLabel={confirmDialog.user.suspended ? 'Yes, reinstate' : 'Yes, suspend'}
          confirmStyle={confirmDialog.user.suspended ? 'primary' : 'danger'}
          onConfirm={() => confirmSuspend(confirmDialog.user)}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {confirmDialog?.type === 'delete' && (
        <ConfirmDialog
          title="Permanently delete user?"
          message={`Permanently delete ${confirmDialog.user.email}? This cannot be undone.`}
          confirmLabel="Yes, delete permanently"
          confirmStyle="danger"
          onConfirm={() => confirmDelete(confirmDialog.user)}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}