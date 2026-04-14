import React from 'react';
import {
    Video,
    Upload,
    Activity,
    TrendingUp,
    Calendar,
    Award,
    Dumbbell,
    MessageCircle
} from 'lucide-react';
import { useUserStore } from '../store/userStore';

const TrainerDashboard: React.FC = () => {
    const { traineeData } = useUserStore();
    const [engagement, setEngagement] = React.useState(14);
    const [liveSessionActive, setLiveSessionActive] = React.useState(false);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setEngagement(e => Math.min(25, Math.max(10, e + (Math.random() > 0.5 ? 0.1 : -0.1))));
            if (Math.random() > 0.95) setLiveSessionActive(prev => !prev);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="trainer-dashboard content animate-slide-up">
            <div className="dashboard-hero-visual trainer-bg">
                <div className="hero-overlay">
                    <h1>Fitness Optimization</h1>
                    <p>Live Bio-Metric Trainee Monitoring System</p>
                </div>
            </div>
            <div className="dashboard-grid">
                {/* Trainer ID & Profile */}
                <div className="dash-card glass-card span-2 trainer-hero">
                    <div className="hero-info">
                        <div className="trainer-badge-premium">
                            <Award size={16} /> ELITE COACH
                        </div>
                        <h2>Ayur-Fitness Command</h2>
                        <p>ID: <span className="text-secondary font-mono">TRAIN-9942-X</span></p>
                        <div className="session-quick-start">
                            <button className={`btn btn-primary ${liveSessionActive ? 'pulse-heavy' : ''}`}>
                                <Video size={18} /> {liveSessionActive ? 'BROADCASTING LIVE' : 'GO LIVE NOW'}
                            </button>
                            <button className="btn btn-outline"><Upload size={18} /> UPLOAD CONTENT</button>
                        </div>
                    </div>
                </div>

                {/* Engagement Stats */}
                <div className="dash-card glass-card">
                    <div className="card-header">
                        <TrendingUp size={20} className="text-fitness" />
                        <h3>Monthly Growth</h3>
                    </div>
                    <div className="engagement-metric">
                        <div className="e-val">+{engagement.toFixed(1)}%</div>
                        <p>Student Engagement</p>
                    </div>
                    <div className="e-subtext">08 New Students this week</div>
                </div>

                {/* Trainee Management List */}
                <div className="dash-card glass-card span-2">
                    <div className="card-header">
                        <h3>Active Trainee Analytics</h3>
                        <div className="view-toggle">
                            <button className="btn btn-ghost btn-xs active">All</button>
                            <button className="btn btn-ghost btn-xs">High Risk</button>
                        </div>
                    </div>
                    <div className="trainer-table-container">
                        <table className="trainer-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Goal</th>
                                    <th>Compliance</th>
                                    <th>Daily Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {traineeData.map((t, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <div className="student-pill">
                                                <div className="s-avatar">{t.name.charAt(0)}</div>
                                                <span>{t.name}</span>
                                            </div>
                                        </td>
                                        <td>{t.goal}</td>
                                        <td>
                                            <div className="compliance-row">
                                                <div className="compliance-bar">
                                                    <div className="c-fill" style={{ width: `${t.compliance}%` }}></div>
                                                </div>
                                                <span>{t.compliance}%</span>
                                            </div>
                                        </td>
                                        <td><span className={`status-pill-small ${t.status === 'Completed' ? 'success' : 'warning'}`}>{t.status}</span></td>
                                        <td>
                                            <div className="action-btns">
                                                <button className="btn-icon-sm" title="Message"><MessageCircle size={14} /></button>
                                                <button className="btn-icon-sm" title="View Progress"><Activity size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Live Session Schedule */}
                <div className="dash-card glass-card">
                    <div className="card-header">
                        <Calendar size={20} className="text-primary" />
                        <h3>Session Calendar</h3>
                    </div>
                    <div className="schedule-mini">
                        {[
                            { time: '06:30 AM', title: 'Yoga Flow (Vata)', type: 'Yoga' },
                            { time: '05:00 PM', title: 'HIIT Core (Kapha)', type: 'Gym' },
                        ].map((session, i) => (
                            <div key={i} className="session-item">
                                <div className="s-time">{session.time}</div>
                                <div className="s-info">
                                    <strong>{session.title}</strong>
                                    <span>{session.type}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="btn btn-outline btn-xs btn-full mt-10">Manage Calendar</button>
                </div>

                {/* Data Privacy Tag */}
                <div className="dash-card glass-card span-3 trainer-privacy-tag">
                    <div className="tag-inner">
                        <Dumbbell size={16} />
                        <span>Protocol Activated: Trainer access limited to <strong>Fitness & Activity Data</strong> only. No exposure of clinical medical history or financial data.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
