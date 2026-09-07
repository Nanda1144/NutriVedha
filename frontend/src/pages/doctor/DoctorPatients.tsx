import React, { useEffect, useMemo, useState } from 'react';
import { Search, Eye, MessageCircle, Video, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchPatients } from '../../services/doctor.service';
import { getAuthToken } from '../../services/client';
import '../../styles/doctor.css';

const DoctorPatients: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'All'|'Active'|'Pending'|'Completed'>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(()=>{
    if(!getAuthToken()){ setError('Login as Doctor'); setLoading(false); return; }
    fetchPatients().then(r=>{
      if(r.patients?.length) setPatients(r.patients);
      else setPatients([{id:'P-001',name:'Rahul V.',condition:'Pitta Imbalance',risk:'Medium',lastVisit:'2 days ago',appointmentStatus:'Booked',avatar:'R'},{id:'P-003',name:'Aarav S.',condition:'Vata Imbalance',risk:'High',lastVisit:'Today',appointmentStatus:'Completed',avatar:'A'}]);
    }).catch(e=>setError(e.message)).finally(()=>setLoading(false));
  },[]);

  const filtered = useMemo(()=> patients.filter(p=>{
    const matchQ = !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.condition.toLowerCase().includes(q.toLowerCase());
    const matchS = status==='All' || (p.appointmentStatus||'Active')===status;
    return matchQ && matchS;
  }),[patients,q,status]);

  return (
    <div>
      <section className="doc-hero">
        <div className="doc-hero__inner">
          <div>
            <h1>Patients</h1>
            <p>Authorized patient list • Search • Filter • Status • Appointment • Profile</p>
          </div>
          <div style={{color:'rgba(255,255,255,0.7)', fontSize:'0.84rem', textAlign:'right'}}><ShieldCheck size={16} style={{display:'inline', marginRight:6}}/>Only assigned patients • Audit-logged</div>
        </div>
      </section>

      <div style={{maxWidth:1200, margin:'0 auto', padding:20}}>
        <div style={{display:'flex', gap:10, flexWrap:'wrap', marginBottom:14}}>
          <div style={{flex:1, minWidth:220, position:'relative'}}>
            <Search size={16} style={{position:'absolute', left:12, top:12, color:'var(--doc-muted)'}}/>
            <input aria-label="Search patients" placeholder="Search name, condition" value={q} onChange={e=>setQ(e.target.value)} style={{width:'100%', padding:'10px 14px 10px 36px', borderRadius:10, border:'1px solid var(--doc-border)'}}/>
          </div>
          {(['All','Active','Pending','Completed'] as const).map(s=>(
            <button key={s} onClick={()=>setStatus(s)} style={{padding:'9px 14px', borderRadius:999, border:'1px solid var(--doc-border)', background: status===s?'var(--doc-primary)':'white', color: status===s?'white':'var(--doc-muted)', fontWeight:700, fontSize:'0.82rem'}}>{s}</button>
          ))}
        </div>

        {loading ? <p style={{textAlign:'center', padding:30}}>Loading patients…</p> : error ? <div className="doc-card" style={{padding:14, borderLeft:'3px solid #ef4444'}}>{error}</div> : filtered.length===0 ? (
          <div className="doc-card" style={{padding:40, textAlign:'center'}}><p style={{color:'var(--doc-muted)'}}>No patients match filter</p><button onClick={()=>{setQ(''); setStatus('All');}} style={{marginTop:10, padding:'8px 14px', borderRadius:999, background:'var(--doc-primary)', color:'white', fontWeight:700}}>Clear filters</button></div>
        ) : (
          <div className="doc-card" style={{overflow:'auto'}}>
            <table className="doc-table" aria-label="Patient list">
              <thead><tr><th>Patient</th><th>Condition</th><th>Status</th><th>Appointment</th><th>Actions</th></tr></thead>
              <tbody className="doc-stagger">
                {filtered.map(p=>(
                  <tr key={p.id}>
                    <td><div style={{display:'flex', gap:10, alignItems:'center'}}><span style={{width:32, height:32, borderRadius:999, background:'var(--doc-accent-soft)', display:'grid', placeItems:'center', fontWeight:800, color:'var(--doc-primary)'}}>{p.avatar||p.name.charAt(0)}</span><strong>{p.name}</strong></div></td>
                    <td>{p.condition}</td>
                    <td><span className={`doc-badge ${p.risk==='High'?'doc-badge--danger':p.risk==='Medium'?'doc-badge--warning':'doc-badge--success'}`}>{p.risk||'Low'}</span></td>
                    <td><span className="doc-badge doc-badge--neutral">{p.appointmentStatus||'Active'}</span></td>
                    <td>
                      <div style={{display:'flex', gap:6}}>
                        <Link to={`/doctor/patients/${p.id}`} aria-label={`View ${p.name}`} style={{width:32, height:32, display:'grid', placeItems:'center', borderRadius:8, border:'1px solid var(--doc-border)', background:'#fff'}}><Eye size={14}/></Link>
                        <button aria-label={`Message ${p.name}`} style={{width:32, height:32, display:'grid', placeItems:'center', borderRadius:8, border:'1px solid var(--doc-border)', background:'#fff'}}><MessageCircle size={14}/></button>
                        <button aria-label={`Video ${p.name}`} style={{width:32, height:32, display:'grid', placeItems:'center', borderRadius:8, background:'var(--doc-primary)', color:'white'}}><Video size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default DoctorPatients;
