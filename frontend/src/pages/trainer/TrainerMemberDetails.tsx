import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Dumbbell, Scale, Heart, Activity, User, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchTrainees } from '../../services/trainer.service';
import { sendNotification } from '../../services/notification.service';
import { getAuthToken } from '../../services/client';
import '../../styles/trainer.css';

const TrainerMemberDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [member, setMember]=useState<any>(null);
  const [plan, setPlan]=useState({ bodyType:'cut', ageStage:'2', workout:'Surya Namaskar' });
  const [loading, setLoading]=useState(false);
  const [error, setError]=useState<string|null>(null);
  const [success, setSuccess]=useState<string|null>(null);

  useEffect(()=>{
    const load=async()=>{
      if(!getAuthToken()){ setError('Login as Trainer'); return; }
      setLoading(true);
      try{
        const res=await fetchTrainees();
        const t=res.trainees.find((x:any)=>x.id===id);
        if(!t) setError('Member not found in your team');
        else setMember(t);
      }catch(e:any){ setError(e.message); }
      setLoading(false);
    };
    void load();
  },[id]);

  const handleAssign=async()=>{
    setError(null); setSuccess(null);
    if(!plan.workout.trim()){ setError('Workout required'); return; }
    setLoading(true);
    try{
      await sendNotification({ title:`New Plan for ${member.name}`, message:`Trainer assigned: ${plan.bodyType} body • Stage ${plan.ageStage} • Workout ${plan.workout}`, type:'health', channel:'inapp' });
      setSuccess(`Plan assigned to ${member.name} — member notified via PostgreSQL notifications`);
    }catch(e:any){ setError(e.message); }
    setLoading(false);
  };

  if(loading && !member) return <div style={{padding:40, textAlign:'center'}}>Loading member…</div>;
  if(error && !member) return <div className="trainer-card" style={{margin:20, padding:16, borderLeft:'3px solid #ef4444'}}>{error} <Link to="/trainer/members">← Members</Link></div>;
  if(!member) return null;

  return (
    <div>
      <section className="trainer-hero">
        <div className="trainer-hero__inner">
          <div>
            <Link to="/trainer/members" style={{color:'rgba(255,255,255,0.9)', display:'inline-flex', gap:6, alignItems:'center', fontWeight:800, fontSize:'0.84rem'}}><ArrowLeft size={14}/> Back to Members</Link>
            <h1 style={{marginTop:10}}>{member.name} <span style={{fontWeight:400, fontSize:'0.85rem', background:'rgba(255,255,255,0.14)', padding:'4px 8px', borderRadius:999}}>{member.status}</span></h1>
            <p>{member.goal} • Compliance {member.compliance}% • {member.lastActive}</p>
          </div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20, display:'grid', gap:16}}>
        <div className="trainer-card" style={{padding:16, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12}}>
          <div className="trainer-card" style={{padding:12}}><User size={16}/><strong>Goal</strong><p style={{color:'var(--trainer-muted)', fontSize:'0.88rem'}}>{member.goal}</p></div>
          <div className="trainer-card" style={{padding:12}}><Dumbbell size={16}/><strong>Compliance</strong><p style={{color:'var(--trainer-muted)', fontSize:'0.88rem'}}>{member.compliance}% • {member.progress}% progress</p></div>
          <div className="trainer-card" style={{padding:12}}><Scale size={16}/><strong>Last Active</strong><p style={{color:'var(--trainer-muted)', fontSize:'0.88rem'}}>{member.lastActive}</p></div>
          <div className="trainer-card" style={{padding:12}}><Heart size={16}/><strong>Privacy</strong><p style={{color:'var(--trainer-muted)', fontSize:'0.84rem'}}>Fitness data only</p></div>
        </div>

        <div className="trainer-card" style={{padding:16}}>
          <h3 style={{display:'flex', gap:8, alignItems:'center'}}><Activity size={18} color="var(--trainer-primary)"/> Fitness Plan Assignment</h3>
          <p style={{color:'var(--trainer-muted)', fontSize:'0.82rem'}}>Assign bodyType • ageStage • workout → trainee notified</p>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:10, marginTop:12}}>
            <select value={plan.bodyType} onChange={e=>setPlan({...plan, bodyType:e.target.value})} style={{padding:'10px', borderRadius:12, border:'1px solid var(--trainer-border)'}}><option value="bulk">Bulk Body</option><option value="skinny">Skinny Body</option><option value="cut">Cut (V-Shape)</option></select>
            <select value={plan.ageStage} onChange={e=>setPlan({...plan, ageStage:e.target.value})} style={{padding:'10px', borderRadius:12, border:'1px solid var(--trainer-border)'}}><option value="1">Stage 1: 10–18</option><option value="2">Stage 2: 18–30</option><option value="3">Stage 3: 30+</option></select>
            <input placeholder="Workout (e.g. Surya Namaskar)" value={plan.workout} onChange={e=>setPlan({...plan, workout:e.target.value})} style={{padding:'10px', borderRadius:12, border:'1px solid var(--trainer-border)'}}/>
          </div>
          <button onClick={handleAssign} disabled={loading} style={{marginTop:12, padding:'10px 16px', borderRadius:999, background:'var(--trainer-primary)', color:'white', fontWeight:900, display:'inline-flex', gap:6}}><Send size={14}/>{loading?'Assigning…':'Assign Plan & Notify'}</button>
          {error && <div className="trainer-card" style={{marginTop:12, padding:10, borderLeft:'3px solid #ef4444', display:'flex', gap:6}}><AlertCircle size={14} color="#ef4444"/><span style={{fontSize:'0.85rem'}}>{error}</span></div>}
          {success && <div className="trainer-card" style={{marginTop:12, padding:10, borderLeft:'3px solid #22c55e', background:'#ecfdf5', display:'flex', gap:6}}><CheckCircle size={14} color="#22c55e"/><span style={{fontSize:'0.85rem'}}>{success}</span></div>}
        </div>
      </div>
    </div>
  );
};
export default TrainerMemberDetails;
