import React, { useState } from 'react';
import { Sprout, MapPin, CheckCircle, Search, Eye, AlertCircle, Package } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import '../../styles/admin.css';

type FRow = { id:string; farm:string; location:string; farmer:string; crops:string; listings:number; status:'Verified'|'Pending'|'Flagged'; compliance:'Pass'|'Review' };

const AdminFarmers: React.FC = () => {
  const { addAuditLog, addAdminAction, adminKeyMember } = useUserStore();
  const [rows, setRows]=useState<FRow[]>([
    { id:'FM-301', farm:'Green Valley Organic', location:'Pratapgarh, UP', farmer:'Ram Singh', crops:'Amla, Turmeric', listings:6, status:'Verified', compliance:'Pass' },
    { id:'FM-302', farm:'Erode Herbs', location:'Erode, TN', farmer:'Savitri Devi', crops:'Turmeric', listings:3, status:'Pending', compliance:'Review' },
    { id:'FM-303', farm:'Neemuch Roots', location:'Neemuch, MP', farmer:'Gopal Das', crops:'Ashwagandha', listings:4, status:'Pending', compliance:'Review' },
  ]);
  const [q, setQ]=useState('');
  const [filter, setFilter]=useState<'All'|'Verified'|'Pending'|'Flagged'>('All');
  const [confirm, setConfirm]=useState<FRow|null>(null);
  const [success, setSuccess]=useState<string|null>(null);
  const filtered=rows.filter(r=>{
    const mQ=!q || r.farm.toLowerCase().includes(q.toLowerCase()) || r.farmer.toLowerCase().includes(q.toLowerCase());
    const mF=filter==='All' || r.status===filter;
    return mQ && mF;
  });
  const handleVerify=()=>{
    if(!confirm) return;
    setRows(prev=>prev.map(r=>r.id===confirm.id? {...r, status:'Verified', compliance:'Pass'}:r));
    addAuditLog({ accessor: adminKeyMember||'Admin', role:'Admin', action:`Verified farmer ${confirm.id}`, status:'Success'});
    addAdminAction({ adminName: adminKeyMember||'Admin', action:'Verify farmer', details:`${confirm.farm} → Verified`});
    setSuccess(`${confirm.farm} verified`); setTimeout(()=>setSuccess(null),2500); setConfirm(null);
  };
  return (
    <div>
      <section className="admin-hero"><div className="admin-hero__inner"><div><h1>Farmers</h1><p>Verification • Farm info • Crop listings • Marketplace status • Orders • Compliance</p></div><span className="admin-badge" style={{background:'white', color:'var(--admin-dark)', borderColor:'white'}}><Sprout size={14}/>{rows.length} farms</span></div></section>
      <div style={{maxWidth:1280, margin:'0 auto', padding:20, display:'grid', gap:14}}>
        {success && <div className="admin-card" style={{padding:12, borderLeft:'3px solid #16a34a', background:'#ecfdf5', display:'flex', gap:8}}><CheckCircle size={16} color="#16a34a"/><span style={{fontSize:'0.88rem'}}>{success}</span></div>}
        <div className="admin-card" style={{padding:12, display:'flex', gap:10, flexWrap:'wrap'}}>
          <div style={{flex:1, minWidth:220, position:'relative'}}><Search size={16} style={{position:'absolute', left:12, top:12, color:'var(--admin-muted)'}}/><input placeholder="Search farm or farmer" value={q} onChange={e=>setQ(e.target.value)} className="admin-input" style={{width:'100%', paddingLeft:36}}/></div>
          {(['All','Verified','Pending','Flagged'] as const).map(f=> <button key={f} onClick={()=>setFilter(f)} className="admin-btn" style={{background: filter===f?'var(--admin-primary)':'white', color:filter===f?'white':'var(--admin-muted)', borderColor:'var(--admin-border-soft)'}}>{f}</button>)}
        </div>
        <div className="admin-card" style={{overflow:'hidden'}}><div style={{overflowX:'auto'}}><table className="admin-table admin-table-responsive" aria-label="Farmers">
          <thead><tr><th>Farm</th><th>Farmer</th><th>Location</th><th>Crops</th><th>Listings</th><th>Status</th><th>Compliance</th><th style={{textAlign:'right'}}>Actions</th></tr></thead>
          <tbody>
            {filtered.map(r=>(
              <tr key={r.id}><td data-label="Farm"><strong>{r.farm}</strong> <span style={{fontSize:'0.76rem', color:'var(--admin-muted)'}}>• {r.id}</span></td><td data-label="Farmer">{r.farmer}</td><td data-label="Location" style={{fontSize:'0.82rem'}}><MapPin size={12} style={{display:'inline', marginRight:4}}/>{r.location}</td><td data-label="Crops" style={{fontSize:'0.82rem'}}>{r.crops}</td><td data-label="Listings"><span className="admin-badge admin-badge--neutral"><Package size={12}/>{r.listings}</span></td><td data-label="Status"><span className={`admin-badge ${r.status==='Verified'?'admin-badge--success': r.status==='Flagged'?'admin-badge--danger':'admin-badge--warning'}`}>{r.status}</span></td><td data-label="Compliance"><span className={`admin-badge ${r.compliance==='Pass'?'admin-badge--success':'admin-badge--warning'}`}>{r.compliance}</span></td><td data-label="Actions" style={{textAlign:'right'}}><div style={{display:'flex', gap:6, justifyContent:'flex-end', flexWrap:'wrap'}}><button className="admin-btn admin-btn--outline" style={{minHeight:36, padding:'6px 10px'}}><Eye size={14}/> View</button>{r.status==='Pending' && <button onClick={()=>setConfirm(r)} className="admin-btn admin-btn--primary" style={{minHeight:36, padding:'6px 10px'}}><CheckCircle size={14}/> Verify</button>}</div></td></tr>
            ))}
          </tbody>
        </table></div></div>
      </div>
      {confirm && <div className="admin-modal-overlay" onClick={()=>setConfirm(null)}><div className="admin-modal" onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true"><div className="admin-modal__header"><h3 style={{display:'flex', gap:8, alignItems:'center'}}><AlertCircle size={18} color="#16a34a"/>Verify farm</h3><button onClick={()=>setConfirm(null)} style={{padding:6, borderRadius:8, border:'1px solid var(--admin-border-soft)', background:'white'}}>✕</button></div><div className="admin-modal__body"><p style={{color:'var(--admin-muted)'}}><strong>{confirm.farm}</strong> • {confirm.location} • Farmer {confirm.farmer}. Sets status Verified and compliance Pass — audited.</p></div><div className="admin-modal__footer"><button onClick={()=>setConfirm(null)} className="admin-btn admin-btn--outline">Cancel</button><button onClick={handleVerify} className="admin-btn admin-btn--primary">Confirm verify</button></div></div></div>}
    </div>
  );
};
export default AdminFarmers;
