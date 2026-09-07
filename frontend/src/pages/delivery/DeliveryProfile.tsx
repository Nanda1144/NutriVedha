import React, { useEffect, useState } from 'react';
import { User, Truck, MapPin, ShieldCheck, Lock, Award, CheckCircle, AlertCircle, Save, Phone, Star } from 'lucide-react';
import { getAuthToken } from '../../services/client';
import '../../styles/delivery.css';

const DeliveryProfileNew: React.FC = () => {
  const [tab, setTab]=useState<'personal'|'vehicle'|'availability'|'verification'|'security'>('personal');
  const [profile, setProfile]=useState<any>(null);
  const [loading, setLoading]=useState(false);
  const [error, setError]=useState<string|null>(null);
  const [success, setSuccess]=useState<string|null>(null);
  const [form, setForm]=useState({ name:'', phone:'', vehicle:'Bike', license:'', zone:'Bengaluru Central', available:true });

  const load=async()=>{
    if(!getAuthToken()){ setError('Login as Delivery to view profile'); return; }
    setLoading(true);
    try{
      const res=await fetch('/api/user/profile', { headers:{ Authorization:`Bearer ${getAuthToken()}`}}).then(r=>r.json());
      if(res.profile) setProfile(res.profile);
    }catch(e:any){ setError(e.message); }
    setLoading(false);
  };
  useEffect(()=>{ void load(); },[]);

  const handleSave=async(e:React.FormEvent)=>{
    e.preventDefault();
    if(!form.name.trim() || !form.license.trim()){ setError('Name and License required'); return; }
    if(form.license.length<5){ setError('License min 5 chars'); return; }
    setLoading(true);
    try{
      await fetch('/api/user/profile', { method:'PUT', headers:{'Content-Type':'application/json', Authorization:`Bearer ${getAuthToken()}`}, body: JSON.stringify({ name:form.name, phone:form.license, address:form.zone, education:form.vehicle })});
      setSuccess('Delivery profile saved — user_profiles + delivery assignment linked');
      setProfile({ name:form.name, vehicle:form.vehicle, license:form.license, zone:form.zone, rating:'4.8', verified:true, available:form.available });
      setError(null);
    }catch(err:any){ setError(err.message); }
    setLoading(false);
  };

  return (
    <div>
      <section className="del-hero">
        <div className="del-hero__inner">
          <div>
            <h1>Profile</h1>
            <p>Personal • Vehicle • Availability • Verification • Security — logistics only</p>
          </div>
          <div>{profile?.verified ? <span className="del-badge" style={{background:'white', color:'var(--del-primary)', borderColor:'white'}}><CheckCircle size={14}/> Verified</span> : null}</div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20}}>
        <div style={{display:'flex', gap:8, marginBottom:14, flexWrap:'wrap'}}>
          {(['personal','vehicle','availability','verification','security'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{minHeight:44, padding:'10px 14px', borderRadius:999, border:'1px solid var(--del-border)', background: tab===t?'var(--del-primary)':'white', color:tab===t?'white':'var(--del-muted)', fontWeight:900, textTransform:'capitalize', fontSize:'0.84rem'}}>{t}</button>
          ))}
        </div>

        {loading && <p style={{textAlign:'center', padding:20}}>Loading profile…</p>}
        {error && <div className="del-card" style={{padding:12, borderLeft:'3px solid #ef4444', display:'flex', gap:8, marginBottom:12}}><AlertCircle size={16} color="#ef4444"/><span style={{fontSize:'0.88rem'}}>{error}</span></div>}
        {success && <div className="del-card" style={{padding:12, borderLeft:'3px solid #22c55e', background:'#ecfdf5', marginBottom:12, display:'flex', gap:8}}><CheckCircle size={16} color="#22c55e"/><span style={{fontSize:'0.88rem'}}>{success}</span></div>}

        {tab==='personal' && (
          profile && profile.name && !success ? (
            <div className="del-card" style={{padding:20}}>
              <div style={{display:'flex', gap:14, alignItems:'center'}}>
                <div style={{width:56, height:56, borderRadius:999, background:'var(--del-accent-soft)', display:'grid', placeItems:'center', color:'var(--del-primary)'}}><User size={22}/></div>
                <div>
                  <h2 style={{display:'flex', gap:8, alignItems:'center'}}>{profile.name} {profile.verified && <Star size={16} color="#f59e0b" fill="currentColor"/>}</h2>
                  <p style={{color:'var(--del-muted)', fontSize:'0.88rem', display:'flex', gap:6, alignItems:'center'}}><Phone size={12}/>{profile.phone || form.phone} • {profile.address || profile.zone}</p>
                </div>
                <span className="del-badge del-badge--success" style={{marginLeft:'auto'}}><Truck size={12}/> Delivery Partner</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="del-card" style={{padding:20, display:'grid', gap:12, maxWidth:560}}>
              <h3>Personal Information</h3>
              <input aria-label="Full Name" placeholder="Full Name (e.g. Ramesh Kumar)" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} maxLength={60} style={{padding:'12px', borderRadius:14, border:'1px solid var(--del-border)', fontSize:'0.92rem'}}/>
              <input aria-label="Phone" placeholder="Phone (e.g. +91 98...)" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} style={{padding:'12px', borderRadius:14, border:'1px solid var(--del-border)'}}/>
              <input aria-label="Zone" placeholder="Zone (e.g. Bengaluru Central)" value={form.zone} onChange={e=>setForm({...form, zone:e.target.value})} style={{padding:'12px', borderRadius:14, border:'1px solid var(--del-border)'}}/>
              <button type="submit" className="del-btn del-btn--primary"><Save size={16}/>{loading?'Saving…':'Save Personal Info'}</button>
              <span style={{fontSize:'0.72rem', color:'var(--del-muted)', fontWeight:700}}>No medical/fitness data collected — delivery-only profile.</span>
            </form>
          )
        )}

        {tab==='vehicle' && (
          <div className="del-card" style={{padding:20, display:'grid', gap:12, maxWidth:560}}>
            <h3 style={{display:'flex', gap:8}}><Truck size={18} color="var(--del-primary)"/> Vehicle</h3>
            <select value={form.vehicle} onChange={e=>setForm({...form, vehicle:e.target.value})} style={{padding:'12px', borderRadius:14, border:'1px solid var(--del-border)'}}><option>Bike</option><option>Van</option><option>Electric Scooter</option><option>Cycle</option></select>
            <input placeholder="License (e.g. DL-04-12345)" value={form.license} onChange={e=>setForm({...form, license:e.target.value})} style={{padding:'12px', borderRadius:14, border:'1px solid var(--del-border)'}}/>
            <button onClick={handleSave as any} className="del-btn del-btn--primary"><Save size={16}/> Save Vehicle</button>
            <p style={{fontSize:'0.82rem', color:'var(--del-muted)'}}>Vehicle optional — used for route ETA only.</p>
          </div>
        )}

        {tab==='availability' && (
          <div className="del-card" style={{padding:20, display:'grid', gap:12, maxWidth:560}}>
            <h3 style={{display:'flex', gap:8}}><MapPin size={18} color="var(--del-primary)"/> Availability</h3>
            <label style={{display:'flex', gap:10, alignItems:'center', padding:12, borderRadius:14, border:'1px solid var(--del-border)', background: form.available ? '#f0fdf4' : 'white'}}>
              <input type="checkbox" checked={form.available} onChange={e=>setForm({...form, available:e.target.checked})} style={{width:20, height:20}}/>
              <span style={{fontWeight:800}}>{form.available ? 'Available for deliveries' : 'Unavailable'}</span>
              <span className={`del-badge ${form.available?'del-badge--success':'del-badge--neutral'}`} style={{marginLeft:'auto'}}>{form.available?'On Duty':'Off'}</span>
            </label>
            <p style={{fontSize:'0.82rem', color:'var(--del-muted)'}}>Toggle to receive assignments. Offline hides you from dispatch.</p>
          </div>
        )}

        {tab==='verification' && (
          <div className="del-card" style={{padding:20}}>
            <h3 style={{display:'flex', gap:8}}><ShieldCheck size={18} color="var(--del-primary)"/> Verification</h3>
            <p style={{color:'var(--del-muted)', marginTop:8, fontSize:'0.88rem'}}>ID + license verified by Admin • `requireRole('Delivery','Admin')` • Upload docs coming soon</p>
            <div style={{marginTop:12, padding:12, borderRadius:14, background: profile?.verified?'#ecfdf5':'#fffbeb', border:`1px solid ${profile?.verified?'#a7f3d0':'#fde68a'}`, fontWeight:800, fontSize:'0.88rem'}}>{profile?.verified?'Verified ✓':'Pending — Admin will verify documents'}</div>
          </div>
        )}

        {tab==='security' && (
          <div className="del-card" style={{padding:20}}>
            <h3 style={{display:'flex', gap:8}}><Lock size={18} color="var(--del-primary)"/> Security</h3>
            <p style={{color:'var(--del-muted)', marginTop:8, fontSize:'0.88rem'}}>JWT • RBAC Delivery only • Only Order ID / Address / Phone visible • Audit-logged status changes • No clinical data</p>
            <div style={{marginTop:12, display:'grid', gap:8}}>
              <div style={{padding:12, borderRadius:14, background:'#ecfdf5', border:'1px solid #a7f3d0', display:'flex', gap:8}}><ShieldCheck size={16} color="#22c55e"/><span style={{fontSize:'0.88rem', fontWeight:800}}>2FA — Coming soon</span></div>
              <div style={{padding:12, borderRadius:14, background:'white', border:'1px solid var(--del-border)', display:'flex', gap:8}}><Award size={16} color="var(--del-primary)"/><span style={{fontSize:'0.88rem'}}>Privacy shield: Medical/AI/diet/fitness zero-visibility</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default DeliveryProfileNew;
