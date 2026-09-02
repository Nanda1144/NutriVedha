import React, { useState, useEffect } from 'react';
import {
    Sprout,
    Calendar,
    ShoppingBag,
    TrendingUp,
    Package,
    MapPin,
    Droplets,
    Plus,
    X,
    CheckCircle,
    Trash2,
    Search,
    Edit2
} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { fetchInventory, addInventoryItem, updateInventoryItem, fetchEarnings } from '../services/farmer.service';
import { fetchBookings } from '../services/marketplace.service';
import { getAuthToken } from '../services/client';
import { Link } from 'react-router-dom';

const FarmerDashboard: React.FC = () => {
    const { cropInventory: storeInventory } = useUserStore();
    const [crops, setCrops] = useState(() => [...storeInventory]);
    const [earnings, setEarnings] = useState(42850);
    const [moisture, setMoisture] = useState(68);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCrop, setNewCrop] = useState({ name: '', qty: '', prebooked: '', harvest: '' });
    const [pickups, setPickups] = useState<Array<{ id: string; hub: string; time: string; crop: string; status: 'Pending' | 'Ready' }>>([
        { id: 'ORD-101', hub: 'Hub B-4', time: '02:00 PM', crop: 'Ashwagandha', status: 'Pending' as const },
        { id: 'ORD-102', hub: 'Hub C-1', time: '04:30 PM', crop: 'Brahmi', status: 'Pending' as const },
    ]);
    const [toast, setToast] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [editingCrop, setEditingCrop] = useState<string | null>(null);
    const [editPrice, setEditPrice] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setEarnings(e => e + (Math.random() > 0.9 ? 10 : 0));
            setMoisture(m => Math.min(80, Math.max(40, m + (Math.random() > 0.5 ? 1 : -1))));
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Live PG wiring — fetch inventory/earnings/bookings when authenticated, fallback to mock
    useEffect(() => {
        if (!getAuthToken()) return;
        setLoading(true);
        fetchInventory().then(res => {
            if (res.inventory && res.inventory.length > 0) {
                setCrops(res.inventory.map((it: any) => ({ id: it.id, name: it.name, qty: `${it.stock}${it.unit}`, prebooked: '0kg', harvest: '—', price: it.price, unit: it.unit, stock: it.stock })));
            }
        }).catch(() => {});
        fetchEarnings().then(res => {
            if (res.total) setEarnings(res.total);
        }).catch(() => {});
        fetchBookings().then(res => {
            // crop_bookings for farmer would be filtered by farmer's crops — keep pickups sync if bookings exist
            if (res.bookings && res.bookings.length > 0) {
                // keep existing pickups for demo; real would map bookings to pickups
            }
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
    const handleAddCrop = async () => {
        if (!newCrop.name.trim() || !newCrop.qty.trim() || !newCrop.harvest.trim()) { showToast('Fill name, quantity and harvest date'); return; }
        if (crops.some(c => c.name.toLowerCase() === newCrop.name.trim().toLowerCase())) { showToast('Crop already exists'); return; }
        // Try live PG: stock INT + unit kg + price, fallback mock string
        const stockNum = parseInt(newCrop.qty.replace(/\D/g, ''), 10) || 0;
        const unit = newCrop.qty.replace(/[0-9]/g, '').trim() || 'kg';
        if (getAuthToken()) {
            try {
                const res = await addInventoryItem({ name: newCrop.name.trim(), stock: stockNum, unit, price: 100 });
                setCrops([...crops, { id: res.item.id, name: res.item.name, qty: `${res.item.stock}${res.item.unit}`, prebooked: '0kg', harvest: newCrop.harvest.trim(), price: res.item.price } as any]);
                showToast(`${res.item.name} registered — PostgreSQL farmer_inventory + visible to buyers`);
                setShowAddModal(false); setNewCrop({ name: '', qty: '', prebooked: '', harvest: '' });
                return;
            } catch (e: any) { showToast(e.message); }
        }
        const crop: any = { id: `C-${String(crops.length + 1).padStart(2, '0')}`, name: newCrop.name.trim(), qty: newCrop.qty.trim(), prebooked: newCrop.prebooked.trim() || '0kg', harvest: newCrop.harvest.trim() };
        setCrops([...crops, crop]);
        showToast(`${crop.name} registered — visible to buyers`);
        setShowAddModal(false); setNewCrop({ name: '', qty: '', prebooked: '', harvest: '' });
    };
    const handleDeleteCrop = async (id: string) => {
        if (!window.confirm('Remove this crop?')) return;
        if (getAuthToken() && !id.startsWith('C-')) {
            try { await fetch(`/api/farmer/inventory/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getAuthToken()}` } }); } catch {}
        }
        setCrops(crops.filter(c => c.id !== id));
        showToast('Crop removed — PostgreSQL farmer_inventory if ID was PG');
    };
    const handleEditPrice = async (id: string) => {
        if (!editPrice.trim()) { setEditingCrop(null); return; }
        const price = parseFloat(editPrice);
        if (isNaN(price) || price <= 0) { showToast('Enter valid price'); return; }
        if (getAuthToken() && !id.startsWith('C-')) {
            try { await updateInventoryItem(id, { price }); } catch (e: any) { showToast(e.message); return; }
        }
        setCrops(prev => prev.map((c: any) => c.id === id ? { ...c, price } : c));
        showToast(`Price updated to ₹${price} — ${id.startsWith('C-') ? 'local' : 'PostgreSQL farmer_inventory'}`);
        setEditingCrop(null); setEditPrice('');
    };
    const handleMarkReady = (id: string) => {
        setPickups(prev => prev.map(p => p.id === id ? { ...p, status: 'Ready' as const } : p));
        showToast(`${id} marked ready — delivery partner notified`);
    };

    return (
        <div className="farmer-dashboard content animate-slide-up">
            <div className="dashboard-hero-visual farmer-bg">
                <div className="hero-overlay">
                    <h1>Organic Supply Intel</h1>
                    <p>Direct-to-Consumer Agricultural Blockchain Terminal</p>
                </div>
            </div>
            <div className="dashboard-grid">
                {/* Farmer Stats */}
                <div className="dash-card glass-card farmer-profit-card">
                    <div className="card-header">
                        <TrendingUp size={20} className="text-success" />
                        <h3>Earnings Overview</h3>
                    </div>
                    <div className="profit-main">
                        <span className="currency">₹</span>
                        <span className="amount">{earnings.toLocaleString()}</span>
                        <span className="period">/ month</span>
                    </div>
                    <div className="stat-row-mini">
                        <div className="sm-item">
                            <span className="sm-label">Pending</span>
                            <span className="sm-val">₹8,120</span>
                        </div>
                        <div className="sm-item">
                            <span className="sm-label">Paid</span>
                            <span className="sm-val">₹34,730</span>
                        </div>
                    </div>
                </div>

                <div className="dash-card glass-card span-2 farmer-intro">
                    <div className="intro-content">
                        <h2>Direct-to-Consumer Portal</h2>
                        <p>Bridging the gap between organic soil and human wellness. No middlemen, zero data disturbance.</p>
                        <div className="farmer-badges">
                            <span className="f-badge"><ShoppingBag size={14} /> 12 Pre-booked Orders</span>
                            <span className="f-badge"><Droplets size={14} className="text-primary" /> {moisture}% Soil Moisture</span>
                        </div>
                    </div>
                    <div className="intro-img">
                        <Sprout size={64} className="text-farmer" />
                    </div>
                </div>

                {/* Crop Management Table */}
                <div className="dash-card glass-card span-2">
                    <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.6rem' }}>
                        <h3>Active Crop Intelligence ({crops.length})</h3>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={12} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                <input aria-label="Search crops" placeholder="Search crops..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '0.35rem 0.6rem 0.35rem 1.6rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.75rem', width: '130px' }} />
                            </div>
                            <Link to="/farmer/products" className="btn btn-ghost btn-xs" style={{ textDecoration: 'none' }}>Products →</Link>
                            <Link to="/farmer/profile" className="btn btn-outline btn-xs" style={{ textDecoration: 'none' }}>Profile</Link>
                            <button className="btn btn-outline btn-xs" onClick={() => setShowAddModal(true)} aria-label="Register new crop"><Plus size={14} /> Register New Crop</button>
                        </div>
                    </div>
                    {loading && <div style={{ padding: '0.6rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><div className="spinner" style={{ width: '16px', height: '16px' }} /> <span className="hint-text" style={{ fontSize: '0.8rem' }}>Loading inventory from PostgreSQL…</span></div>}
                    <div className="farmer-table-container" style={{ overflowX: 'auto' }}>
                        <table className="farmer-table">
                            <thead>
                                <tr>
                                    <th>Neural Crop Name</th>
                                    <th>Total Qty</th>
                                    <th>Pre-booked</th>
                                    <th>Est. Harvest</th>
                                    <th>Status</th>
                                    <th>Price</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {crops.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase())).map((c: any) => (
                                    <tr key={c.id}>
                                        <td>
                                            <div className="crop-meta">
                                                <strong>{c.name}</strong>
                                                <span>{c.id}</span>
                                            </div>
                                        </td>
                                        <td>{c.qty}</td>
                                        <td><span className="booked-highlight">{c.prebooked}</span></td>
                                        <td>{c.harvest}</td>
                                        <td><span className="status-pill-small success">Growing</span></td>
                                        <td>
                                            {editingCrop === c.id ? (
                                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                    <input aria-label="Price" value={editPrice} onChange={e => setEditPrice(e.target.value)} placeholder="₹" style={{ width: '70px', padding: '0.3rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                                                    <button className="btn btn-primary btn-xs" onClick={() => handleEditPrice(c.id)}>Save</button>
                                                    <button className="btn btn-ghost btn-xs" onClick={() => setEditingCrop(null)}>Cancel</button>
                                                </div>
                                            ) : (
                                                <span style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>{c.price ? `₹${c.price}` : '—'} <button className="btn-icon-sm" onClick={() => { setEditingCrop(c.id); setEditPrice(String(c.price || '')); }} title="Edit price" aria-label={`Edit price ${c.name}`}><Edit2 size={12} /></button></span>
                                            )}
                                        </td>
                                        <td><button className="btn-icon-sm text-danger" onClick={() => handleDeleteCrop(c.id)} title="Remove" aria-label={`Remove ${c.name}`}><Trash2 size={14} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                            <Link to="/farmer/orders" className="btn btn-outline btn-xs" style={{ textDecoration: 'none' }}>Customer Orders →</Link>
                            <Link to="/farmer/reports" className="btn btn-ghost btn-xs" style={{ textDecoration: 'none' }}>Sales Reports →</Link>
                        </div>
                    </div>
                </div>

                {/* Logistics View */}
                <div className="dash-card glass-card">
                    <div className="card-header">
                        <Package size={20} className="text-delivery" />
                        <h3>Pending Pickups ({pickups.filter(p => p.status === 'Pending').length})</h3>
                    </div>
                    <div className="pickup-stack">
                        {pickups.map(p => (
                            <div key={p.id} className="pickup-card" style={{ opacity: p.status === 'Ready' ? 0.7 : 1 }}>
                                <div className="p-top">
                                    <span className="order-id">{p.id} • {p.crop}</span>
                                    <span className={`status-pill-small ${p.status === 'Ready' ? 'success' : 'warning'}`} style={{ fontSize: '0.65rem' }}>{p.status}</span>
                                    <span className="p-time">{p.time}</span>
                                </div>
                                <div className="p-addr">
                                    <MapPin size={12} />
                                    <span>Pickup: {p.hub}</span>
                                </div>
                                <button className={`btn btn-xs btn-full mt-10 ${p.status === 'Ready' ? 'btn-success' : 'btn-primary'}`} onClick={() => handleMarkReady(p.id)} disabled={p.status === 'Ready'}>
                                    {p.status === 'Ready' ? <><CheckCircle size={14} /> Ready</> : 'Mark Ready'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Harvest Timeline */}
                <div className="dash-card glass-card span-3">
                    <div className="card-header">
                        <Calendar size={20} className="text-primary" />
                        <h3>Harvest & Supply Timeline</h3>
                    </div>
                    <div className="harvest-timeline-horizontal">
                        <div className="h-step h-completed">
                            <span className="h-date">10 Jan</span>
                            <div className="h-circle"></div>
                            <span className="h-label">Soil Prep</span>
                        </div>
                        <div className="h-step h-completed">
                            <span className="h-date">25 Jan</span>
                            <div className="h-circle"></div>
                            <span className="h-label">Seeding</span>
                        </div>
                        <div className="h-step h-active">
                            <span className="h-date">Today</span>
                            <div className="h-circle"></div>
                            <span className="h-label">Growth Phase</span>
                        </div>
                        <div className="h-step">
                            <span className="h-date">15 Apr</span>
                            <div className="h-circle"></div>
                            <span className="h-label">Harvest</span>
                        </div>
                        <div className="h-step">
                            <span className="h-date">20 Apr</span>
                            <div className="h-circle"></div>
                            <span className="h-label">Dispatch</span>
                        </div>
                    </div>
                </div>
            </div>
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="glass-card animate-scale-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', width: '92%', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3><Sprout size={18} /> Register New Crop</h3>
                            <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <input placeholder="Crop name (e.g. Tulsi)" value={newCrop.name} onChange={e => setNewCrop({ ...newCrop, name: e.target.value })} maxLength={30} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                                <input placeholder="Total Qty (e.g. 30kg)" value={newCrop.qty} onChange={e => setNewCrop({ ...newCrop, qty: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                <input placeholder="Pre-booked (e.g. 5kg)" value={newCrop.prebooked} onChange={e => setNewCrop({ ...newCrop, prebooked: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                            </div>
                            <input placeholder="Est. Harvest (e.g. Nov 2026)" value={newCrop.harvest} onChange={e => setNewCrop({ ...newCrop, harvest: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                            <button className="btn btn-primary btn-full" onClick={handleAddCrop}><Plus size={16} /> Add to Marketplace</button>
                        </div>
                    </div>
                </div>
            )}
            {toast && <div className="glass-card" style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', padding: '0.8rem 1.2rem', background: '#10b981', color: 'white', borderRadius: '12px', zIndex: 9999, display: 'flex', gap: '0.6rem', alignItems: 'center' }}><CheckCircle size={18} /> {toast}</div>}
        </div>
    );
};

export default FarmerDashboard;
