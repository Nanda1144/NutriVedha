import React, { useEffect, useState } from 'react';
import { Truck, MapPin, Package, CheckCircle, Navigation, Search, AlertCircle } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { fetchBookings } from '../services/marketplace.service';
import { getAuthToken } from '../services/client';
import './DeliveryTracking.css';

const DeliveryTracking: React.FC = () => {
  const { cropBookings } = useUserStore();
  const [bookings, setBookings] = useState<any[]>(cropBookings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true); setError(null);
    if (getAuthToken()) {
      try {
        const res = await fetchBookings();
        // marketplace.service bookings have .crop nested
        setBookings(res.bookings.length ? res.bookings : cropBookings);
      } catch (e: any) { setError(e.message); setBookings(cropBookings); }
    } else {
      setBookings(cropBookings);
    }
    setLoading(false);
  };
  useEffect(() => { void load(); }, [cropBookings.length]);

  const filtered = bookings.filter(b => {
    const name = (b.crop?.name || b.crop?.name || '').toLowerCase();
    return name.includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="delivery-tracking-page container section-padding">
      <div className="section-header">
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <Truck size={28} className="text-primary" />
          <h1>Delivery Tracking</h1>
        </div>
        <p>Live `crop_bookings.status` `Growing → Harvested → Packed → Out for Delivery → Delivered` via `GET /api/marketplace/bookings` + `delivery.service:6` GPS `tracking_points`</p>
      </div>

      <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1rem' }}>
        <Search size={18} className="text-muted" />
        <input placeholder="Search booking ID or crop" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent' }} />
        <button className="btn btn-outline btn-xs" onClick={load}>Refresh</button>
        <span className="hint-text">{filtered.length} bookings</span>
      </div>

      {loading && <div className="loading-state"><div className="spinner" /><p>Tracking shipments…</p></div>}
      {error && <div className="glass-card" style={{ padding: '0.8rem', borderLeft: '3px solid #ef4444', display: 'flex', gap: '0.6rem' }}><AlertCircle size={16} className="text-danger" /><span style={{ fontSize: '0.85rem' }}>{error}</span></div>}

      {filtered.length === 0 && !loading ? (
        <div className="empty-state glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <Package size={48} className="text-muted" />
          <h3>No shipments</h3>
          <p>Book a crop in <a href="/marketplace">Marketplace</a> to generate a tracking timeline.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(b => (
            <div key={b.id} className="glass-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{b.crop?.name || b.cropId}</strong>
                  <p className="hint-text" style={{ fontSize: '0.8rem' }}>{b.id} • Qty {b.quantity}kg • ₹{b.totalPrice} • {b.orderDate}</p>
                </div>
                <span className={`status-pill-small ${b.status === 'Delivered' ? 'success' : b.status === 'Growing' ? 'warning' : ''}`}>{b.status}</span>
              </div>
              <div className="tracker-steps" style={{ display: 'flex', gap: '0.6rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
                {['Growing','Harvested','Packed','Out for Delivery','Delivered'].map((step, idx, arr) => {
                  const active = b.status === step;
                  const completed = arr.indexOf(b.status) > idx;
                  return (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: active || completed ? 1 : 0.4 }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: completed ? '#10b981' : active ? '#f59e0b' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {completed ? <CheckCircle size={12} color="white" /> : null}
                      </div>
                      <span style={{ fontSize: '0.75rem' }}>{step}</span>
                    </div>
                  );
                })}
              </div>
              {b.crop?.farmer && <p className="hint-text" style={{ fontSize: '0.75rem', marginTop: '0.6rem' }}><MapPin size={12} /> Farmer: {b.crop.farmer.name} • {b.crop.farmer.location}</p>}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                <button className="btn btn-outline btn-xs" onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(b.crop?.farmer?.location || 'India')}`, '_blank')}><Navigation size={14} /> Map</button>
                <span className="hint-text" style={{ fontSize: '0.7rem' }}>{b.paymentIntentId || 'pi_sim_...'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryTracking;
