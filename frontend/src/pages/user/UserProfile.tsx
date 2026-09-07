import React, { useState } from 'react';
import { useUserStore } from '../../store/userStore';
import '../../styles/user.css';

const UserProfile: React.FC = () => {
  const { userProfile, updateProfile } = useUserStore();
  const [tab, setTab] = useState<'personal'|'health'|'preferences'|'security'>('personal');
  const [form, setForm] = useState({ name:userProfile.name, email:userProfile.email, phone:userProfile.phone, bloodGroup:userProfile.bloodGroup });
  const [saved, setSaved] = useState(false);
  const [health, setHealth] = useState({ weight:userProfile.weight, height:userProfile.height, diseases:userProfile.diseases.join(', ') });

  const savePersonal = ()=>{ updateProfile({ name: form.name, email: form.email, phone: form.phone, bloodGroup: form.bloodGroup }); setSaved(true); setTimeout(()=>setSaved(false),1500); };
  const saveHealth = ()=>{ updateProfile({ weight: Number(health.weight), height: Number(health.height), diseases: health.diseases.split(',').map(s=>s.trim()).filter(Boolean) }); setSaved(true); setTimeout(()=>setSaved(false),1500); };

  return (
    <div>
      <section className="user-hero">
        <div className="user-hero__inner">
          <div>
            <h1>Profile</h1>
            <p>Personal • Health • Preferences • Security — tab transition.</p>
          </div>
          <img src="/hero.png" alt="Profile" className="user-hero__img" />
        </div>
      </section>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:20 }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
          {(['personal','health','preferences','security'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:'10px 16px', borderRadius:30, border:'1px solid #e8ecec', background: tab===t?'var(--user-primary)':'white', color: tab===t?'white':'var(--user-muted)', fontWeight:800, textTransform:'capitalize' }}>{t}</button>
          ))}
        </div>

        {tab==='personal' && (
          <div className="tab-panel user-card" style={{ padding:20 }}>
            <h3>Personal</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12 }}>
              <label>Full Name<input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} style={{ width:'100%', padding:'10px 12px', borderRadius:30, border:'1px solid #e8ecec' }} /></label>
              <label>Email<input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} style={{ width:'100%', padding:'10px 12px', borderRadius:30, border:'1px solid #e8ecec' }} /></label>
              <label>Phone<input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} style={{ width:'100%', padding:'10px 12px', borderRadius:30, border:'1px solid #e8ecec' }} /></label>
              <label>Blood Group<input value={form.bloodGroup} onChange={e=>setForm({...form, bloodGroup:e.target.value})} style={{ width:'100%', padding:'10px 12px', borderRadius:30, border:'1px solid #e8ecec' }} /></label>
            </div>
            <button onClick={savePersonal} style={{ marginTop:12, padding:'10px 16px', borderRadius:30, background:'var(--user-primary)', color:'white', fontWeight:800 }}>{saved?'Saved ✓':'Save Changes'}</button>
            {saved && <span style={{ marginLeft:8, color:'#065f46', fontWeight:700 }}>Profile updated</span>}
          </div>
        )}

        {tab==='health' && (
          <div className="tab-panel user-card" style={{ padding:20 }}>
            <h3>Health</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12 }}>
              <label>Weight (kg)<input type="number" value={health.weight} onChange={e=>setHealth({...health, weight: Number(e.target.value)})} style={{ width:'100%', padding:'10px 12px', borderRadius:30, border:'1px solid #e8ecec' }} /></label>
              <label>Height (cm)<input type="number" value={health.height} onChange={e=>setHealth({...health, height: Number(e.target.value)})} style={{ width:'100%', padding:'10px 12px', borderRadius:30, border:'1px solid #e8ecec' }} /></label>
              <label style={{ gridColumn:'1 / -1' }}>Existing Conditions (comma separated)<input value={health.diseases} onChange={e=>setHealth({...health, diseases:e.target.value})} style={{ width:'100%', padding:'10px 12px', borderRadius:30, border:'1px solid #e8ecec' }} /></label>
            </div>
            <button onClick={saveHealth} style={{ marginTop:12, padding:'10px 16px', borderRadius:30, background:'var(--user-primary)', color:'white', fontWeight:800 }}>{saved?'Saved ✓':'Save Health'}</button>
          </div>
        )}

        {tab==='preferences' && (
          <div className="tab-panel user-card" style={{ padding:20 }}>
            <h3>Preferences</h3>
            <div style={{ marginTop:12, display:'grid', gap:10 }}>
              <label style={{ display:'flex', justifyContent:'space-between', padding:12, borderRadius:30, border:'1px solid #e8ecec' }}><span>Diet: Vegetarian</span><input type="checkbox" defaultChecked /></label>
              <label style={{ display:'flex', justifyContent:'space-between', padding:12, borderRadius:30, border:'1px solid #e8ecec' }}><span>Notifications: Email</span><input type="checkbox" defaultChecked /></label>
              <label style={{ display:'flex', justifyContent:'space-between', padding:12, borderRadius:30, border:'1px solid #e8ecec' }}><span>Language: English</span><select style={{ border:'1px solid #e8ecec', borderRadius:30, padding:'4px 8px' }}><option>English</option><option>Hindi</option></select></label>
            </div>
          </div>
        )}

        {tab==='security' && (
          <div className="tab-panel user-card" style={{ padding:20 }}>
            <h3>Security</h3>
            <div style={{ marginTop:12, display:'grid', gap:12 }}>
              <div style={{ padding:12, borderRadius:30, background:'#f8fafc', border:'1px solid #e8ecec' }}>
                <strong>Password</strong><p style={{ color:'var(--user-muted)', fontSize:'0.9rem' }}>Last changed 30 days ago</p>
                <button style={{ marginTop:8, padding:'8px 12px', borderRadius:30, border:'1px solid var(--user-primary)', color:'var(--user-primary)', background:'white', fontWeight:700 }}>Change Password</button>
              </div>
              <div style={{ padding:12, borderRadius:30, background:'#fef2f2', border:'1px solid #fecaca' }}>
                <strong style={{ color:'#991b1b' }}>Delete Account</strong><p style={{ color:'var(--user-muted)', fontSize:'0.85rem' }}>This will schedule deletion with 30-day grace.</p>
                <button style={{ marginTop:8, padding:'8px 12px', borderRadius:30, background:'#991b1b', color:'white', fontWeight:700 }}>Request Deletion</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default UserProfile;
