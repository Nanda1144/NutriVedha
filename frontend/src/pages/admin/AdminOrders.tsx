import React, { useState } from 'react';
import { ShoppingBag, Search, CreditCard, Truck, AlertTriangle, CheckCircle, Eye, XCircle } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import '../../styles/admin.css';

type ORow = { id:string; customer:string; amount:number; payment:'Paid'|'Pending'|'Failed'; fulfillment:'Pending'|'Packed'|'Shipped'; delivery:'Pending'|'In Transit'|'Delivered'; dispute?:string; status:'Active'|'Cancelled'|'Completed'|'Disputed' };

const AdminOrders: React.FC = () => {
  const { addAuditLog } = useUserStore();
  const [rows, setRows]=useState<ORow[]>([
    { id:'ORD-401', customer:'Rahul K.', amount:2100, payment:'Paid', fulfillment:'Packed', delivery:'In Transit', status:'Active' },
    { id:'ORD-402', customer:'Meera S.', amount:255, payment:'Pending', fulfillment:'Pending', delivery:'Pending', status:'Active' },
    { id:'ORD-403', customer:'Aarav P.', amount:1400, payment:'Failed', fulfillment:'Pending', delivery:'Pending', status:'Disputed', dispute:'Payment failed — user claims charged' },
    { id:'ORD-390', customer:'Kavita R.', amount:600, payment:'Paid', fulfillment:'Shipped', delivery:'Delivered', status:'Completed' },
  ]);
  const [q, setQ]=useState('');
  const [filter, setFilter]=useState<'All'|'Active'|'Completed'|'Cancelled'|'Disputed'>('All');
  const [confirm, setConfirm]=useState<ORow|null>(null);
  const [success, setSuccess]=useState<string|null>(null);

  const filtered=rows.filter(r=>{
    const mQ=!q || r.id.toLowerCase().includes(q.toLowerCase()) || r.customer.toLowerCase().includes(q.toLowerCase());
    const mF=filter==='All' || r.status===filter;
    return mQ && mF;
  });
  const handleCancel=()=>{
    if(!confirm) return;
    setRows(prev=>prev.map(r=>r.id===confirm.id? {...r, status:'Cancelled', payment: r.payment==='Paid'? 'Paid':'Pending'}:r));
    addAuditLog({ accessor:'Admin', role:'Admin', action:`Cancelled order ${confirm.id}`, status:'Success'});
    setSuccess(`${confirm.id} cancelled`); setTimeout(()=>setSuccess(null),2500); setConfirm(null);
  };

  return (
    <div>
      <section className="admin-hero"><div className="admin-hero__inner"><div><h1>Orders</h1><p>All orders • Payment • Fulfillment • Delivery • Cancellation • Disputes — monitor</p></div><span className="admin-badge" style={{background:'white', color:'var(--admin-dark)', borderColor:'white'}}><ShoppingBag size={14}/>{rows.length} orders</span></div></section>
      <div style={{maxWidth:1280, margin:'0 auto', padding:20, display:'grid', gap:14}}>
        {success && <div className="admin-card" style={{padding:12, borderLeft:'3px solid #16a34a', background:'#ecfdf5', display:'flex', gap:8}}><CheckCircle size={16} color="#16a34a"/><span style={{fontSize:'0.88rem'}}>{success}</span></div>}
        <div className="admin-card" style={{padding:12, display:'flex', gap:10, flexWrap:'wrap'}}>
          <div style={{flex:1, minWidth:220, position:'relative'}}><Search size={16} style={{position:'absolute', left:12, top:12, color:'var(--admin-muted)'}}/><input placeholder="Search order or customer" value={q} onChange={e=>setQ(e.target.value)} className="admin-input" style={{width:'100%', paddingLeft:36}}/></div>
          {(['All','Active','Completed','Cancelled','Disputed'] as const).map(f=> <button key={f} onClick={()=>setFilter(f)} className="admin-btn" style={{background: filter===f?'var(--admin-primary)':'white', color:filter===f?'white':'var(--admin-muted)', borderColor:'var(--admin-border-soft)'}}>{f}</button>)}
        </div>
        <div className="admin-card" style={{overflow:'hidden'}}><div style={{overflowX:'auto'}}><table className="admin-table admin-table-responsive" aria-label="Orders">
          <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Fulfillment</th><th>Delivery</th><th>Status</th><th style={{textAlign:'right'}}>Actions</th></tr></thead>
          <tbody>
            {filtered.map(r=>(
              <tr key={r.id}><td data-label="Order"><strong>{r.id}</strong>{r.dispute && <span style={{display:'inline-flex', marginLeft:6}} className="admin-badge admin-badge--danger"><AlertTriangle size={12}/> Dispute</span>}</td><td data-label="Customer">{r.customer}</td><td data-label="Amount" style={{fontWeight:800}}>₹{r.amount}</td><td data-label="Payment"><span className={`admin-badge ${r.payment==='Paid'?'admin-badge--success': r.payment==='Failed'?'admin-badge--danger':'admin-badge--warning'}`}>{r.payment==='Paid'?<CreditCard size={12} style={{display:'inline', marginRight:4}}/>:null}{r.payment}</span></td><td data-label="Fulfillment"><span className="admin-badge admin-badge--neutral">{r.fulfillment}</span></td><td data-label="Delivery"><span className="admin-badge admin-badge--info"><Truck size={12} style={{display:'inline', marginRight:4}}/>{r.delivery}</span></td><td data-label="Status"><span className={`admin-badge ${r.status==='Completed'?'admin-badge--success': r.status==='Cancelled'?'admin-badge--slate': r.status==='Disputed'?'admin-badge--danger':'admin-badge--warning'}`}>{r.status}</span></td><td data-label="Actions" style={{textAlign:'right'}}><div style={{display:'flex', gap:6, justifyContent:'flex-end'}}><button className="admin-btn admin-btn--outline" style={{minHeight:36, padding:'6px 10px'}}><Eye size={14}/> View</button>{r.status==='Active' && <button onClick={()=>setConfirm(r)} className="admin-btn admin-btn--danger" style={{minHeight:36, padding:'6px 10px'}}><XCircle size={14}/> Cancel</button>}</div></td></tr>
            ))}
          </tbody>
        </table></div></div>
        {confirm && <div className="admin-modal-overlay" onClick={()=>setConfirm(null)}><div className="admin-modal" onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true"><div className="admin-modal__header"><h3 style={{display:'flex', gap:8, alignItems:'center'}}><AlertTriangle size={18} color="#dc2626"/>Cancel order</h3><button onClick={()=>setConfirm(null)} style={{padding:6, borderRadius:8, border:'1px solid var(--admin-border-soft)', background:'white'}}>✕</button></div><div className="admin-modal__body"><p style={{color:'var(--admin-muted)'}}>Cancel <strong>{confirm.id}</strong> • {confirm.customer} • ₹{confirm.amount} • Payment {confirm.payment}. This will set status Cancelled and is audited. Customer will be notified.</p><div style={{padding:12, borderRadius:12, background:'#fef2f2', border:'1px solid #fecaca', fontSize:'0.84rem', color:'#991b1b', fontWeight:700}}>Destructive: Order cancellation.</div></div><div className="admin-modal__footer"><button onClick={()=>setConfirm(null)} className="admin-btn admin-btn--outline">Keep order</button><button onClick={handleCancel} className="admin-btn admin-btn--danger" style={{background:'#dc2626', color:'white', borderColor:'#dc2626'}}>Confirm cancel</button></div></div></div>}
      </div>
    </div>
  );
};
export default AdminOrders;
