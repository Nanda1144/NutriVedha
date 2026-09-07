import React, { useEffect, useState } from 'react';
import { Wallet, Clock, CheckCircle, TrendingUp, Package, Calendar, Search, Download } from 'lucide-react';
import { fetchOrders } from '../../services/delivery.service';
import { getAuthToken } from '../../services/client';
import '../../styles/delivery.css';

const DeliveryEarnings: React.FC = () => {
  const [orders, setOrders]=useState<any[]>([]);
  const [q, setQ]=useState('');
  const [filter, setFilter]=useState<'All'|'Paid'|'Pending'>('All');
  const [loading, setLoading]=useState(true);

  useEffect(()=>{
    if(!getAuthToken()){
      setOrders([
        { orderId:'ORD-402', date:'2026-03-10', amount:150, status:'Paid' },
        { orderId:'ORD-403', date:'2026-03-09', amount:150, status:'Paid' },
        { orderId:'ORD-401', date:'2026-03-12', amount:150, status:'Pending' },
      ]);
      setLoading(false); return;
    }
    fetchOrders().then(res=>{
      const earn = res.orders.filter((o:any)=>['Delivered','Out for Delivery'].includes(o.status)).map((o:any)=>({
        orderId:o.orderId, date:(o.createdAt||'2026-03-10').slice(0,10), amount:150, status: o.status==='Delivered'?'Paid':'Pending'
      }));
      if(earn.length) setOrders(earn);
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const paid = orders.filter(o=>o.status==='Paid').reduce((a,c)=>a+c.amount,0);
  const pending = orders.filter(o=>o.status==='Pending').reduce((a,c)=>a+c.amount,0);
  const total = paid + pending;
  const completed = orders.filter(o=>o.status==='Paid').length;

  const filtered=orders.filter(o=>{
    const mF = filter==='All' || o.status===filter;
    const mQ = !q || o.orderId.toLowerCase().includes(q.toLowerCase());
    return mF && mQ;
  });

  const handleExport=()=>{
    const blob=new Blob([JSON.stringify({ orders, total, paid, pending, exportedAt:new Date().toISOString() }, null, 2)], {type:'application/json'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`delivery-earnings-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div>
      <section className="del-hero">
        <div className="del-hero__inner">
          <div>
            <h1>Earnings</h1>
            <p>Daily • Weekly • Completed deliveries • Pending payout • History</p>
          </div>
          <div style={{textAlign:'right'}}><span className="del-badge" style={{background:'white', color:'var(--del-dark)', borderColor:'white', padding:'8px 14px', fontSize:'0.9rem'}}><Wallet size={14}/> ₹{total} total</span></div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20, display:'grid', gap:16}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12}}>
          <div className="del-card" style={{padding:16, display:'grid', gap:6, textAlign:'center'}}><Wallet size={22} color="var(--del-primary)" style={{justifySelf:'center'}}/><div style={{fontWeight:900, fontSize:'1.4rem'}}>₹{paid}</div><div style={{color:'var(--del-muted)', fontSize:'0.80rem', fontWeight:800}}>Paid (daily)</div></div>
          <div className="del-card" style={{padding:16, display:'grid', gap:6, textAlign:'center'}}><Clock size={22} color="#f59e0b" style={{justifySelf:'center'}}/><div style={{fontWeight:900, fontSize:'1.4rem'}}>₹{pending}</div><div style={{color:'var(--del-muted)', fontSize:'0.80rem', fontWeight:800}}>Pending payout</div></div>
          <div className="del-card" style={{padding:16, display:'grid', gap:6, textAlign:'center'}}><Package size={22} color="var(--del-primary)" style={{justifySelf:'center'}}/><div style={{fontWeight:900, fontSize:'1.4rem'}}>{completed}</div><div style={{color:'var(--del-muted)', fontSize:'0.80rem', fontWeight:800}}>Completed deliveries</div></div>
          <div className="del-card" style={{padding:16, display:'grid', gap:6, textAlign:'center'}}><TrendingUp size={22} color="var(--del-primary)" style={{justifySelf:'center'}}/><div style={{fontWeight:900, fontSize:'1.4rem'}}>₹{total}</div><div style={{color:'var(--del-muted)', fontSize:'0.80rem', fontWeight:800}}>Weekly (est.)</div></div>
        </div>

        <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
          <div style={{flex:1, minWidth:200, position:'relative'}}>
            <Search size={16} style={{position:'absolute', left:12, top:14, color:'var(--del-muted)'}}/>
            <input placeholder="Search order ID" value={q} onChange={e=>setQ(e.target.value)} style={{width:'100%', padding:'12px 14px 12px 36px', borderRadius:14, border:'1px solid var(--del-border)'}}/>
          </div>
          {(['All','Paid','Pending'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{minHeight:44, padding:'10px 14px', borderRadius:999, border:'1px solid var(--del-border)', background: filter===f?'var(--del-primary)':'white', color:filter===f?'white':'var(--del-muted)', fontWeight:900, fontSize:'0.84rem'}}>{f}</button>
          ))}
          <button onClick={handleExport} className="del-btn del-btn--outline"><Download size={16}/> Export</button>
        </div>

        {loading ? <p style={{textAlign:'center', padding:30}}>Loading earnings…</p> : filtered.length===0 ? (
          <div className="del-card" style={{padding:40, textAlign:'center'}}><Calendar size={40} color="var(--del-muted)"/><p style={{marginTop:10, color:'var(--del-muted)', fontWeight:800}}>No earnings for filter</p></div>
        ) : (
          <div className="del-card" style={{overflow:'hidden'}}>
            {/* Mobile card list, desktop table-like */}
            <div style={{display:'grid', gap:0}}>
              <div style={{display:'grid', gridTemplateColumns:'1.2fr 0.8fr 0.6fr', gap:10, padding:'12px 14px', fontSize:'0.72rem', fontWeight:800, color:'var(--del-muted)', textTransform:'uppercase', letterSpacing:'0.06em', borderBottom:'1px solid var(--del-border)'}}>
                <span>Order • Date</span><span>Amount</span><span>Status</span>
              </div>
              {filtered.map(o=>(
                <div key={o.orderId} style={{display:'grid', gridTemplateColumns:'1.2fr 0.8fr 0.6fr', gap:10, padding:'14px', borderBottom:'1px solid #f0f0ea', alignItems:'center'}}>
                  <div><div style={{fontWeight:800}}>{o.orderId}</div><div style={{fontSize:'0.82rem', color:'var(--del-muted)', display:'inline-flex', gap:4}}><Calendar size={12}/>{o.date}</div></div>
                  <div style={{fontWeight:900}}>₹{o.amount}</div>
                  <span className={`del-badge ${o.status==='Paid'?'del-badge--success':'del-badge--warning'}`}>{o.status==='Paid'?<CheckCircle size={12} style={{display:'inline', marginRight:4}}/>:<Clock size={12} style={{display:'inline', marginRight:4}}/>}{o.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default DeliveryEarnings;
