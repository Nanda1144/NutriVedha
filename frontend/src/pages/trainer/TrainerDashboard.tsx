import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Calendar, TrendingUp, Wallet, Award, Activity, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchTrainees, fetchSessions } from '../../services/trainer.service';
import { getAuthToken } from '../../services/client';
import '../../styles/trainer.css';

const TrainerDashboard: React.FC = () => {
  const [trainees, setTrainees] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(()=>{
    if(!getAuthToken()){ setError('Login as Trainer to view dashboard'); setLoading(false); return;}
    Promise.allSettled([fetchTrainees().catch(()=>({trainees:[]})), fetchSessions().catch(()=>({sessions:[]}))]).then(([t,s])=>{
      const tv = (t.status==='fulfilled' && (t.value as any).trainees?.length) ? (t.value as any).trainees : [
        {id:'t1', name:'Amit Shah', goal:'Weight Loss', compliance:65, status:'In Progress', progress:65, lastActive:'2 hours ago'},
        {id:'t2', name:'Priya Rai', goal:'Muscle Gain', compliance:80, status:'Completed', progress:80, lastActive:'Yesterday'},
        {id:'t3', name:'Karan Mehta', goal:'Flexibility', compliance:45, status:'In Progress', progress:45, lastActive:'Today'},
      ];
      const sv = (s.status==='fulfilled' && (s.value as any).sessions?.length) ? (s.value as any).sessions : [
        {time:'06:30 AM', title:'Yoga Flow (Vata)', type:'Yoga'},
        {time:'05:00 PM', title:'HIIT Core (Kapha)', type:'Gym'},
        {time:'07:00 PM', title:'Mobility & Recovery', type:'Custom'},
      ];
      setTrainees(tv); setSessions(sv);
    }).catch(e=>setError(e.message)).finally(()=>setLoading(false));
  },[]);

  const activeMembers = trainees.length;
  const joinRequests = 3; // mock pending join requests
  const todaySessions = sessions.length;
  const avgCompletion = trainees.length ? Math.round(trainees.reduce((a,c)=>a+(c.compliance||c.progress||0),0)/trainees.length) : 0;
  const upcoming = sessions.slice(0,3);
  const earningsPreview = trainees.filter(t=>t.status==='Completed').length * 500;

  const chartData = [45, 62, 58, 74, 68, 80, 72]; // weekly activity %

  if(loading) return <div style={{padding:40, textAlign:'center'}}>Loading trainer dashboard…</div>;
  if(error) return <div className="trainer-card" style={{margin:20, padding:16, borderLeft:'3px solid #ef4444'}}>{error}</div>;

  return (
    <div>
      <section className="trainer-hero">
        <div className="trainer-hero__inner">
          <div>
            <span className="trainer-badge" style={{background:'rgba(255,255,255,0.14)', color:'white', borderColor:'rgba(255,255,255,0.18)'}}><Award size={12}/> Elite Coach • Trainer Command</span>
            <h1>Fitness Command</h1>
            <p>Active members • Join requests • Today&apos;s sessions • Progress • Earnings</p>
          </div>
          <div style={{display:'flex', gap:10, justifyContent:'flex-end', flexWrap:'wrap'}}>
            <Link to="/trainer/members" className="trainer-card" style={{padding:'10px 16px', borderRadius:999, background:'white', color:'var(--trainer-dark)', fontWeight:900, textDecoration:'none'}}>View Members →</Link>
            <Link to="/trainer/join-requests" className="trainer-card" style={{padding:'10px 16px', borderRadius:999, background:'var(--trainer-accent)', color:'var(--trainer-dark)', fontWeight:900, textDecoration:'none', border:'1px solid var(--trainer-accent)'}}>Join Requests ({joinRequests})</Link>
          </div>
        </div>
      </section>

      <div style={{maxWidth:1200, margin:'0 auto', padding:20, display:'grid', gap:16}}>
        {/* Top stats — stagger + progress ring */}
        <div className="trainer-stagger" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12}}>
          <div className="trainer-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><Users size={22} color="var(--trainer-primary)"/><div><div style={{fontWeight:900, fontSize:'1.5rem'}}>{activeMembers}</div><div style={{color:'var(--trainer-muted)', fontSize:'0.82rem', fontWeight:800}}>Active Members</div></div></div>
          <div className="trainer-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><UserPlus size={22} color="#f59e0b"/><div><div style={{fontWeight:900, fontSize:'1.5rem'}}>{joinRequests}</div><div style={{color:'var(--trainer-muted)', fontSize:'0.82rem', fontWeight:800}}>Join Requests</div></div></div>
          <div className="trainer-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><Calendar size={22} color="var(--trainer-primary)"/><div><div style={{fontWeight:900, fontSize:'1.5rem'}}>{todaySessions}</div><div style={{color:'var(--trainer-muted)', fontSize:'0.82rem', fontWeight:800}}>Today&apos;s Sessions</div></div></div>
          <div className="trainer-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><Wallet size={22} color="var(--trainer-primary)"/><div><div style={{fontWeight:900, fontSize:'1.5rem'}}>₹{earningsPreview.toLocaleString()}</div><div style={{color:'var(--trainer-muted)', fontSize:'0.82rem', fontWeight:800}}>Earnings (est.)</div></div></div>
          <div className="trainer-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}>
            <div className="trainer-ring" style={{['--offset' as any]: 283 - (283*avgCompletion)/100}}>
              <svg width={72} height={72}><circle cx={36} cy={36} r={30} stroke="#e6ece3" strokeWidth={7} fill="none"/><circle cx={36} cy={36} r={30} stroke="var(--trainer-primary)" strokeWidth={7} fill="none" strokeDasharray={188} strokeDashoffset={188 - (188*avgCompletion)/100} strokeLinecap="round" style={{transition:'stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)'}}/></svg>
              <span className="trainer-ring__val">{avgCompletion}%</span>
            </div>
            <div><div style={{fontWeight:900, fontSize:'1.1rem'}}>Completion</div><div style={{color:'var(--trainer-muted)', fontSize:'0.82rem', fontWeight:800}}>Avg. progress</div></div>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:16}}>
          <div className="trainer-card" style={{padding:16}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
              <h3 style={{display:'flex', gap:8, alignItems:'center'}}><TrendingUp size={18} color="var(--trainer-primary)"/> Member Progress</h3>
              <Link to="/trainer/progress" style={{fontSize:'0.84rem', color:'var(--trainer-primary)', fontWeight:900}}>View charts →</Link>
            </div>
            {/* Animated progress chart — bars */}
            <div style={{display:'flex', gap:8, alignItems:'end', height:120, padding:'8px 4px', borderRadius:12, background:'#fdfcf8', border:'1px solid var(--trainer-border)'}} aria-label="Weekly activity chart">
              {chartData.map((v,i)=>(
                <div key={i} style={{flex:1, display:'grid', gap:6, justifyItems:'center'}}>
                  <div className="trainer-bar" style={{width:'100%', maxWidth:36, height: `${Math.max(12, v)}%`, background: i===5 ? 'var(--trainer-primary)' : 'var(--trainer-accent)', borderRadius:8, opacity: 0.9 - i*0.04, animationDelay:`${i*0.08}s`}} title={`${v}%`}/>
                  <span style={{fontSize:'0.68rem', fontWeight:800, color:'var(--trainer-muted)'}}>D{i+1}</span>
                </div>
              ))}
            </div>
            <div className="trainer-stagger" style={{display:'grid', gap:8, marginTop:12}}>
              {trainees.slice(0,3).map(m=>(
                <div key={m.id} className="trainer-card" style={{padding:12, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div style={{display:'flex', gap:10, alignItems:'center'}}>
                    <span style={{width:32, height:32, borderRadius:999, background:'var(--trainer-accent-soft)', display:'grid', placeItems:'center', fontWeight:900, color:'var(--trainer-primary)'}}>{m.name.charAt(0)}</span>
                    <div><strong style={{fontSize:'0.92rem'}}>{m.name}</strong><div style={{fontSize:'0.78rem', color:'var(--trainer-muted)', fontWeight:700}}>{m.goal} • {m.lastActive}</div></div>
                  </div>
                  <span className={`trainer-badge ${m.compliance>=70?'trainer-badge--success': m.compliance>=50?'trainer-badge--warning':'trainer-badge--danger'}`}>{m.compliance}%</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:'grid', gap:16, alignContent:'start'}}>
            <div className="trainer-card" style={{padding:16}}>
              <h3 style={{display:'flex', gap:8, alignItems:'center'}}><Calendar size={18} color="var(--trainer-primary)"/> Upcoming Sessions</h3>
              <div style={{marginTop:10, display:'grid', gap:8}}>
                {upcoming.map((s,i)=>(
                  <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f0f0ea', fontSize:'0.88rem'}}>
                    <span><Clock size={12} style={{display:'inline', marginRight:4}}/>{s.time} • {s.title}</span>
                    <span className="trainer-badge trainer-badge--neutral">{s.type}</span>
                  </div>
                ))}
                {upcoming.length===0 && <p style={{color:'var(--trainer-muted)', textAlign:'center', padding:12}}>No sessions today</p>}
              </div>
              <Link to="/trainer/sessions" style={{display:'inline-flex', marginTop:10, fontSize:'0.84rem', fontWeight:900, color:'var(--trainer-primary)'}}>Open calendar →</Link>
            </div>
            <div className="trainer-card" style={{padding:16}}>
              <h3 style={{display:'flex', gap:8, alignItems:'center'}}><Activity size={18} color="var(--trainer-primary)"/> Quick Actions</h3>
              <div style={{display:'grid', gap:8, marginTop:10}}>
                <Link to="/trainer/workout-plans" style={{padding:'10px', borderRadius:999, background:'var(--trainer-primary)', color:'white', fontWeight:900, textAlign:'center', textDecoration:'none'}}>Create Workout Plan +</Link>
                <Link to="/trainer/yoga" style={{padding:'10px', borderRadius:999, border:'1px solid var(--trainer-border)', background:'white', fontWeight:900, textAlign:'center', textDecoration:'none', color:'var(--trainer-dark)'}}>Assign Yoga Routine →</Link>
              </div>
              <p style={{marginTop:10, fontSize:'0.78rem', color:'var(--trainer-muted)', textAlign:'center', display:'flex', gap:6, justifyContent:'center', alignItems:'center'}}><CheckCircle size={12} color="#22c55e"/> Privacy: Fitness data only • No medical records</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TrainerDashboard;
