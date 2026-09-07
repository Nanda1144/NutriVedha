import React, { useEffect, useState } from 'react';
import { Sprout, Plus, Trash2, Edit2, Upload, MapPin, Calendar, Award, Search, X } from 'lucide-react';
import { fetchInventory, addInventoryItem, updateInventoryItem } from '../../services/farmer.service';
import { getAuthToken } from '../../services/client';
import '../../styles/farmer.css';

type Crop = {
  id:string; name:string; variety:string; quantity:number; unit:string; price:number;
  harvestDate:string; farmingMethod:string; location:string; availability:string; prebooked:number; status:'Growing'|'Ready'|'Harvested';
  image:string;
};

const mockCrops: Crop[] = [
  { id:'CR-101', name:'Amla', variety:'Desi', quantity:30, unit:'kg', price:85, harvestDate:'Nov 2026', farmingMethod:'Organic', location:'Pratapgarh, UP', availability:'Available', prebooked:8, status:'Growing', image:'https://images.unsplash.com/photo-1628134707412-23c8a49df5d0?w=600' },
  { id:'CR-102', name:'Ashwagandha', variety:'Nagori', quantity:50, unit:'kg', price:420, harvestDate:'Oct 2026', farmingMethod:'Natural', location:'Neemuch, MP', availability:'Available', prebooked:22, status:'Growing', image:'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600' },
  { id:'CR-103', name:'Turmeric', variety:'Erode', quantity:40, unit:'kg', price:140, harvestDate:'Jan 2027', farmingMethod:'Ayurvedic Grade', location:'Erode, TN', availability:'Limited', prebooked:30, status:'Ready', image:'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?w=600' },
];

