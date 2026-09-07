import React, { useEffect, useState } from 'react';
import { Cpu, Search, AlertTriangle, CheckCircle, Clock, Activity, Zap, Eye } from 'lucide-react';
import '../../styles/admin.css';

type AIReq = { id:string; type:'Scan'|'Diet'|'Recipe'|'Chat'; status:'Processing'|'Success'|'Failed'; durationMs:number; model:string; timestamp:string };

const AdminAiMonitoring: React.FC = () => {
  const [rows, setRows]=useState<AIReq[]>([
    { id:'AI-901', type:'Scan', status:'Success', durationMs:1240, model:'gemini-1.5', timestamp:'2026-03-12 10:21' },
    { id:'AI-902', type:'Diet', status:'Success', durationMs:890, model:'gemini-1.5', timestamp:'2026-03-12 10:18' },
    { id:'AI-903', type:'Chat', status:'Failed', durationMs:3200, model:'gemini-1.5', timestamp:'2026-03-12 10:15' },
    { id:'AI-904', type:'Recipe', status:'Processing', durationMs:0, model:'gemini-1.5', timestamp:'2026-03-12 10:22' },
  ]);
  const [q, setQ]=useState('');
  const [filter, setFilter]=useState<'All'|'Success'|'Failed'|'Processing'>('All');
  const [services] = useState([
    { name:'AI Gateway', status:'Operational', uptime:'99.92%', latency:'18ms' },
    { name:'Gemini Provider', status:'Operational', uptime:'99.71%', latency:'22ms' },
    { name:'Medical Service', status:'Operational', uptime:'99.88%', latency:'14ms' },
  ]);

  // minimal live simulation — failures random small
  useEffect(()=>{
    const id=setInterval(()=> setRows(prev=> prev.map(r=> r.status==='Processing' && Math.random()>0.85 ? {...r, status: Math.random()>0.3?'Success':'Failed', durationMs: 800+Math.round(Math.random()*800)} as AIReq : r)), 4000);
    return ()=>clearInterval(id);
  },[]);

  const filtered=rows.filter(r=>{
    const mQ=!q || r.id.toLowerCase().includes(q.toLowerCase()) || r.type.toLowerCase().includes(q.toLowerCase());
    const mF=filter==='All' || r.status===filter;
    return mQ && mF;
  });
  const successRate = rows.length ? Math.round(rows.filter(r=>r.status==='Success').length/rows.length*100) : 0;

  return (
    <div>
      <section className="admin-hero"><div className="admin-hero__inner"><div><h1>AI Monitoring</h1><p>Requests • Processing • Failures • Service status • Usage • Performance — no private medical data exposed</p></div><span className="admin-badge" style={{background:'white', color:'var(--admin-dark)', borderColor:'white'}}><Cpu size={14}/>{rows.length} requests • {successRate}% success</span></div></section>
      <div style={{maxWidth:1280, margin:'0 auto', padding:20, display:'grid', gap:14}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12}}>
          <div className="admin-kpi"><div className="admin-kpi__label" style={{display:'flex', gap:6}}><Activity size={14}/> AI Requests</div><div className="admin-kpi__value admin-count">{rows.length}</div><div className="admin-kpi__delta admin-kpi__delta--up">+6 today</div><span className="admin-kpi__live admin-kpi__live--live"/></div>
          <div className="admin-kpi"><div className="admin-kpi__label" style={{display:'flex', gap:6}}><CheckCircle size={14}/> Success</div><div className="admin-kpi__value admin-count">{successRate}%</div><div className="admin-kpi__delta">Operational</div></div>
          <div className="admin-kpi"><div className="admin-kpi__label" style={{display:'flex', gap:6}}><AlertTriangle size={14}/> Failures</div><div className="admin-kpi__value admin-count">{rows.filter(r=>r.status==='Failed').length}</div><div className="admin-kpi__delta" style={{color:'#dc2626'}}>Retry available</div></div>
          <div className="admin-kpi"><div className="admin-kpi__label" style={{display:'flex', gap:6}}><Zap size={14}/> Avg latency</div><div className="admin-kpi__value admin-count">{rows.filter(r=>r.status==='Success').length? Math.round(rows.filter(r=>r.status==='Success').reduce((a,c)=>a+c.durationMs,0)/rows.filter(r=>r.status==='Success').length) : '—'}ms</div><div className="admin-kpi__delta">Gemini</div></div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:14}}>
          <div className="admin-card" style={{overflow:'hidden'}}>
            <div className="admin-card__header"><span className="admin-card__title"><Cpu size={16}/> Recent AI Requests</span><div style={{display:'flex', gap:8}}><div style={{position:'relative'}}><Search size={14} style={{position:'absolute', left:10, top:11, color:'var(--admin-muted)'}}/><input placeholder="Search id or type" value={q} onChange={e=>setQ(e.target.value)} className="admin-input" style={{paddingLeft:32, minWidth:160}}/></div>
              <select value={filter} onChange={e=>setFilter(e.target.value as any)} className="admin-input"><option>All</option><option>Success</option><option>Failed</option><option>Processing</option></select></div>
            </div>
            <div style={{overflowX:'auto'}}>
              <table className="admin-table" aria-label="AI requests">
                <thead><tr><th>ID</th><th>Type</th><th>Status</th><th>Duration</th><th>Model</th><th>Time</th><th style={{textAlign:'right'}}>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(r=>(
                    <tr key={r.id}><td style={{fontWeight:800, fontSize:'0.82rem'}}>{r.id}</td><td><span className="admin-badge admin-badge--neutral">{r.type}</span></td><td><span className={`admin-badge ${r.status==='Success'?'admin-badge--success': r.status==='Failed'?'admin-badge--danger':'admin-badge--warning'}`}>{r.status==='Success'?<CheckCircle size={12} style={{display:'inline', marginRight:4}}/>: r.status==='Failed'?<AlertTriangle size={12} style={{display:'inline', marginRight:4}}/>:<Clock size={12} style={{display:'inline', marginRight:4}}/>}{r.status}</span></td><td style={{fontSize:'0.84rem'}}>{r.status==='Processing'?'—':`${r.durationMs}ms`}</td><td style={{fontSize:'0.82rem', color:'var(--admin-muted)'}}>{r.model}</td><td style={{fontSize:'0.82rem'}}>{r.timestamp}</td><td style={{textAlign:'right'}}><button className="admin-btn admin-btn--outline" style={{minHeight:34, padding:'6px 10px'}}><Eye size={14}/> Details</button></td></tr>
                  ))}
                </tbody>
              </table>
              {filtered.length===0 && <div style={{padding:24, textAlign:'center', color:'var(--admin-muted)'}}>No requests for filter</div>}
            </div>
            <div style={{padding:12, background:'#fdfcf8', borderTop:'1px solid #f0f0ea', fontSize:'0.78rem', color:'var(--admin-muted)', display:'flex', gap:8}}><AlertTriangle size={14}/> Private medical content is not displayed here — only request metadata and status.</div>
          </div>

          <div style={{display:'grid', gap:14}}>
            <div className="admin-card">
              <div className="admin-card__header"><span className="admin-card__title"><Activity size={16}/> Service Status</span><span className="admin-badge admin-badge--success"><span className="admin-live-dot"/> Operational</span></div>
              <div className="admin-card__body" style={{display:'grid', gap:10}}>
                {services.map(s=>(
                  <div key={s.name} style={{display:'grid', gap:6, padding:10, borderRadius:12, border:'1px solid var(--admin-border-soft)', background:'#fdfcf8'}}>
                    <div style={{display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:'0.88rem'}}><span>{s.name}</span><span className="admin-badge admin-badge--success">{s.status}</span></div>
                    <div style={{display:'flex', gap:12, fontSize:'0.78rem', color:'var(--admin-muted)'}}><span>Uptime {s.uptime}</span><span>Latency {s.latency}</span></div>
                    <div className="admin-health admin-health--ok"><div className="admin-health__fill" style={{width: s.uptime.replace('%','') + '%'}}/></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="admin-card">
              <div className="admin-card__header"><span className="admin-card__title"><Zap size={16}/> Usage</span></div>
              <div className="admin-card__body" style={{fontSize:'0.86rem', color:'var(--admin-muted)', display:'grid', gap:8}}>
                <div>• Requests today: {rows.length}</div>
                <div>• Failures: {rows.filter(r=>r.status==='Failed').length} — check provider logs, not patient data</div>
                <div>• Performance indicator: avg {successRate}% success</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminAiMonitoring;
