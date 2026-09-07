import React, { useState } from 'react';
import { Stethoscope, CheckCircle, XCircle, Search, Clock, Eye, ShieldCheck, AlertCircle } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import '../../styles/admin.css';

type DocRow = { id:string; name:string; specialization:string; regNumber:string; verified:boolean; patients:number; experience:string; status:'Pending'|'Approved'|'Rejected' };

const AdminDoctors: React.FC = () => {
  const { addAuditLog, addAdminAction, adminKeyMember } = useUserStore();
  const [rows, setRows]=useState<DocRow[]>([
    { id:'DOC-101', name:'Dr. Anjali Rao', specialization:'Ayurvedic Internal', regNumber:'AYU-REG-8821', verified:true, patients:42, experience:'10+ Years', status:'Approved' },
    { id:'DOC-102', name:'Dr. Sameer Khan', specialization:'Skin', regNumber:'AYU-REG-9102', verified:false, patients:0, experience:'5+ Years', status:'Pending' },
    { id:'DOC-103', name:'Dr. Meera Joshi', specialization:'Nutrition', regNumber:'AYU-REG-9033', verified:false, patients:0, experience:'8+ Years', status:'Pending' },
  ]);
  const [q, setQ]=useState('');
  const [filter, setFilter]=useState<'All'|'Pending'|'Approved'|'Rejected'>('All');
  const [confirm, setConfirm]=useState<{row:DocRow, action:'approve'|'reject'}|null>(null);
  const [success, setSuccess]=useState<string|null>(null);

  const filtered=rows.filter(r=>{
    const mQ=!q || r.name.toLowerCase().includes(q.toLowerCase()) || r.regNumber.toLowerCase().includes(q.toLowerCase());
    const mF=filter==='All' || r.status===filter;
    return mQ && mF;
  });

  const handleConfirm=()=>{
    if(!confirm) return;
    const next = confirm.action==='approve' ? 'Approved' : 'Rejected';
    const verified = confirm.action==='approve';
    setRows(prev=>prev.map(r=>r.id===confirm.row.id? {...r, status: next as any, verified}:r));
    addAuditLog({ accessor: adminKeyMember||'Admin', role:'Admin', action:`${next} doctor ${confirm.row.regNumber}`, status:'Success'});
    addAdminAction({ adminName: adminKeyMember||'Admin', action:`Doctor ${next}`, details:`${confirm.row.name} ${confirm.row.regNumber} → ${next}`});
    setSuccess(`${confirm.row.name} → ${next}`);
    setTimeout(()=>setSuccess(null),2500);
    setConfirm(null);
  };

  return (
    <div>
      <section className="admin-hero">
        <div className="admin-hero__inner">
          <div><h1>Doctors</h1><p>Applications • Verification • Approval / rejection • Profiles • Availability • Status • Activity</p></div>
          <span className="admin-badge" style={{background:'white', color:'var(--admin-dark)', borderColor:'white'}}><Stethoscope size={14}/>{rows.length} doctors</span>
        </div>
      </section>
      <div style={{maxWidth:1280, margin:'0 auto', padding:20, display:'grid', gap:14}}>
        {success && <div className="admin-card" style={{padding:12, borderLeft:'3px solid #16a34a', background:'#ecfdf5', display:'flex', gap:8}}><CheckCircle size={16} color="#16a34a"/><span style={{fontSize:'0.88rem'}}>{success}</span></div>}
        <div className="admin-card" style={{padding:12, display:'flex', gap:10, flexWrap:'wrap'}}>
          <div style={{flex:1, minWidth:220, position:'relative'}}>
            <Search size={16} style={{position:'absolute', left:12, top:12, color:'var(--admin-muted)'}}/>
            <input aria-label="Search doctors" placeholder="Search name, reg number" value={q} onChange={e=>setQ(e.target.value)} className="admin-input" style={{width:'100%', paddingLeft:36}}/>
          </div>
          {(['All','Pending','Approved','Rejected'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className="admin-btn" style={{background: filter===f?'var(--admin-primary)':'white', color: filter===f?'white':'var(--admin-muted)', borderColor:'var(--admin-border-soft)'}}>{f}</button>
          ))}
        </div>

        <div className="admin-card" style={{overflow:'hidden'}}>
          <div style={{overflowX:'auto'}}>
            <table className="admin-table admin-table-responsive" aria-label="Doctors">
              <thead><tr><th>Doctor</th><th>Specialization</th><th>Reg</th><th>Patients</th><th>Status</th><th style={{textAlign:'right'}}>Actions</th></tr></thead>
              <tbody>
                {filtered.length===0? <tr><td colSpan={6} style={{textAlign:'center', padding:32, color:'var(--admin-muted)'}}>No doctors for filter</td></tr> : filtered.map(r=>(
                  <tr key={r.id}>
                    <td data-label="Doctor"><div style={{display:'flex', gap:8, alignItems:'center'}}><span style={{width:28, height:28, borderRadius:999, background:'var(--admin-accent-soft)', display:'grid', placeItems:'center', fontWeight:800, color:'var(--admin-primary)'}}>{r.name.charAt(3)||'D'}</span><div><strong>{r.name}</strong><div style={{fontSize:'0.76rem', color:'var(--admin-muted)'}}>{r.experience} • {r.id}</div></div></div></td>
                    <td data-label="Spec">{r.specialization}</td>
                    <td data-label="Reg" style={{fontSize:'0.82rem', fontWeight:700}}>{r.regNumber} {r.verified && <ShieldCheck size={12} color="#16a34a" style={{display:'inline'}}/>}</td>
                    <td data-label="Patients">{r.patients}</td>
                    <td data-label="Status"><span className={`admin-badge ${r.status==='Approved'?'admin-badge--success': r.status==='Rejected'?'admin-badge--danger':'admin-badge--warning'}`}>{r.status==='Approved'?<CheckCircle size={12} style={{display:'inline', marginRight:4}}/>: r.status==='Rejected'?<XCircle size={12} style={{display:'inline', marginRight:4}}/>:<Clock size={12} style={{display:'inline', marginRight:4}}/>}{r.status}</span></td>
                    <td data-label="Actions" style={{textAlign:'right'}}>
                      <div style={{display:'flex', gap:6, justifyContent:'flex-end', flexWrap:'wrap'}}>
                        <button className="admin-btn admin-btn--outline" style={{minHeight:36, padding:'6px 10px'}}><Eye size={14}/> View</button>
                        {r.status==='Pending' && <>
                          <button onClick={()=>setConfirm({row:r, action:'approve'})} className="admin-btn admin-btn--primary" style={{minHeight:36, padding:'6px 10px'}}><CheckCircle size={14}/> Approve</button>
                          <button onClick={()=>setConfirm({row:r, action:'reject'})} className="admin-btn admin-btn--danger" style={{minHeight:36, padding:'6px 10px'}}><XCircle size={14}/> Reject</button>
                        </>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {confirm && (
        <div className="admin-modal-overlay" onClick={()=>setConfirm(null)}>
          <div className="admin-modal" onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="admin-modal__header"><h3 style={{display:'flex', gap:8, alignItems:'center'}}><AlertCircle size={18} color={confirm.action==='approve'?'#16a34a':'#dc2626'}/>{confirm.action==='approve'?'Approve':'Reject'} doctor</h3><button onClick={()=>setConfirm(null)} aria-label="Close" style={{padding:6, borderRadius:8, border:'1px solid var(--admin-border-soft)', background:'white'}}>✕</button></div>
            <div className="admin-modal__body">
              <p style={{color:'var(--admin-muted)'}}><strong>{confirm.row.name}</strong> • {confirm.row.regNumber} • {confirm.row.specialization}. This will update `doctor_profiles.verified` and is fully audited.</p>
              <div style={{padding:12, borderRadius:12, background:'#fdfcf8', border:'1px solid var(--admin-border-soft)', fontSize:'0.84rem'}}>
                <div><strong>Action:</strong> {confirm.action} → {confirm.action==='approve'?'Approved / Verified':'Rejected'}</div>
                <div><strong>Actor:</strong> {adminKeyMember||'Admin'} • {new Date().toLocaleString()}</div>
              </div>
            </div>
            <div className="admin-modal__footer">
              <button onClick={()=>setConfirm(null)} className="admin-btn admin-btn--outline">Cancel</button>
              <button onClick={handleConfirm} className={confirm.action==='approve'?'admin-btn admin-btn--primary':'admin-btn admin-btn--danger'} style={confirm.action==='reject'?{background:'#dc2626', color:'white', borderColor:'#dc2626'}:undefined}>Confirm {confirm.action}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDoctors;
