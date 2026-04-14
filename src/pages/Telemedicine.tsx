import React, { useState } from 'react';
import { Video, MessageCircle, Calendar, Star, Clock, AlertCircle } from 'lucide-react';
import './Telemedicine.css';

const Telemedicine: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState('All');

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
                    <button className="btn-emergency">START</button>
                </div>
            </div>

            <div className="doctors-grid">
                {doctors.map((doc, i) => (
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
                            <button className="btn btn-primary btn-full">
                                <Video size={18} /> Video Call
                            </button>
                            <button className="btn btn-secondary btn-full">
                                <MessageCircle size={18} /> Chat
                            </button>
                        </div>
                        <button className="btn btn-outline btn-full booking-btn">
                            <Calendar size={18} /> Book Appointment
                        </button>
                    </div>
                ))}
            </div>

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
