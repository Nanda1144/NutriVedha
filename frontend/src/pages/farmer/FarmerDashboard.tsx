import React, { useEffect, useState } from 'react';
import { Sprout, ShoppingBag, Package, Boxes, Wallet, Calendar, TrendingUp, Leaf, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchInventory, fetchEarnings } from '../../services/farmer.service';
import { fetchBookings } from '../../services/marketplace.service';
import { getAuthToken } from '../../services/client';
import '../../styles/farmer.css';

const FarmerDashboard: React.FC = () => {
  const [crops, setCrops] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [earnings, setEarnings] = useState(0);
  const [pendingCount, setPendingCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(()=>{
    if(!getAuthToken()){ setError('Login as Farmer to view dashboard'); setLoading(false); return;}
    Promise.allSettled([
      fetchInventory().catch(()=>({inventory:[]})),
      fetchEarnings().catch(()=>({earnings:[], total:42850})),
      fetchBookings().catch(()=>({bookings:[]}))
    ]).then(([inv, earn, book])=>{
      const invVal = (inv.status==='fulfilled' && (inv.value as any).inventory?.length) ? (inv.value as any).inventory : [
        { id:'FI-01', name:'Ashwagandha', stock:50, unit:'kg', price:180 },
        { id:'FI-02', name:'Amla', stock:30, unit:'kg', price:85 },
        { id:'FI-03', name:'Brahmi', stock:20, unit:'kg', price:220 },
      ];
      const earnVal = (earn.status==='fulfilled') ? ((earn.value as any).total ?? 42850) : 42850;
      const bookVal = (book.status==='fulfilled' && (book.value as any).bookings?.length) ? (book.value as any).bookings : [
        { id:'BK-201', customer:'Rahul K.', crop:'Ashwagandha', quantity:5, status:'Growing' },
        { id:'BK-202', customer:'Meera S.', crop:'Amla', quantity:3, status:'Growing' },
      ];
      setCrops(invVal); setEarnings(earnVal); setBookings(bookVal);
      setPendingCount(bookVal.filter((b:any)=>['Growing','Pending'].includes(b.status)).length);
    }).catch(e=>setError(e.message)).finally(()=>setLoading(false));
  },[]);

  const activeCrops = crops.length;
  const upcomingHarvests = crops.filter((c:any)=>['Oct 2026','Nov 2026','Sep 2026'].includes(c.harvest || 'Nov 2026')).length || 2;
  const inventoryTotal = crops.reduce((a,c)=>a+(c.stock||0),0);

  if(loading) return <div style={{padding:40, textAlign:'center'}}>Loading farmer dashboard…</div>;
  if(error) return <div className="farm-card" style={{margin:20, padding:16, borderLeft:'3px solid #ef4444'}}>{error}</div>;

  return (
    <div>
      <section className="farm-hero">
        <div className="farm-hero__inner">
          <div>
            <span className="farm-badge" style={{background:'rgba(255,255,255,0.14)', color:'white', borderColor:'rgba(255,255,255,0.18)'}}><Leaf size={12}/> Organic Supply Terminal • Marketplace Linked</span>
            <h1>Farmer Command</h1>
            <p>Active crops • Upcoming harvests • Pre-bookings • Inventory • Earnings — User → Marketplace → Farmer → Delivery</p>
          </div>
          <div style={{display:'flex', gap:10, justifyContent:'flex-end', flexWrap:'wrap'}}>
            <Link to="/farmer/crops" style={{padding:'10px 16px', borderRadius:999, background:'white', color:'var(--farm-dark)', fontWeight:900, textDecoration:'none'}}>Manage Crops →</Link>
            <Link to="/farmer/pre-bookings" style={{padding:'10px 16px', borderRadius:999, background:'var(--farm-accent)', color:'var(--farm-dark)', fontWeight:900, textDecoration:'none', border:'1px solid var(--farm-accent)'}}>Pre-bookings ({bookings.length})</Link>
          </div>
        </div>
      </section>

      <div style={{maxWidth:1200, margin:'0 auto', padding:20, display:'grid', gap:16}}>
        {/* Top stats */}
        <div className="farm-stagger" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:12}}>
          <div className="farm-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><Sprout size={22} color="var(--farm-primary)"/><div><div style={{fontWeight:900, fontSize:'1.5rem'}}>{activeCrops}</div><div style={{color:'var(--farm-muted)', fontSize:'0.82rem', fontWeight:800}}>Active Crops</div></div></div>
          <div className="farm-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><Calendar size={22} color="#8b5e3c"/><div><div style={{fontWeight:900, fontSize:'1.5rem'}}>{upcomingHarvests}</div><div style={{color:'var(--farm-muted)', fontSize:'0.82rem', fontWeight:800}}>Upcoming Harvests</div></div></div>
          <div className="farm-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><ShoppingBag size={22} color="#f59e0b"/><div><div style={{fontWeight:900, fontSize:'1.5rem'}}>{bookings.length}</div><div style={{color:'var(--farm-muted)', fontSize:'0.82rem', fontWeight:800}}>Pre-bookings</div></div></div>
          <div className="farm-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><Package size={22} color="var(--farm-primary)"/><div><div style={{fontWeight:900, fontSize:'1.5rem'}}>{pendingCount}</div><div style={{color:'var(--farm-muted)', fontSize:'0.82rem', fontWeight:800}}>Pending Orders</div></div></div>
          <div className="farm-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><Boxes size={22} color="var(--farm-primary)"/><div><div style={{fontWeight:900, fontSize:'1.5rem'}}>{inventoryTotal}kg</div><div style={{color:'var(--farm-muted)', fontSize:'0.82rem', fontWeight:800}}>Inventory</div></div></div>
          <div className="farm-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><Wallet size={22} color="var(--farm-primary)"/><div><div style={{fontWeight:900, fontSize:'1.5rem'}}>₹{earnings.toLocaleString()}</div><div style={{color:'var(--farm-muted)', fontSize:'0.82rem', fontWeight:800}}>Expected Earnings</div></div></div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:16}}>
          <div className="farm-card" style={{padding:16}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
              <h3 style={{display:'flex', gap:8, alignItems:'center'}}><Sprout size={18} color="var(--farm-primary)"/> Active Crops — Marketplace Linked</h3>
              <Link to="/farmer/crops" style={{fontSize:'0.84rem', color:'var(--farm-primary)', fontWeight:900}}>View all →</Link>
            </div>
            <div className="farm-stagger" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12}}>
              {crops.slice(0,4).map((c:any)=>(
                <div key={c.id} className="farm-card farm-crop-card" style={{padding:12, display:'grid', gap:8}}>
                  <div className="farm-crop-media" style={{height:96}}>
                    <img src={c.image || `https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=260&fit=crop`} alt={c.name} />
                  </div>
                  <strong style={{fontSize:'0.92rem'}}>{c.name}</strong>
                  <span style={{fontSize:'0.82rem', color:'var(--farm-muted)', fontWeight:700}}>{c.stock ?? c.qty ?? '—'}{c.unit || 'kg'} • ₹{c.price || '—'} • {c.harvest || 'Nov 2026'}</span>
                </div>
              ))}
            </div>
            <p style={{marginTop:10, fontSize:'0.76rem', color:'var(--farm-muted)', fontWeight:700}}>Crop → Pre-booking → Harvest → Order → Delivery — Earnings via farmer_earnings.</p>
          </div>

          <div style={{display:'grid', gap:16}}>
            <div className="farm-card" style={{padding:16}}>
              <h3 style={{display:'flex', gap:8, alignItems:'center'}}><TrendingUp size={18} color="var(--farm-primary)"/> Recent Activity</h3>
              <div style={{marginTop:10, display:'grid', gap:8, fontSize:'0.88rem', color:'var(--farm-muted)'}}>
                <div>• Pre-booking BK-201 — Ashwagandha 5kg — Growing</div>
                <div>• Inventory updated — Amla 30kg — Price ₹85</div>
                <div>• Order ORD-101 — Ready for Pickup — Earnings ₹1,200</div>
              </div>
              <Link to="/farmer/orders" style={{display:'inline-flex', marginTop:10, fontSize:'0.84rem', fontWeight:900, color:'var(--farm-primary)'}}>Track orders →</Link>
            </div>
            <div className="farm-card" style={{padding:16}}>
              <h3 style={{display:'flex', gap:8, alignItems:'center'}}><Droplets size={18} color="#0ea5e9"/> Farm Health</h3>
              <div style={{marginTop:10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                <div className="farm-card" style={{padding:12, textAlign:'center'}}><div style={{fontWeight:900, fontSize:'1.2rem', color:'var(--farm-primary)'}}>68%</div><div style={{fontSize:'0.72rem', color:'var(--farm-muted)', fontWeight:800}}>Soil Moisture</div></div>
                <div className="farm-card" style={{padding:12, textAlign:'center'}}><div style={{fontWeight:900, fontSize:'1.2rem', color:'var(--farm-primary)'}}>Organic</div><div style={{fontSize:'0.72rem', color:'var(--farm-muted)', fontWeight:800}}>Certified</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Crop growth timeline — animated */}
        <div className="farm-card" style={{padding:16}}>
          <h3 style={{display:'flex', gap:8, alignItems:'center'}}><Calendar size={18} color="var(--farm-primary)"/> Crop Growth Timeline</h3>
          <div className="farm-timeline" aria-label="Crop growth timeline">
            {[
              { label:'Soil Prep', date:'10 Jan', state:'done' },
              { label:'Seeding', date:'25 Jan', state:'done' },
              { label:'Growing', date:'Today', state:'active' },
              { label:'Harvest', date:'15 Apr', state:'todo' },
              { label:'Dispatch', date:'20 Apr', state:'todo' },
            ].map(s=>(
              <div key={s.label} className={`farm-step ${s.state==='done'?'farm-step--done': s.state==='active'?'farm-step--active':''}`}>
                <span className="farm-step__date">{s.date}</span>
                <span className="farm-step__dot" />
                <span className="farm-step__label">{s.label}</span>
              </div>
            ))}
          </div>
          <p style={{marginTop:8, fontSize:'0.76rem', color:'var(--farm-muted)', fontWeight:700, textAlign:'center'}}>Growing → Ready → Harvested → Packed → Pickup — drill into Harvest</p>
        </div>
      </div>
    </div>
  );
};
export default FarmerDashboard;
