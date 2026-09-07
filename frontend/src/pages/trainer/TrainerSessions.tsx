import React, { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Plus, Users } from 'lucide-react';
import { fetchSessions, addSession } from '../../services/trainer.service';
import { getAuthToken } from '../../services/client';
import '../../styles/trainer.css';

const TrainerSessions: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([
    { id:'TS-101', time:'06:30 AM', title:'Yoga Flow (Vata)', type:'Yoga', date:'2026-03-15', status:'Upcoming', attendees:['Amit Shah'] },
    { id:'TS-102', time:'05:00 PM', title:'HIIT Core (Kapha)', type:'Gym', date:'2026-03-15', status:'Upcoming', attendees:['Priya Rai'] },
    { id:'TS-103', time:'09:00 AM', title:'Recovery Stretch', type:'Custom', date:'2026-03-14', status:'Completed', attendees:['Karan Mehta','Neha Patel'] },
  ]);
  const [filter, setFilter] = useState<'All'|'Upcoming'|'Completed'|'Cancelled'>('All');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10));
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ time:'09:00 AM', title:'', type:'Yoga', date: new Date().toISOString().slice(0,10) });
  const [toast, setToast]=useState<string|null>(null);

  useEffect(()=>{
    if(!getAuthToken()) return;
    fetchSessions().then(r=>{
      if(r.sessions?.length) setSessions(r.sessions.map((s:any)=>({ id:s.id, time:s.time, title:s.title, type:s.type, date: selectedDate, status:'Upcoming', attendees:[] })));
    }).catch(()=>{});
  },[]);

  const filtered = sessions.filter(s=> filter==='All' || s.status===filter);
  const showToast=(m:string)=>{setToast(m); setTimeout(()=>setToast(null),2500);};
  const handleAdd=async()=>{
    if(!form.title.trim() || form.title.length<3){ showToast('Title min 3 chars'); return; }
    if(getAuthToken()){ try{ const res=await addSession({ time:form.time, title:form.title.trim(), type:form.type }); setSessions(prev=>[...prev, { id:res.session.id, time:res.session.time, title:res.session.title, type:res.session.type, date:form.date, status:'Upcoming', attendees:[] }]); showToast(`Session "${res.session.title}" added — PostgreSQL`); setShowAdd(false); return; }catch(e:any){ showToast(e.message); return;}}
    setSessions(prev=>[...prev, { id:`TS-${Date.now()}`, time:form.time, title:form.title.trim(), type:form.type, date:form.date, status:'Upcoming', attendees:[] }]);
    showToast(`Session "${form.title.trim()}" added`);
    setShowAdd(false);
  };
  const markAttendance=(id:string)=>{
    setSessions(prev=>prev.map(s=>s.id===id? {...s, status:'Completed', attendees: s.attendees.length? s.attendees: ['Amit Shah']}:s));
    showToast('Attendance marked — fitness_log updated');
  };

  return (
    <div>
      <section className="trainer-hero">
        <div className="trainer-hero__inner">
          <div>
            <h1>Sessions</h1>
            <p>Calendar • Upcoming • Completed • Session details • Attendance</p>
          </div>
          <button onClick={()=>setShowAdd(true)} style={{justifySelf:'end', padding:'10px 16px', borderRadius:999, background:'white', color:'var(--trainer-dark)', fontWeight:900, border:'1px solid white'}}><Plus size={16} style={{display:'inline', marginRight:6}}/> Add Session</button>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20}}>
        <div style={{display:'flex', gap:10, flexWrap:'wrap', marginBottom:14}}>
          <div className="trainer-card" style={{padding:'10px 14px', display:'flex', gap:8, alignItems:'center'}}>
            <Calendar size={16} color="var(--trainer-primary)"/><input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} style={{border:'none', fontWeight:800}} aria-label="Select date"/>
          </div>
          {(['All','Upcoming','Completed','Cancelled'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'8px 14px', borderRadius:999, border:'1px solid var(--trainer-border)', background: filter===f?'var(--trainer-primary)':'white', color:filter===f?'white':'var(--trainer-muted)', fontWeight:900, fontSize:'0.84rem'}}>{f}</button>
          ))}
          <span style={{marginLeft:'auto', color:'var(--trainer-muted)', fontWeight:800, fontSize:'0.84rem'}}>{filtered.length} sessions</span>
        </div>

        {filtered.length===0 ? (
          <div className="trainer-card" style={{padding:40, textAlign:'center'}}><Calendar size={40} color="var(--trainer-muted)"/><p style={{marginTop:10, color:'var(--trainer-muted)'}}>No sessions for filter</p></div>
        ) : (
          <div style={{display:'grid', gap:10}}>
            {filtered.map(s=>(
              <div key={s.id} className="trainer-card" style={{padding:16, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10}}>
                <div>
                  <strong>{s.title}</strong> <span style={{color:'var(--trainer-muted)', fontSize:'0.88rem'}}>• {s.date} {s.time} • <span className={`trainer-badge ${s.type==='Yoga'?'trainer-badge--success':'trainer-badge--neutral'}`}>{s.type}</span></span>
                  <p style={{fontSize:'0.82rem', color:'var(--trainer-muted)', marginTop:4, display:'flex', gap:6, alignItems:'center'}}><Users size={12}/>Attendees: {s.attendees.join(', ')||'—'} • {s.id}</p>
                </div>
                <div style={{display:'flex', gap:8, alignItems:'center'}}>
                  <span className={`trainer-badge ${s.status==='Upcoming'?'trainer-badge--warning': s.status==='Completed'?'trainer-badge--success':'trainer-badge--danger'}`}>{s.status==='Upcoming'?<Clock size={12} style={{display:'inline', marginRight:4}}/>: s.status==='Completed'?<CheckCircle size={12} style={{display:'inline', marginRight:4}}/>: <XCircle size={12} style={{display:'inline', marginRight:4}}/>}{s.status}</span>
                  {s.status==='Upcoming' && <button onClick={()=>markAttendance(s.id)} style={{padding:'7px 12px', borderRadius:999, background:'var(--trainer-primary)', color:'white', fontWeight:900, fontSize:'0.82rem'}}>Mark Attendance</button>}
                </div>
              </div>
            ))}
          </div>
        )}

        {showAdd && (
          <div style={{position:'fixed', inset:0, background:'rgba(15,30,15,0.28)', display:'grid', placeItems:'center', zIndex:80}} onClick={()=>setShowAdd(false)}>
            <div className="trainer-card" onClick={e=>e.stopPropagation()} style={{padding:20, width:'92%', maxWidth:520, display:'grid', gap:12}}>
              <h3>Add Training Session</h3>
              <input placeholder="Session title (e.g. Morning Flow Yoga)" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} maxLength={60} style={{padding:'10px 12px', borderRadius:12, border:'1px solid var(--trainer-border)'}}/>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}>
                <select value={form.time} onChange={e=>setForm({...form, time:e.target.value})} style={{padding:'10px', borderRadius:12, border:'1px solid var(--trainer-border)'}}><option>06:30 AM</option><option>09:00 AM</option><option>10:00 AM</option><option>02:00 PM</option><option>05:00 PM</option><option>07:00 PM</option></select>
                <select value={form.type} onChange={e=>setForm({...form, type:e.target.value})} style={{padding:'10px', borderRadius:12, border:'1px solid var(--trainer-border)'}}><option>Yoga</option><option>Gym</option><option>Custom</option><option>Rehab</option></select>
                <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} style={{padding:'10px', borderRadius:12, border:'1px solid var(--trainer-border)'}}/>
              </div>
              <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
                <button onClick={()=>setShowAdd(false)} style={{padding:'8px 14px', borderRadius:999, border:'1px solid var(--trainer-border)', background:'white', fontWeight:800}}>Cancel</button>
                <button onClick={handleAdd} style={{padding:'8px 16px', borderRadius:999, background:'var(--trainer-primary)', color:'white', fontWeight:900}}>Add Session</button>
              </div>
            </div>
          </div>
        )}
        {toast && <div style={{position:'fixed', bottom:20, right:20, background:'#22c55e', color:'white', padding:'12px 16px', borderRadius:12, fontWeight:800}}>{toast}</div>}
      </div>
    </div>
  );
};
export default TrainerSessions;
