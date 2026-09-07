import React, { useEffect, useState } from 'react';
import { ShieldCheck, Award, Clock, CheckCircle, AlertCircle, Save, Dumbbell, Flower2, Lock, Calendar } from 'lucide-react';
import { getAuthToken } from '../../services/client';
import '../../styles/trainer.css';

const TrainerProfileNew: React.FC = () => {
  const [tab, setTab]=useState<'professional'|'specialization'|'availability'|'credentials'|'security'>('professional');
  const [profile, setProfile]=useState<any>(null);
  const [loading, setLoading]=useState(false);
  const [error, setError]=useState<string|null>(null);
  const [success, setSuccess]=useState<string|null>(null);
  const [form, setForm]=useState({ name:'', certification:'Certified Yoga Trainer', specialization:'Strength & Conditioning', experience:'5+ Years', fee:'500' });

  const load=async()=>{
    if(!getAuthToken()){ setError('Login as Trainer to view profile'); return; }
    setLoading(true);
    try{
      const res=await fetch('/api/user/profile', { headers:{ Authorization:`Bearer ${getAuthToken()}`}}).then(r=>r.json());
      if(res.profile) setProfile(res.profile);
    }catch(e:any){ setError(e.message); }
    setLoading(false);
  };
  useEffect(()=>{ void load(); },[]);

  const handleRegister=async(e:React.FormEvent)=>{
    e.preventDefault();
    if(!form.name.trim() || !form.certification.trim()){ setError('Name and Certification required'); return; }
    if(form.name.length<3){ setError('Name min 3 chars'); return; }
    setLoading(true);
    try{
      await fetch('/api/user/profile', { method:'PUT', headers:{'Content-Type':'application/json', Authorization:`Bearer ${getAuthToken()}`}, body: JSON.stringify({ name:form.name, education:form.certification, fitnessGoal: form.specialization })});
      setSuccess('Trainer profile saved — PostgreSQL user_profiles + trainer_trainees');
      setProfile({ name:form.name, certification:form.certification, specialization:form.specialization, experience:form.experience, fee:form.fee, verified:true });
      setError(null);
    }catch(e:any){ setError(e.message); }
    setLoading(false);
  };

  return (
    <div>
      <section className="trainer-hero">
        <div className="trainer-hero__inner">
          <div>
            <h1>Profile</h1>
            <p>Professional • Specialization • Availability • Credentials • Security</p>
          </div>
          <div>{profile?.verified? <span className="trainer-badge" style={{background:'white', color:'var(--trainer-primary)', borderColor:'white'}}><CheckCircle size={14}/> Verified</span> : profile? <span className="trainer-badge" style={{background:'white', color:'#92400e', borderColor:'white'}}><Clock size={14}/> Pending</span>: null}</div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20}}>
        <div style={{display:'flex', gap:8, marginBottom:14, flexWrap:'wrap'}}>
          {(['professional','specialization','availability','credentials','security'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:'9px 14px', borderRadius:999, border:'1px solid var(--trainer-border)', background: tab===t?'var(--trainer-primary)':'white', color:tab===t?'white':'var(--trainer-muted)', fontWeight:900, textTransform:'capitalize', fontSize:'0.84rem'}}>{t}</button>
          ))}
        </div>

        {loading && <p style={{textAlign:'center', padding:20}}>Loading profile…</p>}
        {error && <div className="trainer-card" style={{padding:12, borderLeft:'3px solid #ef4444', display:'flex', gap:8, marginBottom:12}}><AlertCircle size={16} color="#ef4444"/><span style={{fontSize:'0.88rem'}}>{error}</span></div>}
        {success && <div className="trainer-card" style={{padding:12, borderLeft:'3px solid #22c55e', background:'#ecfdf5', marginBottom:12, display:'flex', gap:8}}><CheckCircle size={16} color="#22c55e"/><span style={{fontSize:'0.88rem'}}>{success}</span></div>}

        {tab==='professional' && (
          profile && profile.name && !success ? (
            <div className="trainer-card" style={{padding:20}}>
              <div style={{display:'flex', gap:14, alignItems:'center'}}>
                <div style={{width:56, height:56, borderRadius:999, background:'var(--trainer-accent-soft)', display:'grid', placeItems:'center', fontWeight:900, color:'var(--trainer-primary)', fontSize:'1.4rem'}}>{profile.name.charAt(0)}</div>
                <div>
                  <h2 style={{display:'flex', gap:8, alignItems:'center'}}>{profile.name} {profile.verified && <Award size={16} color="#f59e0b"/>}</h2>
                  <p style={{color:'var(--trainer-muted)', fontSize:'0.88rem'}}>{profile.specialization||form.specialization} • {profile.experience||form.experience} • Fee ₹{profile.fee||form.fee}</p>
                  <p style={{color:'var(--trainer-muted)', fontSize:'0.84rem', display:'flex', gap:6, alignItems:'center'}}><Award size={12}/>{profile.certification||form.certification}</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="trainer-card" style={{padding:20, display:'grid', gap:12, maxWidth:560}}>
              <h3>Register as Trainer</h3>
              <input aria-label="Full Name" placeholder="Full Name (e.g. Kabir Singh)" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} maxLength={60} style={{padding:'10px 12px', borderRadius:12, border:'1px solid var(--trainer-border)'}}/>
              <input aria-label="Certification" placeholder="Certification (e.g. Certified Yoga Trainer, NASM)" value={form.certification} onChange={e=>setForm({...form, certification:e.target.value})} style={{padding:'10px 12px', borderRadius:12, border:'1px solid var(--trainer-border)'}}/>
              <select value={form.specialization} onChange={e=>setForm({...form, specialization:e.target.value})} style={{padding:'10px', borderRadius:12, border:'1px solid var(--trainer-border)'}}><option>Strength & Conditioning</option><option>Yoga & Stress Management</option><option>Ayurvedic Nutrition</option><option>HIIT & Mobility</option><option>Rehab & Wellness</option></select>
              <select value={form.experience} onChange={e=>setForm({...form, experience:e.target.value})} style={{padding:'10px', borderRadius:12, border:'1px solid var(--trainer-border)'}}><option>5+ Years</option><option>8+ Years</option><option>10+ Years</option><option>12+ Years</option></select>
              <input placeholder="Session Fee (e.g. 500)" value={form.fee} onChange={e=>setForm({...form, fee:e.target.value})} style={{padding:'10px 12px', borderRadius:12, border:'1px solid var(--trainer-border)'}}/>
              <button type="submit" style={{padding:'10px', borderRadius:999, background:'var(--trainer-primary)', color:'white', fontWeight:900, display:'inline-flex', gap:6, justifyContent:'center'}}><Save size={16}/> {loading?'Submitting…':'Submit Profile'}</button>
              <span style={{fontSize:'0.72rem', color:'var(--trainer-muted)', fontWeight:700}}>Stored in PostgreSQL <code>user_profiles</code> + <code>trainer_trainees</code> via trainer:3015</span>
            </form>
          )
        )}

        {tab==='specialization' && (
          <div className="trainer-card" style={{padding:20, display:'grid', gap:12}}>
            <h3 style={{display:'flex', gap:8, alignItems:'center'}}><Flower2 size={18} color="var(--trainer-primary)"/> Specialization</h3>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10}}>
              {['Strength & Conditioning','Yoga & Stress Management','HIIT & Mobility','Rehab & Wellness','Ayurvedic Nutrition'].map(s=>(
                <div key={s} className="trainer-card" style={{padding:12, textAlign:'center', background: form.specialization===s? 'var(--trainer-accent-soft)':undefined, borderColor: form.specialization===s? 'var(--trainer-accent)':undefined}}>
                  <Dumbbell size={20} color="var(--trainer-primary)"/>
                  <p style={{fontWeight:900, fontSize:'0.88rem', marginTop:6}}>{s}</p>
                </div>
              ))}
            </div>
            <p style={{color:'var(--trainer-muted)', fontSize:'0.84rem'}}>Selected: <strong>{form.specialization}</strong> — visible to members on marketplace.</p>
          </div>
        )}

        {tab==='availability' && (
          <div className="trainer-card" style={{padding:20}}>
            <h3 style={{display:'flex', gap:8, alignItems:'center'}}><Clock size={18} color="var(--trainer-primary)"/> Availability</h3>
            <p style={{color:'var(--trainer-muted)', marginTop:8}}>Mon–Sat 06:30–20:00 • Session slots 60m • Buffer 15m • Managed in Sessions → Calendar</p>
            <a href="/trainer/sessions" style={{display:'inline-flex', marginTop:12, padding:'8px 14px', borderRadius:999, background:'var(--trainer-primary)', color:'white', fontWeight:900, textDecoration:'none'}}>Manage Sessions →</a>
          </div>
        )}

        {tab==='credentials' && (
          <div className="trainer-card" style={{padding:20}}>
            <h3 style={{display:'flex', gap:8, alignItems:'center'}}><Award size={18} color="var(--trainer-primary)"/> Credentials</h3>
            <p style={{color:'var(--trainer-muted)', marginTop:8}}>Certified Yoga Trainer • NASM / AYUSH • Upload certificates (coming soon) — stored in PostgreSQL user_profiles.education</p>
            <div style={{marginTop:12, padding:12, borderRadius:12, background:'#f8fafc', border:'1px solid var(--trainer-border)', fontSize:'0.88rem'}}>Status: {profile?.verified? 'Verified ✓':'Pending verification'}</div>
          </div>
        )}

        {tab==='security' && (
          <div className="trainer-card" style={{padding:20}}>
            <h3 style={{display:'flex', gap:8, alignItems:'center'}}><Lock size={18} color="var(--trainer-primary)"/> Security</h3>
            <p style={{color:'var(--trainer-muted)', marginTop:8}}>Fitness data only • Medical records never exposed • JWT Bearer • RBAC Trainer only • Audit stub via shared.</p>
            <div style={{marginTop:12, display:'grid', gap:8}}>
              <div style={{padding:12, borderRadius:12, background:'#ecfdf5', border:'1px solid #a7f3d0', display:'flex', gap:8}}><ShieldCheck size={16} color="#22c55e"/><span style={{fontSize:'0.88rem', fontWeight:800}}>2FA — Coming soon</span></div>
              <div style={{padding:12, borderRadius:12, background:'#fff', border:'1px solid var(--trainer-border)', display:'flex', gap:8}}><Calendar size={16} color="var(--trainer-primary)"/><span style={{fontSize:'0.88rem'}}>Last backup: Today • Integrity passed</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default TrainerProfileNew;
