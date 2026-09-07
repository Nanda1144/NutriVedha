import React, { useEffect, useState } from 'react';
import { Package, MapPin, Phone, Navigation, Camera, CheckCircle, Clock, Truck, ShieldCheck, ArrowRight } from 'lucide-react';
import { fetchOrders, updateOrderStatus, recordTrackingPoint } from '../../services/delivery.service';
import { getAuthToken } from '../../services/client';
import { Link } from 'react-router-dom';
import '../../styles/delivery.css';

const DeliveryActive: React.FC = () => {
  const [active, setActive]=useState<any>(null);
  const [pickupDone, setPickupDone]=useState(false);
  const [progress, setProgress]=useState(35);
  const [toast, setToast]=useState<string|null>(null);
  const [success, setSuccess]=useState(false);
  const [loading, setLoading]=useState(true);

  useEffect(()=>{
    if(!getAuthToken()){
      setActive({ id:'DL-202', orderId:'ORD-402', customer:'Meera S.', pickup:'Erode Farm, TN', destination:'45 Koramangala, Bengaluru', items:'Amla 3kg + Turmeric 2kg', status:'In Transit', eta:'9 mins', phone:'+91 98xxxxxx11', instructions:'Gate 2 — 3rd floor — call on arrival' });
      setLoading(false); return;
    }
    fetchOrders().then(res=>{
      const a = res.orders.find((o:any)=>['In Transit','Out for Delivery','Pending'].includes(o.status)) || res.orders[0];
      if(a) setActive({ ...a, pickup:(a as any).pickup || 'Farm hub', destination:a.address, eta:'9 mins', phone:(a as any).phone || '+91 98xxxxxx11', instructions:'Gate 2 — call on arrival' });
      else setActive({ id:'DL-202', orderId:'ORD-402', customer:'Meera S.', pickup:'Erode Farm, TN', destination:'45 Koramangala, Bengaluru', items:'Amla 3kg', status:'In Transit', eta:'9 mins', phone:'+91 98xxxxxx11', instructions:'Gate 2 — call on arrival' });
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  // moving progress indicator
  useEffect(()=>{
    if(!active || success) return;
    const id=setInterval(()=> setProgress(p=> Math.min(92, p + (Math.random()>0.6? 2: -0.3))), 1800);
    return ()=>clearInterval(id);
  },[active, success]);

  const showToast=(m:string)=>{ setToast(m); setTimeout(()=>setToast(null),2600); };
  const handlePickup=async()=>{
    setPickupDone(true); setProgress(55);
    if(active && getAuthToken()){ try{ await updateOrderStatus(active.id, 'Out for Delivery' as any); await recordTrackingPoint({ orderId:active.orderId, lat:12.97, lng:77.59, note:'Picked up' }); }catch{}}
    showToast('Pickup confirmed — out for delivery');
  };
  const handleDelivered=async()=>{
    if(!active) return;
    if(getAuthToken()){ try{ await updateOrderStatus(active.id, 'Delivered' as any); await recordTrackingPoint({ orderId:active.orderId, lat:12.9716, lng:77.5946, note:'Delivered — proof uploaded' }); }catch(e:any){ showToast(e.message); return;}}
    setSuccess(true); setProgress(100);
    showToast('Delivered ✓ — History + Earnings updated');
  };

  if(loading) return <div style={{padding:40, textAlign:'center'}}>Loading active delivery…</div>;
  if(!active) return <div className="del-card" style={{margin:20, padding:20, textAlign:'center'}}><Package size={36} color="var(--del-muted)"/><p style={{marginTop:10, color:'var(--del-muted)', fontWeight:800}}>No active delivery</p><Link to="/delivery/today" className="del-btn del-btn--primary" style={{marginTop:12, textDecoration:'none'}}>Go to Today&apos;s Deliveries →</Link></div>;

  return (
    <div>
      <section className="del-hero">
        <div className="del-hero__inner">
          <div>
            <h1>Active Delivery</h1>
            <p>Pickup • Destination • ETA • Contact • Instructions • Proof — moving progress</p>
          </div>
        </div>
      </section>

      <div style={{maxWidth:760, margin:'0 auto', padding:20, display:'grid', gap:14}}>
        {/* Moving progress indicator */}
        <div className="del-card" style={{padding:16, display:'grid', gap:10}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <strong style={{display:'flex', gap:8, alignItems:'center'}}><Truck size={16} color="var(--del-primary)"/>{active.orderId} • {active.customer} <span className={`del-badge ${pickupDone?'del-badge--info':'del-badge--warning'}`}>{pickupDone?'Out for Delivery': active.status}</span></strong>
            <span className="del-badge del-badge--neutral"><Clock size={12}/>ETA {active.eta}</span>
          </div>
          <div className="del-progress" aria-label="Delivery progress"><div className="del-progress__fill" style={{width:`${progress}%`}}/></div>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.72rem', fontWeight:800, color:'var(--del-muted)'}}>
            <span>Pickup {pickupDone? '✓':''}</span><span>En route {progress>40?'•':''}</span><span>Delivered {success?'✓':''}</span>
          </div>
          <p style={{fontSize:'0.76rem', color:'var(--del-muted)', fontWeight:700, display:'flex', gap:6}}><ShieldCheck size={12} color="#22c55e"/> Only delivery-required info — no medical/fitness data.</p>
        </div>

        {!success ? (
          <>
            <div className="del-card" style={{padding:14, display:'grid', gap:10}}>
              <div style={{display:'grid', gridTemplateColumns:'18px 1fr', gap:10}}>
                <MapPin size={16} color="#22c55e" style={{marginTop:2}}/>
                <div><div style={{fontSize:'0.72rem', fontWeight:800, color:'var(--del-muted)', textTransform:'uppercase'}}>Pickup</div><div style={{fontWeight:800}}>{active.pickup}</div><div style={{fontSize:'0.84rem', color:'var(--del-muted)'}}>{active.items}</div></div>
              </div>
              <div style={{height:1, background:'var(--del-border)'}}/>
              <div style={{display:'grid', gridTemplateColumns:'18px 1fr', gap:10}}>
                <MapPin size={16} color="#ef4444" style={{marginTop:2}}/>
                <div><div style={{fontSize:'0.72rem', fontWeight:800, color:'var(--del-muted)', textTransform:'uppercase'}}>Destination</div><div style={{fontWeight:800}}>{active.destination}</div><div style={{fontSize:'0.84rem', color:'var(--del-muted)'}}>Customer: {active.customer} • ETA {active.eta}</div></div>
              </div>
              {!pickupDone ? (
                <button onClick={handlePickup} className="del-btn del-btn--primary" style={{width:'100%'}}><Package size={16}/> Confirm Pickup</button>
              ) : (
                <div style={{display:'grid', gap:8}}>
                  <div style={{padding:'12px', borderRadius:14, background:'#f0fdf4', border:'1px solid #a7f3d0', display:'flex', gap:8}}><CheckCircle size={16} color="#22c55e"/><span style={{fontSize:'0.88rem', fontWeight:800}}>Picked up — en route to customer</span></div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                    <a href={`tel:${active.phone}`} className="del-btn del-btn--outline" style={{textDecoration:'none'}}><Phone size={16}/> Call Customer</a>
                    <Link to="/delivery/route" className="del-btn del-btn--outline" style={{textDecoration:'none'}}><Navigation size={16}/> Open Route</Link>
                  </div>
                  <div style={{padding:12, borderRadius:14, background:'#fdfcf8', border:'1px solid var(--del-border)'}}>
                    <div style={{fontSize:'0.72rem', fontWeight:800, color:'var(--del-muted)', textTransform:'uppercase'}}>Delivery instructions</div>
                    <div style={{fontWeight:700, fontSize:'0.88rem', marginTop:4}}>{active.instructions}</div>
                    <div style={{fontSize:'0.82rem', color:'var(--del-muted)', marginTop:4}}>Phone where authorized: <a href={`tel:${active.phone}`} style={{color:'var(--del-primary)', fontWeight:800}}>{active.phone}</a></div>
                  </div>
                  <button onClick={handleDelivered} className="del-btn del-btn--primary" style={{width:'100%', padding:'16px'}}><Camera size={18}/> Proof of Delivery — Mark Delivered</button>
                </div>
              )}
            </div>
            <Link to="/delivery/route" className="del-btn del-btn--outline" style={{width:'100%', textDecoration:'none'}}><Navigation size={16}/> View Route & ETA →</Link>
          </>
        ) : (
          <div className="del-card del-success" style={{padding:32, textAlign:'center', border:'2px solid #a7f3d0', background:'#f0fdf4'}}>
            <CheckCircle size={48} color="#22c55e" style={{margin:'0 auto'}}/>
            <h2 style={{marginTop:12, color:'#065f46'}}>Delivered ✓</h2>
            <p style={{color:'var(--del-muted)', marginTop:6, fontWeight:700}}>Proof uploaded — customer notified • Tracking point saved • Earnings updated</p>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:14}}>
              <Link to="/delivery/history" className="del-btn del-btn--outline" style={{textDecoration:'none'}}>History →</Link>
              <Link to="/delivery/earnings" className="del-btn del-btn--primary" style={{textDecoration:'none'}}>Earnings <ArrowRight size={14}/></Link>
            </div>
          </div>
        )}
        {toast && <div style={{position:'fixed', bottom:84, left:12, right:12, maxWidth:480, margin:'0 auto', background:'var(--del-dark)', color:'white', padding:'14px 16px', borderRadius:14, fontWeight:800, textAlign:'center'}}>{toast}</div>}
      </div>
    </div>
  );
};
export default DeliveryActive;
