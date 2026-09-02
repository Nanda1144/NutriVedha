import React, { useEffect, useState } from 'react';
import { Users, ShieldCheck, Search, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch('/api/analytics/admin/overview', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
      // Fallback: generate mock from audit if no users endpoint
      if (res.users) setUsers(res.users);
      else {
        const audit = await fetch('/api/analytics/audit', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({ logs: [] }));
        const uniq = new Map();
        (audit.logs || []).forEach((l: any) => uniq.set(l.userId, { id: l.userId, email: l.userId, role: l.role || 'User', name: l.accessor }));
        setUsers(Array.from(uniq.values()).slice(0, 20));
      }
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const filtered = users.filter(u =>
    (filterRole === 'All' || u.role === filterRole) &&
    (u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm('Ban/delete this user? This will call DELETE /user/:id (mock — PostgreSQL users)')) return;
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div className="container section-padding">
      <div className="section-header">
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <Users size={28} className="text-primary" />
          <h1>User Management</h1>
          <span className="status-pill-small success">{users.length} users</span>
        </div>
        <p>Admin <code>analytics:3011 GET /analytics/admin/overview totalUsers</code> + <code>GET /analytics/audit audit_logs</code> PostgreSQL <code>users, audit_logs, activity_events</code></p>
      </div>

      <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <Search size={18} className="text-muted" />
        <input aria-label="Search users" placeholder="Search name or email" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', minWidth: '160px' }} />
        <select aria-label="Filter role" value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <option value="All">All roles</option><option value="User">User</option><option value="Doctor">Doctor</option><option value="Trainer">Trainer</option><option value="Farmer">Farmer</option><option value="Delivery">Delivery</option>
        </select>
        <button className="btn btn-ghost btn-xs" onClick={load}>Refresh</button>
      </div>

      {loading && <div className="loading-state"><div className="spinner" /><p>Loading users…</p></div>}
      {error && <div className="glass-card" style={{ padding: '0.8rem', borderLeft: '3px solid #ef4444', display: 'flex', gap: '0.6rem' }}><AlertCircle size={16} className="text-danger" /><span style={{ fontSize: '0.85rem' }}>{error}</span></div>}

      <div className="glass-card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '0.6rem' }}>User</th><th>Role</th><th>Email</th><th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}><Users size={32} className="text-muted" /><p>No users match filter — seed via Login registration</p></td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.6rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>{u.name?.charAt(0) || 'U'}</div>
                  <strong>{u.name}</strong>
                </td>
                <td><span className={`status-pill-small ${u.role?.toLowerCase()}`}>{u.role}</span></td>
                <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-ghost btn-xs" aria-label={`View ${u.name}`}><ShieldCheck size={14} /> View</button>
                  <button className="btn btn-ghost btn-xs text-danger" onClick={() => handleDelete(u.id)} aria-label={`Delete ${u.name}`}><Trash2 size={14} /> Ban</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="glass-card" style={{ marginTop: '1rem', padding: '0.8rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
        <CheckCircle size={16} className="text-success" />
        <span style={{ fontSize: '0.85rem' }}>User Management now live via <code>GET /analytics/admin/overview</code> + <code>DELETE /user/:id</code> (mock — wire to <code>users</code> table <code>is_admin</code>).</span>
      </div>
    </div>
  );
};

export default AdminUsers;
