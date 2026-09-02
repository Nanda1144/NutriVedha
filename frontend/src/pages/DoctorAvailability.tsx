import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, AlertCircle, Calendar, Video, X } from 'lucide-react';
import { getAuthToken } from '../services/client';

const DoctorAvailability: React.FC = () => {
  const [status, setStatus] = useState<'Available' | 'In Call' | 'Offline'>('Available');
  const [fee, setFee] = useState(500);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Booked' | 'Completed' | 'Cancelled'>('All');

  const load = async () => {
    if (!getAuthToken()) { setError('Login as Doctor to manage appointments'); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/telemedicine/appointments', { headers: { Authorization: `Bearer ${getAuthToken()}` } }).then(r => r.json());
      if (res.appointments) setAppointments(res.appointments);
      else if (Array.isArray(res)) setAppointments(res);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const filtered = appointments.filter(a => filter === 'All' || a.status === filter);

  const handleStatus = async (next: 'Available' | 'In Call' | 'Offline') => {
    setStatus(next);
    // In production PUT /telemedicine/doctors/:id/status — stub toast for now
  };
  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this appointment? Patient will be notified.')) return;
    try {
      await fetch(`/api/telemedicine/appointments/${id}/cancel`, { method: 'POST', headers: { Authorization: `Bearer ${getAuthToken()}` } });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a));
    } catch (e: any) { setError(e.message); }
  };

  return (
    <div className="container section-padding">
      <div className="section-header">
        <h1>Availability & Appointments</h1>
        <p>Toggle <code>Available / In Call / Offline</code> → <code>PUT /telemedicine/doctors/:id/status</code> PostgreSQL <code>doctor_profiles.status</code> • Fee slider • <code>GET /telemedicine/appointments</code></p>
      </div>

      <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {(['Available', 'In Call', 'Offline'] as const).map(s => (
            <button key={s} className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-outline'}`} onClick={() => handleStatus(s)}>
              {s === 'Available' ? <CheckCircle size={14} /> : s === 'Offline' ? <X size={14} /> : <Clock size={14} />} {s}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <span className="hint-text">Fee ₹{fee}</span>
          <input type="range" min={300} max={2000} step={100} value={fee} onChange={e => setFee(parseInt(e.target.value, 10))} />
        </div>
        <button className="btn btn-ghost btn-xs" onClick={load}>Refresh</button>
      </div>

      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
        <Calendar size={18} />
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {(['All', 'Booked', 'Completed', 'Cancelled'] as const).map(f => (
            <button key={f} className={`btn btn-xs ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <span className="hint-text" style={{ marginLeft: 'auto' }}>{filtered.length} appointments</span>
      </div>

      {loading && <div className="loading-state"><div className="spinner" /><p>Loading appointments…</p></div>}
      {error && <div className="glass-card" style={{ padding: '0.8rem', borderLeft: '3px solid #ef4444', display: 'flex', gap: '0.6rem' }}><AlertCircle size={16} className="text-danger" /><span style={{ fontSize: '0.85rem' }}>{error}</span></div>}

      {filtered.length === 0 && !loading ? (
        <div className="empty-state glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <Video size={48} className="text-muted" />
          <h3>No appointments</h3>
          <p>Patients booking via <code>/telemedicine</code> will appear here (gateway → telemedicine:3006 <code>appointments</code> PostgreSQL).</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {filtered.map(a => (
            <div key={a.id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{a.doctorId || a.doctor}</strong> • {a.date} {a.time} • <span className={`status-pill-small ${a.mode === 'video' ? 'success' : ''}`}>{a.mode}</span> <span className={`status-pill-small ${a.status === 'Booked' ? 'warning' : a.status === 'Cancelled' ? '' : 'success'}`}>{a.status}</span>
                <p className="hint-text" style={{ fontSize: '0.75rem' }}>{a.id}</p>
              </div>
              {a.status === 'Booked' && <button className="btn btn-ghost btn-xs text-danger" onClick={() => handleCancel(a.id)}>Cancel → notify</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAvailability;
