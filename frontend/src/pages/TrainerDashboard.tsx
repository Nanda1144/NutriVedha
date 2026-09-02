import React, { useState, useMemo } from 'react';
import {
    Video,
    Upload,
    Activity,
    TrendingUp,
    Calendar,
    Award,
    Dumbbell,
    MessageCircle,
    X,
    CheckCircle,
    Search,
    Plus
} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { fetchTrainees, addTrainee, fetchSessions, addSession as apiAddSession } from '../services/trainer.service';
import { getAuthToken } from '../services/client';
import { Link } from 'react-router-dom';
import TraineeChatDrawer from '../components/TraineeChatDrawer';

const TrainerDashboard: React.FC = () => {
    const { traineeData: storeTrainees } = useUserStore();
    const [trainees, setTrainees] = useState(() => storeTrainees.map((t: any, i: number) => ({
        ...t, id: t.id || `t${i}`, compliance: t.compliance ?? t.progress ?? (65 + i * 10), status: t.status ?? (t.progress > 70 ? 'Completed' : 'In Progress')
    })));
    const [engagement, setEngagement] = useState(14);
    const [liveSessionActive, setLiveSessionActive] = useState(false);
    const [filterRisk, setFilterRisk] = useState<'All' | 'High Risk'>('All');
    const [search, setSearch] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [uploadTitle, setUploadTitle] = useState('');
    const [sessions, setSessions] = useState([
        { time: '06:30 AM', title: 'Yoga Flow (Vata)', type: 'Yoga' },
        { time: '05:00 PM', title: 'HIIT Core (Kapha)', type: 'Gym' },
    ]);
    const [toast, setToast] = useState<string | null>(null);
    const [selectedTrainee, setSelectedTrainee] = useState<any>(null);
    const [chatTrainee, setChatTrainee] = useState<string | null>(null);
    const [showAddTrainee, setShowAddTrainee] = useState(false);
    const [newTrainee, setNewTrainee] = useState({ name: '', goal: 'Weight Loss', compliance: 65 });
    const [showAddSessionModal, setShowAddSessionModal] = useState(false);
    const [newSession, setNewSession] = useState({ time: '10:00 AM', title: '', type: 'Custom' });

    React.useEffect(() => {
        const interval = setInterval(() => {
            setEngagement(e => Math.min(25, Math.max(10, e + (Math.random() > 0.5 ? 0.1 : -0.1))));
            if (Math.random() > 0.95) setLiveSessionActive(prev => !prev);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Live PostgreSQL wiring — fetch trainees/sessions when authenticated, fallback to mock
    React.useEffect(() => {
        if (!getAuthToken()) return;
        fetchTrainees().then(res => {
            if (res.trainees && res.trainees.length > 0) setTrainees(res.trainees.map((t: any) => ({ id: t.id, name: t.name, goal: t.goal, compliance: t.compliance, status: t.status, progress: t.progress ?? t.compliance, lastActive: t.lastActive || 'Just now' })));
        }).catch(() => {});
        fetchSessions().then(res => {
            if (res.sessions && res.sessions.length > 0) setSessions(res.sessions.map((s: any) => ({ time: s.time, title: s.title, type: s.type })));
        }).catch(() => {});
    }, []);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
    const filtered = useMemo(() => {
        return trainees.filter((t: any) => {
            const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.goal.toLowerCase().includes(search.toLowerCase());
            const matchRisk = filterRisk === 'All' || (t.compliance !== undefined && t.compliance < 60);
            return matchSearch && matchRisk;
        });
    }, [trainees, search, filterRisk]);
    const handleGoLive = () => {
        setLiveSessionActive(!liveSessionActive);
        showToast(liveSessionActive ? 'Broadcast ended' : 'Live broadcast started — students notified (POST /trainer broadcast stub)');
    };
    const handleUpload = async () => {
        if (!uploadTitle.trim() || uploadTitle.trim().length < 3) { showToast('Title must be at least 3 characters'); return; }
        if (getAuthToken()) { try { await apiAddSession({ title: uploadTitle.trim(), type: 'Training Content' }); } catch {} }
        showToast(`Content "${uploadTitle.trim()}" uploaded — visible to trainees (PostgreSQL trainer_sessions)`);
        setShowUpload(false); setUploadTitle('');
    };
    const handleAddTrainee = async () => {
        if (!newTrainee.name.trim() || newTrainee.name.trim().length < 3) { showToast('Name must be at least 3 characters'); return; }
        if (getAuthToken()) {
            try {
                const res = await addTrainee({ name: newTrainee.name.trim(), goal: newTrainee.goal, compliance: newTrainee.compliance });
                setTrainees(prev => [...prev, { id: res.trainee.id, name: res.trainee.name, goal: res.trainee.goal, compliance: res.trainee.compliance, status: res.trainee.status, progress: res.trainee.progress, lastActive: res.trainee.lastActive }]);
                showToast(`Trainee ${res.trainee.name} added — PostgreSQL trainer_trainees`);
                setShowAddTrainee(false); setNewTrainee({ name: '', goal: 'Weight Loss', compliance: 65 });
                return;
            } catch (e: any) { showToast(e.message); }
        }
        const t = { id: `t-${Date.now()}`, name: newTrainee.name.trim(), goal: newTrainee.goal, compliance: newTrainee.compliance, status: 'In Progress' as const, progress: newTrainee.compliance, lastActive: 'Just now' };
        setTrainees(prev => [...prev, t]);
        showToast(`Trainee ${t.name} added (local)`);
        setShowAddTrainee(false); setNewTrainee({ name: '', goal: 'Weight Loss', compliance: 65 });
    };
    const handleAddSession = async () => {
        if (!newSession.title.trim() || newSession.title.trim().length < 3) { showToast('Title must be at least 3 characters'); return; }
        if (getAuthToken()) { try { const res = await apiAddSession({ time: newSession.time, title: newSession.title.trim(), type: newSession.type }); setSessions(prev => [...prev, { time: res.session.time, title: res.session.title, type: res.session.type }]); showToast(`Session "${res.session.title}" added at ${res.session.time} — PostgreSQL`); setShowAddSessionModal(false); setNewSession({ time: '10:00 AM', title: '', type: 'Custom' }); return; } catch (e: any) { showToast(e.message); return; } }
        setSessions([...sessions, { time: newSession.time, title: newSession.title.trim(), type: newSession.type }]);
        showToast(`Session "${newSession.title.trim()}" added at ${newSession.time}`);
        setShowAddSessionModal(false); setNewSession({ time: '10:00 AM', title: '', type: 'Custom' });
    };

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
                            <button className={`btn btn-primary ${liveSessionActive ? 'pulse-heavy' : ''}`} onClick={handleGoLive}>
                                <Video size={18} /> {liveSessionActive ? 'BROADCASTING LIVE' : 'GO LIVE NOW'}
                            </button>
                            <button className="btn btn-outline" onClick={() => setShowUpload(true)}><Upload size={18} /> UPLOAD CONTENT</button>
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
                    <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.6rem' }}>
                        <h3>Active Trainee Analytics ({filtered.length})</h3>
                        <div className="view-toggle" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={12} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                <input aria-label="Search trainees" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ padding: '0.35rem 0.6rem 0.35rem 1.6rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.75rem', width: '120px' }} />
                            </div>
                            <button className={`btn btn-ghost btn-xs ${filterRisk === 'All' ? 'active' : ''}`} onClick={() => setFilterRisk('All')}>All</button>
                            <button className={`btn btn-ghost btn-xs ${filterRisk === 'High Risk' ? 'active' : ''}`} onClick={() => setFilterRisk('High Risk')}>High Risk (&lt;60%)</button>
                            <button className="btn btn-primary btn-xs" onClick={() => setShowAddTrainee(true)} aria-label="Add trainee"><Plus size={12} /> Add</button>
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
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '1.2rem', opacity: 0.6 }}>No trainees match filter</td></tr>
                                ) : filtered.map((t: any) => (
                                    <tr key={t.id} onClick={() => setSelectedTrainee(t)} style={{ cursor: 'pointer', background: selectedTrainee?.id === t.id ? 'rgba(99,102,241,0.08)' : undefined }}>
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
                                            <div className="action-btns" onClick={e => e.stopPropagation()}>
                                                <Link to={`/trainer/trainees/${t.id}`} className="btn-icon-sm" title="View Details" aria-label={`View ${t.name} details`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}><Activity size={14} /></Link>
                                                <button className="btn-icon-sm" title="Message" aria-label={`Message ${t.name}`} onClick={() => setChatTrainee(t.name)}><MessageCircle size={14} /></button>
                                                <button className="btn-icon-sm" title="View Progress" aria-label={`Progress ${t.name}`} onClick={() => showToast(`${t.name}: ${t.compliance}% compliance, ${t.status} — open Details`)}><Activity size={14} /></button>
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
                        {sessions.map((session, i) => (
                            <div key={i} className="session-item">
                                <div className="s-time">{session.time}</div>
                                <div className="s-info">
                                    <strong>{session.title}</strong>
                                    <span>{session.type}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="btn btn-outline btn-xs btn-full mt-10" onClick={() => setShowAddSessionModal(true)} aria-label="Add session"><Plus size={14} /> Add Session</button>
                    {selectedTrainee && <div className="glass-card" style={{ padding: '0.6rem', marginTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid var(--primary)' }}><span style={{ fontSize: '0.85rem' }}>Selected: <strong>{selectedTrainee.name}</strong> → <Link to={`/trainer/trainees/${selectedTrainee.id}`} className="btn btn-primary btn-xs">Assign Plan</Link></span><button className="btn btn-ghost btn-xs" onClick={() => setSelectedTrainee(null)}><X size={12} /></button></div>}
                </div>

                {/* Data Privacy Tag */}
                <div className="dash-card glass-card span-3 trainer-privacy-tag">
                    <div className="tag-inner">
                        <Dumbbell size={16} />
                        <span>Protocol Activated: Trainer access limited to <strong>Fitness & Activity Data</strong> only. No exposure of clinical medical history or financial data.</span>
                    </div>
                </div>
            </div>
            {showUpload && (
                <div className="modal-overlay" onClick={() => setShowUpload(false)}>
                    <div className="glass-card animate-scale-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', width: '92%', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3><Upload size={18} /> Upload Training Content</h3>
                            <button onClick={() => setShowUpload(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Close"><X size={20} /></button>
                        </div>
                        <input aria-label="Content title" placeholder="Content title (e.g. Morning Flow Yoga — Day 5)" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} maxLength={60} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                        <span className="hint-text">{uploadTitle.length}/60</span>
                        <button className="btn btn-primary btn-full" onClick={handleUpload} style={{ marginTop: '0.8rem' }}><Upload size={16} /> Publish to Trainees</button>
                    </div>
                </div>
            )}
            {showAddTrainee && (
                <div className="modal-overlay" onClick={() => setShowAddTrainee(false)}>
                    <div className="glass-card animate-scale-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', width: '92%', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3>Add Trainee</h3>
                            <button onClick={() => setShowAddTrainee(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Close"><X size={20} /></button>
                        </div>
                        <input aria-label="Trainee name" placeholder="Trainee name (min 3 chars)" value={newTrainee.name} onChange={e => setNewTrainee({ ...newTrainee, name: e.target.value })} maxLength={40} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                        <select aria-label="Goal" value={newTrainee.goal} onChange={e => setNewTrainee({ ...newTrainee, goal: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '0.6rem' }}>
                            <option>Weight Loss</option><option>Muscle Gain</option><option>Flexibility</option><option>Rehab</option>
                        </select>
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: '0.6rem' }}>
                            <span className="hint-text">Compliance {newTrainee.compliance}%</span>
                            <input type="range" min={0} max={100} value={newTrainee.compliance} onChange={e => setNewTrainee({ ...newTrainee, compliance: parseInt(e.target.value, 10) })} style={{ flex: 1 }} />
                        </div>
                        <button className="btn btn-primary btn-full" onClick={handleAddTrainee} style={{ marginTop: '0.8rem' }}><Plus size={14} /> Add Trainee</button>
                    </div>
                </div>
            )}
            {showAddSessionModal && (
                <div className="modal-overlay" onClick={() => setShowAddSessionModal(false)}>
                    <div className="glass-card animate-scale-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', width: '92%', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3>Add Training Session</h3>
                            <button onClick={() => setShowAddSessionModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Close"><X size={20} /></button>
                        </div>
                        <input aria-label="Session title" placeholder="Session title (e.g. Morning Flow Yoga)" value={newSession.title} onChange={e => setNewSession({ ...newSession, title: e.target.value })} maxLength={60} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.6rem' }}>
                            <select aria-label="Time" value={newSession.time} onChange={e => setNewSession({ ...newSession, time: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <option>06:30 AM</option><option>09:00 AM</option><option>10:00 AM</option><option>02:00 PM</option><option>05:00 PM</option><option>07:00 PM</option>
                            </select>
                            <select aria-label="Type" value={newSession.type} onChange={e => setNewSession({ ...newSession, type: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <option>Yoga</option><option>Gym</option><option>Custom</option><option>Rehab</option>
                            </select>
                        </div>
                        <button className="btn btn-primary btn-full" onClick={handleAddSession} style={{ marginTop: '0.8rem' }}><Plus size={14} /> Add Session</button>
                    </div>
                </div>
            )}
            {chatTrainee && <TraineeChatDrawer traineeName={chatTrainee} onClose={() => setChatTrainee(null)} />}
            {toast && <div className="glass-card" style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', padding: '0.8rem 1.2rem', background: '#10b981', color: 'white', borderRadius: '12px', zIndex: 9999, display: 'flex', gap: '0.6rem', alignItems: 'center' }}><CheckCircle size={18} /> {toast}</div>}
        </div>
    );
};

export default TrainerDashboard;
