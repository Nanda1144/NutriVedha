import React, { useState, useMemo } from 'react';
import {
    Dumbbell,
    Zap,
    Target,
    Users,
    ChevronRight,
    Play,
    CheckCircle2,
    Flame,
    TrendingUp,
    Award,
    Clock,
    Star,
    ShieldAlert,
    LayoutDashboard,
    Flower,
    Crown,
    Plus,
    LineChart
} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import './Fitness.css';

const Fitness: React.FC = () => {
    const { fitnessProfile, updateFitnessProfile, completeWorkout, mentorList, traineeData } = useUserStore();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'body-type' | 'yoga' | 'mentor' | 'trainer' | 'progress'>('dashboard');
    const [selectedAgeStage, setSelectedAgeStage] = useState<1 | 2 | 3 | null>(fitnessProfile.ageStage);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    // Fitness Data Constants
    const bodyTypes = [
        {
            id: 'bulk',
            label: 'Bulk Body',
            icon: '💪',
            desc: 'Gain mass and strength. High calorie with heavy lifting.',
            img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2ec617?auto=format&fit=crop&q=80&w=600'
        },
        {
            id: 'skinny',
            label: 'Skinny Body',
            icon: '🦴',
            desc: 'Lean muscle growth. Focus on compound movements and consistency.',
            img: 'https://images.unsplash.com/photo-1541534741688-6078c64b52d2?auto=format&fit=crop&q=80&w=600'
        },
        {
            id: 'cut',
            label: 'Cut (V-Shape)',
            icon: '📐',
            desc: 'Aesthetic definition. HIIT combined with targeted isolation.',
            img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=600'
        }
    ];

    const ageStages = [
        { id: 1, label: 'Stage 1: 10–18 Years', focus: 'Flexibility & Posture', warning: 'Growth-safe bodyweight only' },
        { id: 2, label: 'Stage 2: 18–30 Years', focus: 'Strength & Muscle', warning: 'High intensity allowed' },
        { id: 3, label: 'Stage 3: 30+ & Rehab', focus: 'Mobility & Wellness', warning: 'Doctor-approved low-impact' }
    ];

    const workouts = useMemo(() => {
        const stage = fitnessProfile.ageStage || 2;
        const type = fitnessProfile.bodyType || 'cut';

        // Simulated dynamic workout generation
        const base = [
            {
                id: 'w1',
                name: "Surya Namaskar (Sun Salutation)",
                duration: "10 mins",
                cal: 80,
                diff: "Beginner",
                video: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400",
                reps: "12 Rounds",
                badge: "AI Recommended",
                steps: ["Standard prayer pose", "Raised arms pose", "Hand to foot pose"]
            },
            {
                id: 'w2',
                name: stage === 1 ? "Bodyweight Squats" : "Weighted Back Squats",
                duration: "15 mins",
                cal: 150,
                diff: "Intermediate",
                video: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=400",
                reps: stage === 3 ? "2 Sets x 10" : "4 Sets x 12",
                badge: type === 'bulk' ? "Growth Target" : "Fat Burner",
                steps: ["Feet shoulder width", "Hips back", "Keep chest up"]
            },
            {
                id: 'w3',
                name: stage === 3 ? "Wall Push-ups" : "Diamond Push-ups",
                duration: "12 mins",
                cal: 120,
                diff: "Advanced",
                video: "https://images.unsplash.com/photo-1598263592652-32b55f148417?auto=format&fit=crop&q=80&w=400",
                reps: "3 Sets x Failure",
                badge: "Strict Form",
                steps: ["Hands narrow", "Core tight", "Elbows tucked"]
            }
        ];
        return base;
    }, [fitnessProfile]);


    const yogaClasses = [
        { id: 'y1', title: 'Stress Relief Flow', type: 'Recorded', duration: '30m', category: 'Healing', cal: 150, img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400' },
        { id: 'y2', title: 'Power Yoga for Weight Loss', type: 'Live', duration: '45m', category: 'Weight Loss', cal: 300, isPremium: true, img: 'https://images.unsplash.com/photo-1552196564-972b2221c591?auto=format&fit=crop&q=80&w=400' },
        { id: 'y3', title: 'Hatha Yoga for Beginners', type: 'Recorded', duration: '20m', category: 'Flexibility', cal: 100, img: 'https://images.unsplash.com/photo-1510894347713-fc3ad6cb03a2?auto=format&fit=crop&q=80&w=400' }
    ];

    const handleSelectBody = (type: 'bulk' | 'skinny' | 'cut') => {
        updateFitnessProfile({ bodyType: type });
        setActiveTab('dashboard');
    };

    const handleAgeSelect = (stage: 1 | 2 | 3) => {
        setSelectedAgeStage(stage);
        updateFitnessProfile({ ageStage: stage });
    };

    return (
        <div className="fitness-page container section-padding">
            {/* Motivation Header */}
            <div className="fitness-hero animate-fade-in">
                <div className="philosophy-banner glass-card">
                    <div className="banner-text">
                        <span className="quote-icon">“</span>
                        <h2>Food alone doesn’t build strength — effort builds the body, discipline builds the mind.</h2>
                        <p>Your diet + the right workout = better results</p>
                    </div>
                    <div className="banner-visual">
                        <Dumbbell size={60} />
                    </div>
                </div>
            </div>

            {/* Dashboard Navigation */}
            <div className="fitness-tabs glass-card">
                <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}><LayoutDashboard size={18} /> Dashboard</button>
                <button className={activeTab === 'body-type' ? 'active' : ''} onClick={() => setActiveTab('body-type')}><Target size={18} /> Plan</button>
                <button className={activeTab === 'yoga' ? 'active' : ''} onClick={() => setActiveTab('yoga')}><Flower size={18} /> Yoga</button>
                <button className={activeTab === 'mentor' ? 'active' : ''} onClick={() => setActiveTab('mentor')}><Users size={18} /> Mentors</button>
                <button className={activeTab === 'progress' ? 'active' : ''} onClick={() => setActiveTab('progress')}><TrendingUp size={18} /> Progress</button>
                <button className={`trainer-access ${activeTab === 'trainer' ? 'active' : ''}`} onClick={() => setActiveTab('trainer')}>Trainer Mode</button>
            </div>

            {/* Main Content Area */}
            <div className="fitness-content">

                {/* Dashboard View */}
                {activeTab === 'dashboard' && (
                    <div className="dashboard-view animate-fade-in">
                        <div className="welcome-section">
                            <h1>Your Body. Your Effort. Your Growth.</h1>
                            <p>Current streak: <strong>{fitnessProfile.workoutStreak} days</strong> 🔥</p>
                        </div>

                        <div className="summary-grid">
                            <div className="stat-card glass-card">
                                <div className="card-header">
                                    <Target className="text-primary" />
                                    <span>Body Type</span>
                                </div>
                                <h3>{fitnessProfile.bodyType?.toUpperCase() || 'NOT SET'}</h3>
                                <button className="btn-link" onClick={() => setActiveTab('body-type')}>Change</button>
                            </div>
                            <div className="stat-card glass-card">
                                <div className="card-header">
                                    <Zap className="text-warning" />
                                    <span>Age Stage</span>
                                </div>
                                <h3>Stage {fitnessProfile.ageStage || 'N/A'}</h3>
                                <p>{ageStages.find(s => s.id === fitnessProfile.ageStage)?.focus}</p>
                            </div>
                            <div className="stat-card glass-card">
                                <div className="card-header">
                                    <Clock className="text-secondary" />
                                    <span>Daily Effort</span>
                                </div>
                                <h3>45 Mins</h3>
                                <p>Next: Integrated Workout</p>
                            </div>
                        </div>

                        {/* Exercise Plan Timeline */}
                        <div className="integrated-plan-section">
                            <div className="section-title">
                                <h2>Today's Exercise Plan</h2>
                                <span className="diet-link-badge">Linked to Your Ayurvedic Diet</span>
                            </div>

                            <div className="workout-grid">
                                {workouts.map((w) => (
                                    <div key={w.id} className="workout-card glass-card">
                                        <div className="workout-video-preview">
                                            <img src={w.video} alt={w.name} />
                                            <div className="play-overlay"><Play size={24} /></div>
                                            {w.badge && <span className="workout-badge">{w.badge}</span>}
                                        </div>
                                        <div className="workout-details">
                                            <div className="w-header">
                                                <h3>{w.name}</h3>
                                                <span className="diff-pilled">{w.diff}</span>
                                            </div>
                                            <div className="w-stats">
                                                <span><Flame size={14} /> {w.cal} kcal</span>
                                                <span><Award size={14} /> {w.reps}</span>
                                            </div>
                                            <div className="w-steps">
                                                {w.steps.map((s, idx) => (
                                                    <div key={idx} className="step-item"><ChevronRight size={12} /> {s}</div>
                                                ))}
                                            </div>
                                            <button
                                                className={`btn btn-full ${fitnessProfile.completedWorkouts.includes(w.id) ? 'btn-success' : 'btn-primary'}`}
                                                onClick={() => completeWorkout(w.id)}
                                            >
                                                {fitnessProfile.completedWorkouts.includes(w.id) ? <><CheckCircle2 /> Completed</> : "Mark as Done"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Safety Disclaimer */}
                        <div className="safety-disclaimer glass-card">
                            <ShieldAlert className="text-warning" />
                            <p><strong>Safety First:</strong> Exercises are AI-recommended. Consult doctors or trainers if you have medical conditions.</p>
                        </div>
                    </div>
                )}

                {/* Body Type Selection */}
                {activeTab === 'body-type' && (
                    <div className="setup-view animate-fade-in">
                        <div className="setup-header">
                            <h2>Customize Your Transformation</h2>
                            <p>Choose your current body type and age stage for precision planning.</p>
                        </div>

                        <div className="age-selector glass-card">
                            <h3>1. Select Your Age Stage</h3>
                            <div className="age-grid">
                                {ageStages.map(stage => (
                                    <div
                                        key={stage.id}
                                        className={`card-selectable ${selectedAgeStage === stage.id ? 'selected' : ''}`}
                                        onClick={() => handleAgeSelect(stage.id as any)}
                                    >
                                        <h4>{stage.label}</h4>
                                        <p>{stage.focus}</p>
                                        <span className="warning-text">{stage.warning}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="body-grid-container">
                            <h3>2. Choose Your Body Goal</h3>
                            <div className="body-type-grid">
                                {bodyTypes.map(type => (
                                    <div key={type.id} className="body-card glass-card">
                                        <img src={type.img} alt={type.label} />
                                        <div className="body-card-content">
                                            <span className="type-icon">{type.icon}</span>
                                            <h4>{type.label}</h4>
                                            <p>{type.desc}</p>
                                            <button className="btn btn-outline btn-full" onClick={() => handleSelectBody(type.id as any)}>
                                                Generate My Plan
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Yoga Section */}
                {activeTab === 'yoga' && (
                    <div className="yoga-view animate-fade-in">
                        <div className="section-header-flex">
                            <div>
                                <h1>Yoga & Mindfulness</h1>
                                <p>Ancient wisdom for the modern body and busy mind.</p>
                            </div>
                            <button className="btn btn-premium" onClick={() => setShowPremiumModal(true)}>
                                <Crown size={18} /> Join Live Session
                            </button>
                        </div>

                        <div className="yoga-grid">
                            {yogaClasses.map(y => (
                                <div key={y.id} className="yoga-card glass-card">
                                    <div className="yoga-thumb">
                                        <img src={y.img} alt={y.title} />
                                        <div className="yoga-type-badge">{y.type}</div>
                                        {y.isPremium && <div className="premium-lock"><Crown size={14} /></div>}
                                    </div>
                                    <div className="yoga-info">
                                        <span className="y-cat">{y.category}</span>
                                        <h3>{y.title}</h3>
                                        <div className="y-meta">
                                            <span><Clock size={14} /> {y.duration}</span>
                                            <span><Flame size={14} /> {y.cal} kcal</span>
                                        </div>
                                        <button className={`btn btn-full ${y.isPremium && !fitnessProfile.isPremium ? 'btn-locked' : 'btn-outline'}`}>
                                            {y.isPremium && !fitnessProfile.isPremium ? "Go Premium to Unlock" : "Start Session"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mentorship View */}
                {activeTab === 'mentor' && (
                    <div className="mentorship-view animate-fade-in">
                        <div className="mentor-header">
                            <h1>Certified Mentors</h1>
                            <p>One-to-one focus for Stage 2 members. Elite coaching for real results.</p>
                        </div>

                        <div className="trainer-grid">
                            {mentorList.map(t => (
                                <div key={t.id} className="trainer-card glass-card">
                                    <div className="trainer-profile-main">
                                        <img src={t.avatar} alt={t.name} className="trainer-img" />
                                        <div className="trainer-identity">
                                            <h3>{t.name}</h3>
                                            <p>{t.expertise}</p>
                                            <div className="trainer-stats-row">
                                                <span><Star size={14} className="text-warning" /> {t.rating}</span>
                                                <span>Verified</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mentor-footer">
                                        <div className="slots"><strong>4</strong> slots left</div>
                                        <button className="btn btn-primary" onClick={() => setShowPremiumModal(true)}>
                                            Request Session
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Join with ID component */}
                        <div className="join-id-box glass-card">
                            <h3>Connect with a Private Trainer?</h3>
                            <p>Enter the unique trainer code provided to you.</p>
                            <div className="id-input-group">
                                <input type="text" placeholder="Enter Unique ID (e.g. TR-998)" />
                                <button className="btn btn-success" onClick={() => alert("Searching for trainer...")}>Join Crew</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress Tracking */}
                {activeTab === 'progress' && (
                    <div className="progress-view animate-fade-in">
                        <div className="section-header">
                            <h1>Movement Analytics</h1>
                            <p>Tracking the effort that builds the body.</p>
                        </div>

                        <div className="progress-grid">
                            <div className="chart-box glass-card">
                                <div className="chart-header">
                                    <h3>Weight Transformation (kg)</h3>
                                    <LineChart size={20} className="text-muted" />
                                </div>
                                <div className="simulated-chart">
                                    <div className="bar-group">
                                        {fitnessProfile.weightHistory.map((h, i) => (
                                            <div key={i} className="bar-container">
                                                <div className="bar" style={{ height: `${h.weight}%` }}><span>{h.weight}</span></div>
                                                <label>{h.date.split('-')[2]}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="streak-stats glass-card">
                                <div className="streak-circle">
                                    <Flame size={40} />
                                    <div className="streak-num">
                                        <strong>{fitnessProfile.workoutStreak}</strong>
                                        <span>Day Streak</span>
                                    </div>
                                </div>
                                <div className="achievement-badges">
                                    <h3>Unlocked Badges</h3>
                                    <div className="badge-scroll">
                                        <div className="badge-icon"><Award size={24} /></div>
                                        <div className="badge-icon"><Zap size={24} /></div>
                                        <div className="badge-icon opacity-50"><Dumbbell size={24} /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Trainer Dashboard (Simulated) */}
                {activeTab === 'trainer' && (
                    <div className="trainer-dashboard animate-fade-in">
                        <div className="trainer-header-box glass-card">
                            <div className="t-identity">
                                <h2>Trainer Control Center</h2>
                                <p>Managing your assigned trainees and schedules</p>
                                <span className="unique-id">Global ID: <strong>TR-8829-AYUR</strong></span>
                            </div>
                            <div className="t-stats">
                                <div className="t-stat"><strong>{traineeData.length}</strong> Trainees</div>
                                <div className="t-stat"><strong>4.9</strong> Rank</div>
                                <div className="t-stat"><strong>₹12k</strong> Goal</div>
                            </div>
                        </div>

                        <div className="trainer-grid-layout">
                            <div className="member-list glass-card">
                                <h3>Active Trainee List</h3>
                                <div className="member-items">
                                    {traineeData.map(m => (
                                        <div key={m.id} className="member-row">
                                            <div className="m-info">
                                                <div className="m-avatar">{m.name.split(' ').map((n: string) => n[0]).join('')}</div>
                                                <div>
                                                    <p>{m.name}</p>
                                                    <span>{m.goal} • {m.progress}% Completed</span>
                                                </div>
                                            </div>
                                            <div className="m-actions">
                                                <span className="last-active">{m.lastActive}</span>
                                                <button className="btn btn-outline btn-sm">Review</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="schedule-panel glass-card">
                                <h3>Live Session Schedule</h3>
                                <button className="btn btn-primary btn-full"><Plus size={18} /> Add New Session</button>
                                <div className="events">
                                    <div className="event-item">
                                        <div className="e-time">09:00 AM</div>
                                        <div className="e-title">Morning Flow Yoga</div>
                                        <button className="btn btn-success btn-sm">Start</button>
                                    </div>
                                    <div className="event-item">
                                        <div className="e-time">05:30 PM</div>
                                        <div className="e-title">Stage 2 HIIT Blast</div>
                                        <button className="btn btn-outline btn-sm" disabled>Await</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Modal */}
            {showPremiumModal && (
                <div className="modal-overlay" onClick={() => setShowPremiumModal(false)}>
                    <div className="premium-modal glass-card animate-scale-up" onClick={e => e.stopPropagation()}>
                        <Crown size={48} className="text-warning" />
                        <h2>Go Premium for Expert Training</h2>
                        <ul className="premium-features">
                            <li><CheckCircle2 size={16} className="text-success" /> Live Yoga Classes with Masters</li>
                            <li><CheckCircle2 size={16} className="text-success" /> Personal Workout Customization</li>
                            <li><CheckCircle2 size={16} className="text-success" /> Unlimited Trainer Video Calls</li>
                            <li><CheckCircle2 size={16} className="text-success" /> Integrated Diet Consistency Check</li>
                        </ul>
                        <button className="btn btn-primary btn-full" onClick={() => { updateFitnessProfile({ isPremium: true }); setShowPremiumModal(false); }}>
                            Upgrade Now - ₹499/month
                        </button>
                        <button className="btn-link" onClick={() => setShowPremiumModal(false)}>Maybe Later</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Fitness;
