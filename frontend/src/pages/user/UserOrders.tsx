import React, { useState } from 'react';
import { Package, Truck, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import '../../styles/user.css';

const UserOrders: React.FC = () => {
  const { cropBookings } = useUserStore();
  const [tab, setTab] = useState<'active'|'history'>('active');

  const active = cropBookings.filter((b:any)=> b.status !== 'Delivered' && b.status !== 'Cancelled');
  const history = cropBookings.filter((b:any)=> b.status === 'Delivered' || b.status === 'Cancelled');
  const list = tab==='active'? active: history;

  return (
    <div>
      <section className="user-hero">
        <div className="user-hero__inner">
          <div>
            <h1>Orders</h1>
            <p>Active orders • Order history • Details • Status • Farmer • Delivery • Cancellation.</p>
          </div>
          <img src="/hero.png" alt="Orders" className="user-hero__img" />
        </div>
      </section>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:20 }}>
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          <button onClick={()=>setTab('active')} style={{ padding:'10px 16px', borderRadius:30, background: tab==='active'?'var(--user-primary)':'white', color: tab==='active'?'white':'var(--user-muted)', border:'1px solid #e8ecec', fontWeight:800 }}>Active ({active.length})</button>
          <button onClick={()=>setTab('history')} style={{ padding:'10px 16px', borderRadius:30, background: tab==='history'?'var(--user-primary)':'white', color: tab==='history'?'white':'var(--user-muted)', border:'1px solid #e8ecec', fontWeight:800 }}>History ({history.length})</button>
        </div>

        {list.length===0 ? (
          <div className="user-card" style={{ padding:40, textAlign:'center' }}>
            <Package size={40} color="var(--user-primary)" />
            <p style={{ marginTop:12, fontWeight:700 }}>No {tab} orders.</p>
            <p style={{ color:'var(--user-muted)' }}>{tab==='active' ? 'Pre-book from Marketplace to see active orders.' : 'Completed orders will appear here.'}</p>
          </div>
        ) : (
          <div style={{ display:'grid', gap:12 }}>
            {list.map((o:any)=>(
              <div key={o.id} className="user-card" style={{ padding:16, display:'grid', gap:12 }}>
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                  <img src={o.crop.image} alt={o.crop.name} style={{ width:64, height:64, borderRadius:30, objectFit:'cover', border:'1px solid #e8ecec' }} />
                  <div style={{ flex:1 }}>
                    <strong>{o.crop.name} • {o.quantity}kg</strong>
                    <p style={{ color:'var(--user-muted)', fontSize:'0.85rem' }}>{o.orderDate} • ₹{o.totalPrice} • Farmer: {o.crop.farmer?.name}</p>
                  </div>
                  <span style={{ padding:'6px 12px', borderRadius:30, background: o.status==='Delivered'?'#ecfdf5': o.status==='Cancelled'?'#fef2f2':'var(--user-accent-soft)', color: o.status==='Delivered'?'#065f46': o.status==='Cancelled'?'#991b1b':'var(--user-primary-dark)', fontWeight:800, fontSize:'0.8rem', display:'flex', gap:6, alignItems:'center' }}>
                    {o.status==='Delivered'?<CheckCircle size={14}/>: o.status==='Cancelled'?<XCircle size={14}/>:<Clock size={14}/>} {o.status}
                  </span>
                </div>
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  {['Growing','Harvested','Packed','Out for Delivery','Delivered'].map((s,i,arr)=>(
                    <span key={s} style={{ flex:1, height:4, borderRadius:30, background: arr.indexOf(o.status) >= i ? 'var(--user-primary)' : '#e8ecec' }} />
                  ))}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'0.85rem', color:'var(--user-muted)' }}>
                  <span style={{ display:'flex', gap:6, alignItems:'center' }}><Truck size={14} /> Delivery: {o.status==='Delivered'?'Delivered by verified partner':'In transit • ETA 2 days'}</span>
                  {tab==='active' && <button onClick={()=>{ if(confirm('Cancel this order?')){ const s=useUserStore.getState() as any; s.cropBookings = s.cropBookings.map((b:any)=>b.id===o.id? {...b,status:'Cancelled'}:b); useUserStore.setState({cropBookings: s.cropBookings}); } }} style={{ padding:'6px 12px', borderRadius:30, border:'1px solid #fecaca', color:'#991b1b', background:'white', fontWeight:700 }}>Cancel</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default UserOrders;
