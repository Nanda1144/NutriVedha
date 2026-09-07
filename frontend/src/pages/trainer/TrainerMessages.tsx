import React, { useEffect, useState } from 'react';
import { MessageCircle, Send, CheckCircle, Search } from 'lucide-react';
import { fetchNotifications, sendNotification } from '../../services/notification.service';
import { getAuthToken } from '../../services/client';
import '../../styles/trainer.css';

const TrainerMessages: React.FC = () => {
  const [threads, setThreads]=useState<any[]>([]);
  const [active, setActive]=useState<string|null>(null);
  const [messages, setMessages]=useState<Record<string, any[]>>({});
  const [input, setInput]=useState('');
  const [loading, setLoading]=useState(true);
  const [q, setQ]=useState('');

  useEffect(()=>{
    if(!getAuthToken()){ setLoading(false); return; }
    fetchNotifications().then(r=>{
      const list=(r as any).notifications||[];
      const members=[...new Set(list.map((n:any)=>n.title || 'Member'))].slice(0,5);
      const t=members.length? members.map((p,i)=>({id:`th-${i}`, member:p, last:'Thanks trainer...', unread:i===0?1:0})) : [{id:'th-1', member:'Amit Shah', last:'Workout done!', unread:1},{id:'th-2', member:'Priya Rai', last:'When next yoga?', unread:0}];
      setThreads(t); if(t[0]) setActive(t[0].id);
      setMessages({'th-1':[{from:'member', text:'Workout done! Feeling stronger'},{from:'trainer', text:'Great — keep protein intake steady'}]});
    }).catch(()=>{ setThreads([{id:'th-1', member:'Amit Shah', last:'Workout done', unread:1}]); setActive('th-1'); }).finally(()=>setLoading(false));
  },[]);

  const filtered=threads.filter(t=>!q || t.member.toLowerCase().includes(q.toLowerCase()));
  const handleSend=async()=>{
    if(!input.trim()||!active) return;
    if(input.trim().length<2){ alert('Message min 2 chars'); return; }
    try{ if(getAuthToken()) await sendNotification({title:`Trainer message to ${threads.find(t=>t.id===active)?.member}`, message:input.trim(), type:'health'});}catch{}
    setMessages(prev=>({...prev, [active]:[...(prev[active]||[]), {from:'trainer', text:input.trim()}]}));
    setInput('');
  };

  return (
    <div>
      <section className="trainer-hero">
        <div className="trainer-hero__inner">
          <div>
            <h1>Messages</h1>
            <p>Member communication — fitness coaching only, authorized members</p>
          </div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20, display:'grid', gridTemplateColumns:'300px 1fr', gap:16}}>
        <div className="trainer-card" style={{padding:12, height:'fit-content'}}>
          <div style={{position:'relative', marginBottom:10}}>
            <Search size={14} style={{position:'absolute', left:10, top:11, color:'var(--trainer-muted)'}}/>
            <input placeholder="Search members" value={q} onChange={e=>setQ(e.target.value)} style={{width:'100%', padding:'9px 12px 9px 32px', borderRadius:12, border:'1px solid var(--trainer-border)'}}/>
          </div>
          {loading ? <p style={{textAlign:'center', padding:20, color:'var(--trainer-muted)'}}>Loading threads…</p> : filtered.length===0? <p style={{textAlign:'center', padding:20, color:'var(--trainer-muted)'}}>No authorized conversations</p> : (
            <div style={{display:'grid', gap:8}}>
              {filtered.map(t=>(
                <button key={t.id} onClick={()=>setActive(t.id)} style={{textAlign:'left', padding:12, borderRadius:12, border: active===t.id?'1px solid var(--trainer-primary)':'1px solid var(--trainer-border)', background: active===t.id?'var(--trainer-accent-soft)':'white', display:'grid', gap:4}}>
                  <strong style={{display:'flex', justifyContent:'space-between', fontSize:'0.92rem'}}>{t.member} {t.unread? <span style={{background:'#ef4444', color:'white', padding:'2px 6px', borderRadius:999, fontSize:'0.7rem', fontWeight:800}}>{t.unread}</span>:null}</strong>
                  <span style={{color:'var(--trainer-muted)', fontSize:'0.82rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{t.last}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="trainer-card" style={{padding:16, display:'grid', gap:12, minHeight:420}}>
          {!active ? (
            <div style={{display:'grid', placeItems:'center', height:360, color:'var(--trainer-muted)'}}><MessageCircle size={40}/><p>Select a member to message</p></div>
          ) : (
            <>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><strong>{threads.find(t=>t.id===active)?.member}</strong><span style={{fontSize:'0.75rem', color:'var(--trainer-muted)', display:'flex', gap:4, alignItems:'center'}}><CheckCircle size={12} color="#22c55e"/> Fitness scope only</span></div>
              <div style={{flex:1, minHeight:260, maxHeight:360, overflowY:'auto', display:'grid', gap:8, padding:8, background:'#fdfcf8', borderRadius:12, border:'1px solid var(--trainer-border)'}}>
                {(messages[active]||[]).length? messages[active].map((m:any,i:number)=>(
                  <div key={i} style={{justifySelf: m.from==='trainer'?'end':'start', maxWidth:'78%', padding:'10px 12px', borderRadius:12, background: m.from==='trainer'?'var(--trainer-primary)':'white', color: m.from==='trainer'?'white':'var(--trainer-text)', border: m.from==='trainer'? undefined:'1px solid var(--trainer-border)', fontSize:'0.88rem'}}>{m.text}</div>
                )): <p style={{textAlign:'center', color:'var(--trainer-muted)', padding:20}}>No messages yet — send encouragement.</p>}
              </div>
              <div style={{display:'flex', gap:8}}>
                <input aria-label="Message" placeholder="Type message (min 2 chars)..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()} style={{flex:1, padding:'10px 14px', borderRadius:999, border:'1px solid var(--trainer-border)'}} maxLength={500}/>
                <button onClick={handleSend} style={{padding:'10px 16px', borderRadius:999, background:'var(--trainer-primary)', color:'white', fontWeight:900, display:'inline-flex', gap:6, alignItems:'center'}}><Send size={14}/> Send</button>
              </div>
              <p style={{fontSize:'0.75rem', color:'var(--trainer-muted)', textAlign:'center'}}>{input.length}/500 • Only assigned members</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default TrainerMessages;
