import React, { useEffect, useState } from 'react';
import { Users, Calendar, FileScan, UtensilsCrossed, Video, Activity, AlertTriangle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchPatients, fetchVerificationQueue } from '../../services/doctor.service';
import { fetchAppointments } from '../../services/telemedicine.service';
import { getAuthToken } from '../../services/client';
import '../../styles/doctor.css';

const DoctorDashboard: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(()=>{
    if(!getAuthToken()){ setError('Login as Doctor to view dashboard'); setLoading(false); return; }
    setLoading(true);
    Promise.allSettled([fetchPatients(), fetchVerificationQueue(), fetchAppointments().catch(()=>({appointments:[]}))])
      .then(results=>{
        const [p,q,a]=results;
        if(p.status==='fulfilled' && (p.value as any).patients?.length) setPatients((p.value as any).patients);
        else setPatients([{id:'P-001',name:'Rahul V.',condition:'Pitta Imbalance',risk:'Medium',lastVisit:'2 days ago'},{id:'P-003',name:'Aarav S.',condition:'Vata Imbalance',risk:'High',lastVisit:'Today'}]);
        if(q.status==='fulfilled' && (q.value as any).queue?.length) setQueue((q.value as any).queue);
        else setQueue([{id:'VQ-1',flag:'Kapha High',patient:'Aarav S.',status:'Pending',desc:'Diet plan requires sign-off'},{id:'VQ-2',flag:'Pitta High',patient:'Meera K.',status:'Pending',desc:'Skin scan Medium'}]);
        if(a.status==='fulfilled' && (a.value as any).appointments?.length) setAppointments((a.value as any).appointments);
        else setAppointments([{id:'AP-1',patient:'Rahul V.',date:new Date().toISOString().slice(0,10),time:'10:30',mode:'video',status:'Booked'}]);
      })
      .catch(e=>setError(e.message))
      .finally(()=>setLoading(false));
  },[]);

  const pendingReports = queue.filter(x=>x.status==='Pending').length;
  const pendingDiets = queue.length;
  const highPriority = patients.filter(p=>p.risk==='High').length;

  if(loading) return <div style={{padding:40, textAlign:'center'}}>Loading dashboard…</div>;
  if(error) return <div className="doc-card" style={{margin:20, padding:16, borderLeft:'3px solid #ef4444'}}>{error}</div>;

  return (
    <div>
      <section className="doc-hero">
        <div className="doc-hero__inner">
          <div>
            <span className="doc-badge doc-badge--neutral" style={{background:'rgba(255,255,255,0.14)', color:'white', borderColor:'rgba(255,255,255,0.18)'}}>Medical Intelligence Hub</span>
            <h1>Doctor Dashboard</h1>
            <p>Today’s appointments • Patient queue • AI & diet • Telemedicine • Activity</p>
          </div>
          <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
            <Link to="/doctor/patients" className="btn btn-primary">Patient Queue →</Link>
          </div>
        </div>
      </section>

      <div style={{maxWidth:1200, margin:'0 auto', padding:'20px', display:'grid', gap:16}}>
        {/* Top stats — stagger */}
        <div className="doc-stagger" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12}}>
          <div className="doc-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><Calendar size={22} color="var(--doc-primary)"/><div><div style={{fontWeight:800, fontSize:'1.4rem'}}>{appointments.length}</div><div style={{color:'var(--doc-muted)', fontSize:'0.82rem', fontWeight:700}}>Today’s Appointments</div></div></div>
          <div className="doc-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><Users size={22} color="var(--doc-primary)"/><div><div style={{fontWeight:800, fontSize:'1.4rem'}}>{patients.length}</div><div style={{color:'var(--doc-muted)', fontSize:'0.82rem', fontWeight:700}}>Patient Queue</div></div></div>
          <div className="doc-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><FileScan size={22} color="#f59e0b"/><div><div style={{fontWeight:800, fontSize:'1.4rem'}}>{pendingReports}</div><div style={{color:'var(--doc-muted)', fontSize:'0.82rem', fontWeight:700}}>Pending AI Reports</div></div></div>
          <div className="doc-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><UtensilsCrossed size={22} color="var(--doc-primary)"/><div><div style={{fontWeight:800, fontSize:'1.4rem'}}>{pendingDiets}</div><div style={{color:'var(--doc-muted)', fontSize:'0.82rem', fontWeight:700}}>Diet Reviews</div></div></div>
          <div className="doc-card" style={{padding:16, display:'flex', gap:12, alignItems:'center', borderLeft: highPriority? '3px solid #ef4444':undefined}}><AlertTriangle size={22} color={highPriority?'#ef4444':'#22c55e'}/><div><div style={{fontWeight:800, fontSize:'1.4rem'}}>{highPriority}</div><div style={{color:'var(--doc-muted)', fontSize:'0.82rem', fontWeight:700}}>High-Priority</div></div></div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:16}}>
          <div className="doc-card" style={{padding:16}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}><h3 style={{display:'flex', gap:8, alignItems:'center'}}><Users size={18}/> Patient Queue</h3><Link to="/doctor/patients" style={{fontSize:'0.84rem', color:'var(--doc-primary)', fontWeight:700}}>View all →</Link></div>
            <div className="doc-stagger" style={{display:'grid', gap:8}}>
              {patients.slice(0,5).map(p=>(
                <div key={p.id} className="doc-card" style={{padding:12, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div style={{display:'flex', gap:10, alignItems:'center'}}>
                    <span className={`doc-status-dot ${p.risk==='High'?'doc-status-dot--high':p.risk==='Medium'?'doc-status-dot--medium':'doc-status-dot--low'}`} />
                    <strong>{p.name}</strong>
                    <span style={{color:'var(--doc-muted)', fontSize:'0.84rem'}}>{p.condition}</span>
                  </div>
                  <span className={`doc-badge ${p.risk==='High'?'doc-badge--danger':p.risk==='Medium'?'doc-badge--warning':'doc-badge--success'}`}>{p.risk}</span>
                </div>
              ))}
              {patients.length===0 && <p style={{color:'var(--doc-muted)', textAlign:'center', padding:20}}>No patients assigned</p>}
            </div>
          </div>

          <div style={{display:'grid', gap:16}}>
            <div className="doc-card" style={{padding:16}}>
              <h3 style={{display:'flex', gap:8, alignItems:'center'}}><Video size={18} color="var(--doc-primary)"/> Telemedicine Sessions</h3>
              {appointments.slice(0,3).map(a=>(
                <div key={a.id} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f0f0ea', fontSize:'0.88rem'}}>
                  <span><Clock size={12} style={{display:'inline', marginRight:4}}/>{a.time} • {a.patient || a.doctorId}</span>
                  <span className="doc-badge doc-badge--neutral">{a.status}</span>
                </div>
              ))}
              {appointments.length===0 && <p style={{color:'var(--doc-muted)', padding:12, textAlign:'center'}}>No sessions today</p>}
            </div>
            <div className="doc-card" style={{padding:16}}>
              <h3 style={{display:'flex', gap:8, alignItems:'center'}}><Activity size={18} color="var(--doc-primary)"/> Recent Activity</h3>
              <div style={{marginTop:10, display:'grid', gap:8, fontSize:'0.88rem', color:'var(--doc-muted)'}}>
                <div>• Verified AI report for Aarav S. — 10:20 AM</div>
                <div>• Diet approved for Rahul V. — 09:15 AM</div>
                <div>• Telemedicine completed — Meera K. — Yesterday</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DoctorDashboard;
