import React, { useState } from 'react';
import { Wheat, Sprout, Package, Truck, CheckCircle, Calendar, Award, ArrowRight } from 'lucide-react';
import '../../styles/farmer.css';

type Stage = 'Growing'|'Ready'|'Harvested'|'Packed'|'Pickup';
type Lot = { id:string; crop:string; quantity:string; sowing:string; expected:string; stage:Stage };

const initial: Lot[] = [
  { id:'HV-301', crop:'Amla 30kg', quantity:'30kg', sowing:'25 Jan', expected:'Nov 2026', stage:'Growing' },
  { id:'HV-302', crop:'Ashwagandha 50kg', quantity:'50kg', sowing:'10 Jan', expected:'Oct 2026', stage:'Ready' },
  { id:'HV-303', crop:'Turmeric 40kg', quantity:'40kg', sowing:'15 Dec', expected:'Jan 2027', stage:'Harvested' },
  { id:'HV-304', crop:'Brahmi 20kg', quantity:'20kg', sowing:'05 Jan', expected:'Sep 2026', stage:'Packed' },
];

const stages: Stage[] = ['Growing','Ready','Harvested','Packed','Pickup'];

const FarmerHarvest: React.FC = () => {
  const [lots, setLots]=useState<Lot[]>(initial);
  const [toast, setToast]=useState<string|null>(null);
  const showToast=(m:string)=>{setToast(m); setTimeout(()=>setToast(null),2600);};
  const advance=(id:string)=>{
    setLots(prev=>prev.map(l=>{
      if(l.id!==id) return l;
      const idx=stages.indexOf(l.stage);
      if(idx>=stages.length-1) return l;
      const next=stages[idx+1] as Stage;
      showToast(`${l.crop} → ${next} • Timeline advanced • ${next==='Pickup'?'Delivery notified':'Next stage'}`);
      return {...l, stage: next};
    }));
  };

  return (
    <div>
      <section className="farm-hero">
        <div className="farm-hero__inner">
          <div>
            <h1>Harvest</h1>
            <p>Visual timeline: Growing → Ready → Harvested → Packed → Pickup</p>
          </div>
          <div style={{color:'rgba(255,255,255,0.8)', fontSize:'0.84rem', display:'flex', gap:6, alignItems:'center'}}><Wheat size={16}/> Crop growth timeline • Animated</div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20, display:'grid', gap:14}}>
        {lots.map(lot=>{
          const idx=stages.indexOf(lot.stage);
          return (
            <div key={lot.id} className="farm-card" style={{padding:16, display:'grid', gap:14}}>
              <div style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:10}}>
                <div>
                  <strong style={{display:'flex', gap:8, alignItems:'center'}}><Sprout size={16} color="var(--farm-primary)"/>{lot.crop} <span style={{fontWeight:400, fontSize:'0.82rem', color:'var(--farm-muted)'}}>• {lot.id} • {lot.quantity}</span></strong>
                  <p style={{color:'var(--farm-muted)', fontSize:'0.82rem', marginTop:2, display:'flex', gap:8}}><Calendar size={12}/>Sowing {lot.sowing} • Expected {lot.expected} • Stage <span className="farm-badge farm-badge--neutral" style={{fontSize:'0.70rem'}}>{lot.stage}</span></p>
                </div>
                {lot.stage!=='Pickup' ? (
                  <button onClick={()=>advance(lot.id)} style={{padding:'8px 14px', borderRadius:999, background:'var(--farm-primary)', color:'white', fontWeight:900, display:'inline-flex', gap:6, alignSelf:'center'}}><ArrowRight size={14}/> Advance to {stages[idx+1]}</button>
                ) : (
                  <span className="farm-badge farm-badge--success"><Truck size={12}/> Pickup — Delivery assigned</span>
                )}
              </div>

              <div className="farm-timeline" aria-label={`Harvest timeline ${lot.crop}`}>
                {stages.map(s=>{
                  const sIdx=stages.indexOf(s);
                  const state = sIdx < idx ? 'done' : sIdx===idx ? 'active' : 'todo';
                  return (
                    <div key={s} className={`farm-step ${state==='done'?'farm-step--done': state==='active'?'farm-step--active':''}`}>
                      <span className="farm-step__dot" />
                      <span className="farm-step__label">{s}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{display:'flex', gap:8, flexWrap:'wrap', fontSize:'0.76rem', color:'var(--farm-muted)', fontWeight:700}}>
                <span style={{display:'inline-flex', gap:4, alignItems:'center'}}><Sprout size={12}/>Growing</span>
                <span>→</span>
                <span style={{display:'inline-flex', gap:4, alignItems:'center'}}><Award size={12}/>Ready</span>
                <span>→</span>
                <span style={{display:'inline-flex', gap:4, alignItems:'center'}}><Wheat size={12}/>Harvested</span>
                <span>→</span>
                <span style={{display:'inline-flex', gap:4, alignItems:'center'}}><Package size={12}/>Packed</span>
                <span>→</span>
                <span style={{display:'inline-flex', gap:4, alignItems:'center'}}><Truck size={12}/>Pickup</span>
              </div>
              {lot.stage==='Pickup' && <div style={{padding:'10px 12px', borderRadius:12, background:'#ecfdf5', border:'1px solid #a7f3d0', display:'flex', gap:8, fontSize:'0.84rem', fontWeight:800}}><CheckCircle size={16} color="#22c55e"/> Ready for Delivery pickup — order will move to Completed</div>}
            </div>
          );
        })}
        {toast && <div style={{position:'fixed', bottom:20, right:20, background:'#22c55e', color:'white', padding:'12px 16px', borderRadius:12, fontWeight:800}}>{toast}</div>}
      </div>
    </div>
  );
};
export default FarmerHarvest;
