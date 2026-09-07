import React, { useState } from 'react';
import { Truck, CheckCircle, Search, Eye, AlertCircle, MapPin, Phone } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import '../../styles/admin.css';

type DRow = { id:string; name:string; zone:string; vehicle:string; assignments:number; status:'Verified'|'Pending'|'Suspended'; phone:string };

const AdminDelivery: React.FC = () => {
  const { addAuditLog, addAdminAction, adminKeyMember } = useUserStore();
  const [rows, setRows]=useState<DRow[]>([
    { id:'DL-401', name:'Ramesh Kumar', zone:'Bengaluru Central', vehicle:'Bike', assignments:12, status:'Verified', phone:'+91 98xxxxxx20' },
    { id:'DL-402', name:'Amit Verma', zone:'Koramangala', vehicle:'Van', assignments:0, status:'Pending', phone:'+91 98xxxxxx21' },
    { id:'DL-403', name:'Sunita R.', zone:'HSR Layout', vehicle:'Electric Scooter', assignments:8, status:'Verified', phone:'+91 98xxxxxx22' },
  ]);
  const [q, setQ]=useState('');
  const [filter, setFilter]=useState<'All'|'Verified'|'Pending'|'Suspended'>('All');
  const [confirm, setConfirm]=useState<DRow|null>(null);
  const [success, setSuccess]=useState<string|null>(null);
  const filtered=rows.filter(r=>{
    const mQ=!q || r.name.toLowerCase().includes(q.toLowerCase()) || r.zone.toLowerCase().includes(q.toLowerCase());
    const mF=filter==='All' || r.status===filter;
    return mQ && mF;
  });
  const handleVerify=()=>{
    if(!confirm) return;
    setRows(prev=>prev.map(r=>r.id===confirm.id? {...r, status:'Verified'}:r));
    addAuditLog({ accessor: adminKeyMember||'Admin', role:'Admin', action:`Verified delivery ${confirm.id}`, status:'Success'});
    addAdminAction({ adminName: adminKeyMember||'Admin', action:'Verify delivery', details:`${confirm.name} → Verified`});
    setSuccess(`${confirm.name} verified`); setTimeout(()=>setSuccess(null),2500); setConfirm(null);
  };
  return (
    <div>
      <section className="admin-hero"><div className="admin-hero__inner"><div><h1>Delivery</h1><p>Partners • Verification • Status • Assignments • Activity — logistics only</p></div><span className="admin-badge" style={{background:'white', color:'var(--admin-dark)', borderColor:'white'}}><Truck size={14}/>{rows.length} partners</span></div></section>
      <div style={{maxWidth:1280, margin:'0 auto', padding:20, display:'grid', gap:14}}>
        {success && <div className="admin-card" style={{padding:12, borderLeft:'3px solid #16a34a', background:'#ecfdf5', display:'flex', gap:8}}><CheckCircle size={16} color="#16a34a"/><span style={{fontSize:'0.88rem'}}>{success}</span></div>}
        <div className="admin-card" style={{padding:12, display:'flex', gap:10, flexWrap:'wrap'}}>
          <div style={{flex:1, minWidth:220, position:'relative'}}><Search size={16} style={{position:'absolute', left:12, top:12, color:'var(--admin-muted)'}}/><input placeholder="Search name or zone" value={q} onChange={e=>setQ(e.target.value)} className="admin-input" style={{width:'100%', paddingLeft:36}}/></div>
          {(['All','Verified','Pending','Suspended'] as const).map(f=> <button key={f} onClick={()=>setFilter(f)} className="admin-btn" style={{background: filter===f?'var(--admin-primary)':'white', color:filter===f?'white':'var(--admin-muted)', borderColor:'var(--admin-border-soft)'}}>{f}</button>)}
        </div>
        <div className="admin-card" style={{overflow:'hidden'}}><div style={{overflowX:'auto'}}><table className="admin-table admin-table-responsive" aria-label="Delivery partners">
          <thead><tr><th>Partner</th><th>Zone</th><th>Vehicle</th><th>Assignments</th><th>Contact</th><th>Status</th><th style={{textAlign:'right'}}>Actions</th></tr></thead>
          <tbody>
            {filtered.map(r=>(
              <tr key={r.id}><td data-label="Partner"><strong>{r.name}</strong> <span style={{fontSize:'0.76rem', color:'var(--admin-muted)'}}>• {r.id}</span></td><td data-label="Zone" style={{fontSize:'0.82rem'}}><MapPin size={12} style={{display:'inline', marginRight:4}}/>{r.zone}</td><td data-label="Vehicle">{r.vehicle}</td><td data-label="Assignments"><span className="admin-badge admin-badge--neutral">{r.assignments}</span></td><td data-label="Contact" style={{fontSize:'0.82rem'}}><Phone size={12} style={{display:'inline', marginRight:4}}/>{r.phone}</td><td data-label="Status"><span className={`admin-badge ${r.status==='Verified'?'admin-badge--success': r.status==='Suspended'?'admin-badge--danger':'admin-badge--warning'}`}>{r.status}</span></td><td data-label="Actions" style={{textAlign:'right'}}><div style={{display:'flex', gap:6, justifyContent:'flex-end', flexWrap:'wrap'}}><button className="admin-btn admin-btn--outline" style={{minHeight:36, padding:'6px 10px'}}><Eye size={14}/> View</button>{r.status==='Pending' && <button onClick={()=>setConfirm(r)} className="admin-btn admin-btn--primary" style={{minHeight:36, padding:'6px 10px'}}><CheckCircle size={14}/> Verify</button>}</div></td></tr>
            ))}
          </tbody>
        </table></div></div>
      </div>
      {confirm && <div className="admin-modal-overlay" onClick={()=>setConfirm(null)}><div className="admin-modal" onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true"><div className="admin-modal__header"><h3 style={{display:'flex', gap:8, alignItems:'center'}}><AlertCircle size={18} color="#16a34a"/>Verify delivery partner</h3><button onClick={()=>setConfirm(null)} style={{padding:6, borderRadius:8, border:'1px solid var(--admin-border-soft)', background:'white'}}>✕</button></div><div className="admin-modal__body"><p style={{color:'var(--admin-muted)'}}><strong>{confirm.name}</strong> • {confirm.zone} • {confirm.vehicle}. Audited.</p></div><div className="admin-modal__footer"><button onClick={()=>setConfirm(null)} className="admin-btn admin-btn--outline">Cancel</button><button onClick={handleVerify} className="admin-btn admin-btn--primary">Confirm verify</button></div></div></div>}
    </div>
  );
};
export default AdminDelivery;
