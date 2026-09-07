import React, { useEffect, useState } from 'react';
import { FileText, Apple, Dumbbell, CheckCircle, Clock } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { fetchReports } from '../../services/medical.service';
import '../../styles/user.css';

const UserReports: React.FC = () => {
  const { reports } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [remoteReports, setRemoteReports] = useState<any[]>([]);

  useEffect(()=>{ (async()=>{
    try{ setLoading(true); const r=await fetchReports(); setRemoteReports((r as any).reports || (r as any) || []); }catch{} finally{ setLoading(false); }
  })(); },[]);

  const all = remoteReports.length? remoteReports: reports;

  return (
    <div>
      <section className="user-hero">
        <div className="user-hero__inner">
          <div>
            <h1>Reports</h1>
            <p>AI reports • Health reports • Diet & fitness progress • Doctor reports — timeline reveal.</p>
          </div>
          <img src="/hero.png" alt="Reports" className="user-hero__img" />
        </div>
      </section>
      <div style={{ maxWidth:900, margin:'0 auto', padding:20 }}>
        {loading ? <p style={{ textAlign:'center', padding:40 }}>Loading reports...</p> : all.length===0 ? (
          <div className="user-card" style={{ padding:40, textAlign:'center' }}>
            <FileText size={40} color="var(--user-primary)" />
            <p style={{ marginTop:12, fontWeight:700 }}>No reports yet.</p>
            <p style={{ color:'var(--user-muted)' }}>Run AI Scan or complete diet/fitness to generate reports.</p>
          </div>
        ) : (
          <div style={{ position:'relative', paddingLeft:24, borderLeft:'2px solid #e8ecec' }}>
            {all.map((r:any,i:number)=>(
              <div key={r.id||i} className="timeline-item" style={{ position:'relative', marginBottom:16, animationDelay:`${i*0.08}s` }}>
                <span style={{ position:'absolute', left:-33, top:12, width:16, height:16, borderRadius:'50%', background:'var(--user-primary)', border:'3px solid white', boxShadow:'0 0 0 2px var(--user-primary)' }} />
                <div className="user-card" style={{ padding:16, marginLeft:12 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    {r.condition?.toLowerCase().includes('diet')? <Apple size={16} color="var(--user-primary)" /> : r.condition?.toLowerCase().includes('fitness')? <Dumbbell size={16} color="var(--user-primary)" /> : r.condition?.toLowerCase().includes('doctor')? <CheckCircle size={16} color="#22c55e" /> : <FileText size={16} color="var(--user-primary)" />}
                    <strong>{r.condition || 'Health Report'}</strong>
                    <span style={{ marginLeft:'auto', padding:'4px 8px', borderRadius:30, background:'var(--user-accent-soft)', color:'var(--user-primary-dark)', fontWeight:700, fontSize:'0.75rem' }}>{r.severity || 'Info'}</span>
                  </div>
                  <p style={{ color:'var(--user-muted)', fontSize:'0.9rem', marginTop:6 }}>{r.date || new Date().toLocaleDateString()} • {r.symptoms?.join(', ') || 'Wellness check'}</p>
                  {r.recommendations && <ul style={{ marginTop:8, display:'grid', gap:6 }}>{r.recommendations.slice(0,2).map((rec:any,idx:number)=><li key={idx} style={{ padding:'8px 10px', borderRadius:30, background:'#f8fafc', border:'1px solid #e8ecec', fontSize:'0.88rem' }}><strong>{rec.title}:</strong> {rec.text}</li>)}</ul>}
                  <p style={{ marginTop:8, fontSize:'0.8rem', color:'var(--user-muted)', display:'flex', gap:6, alignItems:'center' }}><Clock size={12} /> Timeline reveal • {i===0?'Latest':`#${i+1}`}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default UserReports;
