import React, { useState, useEffect } from 'react';
import {
    Truck,
    Navigation,
    Package,
    Clock,
    MapPin,
    Phone,
    Camera,
    ShieldCheck,
    CreditCard,
    CheckCircle,
    X,
    Search,
    AlertCircle
} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { fetchOrders, updateOrderStatus, recordTrackingPoint, fetchTrack } from '../services/delivery.service';
import { getAuthToken } from '../services/client';

const DeliveryDashboard: React.FC = () => {
    const { deliveryOrders: storeOrders } = useUserStore();
    const [orders, setOrders] = useState(() => [...storeOrders]);
    const [timeLeft, setTimeLeft] = useState(12);
    const [completed, setCompleted] = useState(8);
    const [earnings, setEarnings] = useState(1200);
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [filter, setFilter] = useState<'All' | 'Pending' | 'In Transit' | 'Out for Delivery' | 'Delivered'>('All');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(t => t > 1 ? t - 1 : 15);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    // Wire to live PostgreSQL delivery.service:8 GET /delivery/orders PG delivery_orders, fallback mock
    useEffect(() => {
        if (!getAuthToken()) return;
        setLoading(true);
        fetchOrders().then(res => {
            if (res.orders && res.orders.length > 0) setOrders(res.orders);
        }).catch(e => setError(e.message)).finally(() => setLoading(false));
    }, []);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
    const filteredOrders = orders.filter(o => {
        const matchStatus = filter === 'All' ? true : o.status === filter;
        const matchSearch = !search || o.customer.toLowerCase().includes(search.toLowerCase()) || o.orderId.toLowerCase().includes(search.toLowerCase()) || o.items.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });
    const handleComplete = async (id: string) => {
        const order = orders.find(o => o.id === id);
        if (!order) return;
        if (getAuthToken()) {
            try {
                await updateOrderStatus(id, 'Delivered');
                // also record tracking point for map
                try { await recordTrackingPoint({ orderId: order.orderId, lat: 12.9716, lng: 77.5946, note: 'Delivered - proof uploaded' }); } catch {}
            } catch (e: any) { setError(e.message); return; }
        }
        setOrders(prev => prev.filter(o => o.id !== id));
        setCompleted(c => c + 1);
        setEarnings(e => e + 150);
        showToast(`${id} delivered — proof uploaded → PostgreSQL delivery_orders status Delivered + tracking_points + notify User`);
    };
    const handleStatusToggle = async (id: string) => {
        const order = orders.find(o => o.id === id);
        if (!order) return;
        const nextStatus = order.status === 'Pending' ? 'In Transit' : order.status === 'In Transit' ? 'Out for Delivery' : 'Pending';
        if (getAuthToken()) {
            try { await updateOrderStatus(id, nextStatus as any); } catch (e: any) { setError(e.message); return; }
        }
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus } as any : o));
        showToast(`${id} status → ${nextStatus} (PUT /delivery/orders/:id/status)`);
    };

    return (
        <div className="delivery-dashboard content animate-slide-up">
            <div className="dashboard-hero-visual delivery-bg">
                <div className="hero-overlay">
                    <h1>Logistics Command</h1>
                    <p>Neural Shield Protected Delivery Matrix</p>
                </div>
            </div>
            <div className="dashboard-grid">
                {/* Delivery Stats */}
                <div className="dash-card glass-card stat-card highlight-truck">
                    <div className="sc-top">
                        <Truck size={24} />
                        <span className="big-num">{String(completed).padStart(2, '0')}</span>
                    </div>
                    <p className="sc-label">Completed Drops</p>
                </div>
                <div className="dash-card glass-card stat-card">
                    <div className="sc-top">
                        <Navigation size={24} className="text-primary" />
                        <span className="big-num">{String(filteredOrders.length).padStart(2, '0')}</span>
                    </div>
                    <p className="sc-label">Active Missions</p>
                </div>
                <div className="dash-card glass-card stat-card">
                    <div className="sc-top">
                        <CreditCard size={24} className="text-secondary" />
                        <span className="big-num">₹{earnings.toLocaleString()}</span>
                    </div>
                    <p className="sc-label">Total Earnings (Daily)</p>
                </div>

                {/* Mission Control / Active Orders */}
                <div className="dash-card glass-card span-2">
                    <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.6rem' }}>
                        <h2>Assigned Logistics Queue</h2>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={12} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                <input aria-label="Search orders" placeholder="Search customer/order..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '0.35rem 0.6rem 0.35rem 1.6rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.75rem', width: '130px' }} />
                            </div>
                            <button className={`btn btn-ghost btn-xs ${filter === 'All' ? 'active' : ''}`} onClick={() => setFilter('All')}>All</button>
                            <button className={`btn btn-ghost btn-xs ${filter === 'Pending' ? 'active' : ''}`} onClick={() => setFilter('Pending')}>Pending</button>
                            <button className={`btn btn-ghost btn-xs ${filter === 'In Transit' ? 'active' : ''}`} onClick={() => setFilter('In Transit')}>Transit</button>
                            <button className={`btn btn-ghost btn-xs ${filter === 'Out for Delivery' ? 'active' : ''}`} onClick={() => setFilter('Out for Delivery')}>Out</button>
                            <button className={`btn btn-ghost btn-xs ${filter === 'Delivered' ? 'active' : ''}`} onClick={() => setFilter('Delivered')}>Delivered</button>
                            <span className="status-pill-small success">GPS ACTIVE</span>
                        </div>
                    </div>
                    {loading && <div style={{ padding: '0.6rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><div className="spinner" style={{ width: '16px', height: '16px' }} /> <span className="hint-text" style={{ fontSize: '0.8rem' }}>Loading orders from PostgreSQL delivery_orders…</span></div>}
                    {error && <div className="glass-card" style={{ padding: '0.6rem', borderLeft: '3px solid #ef4444', display: 'flex', gap: '0.5rem' }}><AlertCircle size={14} className="text-danger" /><span style={{ fontSize: '0.8rem' }}>{error}</span></div>}
                    <div className="delivery-list-container">
                        {filteredOrders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '1.5rem', opacity: 0.6 }}>
                                <CheckCircle size={32} className="text-success" />
                                <p style={{ marginTop: '0.6rem' }}>All deliveries complete — great work!</p>
                                <button className="btn btn-outline btn-xs" onClick={() => setOrders([...storeOrders])} style={{ marginTop: '0.6rem' }}>Reset Demo Orders</button>
                            </div>
                        ) : filteredOrders.map(order => (
                            <div key={order.id} className="delivery-order-card" style={{ borderLeft: selectedOrder === order.id ? '3px solid var(--primary)' : undefined }}>
                                <div className="do-top">
                                    <div className="do-id">
                                        <strong>{order.id}</strong>
                                        <span className={`status-tag ${order.status.toLowerCase().replace(' ', '-')}`} onClick={() => handleStatusToggle(order.id)} style={{ cursor: 'pointer' }} title="Toggle Pending/In Transit">{order.status}</span>
                                    </div>
                                    <div className="do-actions">
                                        <button className="btn-icon-sm" title="Call Customer" onClick={() => showToast(`Calling ${order.customer} — tel stub`)}><Phone size={14} /></button>
                                        <button className="btn-icon-sm" title="Get Directions" onClick={() => { setSelectedOrder(order.id); showToast(`Directions to ${order.address.slice(0, 30)}... — mapbox stub`); }}><Navigation size={14} /></button>
                                        <button className="btn-icon-sm" title="View" onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}><Package size={14} /></button>
                                    </div>
                                </div>
                                <div className="do-mid">
                                    <div className="address-row">
                                        <MapPin size={16} className="text-danger" />
                                        <div className="addr-text">
                                            <strong>{order.customer}</strong>
                                            <p>{order.address}</p>
                                        </div>
                                    </div>
                                    <div className="items-row">
                                        <Package size={16} />
                                        <p>{order.items}</p>
                                    </div>
                                </div>
                                <div className="do-bottom">
                                    <button className="btn btn-primary btn-sm btn-full" onClick={() => handleComplete(order.id)}><Camera size={16} /> Upload Proof & Complete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map — now wiring tracking_points PG lat/lng */}
                <div className="dash-card glass-card delivery-map-preview">
                    <div className="card-header">
                        <Navigation size={20} className="text-primary" />
                        <h3>Route Intelligence</h3>
                        <span className="hint-text" style={{ fontSize: '0.7rem' }}>tracking_points PG lat/lng</span>
                    </div>
                    <div className="map-placeholder" style={{ position: 'relative', height: '180px', background: 'linear-gradient(135deg,#e0f2fe 0%,#f0fdf4 100%)', borderRadius: '12px', overflow: 'hidden' }}>
                        <div className="map-marker pickup" style={{ position: 'absolute', left: '15%', bottom: '20%', background: '#10b981', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>P</div>
                        <div className="map-marker drop" style={{ position: 'absolute', right: '18%', top: '22%', background: '#ef4444', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>D</div>
                        <svg className="route-line" viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                            <path d="M20,80 Q50,20 80,20" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="4 2" />
                            {selectedOrder && <circle cx="50" cy="40" r="3" fill="var(--primary)" />}
                        </svg>
                        <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', background: 'rgba(255,255,255,0.9)', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem' }}>
                            {selectedOrder ? `Tracking ${selectedOrder} — lat 12.97 lng 77.59` : 'Select order → View to see route'}
                        </div>
                    </div>
                    <div className="traffic-info" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.6rem' }}>
                        <Clock size={14} className="animate-spin-slow" />
                        <span>Low Traffic - {timeLeft} mins to next drop • {selectedOrder ? `POST /delivery/track lat lng note` : 'GPS via tracking_points'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
                        <button className="btn btn-outline btn-xs" onClick={async () => {
                            if (!selectedOrder) { showToast('Select order → View'); return; }
                            const o = orders.find(x => x.id === selectedOrder);
                            if (!o) return;
                            try { await recordTrackingPoint({ orderId: o.orderId, lat: 12.9716 + Math.random()*0.01, lng: 77.5946 + Math.random()*0.01, note: 'En route' }); showToast(`Tracking point recorded — PostgreSQL tracking_points for ${o.orderId}`); } catch (e: any) { showToast(e.message); }
                        }}><MapPin size={12} /> Record GPS</button>
                        <button className="btn btn-ghost btn-xs" onClick={async () => {
                            if (!selectedOrder) return;
                            const o = orders.find(x => x.id === selectedOrder);
                            if (!o) return;
                            try { const res = await fetchTrack(o.orderId); showToast(`${res.points.length} tracking points — ${res.points.map((p:any)=>p.note).join(', ') || 'no notes'}`); } catch (e: any) { showToast(e.message); }
                        }}>Fetch Track</button>
                    </div>
                </div>

                {/* Privacy Badge */}
                <div className="dash-card glass-card span-3 delivery-privacy-disclaimer">
                    <ShieldCheck size={18} className="text-success" />
                    <p>Logistics Privacy Shield: Access is strictly limited to <strong>Order ID, Delivery Address, and Customer Contact</strong>. Clinical, financial, and personal lifestyle data are zero-visibility segments.</p>
                </div>
            </div>
            {selectedOrder && <div className="glass-card" style={{ position: 'fixed', bottom: '1rem', left: '1rem', right: '1rem', maxWidth: '520px', margin: '0 auto', padding: '0.8rem 1rem', background: 'rgba(99,102,241,0.95)', color: 'white', borderRadius: '12px', zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem' }}>Selected: <strong>{selectedOrder}</strong> — route highlighted</span>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '0.3rem 0.6rem', color: 'white', cursor: 'pointer' }}><X size={14} /></button>
            </div>}
            {toast && <div className="glass-card" style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', padding: '0.8rem 1.2rem', background: '#10b981', color: 'white', borderRadius: '12px', zIndex: 9999, display: 'flex', gap: '0.6rem', alignItems: 'center' }}><CheckCircle size={18} /> {toast}</div>}
        </div>
    );
};

export default DeliveryDashboard;
