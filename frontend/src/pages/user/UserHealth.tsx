import React, { useState } from 'react';
import { useUserStore } from '../../store/userStore';
import '../../styles/user.css';

const UserHealth: React.FC = () => {
  const { userProfile, reports } = useUserStore();
  const [tab, setTab] = useState<'overview' | 'info' | 'goals' | 'history'>('overview');
  const [editingGoals, setEditingGoals] = useState(false);
  const [goals, setGoals] = useState<string[]>(['Reduce Pitta imbalance', '7h sleep', '10k steps']);

  return (
    <div>
      <section className="user-hero">
        <div className="user-hero__inner">
          <div>
            <h1>My Health</h1>
            <p>Your personal health command — overview, information, goals and history.</p>
          </div>
          <img src="/hero.png" alt="Health" className="user-hero__img" />
        </div>
      </section>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {(['overview','info','goals','history'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 16px', borderRadius: 30, border: '1px solid #e8ecec', background: tab===t?'var(--user-primary)':'white', color: tab===t?'white':'var(--user-muted)', fontWeight: 800, textTransform: 'capitalize' }}>{t}</button>
          ))}
        </div>

        {tab==='overview' && (
          <div className="tab-panel user-stagger" style={{ display: 'grid', gap: 16 }}>
            <div className="user-card" style={{ padding: 20 }}>
              <h3>Personal Information</h3>
              <p style={{ color: 'var(--user-muted)' }}>{userProfile.name} • {userProfile.age}y • {userProfile.bloodGroup} • {userProfile.height}cm • {userProfile.weight}kg</p>
              <p style={{ marginTop: 8, color: 'var(--user-muted)' }}>{userProfile.address}</p>
            </div>
            <div className="user-card" style={{ padding: 20 }}>
              <h3>Wellness Indicators</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 12, marginTop: 12 }}>
                {[{k:'BMI',v:(userProfile.weight/((userProfile.height/100)**2)).toFixed(1)},{k:'Conditions',v:String(userProfile.diseases.length)},{k:'Reports',v:String(reports.length)},{k:'Fitness Goal',v:userProfile.fitnessGoal}].map(m=>(
                  <div key={m.k} className="user-card" style={{ padding: 14, textAlign: 'center' }}><div style={{ fontWeight:800, fontSize:'1.2rem', color:'var(--user-primary)' }}>{m.v}</div><div style={{ color:'var(--user-muted)', fontSize:'0.85rem' }}>{m.k}</div></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==='info' && (
          <div className="tab-panel user-card" style={{ padding: 20 }}>
            <h3>Health Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div><strong>DOB</strong><p style={{ color:'var(--user-muted)' }}>{userProfile.dob}</p></div>
              <div><strong>Blood Group</strong><p style={{ color:'var(--user-muted)' }}>{userProfile.bloodGroup}</p></div>
              <div><strong>Height</strong><p style={{ color:'var(--user-muted)' }}>{userProfile.height} cm</p></div>
              <div><strong>Weight</strong><p style={{ color:'var(--user-muted)' }}>{userProfile.weight} kg</p></div>
              <div style={{ gridColumn: '1 / -1' }}><strong>Education</strong><p style={{ color:'var(--user-muted)' }}>{userProfile.education}</p></div>
            </div>
          </div>
        )}

        {tab==='goals' && (
          <div className="tab-panel user-card" style={{ padding: 20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}><h3>Goals</h3><button onClick={()=>setEditingGoals(!editingGoals)} style={{ padding:'8px 14px', borderRadius:30, border:'1px solid var(--user-primary)', background: editingGoals?'var(--user-primary)':'white', color: editingGoals?'white':'var(--user-primary)', fontWeight:700 }}>{editingGoals?'Done':'Edit'}</button></div>
            <ul style={{ marginTop:12, display:'grid', gap:8 }}>
              {goals.map((g,i)=>(
                <li key={i} className="user-card" style={{ padding:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  {editingGoals ? <input value={g} onChange={e=>setGoals(goals.map((x,idx)=>idx===i?e.target.value:x))} style={{ flex:1, border:'1px solid #e8ecec', borderRadius:30, padding:'6px 12px' }} /> : <span>{g}</span>}
                  {editingGoals && <button onClick={()=>setGoals(goals.filter((_,idx)=>idx!==i))} style={{ marginLeft:8, color:'#bc4749', fontWeight:700 }}>Remove</button>}
                </li>
              ))}
            </ul>
            {editingGoals && <button onClick={()=>setGoals([...goals,'New goal'])} style={{ marginTop:12, padding:'8px 14px', borderRadius:30, background:'var(--user-primary)', color:'white', fontWeight:700 }}>+ Add Goal</button>}
          </div>
        )}

        {tab==='history' && (
          <div className="tab-panel">
            <div className="user-card" style={{ padding:20 }}>
              <h3>Health History</h3>
              {reports.length? reports.map(r=>(
                <div key={r.id} className="user-card" style={{ padding:12, marginTop:8, display:'flex', justifyContent:'space-between' }}>
                  <div><strong>{r.condition}</strong><p style={{ color:'var(--user-muted)', fontSize:'0.85rem' }}>{r.date} • {r.severity}</p></div>
                  <span style={{ padding:'4px 10px', borderRadius:30, background:'var(--user-accent-soft)', color:'var(--user-primary)', fontWeight:700, fontSize:'0.8rem' }}>{r.severity}</span>
                </div>
              )) : <p style={{ color:'var(--user-muted)', marginTop:12 }}>No history yet — start with AI Scan.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default UserHealth;
