import React, { useEffect, useState } from 'react';
import { Users, Search, AlertCircle, CheckCircle, UserX, UserCheck, Eye, Filter } from 'lucide-react';
import { getAuthToken } from '../../services/client';
import { useUserStore } from '../../store/userStore';
import '../../styles/admin.css';

type AdminUser = { id:string; name:string; email:string; role:string; status:'Active'|'Deactivated'|'Pending'; activity:string };

const AdminUsers: React.FC = () => {
  const { addAuditLog, addAdminAction, adminKeyMember } = useUserStore();
  const [users, setUsers]=useState<AdminUser[]>([
    { id:'U-101', name:'Rajesh Kumar', email:'rajesh.k@example.com', role:'User', status:'Active', activity:'Last login 2h ago' },
    { id:'U-102', name:'Dr. Anjali', email:'anjali@nutrivedha.health', role:'Doctor', status:'Active', activity:'Verified • 42 patients' },
    { id:'U-103', name:'Kabir Singh', email:'kabir@fit.co', role:'Trainer', status:'Active', activity:'28 members' },
    { id:'U-104', name:'Ram Singh', email:'ram@farm.in', role:'Farmer', status:'Pending', activity:'Awaiting verification' },
    { id:'U-105', name:'Ramesh K.', email:'ramesh@delivery.in', role:'Delivery', status:'Active', activity:'36 deliveries' },
  ]);
  const [q, setQ]=useState('');
  const [roleFilter, setRoleFilter]=useState('All');
  const [statusFilter, setStatusFilter]=useState('All');
  const [loading, setLoading]=useState(false);
  const [error] =useState<string|null>(null);
  const [success, setSuccess]=useState<string|null>(null);
  const [confirm, setConfirm]=useState<AdminUser|null>(null);
  const [pendingAction, setPendingAction]=useState<'deactivate'|'activate'|null>(null);

  useEffect(()=>{
    const token=getAuthToken();
    if(!token) return;
    setLoading(true);
    Promise.allSettled([
      fetch('/api/analytics/admin/overview', { headers:{ Authorization:`Bearer ${token}`}}).then(r=>r.json()).catch(()=>null),
      fetch('/api/analytics/audit', { headers:{ Authorization:`Bearer ${token}`}}).then(r=>r.json()).catch(()=>null),
    ]).then(([ov, au])=>{
      const ovVal=(ov.status==='fulfilled' && (ov.value as any)?.users?.length) ? (ov.value as any).users : null;
      if(ovVal) setUsers(ovVal.map((u:any)=>({ id:u.id||u.userId, name:u.name||u.email, email:u.email, role:u.role||'User', status: u.status||'Active', activity: u.activity||'' })));
      else {
        const logs=(au.status==='fulfilled' && (au.value as any)?.logs?.length) ? (au.value as any).logs : [];
        if(logs.length){
          const uniq=new Map();
          logs.forEach((l:any)=> uniq.set(l.userId, { id:l.userId, name:l.accessor||l.userId, email:l.userId, role:l.role||'User', status:'Active', activity:l.action }));
          if(uniq.size) setUsers(Array.from(uniq.values()).slice(0,20) as any);
        }
      }
    }).finally(()=>setLoading(false));
  },[]);

  const filtered=users.filter(u=>{
    const mQ=!q || u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase());
    const mR=roleFilter==='All' || u.role===roleFilter;
    const mS=statusFilter==='All' || u.status===statusFilter;
    return mQ && mR && mS;
  });

  const requestAction=(u:AdminUser, action:'deactivate'|'activate')=>{
    setConfirm(u); setPendingAction(action);
  };
  const confirmAction=()=>{
    if(!confirm || !pendingAction) return;
    const nextStatus = pendingAction==='deactivate' ? 'Deactivated' : 'Active';
    setUsers(prev=>prev.map(x=>x.id===confirm.id? {...x, status: nextStatus as any}:x));
    const act = pendingAction==='deactivate' ? 'Deactivate user' : 'Activate user';
    addAuditLog({ accessor: adminKeyMember||'Admin', role:'Admin', action:`${act} ${confirm.email}`, status:'Success' });
    addAdminAction({ adminName: adminKeyMember||'Admin', action: act, details:`${confirm.email} → ${nextStatus}` });
    setSuccess(`${confirm.name} → ${nextStatus}`);
    setTimeout(()=>setSuccess(null),2600);
    setConfirm(null); setPendingAction(null);
  };

  return (
    <div>
      <section className="admin-hero">
        <div className="admin-hero__inner">
          <div>
            <h1>Users</h1>
            <p>Search • Filters • Details • Activation / deactivation • Role • Activity — destructive actions require confirmation</p>
          </div>
          <span className="admin-badge" style={{background:'white', color:'var(--admin-dark)', borderColor:'white'}}><Users size={14}/>{users.length} users</span>
        </div>
      </section>

      <div style={{maxWidth:1280, margin:'0 auto', padding:20, display:'grid', gap:14}}>
        {error && <div className="admin-card" style={{padding:12, borderLeft:'3px solid #ef4444', display:'flex', gap:8}}><AlertCircle size={16} color="#ef4444"/><span style={{fontSize:'0.88rem'}}>{error}</span></div>}
        {success && <div className="admin-card" style={{padding:12, borderLeft:'3px solid #16a34a', background:'#ecfdf5', display:'flex', gap:8}}><CheckCircle size={16} color="#16a34a"/><span style={{fontSize:'0.88rem'}}>{success}</span></div>}

        <div className="admin-card" style={{padding:12}}>
          <div className="admin-filters">
            <div style={{flex:1, minWidth:220, position:'relative'}}>
              <Search size={16} style={{position:'absolute', left:12, top:12, color:'var(--admin-muted)'}}/>
              <input aria-label="Search users" placeholder="Search name or email" value={q} onChange={e=>setQ(e.target.value)} className="admin-input" style={{width:'100%', paddingLeft:36}}/>
            </div>
            <Filter size={16} color="var(--admin-muted)"/>
            <select aria-label="Filter role" value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className="admin-input">
              <option value="All">All roles</option><option>User</option><option>Doctor</option><option>Trainer</option><option>Farmer</option><option>Delivery</option>
            </select>
            <select aria-label="Filter status" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="admin-input">
              <option value="All">All statuses</option><option>Active</option><option>Deactivated</option><option>Pending</option>
            </select>
            <button className="admin-btn admin-btn--outline" onClick={()=>{setQ(''); setRoleFilter('All'); setStatusFilter('All');}}>Clear</button>
          </div>
        </div>

        {loading ? <p style={{textAlign:'center', padding:30}}>Loading users…</p> : (
          <div className="admin-card" style={{overflow:'hidden'}}>
            <div style={{overflowX:'auto'}}>
              <table className="admin-table admin-table-responsive" aria-label="Users">
                <thead><tr><th>User</th><th>Role</th><th>Email</th><th>Status</th><th>Activity</th><th style={{textAlign:'right'}}>Actions</th></tr></thead>
                <tbody>
                  {filtered.length===0 ? (
                    <tr><td colSpan={6} style={{textAlign:'center', padding:32, color:'var(--admin-muted)'}}>No users match filter</td></tr>
                  ) : filtered.map(u=>(
                    <tr key={u.id}>
                      <td data-label="User"><div style={{display:'flex', gap:8, alignItems:'center'}}><span style={{width:28, height:28, borderRadius:999, background:'var(--admin-primary)', color:'white', display:'grid', placeItems:'center', fontWeight:800, fontSize:'0.80rem'}}>{u.name.charAt(0)}</span><strong>{u.name}</strong></div></td>
                      <td data-label="Role"><span className="admin-badge admin-badge--neutral">{u.role}</span></td>
                      <td data-label="Email" style={{fontSize:'0.84rem'}}>{u.email}</td>
                      <td data-label="Status"><span className={`admin-badge ${u.status==='Active'?'admin-badge--success': u.status==='Pending'?'admin-badge--warning':'admin-badge--danger'}`}>{u.status}</span></td>
                      <td data-label="Activity" style={{fontSize:'0.82rem', color:'var(--admin-muted)'}}>{u.activity}</td>
                      <td data-label="Actions" style={{textAlign:'right'}}>
                        <div style={{display:'flex', gap:6, justifyContent:'flex-end', flexWrap:'wrap'}}>
                          <button className="admin-btn admin-btn--outline" style={{minHeight:36, padding:'6px 10px'}} aria-label={`View ${u.name}`}><Eye size={14}/> View</button>
                          {u.status==='Active' ? (
                            <button onClick={()=>requestAction(u,'deactivate')} className="admin-btn admin-btn--danger" style={{minHeight:36, padding:'6px 10px'}} aria-label={`Deactivate ${u.name}`}><UserX size={14}/> Deactivate</button>
                          ) : (
                            <button onClick={()=>requestAction(u,'activate')} className="admin-btn admin-btn--primary" style={{minHeight:36, padding:'6px 10px'}} aria-label={`Activate ${u.name}`}><UserCheck size={14}/> Activate</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {confirm && pendingAction && (
        <div className="admin-modal-overlay" onClick={()=>setConfirm(null)}>
          <div className="admin-modal" onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Confirm user action">
            <div className="admin-modal__header">
              <h3 style={{display:'flex', gap:8, alignItems:'center'}}><AlertCircle size={18} color={pendingAction==='deactivate'?'#dc2626':'#16a34a'}/>{pendingAction==='deactivate'?'Deactivate user':'Activate user'}</h3>
              <button onClick={()=>setConfirm(null)} aria-label="Close" style={{padding:6, borderRadius:8, border:'1px solid var(--admin-border-soft)', background:'white'}}>✕</button>
            </div>
            <div className="admin-modal__body">
              <p style={{color:'var(--admin-muted)', fontSize:'0.92rem'}}>You are about to <strong>{pendingAction}</strong> <strong>{confirm.name}</strong> ({confirm.email}, {confirm.role}). This is audited and requires confirmation.</p>
              <div style={{padding:12, borderRadius:12, background:'#fdfcf8', border:'1px solid var(--admin-border-soft)', fontSize:'0.84rem'}}>
                <div><strong>Action:</strong> {pendingAction} → status {pendingAction==='deactivate'?'Deactivated':'Active'}</div>
                <div><strong>Actor:</strong> {adminKeyMember||'Admin'} (Admin)</div>
                <div style={{marginTop:6, color:'var(--admin-muted)'}}>Audit log will record actor, role, action, timestamp, resource, result.</div>
              </div>
            </div>
            <div className="admin-modal__footer">
              <button onClick={()=>setConfirm(null)} className="admin-btn admin-btn--outline">Cancel</button>
              <button onClick={confirmAction} className={`admin-btn ${pendingAction==='deactivate'?'admin-btn--danger':'admin-btn--primary'}`} style={pendingAction==='deactivate'?{background:'#dc2626', color:'white', borderColor:'#dc2626'}:undefined}>Confirm {pendingAction}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminUsers;
