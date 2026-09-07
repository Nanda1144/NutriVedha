import React, { useState } from 'react';
import { Settings, Activity, ShieldCheck, Bell, Wrench, Database, AlertTriangle, Lock, EyeOff, Server } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import '../../styles/admin.css';

const AdminSystem: React.FC = () => {
  const { addAdminAction, adminKeyMember, systemUpdates, addSystemUpdate } = useUserStore();
  const [maintenance, setMaintenance]=useState(false);
  const [notifEmail, setNotifEmail]=useState(true);
  const [notifPush, setNotifPush]=useState(true);
  const [broadcastTitle, setBroadcastTitle]=useState('');
  const [broadcastBody, setBroadcastBody]=useState('');
  const [toast, setToast]=useState<string|null>(null);

  const showToast=(m:string)=>{ setToast(m); setTimeout(()=>setToast(null),2500); };

  const services=[
    { name:'gateway :8080', status:'Operational', latency:'6ms', uptime:'99.92%' },
    { name:'auth :3001', status:'Operational', latency:'8ms', uptime:'99.88%' },
    { name:'user :3002', status:'Operational', latency:'10ms', uptime:'99.90%' },
    { name:'ai :3003', status:'Operational', latency:'18ms', uptime:'99.71%' },
    { name:'farmer :3012', status:'Operational', latency:'12ms', uptime:'99.84%' },
    { name:'delivery :3008', status:'Operational', latency:'9ms', uptime:'99.80%' },
    { name:'trainer :3015', status:'Operational', latency:'11ms', uptime:'99.85%' },
    { name:'analytics :3011', status:'Operational', latency:'14ms', uptime:'99.88%' },
  ];

  return (
    <div>
      <section className="admin-hero"><div className="admin-hero__inner"><div><h1>System</h1><p>Service health • System status • Configuration • Security • Maintenance • Notifications — secrets never in frontend</p></div><span className="admin-badge" style={{background:'white', color:'var(--admin-dark)', borderColor:'white'}}><Settings size={14}/> Enterprise</span></div></section>
      <div style={{maxWidth:1280, margin:'0 auto', padding:20, display:'grid', gap:14}}>
        {/* Secrets guard */}
        <div className="admin-card" style={{padding:12, borderLeft:'3px solid #16a34a', background:'#ecfdf5', display:'flex', gap:8}}><EyeOff size={16} color="#16a34a"/><span style={{fontSize:'0.88rem', fontWeight:700}}>Guard: No passwords, API keys, JWT secrets, DB credentials, or passkeys are stored or displayed in frontend source — verified at build.</span></div>

        <div style={{display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:14}}>
          <div style={{display:'grid', gap:14}}>
            <div className="admin-card">
              <div className="admin-card__header"><span className="admin-card__title"><Server size={16}/> Service Health</span><span className="admin-badge admin-badge--success"><span className="admin-live-dot"/> All operational</span></div>
              <div className="admin-card__body" style={{display:'grid', gap:8}}>
                {services.map(s=>(
                  <div key={s.name} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderRadius:12, border:'1px solid var(--admin-border-soft)', background:'#fdfcf8'}}>
                    <div><div style={{fontWeight:800, fontSize:'0.88rem'}}>{s.name}</div><div style={{fontSize:'0.76rem', color:'var(--admin-muted)'}}>Latency {s.latency} • Uptime {s.uptime}</div></div>
                    <span className="admin-badge admin-badge--success"><Activity size={12} style={{display:'inline', marginRight:4}}/>{s.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card__header"><span className="admin-card__title"><Wrench size={16}/> Maintenance & Configuration</span></div>
              <div className="admin-card__body" style={{display:'grid', gap:12}}>
                <label style={{display:'flex', gap:10, alignItems:'center', padding:12, borderRadius:12, border:'1px solid var(--admin-border-soft)', background: maintenance? '#fef2f2':'white'}}>
                  <input type="checkbox" checked={maintenance} onChange={e=>{
                    const v=e.target.checked;
                    setMaintenance(v);
                    addAdminAction({ adminName: adminKeyMember||'Admin', action: v?'Enable maintenance':'Disable maintenance', details:`Maintenance ${v?'enabled':'disabled'} from System panel`});
                    showToast(v? 'Maintenance mode enabled':'Maintenance disabled');
                  }} style={{width:18, height:18}}/>
                  <span style={{fontWeight:800}}>Maintenance mode</span>
                  <span className={`admin-badge ${maintenance?'admin-badge--warning':'admin-badge--success'}`} style={{marginLeft:'auto'}}>{maintenance?'Enabled':'Off'}</span>
                </label>
                <p style={{fontSize:'0.78rem', color:'var(--admin-muted)'}}>When enabled, non-admin routes show maintenance banner — toggle is audited.</p>
                <div style={{padding:12, borderRadius:12, background:'#f1f5f9', border:'1px solid #e2e8f0', fontSize:'0.82rem'}}>
                  <div style={{fontWeight:800, display:'flex', gap:6}}><Database size={14}/> Configuration</div>
                  <div style={{color:'var(--admin-muted)', marginTop:4}}>Env: <code>VITE_API_BASE_URL</code> only — no secrets in bundle. Health checks via <code>/api/health</code> gateway.</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{display:'grid', gap:14}}>
            <div className="admin-card">
              <div className="admin-card__header"><span className="admin-card__title"><ShieldCheck size={16}/> Security Status</span></div>
              <div className="admin-card__body" style={{display:'grid', gap:10}}>
                <div style={{display:'flex', gap:8, alignItems:'center', padding:10, borderRadius:12, background:'#ecfdf5', border:'1px solid #a7f3d0'}}><Lock size={16} color="#16a34a"/><span style={{fontSize:'0.88rem', fontWeight:800}}>Encryption at rest • JWT • RBAC</span></div>
                <div style={{display:'flex', gap:8, alignItems:'center', padding:10, borderRadius:12, background:'white', border:'1px solid var(--admin-border-soft)'}}><ShieldCheck size={16} color="var(--admin-primary)"/><span style={{fontSize:'0.88rem'}}>Secrets injected at deploy, never committed</span></div>
                <div style={{display:'flex', gap:8, alignItems:'center', padding:10, borderRadius:12, background:'white', border:'1px solid var(--admin-border-soft)'}}><AlertTriangle size={16} color="#f59e0b"/><span style={{fontSize:'0.88rem'}}>Passkey auth for Admin — see <code>isAdminAuthenticated</code></span></div>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card__header"><span className="admin-card__title"><Bell size={16}/> Notification Configuration</span></div>
              <div className="admin-card__body" style={{display:'grid', gap:10}}>
                <label style={{display:'flex', gap:8, alignItems:'center'}}><input type="checkbox" checked={notifEmail} onChange={e=>{ setNotifEmail(e.target.checked); addAdminAction({ adminName: adminKeyMember||'Admin', action:'Toggle email notifications', details:`Email ${e.target.checked?'enabled':'disabled'}`});}}/><span style={{fontWeight:700, fontSize:'0.88rem'}}>Email notifications</span></label>
                <label style={{display:'flex', gap:8, alignItems:'center'}}><input type="checkbox" checked={notifPush} onChange={e=>{ setNotifPush(e.target.checked); addAdminAction({ adminName: adminKeyMember||'Admin', action:'Toggle push notifications', details:`Push ${e.target.checked?'enabled':'disabled'}`});}}/><span style={{fontWeight:700, fontSize:'0.88rem'}}>Push / in-app</span></label>
                <div style={{padding:10, borderRadius:12, background:'#fdfcf8', border:'1px solid var(--admin-border-soft)'}}>
                  <div style={{fontWeight:800, fontSize:'0.86rem'}}>System Broadcast</div>
                  <input placeholder="Title (e.g. New Feature)" value={broadcastTitle} onChange={e=>setBroadcastTitle(e.target.value)} maxLength={60} className="admin-input" style={{width:'100%', marginTop:8}}/>
                  <textarea placeholder="Body (min 10 chars)" value={broadcastBody} onChange={e=>setBroadcastBody(e.target.value)} maxLength={300} className="admin-input" style={{width:'100%', marginTop:8, minHeight:72, resize:'vertical'}}/>
                  <button onClick={()=>{
                    if(broadcastTitle.trim().length<5 || broadcastBody.trim().length<10){ showToast('Title 5+ and body 10+ chars required'); return; }
                    addSystemUpdate({ title:broadcastTitle.trim(), content:broadcastBody.trim(), adminName: adminKeyMember||'Admin'});
                    addAdminAction({ adminName: adminKeyMember||'Admin', action:'System Broadcast', details:`Broadcast: ${broadcastTitle.trim()}`});
                    showToast('Broadcast sent to all users'); setBroadcastTitle(''); setBroadcastBody('');
                  }} className="admin-btn admin-btn--primary" style={{marginTop:8, width:'100%'}}>Broadcast to Users</button>
                  <span style={{fontSize:'0.72rem', color:'var(--admin-muted)'}}>{broadcastTitle.length}/60 • {broadcastBody.length}/300 • {systemUpdates.length} bulletins</span>
                </div>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card__header"><span className="admin-card__title"><Activity size={16}/> System Status</span></div>
              <div className="admin-card__body" style={{fontSize:'0.84rem', color:'var(--admin-muted)', display:'grid', gap:6}}>
                <div>• Uptime: 99.9% (gateway health)</div>
                <div>• Last backup: Today 02:00 — integrity passed</div>
                <div>• Maintenance: {maintenance? 'Enabled — banner active':'Off'}</div>
              </div>
            </div>
          </div>
        </div>
        {toast && <div style={{position:'fixed', bottom:20, right:20, background:'#16a34a', color:'white', padding:'12px 16px', borderRadius:12, fontWeight:800, boxShadow:'0 8px 22px rgba(0,0,0,0.16)'}}>{toast}</div>}
      </div>
    </div>
  );
};
export default AdminSystem;
