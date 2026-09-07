import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, ShoppingBag, Store, Truck, Cpu, Filter, Calendar } from 'lucide-react';
import '../../styles/admin.css';

const AdminReports: React.FC = () => {
  const [range, setRange]=useState('Last 30 days');
  const [segment, setSegment]=useState('All');

  const userGrowth=[12,18,15,22,19,26,24,30,28,32,29,34];
  const ordersSeries=[8,12,9,14,11,18,15,20,17,22,19,25];
  const maxU=Math.max(...userGrowth, ...ordersSeries, 1);

  const cards=[
    { label:'User analytics', value:'1,284', icon:Users, sub:'+4.2% vs prior' },
    { label:'Order analytics', value:'312', icon:ShoppingBag, sub:'18 pending' },
    { label:'Marketplace', value:'86 products', icon:Store, sub:'3 flagged' },
    { label:'Delivery', value:'36 partners', icon:Truck, sub:'92% on-time' },
    { label:'AI analytics', value:'1,240', icon:Cpu, sub:'92% success' },
    { label:'Platform activity', value:'2.1k events', icon:BarChart3, sub:'audit + activity' },
  ];

  return (
    <div>
      <section className="admin-hero"><div className="admin-hero__inner"><div><h1>Reports</h1><p>User • Order • Marketplace • Delivery • Platform • AI — charts + filters</p></div><span className="admin-badge" style={{background:'white', color:'var(--admin-dark)', borderColor:'white'}}><BarChart3 size={14}/> Analytics</span></div></section>
      <div style={{maxWidth:1280, margin:'0 auto', padding:20, display:'grid', gap:14}}>
        <div className="admin-card" style={{padding:12, display:'flex', gap:10, flexWrap:'wrap', alignItems:'center'}}>
          <Filter size={16} color="var(--admin-muted)"/>
          <select value={range} onChange={e=>setRange(e.target.value)} className="admin-input"><option>Last 7 days</option><option>Last 30 days</option><option>Last 90 days</option></select>
          <select value={segment} onChange={e=>setSegment(e.target.value)} className="admin-input"><option>All</option><option>User</option><option>Doctor</option><option>Farmer</option><option>Delivery</option></select>
          <span className="admin-badge admin-badge--neutral"><Calendar size={12}/>{range} • {segment}</span>
          <span style={{marginLeft:'auto', fontSize:'0.78rem', color:'var(--admin-muted)', fontWeight:700}}>Charts are sampled — wire to analytics:3011 /analytics/admin/overview</span>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12}}>
          {cards.map(c=>(
            <div key={c.label} className="admin-card" style={{padding:14}}>
              <div style={{display:'flex', gap:8, alignItems:'center', color:'var(--admin-muted)', fontSize:'0.72rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em'}}><c.icon size={14}/>{c.label}</div>
              <div style={{fontWeight:900, fontSize:'1.35rem', marginTop:6, color:'var(--admin-dark)'}}>{c.value}</div>
              <div style={{fontSize:'0.78rem', color:'var(--admin-muted)', marginTop:4}}>{c.sub}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:14}}>
          <div className="admin-card">
            <div className="admin-card__header"><span className="admin-card__title"><TrendingUp size={16}/> User & Order Trends</span><span className="admin-badge admin-badge--neutral">{range}</span></div>
            <div className="admin-card__body">
              <div style={{display:'flex', gap:12, alignItems:'end', height:160, padding:10, borderRadius:12, background:'#fdfcf8', border:'1px solid var(--admin-border-soft)'}} aria-label="User and order chart">
                {userGrowth.map((v,i)=>(
                  <div key={i} style={{flex:1, display:'grid', gap:4, justifyItems:'center'}}>
                    <div style={{width:'100%', display:'grid', gap:3}}>
                      <div style={{height: `${Math.max(6, (ordersSeries[i]/maxU)*100)}%`, minHeight:6, background:'#a7c957', borderRadius:6, opacity:0.95}} title={`Orders ${ordersSeries[i]}`}/>
                      <div style={{height: `${Math.max(6, (v/maxU)*100)}%`, minHeight:6, background:'var(--admin-primary)', borderRadius:6}} title={`Users ${v}`}/>
                    </div>
                    <span style={{fontSize:'0.60rem', fontWeight:800, color:'var(--admin-muted)'}}>W{i+1}</span>
                  </div>
                ))}
              </div>
              <div style={{display:'flex', gap:12, marginTop:10, fontSize:'0.76rem', fontWeight:800}}><span style={{display:'inline-flex', gap:6, alignItems:'center'}}><span style={{width:10, height:10, borderRadius:3, background:'var(--admin-primary)'}}/> Users</span><span style={{display:'inline-flex', gap:6, alignItems:'center'}}><span style={{width:10, height:10, borderRadius:3, background:'#a7c957'}}/> Orders</span></div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card__header"><span className="admin-card__title"><Store size={16}/> Marketplace & Delivery</span></div>
            <div className="admin-card__body" style={{display:'grid', gap:10}}>
              <div style={{display:'grid', gap:6}}>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.84rem', fontWeight:800}}><span>Marketplace occupancy</span><span>72%</span></div>
                <div className="admin-health admin-health--ok"><div className="admin-health__fill" style={{width:'72%'}}/></div>
              </div>
              <div style={{display:'grid', gap:6}}>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.84rem', fontWeight:800}}><span>Delivery on-time</span><span>92%</span></div>
                <div className="admin-health admin-health--ok"><div className="admin-health__fill" style={{width:'92%'}}/></div>
              </div>
              <div style={{display:'grid', gap:6}}>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.84rem', fontWeight:800}}><span>AI success</span><span>92%</span></div>
                <div className="admin-health admin-health--ok"><div className="admin-health__fill" style={{width:'92%'}}/></div>
              </div>
              <p style={{fontSize:'0.78rem', color:'var(--admin-muted)'}}>Platform activity from `audit_logs` + `activity_events` — sampled charts until analytics wiring.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminReports;
