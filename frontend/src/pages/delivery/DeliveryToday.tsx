import React, { useEffect, useState } from 'react';
import { Package, MapPin, Clock, Phone, Navigation, CheckCircle, Search, Filter, Truck } from 'lucide-react';
import { fetchOrders, updateOrderStatus } from '../../services/delivery.service';
import { getAuthToken } from '../../services/client';
import '../../styles/delivery.css';

type TodayOrder = { id:string; orderId:string; customer:string; pickup:string; destination:string; items:string; status:string; eta:string; phone?:string; amount?:number };

const DeliveryToday: React.FC = () => {
  const [orders, setOrders]=useState<TodayOrder[]>([]);
  const [filter, setFilter]=useState<'All'|'Pending'|'In Transit'|'Out for Delivery'|'Delivered'>('All');
  const [q, setQ]=useState('');
  const [toast, setToast]=useState<string|null>(null);
  const [loading, setLoading]=useState(true);

  useEffect(()=>{
    if(!getAuthToken()){ setOrders([
      { id:'DL-201', orderId:'ORD-401', customer:'Rahul K.', pickup:'Green Valley Farm, Pratapgarh', destination:'12 MG Road, Bengaluru 560001', items:'Ashwagandha 5kg', status:'Pending', eta:'14 mins', phone:'+91 98xxxxxx10' },
      { id:'DL-202', orderId:'ORD-402', customer:'Meera S.', pickup:'Erode Farm, TN', destination:'45 Koramangala, Bengaluru', items:'Amla 3kg + Turmeric 2kg', status:'In Transit', eta:'9 mins', phone:'+91 98xxxxxx11' },
      { id:'DL-203', orderId:'ORD-403', customer:'Aarav P.', pickup:'Neemuch Farm, MP', destination:'22 Indiranagar, Bengaluru', items:'Brahmi 2kg', status:'Delivered', eta:'—' },
    ]); setLoading(false); return; }
    fetchOrders().then(res=>{
      const list = res.orders?.length ? res.orders.map((o:any)=>({
        id:o.id, orderId:o.orderId, customer:o.customer, pickup: (o as any).pickup || 'Farm hub', destination:o.address, items:o.items, status:o.status, eta: (o as any).eta || '12 mins', phone:(o as any).phone
      })) : [];
      if(list.length) setOrders(list);
      else setOrders([
        { id:'DL-201', orderId:'ORD-401', customer:'Rahul K.', pickup:'Green Valley Farm, Pratapgarh', destination:'12 MG Road, Bengaluru 560001', items:'Ashwagandha 5kg', status:'Pending', eta:'14 mins', phone:'+91 98xxxxxx10' },
      ]);
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const showToast=(m:string)=>{ setToast(m); setTimeout(()=>setToast(null),2500); };
  const handleAccept=async(id:string)=>{
    const next = 'In Transit';
    if(getAuthToken()){
      try{ const o=orders.find(x=>x.id===id); if(o) await updateOrderStatus(id, next as any); }catch(e:any){ showToast(e.message); return; }
    }
    setOrders(prev=>prev.map(o=>o.id===id? {...o, status:next}:o));
    showToast(`${id} accepted → In Transit • Pickup confirmed`);
  };

  const filtered=orders.filter(o=>{
    const mS = filter==='All' || o.status===filter;
    const mQ = !q || o.customer.toLowerCase().includes(q.toLowerCase()) || o.orderId.toLowerCase().includes(q.toLowerCase()) || o.items.toLowerCase().includes(q.toLowerCase());
    return mS && mQ;
  });

  return (
    <div>
      <section className="del-hero">
        <div className="del-hero__inner">
          <div>
            <h1>Today&apos;s Deliveries</h1>
            <p>Order ID • Pickup • Destination • Customer • Items • Status • ETA — logistics only</p>
          </div>
        </div>
      </section>

      <div style={{maxWidth:1100, margin:'0 auto', padding:20, display:'grid', gap:14}}>
        {/* Search + filter — large touch */}
        <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
          <div style={{flex:1, minWidth:220, position:'relative'}}>
            <Search size={16} style={{position:'absolute', left:12, top:14, color:'var(--del-muted)'}}/>
            <input aria-label="Search deliveries" placeholder="Search order, customer, items" value={q} onChange={e=>setQ(e.target.value)} style={{width:'100%', padding:'12px 14px 12px 36px', borderRadius:14, border:'1px solid var(--del-border)', fontSize:'0.92rem'}}/>
          </div>
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            {(['All','Pending','In Transit','Out for Delivery','Delivered'] as const).map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{minHeight:44, padding:'10px 14px', borderRadius:999, border:'1px solid var(--del-border)', background: filter===f?'var(--del-primary)':'white', color:filter===f?'white':'var(--del-muted)', fontWeight:900, fontSize:'0.84rem'}}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{display:'flex', gap:8, alignItems:'center', fontSize:'0.80rem', color:'var(--del-muted)', fontWeight:800}}><Filter size={14}/>{filtered.length} of {orders.length} deliveries <span style={{marginLeft:'auto'}} className="del-badge del-badge--neutral"><Clock size={12}/>{new Date().toLocaleDateString()}</span></div>

        {loading ? <p style={{textAlign:'center', padding:30}}>Loading today&apos;s deliveries…</p> : filtered.length===0 ? (
          <div className="del-card" style={{padding:40, textAlign:'center'}}><Package size={40} color="var(--del-muted)"/><p style={{marginTop:10, color:'var(--del-muted)', fontWeight:800}}>No deliveries for filter</p></div>
        ) : (
          <div className="del-reveal" style={{display:'grid', gap:12}}>
            {filtered.map(o=>(
              <div key={o.id} className="del-card" style={{padding:14, display:'grid', gap:10}}>
                <div style={{display:'flex', justifyContent:'space-between', gap:10, alignItems:'center', flexWrap:'wrap'}}>
                  <div>
                    <strong style={{fontSize:'0.95rem'}}>{o.orderId} <span style={{color:'var(--del-muted)', fontWeight:700}}>• {o.id}</span></strong>
                    <span style={{marginLeft:8}} className={`del-badge ${o.status==='Delivered'?'del-badge--success': o.status==='Pending'?'del-badge--warning':'del-badge--info'}`}>{o.status==='Delivered'?<CheckCircle size={12} style={{display:'inline', marginRight:4}}/>: o.status==='Pending'?<Clock size={12} style={{display:'inline', marginRight:4}}/>:<Truck size={12} style={{display:'inline', marginRight:4}}/>}{o.status}</span>
                  </div>
                  <span className="del-badge del-badge--neutral"><Clock size={12}/>ETA {o.eta}</span>
                </div>

                {/* Mobile card layout — no table */}
                <div style={{display:'grid', gap:8, fontSize:'0.88rem'}}>
                  <div style={{display:'grid', gridTemplateColumns:'18px 1fr', gap:8}}>
                    <MapPin size={14} color="#22c55e" style={{marginTop:2}}/>
                    <div><div style={{fontSize:'0.72rem', fontWeight:800, color:'var(--del-muted)', textTransform:'uppercase', letterSpacing:'0.06em'}}>Pickup</div><div style={{fontWeight:700}}>{o.pickup}</div></div>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'18px 1fr', gap:8}}>
                    <MapPin size={14} color="#ef4444" style={{marginTop:2}}/>
                    <div><div style={{fontSize:'0.72rem', fontWeight:800, color:'var(--del-muted)', textTransform:'uppercase', letterSpacing:'0.06em'}}>Destination</div><div style={{fontWeight:700}}>{o.destination}</div><div style={{color:'var(--del-muted)', fontSize:'0.84rem'}}>{o.customer} • {o.items}</div></div>
                  </div>
                </div>

                {o.phone && <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                  <a href={`tel:${o.phone}`} className="del-btn del-btn--outline" style={{textDecoration:'none', flex:1, minWidth:140}}><Phone size={16}/> Call Customer</a>
                  <button className="del-btn del-btn--outline" onClick={()=>showToast(`Route to ${o.destination.slice(0,22)}…`)}><Navigation size={16}/> Directions</button>
                </div>}

                <div style={{display:'flex', gap:8}}>
                  {o.status==='Pending' && <button onClick={()=>handleAccept(o.id)} className="del-btn del-btn--primary" style={{flex:1}}>Accept & Pickup</button>}
                  {o.status==='In Transit' && <button onClick={()=>handleAccept(o.id)} className="del-btn del-btn--primary" style={{flex:1}}>Mark Out for Delivery</button>}
                  {o.status==='Out for Delivery' && <a href="/delivery/active" className="del-btn del-btn--primary" style={{flex:1, textDecoration:'none'}}>Go to Active →</a>}
                  {o.status==='Delivered' && <span className="del-badge del-badge--success del-success"><CheckCircle size={14}/> Delivered ✓</span>}
                </div>

                <p style={{fontSize:'0.72rem', color:'var(--del-muted)', fontWeight:700}}>No medical info — delivery-only data.</p>
              </div>
            ))}
          </div>
        )}
        {toast && <div style={{position:'fixed', bottom:80, left:12, right:12, maxWidth:520, margin:'0 auto', background:'#22c55e', color:'white', padding:'14px 16px', borderRadius:14, fontWeight:800, textAlign:'center', boxShadow:'0 8px 22px rgba(0,0,0,0.16)'}}>{toast}</div>}
      </div>
    </div>
  );
};
export default DeliveryToday;
