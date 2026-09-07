import React, { useEffect, useState } from 'react';
import { ShoppingBag, Calendar, Search, Package } from 'lucide-react';
import { fetchBookings } from '../../services/marketplace.service';
import { getAuthToken } from '../../services/client';
import '../../styles/farmer.css';

const FarmerPreBookings: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter]=useState<'All'|'Growing'|'Harvested'|'Packed'|'Delivered'>('All');
  const [q, setQ]=useState('');
  const [loading, setLoading]=useState(true);
  const [error, setError]=useState<string|null>(null);

  useEffect(()=>{
    if(!getAuthToken()){ setError('Login as Farmer to view pre-bookings'); setLoading(false); return; }
    fetchBookings().then(r=>{
      if(r.bookings?.length) {
        setBookings(r.bookings.map((b:any)=>({
          id:b.id, crop: b.crop?.name || 'Ashwagandha', quantity:`${b.quantity}kg`, bookingDate: (b.orderDate||'2026-03-10').slice(0,10), expectedHarvest: b.crop?.harvestDate || 'Nov 2026', status:b.status || 'Growing', customer: `User ${String(b.cropId).slice(0,4)}`
        })));
      } else throw new Error('no bookings');
    }).catch(()=> setBookings([
      { id:'BK-201', crop:'Ashwagandha', quantity:'5kg', bookingDate:'2026-03-10', expectedHarvest:'Nov 2026', status:'Growing', customer:'Rahul K.' },
      { id:'BK-202', crop:'Amla', quantity:'3kg', bookingDate:'2026-03-08', expectedHarvest:'Oct 2026', status:'Growing', customer:'Meera S.' },
      { id:'BK-203', crop:'Turmeric', quantity:'10kg', bookingDate:'2026-02-28', expectedHarvest:'Jan 2027', status:'Harvested', customer:'Aarav P.' },
    ])).finally(()=>setLoading(false));
  },[]);

  const filtered=bookings.filter(b=>{
    const mFilter= filter==='All' || b.status===filter;
    const mQ=!q || b.crop.toLowerCase().includes(q.toLowerCase()) || b.id.toLowerCase().includes(q.toLowerCase()) || b.customer.toLowerCase().includes(q.toLowerCase());
    return mFilter && mQ;
  });

  return (
    <div>
      <section className="farm-hero">
        <div className="farm-hero__inner">
          <div>
            <h1>Pre-bookings</h1>
            <p>Customer / order • Crop • Quantity • Booking date • Expected harvest • Status — Marketplace → Farmer</p>
          </div>
          <div><span className="farm-badge" style={{background:'white', color:'var(--farm-dark)', borderColor:'white'}}><ShoppingBag size={14}/>{bookings.length} bookings</span></div>
        </div>
      </section>
      <div style={{maxWidth:1100, margin:'0 auto', padding:20}}>
        <div style={{display:'flex', gap:10, flexWrap:'wrap', marginBottom:14}}>
          <div style={{flex:1, minWidth:220, position:'relative'}}>
            <Search size={16} style={{position:'absolute', left:12, top:12, color:'var(--farm-muted)'}}/>
            <input aria-label="Search pre-bookings" placeholder="Search crop, order, customer" value={q} onChange={e=>setQ(e.target.value)} style={{width:'100%', padding:'10px 14px 10px 36px', borderRadius:12, border:'1px solid var(--farm-border)'}}/>
          </div>
          {(['All','Growing','Harvested','Packed','Delivered'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'8px 14px', borderRadius:999, border:'1px solid var(--farm-border)', background: filter===f?'var(--farm-primary)':'white', color:filter===f?'white':'var(--farm-muted)', fontWeight:900, fontSize:'0.84rem'}}>{f}</button>
          ))}
        </div>

        {loading ? <p style={{textAlign:'center', padding:30}}>Loading pre-bookings…</p> : error ? <div className="farm-card" style={{padding:14, borderLeft:'3px solid #ef4444'}}>{error}</div> : filtered.length===0 ? (
          <div className="farm-card" style={{padding:40, textAlign:'center'}}><Package size={40} color="var(--farm-muted)"/><p style={{marginTop:10, color:'var(--farm-muted)'}}>No pre-bookings for filter</p><p style={{fontSize:'0.82rem', color:'var(--farm-muted)'}}>User Marketplace pre-book creates a booking → visible here</p></div>
        ) : (
          <div className="farm-card" style={{overflow:'auto'}}>
            <table className="farm-table" aria-label="Pre-bookings">
              <thead><tr><th>Order</th><th>Customer</th><th>Crop</th><th>Qty</th><th>Booking date</th><th>Expected harvest</th><th>Status</th></tr></thead>
              <tbody className="farm-stagger">
                {filtered.map(b=>(
                  <tr key={b.id}>
                    <td style={{fontWeight:800, fontSize:'0.82rem'}}>{b.id}</td>
                    <td>{b.customer}</td>
                    <td><strong>{b.crop}</strong></td>
                    <td><span className="farm-badge farm-badge--neutral">{b.quantity}</span></td>
                    <td><span style={{display:'inline-flex', gap:4, alignItems:'center', fontSize:'0.88rem'}}><Calendar size={12}/>{b.bookingDate}</span></td>
                    <td>{b.expectedHarvest}</td>
                    <td><span className={`farm-badge ${b.status==='Delivered'?'farm-badge--success': b.status==='Growing'?'farm-badge--warning':'farm-badge--neutral'}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default FarmerPreBookings;
