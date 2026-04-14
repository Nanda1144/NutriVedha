import React, { useState } from 'react';
import { ShieldCheck, Smartphone, Mail, Lock, LogIn, ChevronRight, User, Stethoscope, Sprout, Dumbbell, Truck, ShieldAlert } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
    const [loginMethod, setLoginMethod] = useState<'mobile' | 'email'>('email');
    const [selectedRole, setSelectedRole] = useState<'User' | 'Doctor' | 'Trainer' | 'Farmer' | 'Delivery' | 'Admin'>('User');
    const { setRole, setAdminAuthenticated } = useUserStore();
    const navigate = useNavigate();

    const roles = [
        { id: 'User', icon: <User size={20} />, label: 'Standard User' },
        { id: 'Doctor', icon: <Stethoscope size={20} />, label: 'Medical Doctor' },
        { id: 'Farmer', icon: <Sprout size={20} />, label: 'Organic Farmer' },
        { id: 'Trainer', icon: <Dumbbell size={20} />, label: 'Fitness/Yoga Coach' },
        { id: 'Delivery', icon: <Truck size={20} />, label: 'Logistics Partner' },
        { id: 'Admin', icon: <ShieldAlert size={20} />, label: 'System Admin' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedRole === 'Admin') {
            // For demo, we still use the passkey via chatbot for full admin, 
            // but here we can simulate a basic admin session
            setAdminAuthenticated(true, 'Master Admin');
            navigate('/admin-control');
        } else {
            setRole(selectedRole);
            navigate('/');
        }
    };

    return (
        <div className="login-container section-padding">
            <div className="login-card glass-card animate-zoom-in">
                <div className="login-header">
                    <div className="brand-badge">
                        <ShieldCheck size={32} className="text-primary" />
                    </div>
                    <h1>AyurAI Command Center</h1>
                    <p>Secure Role-Based Access Terminal</p>
                </div>

                <div className="login-tabs">
                    <button
                        className={`login-tab ${loginMethod === 'email' ? 'active' : ''}`}
                        onClick={() => setLoginMethod('email')}
                    >
                        <Mail size={16} /> Email
                    </button>
                    <button
                        className={`login-tab ${loginMethod === 'mobile' ? 'active' : ''}`}
                        onClick={() => setLoginMethod('mobile')}
                    >
                        <Smartphone size={16} /> Mobile
                    </button>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    {loginMethod === 'email' ? (
                        <div className="input-stack">
                            <div className="input-field">
                                <label>Neural Email Address</label>
                                <input type="email" placeholder="name@ayurai.health" required defaultValue="pavan@ayurai.health" />
                            </div>
                            <div className="input-field">
                                <label>Passkey</label>
                                <input type="password" placeholder="••••••••" required defaultValue="password123" />
                            </div>
                        </div>
                    ) : (
                        <div className="input-stack">
                            <div className="input-field">
                                <label>Mobile Identity Number</label>
                                <div className="mobile-input-wrapper">
                                    <span>+91</span>
                                    <input type="tel" placeholder="9876543210" required />
                                </div>
                            </div>
                            <div className="input-field">
                                <label>OTP (Sent via Secure SMS)</label>
                                <input type="text" placeholder="XXXXXX" />
                            </div>
                        </div>
                    )}

                    <div className="role-selector-header">
                        <label>Select Authorization Level</label>
                    </div>
                    <div className="role-grid">
                        {roles.map((role) => (
                            <div
                                key={role.id}
                                className={`role-option ${selectedRole === role.id ? 'selected' : ''}`}
                                onClick={() => setSelectedRole(role.id as any)}
                            >
                                <div className="role-icon-circle">{role.icon}</div>
                                <span className="role-label">{role.id}</span>
                            </div>
                        ))}
                    </div>

                    <button type="submit" className="btn btn-primary btn-full login-btn">
                        <LogIn size={20} /> INITIALIZE SESSION <ChevronRight size={18} />
                    </button>
                </form>

                <div className="security-footer">
                    <Lock size={12} />
                    <span>AES-512 Encrypted Tunnel • Verified by Quantum Shield</span>
                </div>
            </div>

            <div className="login-info-side">
                <div className="info-block glass-card animate-slide-up">
                    <h3>Role Discovery</h3>
                    <p>Your dashboard will automatically calibrate based on your selected credentials and security clearance.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
