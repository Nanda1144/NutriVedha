import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, Trash2, AlertCircle, Search, Clock } from 'lucide-react';
import { fetchNotifications, markRead, clearNotifications } from '../services/notification.service';
import { getAuthToken } from '../services/client';
import './Notifications.css';

const Notifications: React.FC = () => {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'appointment' | 'order' | 'health' | 'alert'>('All');

  const load = async () => {
    setLoading(true); setError(null);
    if (!getAuthToken()) { setError('Login to see notifications (gateway :8080 requires Bearer token)'); setLoading(false); return; }
    try {
      const res = await fetchNotifications();
      setNotifs(res.notifications);
      setUnread(res.unread);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const filtered = notifs.filter(n =>
    (filter === 'All' || n.type === filter) &&
    (n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase()))
  );

  const handleRead = async (id: string) => {
    try { await markRead(id); setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); setUnread(u => Math.max(0, u - 1)); } catch {}
  };
  const handleClear = async () => {
    if (!window.confirm('Clear all notifications?')) return;
    try { await clearNotifications(); setNotifs([]); setUnread(0); } catch {}
  };

  return (
    <div className="notifications-page container section-padding">
      <div className="section-header">
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <Bell size={28} className="text-primary" />
          <h1>Inbox</h1>
          {unread > 0 && <span className="status-pill-small success">{unread} unread</span>}
        </div>
        <p>Microservice `notification:3010` → `GET /api/notification` `notifications` PostgreSQL `sent_at DESC`</p>
      </div>

      <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <Search size={18} className="text-muted" />
        <input placeholder="Search title or message" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', minWidth: '160px' }} />
        <select value={filter} onChange={e => setFilter(e.target.value as any)} style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <option value="All">All types</option><option value="appointment">appointment</option><option value="order">order</option><option value="health">health</option><option value="alert">alert</option>
        </select>
        <button className="btn btn-outline btn-xs" onClick={load}>Refresh</button>
        <button className="btn btn-ghost btn-xs text-danger" onClick={handleClear}><Trash2 size={14} /> Clear</button>
      </div>

      {loading && <div className="loading-state"><div className="spinner" /><p>Loading inbox…</p></div>}
      {error && <div className="glass-card" style={{ padding: '0.8rem', borderLeft: '3px solid #ef4444', display: 'flex', gap: '0.6rem' }}><AlertCircle size={16} className="text-danger" /><span style={{ fontSize: '0.85rem' }}>{error}</span></div>}

      {filtered.length === 0 && !loading ? (
        <div className="empty-state glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <Bell size={48} className="text-muted" />
          <h3>No notifications</h3>
          <p>Bookings and appointments will appear here. Trigger via <a href="/admin-control">Admin Broadcast</a>.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {filtered.map(n => (
            <div key={n.id} className="glass-card" style={{ padding: '1rem', opacity: n.read ? 0.7 : 1, borderLeft: n.read ? '3px solid transparent' : '3px solid #10b981', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <span className={`status-pill-small ${n.type}`}>{n.type}</span>
                  <strong>{n.title}</strong>
                  {!n.read && <span className="status-pill-small success" style={{ fontSize: '0.65rem' }}>New</span>}
                </div>
                <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.3rem' }}>{n.message}</p>
                <span className="hint-text" style={{ fontSize: '0.75rem' }}><Clock size={12} /> {new Date(n.sentAt).toLocaleString()} • {n.channel}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {!n.read && <button className="btn btn-primary btn-xs" onClick={() => handleRead(n.id)}><CheckCircle size={14} /> Mark read</button>}
                <span className="hint-text" style={{ fontSize: '0.7rem' }}>{n.id.slice(0, 8)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
