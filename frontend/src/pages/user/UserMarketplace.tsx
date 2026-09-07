import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Sprout, Star, MapPin, CheckCircle } from 'lucide-react';
import { fetchCrops, prebookCrop } from '../../services/marketplace.service';
import '../../styles/user.css';

const UserMarketplace: React.FC = () => {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [crops, setCrops] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(()=>{ (async()=>{
    try{ setLoading(true); const r=await fetchCrops(); setCrops((r as any).crops || (r as any) || []); }
    catch(e:any){ setError(e.message); setCrops([
      { id:1, name:'Organic Amla', image:'https://images.unsplash.com/photo-1628134707412-23c8a49df5d0?w=600', category:'Ayurvedic Grade', price:85, marketPrice:120, farmer:{name:'Ram Singh', location:'Pratapgarh, UP', experience:'25y', verified:true}, harvestDate:'Oct 2026', description:'High Vitamin C, sun-dried', benefits:'Immunity, skin', dietSupport:'Immunity Booster' },
      { id:2, name:'Turmeric', image:'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?w=600', category:'Natural', price:140, marketPrice:190, farmer:{name:'Savitri', location:'Erode, TN', experience:'15y', verified:true}, harvestDate:'Jan 2027', description:'Erode curcumin', benefits:'Anti-inflammatory', dietSupport:'Joint health' },
      { id:3, name:'Ashwagandha Roots', image:'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600', category:'Ayurvedic Grade', price:420, marketPrice:550, farmer:{name:'Gopal', location:'Neemuch, MP', experience:'30y', verified:true}, harvestDate:'Nov 2026', description:'Sun-dried roots', benefits:'Stress, sleep', dietSupport:'Vitality' },
    ]); }
    finally{ setLoading(false); }
  })(); },[]);

  const filtered = crops.filter(c=> (!q || c.name.toLowerCase().includes(q.toLowerCase())) && (category==='All' || c.category===category));

  const handlePrebook = async ()=>{
    try{
      await prebookCrop(String(selected.id), qty);
      setSuccess(`Pre-booked ${qty}kg of ${selected.name} — check Orders`);
      setTimeout(()=>setSuccess(null), 2500);
      setSelected(null);
    }catch(e:any){ setError(e.message||'Pre-book failed'); setTimeout(()=>setError(null), 2500); }
  };

  return (
    <div>
      <section className="user-hero">
        <div className="user-hero__inner">
          <div>
            <h1>Marketplace</h1>
            <p>Search • Category • Product cards • Details • Farmer • Price • Pre-booking • Cart • Checkout.</p>
          </div>
          <img src="/hero.png" alt="Marketplace" className="user-hero__img" />
        </div>
      </section>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:20 }}>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:16 }}>
          <div style={{ flex:1, position:'relative', minWidth:200 }}>
            <Search size={18} style={{ position:'absolute', left:12, top:12, color:'var(--user-muted)' }} />
            <input placeholder="Search products" value={q} onChange={e=>setQ(e.target.value)} style={{ width:'100%', padding:'10px 14px 10px 36px', borderRadius:30, border:'1px solid #e8ecec', fontFamily:'"Times New Roman"' }} />
          </div>
          <select value={category} onChange={e=>setCategory(e.target.value)} style={{ padding:'10px 14px', borderRadius:30, border:'1px solid #e8ecec', fontFamily:'"Times New Roman"', fontWeight:700 }}>
            <option>All</option><option>Ayurvedic Grade</option><option>Natural</option>
          </select>
        </div>

        {loading ? <p style={{ textAlign:'center', padding:40 }}>Loading marketplace...</p> : filtered.length===0 ? (
          <div className="user-card" style={{ padding:40, textAlign:'center' }}>
            <Sprout size={40} color="var(--user-primary)" />
            <p style={{ marginTop:12, fontWeight:700 }}>No products found.</p>
            <p style={{ color:'var(--user-muted)' }}>Try different search or category.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px,1fr))', gap:16 }}>
            {filtered.map(c=>(
              <div key={c.id} className="user-card user-product-card" style={{ padding:14, cursor:'pointer' }} onClick={()=>setSelected(c)}>
                <div style={{ height:160, borderRadius:30, overflow:'hidden', background:'#f8fafc' }}>
                  <img src={c.image} alt={c.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
                <div style={{ marginTop:10 }}>
                  <span style={{ padding:'4px 8px', borderRadius:30, background:'var(--user-accent-soft)', color:'var(--user-primary-dark)', fontWeight:800, fontSize:'0.75rem' }}>{c.category}</span>
                  <h3 style={{ marginTop:6 }}>{c.name}</h3>
                  <p style={{ color:'var(--user-muted)', fontSize:'0.85rem', display:'flex', gap:6, alignItems:'center' }}><MapPin size={12} /> {c.farmer?.name} • {c.harvestDate}</p>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
                    <span style={{ fontWeight:800, color:'var(--user-primary)' }}>₹{c.price}/kg <small style={{ color:'var(--user-muted)', textDecoration:'line-through' }}>₹{c.marketPrice}</small></span>
                    <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.85rem', color:'#f59e0b', fontWeight:700 }}><Star size={14} /> 4.8</span>
                  </div>
                  <button onClick={(e)=>{e.stopPropagation(); setSelected(c);}} style={{ marginTop:10, width:'100%', padding:'10px', borderRadius:30, background:'var(--user-primary)', color:'white', fontWeight:800 }}>View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product details modal */}
        {selected && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'grid', placeItems:'center', zIndex:80, padding:20 }}>
            <div className="user-card" style={{ maxWidth:720, width:'100%', maxHeight:'90vh', overflow:'auto', padding:20, display:'grid', gap:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div>
                  <img src={selected.image} alt={selected.name} className="user-zoom-img" style={{ width:'100%', borderRadius:30 }} />
                  <div style={{ marginTop:12, display:'flex', gap:8 }}>
                    {[selected.image, selected.image].map((img,i)=><img key={i} src={img} alt="" style={{ width:60, height:60, borderRadius:30, border:'1px solid #e8ecec', objectFit:'cover' }} />)}
                  </div>
                </div>
                <div>
                  <h2>{selected.name}</h2>
                  <p style={{ color:'var(--user-muted)', fontSize:'0.9rem' }}>{selected.description}</p>
                  <div style={{ marginTop:12, padding:12, borderRadius:30, background:'var(--user-accent-soft)', border:'1px solid rgba(167,201,87,0.2)' }}>
                    <p style={{ fontWeight:800, display:'flex', gap:6 }}><Sprout size={16} color="var(--user-primary)" /> Farmer: {selected.farmer?.name} • {selected.farmer?.location} • {selected.farmer?.experience}</p>
                    <p style={{ fontSize:'0.85rem', color:'var(--user-muted)', display:'flex', gap:4, alignItems:'center' }}>Farming: Natural • Verified {selected.farmer?.verified && <CheckCircle size={14} color="#22c55e" />} • Harvest {selected.harvestDate}</p>
                  </div>
                  <div style={{ marginTop:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontWeight:800, fontSize:'1.1rem', color:'var(--user-primary)' }}>₹{selected.price}/kg</span>
                    <span style={{ color:'var(--user-muted)', fontSize:'0.85rem' }}>Expected: {selected.harvestDate} • Nutrition: {selected.dietSupport}</span>
                  </div>
                  <div style={{ marginTop:12, display:'flex', gap:8, alignItems:'center' }}>
                    <button onClick={()=>setQty(Math.max(1, qty-1))} style={{ width:36, height:36, borderRadius:'50%', border:'1px solid #e8ecec', background:'white' }}>-</button>
                    <span style={{ fontWeight:800, minWidth:32, textAlign:'center' }}>{qty}kg</span>
                    <button onClick={()=>setQty(Math.min(20, qty+1))} style={{ width:36, height:36, borderRadius:'50%', border:'1px solid #e8ecec', background:'white' }}>+</button>
                    <span style={{ marginLeft:'auto', fontWeight:700, color:'var(--user-muted)', fontSize:'0.85rem' }}>Total ₹{(selected.price*qty)+40}</span>
                  </div>
                  <div style={{ display:'flex', gap:8, marginTop:12 }}>
                    <button onClick={handlePrebook} style={{ flex:1, padding:'12px', borderRadius:30, background:'var(--user-primary)', color:'white', fontWeight:800 }}><ShoppingBag size={16} style={{ display:'inline', marginRight:6 }} /> Pre-book</button>
                    <button onClick={()=>setSelected(null)} style={{ padding:'12px 16px', borderRadius:30, border:'1px solid #e8ecec', background:'white', fontWeight:700 }}>Close</button>
                  </div>
                  {success && <div style={{ marginTop:10, padding:10, borderRadius:30, background:'#ecfdf5', border:'1px solid #a7f3d0', color:'#065f46' }}>{success}</div>}
                  {error && <div style={{ marginTop:10, padding:10, borderRadius:30, background:'#fef2f2', border:'1px solid #fecaca', color:'#991b1b' }}>{error}</div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default UserMarketplace;
