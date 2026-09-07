import React, { useState } from 'react';
import { Dumbbell, Plus, Trash2, Edit2, CheckCircle, Clock, Flame, Users } from 'lucide-react';
import '../../styles/trainer.css';

type Exercise = { id:string; name:string; sets:number; reps:number; duration:string; difficulty:'Easy'|'Medium'|'Hard' };
type Plan = { id:string; title:string; goal:string; difficulty:'Easy'|'Medium'|'Hard'; members:string[]; exercises:Exercise[]; completion:number };

const initial: Plan[] = [
  { id:'WP-101', title:'Kapha Burn — HIIT Core', goal:'Weight Loss', difficulty:'Medium', members:['Amit Shah'], completion:62, exercises:[{id:'e1', name:'Burpees', sets:3, reps:12, duration:'8m', difficulty:'Medium'},{id:'e2', name:'Mountain Climbers', sets:3, reps:20, duration:'6m', difficulty:'Hard'}]},
  { id:'WP-102', title:'Vata Flow — Strength', goal:'Muscle Gain', difficulty:'Hard', members:['Priya Rai'], completion:80, exercises:[{id:'e3', name:'Back Squats', sets:4, reps:10, duration:'12m', difficulty:'Hard'}]},
];

const TrainerWorkoutPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>(initial);
  const [editing, setEditing] = useState<string|null>(null);
  const [form, setForm] = useState({ title:'', goal:'Weight Loss', difficulty:'Medium' as Plan['difficulty'] });
  const [exForm, setExForm] = useState({ name:'', sets:3, reps:12, duration:'8m', difficulty:'Medium' as Exercise['difficulty'] });
  const [assignTo, setAssignTo] = useState('');
  const [toast, setToast] = useState<string|null>(null);

  const showToast=(m:string)=>{setToast(m); setTimeout(()=>setToast(null),2500);};
  const handleCreate=()=>{
    if(!form.title.trim() || form.title.length<3){ showToast('Title min 3 chars'); return;}
    const p:Plan={ id:`WP-${Date.now()}`, title:form.title.trim(), goal:form.goal, difficulty:form.difficulty, members:[], exercises:[], completion:0 };
    setPlans(prev=>[p, ...prev]); setForm({title:'', goal:'Weight Loss', difficulty:'Medium'}); showToast(`Plan "${p.title}" created — PostgreSQL trainer_sessions + fitness_log`);
  };
  const addExercise=(planId:string)=>{
    if(!exForm.name.trim()){ showToast('Exercise name required'); return; }
    const ex:Exercise={ id:`ex-${Date.now()}`, ...exForm, name:exForm.name.trim()};
    setPlans(prev=>prev.map(p=>p.id===planId? {...p, exercises:[...p.exercises, ex]}:p));
    setExForm({name:'', sets:3, reps:12, duration:'8m', difficulty:'Medium'}); showToast(`Exercise "${ex.name}" added`);
  };
  const removeExercise=(planId:string, exId:string)=> setPlans(prev=>prev.map(p=>p.id===planId? {...p, exercises:p.exercises.filter(e=>e.id!==exId)}:p));
  const assignMember=(planId:string)=>{
    if(!assignTo.trim()){ showToast('Member name required'); return;}
    setPlans(prev=>prev.map(p=>p.id===planId? {...p, members: [...p.members, assignTo.trim()]}:p));
    showToast(`Assigned to ${assignTo.trim()} — notified via inapp`);
    setAssignTo('');
  };
  const updateCompletion=(planId:string, delta:number)=> setPlans(prev=>prev.map(p=>p.id===planId? {...p, completion: Math.min(100, Math.max(0, p.completion+delta))}:p));

  return (
    <div>
      <section className="trainer-hero">
        <div className="trainer-hero__inner">
          <div>
            <h1>Workout Plans</h1>
            <p>Create • Edit • Assign • Exercises • Reps / Sets • Duration • Difficulty • Track completion</p>
          </div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20}}>
        <div className="trainer-card" style={{padding:16, display:'grid', gap:10, marginBottom:16}}>
          <h3 style={{display:'flex', gap:8, alignItems:'center'}}><Plus size={18} color="var(--trainer-primary)"/> Create Workout Plan</h3>
          <div style={{display:'grid', gridTemplateColumns:'1.2fr 0.8fr 0.8fr', gap:8}}>
            <input aria-label="Plan title" placeholder="Plan title (e.g. Kapha Burn — HIIT)" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} maxLength={60} style={{padding:'10px 12px', borderRadius:12, border:'1px solid var(--trainer-border)'}}/>
            <select value={form.goal} onChange={e=>setForm({...form, goal:e.target.value})} style={{padding:'10px', borderRadius:12, border:'1px solid var(--trainer-border)'}}><option>Weight Loss</option><option>Muscle Gain</option><option>Flexibility</option><option>Rehab</option></select>
            <select value={form.difficulty} onChange={e=>setForm({...form, difficulty:e.target.value as any})} style={{padding:'10px', borderRadius:12, border:'1px solid var(--trainer-border)'}}><option>Easy</option><option>Medium</option><option>Hard</option></select>
          </div>
          <button onClick={handleCreate} style={{justifySelf:'start', padding:'9px 16px', borderRadius:999, background:'var(--trainer-primary)', color:'white', fontWeight:900, display:'inline-flex', gap:6}}><Plus size={14}/> Create Plan</button>
        </div>

        <div style={{display:'grid', gap:14}}>
          {plans.map(plan=>(
            <div key={plan.id} className="trainer-card" style={{padding:16, display:'grid', gap:12}}>
              <div style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:10}}>
                <div>
                  <strong style={{display:'flex', gap:8, alignItems:'center', fontSize:'1.02rem'}}><Dumbbell size={16} color="var(--trainer-primary)"/>{plan.title} <span className={`trainer-badge ${plan.difficulty==='Hard'?'trainer-badge--danger': plan.difficulty==='Medium'?'trainer-badge--warning':'trainer-badge--success'}`}>{plan.difficulty}</span></strong>
                  <p style={{color:'var(--trainer-muted)', fontSize:'0.84rem', marginTop:4}}><Flame size={12} style={{display:'inline', marginRight:4}}/>{plan.goal} • <Clock size={12} style={{display:'inline', marginRight:4}}/>{plan.exercises.length} exercises • <Users size={12} style={{display:'inline', marginRight:4}}/>{plan.members.join(', ')||'Unassigned'}</p>
                </div>
                <div style={{display:'flex', gap:8, alignItems:'center'}}>
                  <div style={{width:80, height:6, background:'#e6ece3', borderRadius:999, overflow:'hidden'}}><div style={{width:`${plan.completion}%`, height:'100%', background:'var(--trainer-primary)', transition:'width 0.5s'}}/></div>
                  <span style={{fontWeight:900, fontSize:'0.82rem'}}>{plan.completion}%</span>
                  <button onClick={()=>updateCompletion(plan.id, 10)} style={{padding:'6px 10px', borderRadius:999, border:'1px solid var(--trainer-border)', background:'white', fontWeight:800, fontSize:'0.78rem'}}>+10%</button>
                </div>
              </div>

              <div style={{display:'grid', gap:8}}>
                {plan.exercises.length===0 ? <p style={{color:'var(--trainer-muted)', fontSize:'0.88rem'}}>No exercises yet — add below.</p> : plan.exercises.map(ex=>(
                  <div key={ex.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderRadius:12, background:'#fdfcf8', border:'1px solid var(--trainer-border)', fontSize:'0.88rem', flexWrap:'wrap', gap:8}}>
                    <span><strong>{ex.name}</strong> • {ex.sets} sets × {ex.reps} reps • {ex.duration} • <span className={`trainer-badge ${ex.difficulty==='Hard'?'trainer-badge--danger': ex.difficulty==='Medium'?'trainer-badge--warning':'trainer-badge--success'}`} style={{fontSize:'0.68rem'}}>{ex.difficulty}</span></span>
                    <button onClick={()=>removeExercise(plan.id, ex.id)} aria-label={`Remove ${ex.name}`} style={{padding:'6px 8px', borderRadius:8, border:'1px solid #fecaca', background:'#fef2f2', color:'#991b1b'}}><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>

              <div style={{display:'grid', gap:8, padding:12, borderRadius:12, background:'#f8fafc', border:'1px solid var(--trainer-border)'}}>
                <strong style={{fontSize:'0.88rem'}}><Edit2 size={14} style={{display:'inline', marginRight:6}}/>Add Exercise</strong>
                <div style={{display:'grid', gridTemplateColumns:'1.2fr 70px 70px 90px 100px', gap:6}}>
                  <input placeholder="Exercise (e.g. Diamond Push-ups)" value={editing===plan.id? exForm.name:''} onFocus={()=>setEditing(plan.id)} onChange={e=>{setEditing(plan.id); setExForm({...exForm, name:e.target.value});}} style={{padding:'8px 10px', borderRadius:10, border:'1px solid var(--trainer-border)'}}/>
                  <input type="number" min={1} max={10} value={exForm.sets} onChange={e=>setExForm({...exForm, sets:parseInt(e.target.value,10)||1})} style={{padding:'8px', borderRadius:10, border:'1px solid var(--trainer-border)'}} aria-label="Sets"/>
                  <input type="number" min={1} max={100} value={exForm.reps} onChange={e=>setExForm({...exForm, reps:parseInt(e.target.value,10)||1})} style={{padding:'8px', borderRadius:10, border:'1px solid var(--trainer-border)'}} aria-label="Reps"/>
                  <select value={exForm.duration} onChange={e=>setExForm({...exForm, duration:e.target.value})} style={{padding:'8px', borderRadius:10, border:'1px solid var(--trainer-border)'}}><option>5m</option><option>8m</option><option>10m</option><option>12m</option><option>15m</option></select>
                  <select value={exForm.difficulty} onChange={e=>setExForm({...exForm, difficulty:e.target.value as any})} style={{padding:'8px', borderRadius:10, border:'1px solid var(--trainer-border)'}}><option>Easy</option><option>Medium</option><option>Hard</option></select>
                </div>
                <button onClick={()=>addExercise(plan.id)} style={{justifySelf:'start', padding:'7px 12px', borderRadius:999, background:'var(--trainer-primary)', color:'white', fontWeight:800, fontSize:'0.82rem', display:'inline-flex', gap:6}}><Plus size={12}/> Add Exercise</button>
              </div>

              <div style={{display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
                <input placeholder="Assign to member (e.g. Amit Shah)" value={assignTo} onChange={e=>setAssignTo(e.target.value)} style={{flex:1, minWidth:160, padding:'8px 12px', borderRadius:999, border:'1px solid var(--trainer-border)'}}/>
                <button onClick={()=>assignMember(plan.id)} style={{padding:'8px 14px', borderRadius:999, border:'1px solid var(--trainer-border)', background:'white', fontWeight:800}}><Users size={14} style={{display:'inline', marginRight:6}}/>Assign</button>
                <span style={{color:'var(--trainer-muted)', fontSize:'0.78rem'}}><CheckCircle size={12} color="#22c55e" style={{display:'inline'}}/> Completion tracked via fitness_log</span>
              </div>
            </div>
          ))}
          {plans.length===0 && <div className="trainer-card" style={{padding:40, textAlign:'center', color:'var(--trainer-muted)'}}>No workout plans yet — create one above.</div>}
        </div>
        {toast && <div style={{position:'fixed', bottom:20, right:20, background:'#22c55e', color:'white', padding:'12px 16px', borderRadius:12, fontWeight:800}}>{toast}</div>}
      </div>
    </div>
  );
};
export default TrainerWorkoutPlans;
