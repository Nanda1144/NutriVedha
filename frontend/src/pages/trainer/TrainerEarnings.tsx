import React, { useState } from 'react';
import { Wallet, CheckCircle, Clock, TrendingUp, Calendar } from 'lucide-react';
import '../../styles/trainer.css';

const history = [
  { id:'PAY-201', member:'Amit Shah', amount:500, status:'Paid', date:'2026-03-12', session:'HIIT Core — 05:00 PM' },
  { id:'PAY-202', member:'Priya Rai', amount:500, status:'Paid', date:'2026-03-10', session:'Yoga Flow — 06:30 AM' },
  { id:'PAY-203', member:'Karan Mehta', amount:500, status:'Pending', date:'2026-03-15', session:'Mobility — 07:00 PM' },
];

const TrainerEarnings: React.FC = () => {
  const [filter, setFilter]=useState<'All'|'Paid'|'Pending'>('All');
  const filtered = history.filter(h=> filter==='All' || h.status===filter);
  const current = history.filter(h=>h.status==='Paid').reduce((a,c)=>a+c.amount,0);
  const pending = history.filter(h=>h.status==='Pending').reduce((a,c)=>a+c.amount,0);
  const completedSessions = history.filter(h=>h.status==='Paid').length;

  return (
    <div>
      <section className="trainer-hero">
        <div className="trainer-hero__inner">
          <div>
            <h1>Earnings</h1>
            <p>Current earnings • Completed sessions • Pending amount • History</p>
          </div>
          <div style={{textAlign:'right'}}><span className="trainer-badge" style={{background:'white', color:'var(--trainer-dark)', borderColor:'white', fontSize:'0.9rem', padding:'8px 14px'}}><Wallet size={14}/> ₹{current.toLocaleString()} earned</span></div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20, display:'grid', gap:16}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12}} className="trainer-stagger">
          <div className="trainer-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><Wallet size={22} color="var(--trainer-primary)"/><div><div style={{fontWeight:900, fontSize:'1.5rem'}}>₹{current.toLocaleString()}</div><div style={{color:'var(--trainer-muted)', fontSize:'0.82rem', fontWeight:800}}>Current Earnings</div></div></div>
          <div className="trainer-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><CheckCircle size={22} color="#22c55e"/><div><div style={{fontWeight:900, fontSize:'1.5rem'}}>{completedSessions}</div><div style={{color:'var(--trainer-muted)', fontSize:'0.82rem', fontWeight:800}}>Completed Sessions</div></div></div>
          <div className="trainer-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><Clock size={22} color="#f59e0b"/><div><div style={{fontWeight:900, fontSize:'1.5rem'}}>₹{pending.toLocaleString()}</div><div style={{color:'var(--trainer-muted)', fontSize:'0.82rem', fontWeight:800}}>Pending Amount</div></div></div>
          <div className="trainer-card" style={{padding:16, display:'flex', gap:12, alignItems:'center'}}><TrendingUp size={22} color="var(--trainer-primary)"/><div><div style={{fontWeight:900, fontSize:'1.5rem'}}>₹{(current+pending).toLocaleString()}</div><div style={{color:'var(--trainer-muted)', fontSize:'0.82rem', fontWeight:800}}>Projected (month)</div></div></div>
        </div>

        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          {(['All','Paid','Pending'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'8px 14px', borderRadius:999, border:'1px solid var(--trainer-border)', background: filter===f?'var(--trainer-primary)':'white', color:filter===f?'white':'var(--trainer-muted)', fontWeight:900, fontSize:'0.84rem'}}>{f}</button>
          ))}
          <span style={{marginLeft:'auto', color:'var(--trainer-muted)', fontWeight:800, fontSize:'0.84rem'}}>{filtered.length} records</span>
        </div>

        <div className="trainer-card" style={{overflow:'auto'}}>
          <table className="trainer-table" aria-label="Earnings history">
            <thead><tr><th>ID</th><th>Member</th><th>Session</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(h=>(
                <tr key={h.id}>
                  <td style={{fontWeight:800, fontSize:'0.82rem'}}>{h.id}</td>
                  <td><strong>{h.member}</strong></td>
                  <td style={{color:'var(--trainer-muted)', fontSize:'0.88rem'}}>{h.session}</td>
                  <td><span style={{display:'flex', gap:4, alignItems:'center', fontSize:'0.88rem'}}><Calendar size={12}/>{h.date}</span></td>
                  <td style={{fontWeight:900}}>₹{h.amount}</td>
                  <td><span className={`trainer-badge ${h.status==='Paid'?'trainer-badge--success':'trainer-badge--warning'}`}>{h.status==='Paid'?<CheckCircle size={12} style={{display:'inline', marginRight:4}}/>:<Clock size={12} style={{display:'inline', marginRight:4}}/>}{h.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0 && <div style={{padding:30, textAlign:'center', color:'var(--trainer-muted)'}}>No records for filter</div>}
        </div>
      </div>
    </div>
  );
};
export default TrainerEarnings;
