import React, { useState } from 'react';
import { Video, MessageCircle, Calendar, Clock, FileText, Send } from 'lucide-react';
import '../../styles/doctor.css';

const DoctorTelemedicine: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState<string|null>(null);

  const consultations = [
    { id:'TC-101', patient:'Rahul V.', time:'10:30 AM Today', status:'Booked', mode:'video', condition:'Pitta Imbalance' },
    { id:'TC-102', patient:'Aarav S.', time:'02:00 PM Today', status:'Booked', mode:'chat', condition:'Vata Imbalance' },
    { id:'TC-103', patient:'Meera K.', time:'Yesterday', status:'Completed', mode:'video', condition:'Pitta' },
  ];

  const handleNotes = ()=>{
    if(notes.trim().length<5){ alert('Notes min 5 chars'); return; }
    setSuccess('Notes saved — follow-up scheduled, patient notified');
    setTimeout(()=>setSuccess(null),2500);
    setNotes('');
  };

  return (
    <div>
      <section className="doc-hero">
        <div className="doc-hero__inner">
          <div>
            <h1>Telemedicine</h1>
            <p>Consultation list • Patient details • Appointment status • Notes • Follow-up</p>
          </div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:16}}>
          <div>
            <h3 style={{marginBottom:10}}>Consultation List</h3>
            <div style={{display:'grid', gap:10}}>
              {consultations.map(c=>(
                <div key={c.id} onClick={()=>setActiveId(c.id)} role="button" tabIndex={0} onKeyDown={e=>e.key==='Enter'&&setActiveId(c.id)}
                  className="doc-card" style={{padding:14, cursor:'pointer', border: activeId===c.id?'1px solid var(--doc-primary)':'1px solid var(--doc-border)', background: activeId===c.id?'rgba(167,201,87,0.08)':undefined}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <strong>{c.patient}</strong>
                    <span className={`doc-badge ${c.status==='Booked'?'doc-badge--warning':'doc-badge--success'}`}>{c.status}</span>
                  </div>
                  <p style={{color:'var(--doc-muted)', fontSize:'0.85rem', marginTop:4}}><Clock size={12} style={{display:'inline', marginRight:4}}/>{c.time} • {c.mode==='video'?<Video size={12} style={{display:'inline', marginRight:4}}/>:<MessageCircle size={12} style={{display:'inline', marginRight:4}}/>}{c.mode} • {c.condition}</p>
                  <p style={{fontSize:'0.75rem', color:'var(--doc-muted)'}}>{c.id}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            {!activeId ? (
              <div className="doc-card" style={{padding:40, textAlign:'center', height:'100%', display:'grid', placeItems:'center'}}>
                <div>
                  <Video size={40} color="var(--doc-muted)"/>
                  <p style={{marginTop:10, color:'var(--doc-muted)'}}>Select a consultation to view patient details and start session</p>
                </div>
              </div>
            ) : (
              <div className="doc-card" style={{padding:16, display:'grid', gap:12}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <h3>Consultation {activeId}</h3>
                  <span className="doc-badge doc-badge--neutral"><Calendar size={12} style={{display:'inline', marginRight:4}}/>Today</span>
                </div>
                <div style={{display:'flex', gap:8}}>
                  <button style={{flex:1, padding:'10px', borderRadius:999, background:'var(--doc-primary)', color:'white', fontWeight:800, display:'inline-flex', gap:6, justifyContent:'center'}}><Video size={16}/> Start Video</button>
                  <button style={{flex:1, padding:'10px', borderRadius:999, border:'1px solid var(--doc-border)', background:'white', fontWeight:700, display:'inline-flex', gap:6, justifyContent:'center'}}><MessageCircle size={16}/> Chat</button>
                </div>
                <div style={{padding:12, borderRadius:12, background:'#f8fafc', border:'1px solid var(--doc-border)'}}>
                  <h4 style={{display:'flex', gap:6, alignItems:'center'}}><FileText size={16} color="var(--doc-primary)"/> Patient Details</h4>
                  <p style={{color:'var(--doc-muted)', fontSize:'0.88rem', marginTop:6}}>Rahul V. • Pitta Imbalance • 28y • O+ • Weight 67kg • Last visit 2 days ago</p>
                </div>
                <div>
                  <h4>Consultation Notes</h4>
                  <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Add consultation notes, prescription, follow-up plan (min 5 chars)..." rows={3} style={{width:'100%', marginTop:8, padding:10, borderRadius:10, border:'1px solid var(--doc-border)', resize:'none'}}/>
                  <div style={{display:'flex', justifyContent:'space-between', marginTop:8, alignItems:'center'}}>
                    <span style={{color:'var(--doc-muted)', fontSize:'0.8rem'}}>{notes.length}/500</span>
                    <button onClick={handleNotes} style={{padding:'8px 14px', borderRadius:999, background:'var(--doc-primary)', color:'white', fontWeight:800, display:'inline-flex', gap:6}}><Send size={14}/> Save & Follow-up</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {success && <div style={{position:'fixed', bottom:20, right:20, background:'#22c55e', color:'white', padding:'12px 16px', borderRadius:12, fontWeight:700}}>{success}</div>}
      </div>
    </div>
  );
};
export default DoctorTelemedicine;
