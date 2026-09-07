import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Apple, Dumbbell, Stethoscope, ShoppingBag, Truck, Bell, HeartPulse, Clock, ArrowRight, CheckCircle2, Flame } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import '../../styles/user.css';

// Typing animation hook
function useTyping(text: string, speed = 50) {
  const [display, setDisplay] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setDisplay(text.slice(0, i + 1));
      i++;
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return { display, done };
}

function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const step = value / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(id); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [value]);
  return <span className="user-counter">{count}{suffix}</span>;
}

const UserDashboard: React.FC = () => {
  const { userProfile, reports, fitnessProfile, cropBookings } = useUserStore();
  const { display: typed, done } = useTyping("What is my health status? What should I do today?", 35);
  const healthScore = reports.length ? 88 + reports.length * 2 : 84;

  return (
    <div>
      {/* Hero */}
      <section className="user-hero">
        <div className="user-hero__inner">
          <div>
            <p style={{ color: 'var(--user-accent)', fontWeight: 800, letterSpacing: '0.08em', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: 8 }}>Welcome back</p>
            <h1>Good morning, {userProfile.name.split(' ')[0]}!</h1>
            <p className={`typing-js ${done ? 'done' : ''}`} style={{ fontSize: '1.05rem', marginTop: 8, minHeight: 28 }}>{typed}</p>
            <p style={{ marginTop: 16, opacity: 0.85 }}>Your connected health journey — scan → diet → fitness → doctors → marketplace → orders.</p>
            <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/user/ai-scan" className="btn btn-primary" style={{ borderRadius: 30, fontFamily: '"Times New Roman", serif', fontWeight: 800 }}>Start AI Scan <ArrowRight size={16} /></Link>
              <Link to="/user/diet" className="btn btn-outline" style={{ borderRadius: 30, borderColor: 'white', color: 'white', fontFamily: '"Times New Roman", serif' }}>Today&apos;s Diet</Link>
            </div>
          </div>
          <img src="/hero.png" alt="Health hero" className="user-hero__img" />
        </div>
      </section>

      {/* Health status answer */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>
        <div className="user-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {/* Health Score */}
          <div className="user-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <HeartPulse size={20} color="var(--user-primary)" /> <strong>Health Score</strong>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--user-primary)' }}><Counter value={healthScore} suffix="/100" /></div>
            <p style={{ color: 'var(--user-muted)', fontSize: '0.9rem' }}>Based on {reports.length} reports • Pitta balanced</p>
            <Link to="/user/health" style={{ display: 'inline-flex', gap: 6, marginTop: 12, color: 'var(--user-primary)', fontWeight: 700, fontSize: '0.9rem' }}>View My Health <ArrowRight size={14} /></Link>
          </div>

          {/* Today's health summary */}
          <div className="user-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Activity size={20} color="var(--user-primary)" /> <strong>Today&apos;s Summary</strong>
            </div>
            <ul style={{ display: 'grid', gap: 8, fontSize: '0.92rem', color: 'var(--user-muted)' }}>
              <li><CheckCircle2 size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--user-accent)' }} />Hydration: 1.8L / 2.5L</li>
              <li><CheckCircle2 size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--user-accent)' }} />Sleep: 7.2h • Quality Good</li>
              <li><CheckCircle2 size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--user-accent)' }} />Steps: <Counter value={6420} /> / 8000</li>
            </ul>
          </div>

          {/* Recommended action */}
          <div className="user-card" style={{ padding: 20, borderLeft: '4px solid var(--user-accent)' }}>
            <strong style={{ color: 'var(--user-primary-dark)' }}>What needs my attention?</strong>
            <p style={{ marginTop: 8, color: 'var(--user-muted)', fontSize: '0.92rem' }}>Complete your AI Scan for personalized diet. 1 pending doctor follow-up.</p>
            <Link to="/user/ai-scan" className="btn btn-primary" style={{ marginTop: 12, borderRadius: 30, fontFamily: '"Times New Roman"', padding: '8px 16px', fontSize: '0.9rem' }}>Recommended: Scan Now</Link>
          </div>
        </div>

        {/* Second row */}
        <div className="user-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
          <div className="user-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}><Apple size={18} color="var(--user-primary)" /><strong>Today&apos;s Diet</strong></div>
            <p style={{ fontWeight: 700 }}>Cucumber & Mint Cooler • Mung Beans • Bottle Gourd Stew</p>
            <p style={{ color: 'var(--user-muted)', fontSize: '0.88rem' }}>620 kcal • 28g protein • Pitta cooling</p>
            <Link to="/user/diet" style={{ display: 'inline-flex', marginTop: 10, color: 'var(--user-primary)', fontWeight: 700, gap: 6 }}>View Diet <ArrowRight size={14} /></Link>
          </div>
          <div className="user-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}><Dumbbell size={18} color="var(--user-primary)" /><strong>Fitness Progress</strong></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative', width: 56, height: 56 }}>
                <svg width={56} height={56}><circle cx={28} cy={28} r={24} stroke="#e8ecec" strokeWidth={4} fill="none" /><circle cx={28} cy={28} r={24} stroke="var(--user-primary)" strokeWidth={4} fill="none" strokeDasharray={150} strokeDashoffset={40} strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} /></svg>
                <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '0.9rem' }}>{fitnessProfile.workoutStreak}d</span>
              </div>
              <div>
                <p style={{ fontWeight: 700 }}><Counter value={fitnessProfile.workoutStreak} suffix=" day streak" /> <Flame size={14} style={{ display: 'inline', color: '#f59e0b' }} /></p>
                <p style={{ color: 'var(--user-muted)', fontSize: '0.85rem' }}>Next: Surya Namaskar • 10m</p>
              </div>
            </div>
            <Link to="/user/fitness" style={{ display: 'inline-flex', marginTop: 10, color: 'var(--user-primary)', fontWeight: 700, gap: 6 }}>Open Fitness <ArrowRight size={14} /></Link>
          </div>
          <div className="user-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}><Stethoscope size={18} color="var(--user-primary)" /><strong>Next Doctor</strong></div>
            <p style={{ fontWeight: 700 }}>Dr. Ananya — Ayurveda</p>
            <p style={{ color: 'var(--user-muted)', fontSize: '0.88rem' }}><Clock size={12} style={{ display: 'inline', marginRight: 4 }} /> Tomorrow, 10:30 AM • Video</p>
            <Link to="/user/doctors" style={{ display: 'inline-flex', marginTop: 10, color: 'var(--user-primary)', fontWeight: 700, gap: 6 }}>Manage Appointments <ArrowRight size={14} /></Link>
          </div>
        </div>

        {/* Third row */}
        <div className="user-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
          <div className="user-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}><ShoppingBag size={18} color="var(--user-primary)" /><strong>Active Order</strong></div>
            {cropBookings.length ? (
              <>
                <p style={{ fontWeight: 700 }}>{cropBookings[0].crop.name} • {cropBookings[0].quantity}kg</p>
                <p style={{ color: 'var(--user-muted)', fontSize: '0.88rem' }}>Status: {cropBookings[0].status} • ₹{cropBookings[0].totalPrice}</p>
              </>
            ) : (
              <p style={{ color: 'var(--user-muted)', fontSize: '0.9rem' }}>No active orders — pre-book from Marketplace.</p>
            )}
            <Link to="/user/orders" style={{ display: 'inline-flex', marginTop: 10, color: 'var(--user-primary)', fontWeight: 700, gap: 6 }}>Track Orders <ArrowRight size={14} /></Link>
          </div>
          <div className="user-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}><Truck size={18} color="var(--user-primary)" /><strong>Delivery Status</strong></div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
              {['Placed', 'Growing', 'Harvested', 'Delivery'].map((s, i) => (
                <React.Fragment key={s}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: i <= 1 ? 'var(--user-primary)' : '#e8ecec', display: 'inline-block' }} />
                  {i < 3 && <span style={{ flex: 1, height: 2, background: i < 1 ? 'var(--user-primary)' : '#e8ecec' }} />}
                </React.Fragment>
              ))}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--user-muted)', marginTop: 8 }}>ETA: 2 days • Har • Kolar farm</p>
            <Link to="/user/orders" style={{ display: 'inline-flex', marginTop: 8, color: 'var(--user-primary)', fontWeight: 700, gap: 6, fontSize: '0.9rem' }}>Delivery Tracking <ArrowRight size={14} /></Link>
          </div>
          <div className="user-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}><Bell size={18} color="var(--user-primary)" /><strong>Notifications</strong></div>
            <p style={{ color: 'var(--user-muted)', fontSize: '0.9rem' }}>2 new • Diet update & order shipped</p>
            <Link to="/user/notifications" style={{ display: 'inline-flex', marginTop: 10, color: 'var(--user-primary)', fontWeight: 700, gap: 6 }}>View All <ArrowRight size={14} /></Link>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="user-card" style={{ padding: 20, marginTop: 16, background: 'linear-gradient(135deg, #1b3a17 0%, #2d5a27 100%)', color: 'white', borderRadius: 30 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Activity size={22} color="var(--user-accent)" />
            <strong style={{ color: 'white' }}>AI Recommendation</strong>
            <span style={{ marginLeft: 'auto', background: 'var(--user-accent)', color: 'var(--user-primary-dark)', padding: '4px 10px', borderRadius: 30, fontSize: '0.75rem', fontWeight: 800 }}>AI • Not a diagnosis</span>
          </div>
          <p style={{ marginTop: 10, color: 'rgba(255,255,255,0.9)' }}>Increase water by 500ml, avoid spicy oil for 3 days. Optimal yoga: 6:00 AM. This is an AI observation — confirm with your doctor.</p>
          <Link to="/user/ai-scan" style={{ display: 'inline-flex', marginTop: 12, background: 'white', color: 'var(--user-primary-dark)', padding: '8px 14px', borderRadius: 30, fontWeight: 800, gap: 6 }}>View Full Analysis <ArrowRight size={14} /></Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
