import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import '../../styles/user.css';

const UserDiet: React.FC = () => {
  const { lastScanResult, userProfile } = useUserStore();
  const [tab, setTab] = useState<'today'|'weekly'|'ai'|'doctor'>('today');

  const todayMeals = useMemo(()=>[
    { time:'07:30', meal:'Cucumber Mint Cooler + Oats', cal:320, p:12, c:45, f:8, ing:['Oats','Mint','Cucumber'], recipe:'Blend cucumber mint, serve with oats porridge', sub:'Ragi porridge' },
    { time:'13:00', meal:'Mung Beans + Sweet Potato', cal:420, p:18, c:52, f:10, ing:['Mung Dal','Sweet Potato','Ghee'], recipe:'Boil mung, roast sweet potato, temper cumin', sub:'Quinoa khichdi' },
    { time:'19:30', meal:'Bottle Gourd Stew', cal:280, p:8, c:32, f:6, ing:['Lauki','Cumin','Coconut'], recipe:'Simmer lauki with coconut milk, cumin', sub:'Clear veg broth' },
  ],[]);

  const weekly = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>({ day:d, cal: 980+Math.floor(Math.random()*120) }));

  return (
    <div>
      <section className="user-hero">
        <div className="user-hero__inner">
          <div>
            <h1>Diet</h1>
            <p>Today • Weekly • AI recommended • Doctor reviewed — calories, macros, recipes, substitutions, marketplace links.</p>
          </div>
          <img src="/hero.png" alt="Diet" className="user-hero__img" />
        </div>
      </section>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:20 }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
          {(['today','weekly','ai','doctor'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:'10px 16px', borderRadius:30, border:'1px solid #e8ecec', background: tab===t?'var(--user-primary)':'white', color: tab===t?'white':'var(--user-muted)', fontWeight:800, textTransform:'capitalize' }}>{t}</button>
          ))}
        </div>

        {tab==='today' && (
          <div className="user-stagger" style={{ display:'grid', gap:12 }}>
            {todayMeals.map((m,i)=>(
              <div key={i} className="user-card meal-card" style={{ padding:16, display:'grid', gridTemplateColumns:'90px 1fr auto', gap:12, alignItems:'center' }}>
                <span style={{ padding:'8px 10px', borderRadius:30, background:'var(--user-accent-soft)', color:'var(--user-primary-dark)', fontWeight:800, textAlign:'center' }}>{m.time}</span>
                <div>
                  <strong>{m.meal}</strong>
                  <p style={{ color:'var(--user-muted)', fontSize:'0.88rem' }}>{m.cal} kcal • {m.p}P • {m.c}C • {m.f}F</p>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:6 }}>
                    {m.ing.map(ing=><span key={ing} style={{ padding:'4px 8px', borderRadius:30, background:'#f8fafc', border:'1px solid #e8ecec', fontSize:'0.8rem', fontWeight:700 }}>{ing}</span>)}
                  </div>
                  <p style={{ marginTop:6, fontSize:'0.85rem', color:'var(--user-muted)' }}><strong>Recipe:</strong> {m.recipe} • <strong>Sub:</strong> {m.sub}</p>
                </div>
                <Link to="/user/marketplace" style={{ padding:'8px 12px', borderRadius:30, background:'var(--user-primary)', color:'white', fontWeight:800, fontSize:'0.85rem' }}>Marketplace</Link>
              </div>
            ))}
          </div>
        )}

        {tab==='weekly' && (
          <div className="user-card" style={{ padding:20 }}>
            <h3>Weekly Diet Overview</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8, marginTop:12 }}>
              {weekly.map(w=>(
                <div key={w.day} className="user-card" style={{ padding:12, textAlign:'center' }}>
                  <div style={{ fontWeight:800 }}>{w.day}</div>
                  <div style={{ color:'var(--user-muted)', fontSize:'0.85rem' }}>{w.cal} kcal</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='ai' && (
          <div className="user-card" style={{ padding:20 }}>
            <h3>AI Recommended {lastScanResult? `• for ${lastScanResult.condition}`:''}</h3>
            <p style={{ color:'var(--user-muted)', marginTop:8 }}>Personalized for {userProfile.bloodGroup} • {userProfile.fitnessGoal} • Pitta cooling focus</p>
            <ul style={{ marginTop:12, display:'grid', gap:8 }}>
              <li className="user-card" style={{ padding:12 }}>• Increase cooling herbs, avoid spicy oil 3 days</li>
              <li className="user-card" style={{ padding:12 }}>• Hydration 2.5L, fiber 30g</li>
            </ul>
          </div>
        )}

        {tab==='doctor' && (
          <div className="user-card" style={{ padding:20, borderLeft:'4px solid #22c55e' }}>
            <h3>Doctor Reviewed</h3>
            <p style={{ color:'var(--user-muted)', marginTop:8 }}>Dr. Ananya reviewed your plan • Approved with 1 modification: reduce salt 2g</p>
            <p style={{ marginTop:8, padding:10, borderRadius:30, background:'#f0fdf4', border:'1px solid #bbf7d0', fontWeight:700, color:'#065f46' }}>✓ Doctor verified — follow as prescribed</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default UserDiet;
