import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, Search, History } from 'lucide-react';
import { fetchOrders } from '../../services/delivery.service';
import { getAuthToken } from '../../services/client';
import '../../styles/delivery.css';

const DeliveryHistory: React.FC = () => {
  const [orders, setOrders]=useState<any[]>([]);
  const [filter, setFilter]=useState<'All'|'Delivered'|'Cancelled'|'Failed'>('All');
  const [q, setQ]=useState('');
  const [loading, setLoading]=useState(true);

  useEffect(()=>{
    if(!getAuthToken()){
      setOrders([
        { id:'DL-H01', orderId:'ORD-390', customer:'Kavita R.', destination:'HSR Layout', status:'Delivered', date:'2026-03-10', earnings:150 },
        { id:'DL-H02', orderId:'ORD-391', customer:'Vikram J.', destination:'Whitefield', status:'Delivered', date:'2026-03-09', earnings:150 },
        { id:'DL-H03', orderId:'ORD-392', customer:'Neha P.', destination:'Jayanagar', status:'Cancelled', date:'2026-03-08', earnings:0 },
      ]);
      setLoading(false); return;
    }
    fetchOrders().then(res=>{
      const hist = res.orders.filter((o:any)=>['Delivered','Cancelled'].includes(o.status)).map((o:any)=>({
        id:o.id, orderId:o.orderId, customer:o.customer, destination:o.address, status: o.status==='Delivered'?'Delivered':'Cancelled', date:(o.createdAt||'2026-03-10').slice(0,10), earnings: o.status==='Delivered'?150:0
      }));
      if(hist.length) setOrders(hist);
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const filtered=orders.filter(o=>{
    const mF = filter==='All' || (filter==='Failed' ? o.status==='Failed' : o.status===filter);
    const mQ = !q || o.orderId.toLowerCase().includes(q.toLowerCase()) || o.customer.toLowerCase().includes(q.toLowerCase());
    return mF && mQ;
  });

  return (
    <div>
      <section className="del-hero">
        <div className="del-hero__inner">
          <div>
            <h1>History</h1>
            <p>Completed • Cancelled • Failed • Date • Order • Earnings</p>
          </div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20, display:'grid', gap:14}}>
        <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
          <div style={{flex:1, minWidth:220, position:'relative'}}>
            <Search size={16} style={{position:'absolute', left:12, top:14, color:'var(--del-muted)'}}/>
            <input aria-label="Search history" placeholder="Search order, customer" value={q} onChange={e=>setQ(e.target.value)} style={{width:'100%', padding:'12px 14px 12px 36px', borderRadius:14, border:'1px solid var(--del-border)'}}/>
          </div>
          {(['All','Delivered','Cancelled','Failed'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{minHeight:44, padding:'10px 14px', borderRadius:999, border:'1px solid var(--del-border)', background: filter===f?'var(--del-primary)':'white', color:filter===f?'white':'var(--del-muted)', fontWeight:900, fontSize:'0.84rem'}}>{f}</button>
          ))}
        </div>

        <div style={{display:'flex', gap:8, alignItems:'center', fontSize:'0.80rem', color:'var(--del-muted)', fontWeight:800}}><History size={14}/>{filtered.length} records • Earnings only on delivered</div>

        {loading ? <p style={{textAlign:'center', padding:30}}>Loading history…</p> : filtered.length===0 ? (
          <div className="del-card" style={{padding:40, textAlign:'center'}}><History size={40} color="var(--del-muted)"/><p style={{marginTop:10, color:'var(--del-muted)', fontWeight:800}}>No records for filter</p></div>
        ) : (
          <div style={{display:'grid', gap:10}}>
            {filtered.map(o=>(
              <div key={o.id} className="del-card" style={{padding:14, display:'flex', justifyContent:'space-between', alignItems:'center', gap:10, flexWrap:'wrap'}}>
                <div>
                  <strong style={{display:'flex', gap:8, alignItems:'center'}}>{o.orderId} • {o.customer} <span style={{color:'var(--del-muted)', fontWeight:700, fontSize:'0.84rem'}}>• {o.destination}</span></strong>
                  <span style={{fontSize:'0.82rem', color:'var(--del-muted)', display:'inline-flex', gap:6, alignItems:'center'}}><Clock size={12}/>{o.date} • ₹{o.earnings} • {o.id}</span>
                </div>
                <span className={`del-badge ${o.status==='Delivered'?'del-badge--success': o.status==='Cancelled'?'del-badge--danger':'del-badge--warning'}`}>
                  {o.status==='Delivered'?<CheckCircle size={12} style={{display:'inline', marginRight:4}}/>: o.status==='Cancelled'?<XCircle size={12} style={{display:'inline', marginRight:4}}/>:<AlertTriangle size={12} style={{display:'inline', marginRight:4}}/>}{o.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default DeliveryHistory;
