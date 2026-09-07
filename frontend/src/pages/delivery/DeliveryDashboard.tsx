import React, { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle, Wallet, Navigation, Clock, MapPin, Phone, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchOrders } from '../../services/delivery.service';
import { getAuthToken } from '../../services/client';
import '../../styles/delivery.css';

const DeliveryDashboard: React.FC = () => {
  const [orders, setOrders]=useState<any[]>([]);
  const [loading, setLoading]=useState(true);
  const [error, setError]=useState<string|null>(null);
  const [earningsToday, setEarningsToday]=useState(900);

  useEffect(()=>{
    if(!getAuthToken()){ setError('Login as Delivery to view dashboard'); setLoading(false); return; }
    fetchOrders().then(res=>{
      const list = res.orders?.length ? res.orders : [
        { id:'DL-201', orderId:'ORD-401', customer:'Rahul K.', address:'12 MG Road, Bengaluru 560001', items:'Ashwagandha 5kg, Amla 2kg', status:'Pending', createdAt:new Date().toISOString(), pickup:'Green Valley Farm, Pratapgarh', eta:'12 mins', phone:'+91 98xxxxxx10' },
        { id:'DL-202', orderId:'ORD-402', customer:'Meera S.', address:'45 Koramangala, Bengaluru', items:'Turmeric 3kg', status:'In Transit', createdAt:new Date().toISOString(), pickup:'Erode Farm, TN', eta:'8 mins', phone:'+91 98xxxxxx11' },
        { id:'DL-203', orderId:'ORD-403', customer:'Aarav P.', address:'22 Indiranagar, Bengaluru', items:'Brahmi 2kg', status:'Delivered', createdAt:new Date().toISOString(), pickup:'Neemuch Farm, MP', eta:'—', phone:'+91 98xxxxxx12' },
      ];
      setOrders(list);
      setEarningsToday(list.filter((o:any)=>o.status==='Delivered').length * 150 + 600);
    }).catch(e=>setError(e.message)).finally(()=>setLoading(false));
  },[]);

  const todayDeliveries = orders.length;
  const pendingPickups = orders.filter(o=>o.status==='Pending').length;
  const active = orders.find(o=>['In Transit','Out for Delivery'].includes(o.status)) || null;
  const completed = orders.filter(o=>o.status==='Delivered').length;

  if(loading) return <div style={{padding:40, textAlign:'center'}}>Loading dashboard…</div>;
  if(error) return <div className="del-card" style={{margin:20, padding:16, borderLeft:'3px solid #ef4444'}}>{error}</div>;

  return (
    <div>
      <section className="del-hero">
        <div className="del-hero__inner">
          <div>
            <span className="del-badge" style={{background:'rgba(255,255,255,0.14)', color:'white', borderColor:'rgba(255,255,255,0.18)'}}><Truck size={12}/> Logistics Command • Mobile first</span>
            <h1>Delivery Dashboard</h1>
            <p>Today • Pending pickups • Active • Completed • Daily earnings • Route summary</p>
          </div>
          <div style={{display:'flex', gap:10, justifyContent:'flex-end', flexWrap:'wrap'}}>
            <Link to="/delivery/today" className="del-btn del-btn--primary" style={{textDecoration:'none'}}>Today&apos;s Deliveries →</Link>
          </div>
        </div>
      </section>

      <div style={{maxWidth:1200, margin:'0 auto', padding:20, display:'grid', gap:16}}>
        {/* Top stats — large touch */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12}}>
          <div className="del-card" style={{padding:16, display:'grid', gap:6, textAlign:'center'}}><Package size={22} color="var(--del-primary)" style={{justifySelf:'center'}}/><div style={{fontWeight:900, fontSize:'1.6rem'}}>{todayDeliveries}</div><div style={{color:'var(--del-muted)', fontSize:'0.80rem', fontWeight:800}}>Today&apos;s Deliveries</div></div>
          <div className="del-card" style={{padding:16, display:'grid', gap:6, textAlign:'center'}}><Clock size={22} color="#f59e0b" style={{justifySelf:'center'}}/><div style={{fontWeight:900, fontSize:'1.6rem'}}>{pendingPickups}</div><div style={{color:'var(--del-muted)', fontSize:'0.80rem', fontWeight:800}}>Pending Pickups</div></div>
          <div className="del-card" style={{padding:16, display:'grid', gap:6, textAlign:'center', border: active ? '2px solid var(--del-primary)' : undefined}}><Truck size={22} color="var(--del-primary)" style={{justifySelf:'center'}}/><div style={{fontWeight:900, fontSize:'1.05rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{active ? `${active.orderId} • ${active.status}` : 'No active'}</div><div style={{color:'var(--del-muted)', fontSize:'0.80rem', fontWeight:800}}>Active Delivery</div></div>
          <div className="del-card" style={{padding:16, display:'grid', gap:6, textAlign:'center'}}><CheckCircle size={22} color="#22c55e" style={{justifySelf:'center'}}/><div style={{fontWeight:900, fontSize:'1.6rem'}}>{completed}</div><div style={{color:'var(--del-muted)', fontSize:'0.80rem', fontWeight:800}}>Completed</div></div>
          <div className="del-card" style={{padding:16, display:'grid', gap:6, textAlign:'center'}}><Wallet size={22} color="var(--del-primary)" style={{justifySelf:'center'}}/><div style={{fontWeight:900, fontSize:'1.6rem'}}>₹{earningsToday}</div><div style={{color:'var(--del-muted)', fontSize:'0.80rem', fontWeight:800}}>Daily Earnings</div></div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1.4fr 0.85fr', gap:16}}>
          <div className="del-card" style={{padding:16}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
              <h3 style={{display:'flex', gap:8, alignItems:'center'}}><Package size={18}/> Today&apos;s Deliveries</h3>
              <Link to="/delivery/today" style={{fontSize:'0.84rem', color:'var(--del-primary)', fontWeight:900}}>View all →</Link>
            </div>
            <div style={{display:'grid', gap:10}}>
              {orders.slice(0,3).map(o=>(
                <div key={o.id} className="del-card" style={{padding:12, display:'grid', gap:6}}>
                  <div style={{display:'flex', justifyContent:'space-between', gap:10, alignItems:'center'}}>
                    <strong style={{fontSize:'0.92rem'}}>{o.orderId} • {o.customer}</strong>
                    <span className={`del-badge ${o.status==='Delivered'?'del-badge--success': o.status==='Pending'?'del-badge--warning':'del-badge--info'}`}>{o.status}</span>
                  </div>
                  <span style={{fontSize:'0.82rem', color:'var(--del-muted)', display:'flex', gap:6, alignItems:'center'}}><MapPin size={12}/>{o.address} • ETA {o.eta || '—'}</span>
                  <Link to="/delivery/active" className="del-btn del-btn--outline" style={{textDecoration:'none', minHeight:44}}>View Active →</Link>
                </div>
              ))}
              {orders.length===0 && <p style={{textAlign:'center', color:'var(--del-muted)', padding:20}}>No deliveries today</p>}
            </div>
          </div>

          <div style={{display:'grid', gap:16}}>
            <div className="del-card" style={{padding:16}}>
              <h3 style={{display:'flex', gap:8, alignItems:'center'}}><Navigation size={18} color="var(--del-primary)"/> Route Summary</h3>
              <div style={{marginTop:10, height:140}} className="del-map">
                <span className="del-map__dot del-map__dot--pulse" style={{left:'18%', top:'58%'}} />
                <span className="del-map__dot del-map__dot--dest" style={{right:'18%', top:'22%'}} />
                <svg viewBox="0 0 100 100" style={{position:'absolute', inset:0, width:'100%', height:'100%'}}>
                  <path d="M22,68 Q50,28 78,28" fill="none" stroke="var(--del-primary)" strokeWidth={2.5} strokeDasharray="6 4" />
                </svg>
                <div style={{position:'absolute', bottom:8, left:8, background:'rgba(255,255,255,0.95)', padding:'6px 10px', borderRadius:999, fontSize:'0.72rem', fontWeight:800}}>2.4 km • 12 mins • Low traffic</div>
              </div>
              <Link to="/delivery/route" className="del-btn del-btn--primary" style={{width:'100%', marginTop:10, textDecoration:'none'}}><Navigation size={16}/> Open Route</Link>
            </div>
            <div className="del-card" style={{padding:14, display:'flex', gap:10, alignItems:'center'}}>
              <Phone size={18} color="var(--del-primary)"/><div><div style={{fontWeight:800, fontSize:'0.88rem'}}>Customer contact</div><div style={{fontSize:'0.82rem', color:'var(--del-muted)'}}>Available in Active Delivery when assigned</div></div>
              <AlertCircle size={16} color="#94a3b8" style={{marginLeft:'auto'}}/>
            </div>
          </div>
        </div>

        <div className="del-card" style={{padding:14, display:'flex', gap:10, alignItems:'center', background:'#fdfcf8'}}>
          <Truck size={18} color="var(--del-primary)"/><span style={{fontSize:'0.86rem', color:'var(--del-muted)', fontWeight:700}}>Only delivery-required info shown. <strong>Medical/diet/fitness data not accessible</strong> — privacy shield.</span>
          <Link to="/delivery/active" style={{marginLeft:'auto', fontSize:'0.84rem', fontWeight:900, color:'var(--del-primary)', display:'inline-flex', gap:6}}>Active <ArrowRight size={14}/></Link>
        </div>
      </div>
    </div>
  );
};
export default DeliveryDashboard;
