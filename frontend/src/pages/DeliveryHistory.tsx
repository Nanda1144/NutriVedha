import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, AlertCircle, Search, Truck } from 'lucide-react';
import { fetchOrders } from '../services/delivery.service';
import { getAuthToken } from '../services/client';

const DeliveryHistory: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    if (!getAuthToken()) { setError('Login as Delivery to see history'); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetchOrders();
      setOrders(res.orders.filter((o: any) => o.status === 'Delivered'));
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const filtered = orders.filter(o => o.orderId.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container section-padding">
      <div className="section-header">
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <Clock size={28} className="text-primary" />
          <h1>Delivery History</h1>
          <span className="status-pill-small success">{orders.length} delivered</span>
        </div>
        <p>PostgreSQL <code>delivery_orders</code> `status Delivered` via <code>delivery:3008 GET /delivery/orders?status=Delivered</code> + <code>assigned_to</code> filter</p>
      </div>
      <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1rem' }}>
        <Search size={18} className="text-muted" />
        <input aria-label="Search history" placeholder="Search order ID or customer" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent' }} />
        <button className="btn btn-ghost btn-xs" onClick={load}>Refresh</button>
      </div>
      {loading && <div className="loading-state"><div className="spinner" /><p>Loading history…</p></div>}
      {error && <div className="glass-card" style={{ padding: '0.8rem', borderLeft: '3px solid #ef4444', display: 'flex', gap: '0.6rem' }}><AlertCircle size={16} className="text-danger" /><span style={{ fontSize: '0.85rem' }}>{error}</span></div>}
      {filtered.length === 0 && !loading ? (
        <div className="empty-state glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <Truck size={48} className="text-muted" />
          <h3>No delivered orders yet</h3>
          <p>Complete deliveries via <code>Upload Proof & Complete</code> in Dashboard — they will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {filtered.map(o => (
            <div key={o.id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{o.orderId} • {o.customer}</strong>
                <p className="hint-text" style={{ fontSize: '0.8rem' }}>{o.address} • {o.items}</p>
                <span className="hint-text" style={{ fontSize: '0.7rem' }}><Clock size={12} /> {new Date(o.createdAt).toLocaleString()}</span>
              </div>
              <span className="status-pill-small success"><CheckCircle size={12} /> Delivered</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryHistory;
