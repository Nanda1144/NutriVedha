import React from 'react';
import {
    Activity,
    FileText,
    Dumbbell,
    Sprout,
    Truck,
    Star,
    Clock,
    ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

const UserDashboard: React.FC = () => {
    const { reports, fitnessProfile, systemUpdates } = useUserStore();
    const [liveScore, setLiveScore] = React.useState(92);
    const [pulse, setPulse] = React.useState(72);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setLiveScore(s => Math.min(100, Math.max(85, s + (Math.random() > 0.5 ? 0.1 : -0.1))));
            setPulse(p => Math.min(85, Math.max(65, p + (Math.random() > 0.5 ? 1 : -1))));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="user-dashboard-content animate-slide-up">
            <div className="dashboard-hero-visual doctor-bg">
                <div className="hero-overlay">
                    <h1>Personal Health Command</h1>
                    <p>Real-time Bio-Intelligence & Lifestyle Optimization</p>
                </div>
            </div>
            <div className="dashboard-grid">
                {/* Health Summary Card */}
                <div className="dash-card glass-card span-2 profile-preview">
                    <div className="card-header">
                        <h2>Neural Health Summary</h2>
                        <span className="badge-outline">Live Sync</span>
                    </div>
                    <div className="profile-metrics-row">
                        <div className="metric-pill">
                            <span className="label">Health Score</span>
                            <span className="value">{liveScore.toFixed(1)}/100</span>
                        </div>
                        <div className="metric-pill">
                            <span className="label">Active Phase</span>
                            <span className="value">{fitnessProfile.bodyType || 'Analyzing'}</span>
                        </div>
                        <div className="metric-pill">
                            <span className="label">Neural Pulse</span>
                            <span className="value text-success">{pulse} BPM</span>
                        </div>
                    </div>
                </div>

                {/* AI Recommendations */}
                <div className="dash-card glass-card">
                    <div className="card-header">
                        <Activity size={20} className="text-secondary" />
                        <h3>AI Prescription</h3>
                    </div>
                    <ul className="rec-list">
                        <li>Increase water intake by 500ml</li>
                        <li>Optimal yoga window: 6:00 AM</li>
                        <li>Reduce spicy food (Pitta high)</li>
                    </ul>
                    <Link to="/scan" className="btn btn-ghost btn-xs btn-full">View Full Analysis</Link>
                </div>

                {/* Medical Reports */}
                <div className="dash-card glass-card">
                    <div className="card-header">
                        <FileText size={20} className="text-primary" />
                        <h3>Medical Reports</h3>
                    </div>
                    <div className="mini-report-list">
                        {reports.slice(0, 2).map(r => (
                            <div key={r.id} className="mini-report-item">
                                <span className={`risk-dot ${r.severity.toLowerCase()}`}></span>
                                <div>
                                    <p className="report-name">{r.condition}</p>
                                    <p className="report-date">{r.date}</p>
                                </div>
                                <ArrowUpRight size={14} className="ms-auto text-muted" />
                            </div>
                        ))}
                    </div>
                    <Link to="/profile" className="btn btn-outline btn-xs btn-full mt-10">Manage Vault</Link>
                </div>

                {/* Lifestyle & Fitness */}
                <div className="dash-card glass-card">
                    <div className="card-header">
                        <Dumbbell size={20} className="text-fitness" />
                        <h3>Fitness & Yoga</h3>
                    </div>
                    <div className="fitness-stats">
                        <div className="streak-display">
                            <span className="streak-num">7</span>
                            <span className="streak-label">Day Streak</span>
                        </div>
                        <div className="next-session">
                            <p className="tiny-label">Next Session</p>
                            <p className="session-name">Surya Namaskar</p>
                            <p className="session-time">Tom, 06:30 AM</p>
                        </div>
                    </div>
                    <Link to="/fitness" className="btn btn-primary btn-sm btn-full mt-10">Launch Trainer</Link>
                </div>

                {/* Crop Pre-bookings */}
                <div className="dash-card glass-card">
                    <div className="card-header">
                        <Sprout size={20} className="text-farmer" />
                        <h3>Crop Intelligence</h3>
                    </div>
                    <div className="crop-status-box">
                        <div className="crop-mini-item">
                            <img src="https://images.unsplash.com/photo-1615485290382-441e4d019cb5?w=100&q=80" alt="Ashwagandha" />
                            <div className="crop-mini-info">
                                <strong>Ashwagandha</strong>
                                <span>Phase: Growth</span>
                            </div>
                            <span className="status-percent">65%</span>
                        </div>
                    </div>
                    <div className="progress-bar-small">
                        <div className="progress-fill" style={{ width: '65%' }}></div>
                    </div>
                    <Link to="/marketplace" className="btn btn-outline btn-xs btn-full mt-10">Track Harvest</Link>
                </div>

                {/* Orders & Deliveries */}
                <div className="dash-card glass-card span-2 orders-overview">
                    <div className="card-header">
                        <Truck size={20} className="text-delivery" />
                        <h3>Orders & Logistics</h3>
                    </div>
                    <div className="order-timeline-horizontal">
                        <div className="timeline-step completed">
                            <div className="step-point"></div>
                            <span>Placed</span>
                        </div>
                        <div className="timeline-step completed">
                            <div className="step-point"></div>
                            <span>Growing</span>
                        </div>
                        <div className="timeline-step active">
                            <div className="step-point pulse"></div>
                            <span>Harvested</span>
                        </div>
                        <div className="timeline-step">
                            <div className="step-point"></div>
                            <span>Delivery</span>
                        </div>
                    </div>
                    <div className="active-order-details">
                        <div className="order-main">
                            <strong>Order #AI-88392</strong>
                            <p>Direct from Organic Farm (Kolar)</p>
                        </div>
                        <div className="order-eta">
                            <Clock size={14} />
                            <span>ETA: 2 Days</span>
                        </div>
                    </div>
                </div>

                {/* System Bulletins */}
                <div className="dash-card glass-card system-bulletins">
                    <div className="card-header">
                        <Star size={20} className="text-warning" />
                        <h3>Global Intelligence</h3>
                    </div>
                    <div className="bulletin-briefs">
                        {systemUpdates.slice(0, 1).map((update, i) => (
                            <div key={i} className="bulletin-item">
                                <strong>{update.title}</strong>
                                <p>{update.content.substring(0, 60)}...</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
