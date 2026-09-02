import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Download, AlertCircle, Search } from 'lucide-react';
import { fetchEarnings } from '../services/farmer.service';
import { getAuthToken } from '../services/client';

const FarmerReports: React.FC = () => {
  const [earnings, setEarnings] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true); setError(null);
    if (!getAuthToken()) { setError('Login as Farmer to see sales reports'); setLoading(false); return; }
    try {
      const res = await fetchEarnings();
      setEarnings(res.earnings);
      setTotal(res.total);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const filtered = earnings.filter(e => e.month.toLowerCase().includes(search.toLowerCase()) || e.source.toLowerCase().includes(search.toLowerCase()));

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ earnings, total, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `farmer-earnings-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="container section-padding">
      <div className="section-header">
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <BarChart3 size={28} className="text-primary" />
          <h1>Sales & Order Reports</h1>
          <span className="status-pill-small success">₹{total.toLocaleString()} total</span>
        </div>
        <p>PostgreSQL <code>farmer_earnings</code> `month amount source` via <code>farmer:3012 GET /farmer/earnings</code> + <code>analytics audit_logs</code></p>
      </div>

      <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1rem' }}>
        <Search size={18} className="text-muted" />
        <input aria-label="Search earnings" placeholder="Search month or source (e.g. Jan, Marketplace)" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent' }} />
        <button className="btn btn-outline btn-xs" onClick={load}>Refresh</button>
        <button className="btn btn-primary btn-xs" onClick={handleExport}><Download size={14} /> Export</button>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>
        <TrendingUp size={32} className="text-success" />
        <h2>₹{total.toLocaleString()}</h2>
        <p className="hint-text">Total Sales • {earnings.length} records</p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.8rem', flexWrap: 'wrap' }}>
          {earnings.slice(0, 6).map((e: any) => (
            <div key={e.id} className="glass-card" style={{ padding: '0.6rem 0.8rem', minWidth: '100px' }}>
              <strong>{e.month}</strong><p className="hint-text" style={{ fontSize: '0.8rem' }}>₹{e.amount} • {e.source}</p>
            </div>
          ))}
        </div>
      </div>

      {loading && <div className="loading-state"><div className="spinner" /><p>Loading earnings…</p></div>}
      {error && <div className="glass-card" style={{ padding: '0.8rem', borderLeft: '3px solid #ef4444', display: 'flex', gap: '0.6rem' }}><AlertCircle size={16} className="text-danger" /><span style={{ fontSize: '0.85rem' }}>{error}</span></div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {filtered.map((e: any) => (
          <div key={e.id} className="glass-card" style={{ padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong><Calendar size={12} /> {e.month}</strong> • {e.source}
            </div>
            <span className="status-pill-small success">₹{e.amount}</span>
          </div>
        ))}
      </div>
      {filtered.length === 0 && !loading && <div className="empty-state glass-card" style={{ textAlign: 'center', padding: '2rem' }}><BarChart3 size={48} className="text-muted" /><h3>No sales yet</h3><p>Earnings appear here when bookings are marked <code>Delivered</code> via <code>farmer_earnings</code></p></div>}
    </div>
  );
};

export default FarmerReports;
