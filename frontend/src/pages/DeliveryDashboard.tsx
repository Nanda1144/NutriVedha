import React from 'react';
import {
    Truck,
    Navigation,
    Package,
    Clock,
    MapPin,
    Phone,
    Camera,
    ShieldCheck,
    CreditCard
} from 'lucide-react';
import { useUserStore } from '../store/userStore';

const DeliveryDashboard: React.FC = () => {
    const { deliveryOrders } = useUserStore();
    const [timeLeft, setTimeLeft] = React.useState(12);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(t => t > 1 ? t - 1 : 15);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

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
                        <span className="big-num">08</span>
                    </div>
                    <p className="sc-label">Completed Drops</p>
                </div>
                <div className="dash-card glass-card stat-card">
                    <div className="sc-top">
                        <Navigation size={24} className="text-primary" />
                        <span className="big-num">02</span>
                    </div>
                    <p className="sc-label">Active Missions</p>
                </div>
                <div className="dash-card glass-card stat-card">
                    <div className="sc-top">
                        <CreditCard size={24} className="text-secondary" />
                        <span className="big-num">₹1.2k</span>
                    </div>
                    <p className="sc-label">Total Earnings (Daily)</p>
                </div>

                {/* Mission Control / Active Orders */}
                <div className="dash-card glass-card span-2">
                    <div className="card-header">
                        <h2>Assigned Logistics Queue</h2>
                        <span className="status-pill-small success">GPS ACTIVE</span>
                    </div>
                    <div className="delivery-list-container">
                        {deliveryOrders.map(order => (
                            <div key={order.id} className="delivery-order-card">
                                <div className="do-top">
                                    <div className="do-id">
                                        <strong>{order.id}</strong>
                                        <span className={`status-tag ${order.status.toLowerCase().replace(' ', '-')}`}>{order.status}</span>
                                    </div>
                                    <div className="do-actions">
                                        <button className="btn-icon-sm" title="Call Customer"><Phone size={14} /></button>
                                        <button className="btn-icon-sm" title="Get Directions"><Navigation size={14} /></button>
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
                                    <button className="btn btn-primary btn-sm btn-full"><Camera size={16} /> Upload Proof & Complete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map Simulation */}
                <div className="dash-card glass-card delivery-map-preview">
                    <div className="card-header">
                        <Navigation size={20} className="text-primary" />
                        <h3>Route Intelligence</h3>
                    </div>
                    <div className="map-placeholder">
                        <div className="map-marker pickup">P</div>
                        <div className="map-marker drop">D</div>
                        <svg className="route-line" viewBox="0 0 100 100">
                            <path d="M20,80 Q50,20 80,20" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="4 2" />
                        </svg>
                    </div>
                    <div className="traffic-info">
                        <Clock size={14} className="animate-spin-slow" />
                        <span>Low Traffic - {timeLeft} mins to next drop</span>
                    </div>
                </div>

                {/* Privacy Badge */}
                <div className="dash-card glass-card span-3 delivery-privacy-disclaimer">
                    <ShieldCheck size={18} className="text-success" />
                    <p>Logistics Privacy Shield: Access is strictly limited to <strong>Order ID, Delivery Address, and Customer Contact</strong>. Clinical, financial, and personal lifestyle data are zero-visibility segments.</p>
                </div>
            </div>
        </div>
    );
};

export default DeliveryDashboard;
