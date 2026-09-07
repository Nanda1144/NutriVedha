import React, { useState } from 'react';
import { Package, CheckCircle, XCircle, Truck, Clock, Search, Box } from 'lucide-react';
import '../../styles/farmer.css';

type OrderStatus = 'Pending'|'Confirmed'|'Preparing'|'Ready for Pickup'|'Completed'|'Cancelled';
type Order = { id:string; orderId:string; customer:string; crop:string; quantity:string; status:OrderStatus; date:string; amount:number };

const initialOrders: Order[] = [
  { id:'FO-401', orderId:'ORD-401', customer:'Rahul K.', crop:'Ashwagandha 5kg', quantity:'5kg', status:'Pending', date:'2026-03-12', amount:2100 },
  { id:'FO-402', orderId:'ORD-402', customer:'Meera S.', crop:'Amla 3kg', quantity:'3kg', status:'Confirmed', date:'2026-03-11', amount:255 },
  { id:'FO-403', orderId:'ORD-403', customer:'Aarav P.', crop:'Turmeric 10kg', quantity:'10kg', status:'Preparing', date:'2026-03-10', amount:1400 },
  { id:'FO-404', orderId:'ORD-404', customer:'Kavita R.', crop:'Brahmi 2kg', quantity:'2kg', status:'Ready for Pickup', date:'2026-03-09', amount:440 },
  { id:'FO-405', orderId:'ORD-405', customer:'Vikram J.', crop:'Tulsi 4kg', quantity:'4kg', status:'Completed', date:'2026-03-05', amount:600 },
];

const flow: OrderStatus[] = ['Pending','Confirmed','Preparing','Ready for Pickup','Completed'];

