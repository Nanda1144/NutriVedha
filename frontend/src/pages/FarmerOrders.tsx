import React, { useEffect, useState } from 'react';
import { Package, CheckCircle, XCircle, Truck, Clock, AlertCircle, Search } from 'lucide-react';

const FarmerOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'In Transit' | 'Delivered'>('All');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('nv_token');
      if (!token) { setError('Login as Farmer to see customer orders (gateway requires Bearer token)'); setLoading(false); return; }
      const res = await fetch('/api/delivery/orders', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
      if (res.orders) setOrders(res.orders);
      else setOrders([]);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const handleStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('nv_token');
      await fetch(`/api/delivery/orders/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (e: any) { setError(e.message); }
  };

  const filtered = orders.filter(o =>
    (filter === 'All' || o.status === filter) &&
    (o.customer?.toLowerCase().includes(search.toLowerCase()) || o.orderId?.toLowerCase().includes(search.toLowerCase()) || o.items?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container section-padding">
      <div className="section-header">
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <Package size={28} className="text-primary" />
          <h1>Customer Orders</h1>
          <span className="status-pill-small success">{orders.length} orders</span>
        </div>
        <p>PostgreSQL <code>delivery_orders</code> `orderId customer address items status assigned_to` via <code>delivery:3008</code> + <code>marketplace crop_bookings</code></p>
      </div>

      <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <Search size={18} className="text-muted" />
        <input aria-label="Search orders" placeholder="Search customer, order ID, items" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', minWidth: '160px' }} />
        <select aria-label="Filter status" value={filter} onChange={e => setFilter(e.target.value as any)} style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <option value="All">All</option><option value="Pending">Pending</option><option value="In Transit">In Transit</option><option value="Delivered">Delivered</option>
        </select>
        <button className="btn btn-ghost btn-xs" onClick={load}>Refresh</button>
      </div>

      {loading && <div className="loading-state"><div className="spinner" /><p>Loading orders…</p></div>}
      {error && <div className="glass-card" style={{ padding: '0.8rem', borderLeft: '3px solid #ef4444', display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}><AlertCircle size={16} className="text-danger" /><span style={{ fontSize: '0.85rem' }}>{error}</span></div>}

      {filtered.length === 0 && !loading ? (
        <div className="empty-state glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <Package size={48} className="text-muted" />
          <h3>No customer orders</h3>
          <p>User bookings in <code>Marketplace</code> create <code>delivery_orders</code> via <code>POST /delivery/orders</code>. Delivery will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {filtered.map(o => (
            <div key={o.id} className="glass-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                <div>
                  <strong>{o.orderId} • {o.customer}</strong>
                  <p className="hint-text" style={{ fontSize: '0.8rem' }}>{o.address} • {o.items}</p>
                </div>
                <span className={`status-pill-small ${o.status === 'Delivered' ? 'success' : o.status === 'Pending' ? 'warning' : ''}`}>{o.status}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                <button className="btn btn-primary btn-xs" onClick={() => handleStatus(o.id, 'In Transit')} disabled={o.status !== 'Pending'}><Truck size={12} /> Accept → In Transit</button>
                <button className="btn btn-outline btn-xs" onClick={() => handleStatus(o.id, 'Delivered')} disabled={o.status === 'Delivered'}><CheckCircle size={12} /> Delivered</button>
                <button className="btn btn-ghost btn-xs text-danger" onClick={() => handleStatus(o.id, 'Pending')}><XCircle size={12} /> Reject → Pending</button>
                <span className="hint-text" style={{ fontSize: '0.7rem', marginLeft: 'auto', display: 'flex', gap: '0.3rem', alignItems: 'center' }}><Clock size={12} /> {new Date(o.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerOrders;
