import React, { useState } from 'react';
import {
    User as UserIcon,
    ShieldCheck,
    Lock,
    Key,
    FileText,
    Eye,
    History,
    Trash2,
    Download,
    Cloud,
    CheckCircle,
    ChevronRight,
    LogOut,
    Smartphone,
    Stethoscope,
    Dumbbell,
    Sprout,
    Clock,
    Filter
} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import './Profile.css';

const Profile: React.FC = () => {
    const {
        userProfile,
        fitnessProfile,
        reports,
        rbac,
        auditLogs,
        securitySettings,
        scannedImages,
        mentorList,
        updateRBAC,
        updateSecurity,
        updateProfile,
        addAuditLog
    } = useUserStore();

    const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'security' | 'activity' | 'control'>('profile');
    const [isLoginView, setIsLoginView] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [auditFilter, setAuditFilter] = useState<'All' | 'Doctor' | 'AI' | 'Trainer'>('All');
    const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    const filteredLogs = auditLogs.filter(log => auditFilter === 'All' || log.role === auditFilter);

    const handleAvatarChange = () => {
        const seed = Math.random().toString(36).substring(7);
        const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
        updateProfile({ avatar: newAvatar });
        addAuditLog({
            accessor: 'You (User)',
            role: 'User',
            action: 'Updated profile avatar',
            status: 'Success'
        });
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            alert("Logging out from all devices...");
            window.location.href = "/";
        }
    };

    const togglePermission = (role: keyof typeof rbac) => {
        const newValue = !rbac[role];
        updateRBAC({ [role]: newValue });

        // Dynamic Audit Log Entry
        addAuditLog({
            accessor: 'You (User)',
            role: 'User',
            action: `${newValue ? 'Granted' : 'Revoked'} ${role.charAt(0).toUpperCase() + role.slice(1)} access`,
            status: 'Success'
        });
    };

    const handleProfileUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        updateProfile({
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            address: formData.get('address') as string,
            dob: formData.get('dob') as string,
            age: parseInt(formData.get('age') as string),
            weight: parseFloat(formData.get('weight') as string),
            height: parseFloat(formData.get('height') as string),
            bloodGroup: formData.get('bloodGroup') as string,
            fitnessGoal: formData.get('fitnessGoal') as string,
            education: formData.get('education') as string,
            diseases: (formData.get('diseases') as string).split(',').map(d => d.trim()).filter(Boolean)
        });
        setIsEditing(false);

        addAuditLog({
            accessor: 'You (User)',
            role: 'User',
            action: 'Updated personal profile details',
            status: 'Success'
        });
    };

    const handleDeleteAccount = () => {
        if (deleteConfirmText === 'DELETE') {
            alert(`Account deletion scheduled for ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}. You can cancel this request within 30 days.`);
            setShowDeleteModal(false);
            setDeleteConfirmText('');
            addAuditLog({
                accessor: 'System',
                role: 'AI',
                action: 'Scheduled Account Deletion (30-day Grace Period)',
                status: 'Success'
            });
        }
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert("Neural convergence failed: Passwords do not match.");
            return;
        }
        alert("Neural Passkey synchronized successfully.");
        setShowPasswordModal(false);
        setPasswords({ current: '', new: '', confirm: '' });
        addAuditLog({
            accessor: 'You (User)',
            role: 'User',
            action: 'Updated Neural Passkey (Security Update)',
            status: 'Success'
        });
    };

    if (isLoginView) {
        return (
            <div className="auth-page container animate-fade-in">
                <div className="auth-card glass-card">
                    <div className="auth-header">
                        <div className="brand-logo medical-logo">
                            <ShieldCheck size={32} />
                        </div>
                        <h2>Secure Login</h2>
                        <p>End-to-end encrypted session</p>
                    </div>

                    <div className="auth-tabs">
                        <button className="btn btn-primary btn-sm">Password Login</button>
                        <button className="btn btn-outline btn-sm">OTP Login</button>
                    </div>

                    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); setIsLoginView(false); }}>
                        <div className="form-group">
                            <label>Registered Email</label>
                            <input type="email" placeholder="example@ayurai.com" defaultValue={userProfile.email} />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" placeholder="••••••••" />
                        </div>
                        <div className="auth-options">
                            <label className="checkbox-container">
                                <input type="checkbox" /> Keep me secure
                            </label>
                            <button type="button" className="btn-link">Forgot Password?</button>
                        </div>
                        <button type="submit" className="btn btn-primary btn-full">Access Secure Platform</button>
                    </form>

                    <div className="security-indicator-small">
                        <Lock size={12} />
                        <span>AES-256 Bit Encryption Active</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page container section-padding">
            {/* Header / Trust Banner */}
            <div className="profile-header-banner glass-card animate-fade-in">
                <div className="banner-trust-content">
                    <div className="trust-meter-wrapper">
                        <div className="trust-meter">
                            <svg viewBox="0 0 36 36" className="circular-chart green">
                                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path className="circle" strokeDasharray="95, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <text x="18" y="20.35" className="percentageText">95%</text>
                            </svg>
                        </div>
                        <span className="meter-label">Trust Score</span>
                    </div>
                    <div className="banner-text">
                        <h1>Hi, {userProfile.name.split(' ')[0]}!</h1>
                        <p>Your health data is safe. AI Analysis is <strong>Active</strong>.</p>
                    </div>
                </div>
                <div className="encryption-badge">
                    <div className="pulse-dot"></div>
                    <Lock size={14} /> End-to-End Encrypted
                </div>
            </div>

            <div className="profile-layout-new">
                {/* Sidebar Navigation */}
                <aside className="profile-sidebar-new glass-card">
                    <div className="user-mini-card">
                        <div className="avatar-wrapper" onClick={handleAvatarChange} style={{ cursor: 'pointer' }} title="Click to Change Avatar">
                            <img src={userProfile.avatar} alt={userProfile.name} />
                            <div className="role-tag">{userProfile.role}</div>
                            <div className="avatar-overlay"><History size={14} /> Update</div>
                        </div>
                        <h3>{userProfile.name}</h3>
                        <span className="verify-badge"><CheckCircle size={12} /> Verified Member</span>
                    </div>

                    <nav className="profile-nav-new">
                        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                            <UserIcon size={18} /> Overview & Data
                        </button>
                        <button className={activeTab === 'privacy' ? 'active' : ''} onClick={() => setActiveTab('privacy')}>
                            <Lock size={18} /> Privacy & Access
                        </button>
                        <button className={activeTab === 'activity' ? 'active' : ''} onClick={() => setActiveTab('activity')}>
                            <History size={18} /> Activity & Logs
                        </button>
                        <button className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>
                            <Key size={18} /> Security & Backups
                        </button>
                        <button className={activeTab === 'control' ? 'active' : ''} onClick={() => setActiveTab('control')}>
                            <Trash2 size={18} /> Data Control
                        </button>
                    </nav>

                    <button className="logout-btn-new" onClick={handleLogout}>
                        <LogOut size={18} /> Logout Session
                    </button>
                </aside>

                {/* Main Content Area */}
                <main className="profile-main-content">

                    {/* Tab: Profile Overview */}
                    {activeTab === 'profile' && (
                        <div className="tab-section animate-fade-in">
                            <section className="profile-summary-section glass-card">
                                <div className="section-header-flex">
                                    <div className="section-title-group">
                                        <UserIcon size={24} className="text-primary" />
                                        <div>
                                            <h2>Neural Identity & Health Profile</h2>
                                            <p className="subtitle">Comprehensive overview of your physical and clinical state.</p>
                                        </div>
                                    </div>
                                    {!isEditing && <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}>Edit Profile</button>}
                                </div>

                                {isEditing ? (
                                    <form className="edit-profile-form" onSubmit={handleProfileUpdate}>
                                        <div className="form-sections-wrapper">
                                            <div className="edit-section">
                                                <h4><UserIcon size={16} /> Personal Information</h4>
                                                <div className="form-grid">
                                                    <div className="form-group">
                                                        <label>Full Name</label>
                                                        <input name="name" defaultValue={userProfile.name} required />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Email</label>
                                                        <input name="email" type="email" defaultValue={userProfile.email} required />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Phone Number</label>
                                                        <input name="phone" defaultValue={userProfile.phone} required />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Date of Birth</label>
                                                        <input name="dob" type="date" defaultValue={userProfile.dob} required />
                                                    </div>
                                                    <div className="form-group span-2">
                                                        <label>Residential Address</label>
                                                        <input name="address" defaultValue={userProfile.address} required />
                                                    </div>
                                                    <div className="form-group span-2">
                                                        <label>Educational Qualifications</label>
                                                        <input name="education" defaultValue={userProfile.education} required />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="edit-section">
                                                <h4><Activity size={16} /> Physical & Health Metrics</h4>
                                                <div className="form-grid">
                                                    <div className="form-group">
                                                        <label>Age (Yrs)</label>
                                                        <input name="age" type="number" defaultValue={userProfile.age} required />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Weight (kg)</label>
                                                        <input name="weight" type="number" step="0.1" defaultValue={userProfile.weight} required />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Height (cm)</label>
                                                        <input name="height" type="number" defaultValue={userProfile.height} required />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Blood Group</label>
                                                        <input name="bloodGroup" defaultValue={userProfile.bloodGroup} required />
                                                    </div>
                                                    <div className="form-group span-2">
                                                        <label>Fitness Objective</label>
                                                        <input name="fitnessGoal" defaultValue={userProfile.fitnessGoal} required />
                                                    </div>
                                                    <div className="form-group span-2">
                                                        <label>Existing Conditions (Comma separated)</label>
                                                        <input name="diseases" defaultValue={userProfile.diseases.join(', ')} placeholder="e.g. Asthma, Allergies" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-actions-sticky glass-card">
                                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsEditing(false)}>Abandon Changes</button>
                                            <button type="submit" className="btn btn-primary btn-sm">Synchronize Profile</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="profile-categories">
                                        <div className="category-block">
                                            <h3>Personal Particulars</h3>
                                            <div className="info-grid">
                                                <div className="info-cell">
                                                    <label>Phone</label>
                                                    <p>{userProfile.phone}</p>
                                                </div>
                                                <div className="info-cell">
                                                    <label>Date of Birth</label>
                                                    <p>{userProfile.dob}</p>
                                                </div>
                                                <div className="info-cell span-2">
                                                    <label>Education</label>
                                                    <p>{userProfile.education}</p>
                                                </div>
                                                <div className="info-cell span-2">
                                                    <label>Address</label>
                                                    <p>{userProfile.address}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="category-block">
                                            <h3>Physical Vitals</h3>
                                            <div className="info-grid v-grid">
                                                <div className="v-pill">
                                                    <span className="v-val">{userProfile.weight} kg</span>
                                                    <span className="v-label">Weight</span>
                                                </div>
                                                <div className="v-pill">
                                                    <span className="v-val">{userProfile.height} cm</span>
                                                    <span className="v-label">Height</span>
                                                </div>
                                                <div className="v-pill">
                                                    <span className="v-val">{userProfile.bloodGroup}</span>
                                                    <span className="v-label">Blood</span>
                                                </div>
                                                <div className="info-cell span-2 mt-10">
                                                    <label>Fitness Focus</label>
                                                    <p>{userProfile.fitnessGoal}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="category-block">
                                            <h3>Condition History</h3>
                                            <div className="disease-tags">
                                                {userProfile.diseases.length > 0 ? userProfile.diseases.map((d, i) => (
                                                    <span key={i} className="disease-tag">{d}</span>
                                                )) : <p>No reported conditions.</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Scanned Images Gallery */}
                            <section className="scanned-gallery-section glass-card">
                                <h2>Recent AI Scans</h2>
                                <div className="gallery-grid">
                                    {scannedImages.length > 0 ? scannedImages.map((img, idx) => (
                                        <div key={idx} className="gallery-item">
                                            <img src={img} alt={`Scan ${idx + 1}`} />
                                            <div className="scan-overlay">Scan #{scannedImages.length - idx}</div>
                                        </div>
                                    )) : (
                                        <div className="empty-gallery">
                                            <FileText size={32} />
                                            <p>No recent scans captured.</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Assigned Mentors Section */}
                            <section className="assigned-mentors glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                                <h2>Your Specialized Mentors</h2>
                                <div className="mentor-mini-list">
                                    {mentorList.map(m => (
                                        <div key={m.id} className="mentor-mini-card">
                                            <img src={m.avatar} alt={m.name} />
                                            <div className="mentor-mini-info">
                                                <h4>{m.name}</h4>
                                                <p>{m.expertise}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="data-segmentation">
                                <h2>Interactive Data Vault</h2>
                                <p className="section-desc">Click a segment to view a masked preview of your stored data.</p>
                                <div className="segmentation-grid">
                                    <div className={`segment-card glass-card ${selectedSegment === 'personal' ? 'selected' : ''}`} onClick={() => setSelectedSegment(selectedSegment === 'personal' ? null : 'personal')}>
                                        <div className="segment-icon personal"><UserIcon /></div>
                                        <div className="segment-info">
                                            <h3>Identity Details</h3>
                                            <span className="status-locked"><ShieldCheck size={12} /> SECURE</span>
                                        </div>
                                        <ChevronRight size={18} className={`arrow ${selectedSegment === 'personal' ? 'rotate-90' : ''}`} />
                                    </div>
                                    <div className={`segment-card glass-card ${selectedSegment === 'medical' ? 'selected' : ''}`} onClick={() => setSelectedSegment(selectedSegment === 'medical' ? null : 'medical')}>
                                        <div className="segment-icon medical"><Stethoscope /></div>
                                        <div className="segment-info">
                                            <h3>Health History</h3>
                                            <span className="status-locked"><ShieldCheck size={12} /> SECURE</span>
                                        </div>
                                        <ChevronRight size={18} className={`arrow ${selectedSegment === 'medical' ? 'rotate-90' : ''}`} />
                                    </div>
                                    <div className={`segment-card glass-card ${selectedSegment === 'fitness' ? 'selected' : ''}`} onClick={() => setSelectedSegment(selectedSegment === 'fitness' ? null : 'fitness')}>
                                        <div className="segment-icon fitness"><Dumbbell /></div>
                                        <div className="segment-info">
                                            <h3>Activity Logs</h3>
                                            <span className="status-locked"><ShieldCheck size={12} /> SECURE</span>
                                        </div>
                                        <ChevronRight size={18} className={`arrow ${selectedSegment === 'fitness' ? 'rotate-90' : ''}`} />
                                    </div>
                                </div>

                                {selectedSegment && (
                                    <div className="segment-preview-box glass-card animate-slide-up">
                                        <div className="preview-header">
                                            <h4>Safe Preview: {selectedSegment.charAt(0).toUpperCase() + selectedSegment.slice(1)}</h4>
                                            <span className="encryption-label">AES-256 Masked</span>
                                        </div>
                                        <div className="preview-content">
                                            {selectedSegment === 'personal' && (
                                                <ul className="masked-list">
                                                    <li><strong>Identity:</strong> {userProfile.name}</li>
                                                    <li><strong>Phone:</strong> {userProfile.phone.replace(/(\d{4})$/, '****')}</li>
                                                    <li><strong>DOB:</strong> {userProfile.dob.split('-')[0]}-**-**</li>
                                                    <li><strong>Education:</strong> {userProfile.education}</li>
                                                    <li><strong>Address:</strong> Masked for Privacy</li>
                                                </ul>
                                            )}
                                            {selectedSegment === 'medical' && (
                                                <ul className="masked-list">
                                                    <li><strong>Clinical Count:</strong> {reports.length} Verified Files</li>
                                                    <li><strong>Blood Identity:</strong> {userProfile.bloodGroup} (Secure)</li>
                                                    <li><strong>Known Bio-Flags:</strong> {userProfile.diseases.join(', ') || 'None'}</li>
                                                    <li><strong>Last Scan:</strong> {reports[0]?.condition || 'Healthy'}</li>
                                                </ul>
                                            )}
                                            {selectedSegment === 'fitness' && (
                                                <ul className="masked-list">
                                                    <li><strong>Current Weight:</strong> {fitnessProfile.weightHistory[fitnessProfile.weightHistory.length - 1]?.weight} kg</li>
                                                    <li><strong>Workout Streak:</strong> {fitnessProfile.workoutStreak} Days</li>
                                                    <li><strong>Body Type:</strong> {fitnessProfile.bodyType || 'Analyzing...'}</li>
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </section>

                            <section className="live-status-section glass-card">
                                <div className="status-row">
                                    <div className="s-item">
                                        <span className="s-label">Active Permissions</span>
                                        <span className="s-value">{Object.values(rbac).filter(Boolean).length} Roles</span>
                                    </div>
                                    <div className="s-divider"></div>
                                    <div className="s-item">
                                        <span className="s-label">Storage Used</span>
                                        <span className="s-value">{(reports.length * 0.4 + scannedImages.length * 1.2).toFixed(1)} MB</span>
                                    </div>
                                    <div className="s-divider"></div>
                                    <div className="s-item">
                                        <span className="s-label">Member Since</span>
                                        <span className="s-value">{userProfile.memberSince || 'Jan 2026'}</span>
                                    </div>
                                    <div className="s-divider"></div>
                                    <div className="s-item">
                                        <span className="s-label">Last Synchronization</span>
                                        <span className="s-value">{auditLogs[0] ? new Date(auditLogs[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Tab: Privacy & Access */}
                    {activeTab === 'privacy' && (
                        <div className="tab-section animate-fade-in">
                            <section className="medical-privacy glass-card">
                                <div className="section-header-row">
                                    <h2>Clinical Document Access</h2>
                                    <span className="info-badge">Blockchain Verified</span>
                                </div>
                                <div className="report-timeline scroll-thin">
                                    {reports.length > 0 ? reports.map(r => (
                                        <div key={r.id} className="report-card-privacy">
                                            <div className="r-type">
                                                <FileText size={20} className="text-primary" />
                                                <div>
                                                    <h4>{r.condition}</h4>
                                                    <span>{r.date} • {r.severity} Risk</span>
                                                </div>
                                            </div>
                                            <div className="r-actions-privacy">
                                                <button className="icon-btn-text"><Eye size={14} /> Open</button>
                                                <button className="icon-btn-text text-danger" onClick={() => { if (window.confirm("Revoke all access to this file?")) alert("Access Revoked."); }}>Revoke</button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="empty-state-minimal">No clinical documents generated yet.</div>
                                    )}
                                </div>
                            </section>

                            <section className="rbac-control glass-card">
                                <div className="rbac-header">
                                    <h2>Role-Based Guardrails</h2>
                                    <p>Instantly grant or terminate access for platform roles.</p>
                                </div>

                                <div className="rbac-list">
                                    <div className="rbac-item">
                                        <div className="rbac-info">
                                            <div className="role-icon doc"><Stethoscope size={18} /></div>
                                            <div>
                                                <h4>Physician Access</h4>
                                                <p>Allow diagnostic review & medical history</p>
                                            </div>
                                        </div>
                                        <label className="toggle-switch">
                                            <input type="checkbox" checked={rbac.doctor} onChange={() => togglePermission('doctor')} />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                    <div className="rbac-item">
                                        <div className="rbac-info">
                                            <div className="role-icon fit"><Dumbbell size={18} /></div>
                                            <div>
                                                <h4>Health Coach Access</h4>
                                                <p>View fitness metrics & calorie intake</p>
                                            </div>
                                        </div>
                                        <label className="toggle-switch">
                                            <input type="checkbox" checked={rbac.trainer} onChange={() => togglePermission('trainer')} />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                    <div className="rbac-item">
                                        <div className="rbac-info">
                                            <div className="role-icon farmer"><Sprout size={18} /></div>
                                            <div>
                                                <h4>Agritech/Farmer Access</h4>
                                                <p>Optimize crop growth for your nutrition</p>
                                            </div>
                                        </div>
                                        <label className="toggle-switch">
                                            <input type="checkbox" checked={rbac.farmer} onChange={() => togglePermission('farmer')} />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Tab: Activity & Audit */}
                    {activeTab === 'activity' && (
                        <div className="tab-section animate-fade-in">
                            <section className="audit-log-section">
                                <div className="section-header-flex">
                                    <div>
                                        <h2>Immutable Audit Trail</h2>
                                        <p className="subtitle">Real-time log of every data interaction.</p>
                                    </div>
                                    <div className="log-filters glass-card">
                                        {(['All', 'Doctor', 'AI', 'Trainer'] as const).map(f => (
                                            <button key={f} className={`btn-filter ${auditFilter === f ? 'active' : ''}`} onClick={() => setAuditFilter(f)}>{f}</button>
                                        ))}
                                    </div>
                                </div>

                                <div className="audit-timeline">
                                    {filteredLogs.length > 0 ? filteredLogs.map(log => (
                                        <div key={log.id} className="audit-item glass-card animate-slide-up">
                                            <div className="audit-meta">
                                                <div className="audit-accessor">
                                                    <span className={`log-role-badge ${log.role.toLowerCase()}`}>{log.role}</span>
                                                    <strong>{log.accessor}</strong>
                                                </div>
                                                <span className="audit-time"><Clock size={12} /> {log.timestamp}</span>
                                            </div>
                                            <div className="audit-content">
                                                <p>{log.action}</p>
                                                <div className="status-indicator">
                                                    <CheckCircle size={12} className="text-success" />
                                                    <span className="success-text">{log.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="empty-state-box glass-card">
                                            <Filter size={32} />
                                            <p>No activity records found for this filter.</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Tab: Security & Backups */}
                    {activeTab === 'security' && (
                        <div className="tab-section animate-fade-in">
                            <section className="security-settings-grid">
                                <div className="security-card glass-card">
                                    <div className="sc-icon"><Smartphone /></div>
                                    <h3>Multi-Factor Auth</h3>
                                    <p> biometric or hardware token verification.</p>
                                    <label className="toggle-switch">
                                        <input type="checkbox" checked={securitySettings.twoStepVerification} onChange={() => updateSecurity({ twoStepVerification: !securitySettings.twoStepVerification })} />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="security-card glass-card highlight">
                                    <div className="sc-icon"><ShieldCheck /></div>
                                    <h3>Global Encryption</h3>
                                    <div className="integrity-status">
                                        <span className="status-badge success">ACTIVE</span>
                                        <p>SHA-256 Hashing for all records.</p>
                                    </div>
                                    <button className="btn btn-ghost btn-xs">Verify Hash</button>
                                </div>
                                <div className="security-card glass-card">
                                    <div className="sc-icon"><Cloud size={24} /></div>
                                    <h3>Cloud Backup</h3>
                                    <div className="backup-info">
                                        <strong>Online</strong>
                                        <span>Synced {securitySettings.lastBackup}</span>
                                    </div>
                                    <button className="btn btn-primary btn-sm btn-full" onClick={() => { alert("Syncing data blocks..."); updateSecurity({ lastBackup: 'Today ' + new Date().toLocaleTimeString() }); }}>Sync Now</button>
                                </div>
                                <div className="security-card glass-card">
                                    <div className="sc-icon"><Key size={24} /></div>
                                    <h3>Neural Passkey</h3>
                                    <p>Update your main entry credentials.</p>
                                    <button className="btn btn-outline btn-sm btn-full" onClick={() => setShowPasswordModal(true)}>Update Passkey</button>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Tab: Data Control */}
                    {activeTab === 'control' && (
                        <div className="tab-section animate-fade-in">
                            <div className="control-intro glass-card">
                                <Download size={24} className="text-primary" />
                                <div>
                                    <h3>Your Data Portability</h3>
                                    <p>AyurAI supports full data rights. Export or delete your health records anytime.</p>
                                </div>
                            </div>

                            <section className="data-control-grid">
                                <div className="control-card glass-card">
                                    <div className="c-icon"><Download /></div>
                                    <h3>Export Data (JSON)</h3>
                                    <p>Comprehensive dump of all health and fitness data.</p>
                                    <button className="btn btn-primary btn-sm" onClick={() => alert("Neutral export generated: ayurai-vault.zip")}>Generate Export</button>
                                </div>
                                <div className="control-card glass-card danger-zone">
                                    <div className="c-icon text-danger"><Trash2 /></div>
                                    <h3>Permanent Purge</h3>
                                    <p>Erase your existence from the platform. Irreversible.</p>
                                    <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteModal(true)}>Commence Deletion</button>
                                </div>
                            </section>

                            <div className="grace-period-info glass-card">
                                <Clock size={16} />
                                <span>Note: All deletion requests include a 30-day grace period for full recovery.</span>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Deletion Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card animate-zoom-in">
                        <div className="modal-header">
                            <ShieldCheck size={32} className="text-danger" />
                            <h3>Neural Purge Confirmation</h3>
                        </div>
                        <div className="modal-body">
                            <p>You are about to schedule your account for <strong>permanent deletion</strong>.</p>
                            <div className="warning-box">
                                <ul>
                                    <li>30 days until final neutralization</li>
                                    <li>All AI health history will be erased</li>
                                    <li>Loss of all premium mentor access</li>
                                </ul>
                            </div>
                            <p className="confirm-instruction">Please type <strong>DELETE</strong> to confirm:</p>
                            <input
                                type="text"
                                className="modal-input"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="Type DELETE..."
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>Abandon Purge</button>
                            <button
                                className="btn btn-danger"
                                disabled={deleteConfirmText !== 'DELETE'}
                                onClick={handleDeleteAccount}
                            >
                                Initiate Deletion
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="modal-overlay">
                    <form className="modal-content glass-card animate-zoom-in" onSubmit={handleChangePassword}>
                        <div className="modal-header">
                            <Key size={32} className="text-primary" />
                            <h3>Update Neural Passkey</h3>
                        </div>
                        <div className="modal-body">
                            <div className="input-group-auth">
                                <label>Current Passkey</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    required
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                />
                            </div>
                            <div className="input-group-auth">
                                <label>New Passkey</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    required
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                />
                            </div>
                            <div className="input-group-auth">
                                <label>Confirm New Passkey</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    required
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn btn-outline" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Synchronize</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Trust Footer */}
            <footer className="profile-trust-footer animate-fade-in">
                <div className="trust-badges-inline">
                    <span>IEEE-754 SECURE</span>
                    <span>GDPR COMPLIANT</span>
                    <span>ISO/IEC 27001</span>
                </div>
                <div className="trust-links">
                    <a href="#">Privacy Protocol</a>
                    <a href="#">Security Audit 2026</a>
                </div>
                <p className="medical-grade-text">Authenticated session. Zero data leakage policy in effect.</p>
            </footer>
        </div>
    );
};

export default Profile;
