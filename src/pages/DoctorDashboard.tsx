import React from 'react';
import {
    Users,
    FileText,
    Video,
    ShieldCheck,
    MessageSquare,
    CheckCircle,
    Plus,
    Activity,
    AlertCircle
} from 'lucide-react';
import { useUserStore } from '../store/userStore';

const DoctorDashboard: React.FC = () => {
    const { patients } = useUserStore();
    const [pendingConsults, setPendingConsults] = React.useState(4);

    React.useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.8) {
                setPendingConsults(p => p + 1);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="doctor-dashboard content animate-slide-up">
            <div className="dashboard-hero-visual doctor-bg">
                <div className="hero-overlay">
                    <h1>Medical Intelligence Hub</h1>
                    <p>Clinical Oversight & AI Verification Terminal</p>
                </div>
            </div>
            <div className="dashboard-grid">
                {/* Stats Row */}
                <div className="dash-card glass-card stat-card highlight-blue">
                    <div className="sc-top">
                        <Users size={24} />
                        <span className="big-num">24</span>
                    </div>
                    <p className="sc-label">Assigned Patients</p>
                </div>
                <div className="dash-card glass-card stat-card">
                    <div className="sc-top">
                        <Video size={24} className="animate-pulse" />
                        <span className="big-num">{String(pendingConsults).padStart(2, '0')}</span>
                    </div>
                    <p className="sc-label">Pending Consults</p>
                </div>
                <div className="dash-card glass-card stat-card">
                    <div className="sc-top">
                        <CheckCircle size={24} className="text-success" />
                        <span className="big-num">12</span>
                    </div>
                    <p className="sc-label">Reports Verified Today</p>
                </div>

                {/* Patient List */}
                <div className="dash-card glass-card span-2">
                    <div className="card-header">
                        <h2>Assigned Patient Queue</h2>
                        <div className="header-actions">
                            <button className="btn btn-ghost btn-xs"><Plus size={14} /> Add Note</button>
                        </div>
                    </div>
                    <div className="doctor-table-container">
                        <table className="doctor-table">
                            <thead>
                                <tr>
                                    <th>Patient Name</th>
                                    <th>Condition</th>
                                    <th>Last Visit</th>
                                    <th>Risk Level</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <div className="patient-info">
                                                <div className="patient-avatar-mini">{p.name.charAt(0)}</div>
                                                <span>{p.name}</span>
                                            </div>
                                        </td>
                                        <td><span className="condition-tag">{p.condition}</span></td>
                                        <td>{p.lastVisit}</td>
                                        <td>
                                            <span className={`risk-badge risk-${p.risk.toLowerCase()}`}>
                                                {p.risk}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                <button className="btn-icon-sm" title="Review Reports"><FileText size={14} /></button>
                                                <button className="btn-icon-sm" title="Message"><MessageSquare size={14} /></button>
                                                <button className="btn-icon-sm btn-primary" title="Start Teleconsult"><Video size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* AI Analysis Approval Queue */}
                <div className="dash-card glass-card">
                    <div className="card-header">
                        <Activity size={20} className="text-secondary" />
                        <h3>AI Report Verification</h3>
                    </div>
                    <div className="verification-queue">
                        {[1, 2].map(i => (
                            <div key={i} className="verify-item">
                                <div className="v-header">
                                    <AlertCircle size={14} className="text-warning" />
                                    <span>AI Flagged: Kapha High</span>
                                </div>
                                <p className="v-desc">Patient #9928 - Automated Diet Plan requires human sign-off.</p>
                                <div className="v-actions">
                                    <button className="btn btn-ghost btn-xs">Review</button>
                                    <button className="btn btn-primary btn-xs">Verify</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Privacy Banner */}
                <div className="dash-card glass-card span-3 privacy-disclaimer">
                    <ShieldCheck size={18} className="text-success" />
                    <p>Neural Shield Protocol Active: You currently have <strong>Read/Write</strong> access to assigned patient medical records only. All access is logged via blockchain audit logs.</p>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
