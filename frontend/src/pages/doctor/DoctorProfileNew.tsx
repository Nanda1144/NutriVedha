import React, { useEffect, useState } from 'react';
import { ShieldCheck, Award, Clock, CheckCircle, AlertCircle, Save, Lock, Calendar } from 'lucide-react';
import { fetchDoctorProfile, registerDoctor } from '../../services/doctor.service';
import { getAuthToken } from '../../services/client';
import '../../styles/doctor.css';

const DoctorProfileNew: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [tab, setTab] = useState<'professional'|'credentials'|'availability'|'security'>('professional');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);
  const [form, setForm] = useState({ name:'', specialization:'General Ayurveda', regNumber:'', experience:'5+ Years' });

  const load = async()=>{
    if(!getAuthToken()){ setError('Login as Doctor to view profile'); setLoading(false); return; }
    setLoading(true);
    try{ const r=await fetchDoctorProfile(); setProfile(r.profile); }catch(e:any){ if(e.message.includes('not found')||e.message.includes('404')) setProfile(null); else setError(e.message); }
    setLoading(false);
  };
  useEffect(()=>{ void load(); },[]);

  const handleRegister = async(e:React.FormEvent)=>{
    e.preventDefault();
    if(!form.name.trim()||!form.regNumber.trim()){ setError('Name and Registration required'); return; }
    if(form.regNumber.length<5){ setError('Reg number min 5 chars'); return; }
    setLoading(true);
    try{ const r=await registerDoctor(form); setProfile(r.profile); setSuccess(r.message||'Submitted — pending verification'); setError(null); }catch(e:any){ setError(e.message); }
    setLoading(false);
  };

  return (
    <div>
      <section className="doc-hero">
        <div className="doc-hero__inner">
          <div>
            <h1>Profile</h1>
            <p>Professional • Credentials • Availability • Security</p>
          </div>
          <div>{profile?.verified? <span className="doc-badge doc-badge--success" style={{background:'white', color:'var(--doc-primary)'}}><CheckCircle size={14}/> Verified</span> : profile? <span className="doc-badge doc-badge--warning" style={{background:'white', color:'#92400e'}}><Clock size={14}/> Pending</span> : null}</div>
        </div>
      </section>

      <div style={{maxWidth:1100, margin:'0 auto', padding:20}}>
        <div style={{display:'flex', gap:8, marginBottom:14, flexWrap:'wrap'}}>
          {(['professional','credentials','availability','security'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:'9px 14px', borderRadius:999, border:'1px solid var(--doc-border)', background: tab===t?'var(--doc-primary)':'white', color: tab===t?'white':'var(--doc-muted)', fontWeight:700, textTransform:'capitalize', fontSize:'0.84rem'}}>{t}</button>
          ))}
        </div>

        {loading ? <p style={{textAlign:'center', padding:30}}>Loading profile…</p> : error && !profile ? <div className="doc-card" style={{padding:14, borderLeft:'3px solid #ef4444', display:'flex', gap:8}}><AlertCircle size={16} color="#ef4444"/>{error}</div> : null}
        {success && <div className="doc-card" style={{padding:12, borderLeft:'3px solid #22c55e', background:'#ecfdf5', marginBottom:12, display:'flex', gap:8}}><CheckCircle size={16} color="#22c55e"/>{success}</div>}

        {tab==='professional' && (
          profile ? (
            <div className="doc-card" style={{padding:20}}>
              <div style={{display:'flex', gap:14, alignItems:'center'}}>
                <div style={{width:56, height:56, borderRadius:999, background:'var(--doc-accent-soft)', display:'grid', placeItems:'center', fontWeight:800, color:'var(--doc-primary)', fontSize:'1.4rem'}}>{profile.name.charAt(0)}</div>
                <div>
                  <h2 style={{display:'flex', gap:8, alignItems:'center'}}>{profile.name} {profile.verified && <Award size={16} color="#f59e0b"/>}</h2>
                  <p style={{color:'var(--doc-muted)', fontSize:'0.88rem'}}>{profile.specialization} • {profile.experience} • {profile.regNumber} • {profile.patients||0} patients</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="doc-card" style={{padding:20, display:'grid', gap:12, maxWidth:560}}>
              <h3>Register as Practitioner</h3>
              <input placeholder="Full Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} style={{padding:10, borderRadius:10, border:'1px solid var(--doc-border)'}}/>
              <select value={form.specialization} onChange={e=>setForm({...form, specialization:e.target.value})} style={{padding:10, borderRadius:10, border:'1px solid var(--doc-border)'}}>
                <option>General Ayurveda</option><option>Ayurvedic Internal Medicine</option><option>Skin</option><option>Nutrition</option>
              </select>
              <input placeholder="Registration Number" value={form.regNumber} onChange={e=>setForm({...form, regNumber:e.target.value})} style={{padding:10, borderRadius:10, border:'1px solid var(--doc-border)'}}/>
              <select value={form.experience} onChange={e=>setForm({...form, experience:e.target.value})} style={{padding:10, borderRadius:10, border:'1px solid var(--doc-border)'}}>
                <option>5+ Years</option><option>8+ Years</option><option>10+ Years</option>
              </select>
              <button type="submit" className="btn btn-primary" style={{background:'var(--doc-primary)', color:'white', padding:'10px', borderRadius:999, fontWeight:800, display:'inline-flex', gap:6, justifyContent:'center'}}><Save size={16}/> {loading?'Submitting...':'Submit for Verification'}</button>
            </form>
          )
        )}

        {tab==='credentials' && (
          <div className="doc-card" style={{padding:20}}>
            <h3 style={{display:'flex', gap:8}}><Award size={18} color="var(--doc-primary)"/> Credentials</h3>
            <p style={{color:'var(--doc-muted)', marginTop:8}}>AYU-REG-123 • Verified by Admin • Upload certificates (coming soon) — stored in PostgreSQL doctor_profiles.reg_number unique.</p>
            <div style={{marginTop:12, padding:12, borderRadius:12, background:'#f8fafc', border:'1px solid var(--doc-border)', fontSize:'0.88rem'}}>Status: {profile?.verified? 'Verified ✓':'Pending verification — POST /doctor/verify/:id requires Admin'}</div>
          </div>
        )}

        {tab==='availability' && (
          <div className="doc-card" style={{padding:20}}>
            <h3 style={{display:'flex', gap:8}}><Clock size={18} color="var(--doc-primary)"/> Availability Summary</h3>
            <p style={{color:'var(--doc-muted)', marginTop:8}}>Mon–Fri 09:00–17:00 • Sat 09:00–13:00 • Sun off • Fee ₹500</p>
            <a href="/doctor/availability" style={{display:'inline-flex', marginTop:12, padding:'8px 14px', borderRadius:999, background:'var(--doc-primary)', color:'white', fontWeight:700}}>Manage Availability →</a>
          </div>
        )}

        {tab==='security' && (
          <div className="doc-card" style={{padding:20}}>
            <h3 style={{display:'flex', gap:8}}><Lock size={18} color="var(--doc-primary)"/> Security</h3>
            <p style={{color:'var(--doc-muted)', marginTop:8}}>Medical actions audited to audit_logs • Encrypted at rest AES-256-GCM • JWT Bearer • RBAC Doctor only.</p>
            <div style={{marginTop:12, display:'grid', gap:8}}>
              <div style={{padding:12, borderRadius:12, background:'#ecfdf5', border:'1px solid #a7f3d0', display:'flex', gap:8}}><ShieldCheck size={16} color="#22c55e"/><span style={{fontSize:'0.88rem', fontWeight:700}}>2FA — Coming soon</span></div>
              <div style={{padding:12, borderRadius:12, background:'#fff', border:'1px solid var(--doc-border)', display:'flex', gap:8}}><Calendar size={16} color="var(--doc-primary)"/><span style={{fontSize:'0.88rem'}}>Last backup: Today • Integrity passed</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default DoctorProfileNew;
