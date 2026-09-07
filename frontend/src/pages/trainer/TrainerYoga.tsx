import React, { useState } from 'react';
import { Flower2, Clock, Users, Plus, Award } from 'lucide-react';
import '../../styles/trainer.css';

type Routine = { id:string; name:string; duration:string; difficulty:'Easy'|'Medium'|'Hard'; members:string[]; completion:number };

const initial: Routine[] = [
  { id:'YG-101', name:'Surya Namaskar Flow', duration:'20m', difficulty:'Medium', members:['Amit Shah','Neha Patel'], completion:70 },
  { id:'YG-102', name:'Vata Grounding — Hatha', duration:'30m', difficulty:'Easy', members:['Karan Mehta'], completion:45 },
  { id:'YG-103', name:'Kapha Energize — Vinyasa', duration:'15m', difficulty:'Hard', members:[], completion:0 },
];

const TrainerYoga: React.FC = () => {
  const [routines, setRoutines] = useState<Routine[]>(initial);
  const [form, setForm] = useState({ name:'', duration:'20m', difficulty:'Medium' as Routine['difficulty'] });
  const [assignTo, setAssignTo] = useState('');
  const [toast, setToast] = useState<string|null>(null);
  const showToast=(m:string)=>{setToast(m); setTimeout(()=>setToast(null),2500);};

  const handleCreate=()=>{
    if(!form.name.trim() || form.name.length<3){ showToast('Routine name min 3 chars'); return;}
    const r:Routine={ id:`YG-${Date.now()}`, name:form.name.trim(), duration:form.duration, difficulty:form.difficulty, members:[], completion:0 };
    setRoutines(prev=>[r, ...prev]); showToast(`Yoga routine "${r.name}" created`);
    setForm({name:'', duration:'20m', difficulty:'Medium'});
  };
  const assign=(id:string)=>{
    if(!assignTo.trim()){ showToast('Member name required'); return;}
    setRoutines(prev=>prev.map(x=>x.id===id? {...x, members:[...x.members, assignTo.trim()]}:x));
    showToast(`Assigned ${assignTo.trim()} to yoga routine`);
    setAssignTo('');
  };
  const bump=(id:string)=> setRoutines(prev=>prev.map(x=>x.id===id? {...x, completion: Math.min(100, x.completion+15)}:x));

  return (
    <div>
      <section className="trainer-hero">
        <div className="trainer-hero__inner">
          <div>
            <h1>Yoga</h1>
            <p>Routines • Duration • Difficulty • Assigned members • Completion</p>
          </div>
          <div style={{color:'rgba(255,255,255,0.8)', fontSize:'0.84rem'}}><Flower2 size={16} style={{display:'inline', marginRight:6}}/>Ayurvedic-aligned • Vata / Pitta / Kapha</div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20}}>
        <div className="trainer-card" style={{padding:16, display:'grid', gap:10, marginBottom:16}}>
          <h3 style={{display:'flex', gap:8, alignItems:'center'}}><Plus size={18} color="var(--trainer-primary)"/> Create Yoga Routine</h3>
          <div style={{display:'grid', gridTemplateColumns:'1.4fr 100px 110px', gap:8}}>
            <input placeholder="Routine (e.g. Morning Prana Flow)" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} maxLength={60} style={{padding:'10px 12px', borderRadius:12, border:'1px solid var(--trainer-border)'}}/>
            <select value={form.duration} onChange={e=>setForm({...form, duration:e.target.value})} style={{padding:'10px', borderRadius:12, border:'1px solid var(--trainer-border)'}}><option>10m</option><option>15m</option><option>20m</option><option>30m</option><option>45m</option></select>
            <select value={form.difficulty} onChange={e=>setForm({...form, difficulty:e.target.value as any})} style={{padding:'10px', borderRadius:12, border:'1px solid var(--trainer-border)'}}><option>Easy</option><option>Medium</option><option>Hard</option></select>
          </div>
          <button onClick={handleCreate} style={{justifySelf:'start', padding:'9px 16px', borderRadius:999, background:'var(--trainer-primary)', color:'white', fontWeight:900, display:'inline-flex', gap:6}}><Plus size={14}/> Add Routine</button>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:14}}>
          {routines.map(r=>(
            <div key={r.id} className="trainer-card" style={{padding:16, display:'grid', gap:12}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <strong style={{display:'flex', gap:8, alignItems:'center'}}><Flower2 size={16} color="var(--trainer-primary)"/>{r.name}</strong>
                <span className={`trainer-badge ${r.difficulty==='Hard'?'trainer-badge--danger': r.difficulty==='Medium'?'trainer-badge--warning':'trainer-badge--success'}`}>{r.difficulty}</span>
              </div>
              <p style={{color:'var(--trainer-muted)', fontSize:'0.84rem', display:'flex', gap:8, flexWrap:'wrap'}}><Clock size={12}/>{r.duration} • <Users size={12}/>{r.members.length? r.members.join(', '):'Unassigned'} • {r.id}</p>
              <div style={{display:'flex', gap:8, alignItems:'center'}}>
                <div style={{flex:1, height:8, background:'#e6ece3', borderRadius:999, overflow:'hidden'}}><div style={{width:`${r.completion}%`, height:'100%', background:'var(--trainer-accent)', transition:'width 0.6s'}}/></div>
                <span style={{fontWeight:900, fontSize:'0.82rem'}}>{r.completion}%</span>
                <button onClick={()=>bump(r.id)} style={{padding:'6px 10px', borderRadius:999, border:'1px solid var(--trainer-border)', background:'white', fontWeight:800, fontSize:'0.78rem'}}>✓ +15%</button>
              </div>
              <div style={{display:'flex', gap:8}}>
                <input placeholder="Assign member" value={assignTo} onChange={e=>setAssignTo(e.target.value)} style={{flex:1, padding:'8px 10px', borderRadius:999, border:'1px solid var(--trainer-border)', fontSize:'0.84rem'}}/>
                <button onClick={()=>assign(r.id)} style={{padding:'8px 12px', borderRadius:999, background:'var(--trainer-primary)', color:'white', fontWeight:800, fontSize:'0.82rem'}}><Users size={12} style={{display:'inline', marginRight:4}}/>Assign</button>
              </div>
              {r.completion>=80 && <div style={{padding:'8px 10px', borderRadius:10, background:'#ecfdf5', border:'1px solid #a7f3d0', display:'flex', gap:6, fontSize:'0.82rem', fontWeight:800}}><Award size={14} color="#22c55e"/> High completion — consider progression</div>}
            </div>
          ))}
        </div>
        {toast && <div style={{position:'fixed', bottom:20, right:20, background:'#22c55e', color:'white', padding:'12px 16px', borderRadius:12, fontWeight:800}}>{toast}</div>}
      </div>
    </div>
  );
};
export default TrainerYoga;
