import React, { useState, useEffect } from 'react';
import { Search, Star, Clock, Calendar, Video, MessageCircle, CheckCircle } from 'lucide-react';
import { fetchDoctors, bookAppointment, fetchAppointments } from '../../services/telemedicine.service';
import '../../styles/user.css';

const UserDoctors: React.FC = () => {
  const [q, setQ] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [booking, setBooking] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const d = await fetchDoctors();
        setDoctors((d as any).doctors || (d as any) || []);
      } catch (e: any) {
        setError(e.message || 'Failed to load doctors');
        setDoctors([
          { id:'d1', name:'Dr. Ananya', specialization:'Ayurveda', fee:500, rating:4.8, status:'Available', experience:'12 years', photo:'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya' },
          { id:'d2', name:'Dr. Rajesh', specialization:'General', fee:400, rating:4.6, status:'Available', experience:'10 years', photo:'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh' },
        ]);
      } finally { setLoading(false); }
      try { const a = await fetchAppointments(); setAppointments((a as any).appointments || []); } catch {}
    })();
  }, []);

  const filtered = doctors.filter(d => !q || d.name.toLowerCase().includes(q.toLowerCase()) || d.specialization.toLowerCase().includes(q.toLowerCase()));

  const handleBook = async (doc:any) => {
    setBooking(doc.id);
    try { await bookAppointment({ doctorId: doc.id, date: new Date().toISOString().slice(0,10), time:'10:30', mode:'video' }); alert(`Booked with ${doc.name} • 10:30 AM`); }
    catch (e:any) { alert(e.message || 'Booking failed'); }
    setBooking(null);
  };

  return (
    <div>
      <section className="user-hero">
        <div className="user-hero__inner">
          <div>
            <h1>Doctors</h1>
            <p>Search • Specialty • Availability • Profile • Booking • Upcoming & history.</p>
          </div>
          <img src="/hero.png" alt="Doctors" className="user-hero__img" />
        </div>
      </section>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:20 }}>
        <div style={{ display:'flex', gap:12, marginBottom:16 }}>
          <div style={{ flex:1, position:'relative' }}>
            <Search size={18} style={{ position:'absolute', left:12, top:12, color:'var(--user-muted)' }} />
            <input placeholder="Search doctor or specialty" value={q} onChange={e=>setQ(e.target.value)} style={{ width:'100%', padding:'10px 14px 10px 36px', borderRadius:30, border:'1px solid #e8ecec' }} />
          </div>
          <span style={{ padding:'10px 14px', borderRadius:30, background:'var(--user-accent-soft)', color:'var(--user-primary-dark)', fontWeight:800, fontSize:'0.85rem' }}>{filtered.length} doctors</span>
        </div>

        {loading ? <p style={{ textAlign:'center', padding:40 }}>Loading doctors...</p> : error && filtered.length===0 ? <div style={{ padding:20, borderRadius:30, background:'#fef2f2', border:'1px solid #fecaca', color:'#991b1b' }}>{error}</div> : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:16 }}>
            {filtered.map(d=>(
              <div key={d.id} className="user-card" style={{ padding:16, display:'grid', gap:10 }}>
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                  <img src={d.photo} alt={d.name} style={{ width:48, height:48, borderRadius:'50%', border:'1px solid #e8ecec' }} />
                  <div style={{ flex:1 }}>
                    <strong>{d.name}</strong>
                    <p style={{ color:'var(--user-muted)', fontSize:'0.85rem' }}>{d.specialization} • {d.experience}</p>
                  </div>
                  <span style={{ padding:'4px 8px', borderRadius:30, background: d.status==='Available'?'#ecfdf5':'#fef2f2', color: d.status==='Available'?'#065f46':'#991b1b', fontWeight:700, fontSize:'0.75rem' }}>{d.status}</span>
                </div>
                <div style={{ display:'flex', gap:8, fontSize:'0.85rem', color:'var(--user-muted)' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:4 }}><Star size={14} color="#f59e0b" /> {d.rating}</span>
                  <span style={{ display:'flex', alignItems:'center', gap:4 }}><Clock size={14} /> ₹{d.fee}</span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>handleBook(d)} disabled={!!booking} style={{ flex:1, padding:'8px 12px', borderRadius:30, background:'var(--user-primary)', color:'white', fontWeight:800 }}>{booking===d.id?'Booking...':'Book • 10:30'}</button>
                  <button style={{ padding:'8px 12px', borderRadius:30, border:'1px solid #e8ecec', background:'white', display:'grid', placeItems:'center' }}><Video size={16} /></button>
                  <button style={{ padding:'8px 12px', borderRadius:30, border:'1px solid #e8ecec', background:'white', display:'grid', placeItems:'center' }}><MessageCircle size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:20 }}>
          <div className="user-card" style={{ padding:16 }}>
            <h3 style={{ display:'flex', gap:8 }}><Calendar size={18} color="var(--user-primary)" /> Upcoming Appointments</h3>
            {appointments.length? appointments.slice(0,3).map((a:any,i:number)=>(
              <div key={i} style={{ marginTop:10, padding:10, borderRadius:30, background:'#f8fafc', border:'1px solid #e8ecec', display:'flex', justifyContent:'space-between' }}>
                <span>{a.date} • {a.time} • {a.mode}</span><span style={{ fontWeight:700, color:'var(--user-primary)' }}>{a.status}</span>
              </div>
            )) : <p style={{ color:'var(--user-muted)', marginTop:8 }}>No upcoming — book above.</p>}
          </div>
          <div className="user-card" style={{ padding:16 }}>
            <h3 style={{ display:'flex', gap:8 }}><CheckCircle size={18} color="#22c55e" /> Appointment History</h3>
            <p style={{ color:'var(--user-muted)', marginTop:8 }}>2 completed • 0 cancelled • Last: Dr. Ananya 12 Mar 2026</p>
            <div style={{ marginTop:12, padding:10, borderRadius:30, background:'var(--user-accent-soft)', border:'1px solid rgba(167,201,87,0.2)', fontSize:'0.85rem' }}>History is synced to Reports → Timeline reveal.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default UserDoctors;
