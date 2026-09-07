import React, { useEffect, useState } from 'react';
import { ScrollText, Search, Filter, ShieldCheck, AlertTriangle, Clock } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import '../../styles/admin.css';

type LogRow = { id:string; actor:string; role:string; action:string; timestamp:string; resource:string; result:'Success'|'Denied'|'Failed'; meta?:string };

const AdminAuditLogs: React.FC = () => {
  const { auditLogs } = useUserStore();
  const [rows, setRows]=useState<LogRow[]>([
    { id:'AL-101', actor:'Admin A.', role:'Admin', action:'Approved doctor AYU-REG-9102', timestamp:'2026-03-12 10:32', resource:'doctor_profiles:AYU-REG-9102', result:'Success', meta:'IP 10.0.0.12 • Admin portal' },
    { id:'AL-102', actor:'Admin A.', role:'Admin', action:'Deactivated user U-105', timestamp:'2026-03-12 10:18', resource:'users:U-105', result:'Success', meta:'IP 10.0.0.12 • confirmation modal' },
    { id:'AL-103', actor:'Ramesh K.', role:'Delivery', action:'Updated order ORD-402 → Delivered', timestamp:'2026-03-12 09:55', resource:'delivery_orders:ORD-402', result:'Success', meta:'GPS 12.97,77.59' },
    { id:'AL-104', actor:'Unknown', role:'User', action:'Attempted admin route /admin/users', timestamp:'2026-03-12 09:40', resource:'/admin/users', result:'Denied', meta:'RBAC denied • role User' },
  ]);
  const [q, setQ]=useState('');
  const [roleFilter, setRoleFilter]=useState('All');
  const [resultFilter, setResultFilter]=useState('All');
  const [loading, setLoading]=useState(false);

  useEffect(()=>{
    if(auditLogs?.length){
      const mapped: LogRow[] = auditLogs.slice(0,20).map((l:any)=>({
        id:l.id, actor:l.accessor||l.actor||'System', role:l.role||'User', action:l.action, timestamp: l.timestamp || l.createdAt || new Date().toISOString(), resource: (l.entity||'resource'), result: (l.status as any)||'Success', meta: l.status==='Denied' ? 'RBAC denied' : undefined
      }));
      if(mapped.length) setRows(prev=> [...mapped, ...prev].slice(0,30));
    }
    const token=localStorage.getItem('nv_token');
    if(token){
      setLoading(true);
      fetch('/api/analytics/audit', { headers:{ Authorization:`Bearer ${token}`}}).then(r=>r.json()).then(d=>{
        if(d.logs?.length){
          const mapped: LogRow[] = d.logs.slice(0,20).map((l:any)=>({
            id:l.id, actor:l.accessor || l.actor, role:l.role, action:l.action, timestamp:l.timestamp || l.createdAt, resource:l.entity || l.resource || l.action, result: l.status || 'Success', meta: l.meta
          }));
          setRows(mapped);
        }
      }).catch(()=>{}).finally(()=>setLoading(false));
    }
  },[]);

  const filtered=rows.filter(r=>{
    const mQ=!q || r.actor.toLowerCase().includes(q.toLowerCase()) || r.action.toLowerCase().includes(q.toLowerCase()) || r.resource.toLowerCase().includes(q.toLowerCase());
    const mR=roleFilter==='All' || r.role===roleFilter;
    const mRes=resultFilter==='All' || r.result===resultFilter;
    return mQ && mR && mRes;
  });

  return (
    <div>
      <section className="admin-hero"><div className="admin-hero__inner"><div><h1>Audit Logs</h1><p>Actor • Role • Action • Timestamp • Resource • Result — sensitive ops fully audited + security metadata</p></div><span className="admin-badge" style={{background:'white', color:'var(--admin-dark)', borderColor:'white'}}><ScrollText size={14}/>{rows.length} events</span></div></section>
      <div style={{maxWidth:1280, margin:'0 auto', padding:20, display:'grid', gap:14}}>
        <div className="admin-card" style={{padding:12}}>
          <div className="admin-filters">
            <div style={{flex:1, minWidth:220, position:'relative'}}>
              <Search size={16} style={{position:'absolute', left:12, top:12, color:'var(--admin-muted)'}}/>
              <input aria-label="Search audit logs" placeholder="Search actor, action, resource" value={q} onChange={e=>setQ(e.target.value)} className="admin-input" style={{width:'100%', paddingLeft:36}}/>
            </div>
            <Filter size={16} color="var(--admin-muted)"/>
            <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className="admin-input"><option>All</option><option>Admin</option><option>Doctor</option><option>Trainer</option><option>Farmer</option><option>Delivery</option><option>User</option></select>
            <select value={resultFilter} onChange={e=>setResultFilter(e.target.value)} className="admin-input"><option>All</option><option>Success</option><option>Denied</option><option>Failed</option></select>
          </div>
        </div>

        {loading ? <p style={{textAlign:'center', padding:30}}>Loading audit logs…</p> : (
          <div className="admin-card" style={{overflow:'hidden'}}>
            <div style={{overflowX:'auto'}}>
              <table className="admin-table admin-table-responsive" aria-label="Audit logs">
                <thead><tr><th>Timestamp</th><th>Actor</th><th>Role</th><th>Action</th><th>Resource</th><th>Result</th></tr></thead>
                <tbody>
                  {filtered.length===0? <tr><td colSpan={6} style={{textAlign:'center', padding:32, color:'var(--admin-muted)'}}>No logs match filter</td></tr> : filtered.map(r=>(
                    <tr key={r.id}>
                      <td data-label="Timestamp" style={{fontSize:'0.82rem', whiteSpace:'nowrap'}}><Clock size={12} style={{display:'inline', marginRight:4, color:'var(--admin-muted)'}}/>{new Date(r.timestamp).toLocaleString([], { hour:'2-digit', minute:'2-digit', day:'2-digit', month:'short'})}</td>
                      <td data-label="Actor"><div style={{display:'flex', gap:6, alignItems:'center'}}><span style={{width:24, height:24, borderRadius:999, background:'var(--admin-primary)', color:'white', display:'grid', placeItems:'center', fontWeight:800, fontSize:'0.72rem'}}>{r.actor.charAt(0)}</span><strong style={{fontSize:'0.88rem'}}>{r.actor}</strong></div>{r.meta && <div style={{fontSize:'0.72rem', color:'var(--admin-muted)', marginTop:2}}>{r.meta}</div>}</td>
                      <td data-label="Role"><span className="admin-badge admin-badge--neutral">{r.role}</span></td>
                      <td data-label="Action" style={{fontSize:'0.84rem'}}>{r.action}</td>
                      <td data-label="Resource" style={{fontSize:'0.82rem', color:'var(--admin-muted)', maxWidth:240, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{r.resource}</td>
                      <td data-label="Result"><span className={`admin-badge ${r.result==='Success'?'admin-badge--success': r.result==='Denied'?'admin-badge--danger':'admin-badge--warning'}`}>{r.result==='Success'?<ShieldCheck size={12} style={{display:'inline', marginRight:4}}/>: r.result==='Denied'?<AlertTriangle size={12} style={{display:'inline', marginRight:4}}/>:null}{r.result}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{padding:12, background:'#fdfcf8', borderTop:'1px solid #f0f0ea', fontSize:'0.78rem', color:'var(--admin-muted)', display:'flex', gap:8, alignItems:'center'}}><ShieldCheck size={14} color="#16a34a"/> Sensitive admin ops provide confirmation → audit trail (actor, role, action, timestamp, resource, result).</div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminAuditLogs;
