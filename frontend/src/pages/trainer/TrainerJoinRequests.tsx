import React, { useState } from 'react';
import { UserPlus, CheckCircle, XCircle, MessageCircle, Dumbbell, Scale, Target, Clock } from 'lucide-react';
import '../../styles/trainer.css';

const mockRequests = [
  { id:'JR-201', name:'Neha Patel', goal:'Weight Loss', ageStage:'18–30', bodyType:'bulk', activity:'Yoga 2×/week', avatar:'N' },
  { id:'JR-202', name:'Rohan Singh', goal:'Muscle Gain', ageStage:'18–30', bodyType:'cut', activity:'Gym 4×/week', avatar:'R' },
  { id:'JR-203', name:'Ananya Gupta', goal:'Flexibility', ageStage:'10–18', bodyType:'skinny', activity:'Stretch daily', avatar:'A' },
];

const TrainerJoinRequests: React.FC = () => {
  const [requests, setRequests] = useState(mockRequests);
  const [filter, setFilter] = useState<'All'|'Pending'|'Accepted'|'Rejected'>('All');
  const [accepted, setAccepted] = useState<Record<string, 'Accepted'|'Rejected'>>({});
  const [toast, setToast] = useState<string|null>(null);

  const showToast = (m:string)=>{ setToast(m); setTimeout(()=>setToast(null),2500); };
  const handle = (id:string, action:'Accepted'|'Rejected')=>{
    setAccepted(prev=>({...prev, [id]:action}));
    if(action==='Accepted') setRequests(prev=>prev.filter(r=>r.id!==id));
    showToast(`${action}: ${id} • ${action==='Accepted'?'Member added • Fitness profile shared':'Rejected • Notified'}`);
  };

  const visible = requests.filter(r=> filter==='All' || (!accepted[r.id] && filter==='Pending') || accepted[r.id]===filter);
  // show pending by default, but allow Accepted/Rejected via state
  const pendingCount = requests.length;

  return (
    <div>
      <section className="trainer-hero">
        <div className="trainer-hero__inner">
          <div>
            <h1>Join Requests</h1>
            <p>View request • Authorized fitness info • Accept • Reject • Communicate</p>
          </div>
          <div><span className="trainer-badge" style={{background:'white', color:'var(--trainer-dark)', borderColor:'white'}}><Clock size={12}/>{pendingCount} Pending</span></div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20}}>
        <div style={{display:'flex', gap:8, marginBottom:14, flexWrap:'wrap'}}>
          {(['All','Pending','Accepted','Rejected'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'8px 14px', borderRadius:999, border:'1px solid var(--trainer-border)', background: filter===f?'var(--trainer-primary)':'white', color:filter===f?'white':'var(--trainer-muted)', fontWeight:900, fontSize:'0.84rem'}}>{f}</button>
          ))}
          <span style={{marginLeft:'auto', color:'var(--trainer-muted)', fontWeight:800, fontSize:'0.84rem'}}>{visible.length} requests</span>
        </div>

        {visible.length===0 ? (
          <div className="trainer-card" style={{padding:40, textAlign:'center'}}><CheckCircle size={36} color="#22c55e"/><p style={{marginTop:10, color:'var(--trainer-muted)'}}>No requests for filter</p><p style={{fontSize:'0.82rem', color:'var(--trainer-muted)'}}>New member requests appear here. You only receive fitness-necessary data.</p></div>
        ) : (
          <div style={{display:'grid', gap:12}}>
            {visible.map(r=>(
              <div key={r.id} className="trainer-card" style={{padding:16, display:'grid', gap:12}}>
                <div style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:10}}>
                  <div style={{display:'flex', gap:12, alignItems:'center'}}>
                    <span style={{width:44, height:44, borderRadius:999, background:'var(--trainer-accent-soft)', display:'grid', placeItems:'center', fontWeight:900, color:'var(--trainer-primary)', fontSize:'1.1rem'}}>{r.avatar}</span>
                    <div>
                      <strong style={{display:'flex', gap:8, alignItems:'center'}}><UserPlus size={16} color="var(--trainer-primary)"/>{r.name} <span className="trainer-badge trainer-badge--neutral">{r.goal}</span></strong>
                      <p style={{color:'var(--trainer-muted)', fontSize:'0.84rem', marginTop:2, display:'flex', gap:8, flexWrap:'wrap'}}><Target size={12}/>{r.ageStage} • <Scale size={12}/>{r.bodyType} • <Dumbbell size={12}/>{r.activity}</p>
                    </div>
                  </div>
                  <span style={{fontSize:'0.75rem', color:'var(--trainer-muted)', fontWeight:800}}>{r.id} • Authorized fitness info only</span>
                </div>
                <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                  <button onClick={()=>handle(r.id,'Accepted')} style={{padding:'8px 14px', borderRadius:999, background:'var(--trainer-primary)', color:'white', fontWeight:900, display:'inline-flex', gap:6}}><CheckCircle size={14}/> Accept</button>
                  <button onClick={()=>handle(r.id,'Rejected')} style={{padding:'8px 14px', borderRadius:999, background:'#991b1b', color:'white', fontWeight:900, display:'inline-flex', gap:6}}><XCircle size={14}/> Reject</button>
                  <button onClick={()=>showToast(`Message to ${r.name}: Encouragement sent (inapp notification)`)} style={{padding:'8px 14px', borderRadius:999, border:'1px solid var(--trainer-border)', background:'white', fontWeight:800, display:'inline-flex', gap:6}}><MessageCircle size={14}/> Message</button>
                </div>
                <p style={{fontSize:'0.72rem', color:'var(--trainer-muted)', fontWeight:700}}>Privacy: Medical records are not shared by default. Only fitness goal, bodyType, ageStage, and activity are visible.</p>
              </div>
            ))}
          </div>
        )}
        {toast && <div style={{position:'fixed', bottom:20, right:20, background:'#22c55e', color:'white', padding:'12px 16px', borderRadius:12, fontWeight:800}}>{toast}</div>}
      </div>
    </div>
  );
};
export default TrainerJoinRequests;
