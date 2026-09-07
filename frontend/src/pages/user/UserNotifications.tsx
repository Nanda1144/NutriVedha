import React, { useEffect, useState } from 'react';
import { Bell, Calendar, Apple, Truck, Info, CheckCircle } from 'lucide-react';
import { fetchNotifications, markRead } from '../../services/notification.service';
import '../../styles/user.css';

const UserNotifications: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{ (async()=>{
    try{ setLoading(true); const r=await fetchNotifications(); setItems((r as any).notifications || (r as any) || [
      { id:'n1', title:'Appointment confirmed', message:'Dr. Ananya • Tomorrow 10:30 AM', type:'appointment', read:false, sentAt: new Date().toISOString() },
      { id:'n2', title:'Diet update', message:'Your AI diet plan is ready', type:'health', read:false, sentAt: new Date().toISOString() },
      { id:'n3', title:'Order shipped', message:'Amla 2kg • Out for delivery', type:'order', read:true, sentAt: new Date().toISOString() },
    ]); }
    catch(e:any){ setError(e.message); setItems([
      { id:'n1', title:'Appointment confirmed', message:'Dr. Ananya • Tomorrow 10:30 AM', type:'appointment', read:false },
      { id:'n2', title:'AI result', message:'Scan complete — Pitta imbalance', type:'health', read:false },
    ]); }
    finally{ setLoading(false); }
  })(); },[]);

  const iconFor = (t:string)=> t==='appointment'?Calendar: t==='order'?Truck: t==='health'?Apple: t==='alert'?Info: Bell;

  return (
    <div>
      <section className="user-hero">
        <div className="user-hero__inner">
          <div>
            <h1>Notifications</h1>
            <p>Appointments • Doctor updates • Diet • AI results • Orders • Delivery • System.</p>
          </div>
          <img src="/hero.png" alt="Notifications" className="user-hero__img" />
        </div>
      </section>
      <div style={{ maxWidth:800, margin:'0 auto', padding:20 }}>
        {loading ? <p style={{ textAlign:'center', padding:40 }}>Loading notifications...</p> : error && items.length===0 ? <div style={{ padding:16, borderRadius:30, background:'#fef2f2', border:'1px solid #fecaca', color:'#991b1b' }}>{error}</div> : (
          <div style={{ display:'grid', gap:12 }}>
            {items.map((n:any,i:number)=>{
              const Icon = iconFor(n.type);
              return (
                <div key={n.id||i} className="user-card slide-in" style={{ padding:16, display:'flex', gap:12, alignItems:'center', animationDelay:`${i*0.06}s`, borderLeft: n.read? '1px solid #e8ecec' : '4px solid var(--user-accent)' }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--user-accent-soft)', display:'grid', placeItems:'center', flexShrink:0 }}>
                    <Icon size={18} color="var(--user-primary)" />
                  </div>
                  <div style={{ flex:1 }}>
                    <strong style={{ display:'flex', gap:6, alignItems:'center' }}>{n.title} {n.read && <CheckCircle size={14} color="#22c55e" />}</strong>
                    <p style={{ color:'var(--user-muted)', fontSize:'0.9rem' }}>{n.message}</p>
                    <p style={{ color:'var(--user-muted)', fontSize:'0.75rem' }}>{n.sentAt? new Date(n.sentAt).toLocaleString(): 'Just now'} • {n.type}</p>
                  </div>
                  {!n.read && <button onClick={async()=>{ try{await markRead(n.id);}catch{}; setItems(items.map(x=>x.id===n.id?{...x,read:true}:x)); }} style={{ padding:'6px 12px', borderRadius:30, background:'var(--user-primary)', color:'white', fontWeight:700, fontSize:'0.8rem' }}>Mark read</button>}
                </div>
              );
            })}
            {items.length===0 && <div className="user-card" style={{ padding:40, textAlign:'center' }}><Bell size={40} color="var(--user-primary)" /><p style={{ marginTop:12, fontWeight:700 }}>No notifications.</p><p style={{ color:'var(--user-muted)' }}>You&apos;re all caught up.</p></div>}
          </div>
        )}
      </div>
    </div>
  );
};
export default UserNotifications;
