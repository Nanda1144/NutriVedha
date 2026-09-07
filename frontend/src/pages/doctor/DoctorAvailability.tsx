import React, { useState } from 'react';
import { Clock, Calendar, CheckCircle, XCircle, Save } from 'lucide-react';
import '../../styles/doctor.css';

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] as const;

const DoctorAvailability: React.FC = () => {
  const [activeDays, setActiveDays] = useState<Record<string, boolean>>({ Mon:true, Tue:true, Wed:true, Thu:true, Fri:true, Sat:false, Sun:false });
  const [slots, setSlots] = useState<Record<string, string[]>>({
    Mon:['09:00','10:30','14:00'], Tue:['09:00','11:00'], Wed:['09:00','14:00','15:30'], Thu:['10:30'], Fri:['09:00','14:00'], Sat:[], Sun:[]
  });
  const [blocked, setBlocked] = useState<string[]>([]);
  const [success, setSuccess] = useState<string|null>(null);

  const toggleDay = (d:string)=> setActiveDays(prev=> ({...prev, [d]: !prev[d]}));
  const toggleSlot = (d:string, s:string)=>{
    const key=`${d}-${s}`;
    setBlocked(prev=> prev.includes(key) ? prev.filter(x=>x!==key) : [...prev, key]);
  };
  const addSlot = (d:string)=>{
    const t=prompt('New slot (HH:MM, e.g. 16:00):');
    if(!t || !/^\d{2}:\d{2}$/.test(t)) { if(t!==null) alert('Use HH:MM'); return; }
    setSlots(prev=> ({...prev, [d]: [...(prev[d]||[]), t].sort()}));
  };

  const handleSave = ()=>{
    setSuccess('Availability updated — audited, patients see new slots');
    setTimeout(()=>setSuccess(null),2500);
  };

  return (
    <div>
      <section className="doc-hero">
        <div className="doc-hero__inner">
          <div>
            <h1>Availability</h1>
            <p>Configure days • Slots • Block slots • Update availability</p>
          </div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16}}>
          <div className="doc-card" style={{padding:16}}>
            <h3 style={{display:'flex', gap:8, alignItems:'center'}}><Calendar size={18} color="var(--doc-primary)"/> Working Days</h3>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginTop:12}}>
              {days.map(d=>(
                <button key={d} onClick={()=>toggleDay(d)} aria-pressed={!!activeDays[d]} style={{padding:'10px', borderRadius:999, border:'1px solid var(--doc-border)', background: activeDays[d]?'var(--doc-primary)':'white', color: activeDays[d]?'white':'var(--doc-muted)', fontWeight:800}}>{d}</button>
              ))}
            </div>
            <p style={{marginTop:10, color:'var(--doc-muted)', fontSize:'0.84rem'}}><Clock size={12} style={{display:'inline', marginRight:4}}/>Patients can book only on active days.</p>
          </div>

          <div className="doc-card" style={{padding:16}}>
            <h3>Quick Actions</h3>
            <div style={{display:'grid', gap:8, marginTop:12}}>
              <button onClick={handleSave} style={{padding:'10px', borderRadius:999, background:'var(--doc-primary)', color:'white', fontWeight:800, display:'inline-flex', gap:6, justifyContent:'center'}}><Save size={16}/> Save Availability</button>
              <p style={{fontSize:'0.8rem', color:'var(--doc-muted)', textAlign:'center'}}>Audited — changes are logged</p>
            </div>
          </div>
        </div>

        <div style={{marginTop:16, display:'grid', gap:12}}>
          {days.filter(d=>activeDays[d]).map(d=>(
            <div key={d} className="doc-card" style={{padding:14, display:'grid', gap:10}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <strong>{d} — {slots[d]?.length||0} slots</strong>
                <button onClick={()=>addSlot(d)} style={{padding:'6px 12px', borderRadius:999, border:'1px solid var(--doc-border)', background:'white', fontWeight:700, fontSize:'0.82rem'}}>+ Add slot</button>
              </div>
              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                {(slots[d]||[]).length ? slots[d].map(s=>{
                  const blockedNow = blocked.includes(`${d}-${s}`);
                  return (
                    <button key={s} onClick={()=>toggleSlot(d,s)} title={blockedNow?'Blocked — click to unblock':'Available — click to block'} style={{padding:'8px 12px', borderRadius:999, border:'1px solid var(--doc-border)', background: blockedNow?'#fef2f2':'#ecfdf5', color: blockedNow?'#991b1b':'#065f46', fontWeight:700, fontSize:'0.84rem', display:'inline-flex', gap:6, alignItems:'center'}}>
                      {blockedNow? <XCircle size={12}/>: <CheckCircle size={12}/>} {s} {blockedNow?'• Blocked':''}
                    </button>
                  );
                }) : <span style={{color:'var(--doc-muted)', fontSize:'0.88rem'}}>No slots — add one</span>}
              </div>
            </div>
          ))}
          {Object.values(activeDays).every(v=>!v) && <div className="doc-card" style={{padding:20, textAlign:'center', color:'var(--doc-muted)'}}>No active days — enable at least one.</div>}
        </div>
        {success && <div style={{position:'fixed', bottom:20, right:20, background:'#22c55e', color:'white', padding:'12px 16px', borderRadius:12, fontWeight:700}}>{success}</div>}
      </div>
    </div>
  );
};
export default DoctorAvailability;
