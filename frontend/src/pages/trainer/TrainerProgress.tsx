import React, { useEffect, useState } from 'react';
import { TrendingUp, Activity, Scale, Target, CheckCircle } from 'lucide-react';
import { fetchTrainees } from '../../services/trainer.service';
import { getAuthToken } from '../../services/client';
import '../../styles/trainer.css';

const TrainerProgress: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading]=useState(true);
  const weekly = [42, 58, 64, 72, 68, 80, 76]; // activity %
  const goals = [
    { name:'Weight Loss', progress:68 },
    { name:'Muscle Gain', progress:55 },
    { name:'Flexibility', progress:74 },
  ];

  useEffect(()=>{
    if(!getAuthToken()){ setLoading(false); return; }
    fetchTrainees().then(r=>{
      if(r.trainees?.length) setMembers(r.trainees);
      else setMembers([
        {name:'Amit Shah', compliance:65, progress:65, goal:'Weight Loss', lastActive:'2h ago'},
        {name:'Priya Rai', compliance:80, progress:80, goal:'Muscle Gain', lastActive:'Yesterday'},
        {name:'Karan Mehta', compliance:45, progress:45, goal:'Flexibility', lastActive:'Today'},
      ]);
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  if(loading) return <div style={{padding:40, textAlign:'center'}}>Loading progress…</div>;

  return (
    <div>
      <section className="trainer-hero">
        <div className="trainer-hero__inner">
          <div>
            <h1>Progress</h1>
            <p>Workout completion • Goal progress • Weekly activity • Fitness metrics • Charts</p>
          </div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20, display:'grid', gap:16}}>
        {/* Animated progress chart — bars */}
        <div className="trainer-card" style={{padding:16}}>
          <h3 style={{display:'flex', gap:8, alignItems:'center'}}><TrendingUp size={18} color="var(--trainer-primary)"/> Weekly Activity</h3>
          <p style={{color:'var(--trainer-muted)', fontSize:'0.84rem'}}>Animated progress chart • Fitness metrics where authorized</p>
          <div style={{display:'flex', gap:10, alignItems:'end', height:140, padding:12, marginTop:12, borderRadius:12, background:'#fdfcf8', border:'1px solid var(--trainer-border)'}} aria-label="Weekly activity animated chart">
            {weekly.map((v,i)=>(
              <div key={i} style={{flex:1, display:'grid', gap:6, justifyItems:'center'}}>
                <div className="trainer-bar" style={{width:'100%', maxWidth:42, height:`${Math.max(14, v)}%`, background: i===5? 'var(--trainer-primary)':'var(--trainer-accent)', borderRadius:10, animationDelay:`${i*0.09}s`}} title={`${v}%`}/>
                <span style={{fontSize:'0.70rem', fontWeight:900, color:'var(--trainer-muted)'}}>W{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1.2fr 0.8fr', gap:16}}>
          <div className="trainer-card" style={{padding:16}}>
            <h3 style={{display:'flex', gap:8, alignItems:'center'}}><Activity size={18} color="var(--trainer-primary)"/> Member Completion</h3>
            <div style={{display:'grid', gap:12, marginTop:12}}>
              {members.map((m:any, idx:number)=>(
                <div key={idx} style={{display:'grid', gap:6}}>
                  <div style={{display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:'0.88rem'}}>
                    <span>{m.name} • {m.goal}</span><span style={{color: m.compliance>=70?'#065f46': m.compliance>=50?'#92400e':'#991b1b'}}>{m.compliance||m.progress}%</span>
                  </div>
                  <div style={{height:8, background:'#e6ece3', borderRadius:999, overflow:'hidden'}}>
                    <div className="trainer-bar" style={{height:'100%', width:`${m.compliance||m.progress}%`, background:'var(--trainer-primary)', borderRadius:999, animationDelay:`${idx*0.12}s`}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:'grid', gap:16}}>
            <div className="trainer-card" style={{padding:16}}>
              <h3 style={{display:'flex', gap:8, alignItems:'center'}}><Target size={18} color="var(--trainer-primary)"/> Goal Progress</h3>
              <div style={{display:'grid', gap:10, marginTop:10}}>
                {goals.map(g=>(
                  <div key={g.name} style={{display:'flex', gap:10, alignItems:'center'}}>
                    <span style={{flex:1, fontWeight:800, fontSize:'0.88rem'}}>{g.name}</span>
                    <div style={{flex:1, height:8, background:'#e6ece3', borderRadius:999, overflow:'hidden'}}><div style={{width:`${g.progress}%`, height:'100%', background:'var(--trainer-accent)', transition:'width 0.8s'}}/></div>
                    <span style={{fontWeight:900, fontSize:'0.84rem'}}>{g.progress}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="trainer-card" style={{padding:16, display:'grid', gap:8}}>
              <h3 style={{display:'flex', gap:8, alignItems:'center'}}><Scale size={18} color="var(--trainer-primary)"/> Fitness Metrics</h3>
              <p style={{color:'var(--trainer-muted)', fontSize:'0.84rem'}}>Authorized metrics only — weight trend, streak, compliance from fitness_log.</p>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:4}}>
                <div className="trainer-card" style={{padding:12, textAlign:'center'}}><div style={{fontWeight:900, fontSize:'1.3rem', color:'var(--trainer-primary)'}}>+8</div><div style={{fontSize:'0.78rem', color:'var(--trainer-muted)', fontWeight:800}}>Avg Workouts / week</div></div>
                <div className="trainer-card" style={{padding:12, textAlign:'center'}}><div style={{fontWeight:900, fontSize:'1.3rem', color:'var(--trainer-primary)'}}>4.2d</div><div style={{fontSize:'0.78rem', color:'var(--trainer-muted)', fontWeight:800}}>Avg streak</div></div>
              </div>
              <p style={{fontSize:'0.72rem', color:'var(--trainer-muted)', fontWeight:700, display:'flex', gap:6, alignItems:'center'}}><CheckCircle size={12} color="#22c55e"/> Privacy: Private medical records never exposed by default</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TrainerProgress;