const FarmerCrops: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>(mockCrops);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Crop|null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:'', variety:'Desi', quantity:'30', unit:'kg', price:'120', harvestDate:'Nov 2026', farmingMethod:'Organic', location:'Pratapgarh, UP', image:'' });
  const [editing, setEditing] = useState<string|null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editQty, setEditQty] = useState('');
  const [toast, setToast]=useState<string|null>(null);
  const [loading, setLoading]=useState(false);

  useEffect(()=>{
    if(!getAuthToken()) return;
    fetchInventory().then(r=>{
      if(r.inventory?.length){
        setCrops(r.inventory.map((it:any)=>({
          id:it.id, name:it.name, variety:'Desi', quantity:it.stock, unit:it.unit, price:it.price,
          harvestDate:'Nov 2026', farmingMethod:'Organic', location:'Farm', availability: it.stock>10?'Available':'Limited', prebooked:0, status:'Growing', image:'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600'
        })));
      }
    }).catch(()=>{});
  },[]);

  const showToast=(m:string)=>{ setToast(m); setTimeout(()=>setToast(null),2600); };

  const handleAdd=async()=>{
    if(!form.name.trim() || !form.price.trim()){ showToast('Name and Price required'); return; }
    if(parseFloat(form.price) <=0){ showToast('Valid price required'); return; }
    setLoading(true);
    try{
      if(getAuthToken()){
        const res=await addInventoryItem({ name:form.name.trim(), stock:parseInt(form.quantity,10)||0, unit:form.unit, price:parseFloat(form.price) });
        const nc: Crop={ id:res.item.id, name:res.item.name, variety:form.variety, quantity:res.item.stock, unit:res.item.unit, price:res.item.price, harvestDate:form.harvestDate, farmingMethod:form.farmingMethod, location:form.location, availability:'Available', prebooked:0, status:'Growing', image: form.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600' };
        setCrops(prev=>[nc, ...prev]); showToast(`${nc.name} added — PostgreSQL farmer_inventory • Marketplace visible`); setShowAdd(false); setForm({ name:'', variety:'Desi', quantity:'30', unit:'kg', price:'120', harvestDate:'Nov 2026', farmingMethod:'Organic', location:'Pratapgarh, UP', image:'' });
      } else {
        const nc: Crop={ id:`CR-${Date.now()}`, name:form.name.trim(), variety:form.variety, quantity:parseInt(form.quantity,10)||0, unit:form.unit, price:parseFloat(form.price), harvestDate:form.harvestDate, farmingMethod:form.farmingMethod, location:form.location, availability:'Available', prebooked:0, status:'Growing', image: form.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600' };
        setCrops(prev=>[nc, ...prev]); showToast(`${nc.name} added — local`); setShowAdd(false);
      }
    }catch(e:any){ showToast(e.message); }
    setLoading(false);
  };

  const handleEdit=async(id:string)=>{
    const price=parseFloat(editPrice); const qty=parseInt(editQty,10);
    if(isNaN(price) || price<=0){ showToast('Valid price required'); return; }
    if(getAuthToken() && !id.startsWith('CR-')){
      try{ const res=await updateInventoryItem(id, { price, stock: isNaN(qty)? undefined: qty }); setCrops(prev=>prev.map(c=>c.id===id? {...c, price:res.item.price, quantity:res.item.stock ?? c.quantity}:c)); }
      catch(e:any){ showToast(e.message); return; }
    } else {
      setCrops(prev=>prev.map(c=>c.id===id? {...c, price, quantity: isNaN(qty)? c.quantity: qty}:c));
    }
    showToast(`Updated — ${id}`); setEditing(null);
  };

  const handleDelete=async(id:string)=>{
    if(!confirm('Remove crop?')) return;
    if(getAuthToken() && !id.startsWith('CR-')){ try{ await fetch(`/api/farmer/inventory/${id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${getAuthToken()}`}});}catch{}}
    setCrops(prev=>prev.filter(c=>c.id!==id)); showToast('Crop removed');
  };

  const filtered=crops.filter(c=>!q || c.name.toLowerCase().includes(q.toLowerCase()) || c.variety.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <section className="farm-hero">
        <div className="farm-hero__inner">
          <div>
            <h1>Crops</h1>
            <p>Add • Edit • Quantity • Price • Images • Harvest date • Farming method • Status</p>
          </div>
          <button onClick={()=>setShowAdd(true)} style={{justifySelf:'end', padding:'10px 16px', borderRadius:999, background:'white', color:'var(--farm-dark)', fontWeight:900}}><Plus size={16} style={{display:'inline', marginRight:6}}/> Add Crop</button>
        </div>
      </section>

      <div style={{maxWidth:1200, margin:'0 auto', padding:20}}>
        <div style={{display:'flex', gap:10, flexWrap:'wrap', marginBottom:14}}>
          <div style={{flex:1, minWidth:220, position:'relative'}}>
            <Search size={16} style={{position:'absolute', left:12, top:12, color:'var(--farm-muted)'}}/>
            <input aria-label="Search crops" placeholder="Search name, variety" value={q} onChange={e=>setQ(e.target.value)} style={{width:'100%', padding:'10px 14px 10px 36px', borderRadius:12, border:'1px solid var(--farm-border)'}}/>
          </div>
          <span style={{alignSelf:'center', color:'var(--farm-muted)', fontWeight:800, fontSize:'0.84rem'}}>{filtered.length} crops</span>
        </div>

        {filtered.length===0 ? (
          <div className="farm-card" style={{padding:40, textAlign:'center'}}><Sprout size={40} color="var(--farm-muted)"/><p style={{marginTop:10, color:'var(--farm-muted)'}}>No crops — add one</p></div>
        ) : (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:14}}>
            {filtered.map(c=>(
              <div key={c.id} className="farm-card farm-crop-card" style={{padding:14, display:'grid', gap:10}}>
                <div className="farm-crop-media" style={{height:160, cursor:'pointer'}} onClick={()=>setSelected(c)}>
                  <img src={c.image} alt={c.name} />
                </div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <strong style={{display:'flex', gap:6, alignItems:'center'}}><Sprout size={16} color="var(--farm-primary)"/>{c.name} <span style={{fontWeight:400, color:'var(--farm-muted)', fontSize:'0.82rem'}}>• {c.variety}</span></strong>
                  <span className={`farm-badge ${c.status==='Ready'?'farm-badge--warning': c.status==='Harvested'?'farm-badge--success':'farm-badge--neutral'}`}>{c.status}</span>
                </div>
                <p style={{color:'var(--farm-muted)', fontSize:'0.82rem', display:'flex', gap:8, flexWrap:'wrap'}}><MapPin size={12}/>{c.location} • <Calendar size={12}/>{c.harvestDate} • <Award size={12}/>{c.farmingMethod}</p>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:'0.84rem'}}>
                  <span>Qty: <strong>{c.quantity}{c.unit}</strong> • ₹{c.price}</span>
                  <span>Pre-booked: <strong>{c.prebooked}{c.unit}</strong></span>
                  <span>Availability: <strong>{c.availability}</strong></span>
                  <span style={{fontSize:'0.72rem', color:'var(--farm-muted)'}}>{c.id}</span>
                </div>
                {editing===c.id ? (
                  <div style={{display:'grid', gap:8, padding:10, borderRadius:12, background:'#fdfcf8', border:'1px solid var(--farm-border)'}}>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                      <input aria-label="Edit quantity" value={editQty} onChange={e=>setEditQty(e.target.value)} placeholder="Qty" style={{padding:'8px', borderRadius:10, border:'1px solid var(--farm-border)'}}/>
                      <input aria-label="Edit price" value={editPrice} onChange={e=>setEditPrice(e.target.value)} placeholder="Price" style={{padding:'8px', borderRadius:10, border:'1px solid var(--farm-border)'}}/>
                    </div>
                    <div style={{display:'flex', gap:8}}><button onClick={()=>handleEdit(c.id)} style={{padding:'7px 12px', borderRadius:999, background:'var(--farm-primary)', color:'white', fontWeight:900}}>Save</button><button onClick={()=>setEditing(null)} style={{padding:'7px 12px', borderRadius:999, border:'1px solid var(--farm-border)', background:'white', fontWeight:800}}>Cancel</button></div>
                  </div>
                ) : (
                  <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                    <button onClick={()=>{setEditing(c.id); setEditPrice(String(c.price)); setEditQty(String(c.quantity));}} style={{padding:'7px 12px', borderRadius:999, border:'1px solid var(--farm-border)', background:'white', fontWeight:800, display:'inline-flex', gap:6}}><Edit2 size={12}/> Edit qty/price</button>
                    <button onClick={()=>handleDelete(c.id)} style={{padding:'7px 12px', borderRadius:999, border:'1px solid #fecaca', background:'#fef2f2', color:'#991b1b', fontWeight:800, display:'inline-flex', gap:6}}><Trash2 size={12}/> Remove</button>
                    <button onClick={()=>setSelected(c)} style={{marginLeft:'auto', padding:'7px 12px', borderRadius:999, background:'var(--farm-primary)', color:'white', fontWeight:800}}>Details →</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add modal */}
        {showAdd && (
          <div style={{position:'fixed', inset:0, background:'rgba(15,30,15,0.28)', display:'grid', placeItems:'center', zIndex:80, padding:16}} onClick={()=>setShowAdd(false)}>
            <div className="farm-card" onClick={e=>e.stopPropagation()} style={{width:'100%', maxWidth:560, padding:20, display:'grid', gap:12, maxHeight:'92vh', overflow:'auto'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><h3>Add Crop</h3><button onClick={()=>setShowAdd(false)} style={{padding:6, borderRadius:8, border:'1px solid var(--farm-border)', background:'white'}}><X size={16}/></button></div>
              <input placeholder="Name (e.g. Amla)" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} style={{padding:'10px 12px', borderRadius:12, border:'1px solid var(--farm-border)'}}/>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 90px', gap:8}}>
                <input placeholder="Variety" value={form.variety} onChange={e=>setForm({...form, variety:e.target.value})} style={{padding:'10px', borderRadius:12, border:'1px solid var(--farm-border)'}}/>
                <input placeholder="Qty" value={form.quantity} onChange={e=>setForm({...form, quantity:e.target.value})} style={{padding:'10px', borderRadius:12, border:'1px solid var(--farm-border)'}}/>
                <select value={form.unit} onChange={e=>setForm({...form, unit:e.target.value})} style={{padding:'10px', borderRadius:12, border:'1px solid var(--farm-border)'}}><option>kg</option><option>g</option><option>pieces</option></select>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                <input placeholder="Price ₹" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} style={{padding:'10px', borderRadius:12, border:'1px solid var(--farm-border)'}}/>
                <input placeholder="Harvest (e.g. Nov 2026)" value={form.harvestDate} onChange={e=>setForm({...form, harvestDate:e.target.value})} style={{padding:'10px', borderRadius:12, border:'1px solid var(--farm-border)'}}/>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                <select value={form.farmingMethod} onChange={e=>setForm({...form, farmingMethod:e.target.value})} style={{padding:'10px', borderRadius:12, border:'1px solid var(--farm-border)'}}><option>Organic</option><option>Natural</option><option>Ayurvedic Grade</option><option>Regenerative</option></select>
                <input placeholder="Location" value={form.location} onChange={e=>setForm({...form, location:e.target.value})} style={{padding:'10px', borderRadius:12, border:'1px solid var(--farm-border)'}}/>
              </div>
              <div style={{display:'flex', gap:8, alignItems:'center'}}>
                <input placeholder="Image URL (optional)" value={form.image} onChange={e=>setForm({...form, image:e.target.value})} style={{flex:1, padding:'10px', borderRadius:12, border:'1px solid var(--farm-border)'}}/>
                <span style={{padding:'8px 10px', borderRadius:12, border:'1px dashed var(--farm-border)', display:'inline-flex', gap:6, fontSize:'0.78rem', color:'var(--farm-muted)'}}><Upload size={14}/> S3 stub</span>
              </div>
              <button onClick={handleAdd} disabled={loading} style={{padding:'10px', borderRadius:999, background:'var(--farm-primary)', color:'white', fontWeight:900, display:'inline-flex', gap:6, justifyContent:'center'}}><Plus size={16}/>{loading?'Adding…':'Add Crop'}</button>
            </div>
          </div>
        )}

        {/* Details modal — image zoom */}
        {selected && (
          <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.42)', display:'grid', placeItems:'center', zIndex:82, padding:16}} onClick={()=>setSelected(null)}>
            <div className="farm-card" onClick={e=>e.stopPropagation()} style={{maxWidth:760, width:'100%', padding:16, display:'grid', gap:14, maxHeight:'92vh', overflow:'auto'}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
                <div className="farm-crop-media" style={{height:240}}><img src={selected.image} alt={selected.name} /></div>
                <div style={{display:'grid', gap:8}}>
                  <h2>{selected.name} <span style={{fontWeight:400, color:'var(--farm-muted)', fontSize:'0.9rem'}}>• {selected.variety}</span></h2>
                  <p style={{fontWeight:900, color:'var(--farm-primary)'}}>₹{selected.price}/{selected.unit} • Qty {selected.quantity}{selected.unit} • Pre-booked {selected.prebooked}{selected.unit}</p>
                  <p style={{color:'var(--farm-muted)', fontSize:'0.88rem'}}><Calendar size={12} style={{display:'inline', marginRight:4}}/>Harvest {selected.harvestDate} • <Award size={12} style={{display:'inline', marginRight:4}}/> {selected.farmingMethod} • <MapPin size={12} style={{display:'inline', marginRight:4}}/>{selected.location}</p>
                  <span className={`farm-badge ${selected.availability==='Available'?'farm-badge--success':'farm-badge--warning'}`}>{selected.availability} • {selected.status}</span>
                  <div style={{marginTop:6, padding:10, borderRadius:12, background:'var(--farm-accent-soft)', border:'1px solid rgba(167,201,87,0.22)', fontSize:'0.84rem'}}>Marketplace: User → Crop → Pre-booking → Farmer → Harvest → Order → Delivery</div>
                </div>
              </div>
              <button onClick={()=>setSelected(null)} style={{justifySelf:'end', padding:'8px 14px', borderRadius:999, border:'1px solid var(--farm-border)', background:'white', fontWeight:800}}>Close</button>
            </div>
          </div>
        )}

        {toast && <div style={{position:'fixed', bottom:20, right:20, background:'#22c55e', color:'white', padding:'12px 16px', borderRadius:12, fontWeight:800}}>{toast}</div>}
      </div>
    </div>
  );
};
export default FarmerCrops;