const FarmerOrders: React.FC = () => {
  const [orders, setOrders]=useState<Order[]>(initialOrders);
  const [filter, setFilter]=useState<'All'|OrderStatus>('All');
  const [q, setQ]=useState('');
  const [toast, setToast]=useState<string|null>(null);

  const showToast=(m:string)=>{ setToast(m); setTimeout(()=>setToast(null),2500); };

  const advance=(id:string)=>{
    setOrders(prev=>prev.map(o=>{
      if(o.id!==id) return o;
      const idx=flow.indexOf(o.status);
      if(idx<0 || idx>=flow.length-1) return o;
      const next=flow[idx+1];
      showToast(`${o.orderId} → ${next} • Order pipeline advanced • Delivery notified`);
      return {...o, status: next};
    }));
  };
  const cancel=(id:string)=>{
    if(!confirm('Cancel order? Customer will be notified.')) return;
    setOrders(prev=>prev.map(o=>o.id===id? {...o, status:'Cancelled'}:o));
    showToast('Order cancelled — customer notified');
  };

  const filtered=orders.filter(o=>{
    const mFilter= filter==='All' || o.status===filter;
    const mQ=!q || o.customer.toLowerCase().includes(q.toLowerCase()) || o.orderId.toLowerCase().includes(q.toLowerCase()) || o.crop.toLowerCase().includes(q.toLowerCase());
    return mFilter && mQ;
  });

  return (
    <div>
      <section className="farm-hero">
        <div className="farm-hero__inner">
          <div>
            <h1>Orders</h1>
            <p>Pending → Confirmed → Preparing → Ready for Pickup → Completed • Cancel where appropriate</p>
          </div>
          <div style={{alignSelf:'center', display:'flex', gap:8}}><span className="farm-badge" style={{background:'white', color:'var(--farm-dark)', borderColor:'white'}}><Package size={14}/>{orders.length} orders</span></div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20}}>
        <div style={{display:'flex', gap:10, flexWrap:'wrap', marginBottom:14}}>
          <div style={{flex:1, minWidth:220, position:'relative'}}>
            <Search size={16} style={{position:'absolute', left:12, top:12, color:'var(--farm-muted)'}}/>
            <input aria-label="Search orders" placeholder="Search customer, order ID, crop" value={q} onChange={e=>setQ(e.target.value)} style={{width:'100%', padding:'10px 14px 10px 36px', borderRadius:12, border:'1px solid var(--farm-border)'}}/>
          </div>
          {(['All','Pending','Confirmed','Preparing','Ready for Pickup','Completed','Cancelled'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f as any)} style={{padding:'7px 12px', borderRadius:999, border:'1px solid var(--farm-border)', background: filter===f?'var(--farm-primary)':'white', color:filter===f?'white':'var(--farm-muted)', fontWeight:900, fontSize:'0.78rem'}}>{f}</button>
          ))}
        </div>

        <div style={{display:'flex', gap:6, marginBottom:12, flexWrap:'wrap', alignItems:'center'}}>
          <span style={{fontSize:'0.72rem', fontWeight:800, color:'var(--farm-muted)', textTransform:'uppercase', letterSpacing:'0.06em'}}>Pipeline:</span>
          {flow.map(s=>(
            <span key={s} className="farm-badge farm-badge--neutral" style={{fontSize:'0.70rem'}}>{s}</span>
          ))}
          <span style={{fontSize:'0.76rem', color:'var(--farm-muted)'}}>→ Delivered by Delivery partner</span>
        </div>

        {filtered.length===0 ? (
          <div className="farm-card" style={{padding:40, textAlign:'center'}}><Box size={40} color="var(--farm-muted)"/><p style={{marginTop:10, color:'var(--farm-muted)'}}>No orders for filter</p></div>
        ) : (
          <div style={{display:'grid', gap:12}}>
            {filtered.map(o=>(
              <div key={o.id} className="farm-card" style={{padding:16, display:'grid', gap:10}}>
                <div style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:10}}>
                  <div>
                    <strong>{o.orderId} • {o.customer}</strong> <span style={{color:'var(--farm-muted)', fontSize:'0.88rem'}}>• {o.crop} • ₹{o.amount} • <Clock size={12} style={{display:'inline', marginRight:4}}/>{o.date}</span>
                    <p style={{fontSize:'0.72rem', color:'var(--farm-muted)'}}>{o.id}</p>
                  </div>
                  <span className={`farm-badge ${o.status==='Completed'?'farm-badge--success': o.status==='Cancelled'?'farm-badge--danger': o.status==='Pending'?'farm-badge--warning':'farm-badge--neutral'}`}>
                    {o.status==='Completed'?<CheckCircle size={12} style={{display:'inline', marginRight:4}}/>: o.status==='Cancelled'?<XCircle size={12} style={{display:'inline', marginRight:4}}/>:<Truck size={12} style={{display:'inline', marginRight:4}}/>}{o.status}
                  </span>
                </div>
                {/* mini pipeline progress */}
                <div style={{display:'flex', gap:4, alignItems:'center'}}>
                  {flow.map(s=>{
                    const idx=flow.indexOf(s); const curIdx=flow.indexOf(o.status);
                    const done = o.status==='Cancelled' ? false : idx<=curIdx;
                    return <span key={s} style={{flex:1, height:6, borderRadius:999, background: done?'var(--farm-primary)':'#e6ece3'}} title={s}/>;
                  })}
                </div>
                <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                  {o.status!=='Completed' && o.status!=='Cancelled' && <button onClick={()=>advance(o.id)} style={{padding:'8px 14px', borderRadius:999, background:'var(--farm-primary)', color:'white', fontWeight:900, display:'inline-flex', gap:6}}><Truck size={14}/> Advance → {flow[flow.indexOf(o.status)+1]||'Completed'}</button>}
                  {o.status==='Ready for Pickup' && <button onClick={()=>advance(o.id)} style={{padding:'8px 14px', borderRadius:999, border:'1px solid var(--farm-border)', background:'#ecfdf5', color:'#065f46', fontWeight:900}}><CheckCircle size={14} style={{display:'inline', marginRight:4}}/>Mark Completed</button>}
                  {o.status!=='Completed' && o.status!=='Cancelled' && o.status!=='Ready for Pickup' && <button onClick={()=>cancel(o.id)} style={{padding:'8px 14px', borderRadius:999, border:'1px solid #fecaca', background:'white', color:'#991b1b', fontWeight:800, display:'inline-flex', gap:6}}><XCircle size={14}/> Cancel</button>}
                  {o.status==='Completed' && <span style={{fontSize:'0.82rem', color:'var(--farm-muted)', fontWeight:700}}>→ Delivery pickup done • Earnings credited</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        {toast && <div style={{position:'fixed', bottom:20, right:20, background:'#22c55e', color:'white', padding:'12px 16px', borderRadius:12, fontWeight:800}}>{toast}</div>}
      </div>
    </div>
  );
};
export default FarmerOrders;
