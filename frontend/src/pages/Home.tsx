import { Camera, Stethoscope, Carrot, Utensils, Hand, ArrowRight, Bell, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import './Home.css';

const Home: React.FC = () => {
    const { systemUpdates } = useUserStore();
    const features = [
        { icon: <Camera size={32} />, title: "AI Disease Scan", path: "/scan", desc: "Instantly analyze symptoms using your camera and advanced AI models." },
        { icon: <Carrot size={32} />, title: "Budget Ayurvedic Diet", path: "/diet", desc: "Personalized diet plans using locally available, affordable kitchen items." },
        { icon: <Stethoscope size={32} />, title: "Teleconsultation", path: "/telemedicine", desc: "Connect with certified Ayurvedic specialists from the comfort of your home." },
        { icon: <Utensils size={32} />, title: "AI Recipe Generator", path: "/recipes", desc: "Generate healthy recipes based on what's currently in your kitchen." },
        { icon: <Hand size={32} />, title: "Sign Language AI", path: "/sign-ai", desc: "Converting sign language to text and voice for accessible healthcare." }
    ];

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container hero-container">
                    <div className="hero-content animate-fade-in">
                        <span className="badge">Ayurveda Meets Artificial Intelligence</span>
                        <h1 className="hero-title">Scan. Analyze. Heal Naturally with AI.</h1>
                        <p className="hero-description">Empowering you with AI-driven Ayurvedic insights for a healthier, balanced life. Accessible, affordable, and holistic care for everyone.</p>
                        <div className="hero-actions">
                            <Link to="/dashboard" className="btn btn-primary" style={{ background: 'var(--secondary)', color: 'white' }}>
                                <ArrowRight size={20} />
                                Access Command Center
                            </Link>
                            <Link to="/scan" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>
                                <Camera size={20} />
                                AI Health Scan
                            </Link>
                        </div>
                    </div>
                    <div className="hero-image-wrapper">
                        <img src="/hero.png" alt="AyurAI Health Hero" className="hero-img" />
                        <div className="hero-overlay-card glass-card">
                            <div className="pulse-dot"></div>
                            <span>AI Analysis Live</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="features-section section-padding">
                <div className="container">
                    <div className="section-header centered">
                        <h2 className="section-title">Our Core Features</h2>
                        <p className="section-subtitle">Comprehensive health tools designed for modern life.</p>
                    </div>
                    <div className="features-grid">
                        {features.map((f, i) => (
                            <div key={i} className="feature-card glass-card">
                                <div className="feature-icon">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                                <Link to={f.path} className="learn-more">
                                    Learn more <ArrowRight size={14} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* System Updates Section */}
            <section className="updates-section section-padding">
                <div className="container">
                    <div className="section-header centered">
                        <div className="intelligence-badge">
                            <Bell size={14} /> LIVE SYSTEM FEED
                        </div>
                        <h2 className="section-title">Intelligence Bulletins</h2>
                        <p className="section-subtitle">Real-time updates and health advisories from AyurAI Command.</p>
                    </div>

                    <div className="updates-grid">
                        {systemUpdates.length > 0 ? systemUpdates.slice(0, 3).map((update) => (
                            <div key={update.id} className="update-card glass-card animate-slide-up">
                                <div className="update-header">
                                    <span className="update-admin">By: {update.adminName}</span>
                                    <span className="update-date">{new Date(update.timestamp).toLocaleDateString()}</span>
                                </div>
                                <h4 className="update-title">{update.title}</h4>
                                <p className="update-content">{update.content}</p>
                                <div className="update-footer">
                                    <span className="read-only-badge"><Info size={12} /> Verified Source</span>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-updates glass-card">
                                <p>No system bulletins at this time. Stay balanced!</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section container">
                <div className="cta-card">
                    <h2>Ready to transform your health?</h2>
                    <p>Join thousands of users who are healing naturally with AyurAI Health.</p>
                    <div className="cta-btns">
                        <Link to="/login" className="btn btn-primary">Sign Up Now</Link>
                        <Link to="/recipes" className="btn btn-secondary">Explore Recipes</Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
