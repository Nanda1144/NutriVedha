import React, { useState, useMemo } from 'react';
import { Video, MessageCircle, Calendar, Star, Clock, AlertCircle, X, CheckCircle } from 'lucide-react';
import './Telemedicine.css';

const Telemedicine: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [showBooking, setShowBooking] = useState<any>(null);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('10:00');
    const [bookingMode, setBookingMode] = useState<'video' | 'chat'>('video');
    const [bookedAppointments, setBookedAppointments] = useState<any[]>([]);
    const [triageActive, setTriageActive] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const doctors = [
        {
            name: "Dr. Ananya Sharma",
            specialization: "Ayurvedic Internal Medicine",
            experience: "12+ Years",
            rating: 4.8,
            reviews: 124,
            status: "Available",
            photo: "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200",
            fee: "₹500"
        },
        {
            name: "Dr. Vikram Mehra",
            specialization: "Ayurvedic Skin Specialist",
            experience: "8+ Years",
            rating: 4.9,
            reviews: 86,
            status: "In Call",
            photo: "https://images.unsplash.com/photo-1622253692010-333f2da60c8d?auto=format&fit=crop&q=80&w=200",
            fee: "₹800"
        },
        {
            name: "Dr. Priya Iyer",
            specialization: "Nutrition & Dietetics",
            experience: "10+ Years",
            rating: 4.7,
            reviews: 210,
            status: "Available",
            photo: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200",
            fee: "₹600"
        },
        {
            name: "Dr. Sanjay Gupta",
            specialization: "Stress Management",
            experience: "15+ Years",
            rating: 5.0,
            reviews: 340,
            status: "Available",
            photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200",
            fee: "₹1000"
        }
    ];

    const filters = ['All', 'Medicine', 'Skin', 'Nutrition', 'Psychiatry'];

    const filteredDoctors = useMemo(() => {
        if (activeFilter === 'All') return doctors;
        const map: Record<string, string> = { Medicine: 'Internal Medicine', Skin: 'Skin', Nutrition: 'Nutrition', Psychiatry: 'Stress' };
        const kw = map[activeFilter] || activeFilter;
        return doctors.filter(d => d.specialization.includes(kw));
    }, [activeFilter]);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
    const handleBook = () => {
        if (!showBooking) return;
        if (!bookingDate) { showToast('Pick a date'); return; }
        if (showBooking.status === 'In Call') { showToast('Doctor is in call — try another'); return; }
        const appt = { id: `AP-${Date.now()}`, doctor: showBooking.name, date: bookingDate, time: bookingTime, mode: bookingMode, fee: showBooking.fee };
        setBookedAppointments([appt, ...bookedAppointments]);
        showToast(`Appointment booked with ${showBooking.name} on ${bookingDate} ${bookingTime}`);
        setShowBooking(null);
    };
    const handleVideo = (doc: any) => {
        if (doc.status === 'In Call') showToast(`${doc.name} is in another call`);
        else if (doc.status === 'Offline') showToast(`${doc.name} is offline`);
        else showToast(`Connecting video to ${doc.name}... (WebRTC stub — coming soon)`);
    };
    const handleChat = (doc: any) => showToast(`Opening secure chat with ${doc.name}...`);
    const handleTriage = () => { setTriageActive(true); setTimeout(() => setTriageActive(false), 2000); showToast('AI Triage: Please describe symptoms in Scan page — redirecting'); };

    return (
        <div className="telemedicine-page container section-padding">
            <div className="section-header">
                <div className="tele-badge">DIRECT ACCESS</div>
                <h1>AyurAI Tele-Consultation</h1>
                <p>Connect with India's top Ayurvedic practitioners via encrypted neural links.</p>
            </div>

            <div className="tele-controls">
                <div className="filter-chips">
                    {filters.map(f => (
                        <button
                            key={f}
                            className={`chip ${activeFilter === f ? 'active' : ''}`}
                            onClick={() => setActiveFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="emergency-box glass-card">
                    <AlertCircle size={18} className="text-danger" />
                    <span>Emergency? Start Instant AI Triage</span>
                    <button className={`btn-emergency ${triageActive ? 'pulse-heavy' : ''}`} onClick={handleTriage}>{triageActive ? 'TRIAGING...' : 'START'}</button>
                </div>
            </div>

            {bookedAppointments.length > 0 && (
                <div className="glass-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                    <h3 style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={18} className="text-success" /> Your Appointments ({bookedAppointments.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.8rem' }}>
                        {bookedAppointments.map(a => (
                            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.5)', borderRadius: '10px', fontSize: '0.85rem' }}>
                                <div><strong>{a.doctor}</strong> • {a.date} {a.time} • {a.mode} • {a.fee}</div>
                                <span className="status-pill available" style={{ fontSize: '0.7rem' }}>{a.id}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="doctors-grid">
                {filteredDoctors.length === 0 ? (
                    <div className="glass-card" style={{ gridColumn: '1/-1', padding: '2rem', textAlign: 'center' }}>
                        <p>No doctors found for {activeFilter}</p>
                        <button className="btn btn-outline btn-sm" onClick={() => setActiveFilter('All')} style={{ marginTop: '0.6rem' }}>Show All</button>
                    </div>
                ) : filteredDoctors.map((doc, i) => (
                    <div key={i} className="doctor-card glass-card">
                        <div className={`status-pill ${doc.status.toLowerCase().replace(' ', '-')}`}>
                            {doc.status}
                        </div>
                        <div className="doc-header">
                            <img src={doc.photo} alt={doc.name} className="doc-photo" />
                            <div className="doc-info">
                                <h3>{doc.name}</h3>
                                <p className="specialty">{doc.specialization}</p>
                                <div className="doc-meta">
                                    <span><Star size={14} fill="currentColor" /> {doc.rating} ({doc.reviews})</span>
                                    <span>• {doc.experience} Exp</span>
                                </div>
                                <div className="doc-pricing">
                                    <strong>{doc.fee}</strong> <span className="session-text">/ Session</span>
                                </div>
                            </div>
                        </div>

                        <div className="doc-actions">
                            <button className="btn btn-primary btn-full" onClick={() => handleVideo(doc)}>
                                <Video size={18} /> Video Call
                            </button>
                            <button className="btn btn-secondary btn-full" onClick={() => handleChat(doc)}>
                                <MessageCircle size={18} /> Chat
                            </button>
                        </div>
                        <button className="btn btn-outline btn-full booking-btn" onClick={() => { setShowBooking(doc); setBookingDate(new Date().toISOString().slice(0, 10)); }}>
                            <Calendar size={18} /> Book Appointment
                        </button>
                    </div>
                ))}
            </div>
            {showBooking && (
                <div className="modal-overlay" onClick={() => setShowBooking(null)}>
                    <div className="glass-card animate-scale-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', width: '92%', padding: '1.5rem', position: 'relative' }}>
                        <button onClick={() => setShowBooking(null)} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        <h3>Book with {showBooking.name}</h3>
                        <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>{showBooking.specialization} • {showBooking.fee}/Session</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem' }}>Date</label>
                                <input type="date" value={bookingDate} min={new Date().toISOString().slice(0, 10)} onChange={e => setBookingDate(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem' }}>Time</label>
                                <select value={bookingTime} onChange={e => setBookingTime(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <option>09:00</option><option>10:00</option><option>11:00</option><option>14:00</option><option>15:30</option><option>17:00</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
                            <button className={`btn ${bookingMode === 'video' ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setBookingMode('video')}><Video size={16} /> Video</button>
                            <button className={`btn ${bookingMode === 'chat' ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setBookingMode('chat')}><MessageCircle size={16} /> Chat</button>
                        </div>
                        <button className="btn btn-primary btn-full" onClick={handleBook} style={{ marginTop: '1rem' }}><Calendar size={18} /> Confirm Booking — {showBooking.fee}</button>
                    </div>
                </div>
            )}
            {toast && <div className="glass-card" style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', padding: '0.8rem 1.2rem', background: '#10b981', color: 'white', borderRadius: '12px', zIndex: 9999, display: 'flex', gap: '0.6rem', alignItems: 'center' }}><CheckCircle size={18} /> {toast}</div>}

            <div className="tele-features-box glass-card">
                <div className="tele-feature">
                    <div className="feature-icon-small"><Clock size={20} /></div>
                    <div>
                        <h4>Instant Consultation</h4>
                        <p>Connect with a doctor in less than 5 minutes.</p>
                    </div>
                </div>
                <div className="tele-feature">
                    <div className="feature-icon-small"><Video size={20} /></div>
                    <div>
                        <h4>Secure Video Calls</h4>
                        <p>100% private and encrypted medical consultations.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Telemedicine;
