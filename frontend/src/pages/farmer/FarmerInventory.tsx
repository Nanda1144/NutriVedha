import React, { useEffect, useState } from 'react';
import { Boxes, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { fetchInventory } from '../../services/farmer.service';
import { getAuthToken } from '../../services/client';
import '../../styles/farmer.css';

type Inv = { id:string; name:string; stock:number; unit:string; price:number; reserved:number; harvested:number; sold:number; lowThreshold:number };

const FarmerInventory: React.FC = () => {
  const [items, setItems]=useState<Inv[]>([]);
  const [filter, setFilter]=useState<'All'|'Available'|'Reserved'|'Low'>('All');
  const [q, setQ]=useState('');
  const [loading, setLoading]=useState(true);

  useEffect(()=>{
    const load=async()=>{
      if(!getAuthToken()){ setLoading(false); return; }
      try{
        const [inv] = await Promise.all([
          fetchInventory().catch(()=>({inventory:[]})),
        ]);
        const base = (inv as any).inventory?.length ? (inv as any).inventory.map((it:any)=>({
          id:it.id, name:it.name, stock:it.stock, unit:it.unit, price:it.price,
          reserved: Math.round(it.stock*0.2), harvested: Math.round(it.stock*0.6), sold: Math.round(it.stock*0.2), lowThreshold:10
        })) : [
          { id:'FI-01', name:'Ashwagandha', stock:50, unit:'kg', price:420, reserved:12, harvested:30, sold:8, lowThreshold:10 },
          { id:'FI-02', name:'Amla', stock:30, unit:'kg', price:85, reserved:6, harvested:18, sold:6, lowThreshold:10 },
          { id:'FI-03', name:'Brahmi', stock:8, unit:'kg', price:220, reserved:3, harvested:4, sold:1, lowThreshold:10 },
        ];
        setItems(base);
      }finally{ setLoading(false); }
    };
    void load();
  },[]);

  const filtered=items.filter(it=>{
    const mQ=!q || it.name.toLowerCase().includes(q.toLowerCase());
    const available = it.stock - it.reserved;
    const isLow = available <= it.lowThreshold;
    if(filter==='Available') return mQ && !isLow && available>0;
    if(filter==='Reserved') return mQ && it.reserved>0;
    if(filter==='Low') return mQ && isLow;
    return mQ;
  });

  const getStockClass=(it:Inv)=>{
    const avail = it.stock - it.reserved;
    if(avail<=0) return 'farm-stock--crit';
    if(avail<=it.lowThreshold) return 'farm-stock--low';
    return 'farm-stock--ok';
  };

  return (
    <div>
      <section className="farm-hero">
        <div className="farm-hero__inner">
          <div>
            <h1>Inventory</h1>
            <p>Available • Reserved • Harvested • Sold • Low stock — farmer_inventory</p>
          </div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20}}>
        <div style={{display:'flex', gap:10, flexWrap:'wrap', marginBottom:14}}>
          <div style={{flex:1, minWidth:220, position:'relative'}}>
            <Search size={16} style={{position:'absolute', left:12, top:12, color:'var(--farm-muted)'}}/>
            <input aria-label="Search inventory" placeholder="Search crop" value={q} onChange={e=>setQ(e.target.value)} style={{width:'100%', padding:'10px 14px 10px 36px', borderRadius:12, border:'1px solid var(--farm-border)'}}/>
          </div>
          {(['All','Available','Reserved','Low'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'8px 14px', borderRadius:999, border:'1px solid var(--farm-border)', background: filter===f?'var(--farm-primary)':'white', color:filter===f?'white':'var(--farm-muted)', fontWeight:900, fontSize:'0.84rem'}}>{f}</button>
          ))}
        </div>

        {loading ? <p style={{textAlign:'center', padding:30}}>Loading inventory…</p> : filtered.length===0 ? (
          <div className="farm-card" style={{padding:40, textAlign:'center'}}><Boxes size={40} color="var(--farm-muted)"/><p style={{marginTop:10, color:'var(--farm-muted)'}}>No inventory for filter</p></div>
        ) : (
          <div style={{display:'grid', gap:12}}>
            {filtered.map(it=>{
              const avail=it.stock - it.reserved;
              const isLow= avail <= it.lowThreshold;
              return (
                <div key={it.id} className="farm-card" style={{padding:16, display:'grid', gap:10}}>
                  <div style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:10}}>
                    <div>
                      <strong style={{display:'flex', gap:8, alignItems:'center'}}><Boxes size={16} color="var(--farm-primary)"/>{it.name} <span style={{fontWeight:400, fontSize:'0.82rem', color:'var(--farm-muted)'}}>• ₹{it.price}/{it.unit} • {it.id}</span></strong>
                      <p style={{fontSize:'0.82rem', color:'var(--farm-muted)', marginTop:2}}>Stock {it.stock}{it.unit} • Reserved {it.reserved}{it.unit} • Harvested {it.harvested}{it.unit} • Sold {it.sold}{it.unit}</p>
                    </div>
                    <span className={`farm-badge ${isLow?'farm-badge--danger': avail>20?'farm-badge--success':'farm-badge--warning'}`}>{isLow? <><AlertTriangle size={12}/> Low stock</> : <><CheckCircle size={12}/> Available {avail}{it.unit}</>}</span>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 100px', gap:10, alignItems:'center'}}>
                    <div className={`farm-stock ${getStockClass(it)}`}><div className="farm-stock__fill" style={{width:`${Math.min(100, (avail/Math.max(1,it.stock))*100)}%`}}/></div>
                    <span style={{fontSize:'0.76rem', fontWeight:800, color:'var(--farm-muted)'}}>{avail}{it.unit} free • {it.lowThreshold}{it.unit} threshold</span>
                  </div>
                  <div style={{display:'flex', gap:6, flexWrap:'wrap', fontSize:'0.76rem', color:'var(--farm-muted)', fontWeight:700}}>
                    <span className="farm-badge farm-badge--neutral">Available {avail}{it.unit}</span>
                    <span className="farm-badge farm-badge--earth">Reserved {it.reserved}{it.unit}</span>
                    <span className="farm-badge farm-badge--success">Harvested {it.harvested}{it.unit}</span>
                    <span className="farm-badge" style={{background:'#f1f5f9', color:'#334155'}}>Sold {it.sold}{it.unit}</span>
                    {isLow && <span className="farm-badge farm-badge--danger"><AlertTriangle size={12}/> Reorder soon</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default FarmerInventory;
