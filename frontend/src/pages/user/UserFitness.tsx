import React, { useState } from 'react';
import { useUserStore } from '../../store/userStore';
import '../../styles/user.css';

const UserFitness: React.FC = () => {
  const { fitnessProfile, completeWorkout, userProfile, updateProfile } = useUserStore();
  const [goal, setGoal] = useState(userProfile.fitnessGoal || 'General Fitness');

  const workouts = [
    { id:'w1', name:'Surya Namaskar', duration:'10m', cal:80, done: fitnessProfile.completedWorkouts.includes('w1') },
    { id:'w2', name:'Back Squats', duration:'15m', cal:150, done: fitnessProfile.completedWorkouts.includes('w2') },
    { id:'w3', name:'Diamond Push-ups', duration:'12m', cal:120, done: fitnessProfile.completedWorkouts.includes('w3') },
  ];

  const progress = Math.round((fitnessProfile.completedWorkouts.length / workouts.length)*100);
  const offset = 283 - (283 * progress)/100;

  return (
    <div>
      <section className="user-hero">
        <div className="user-hero__inner">
          <div>
            <h1>Fitness</h1>
            <p>Goal • Workout plan • Exercises • Duration • Calories • Completion • Weekly progress • Trainer</p>
          </div>
          <img src="/hero.png" alt="Fitness" className="user-hero__img" />
        </div>
      </section>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:20 }}>
        <div className="user-card" style={{ padding:20, display:'flex', gap:16, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ flex:1 }}>
            <strong>Fitness Goal</strong>
            <div style={{ display:'flex', gap:8, marginTop:8 }}>
              <input value={goal} onChange={e=>setGoal(e.target.value)} style={{ flex:1, padding:'10px 14px', borderRadius:30, border:'1px solid #e8ecec' }} />
              <button onClick={()=>updateProfile({ fitnessGoal: goal })} style={{ padding:'10px 16px', borderRadius:30, background:'var(--user-primary)', color:'white', fontWeight:800 }}>Save</button>
            </div>
            <p style={{ color:'var(--user-muted)', fontSize:'0.85rem', marginTop:6 }}>BodyType: {fitnessProfile.bodyType||'Not set'} • AgeStage: {fitnessProfile.ageStage||'N/A'}</p>
          </div>
          <div style={{ textAlign:'center' }}>
            <svg width={100} height={100}>
              <circle cx={50} cy={50} r={42} stroke="#e8ecec" strokeWidth={8} fill="none" />
              <circle cx={50} cy={50} r={42} stroke="var(--user-primary)" strokeWidth={8} fill="none" strokeDasharray={263} strokeDashoffset={offset} strokeLinecap="round" style={{ transform:'rotate(-90deg)', transformOrigin:'50% 50%', transition:'stroke-dashoffset 0.8s ease' }} />
              <text x={50} y={55} textAnchor="middle" fontWeight={800} fontSize={18} fill="var(--user-primary-dark)">{progress}%</text>
            </svg>
            <p style={{ fontWeight:800, color:'var(--user-primary)' }}>Weekly Progress</p>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px,1fr))', gap:16, marginTop:16 }}>
          {workouts.map(w=>(
            <div key={w.id} className="user-card" style={{ padding:16 }}>
              <h4 style={{ fontWeight:800 }}>{w.name}</h4>
              <p style={{ color:'var(--user-muted)', fontSize:'0.9rem' }}>{w.duration} • {w.cal} kcal</p>
              <div style={{ marginTop:12, height:6, background:'#e8ecec', borderRadius:30, overflow:'hidden' }}>
                <div style={{ width: w.done?'100%':'0%', height:'100%', background:'var(--user-primary)', transition:'width 0.5s' }} />
              </div>
              <button onClick={()=>completeWorkout(w.id)} disabled={w.done} style={{ marginTop:12, width:'100%', padding:'10px', borderRadius:30, background: w.done?'#22c55e':'var(--user-primary)', color:'white', fontWeight:800, opacity: w.done?0.7:1 }}>{w.done?'Completed ✓':'Mark Done'}</button>
            </div>
          ))}
        </div>

        <div className="user-card" style={{ padding:16, marginTop:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div><strong>Trainer</strong><p style={{ color:'var(--user-muted)', fontSize:'0.9rem' }}>Assigned: Kavita (Yoga) • 4.8★ • Next session 6:30 AM</p></div>
          <a href="/user/doctors" style={{ padding:'8px 14px', borderRadius:30, background:'var(--user-accent-soft)', color:'var(--user-primary-dark)', fontWeight:800, border:'1px solid rgba(167,201,87,0.2)' }}>Contact Trainer</a>
        </div>
      </div>
    </div>
  );
};
export default UserFitness;
