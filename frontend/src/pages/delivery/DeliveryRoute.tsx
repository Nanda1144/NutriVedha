import React, { useEffect, useState } from 'react';
import { Navigation, MapPin, Clock, Phone, Truck } from 'lucide-react';
import { fetchOrders, recordTrackingPoint, fetchTrack } from '../../services/delivery.service';
import { getAuthToken } from '../../services/client';
import '../../styles/delivery.css';

const DeliveryRoute: React.FC = () => {
  const [active, setActive]=useState<any>(null);
  const [eta] = useState('11 mins');
  const [toast, setToast]=useState<string|null>(null);

  useEffect(()=>{
    if(!getAuthToken()){
      setActive({ orderId:'ORD-402', customer:'Meera S.', pickup:'Erode Farm, TN', destination:'45 Koramangala, Bengaluru', phone:'+91 98xxxxxx11' });
      return;
    }
    fetchOrders().then(res=>{
      const a=res.orders.find((o:any)=>['In Transit','Out for Delivery'].includes(o.status)) || res.orders[0];
      if(a) setActive({ ...a, pickup:(a as any).pickup || 'Farm hub', destination:a.address, phone:(a as any).phone || '+91 98xxxxxx11' });
    }).catch(()=>{});
  },[]);

  const showToast=(m:string)=>{ setToast(m); setTimeout(()=>setToast(null),2600); };

  return (
    <div>
      <section className="del-hero">
        <div className="del-hero__inner">
          <div>
            <h1>Route</h1>
            <p>Current location • Destination • Route • ETA • Route status — map pulse</p>
          </div>
        </div>
      </section>
      <div style={{maxWidth:900, margin:'0 auto', padding:20, display:'grid', gap:14}}>
        <div className="del-card" style={{padding:16, display:'grid', gap:12}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8}}>
            <strong style={{display:'flex', gap:8, alignItems:'center'}}><Navigation size={16} color="var(--del-primary)"/>{active ? `${active.orderId} • ${active.customer}` : 'Route'}</strong>
            <span className="del-badge del-badge--info"><Clock size={12}/>ETA {eta}</span>
          </div>

          {/* Map — pulse animation */}
          <div className="del-map" style={{height:320}} aria-label="Delivery route map">
            {/* current */}
            <span className="del-map__dot del-map__dot--pulse" style={{left:'18%', top:'58%'}} title="Current location" />
            {/* destination */}
            <span className="del-map__dot del-map__dot--dest" style={{right:'18%', top:'22%'}} title="Destination" />
            <svg viewBox="0 0 100 100" style={{position:'absolute', inset:0, width:'100%', height:'100%'}}>
              <path d="M22,68 Q50,28 78,28" fill="none" stroke="var(--del-primary)" strokeWidth={2.5} strokeDasharray="6 4" opacity={0.95} />
              <circle cx="50" cy="40" r="3" fill="var(--del-primary)" opacity={0.9}>
                <animate attributeName="r" values="3;5;3" dur="1.6s" repeatCount="indefinite"/>
              </circle>
            </svg>
            <div style={{position:'absolute', bottom:10, left:10, background:'white', padding:'8px 12px', borderRadius:999, fontSize:'0.80rem', fontWeight:900, boxShadow:'0 4px 14px rgba(0,0,0,0.10)'}}><Truck size={14} style={{display:'inline', marginRight:6, color:'var(--del-primary)'}}/>2.4 km • Low traffic</div>
            <div style={{position:'absolute', top:10, right:10, background:'var(--del-dark)', color:'white', padding:'6px 10px', borderRadius:999, fontSize:'0.72rem', fontWeight:800}}>GPS ACTIVE • Route status: En route</div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, fontSize:'0.88rem'}}>
            <div className="del-card" style={{padding:12, display:'flex', gap:8}}>
              <MapPin size={16} color="#22c55e"/><div><div style={{fontSize:'0.72rem', fontWeight:800, color:'var(--del-muted)'}}>CURRENT</div><div style={{fontWeight:800}}>{active?.pickup || 'Your location'}</div></div>
            </div>
            <div className="del-card" style={{padding:12, display:'flex', gap:8}}>
              <MapPin size={16} color="#ef4444"/><div><div style={{fontSize:'0.72rem', fontWeight:800, color:'var(--del-muted)'}}>DESTINATION</div><div style={{fontWeight:800}}>{active?.destination || 'Customer'}</div><div style={{fontSize:'0.82rem', color:'var(--del-muted)'}}>{active?.customer || ''}</div></div>
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
            {active?.phone && <a href={`tel:${active.phone}`} className="del-btn del-btn--outline" style={{textDecoration:'none'}}><Phone size={16}/> Call Customer</a>}
            <button className="del-btn del-btn--primary" onClick={async()=>{
              if(!active) return;
              if(getAuthToken()){
                try{ await recordTrackingPoint({ orderId:active.orderId, lat:12.9716 + Math.random()*0.01, lng:77.5946 + Math.random()*0.01, note:'Route ping' }); showToast(`GPS ping saved — tracking_points for ${active.orderId}`); return; }catch(e:any){ showToast(e.message); return; }
              }
              showToast('Route ping — demo');
            }}><Navigation size={16}/> Share live location</button>
          </div>

          <div style={{display:'flex', gap:8}}>
            <button className="del-btn del-btn--outline" style={{flex:1}} onClick={async()=>{
              if(!active || !getAuthToken()) { showToast('No active order'); return; }
              try{ const r=await fetchTrack(active.orderId); showToast(`${r.points.length} points: ${r.points.map((p:any)=>`${p.lat.toFixed(2)},${p.lng.toFixed(2)}`).join(' • ') || 'no points'}`);}catch(e:any){ showToast(e.message); }
            }}>Fetch Track</button>
            <span style={{alignSelf:'center', fontSize:'0.76rem', color:'var(--del-muted)', fontWeight:700}}>No medical info • ETA updates only</span>
          </div>
        </div>
        {toast && <div style={{position:'fixed', bottom:84, left:12, right:12, maxWidth:480, margin:'0 auto', background:'#1e293b', color:'white', padding:'14px 16px', borderRadius:14, fontWeight:800, textAlign:'center'}}>{toast}</div>}
      </div>
    </div>
  );
};
export default DeliveryRoute;
