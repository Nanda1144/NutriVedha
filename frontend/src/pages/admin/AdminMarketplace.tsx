import React, { useState } from 'react';
import { Store, Search, Eye, AlertTriangle, CheckCircle, Package, Flag, ShieldCheck } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import '../../styles/admin.css';

type MRow = { id:string; name:string; farmer:string; category:string; price:number; status:'Available'|'Reported'|'Out of stock'; report?:string };

const AdminMarketplace: React.FC = () => {
  const { addAuditLog, addAdminAction, adminKeyMember } = useUserStore();
  const [rows, setRows]=useState<MRow[]>([
    { id:'CR-101', name:'Organic Amla 1kg', farmer:'Ram Singh • Green Valley', category:'Ayurvedic Grade', price:85, status:'Available' },
    { id:'CR-102', name:'Turmeric Erode 500g', farmer:'Savitri • Erode Herbs', category:'Natural', price:140, status:'Reported', report:'Quality flagged — awaiting review' },
    { id:'CR-103', name:'Ashwagandha Roots 1kg', farmer:'Gopal • Neemuch', category:'Ayurvedic Grade', price:420, status:'Available' },
  ]);
  const [q, setQ]=useState('');
  const [filter, setFilter]=useState<'All'|'Available'|'Reported'|'Out of stock'>('All');
  const [success, setSuccess]=useState<string|null>(null);
  const [confirm, setConfirm]=useState<MRow|null>(null);

  const filtered=rows.filter(r=>{
    const mQ=!q || r.name.toLowerCase().includes(q.toLowerCase()) || r.farmer.toLowerCase().includes(q.toLowerCase());
    const mF=filter==='All' || r.status===filter;
    return mQ && mF;
  });
  const handleResolve=()=>{
    if(!confirm) return;
    setRows(prev=>prev.map(r=>r.id===confirm.id? {...r, status:'Available', report:undefined}:r));
    addAuditLog({ accessor: adminKeyMember||'Admin', role:'Admin', action:`Resolved reported product ${confirm.id}`, status:'Success'});
    addAdminAction({ adminName: adminKeyMember||'Admin', action:'Resolve marketplace report', details:`${confirm.name} → Available`});
    setSuccess(`${confirm.name} resolved → Available`); setTimeout(()=>setSuccess(null),2500); setConfirm(null);
  };
  const handleRemove=()=>{
    if(!confirm) return;
    setRows(prev=>prev.map(r=>r.id===confirm.id? {...r, status:'Out of stock'}:r));
    addAuditLog({ accessor: adminKeyMember||'Admin', role:'Admin', action:`Removed marketplace product ${confirm.id}`, status:'Success'});
    setSuccess(`${confirm.name} removed (Out of stock)`); setTimeout(()=>setSuccess(null),2500); setConfirm(null);
  };

  return (
    <div>
      <section className="admin-hero"><div className="admin-hero__inner"><div><h1>Marketplace</h1><p>Products • Categories • Farmer listings • Availability • Reported • Status</p></div><span className="admin-badge" style={{background:'white', color:'var(--admin-dark)', borderColor:'white'}}><Store size={14}/>{rows.length} products</span></div></section>
      <div style={{maxWidth:1280, margin:'0 auto', padding:20, display:'grid', gap:14}}>
        {success && <div className="admin-card" style={{padding:12, borderLeft:'3px solid #16a34a', background:'#ecfdf5', display:'flex', gap:8}}><CheckCircle size={16} color="#16a34a"/><span style={{fontSize:'0.88rem'}}>{success}</span></div>}
        <div className="admin-card" style={{padding:12, display:'flex', gap:10, flexWrap:'wrap'}}>
          <div style={{flex:1, minWidth:220, position:'relative'}}><Search size={16} style={{position:'absolute', left:12, top:12, color:'var(--admin-muted)'}}/><input placeholder="Search product or farmer" value={q} onChange={e=>setQ(e.target.value)} className="admin-input" style={{width:'100%', paddingLeft:36}}/></div>
          {(['All','Available','Reported','Out of stock'] as const).map(f=> <button key={f} onClick={()=>setFilter(f)} className="admin-btn" style={{background: filter===f?'var(--admin-primary)':'white', color:filter===f?'white':'var(--admin-muted)', borderColor:'var(--admin-border-soft)'}}>{f}</button>)}
        </div>
        <div className="admin-card" style={{overflow:'hidden'}}><div style={{overflowX:'auto'}}><table className="admin-table admin-table-responsive" aria-label="Marketplace">
          <thead><tr><th>Product</th><th>Farmer</th><th>Category</th><th>Price</th><th>Status</th><th style={{textAlign:'right'}}>Actions</th></tr></thead>
          <tbody>
            {filtered.map(r=>(
              <tr key={r.id}><td data-label="Product"><strong>{r.name}</strong> <span style={{fontSize:'0.76rem', color:'var(--admin-muted)'}}>• {r.id}</span>{r.report && <div style={{fontSize:'0.76rem', color:'#92400e', display:'flex', gap:4, alignItems:'center'}}><Flag size={12}/>{r.report}</div>}</td><td data-label="Farmer" style={{fontSize:'0.82rem'}}>{r.farmer}</td><td data-label="Category"><span className="admin-badge admin-badge--neutral">{r.category}</span></td><td data-label="Price" style={{fontWeight:800}}>₹{r.price}</td><td data-label="Status"><span className={`admin-badge ${r.status==='Available'?'admin-badge--success': r.status==='Reported'?'admin-badge--warning':'admin-badge--danger'}`}>{r.status}</span></td><td data-label="Actions" style={{textAlign:'right'}}><div style={{display:'flex', gap:6, justifyContent:'flex-end', flexWrap:'wrap'}}><button className="admin-btn admin-btn--outline" style={{minHeight:36, padding:'6px 10px'}}><Eye size={14}/> View</button>{r.status==='Reported' && <><button onClick={()=>setConfirm(r)} className="admin-btn admin-btn--primary" style={{minHeight:36, padding:'6px 10px'}}><ShieldCheck size={14}/> Resolve</button><button onClick={()=>setConfirm(r)} className="admin-btn admin-btn--danger" style={{minHeight:36, padding:'6px 10px'}}><Flag size={14}/> Remove</button></>}</div></td></tr>
            ))}
          </tbody>
        </table></div></div>
        <div className="admin-card" style={{padding:12, display:'flex', gap:8, alignItems:'center'}}><Package size={16} color="var(--admin-primary)"/><span style={{fontSize:'0.84rem', color:'var(--admin-muted)'}}>Manage <strong>reported products</strong> with confirmation — audited.</span></div>
      </div>
      {confirm && <div className="admin-modal-overlay" onClick={()=>setConfirm(null)}><div className="admin-modal" onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true"><div className="admin-modal__header"><h3 style={{display:'flex', gap:8, alignItems:'center'}}><AlertTriangle size={18} color="#f59e0b"/>{confirm.status==='Reported'?'Handle reported product':'Confirm action'}</h3><button onClick={()=>setConfirm(null)} style={{padding:6, borderRadius:8, border:'1px solid var(--admin-border-soft)', background:'white'}}>✕</button></div><div className="admin-modal__body"><p style={{color:'var(--admin-muted)'}}><strong>{confirm.name}</strong> • {confirm.farmer} • Reported: {confirm.report || '—'}. Choose resolve or remove — both audited.</p></div><div className="admin-modal__footer"><button onClick={()=>setConfirm(null)} className="admin-btn admin-btn--outline">Cancel</button><button onClick={handleResolve} className="admin-btn admin-btn--primary">Resolve → Available</button><button onClick={handleRemove} className="admin-btn admin-btn--danger" style={{background:'#dc2626', color:'white', borderColor:'#dc2626'}}>Remove</button></div></div></div>}
    </div>
  );
};
export default AdminMarketplace;
