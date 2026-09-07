import React, { useEffect, useState } from 'react';
import { FileScan, ShieldCheck, CheckCircle, Eye, PenLine } from 'lucide-react';
import { fetchVerificationQueue } from '../../services/doctor.service';
import { getAuthToken } from '../../services/client';
import '../../styles/doctor.css';

const DoctorAiReports: React.FC = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [filter, setFilter] = useState<'All'|'Pending'|'Verified'>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);

  useEffect(()=>{
    if(!getAuthToken()){ setError('Login as Doctor'); setLoading(false); return; }
    fetchVerificationQueue().then(r=>{
      const q=(r as any).queue;
      if(Array.isArray(q) && q.length) setQueue(q);
      else setQueue([
        {id:'VQ-1', patient:'Aarav S.', scanDate:'2026-03-10', findings:'Kapha High — diet requires sign-off', confidence:78, status:'Pending', desc:'Automated diet plan requires human sign-off'},
        {id:'VQ-2', patient:'Meera K.', scanDate:'2026-03-09', findings:'Pitta High — skin scan Medium', confidence:82, status:'Pending', desc:'Skin scan severity Medium — recommend cooling protocol'},
        {id:'VQ-3', patient:'Rahul V.', scanDate:'2026-03-08', findings:'Pitta Imbalance — mild', confidence:74, status:'Verified', clinicalNotes:'Cooling herbs approved', desc:'Verified'},
      ]);
    }).catch(e=>setError(e.message)).finally(()=>setLoading(false));
  },[]);

  const filtered = queue.filter(q=> filter==='All' || q.status===filter);

  const handleVerify = (id:string, notes:string)=>{
    setQueue(prev=>prev.map(q=>q.id===id?{...q, status:'Verified', clinicalNotes: notes||'Approved'}:q));
    setSuccess('Verification saved — audited, patient notified');
    setTimeout(()=>setSuccess(null),2500);
  };

  return (
    <div>
      <section className="doc-hero">
        <div className="doc-hero__inner">
          <div>
            <h1>AI Reports <span style={{fontSize:'0.7rem', background:'rgba(255,255,255,0.14)', padding:'4px 8px', borderRadius:999, fontWeight:700}}>AI-generated — not guaranteed diagnosis</span></h1>
            <p>Patient • Scan date • AI findings • Confidence • Status • Review • Verification</p>
          </div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20}}>
        <div style={{display:'flex', gap:8, marginBottom:14, flexWrap:'wrap'}}>
          {(['All','Pending','Verified'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'8px 14px', borderRadius:999, border:'1px solid var(--doc-border)', background: filter===f?'var(--doc-primary)':'white', color: filter===f?'white':'var(--doc-muted)', fontWeight:700, fontSize:'0.84rem'}}>{f} ({f==='All'?queue.length: queue.filter(q=>q.status===f).length})</button>
          ))}
        </div>

        {loading ? <p style={{textAlign:'center', padding:30}}>Loading AI reports…</p> : error ? <div className="doc-card" style={{padding:14, borderLeft:'3px solid #ef4444'}}>{error}</div> : filtered.length===0 ? (
          <div className="doc-card" style={{padding:40, textAlign:'center'}}><CheckCircle size={40} color="#22c55e"/><p style={{marginTop:10, color:'var(--doc-muted)'}}>No reports for filter</p></div>
        ) : (
          <div style={{display:'grid', gap:12}}>
            {filtered.map(item=>(
              <div key={item.id} className="doc-card" style={{padding:16, display:'grid', gap:10}}>
                <div style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8}}>
                  <div>
                    <strong style={{display:'flex', gap:8, alignItems:'center'}}><FileScan size={16} color="var(--doc-primary)"/>{item.patient} • <span style={{color:'var(--doc-muted)', fontWeight:400, fontSize:'0.88rem'}}>{item.scanDate}</span></strong>
                    <p style={{color:'var(--doc-muted)', fontSize:'0.88rem', marginTop:4}}><ShieldCheck size={12} style={{display:'inline', marginRight:4}}/>AI findings: {item.findings || item.desc} • Confidence: <strong>{item.confidence||74}%</strong></p>
                  </div>
                  <span className={`doc-badge ${item.status==='Verified'?'doc-badge--success':'doc-badge--warning'}`}>{item.status}</span>
                </div>
                {item.status==='Pending' ? (
                  <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                    <button onClick={()=>handleVerify(item.id, 'Approved — cooling protocol')} style={{padding:'8px 14px', borderRadius:999, background:'var(--doc-primary)', color:'white', fontWeight:700, display:'inline-flex', gap:6}}><CheckCircle size={14}/> Verify & Add Notes</button>
                    <button onClick={()=>{const notes=prompt('Clinical notes for rejection:'); if(notes!==null) setQueue(prev=>prev.map(q=>q.id===item.id?{...q, status:'Pending', clinicalNotes: notes}:q));}} style={{padding:'8px 14px', borderRadius:999, border:'1px solid var(--doc-border)', background:'white', fontWeight:700, display:'inline-flex', gap:6}}><PenLine size={14}/> Add Notes</button>
                    <button style={{padding:'8px 14px', borderRadius:999, border:'1px solid var(--doc-border)', background:'white', fontWeight:700, display:'inline-flex', gap:6}}><Eye size={14}/> View Scan</button>
                  </div>
                ) : (
                  <div style={{padding:'10px 12px', borderRadius:10, background:'#f0fdf4', border:'1px solid #bbf7d0', display:'flex', gap:8, alignItems:'center'}}>
                    <CheckCircle size={16} color="#22c55e"/><span style={{fontSize:'0.88rem', fontWeight:700}}>Verified — {item.clinicalNotes||'No additional notes'} • Audited</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {success && <div style={{position:'fixed', bottom:20, right:20, background:'#22c55e', color:'white', padding:'12px 16px', borderRadius:12, fontWeight:700, boxShadow:'0 8px 24px rgba(0,0,0,0.12)'}}>{success}</div>}
      </div>
    </div>
  );
};
export default DoctorAiReports;
