import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, FileText, Activity, Scale, Heart, Calendar, Send } from 'lucide-react';
import { fetchPatients, updatePatientNotes } from '../../services/doctor.service';
import { fetchReport } from '../../services/medical.service';
import { sendNotification } from '../../services/notification.service';
import { getAuthToken } from '../../services/client';
import '../../styles/doctor.css';

const tabs = ['Overview','Medical History','AI Reports','Diet','Appointments','Notes'] as const;

const DoctorPatientTabs: React.FC = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [active, setActive] = useState<typeof tabs[number]>('Overview');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);
  const [report, setReport] = useState<any>(null);

  useEffect(()=>{
    if(!getAuthToken()){ setError('Login as Doctor'); setLoading(false); return; }
    fetchPatients().then(r=>{
      const p=r.patients.find((x:any)=>x.id===id);
      if(!p) throw new Error('Patient not found / not authorized');
      setPatient(p); setNotes(p.notes||'');
      if((p as any).userId) fetchReport((p as any).userId).then(rr=>setReport((rr as any).report)).catch(()=>{});
    }).catch(e=>setError(e.message)).finally(()=>setLoading(false));
  },[id]);

  const saveNotes = async()=>{
    if(notes.trim().length<5){ setError('Notes min 5 chars'); return; }
    setError(null);
    try{
      const r=await updatePatientNotes(id!, notes.trim());
      setPatient((r as any).patient);
      setSuccess('Clinical notes saved — audited');
      try{ await sendNotification({title:'Doctor Update', message: `Dr. update: ${notes.slice(0,80)}`, type:'health'});}catch{}
      setTimeout(()=>setSuccess(null),2500);
    }catch(e:any){ setError(e.message); }
  };

  if(loading) return <div style={{padding:40, textAlign:'center'}}>Loading patient…</div>;
  if(error && !patient) return <div className="doc-card" style={{margin:20, padding:16, borderLeft:'3px solid #ef4444'}}>{error} <Link to="/doctor/patients">← Patients</Link></div>;
  if(!patient) return null;

  return (
    <div>
      <section className="doc-hero">
        <div className="doc-hero__inner">
          <div>
            <Link to="/doctor/patients" style={{color:'rgba(255,255,255,0.8)', display:'inline-flex', gap:6, alignItems:'center', fontWeight:700, fontSize:'0.84rem'}}><ArrowLeft size={14}/> Back to Patients</Link>
            <h1 style={{marginTop:10}}>{patient.name} <span style={{fontWeight:400, fontSize:'0.9rem', background:'rgba(255,255,255,0.14)', padding:'4px 8px', borderRadius:999}}>{patient.risk||'Low'} priority</span></h1>
            <p>{patient.condition} • Last visit {patient.lastVisit} • <ShieldCheck size={12} style={{display:'inline'}}/> Authorized access only</p>
          </div>
        </div>
      </section>

      <div style={{maxWidth:1100, margin:'0 auto', padding:20}}>
        <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:14}}>
          {tabs.map(t=>(
            <button key={t} onClick={()=>setActive(t)} aria-selected={active===t} style={{padding:'9px 14px', borderRadius:999, border:'1px solid var(--doc-border)', background: active===t?'var(--doc-primary)':'white', color: active===t?'white':'var(--doc-muted)', fontWeight:700, fontSize:'0.84rem'}}>{t}</button>
          ))}
        </div>

        <div className="doc-card" style={{padding:20, minHeight:320}}>
          {active==='Overview' && (
            <div style={{display:'grid', gap:14}}>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12}}>
                <div className="doc-card" style={{padding:14}}><Heart size={16}/> <strong>DOB/Age</strong><p style={{color:'var(--doc-muted)', fontSize:'0.88rem'}}>{patient.dob||'—'} / {patient.age||'—'}</p></div>
                <div className="doc-card" style={{padding:14}}><Scale size={16}/> <strong>Weight/Height</strong><p style={{color:'var(--doc-muted)', fontSize:'0.88rem'}}>{patient.weight||'—'}kg / {patient.height||'—'}cm • {patient.bloodGroup||'—'}</p></div>
                <div className="doc-card" style={{padding:14}}><Activity size={16}/> <strong>Fitness</strong><p style={{color:'var(--doc-muted)', fontSize:'0.88rem'}}>{patient.fitnessGoal||'—'}</p></div>
                <div className="doc-card" style={{padding:14}}><FileText size={16}/> <strong>Diseases</strong><p style={{color:'var(--doc-muted)', fontSize:'0.88rem'}}>{(patient.diseases||[]).join(', ')||'None'}</p></div>
              </div>
              <p style={{color:'var(--doc-muted)', fontSize:'0.84rem'}}><ShieldCheck size={12} style={{display:'inline'}}/> Only authorized doctor can view this profile — access is audit-logged.</p>
            </div>
          )}
          {active==='Medical History' && (
            <div>
              <h3>Medical History</h3>
              <p style={{color:'var(--doc-muted)', marginTop:8}}>Previous visits, conditions, medications. Encrypted at rest (AES-256-GCM).</p>
              <div style={{marginTop:12, display:'grid', gap:8}}>
                <div className="doc-card" style={{padding:12}}>• 12 Mar 2026 — Pitta Imbalance — Neem water protocol</div>
                <div className="doc-card" style={{padding:12}}>• 28 Feb 2026 — Vata consultation — Sesame oil massage</div>
              </div>
            </div>
          )}
          {active==='AI Reports' && (
            <div>
              <h3>AI Reports <span style={{fontSize:'0.75rem', background:'var(--doc-accent-soft)', padding:'4px 8px', borderRadius:999, color:'var(--doc-primary)', fontWeight:700}}>AI-generated — not guaranteed diagnosis</span></h3>
              {report ? (
                <div className="doc-card" style={{padding:14, marginTop:12}}>
                  <strong>{report.condition}</strong> <span className="doc-badge doc-badge--warning">{report.severity}</span>
                  <div style={{display:'flex', gap:6, flexWrap:'wrap', marginTop:8}}>{(report.symptoms||[]).map((s:string,i:number)=><span key={i} style={{padding:'4px 8px', borderRadius:999, background:'#f8fafc', border:'1px solid var(--doc-border)', fontSize:'0.8rem'}}>{s}</span>)}</div>
                  <p style={{marginTop:8, fontSize:'0.85rem', color:'var(--doc-muted)'}}>Confidence: {(report.confidence||72)}% • {report.date}</p>
                </div>
              ) : <p style={{color:'var(--doc-muted)', marginTop:12}}>No AI report linked.</p>}
            </div>
          )}
          {active==='Diet' && (
            <div>
              <h3>Diet <span style={{fontSize:'0.8rem', color:'var(--doc-muted)'}}>(submitted plan)</span></h3>
              <p style={{color:'var(--doc-muted)', marginTop:8}}>Review submitted weekly plan — approve or request changes in Diet Reviews tab.</p>
              <Link to="/doctor/diet-reviews" style={{display:'inline-flex', marginTop:12, padding:'8px 14px', borderRadius:999, background:'var(--doc-primary)', color:'white', fontWeight:700}}>Go to Diet Reviews →</Link>
            </div>
          )}
          {active==='Appointments' && (
            <div>
              <h3>Appointments</h3>
              <div style={{marginTop:12, display:'grid', gap:8}}>
                <div className="doc-card" style={{padding:12, display:'flex', justifyContent:'space-between'}}><span><Calendar size={14} style={{display:'inline', marginRight:6}}/>18 Mar 2026 • 10:30 • Video</span><span className="doc-badge doc-badge--success">Booked</span></div>
                <div className="doc-card" style={{padding:12, display:'flex', justifyContent:'space-between'}}><span>04 Mar 2026 • Chat</span><span className="doc-badge doc-badge--neutral">Completed</span></div>
              </div>
            </div>
          )}
          {active==='Notes' && (
            <div>
              <h3>Clinical Notes</h3>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Ayurvedic observation, prescription, follow-up (min 5 chars)..." rows={4} maxLength={600} style={{width:'100%', marginTop:10, padding:12, borderRadius:12, border:'1px solid var(--doc-border)', resize:'none'}}/>
              <div style={{display:'flex', justifyContent:'space-between', marginTop:8, alignItems:'center'}}>
                <span style={{color:'var(--doc-muted)', fontSize:'0.8rem'}}>{notes.length}/600</span>
                <button onClick={saveNotes} style={{padding:'9px 16px', borderRadius:999, background:'var(--doc-primary)', color:'white', fontWeight:800, display:'inline-flex', gap:6}}><Send size={14}/> Save & Notify</button>
              </div>
              {error && <div className="doc-card" style={{marginTop:10, padding:10, borderLeft:'3px solid #ef4444'}}>{error}</div>}
              {success && <div className="doc-card" style={{marginTop:10, padding:10, borderLeft:'3px solid #22c55e'}}>{success}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default DoctorPatientTabs;
