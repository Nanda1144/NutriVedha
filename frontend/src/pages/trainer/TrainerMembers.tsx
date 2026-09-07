import React, { useEffect, useMemo, useState } from 'react';
import { Search, Eye, MessageCircle, Dumbbell, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchTrainees } from '../../services/trainer.service';
import { getAuthToken } from '../../services/client';
import '../../styles/trainer.css';

const TrainerMembers: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'All'|'In Progress'|'Completed'>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(()=>{
    if(!getAuthToken()){ setError('Login as Trainer to view members'); setLoading(false); return;}
    fetchTrainees().then(r=>{
      if(r.trainees?.length) setMembers(r.trainees);
      else setMembers([
        {id:'t1', name:'Amit Shah', goal:'Weight Loss', compliance:65, status:'In Progress', progress:65, lastActive:'2 hours ago', activity:'Surya Namaskar ×3'},
        {id:'t2', name:'Priya Rai', goal:'Muscle Gain', compliance:80, status:'Completed', progress:80, lastActive:'Yesterday', activity:'HIIT Core'},
        {id:'t3', name:'Karan Mehta', goal:'Flexibility', compliance:45, status:'In Progress', progress:45, lastActive:'Today', activity:'Yoga Flow'},
      ]);
    }).catch(e=>setError(e.message)).finally(()=>setLoading(false));
  },[]);

  const filtered = useMemo(()=> members.filter(m=>{
    const matchQ = !q || m.name.toLowerCase().includes(q.toLowerCase()) || m.goal.toLowerCase().includes(q.toLowerCase());
    const matchS = filter==='All' || m.status===filter;
    return matchQ && matchS;
  }),[members,q,filter]);

  return (
    <div>
      <section className="trainer-hero">
        <div className="trainer-hero__inner">
          <div>
            <h1>Members</h1>
            <p>Member list • Search • Fitness goal • Activity • Progress • Status</p>
          </div>
          <div style={{color:'rgba(255,255,255,0.78)', fontSize:'0.84rem', textAlign:'right', display:'flex', gap:6, alignItems:'center', justifyContent:'flex-end'}}><ShieldCheck size={16}/> Fitness data only</div>
        </div>
      </section>
      <div style={{maxWidth:1200, margin:'0 auto', padding:20}}>
        <div style={{display:'flex', gap:10, flexWrap:'wrap', marginBottom:14}}>
          <div style={{flex:1, minWidth:220, position:'relative'}}>
            <Search size={16} style={{position:'absolute', left:12, top:12, color:'var(--trainer-muted)'}}/>
            <input aria-label="Search members" placeholder="Search name, goal" value={q} onChange={e=>setQ(e.target.value)} style={{width:'100%', padding:'10px 14px 10px 36px', borderRadius:12, border:'1px solid var(--trainer-border)'}}/>
          </div>
          {(['All','In Progress','Completed'] as const).map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{padding:'9px 14px', borderRadius:999, border:'1px solid var(--trainer-border)', background: filter===s?'var(--trainer-primary)':'white', color: filter===s?'white':'var(--trainer-muted)', fontWeight:900, fontSize:'0.82rem'}}>{s}</button>
          ))}
        </div>

        {loading ? <p style={{textAlign:'center', padding:30}}>Loading members…</p> : error ? <div className="trainer-card" style={{padding:14, borderLeft:'3px solid #ef4444'}}>{error}</div> : filtered.length===0 ? (
          <div className="trainer-card" style={{padding:40, textAlign:'center'}}><p style={{color:'var(--trainer-muted)'}}>No members match filter</p><button onClick={()=>{setQ(''); setFilter('All');}} style={{marginTop:10, padding:'8px 14px', borderRadius:999, background:'var(--trainer-primary)', color:'white', fontWeight:900}}>Clear filters</button></div>
        ) : (
          <div className="trainer-card" style={{overflow:'auto'}}>
            <table className="trainer-table" aria-label="Members">
              <thead><tr><th>Member</th><th>Goal</th><th>Activity</th><th>Progress</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody className="trainer-stagger">
                {filtered.map(m=>(
                  <tr key={m.id}>
                    <td><div style={{display:'flex', gap:10, alignItems:'center'}}><span style={{width:32, height:32, borderRadius:999, background:'var(--trainer-accent-soft)', display:'grid', placeItems:'center', fontWeight:900, color:'var(--trainer-primary)'}}>{m.name.charAt(0)}</span><strong>{m.name}</strong></div></td>
                    <td><span className="trainer-badge trainer-badge--neutral"><Dumbbell size={12}/>{m.goal}</span></td>
                    <td style={{color:'var(--trainer-muted)', fontSize:'0.88rem'}}>{m.activity || m.lastActive}</td>
                    <td><div style={{display:'flex', gap:8, alignItems:'center'}}><div style={{width:80, height:6, background:'#e6ece3', borderRadius:999, overflow:'hidden'}}><div style={{width:`${m.compliance||m.progress}%`, height:'100%', background:'var(--trainer-primary)', transition:'width 0.6s'}}/></div><strong style={{fontSize:'0.82rem'}}>{m.compliance||m.progress}%</strong></div></td>
                    <td><span className={`trainer-badge ${m.status==='Completed'?'trainer-badge--success':'trainer-badge--warning'}`}>{m.status}</span></td>
                    <td><div style={{display:'flex', gap:6}}>
                      <Link to={`/trainer/members/${m.id}`} aria-label={`View ${m.name}`} style={{width:32, height:32, display:'grid', placeItems:'center', borderRadius:8, border:'1px solid var(--trainer-border)', background:'#fff'}}><Eye size={14}/></Link>
                      <Link to="/trainer/messages" aria-label={`Message ${m.name}`} style={{width:32, height:32, display:'grid', placeItems:'center', borderRadius:8, border:'1px solid var(--trainer-border)', background:'#fff'}}><MessageCircle size={14}/></Link>
                    </div></td>
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
export default TrainerMembers;
