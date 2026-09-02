import React from 'react';
import {
    Sprout,
    Calendar,
    ShoppingBag,
    TrendingUp,
    Package,
    MapPin,
    Droplets
} from 'lucide-react';
import { useUserStore } from '../store/userStore';

const FarmerDashboard: React.FC = () => {
    const { cropInventory } = useUserStore();
    const [earnings, setEarnings] = React.useState(42850);
    const [moisture, setMoisture] = React.useState(68);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setEarnings(e => e + (Math.random() > 0.9 ? 10 : 0));
            setMoisture(m => Math.min(80, Math.max(40, m + (Math.random() > 0.5 ? 1 : -1))));
        }, 4000);
        return () => clearInterval(interval);
    }, []);

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
                    <div className="card-header">
                        <h3>Active Crop Intelligence</h3>
                        <button className="btn btn-outline btn-xs">Register New Crop</button>
                    </div>
                    <div className="farmer-table-container">
                        <table className="farmer-table">
                            <thead>
                                <tr>
                                    <th>Neural Crop Name</th>
                                    <th>Total Qty</th>
                                    <th>Pre-booked</th>
                                    <th>Est. Harvest</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cropInventory.map(c => (
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Logistics View */}
                <div className="dash-card glass-card">
                    <div className="card-header">
                        <Package size={20} className="text-delivery" />
                        <h3>Pending Pickups</h3>
                    </div>
                    <div className="pickup-stack">
                        {[1, 2].map(i => (
                            <div key={i} className="pickup-card">
                                <div className="p-top">
                                    <span className="order-id">ORD #10{i}</span>
                                    <span className="p-time">02:00 PM</span>
                                </div>
                                <div className="p-addr">
                                    <MapPin size={12} />
                                    <span>Pickup: Hub B-4</span>
                                </div>
                                <button className="btn btn-primary btn-xs btn-full mt-10">Mark Ready</button>
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
        </div>
    );
};

export default FarmerDashboard;
