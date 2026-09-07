import React, { useEffect, useState } from 'react';
import { Wallet, Clock, CheckCircle, TrendingUp, Package, Calendar, Search, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchEarnings } from '../../services/farmer.service';
import { getAuthToken } from '../../services/client';
import '../../styles/farmer.css';

const FarmerEarnings: React.FC = () => {
  const [earnings, setEarnings]=useState<any[]>([]);
  const [total, setTotal]=useState(0);
  const [filter, setFilter]=useState<'All'|'Paid'|'Pending'>('All');
  const [q, setQ]=useState('');
  const [loading, setLoading]=useState(true);
  const [error, setError]=useState<string|null>(null);

  useEffect(()=>{
    if(!getAuthToken()){ setError('Login as Farmer to view earnings'); setLoading(false); return; }
    fetchEarnings().then(r=>{
      const list=r.earnings?.length ? r.earnings : [
        { id:'E-201', month:'Mar 2026', amount:18200, source:'Marketplace — Amla • ORD-401', status:'Paid' },
        { id:'E-202', month:'Mar 2026', amount:4200, source:'Marketplace — Turmeric • ORD-403', status:'Pending' },
        { id:'E-203', month:'Feb 2026', amount:20450, source:'Marketplace — Ashwagandha', status:'Paid' },
      ];
      setEarnings(list as any); setTotal(r.total || list.reduce((a,c:any)=>a+c.amount,0));
    }).catch(e=>setError(e.message)).finally(()=>setLoading(false));
  },[]);

  const paid = earnings.filter(e=> (e.status||'Paid')==='Paid').reduce((a,c)=>a+c.amount,0);
  const pending = earnings.filter(e=>e.status==='Pending').reduce((a,c)=>a+c.amount,0);
  const completedSessions = earnings.filter(e=> (e.status||'Paid')==='Paid').length;

  const filtered=earnings.filter(e=>{
    const mFilter= filter==='All' || (e.status||'Paid')===filter;
    const mQ=!q || e.month.toLowerCase().includes(q.toLowerCase()) || e.source.toLowerCase().includes(q.toLowerCase());
    return mFilter && mQ;
  });

  const handleExport=()=>{
    const blob=new Blob([JSON.stringify({ earnings, total, exportedAt:new Date().toISOString() }, null, 2)], {type:'application/json'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`farmer-earnings-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div>
      <section className="farm-hero">
        <div className="farm-hero__inner">
          <div>
            <h1>Earnings</h1>
            <p>Total • Pending • Paid • Order earnings • Transaction history — farmer_earnings</p>
          </div>
          <div style={{textAlign:'right'}}><span className="farm-badge" style={{background:'white', color:'var(--farm-dark)', borderColor:'white', padding:'8px 14px', fontSize:'0.9rem'}}><Wallet size={14}/> ₹{total.toLocaleString()} total</span></div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20, display:'grid', gap:16}}>
        {error ? <div className="farm-card" style={{padding:14, borderLeft:'3px solid #ef4444'}}>{error}</div> : null}
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12}} className="farm-stagger">
          <div className="farm-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><Wallet size={22} color="var(--farm-primary)"/><div><div style={{fontWeight:900, fontSize:'1.5rem'}}>₹{total.toLocaleString()}</div><div style={{color:'var(--farm-muted)', fontSize:'0.82rem', fontWeight:800}}>Total</div></div></div>
          <div className="farm-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><CheckCircle size={22} color="#22c55e"/><div><div style={{fontWeight:900, fontSize:'1.5rem'}}>₹{paid.toLocaleString()}</div><div style={{color:'var(--farm-muted)', fontSize:'0.82rem', fontWeight:800}}>Paid</div></div></div>
          <div className="farm-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><Clock size={22} color="#f59e0b"/><div><div style={{fontWeight:900, fontSize:'1.5rem'}}>₹{pending.toLocaleString()}</div><div style={{color:'var(--farm-muted)', fontSize:'0.82rem', fontWeight:800}}>Pending</div></div></div>
          <div className="farm-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><Package size={22} color="var(--farm-primary)"/><div><div style={{fontWeight:900, fontSize:'1.5rem'}}>{completedSessions}</div><div style={{color:'var(--farm-muted)', fontSize:'0.82rem', fontWeight:800}}>Paid Orders</div></div></div>
        </div>

        <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
          <div style={{flex:1, minWidth:200, position:'relative'}}>
            <Search size={16} style={{position:'absolute', left:12, top:12, color:'var(--farm-muted)'}}/>
            <input placeholder="Search month or source" value={q} onChange={e=>setQ(e.target.value)} style={{width:'100%', padding:'10px 14px 10px 36px', borderRadius:12, border:'1px solid var(--farm-border)'}}/>
          </div>
          {(['All','Paid','Pending'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'8px 14px', borderRadius:999, border:'1px solid var(--farm-border)', background: filter===f?'var(--farm-primary)':'white', color:filter===f?'white':'var(--farm-muted)', fontWeight:900, fontSize:'0.84rem'}}>{f}</button>
          ))}
          <button onClick={handleExport} style={{padding:'8px 14px', borderRadius:999, border:'1px solid var(--farm-border)', background:'white', fontWeight:800, display:'inline-flex', gap:6}}><Download size={14}/> Export</button>
        </div>

        {loading ? <p style={{textAlign:'center', padding:30}}>Loading earnings…</p> : filtered.length===0 ? (
          <div className="farm-card" style={{padding:40, textAlign:'center'}}><Calendar size={40} color="var(--farm-muted)"/><p style={{marginTop:10, color:'var(--farm-muted)'}}>No transactions for filter</p></div>
        ) : (
          <div className="farm-card" style={{overflow:'auto'}}>
            <table className="farm-table" aria-label="Earnings history">
              <thead><tr><th>Month</th><th>Source / Order</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.map(e=>(
                  <tr key={e.id}>
                    <td style={{fontWeight:800}}><Calendar size={12} style={{display:'inline', marginRight:4}}/>{e.month}</td>
                    <td style={{color:'var(--farm-muted)', fontSize:'0.88rem'}}>{e.source}</td>
                    <td style={{fontWeight:900}}>₹{e.amount}</td>
                    <td><span className={`farm-badge ${e.status==='Pending'?'farm-badge--warning':'farm-badge--success'}`}>{e.status==='Pending'?<Clock size={12} style={{display:'inline', marginRight:4}}/>:<CheckCircle size={12} style={{display:'inline', marginRight:4}}/>}{e.status||'Paid'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="farm-card" style={{padding:16, display:'flex', gap:10, alignItems:'center', background:'#fdfcf8'}}>
          <TrendingUp size={18} color="var(--farm-primary)"/><span style={{fontSize:'0.88rem', color:'var(--farm-muted)', fontWeight:700}}>Order earnings credited on <code>Orders → Completed</code> • Pending clears on pickup confirmation → <Link style={{color:'var(--farm-primary)', fontWeight:900}} to="/farmer/orders">Orders</Link></span>
        </div>
      </div>
    </div>
  );
};
export default FarmerEarnings;
