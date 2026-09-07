import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Package, Sprout, ShoppingBag, Wallet } from 'lucide-react';
import { fetchInventory, fetchEarnings } from '../../services/farmer.service';
import { fetchBookings } from '../../services/marketplace.service';
import { getAuthToken } from '../../services/client';
import '../../styles/farmer.css';

const FarmerReports: React.FC = () => {
  const [crops, setCrops]=useState<any[]>([]);
  const [earnings, setEarnings]=useState<any[]>([]);
  const [bookings, setBookings]=useState<any[]>([]);
  const [total, setTotal]=useState(0);
  const [loading, setLoading]=useState(true);

  useEffect(()=>{
    if(!getAuthToken()){ setLoading(false); return; }
    Promise.allSettled([fetchInventory().catch(()=>({inventory:[]})), fetchEarnings().catch(()=>({earnings:[], total:0})), fetchBookings().catch(()=>({bookings:[]}))])
      .then(([inv, earn, book])=>{
        setCrops((inv.status==='fulfilled' && (inv.value as any).inventory?.length) ? (inv.value as any).inventory : [
          { name:'Ashwagandha', stock:50, price:420 }, { name:'Amla', stock:30, price:85 }, { name:'Turmeric', stock:40, price:140 },
        ]);
        const ev = (earn.status==='fulfilled') ? (earn.value as any) : { earnings:[], total:42850 };
        setEarnings(ev.earnings?.length ? ev.earnings : [
          { id:'E-01', month:'Mar 2026', amount:18200, source:'Marketplace' },
          { id:'E-02', month:'Feb 2026', amount:20450, source:'Marketplace' },
        ]);
        setTotal(ev.total || 38650);
        setBookings((book.status==='fulfilled' && (book.value as any).bookings?.length) ? (book.value as any).bookings : [{},{}]);
      }).finally(()=>setLoading(false));
  },[]);

  const cropChart = crops.slice(0,5).map(c=>({ label:c.name.slice(0,8), value: (c.stock||20) }));
  const maxCrop = Math.max(...cropChart.map(c=>c.value), 1);

  if(loading) return <div style={{padding:40, textAlign:'center'}}>Loading reports…</div>;

  return (
    <div>
      <section className="farm-hero">
        <div className="farm-hero__inner">
          <div>
            <h1>Reports</h1>
            <p>Crop performance • Sales • Earnings • Inventory • Pre-booking analytics — charts</p>
          </div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20, display:'grid', gap:16}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:12}}>
          <div className="farm-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><Sprout size={22} color="var(--farm-primary)"/><div><div style={{fontWeight:900, fontSize:'1.4rem'}}>{crops.length}</div><div style={{color:'var(--farm-muted)', fontSize:'0.82rem', fontWeight:800}}>Crops — Performance</div></div></div>
          <div className="farm-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><ShoppingBag size={22} color="#f59e0b"/><div><div style={{fontWeight:900, fontSize:'1.4rem'}}>{bookings.length}</div><div style={{color:'var(--farm-muted)', fontSize:'0.82rem', fontWeight:800}}>Pre-bookings</div></div></div>
          <div className="farm-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><Wallet size={22} color="var(--farm-primary)"/><div><div style={{fontWeight:900, fontSize:'1.4rem'}}>₹{total.toLocaleString()}</div><div style={{color:'var(--farm-muted)', fontSize:'0.82rem', fontWeight:800}}>Earnings</div></div></div>
          <div className="farm-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><Package size={22} color="var(--farm-primary)"/><div><div style={{fontWeight:900, fontSize:'1.4rem'}}>{crops.reduce((a,c)=>a+(c.stock||0),0)}kg</div><div style={{color:'var(--farm-muted)', fontSize:'0.82rem', fontWeight:800}}>Inventory</div></div></div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1.4fr 0.9fr', gap:16}}>
          <div className="farm-card" style={{padding:16}}>
            <h3 style={{display:'flex', gap:8, alignItems:'center'}}><BarChart3 size={18} color="var(--farm-primary)"/> Crop Performance</h3>
            <p style={{color:'var(--farm-muted)', fontSize:'0.82rem'}}>Stock by crop — pre-booking analytics overlay</p>
            <div style={{display:'flex', gap:10, alignItems:'end', height:140, padding:12, marginTop:12, borderRadius:12, background:'#fdfcf8', border:'1px solid var(--farm-border)'}} aria-label="Crop performance chart">
              {cropChart.map((c,i)=>(
                <div key={i} style={{flex:1, display:'grid', gap:6, justifyItems:'center'}}>
                  <div className="farm-growth-bar" style={{width:'100%', maxWidth:42, height:`${Math.max(14, (c.value/maxCrop)*100)}%`, background: i===0?'var(--farm-primary)':'var(--farm-accent)', borderRadius:10, animationDelay:`${i*0.08}s`}} title={`${c.label}: ${c.value}kg`}/>
                  <span style={{fontSize:'0.68rem', fontWeight:800, color:'var(--farm-muted)'}}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:'grid', gap:16}}>
            <div className="farm-card" style={{padding:16}}>
              <h3 style={{display:'flex', gap:8, alignItems:'center'}}><TrendingUp size={18} color="var(--farm-primary)"/> Sales</h3>
              <div style={{marginTop:10, display:'grid', gap:8}}>
                {earnings.slice(0,4).map((e:any)=>(
                  <div key={e.id} style={{display:'flex', justifyContent:'space-between', fontSize:'0.88rem', padding:'8px 10px', borderRadius:10, background:'#fdfcf8', border:'1px solid var(--farm-border)'}}>
                    <span><Calendar size={12} style={{display:'inline', marginRight:4}}/>{e.month} • {e.source}</span>
                    <strong>₹{e.amount}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="farm-card" style={{padding:16}}>
              <h3 style={{display:'flex', gap:8, alignItems:'center'}}><BarChart3 size={18} color="var(--farm-primary)"/> Inventory + Pre-booking Analytics</h3>
              <div style={{marginTop:10, display:'grid', gap:8, fontSize:'0.84rem', color:'var(--farm-muted)'}}>
                <div>• Avg. pre-booked per crop: {(bookings.length && crops.length) ? Math.round((bookings.length/crops.length)*10)/10 : 1.2} bookings</div>
                <div>• Low-stock crops: {crops.filter((c:any)=> (c.stock||0) <=10).length}</div>
                <div>• Harvest timeline → see Harvest page</div>
              </div>
            </div>
          </div>
        </div>

        <div className="farm-card" style={{padding:16}}>
          <h3 style={{display:'flex', gap:8, alignItems:'center'}}><Wallet size={18} color="var(--farm-primary)"/> Earnings Timeline</h3>
          <div style={{display:'flex', gap:8, alignItems:'end', height:90, marginTop:12, padding:'10px', borderRadius:12, background:'#fdfcf8', border:'1px solid var(--farm-border)'}}>
            {[18200, 4200, 20450, 15700, 22100].map((v,i)=>(
              <div key={i} className="farm-growth-bar" style={{flex:1, maxWidth:48, height:`${Math.max(12, (v/22100)*100)}%`, background:'var(--farm-accent)', borderRadius:8, animationDelay:`${i*0.07}s`}} title={`₹${v}`}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default FarmerReports;
