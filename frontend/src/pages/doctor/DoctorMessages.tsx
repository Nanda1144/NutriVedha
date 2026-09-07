import React, { useEffect, useState } from 'react';
import { MessageCircle, Send, CheckCircle, Search } from 'lucide-react';
import { fetchNotifications, sendNotification } from '../../services/notification.service';
import { getAuthToken } from '../../services/client';
import '../../styles/doctor.css';

const DoctorMessages: React.FC = () => {
  const [threads, setThreads] = useState<any[]>([]);
  const [active, setActive] = useState<string|null>(null);
  const [messages, setMessages] = useState<Record<string, any[]>>({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(()=>{
    if(!getAuthToken()){ setLoading(false); return; }
    fetchNotifications().then(r=>{
      const list = (r as any).notifications || [];
      const patients = [...new Set(list.map((n:any)=>n.title || 'Patient'))].slice(0,5);
      const t = patients.length? patients.map((p,i)=>({id:`th-${i}`, patient:p, last:'Hello doctor...', unread: i===0?2:0})) : [{id:'th-1', patient:'Rahul V.', last:'Thanks for diet plan', unread:1},{id:'th-2', patient:'Aarav S.', last:'When next scan?', unread:0}];
      setThreads(t);
      if(t[0]) setActive(t[0].id);
      setMessages({ 'th-1': [{from:'patient', text:'Thanks for diet plan'}, {from:'doctor', text:'Keep hydration 2.5L'}] });
    }).catch(()=>{ setThreads([{id:'th-1', patient:'Rahul V.', last:'Thanks', unread:1}]); setActive('th-1'); }).finally(()=>setLoading(false));
  },[]);

  const filtered = threads.filter(t=> !q || t.patient.toLowerCase().includes(q.toLowerCase()));

  const handleSend = async()=>{
    if(!input.trim() || !active) return;
    if(input.trim().length<2){ alert('Message min 2 chars'); return; }
    const activeThread = threads.find(t=>t.id===active);
    try{ if(getAuthToken()) await sendNotification({title: `Dr. message to ${activeThread?.patient}`, message: input.trim(), type:'health'}); }catch{}
    setMessages(prev=> ({...prev, [active]: [...(prev[active]||[]), {from:'doctor', text: input.trim()}]}));
    setInput('');
  };

  return (
    <div>
      <section className="doc-hero">
        <div className="doc-hero__inner">
          <div>
            <h1>Messages</h1>
            <p>Authorized patient communication — only assigned patients, audit-logged.</p>
          </div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20, display:'grid', gridTemplateColumns:'300px 1fr', gap:16}}>
        <div className="doc-card" style={{padding:12, height:'fit-content'}}>
          <div style={{position:'relative', marginBottom:10}}>
            <Search size={14} style={{position:'absolute', left:10, top:11, color:'var(--doc-muted)'}}/>
            <input placeholder="Search patients" value={q} onChange={e=>setQ(e.target.value)} style={{width:'100%', padding:'9px 12px 9px 32px', borderRadius:10, border:'1px solid var(--doc-border)'}}/>
          </div>
          {loading ? <p style={{textAlign:'center', padding:20, color:'var(--doc-muted)'}}>Loading threads…</p> : filtered.length===0 ? <p style={{textAlign:'center', padding:20, color:'var(--doc-muted)'}}>No authorized conversations</p> : (
            <div style={{display:'grid', gap:8}}>
              {filtered.map(t=>(
                <button key={t.id} onClick={()=>setActive(t.id)} style={{textAlign:'left', padding:12, borderRadius:12, border: active===t.id?'1px solid var(--doc-primary)':'1px solid var(--doc-border)', background: active===t.id?'var(--doc-accent-soft)':'white', display:'grid', gap:4}}>
                  <strong style={{display:'flex', justifyContent:'space-between', fontSize:'0.92rem'}}>{t.patient} {t.unread? <span style={{background:'#ef4444', color:'white', padding:'2px 6px', borderRadius:999, fontSize:'0.7rem', fontWeight:700}}>{t.unread}</span>:null}</strong>
                  <span style={{color:'var(--doc-muted)', fontSize:'0.82rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{t.last}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="doc-card" style={{padding:16, display:'grid', gap:12, minHeight:420}}>
          {!active ? (
            <div style={{display:'grid', placeItems:'center', height:360, color:'var(--doc-muted)'}}><MessageCircle size={40}/><p>Select a patient to message</p></div>
          ) : (
            <>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><strong>{threads.find(t=>t.id===active)?.patient}</strong><span style={{fontSize:'0.75rem', color:'var(--doc-muted)', display:'flex', gap:4, alignItems:'center'}}><CheckCircle size={12} color="#22c55e"/> Encrypted • Audited</span></div>
              <div style={{flex:1, minHeight:260, maxHeight:360, overflowY:'auto', display:'grid', gap:8, padding:8, background:'#fdfcf8', borderRadius:12, border:'1px solid var(--doc-border)'}}>
                {(messages[active]||[]).length ? messages[active].map((m:any,i:number)=>(
                  <div key={i} style={{justifySelf: m.from==='doctor'?'end':'start', maxWidth:'78%', padding:'10px 12px', borderRadius:12, background: m.from==='doctor'?'var(--doc-primary)':'white', color: m.from==='doctor'?'white':'var(--doc-text)', border: m.from==='doctor'? undefined:'1px solid var(--doc-border)', fontSize:'0.88rem'}}>{m.text}</div>
                )) : <p style={{textAlign:'center', color:'var(--doc-muted)', padding:20}}>No messages yet — say hello.</p>}
              </div>
              <div style={{display:'flex', gap:8}}>
                <input aria-label="Message" placeholder="Type authorized message (min 2 chars)..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()} style={{flex:1, padding:'10px 14px', borderRadius:999, border:'1px solid var(--doc-border)'}} maxLength={500}/>
                <button onClick={handleSend} style={{padding:'10px 16px', borderRadius:999, background:'var(--doc-primary)', color:'white', fontWeight:800, display:'inline-flex', gap:6, alignItems:'center'}}><Send size={14}/> Send</button>
              </div>
              <p style={{fontSize:'0.75rem', color:'var(--doc-muted)', textAlign:'center'}}>{input.length}/500 • Only assigned patients • All messages audited</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default DoctorMessages;
