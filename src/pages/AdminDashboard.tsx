import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import {
    ShieldAlert,
    Activity,
    History,
    Users,
    Search,
    ArrowUpRight,
    ArrowDownLeft,
    Database,
    Clock,
    Cpu
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
    const { isAdminAuthenticated, adminKeyMember, auditLogs, adminActionHistory } = useUserStore();
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const { addSystemUpdate, addAdminAction } = useUserStore();
    const [updateTitle, setUpdateTitle] = useState('');
    const [updateContent, setUpdateContent] = useState('');
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    const handleBroadcast = () => {
        if (!updateTitle || !updateContent) return;
        setIsBroadcasting(true);

        setTimeout(() => {
            addSystemUpdate({
                title: updateTitle,
                content: updateContent,
                adminName: adminKeyMember || 'Admin'
            });
            addAdminAction({
                adminName: adminKeyMember || 'Admin',
                action: 'System Broadcast',
                details: `Broadcast sent: ${updateTitle}`
            });
            setUpdateTitle('');
            setUpdateContent('');
            setIsBroadcasting(false);
            alert('Broadcase successfully sent to all users!');
        }, 1000);
    };

    if (!isAdminAuthenticated) {
        return (
            <div className="admin-denied animate-fade-in">
                <div className="denied-card glass-card">
                    <ShieldAlert size={64} className="text-danger" />
                    <h1>Access Restricted</h1>
                    <p>This terminal is reserved for Super Admin members only. Please use the Neural Intelligence bridge to authenticate.</p>
                </div>
            </div>
        );
    }

    const filteredLogs = auditLogs.filter(log =>
        (filterCategory === 'All' || log.role === filterCategory) &&
        (log.accessor.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.action.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="admin-page container section-padding">
            <header className="admin-header">
                <div className="admin-title">
                    <div className="admin-badge">SYSTEM CONTROL PANEL</div>
                    <h1>Welcome, Admin {adminKeyMember}</h1>
                    <p>Live monitoring of AyurAI Health unified infrastructure.</p>
                </div>
                <div className="admin-stats-quick">
                    <div className="admin-stat-small glass-card">
                        <Users size={18} />
                        <div><strong>1,284</strong> Active Users</div>
                    </div>
                    <div className="admin-stat-small glass-card">
                        <Cpu size={18} />
                        <div><strong>99.9%</strong> Core Health</div>
                    </div>
                </div>
            </header>

            <div className="admin-grid">
                {/* Global User Activity Feed */}
                <section className="admin-section glass-card full-row">
                    <div className="section-header-admin">
                        <div className="title-group">
                            <Activity size={24} />
                            <h2>Global User Audit Logs</h2>
                        </div>
                        <div className="controls-admin">
                            <div className="search-box-admin">
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Search logs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="filter-select"
                            >
                                <option value="All">All Roles</option>
                                <option value="User">User</option>
                                <option value="Doctor">Doctor</option>
                                <option value="Trainer">Trainer</option>
                                <option value="AI">AI / System</option>
                            </select>
                        </div>
                    </div>

                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th className="text-left">Accessor</th>
                                    <th className="text-center">Role</th>
                                    <th className="text-left">Action</th>
                                    <th className="text-center">Timestamp</th>
                                    <th className="text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length > 0 ? filteredLogs.map(log => (
                                    <tr key={log.id}>
                                        <td className="text-left">
                                            <div className="accessor-cell">
                                                <div className="mini-avatar-admin">{log.accessor[0]}</div>
                                                <div className="accessor-info">
                                                    <strong>{log.accessor}</strong>
                                                    <span>{log.id.substring(0, 6)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center"><span className={`role-pill ${log.role.toLowerCase()}`}>{log.role}</span></td>
                                        <td className="text-left"><span className="action-text">{log.action}</span></td>
                                        <td className="text-center"><span className="time-text">{new Date(log.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</span></td>
                                        <td className="text-right">
                                            <span className={`status-pill-small ${log.status.toLowerCase()}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-50">No activity logs match your current filter.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Admin Version Control / History */}
                <section className="admin-section glass-card">
                    <div className="section-header-admin">
                        <div className="title-group">
                            <History size={24} />
                            <h2>Administrative Version Control</h2>
                        </div>
                    </div>
                    <div className="history-timeline">
                        {adminActionHistory.length > 0 ? adminActionHistory.map(action => (
                            <div key={action.id} className="history-node">
                                <div className="node-marker"></div>
                                <div className="node-content">
                                    <div className="node-meta">
                                        <span className="admin-name">ADMIN: {action.adminName}</span>
                                        <span className="node-time"><Clock size={12} /> {new Date(action.timestamp).toLocaleString()}</span>
                                    </div>
                                    <h4>{action.action}</h4>
                                    <p>{action.details}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-history">
                                <Database size={48} className="text-muted" />
                                <p>No administrative changes detected in this epoch.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* System Infrastructure */}
                <section className="admin-section glass-card">
                    <div className="section-header-admin">
                        <div className="title-group">
                            <Database size={24} />
                            <h2>Infrastructure Health</h2>
                        </div>
                    </div>
                    <div className="health-stats">
                        <div className="health-item">
                            <div className="h-info">
                                <span>Neural Engine Latency</span>
                                <span>14ms</span>
                            </div>
                            <div className="h-bar"><div className="h-fill" style={{ width: '14%' }}></div></div>
                        </div>
                        <div className="health-item">
                            <div className="h-info">
                                <span>Data Lake Integrity</span>
                                <span>100%</span>
                            </div>
                            <div className="h-bar"><div className="h-fill success" style={{ width: '100%' }}></div></div>
                        </div>
                        <div className="health-item">
                            <div className="h-info">
                                <span>API Convergence</span>
                                <span>98.2%</span>
                            </div>
                            <div className="h-bar"><div className="h-fill" style={{ width: '98%' }}></div></div>
                        </div>
                    </div>

                    <div className="admin-broadcast-tool">
                        <h4>System Broadcast Center</h4>
                        <div className="broadcast-form">
                            <input
                                type="text"
                                placeholder="Update Title (e.g., New Feature Released)"
                                value={updateTitle}
                                onChange={(e) => setUpdateTitle(e.target.value)}
                                className="admin-input"
                                disabled={isBroadcasting}
                            />
                            <textarea
                                placeholder="Update description for users..."
                                value={updateContent}
                                onChange={(e) => setUpdateContent(e.target.value)}
                                className="admin-textarea"
                                disabled={isBroadcasting}
                            ></textarea>
                            <button
                                className="btn btn-primary btn-full"
                                onClick={handleBroadcast}
                                disabled={isBroadcasting || !updateTitle || !updateContent}
                            >
                                <ArrowUpRight size={18} /> {isBroadcasting ? 'TRANSMITTING...' : 'BROADCAST TO USERS'}
                            </button>
                        </div>
                    </div>

                    <div className="admin-actions-shortcuts">
                        <button className="btn btn-outline btn-full"><ArrowDownLeft size={18} /> Force Data Synchronization</button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
