import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Video, MessageCircle, CheckCircle, XCircle } from 'lucide-react';
import { fetchAppointments, cancelAppointment } from '../../services/telemedicine.service';
import { getAuthToken } from '../../services/client';
import '../../styles/doctor.css';

const DoctorAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState<'All'|'Booked'|'Completed'|'Cancelled'>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10));

  const load = async()=>{
    if(!getAuthToken()){ setError('Login as Doctor'); setLoading(false); return; }
    setLoading(true);
    try{
      const r=await fetchAppointments();
      setAppointments((r as any).appointments||[]);
      if(!(r as any).appointments?.length) setAppointments([
        {id:'AP-101', patient:'Rahul V.', date:selectedDate, time:'10:30', mode:'video', status:'Booked'},
        {id:'AP-102', patient:'Aarav S.', date:selectedDate, time:'14:00', mode:'chat', status:'Completed'},
      ]);
    }catch(e:any){ setError(e.message); }
    setLoading(false);
  };
  useEffect(()=>{ void load(); },[]);

  const filtered = appointments.filter(a=> filter==='All' || a.status===filter);

  const handleCancel = async(id:string)=>{
    if(!confirm('Cancel appointment? Patient notified')) return;
    try{ await cancelAppointment(id); setAppointments(prev=>prev.map(a=>a.id===id?{...a,status:'Cancelled'}:a)); }catch(e:any){ setError(e.message); }
  };

  return (
    <div>
      <section className="doc-hero">
        <div className="doc-hero__inner">
          <div>
            <h1>Appointments</h1>
            <p>Calendar • Today • Upcoming • Completed • Cancelled • Consultation action</p>
          </div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20}}>
        <div style={{display:'flex', gap:10, flexWrap:'wrap', marginBottom:14}}>
          <div className="doc-card" style={{padding:'10px 14px', display:'flex', gap:8, alignItems:'center'}}>
            <Calendar size={16} color="var(--doc-primary)"/><input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} style={{border:'none', fontWeight:700}}/>
          </div>
          {(['All','Booked','Completed','Cancelled'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'8px 14px', borderRadius:999, border:'1px solid var(--doc-border)', background: filter===f?'var(--doc-primary)':'white', color: filter===f?'white':'var(--doc-muted)', fontWeight:700, fontSize:'0.84rem'}}>{f}</button>
          ))}
          <span style={{marginLeft:'auto', color:'var(--doc-muted)', fontWeight:700, fontSize:'0.84rem'}}>{filtered.length} appointments</span>
        </div>

        {loading ? <p style={{textAlign:'center', padding:30}}>Loading appointments…</p> : error ? <div className="doc-card" style={{padding:14, borderLeft:'3px solid #ef4444'}}>{error}</div> : filtered.length===0 ? (
          <div className="doc-card" style={{padding:40, textAlign:'center'}}><Calendar size={40} color="var(--doc-muted)"/><p style={{marginTop:10, color:'var(--doc-muted)'}}>No appointments for filter</p></div>
        ) : (
          <div style={{display:'grid', gap:10}}>
            {filtered.map(a=>(
              <div key={a.id} className="doc-card" style={{padding:16, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10}}>
                <div>
                  <strong>{a.patient || a.doctorId}</strong> <span style={{color:'var(--doc-muted)', fontSize:'0.88rem'}}>• {a.date} {a.time} • <span className={`doc-badge ${a.mode==='video'?'doc-badge--success':'doc-badge--neutral'}`}>{a.mode==='video'?<Video size={12} style={{display:'inline', marginRight:4}}/>: <MessageCircle size={12} style={{display:'inline', marginRight:4}}/>}{a.mode}</span></span>
                  <p style={{fontSize:'0.75rem', color:'var(--doc-muted)'}}>{a.id}</p>
                </div>
                <div style={{display:'flex', gap:8, alignItems:'center'}}>
                  <span className={`doc-badge ${a.status==='Booked'?'doc-badge--warning': a.status==='Completed'?'doc-badge--success':'doc-badge--danger'}`}>{a.status==='Booked'?<Clock size={12} style={{display:'inline', marginRight:4}}/>: a.status==='Completed'?<CheckCircle size={12} style={{display:'inline', marginRight:4}}/>: <XCircle size={12} style={{display:'inline', marginRight:4}}/>}{a.status}</span>
                  {a.status==='Booked' && <button onClick={()=>handleCancel(a.id)} style={{padding:'7px 12px', borderRadius:999, border:'1px solid #fecaca', color:'#991b1b', background:'white', fontWeight:700, fontSize:'0.82rem'}}>Cancel</button>}
                  {a.status==='Booked' && <button style={{padding:'7px 12px', borderRadius:999, background:'var(--doc-primary)', color:'white', fontWeight:700, fontSize:'0.82rem'}}>Consult →</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default DoctorAppointments;
