import React, { useState } from 'react';
import { UtensilsCrossed, CheckCircle, XCircle, PenLine, Clock } from 'lucide-react';
import '../../styles/doctor.css';

const mockPlans = [
  { id:'DP-1', patient:'Rahul V.', submitted:'2026-03-10', plan:'Pitta cooling: Cucumber Mint + Mung Beans', status:'Pending', notes:'' },
  { id:'DP-2', patient:'Aarav S.', submitted:'2026-03-09', plan:'Vata grounding: Ragi porridge + Rice Dal', status:'Pending', notes:'' },
  { id:'DP-3', patient:'Meera K.', submitted:'2026-03-08', plan:'Kapha stimulating: Quinoa + Kichdi', status:'Approved', notes:'Reduce salt 2g' },
];

const DoctorDietReviews: React.FC = () => {
  const [plans, setPlans] = useState(mockPlans);
  const [filter, setFilter] = useState<'All'|'Pending'|'Approved'|'Rejected'>('All');
  const [editing, setEditing] = useState<string|null>(null);
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState<string|null>(null);

  const filtered = plans.filter(p=> filter==='All' || p.status===filter);

  const handleAction = (id:string, action:'Approved'|'Rejected'|'Pending')=>{
    if(action==='Rejected' && !note.trim()){ alert('Add notes for rejection'); return; }
    setPlans(prev=>prev.map(p=>p.id===id? {...p, status:action, notes: note||p.notes}:p));
    setSuccess(`${action} — ${id} • Audited`);
    setTimeout(()=>setSuccess(null),2500);
    setEditing(null); setNote('');
  };

  return (
    <div>
      <section className="doc-hero">
        <div className="doc-hero__inner">
          <div>
            <h1>Diet Reviews</h1>
            <p>View submitted plan • Approve • Reject/request changes • Add notes • Modify recommendations</p>
          </div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20}}>
        <div style={{display:'flex', gap:8, marginBottom:14, flexWrap:'wrap'}}>
          {(['All','Pending','Approved','Rejected'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'8px 14px', borderRadius:999, border:'1px solid var(--doc-border)', background: filter===f?'var(--doc-primary)':'white', color: filter===f?'white':'var(--doc-muted)', fontWeight:700, fontSize:'0.84rem'}}>{f}</button>
          ))}
        </div>

        <div style={{display:'grid', gap:12}}>
          {filtered.map(p=>(
            <div key={p.id} className="doc-card" style={{padding:16, display:'grid', gap:10}}>
              <div style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8}}>
                <div>
                  <strong style={{display:'flex', gap:8, alignItems:'center'}}><UtensilsCrossed size={16} color="var(--doc-primary)"/> {p.patient} • <span style={{color:'var(--doc-muted)', fontWeight:400, fontSize:'0.88rem'}}><Clock size={12} style={{display:'inline', marginRight:4}}/>{p.submitted}</span></strong>
                  <p style={{marginTop:6, color:'var(--doc-text)', fontSize:'0.92rem'}}>{p.plan}</p>
                  {p.notes && <p style={{marginTop:6, padding:'8px 10px', borderRadius:10, background:'#f8fafc', border:'1px solid var(--doc-border)', fontSize:'0.84rem'}}><PenLine size={12} style={{display:'inline', marginRight:6}}/>{p.notes}</p>}
                </div>
                <span className={`doc-badge ${p.status==='Approved'?'doc-badge--success': p.status==='Rejected'?'doc-badge--danger':'doc-badge--warning'}`}>{p.status}</span>
              </div>
              {p.status==='Pending' ? (
                <div style={{display:'grid', gap:8}}>
                  {editing===p.id ? (
                    <div style={{display:'grid', gap:8}}>
                      <textarea placeholder="Add notes / modify recommendations (e.g. Reduce salt 2g, add 500ml water)..." value={note} onChange={e=>setNote(e.target.value)} rows={2} style={{padding:10, borderRadius:10, border:'1px solid var(--doc-border)', resize:'none'}}/>
                      <div style={{display:'flex', gap:8}}>
                        <button onClick={()=>handleAction(p.id,'Approved')} style={{padding:'8px 14px', borderRadius:999, background:'var(--doc-primary)', color:'white', fontWeight:700, display:'inline-flex', gap:6}}><CheckCircle size={14}/> Approve</button>
                        <button onClick={()=>handleAction(p.id,'Rejected')} style={{padding:'8px 14px', borderRadius:999, background:'#991b1b', color:'white', fontWeight:700, display:'inline-flex', gap:6}}><XCircle size={14}/> Reject</button>
                        <button onClick={()=>setEditing(null)} style={{padding:'8px 14px', borderRadius:999, border:'1px solid var(--doc-border)', background:'white', fontWeight:700}}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                      <button onClick={()=>{setEditing(p.id); setNote(p.notes);}} style={{padding:'8px 14px', borderRadius:999, border:'1px solid var(--doc-border)', background:'white', fontWeight:700, display:'inline-flex', gap:6}}><PenLine size={14}/> Add Notes</button>
                      <button onClick={()=>handleAction(p.id,'Approved')} style={{padding:'8px 14px', borderRadius:999, background:'var(--doc-primary)', color:'white', fontWeight:700, display:'inline-flex', gap:6}}><CheckCircle size={14}/> Approve</button>
                      <button onClick={()=>{setEditing(p.id); setNote('Please reduce spicy oil, increase water 500ml');}} style={{padding:'8px 14px', borderRadius:999, border:'1px solid #fecaca', color:'#991b1b', background:'white', fontWeight:700, display:'inline-flex', gap:6}}><XCircle size={14}/> Request Changes</button>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{fontSize:'0.84rem', color:'var(--doc-muted)'}}>Reviewed — audited • Patient notified via Messages</p>
              )}
            </div>
          ))}
          {filtered.length===0 && <div className="doc-card" style={{padding:40, textAlign:'center', color:'var(--doc-muted)'}}>No plans for filter</div>}
        </div>
        {success && <div style={{position:'fixed', bottom:20, right:20, background:'#22c55e', color:'white', padding:'12px 16px', borderRadius:12, fontWeight:700}}>{success}</div>}
      </div>
    </div>
  );
};
export default DoctorDietReviews;
