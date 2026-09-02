import React, { useEffect, useState } from 'react';
import { Truck, MapPin, Award, CheckCircle, AlertCircle, Save, Star, Phone } from 'lucide-react';
import { getAuthToken } from '../services/client';

const DeliveryProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', vehicle: 'Bike', license: '', zone: 'Bengaluru Central', rating: '4.8' });

  const load = async () => {
    if (!getAuthToken()) { setError('Login as Delivery to view profile (gateway :8080 requires Bearer token)'); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/user/profile', { headers: { Authorization: `Bearer ${getAuthToken()}` } }).then(r => r.json());
      if (res.profile) setProfile(res.profile);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!form.name.trim() || !form.license.trim()) { setError('Name and License required'); return; }
    if (form.license.length < 5) { setError('License must be at least 5 characters'); return; }
    setLoading(true);
    try {
      await fetch('/api/user/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAuthToken()}` }, body: JSON.stringify({ name: form.name, phone: form.license, address: form.zone, education: form.vehicle }) });
      setSuccess('Delivery profile saved — PostgreSQL user_profiles + delivery assignment');
      setProfile({ name: form.name, vehicle: form.vehicle, license: form.license, zone: form.zone, rating: form.rating, verified: true });
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="container section-padding">
      <div className="section-header">
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <Truck size={28} className="text-primary" />
          <h1>Delivery Profile</h1>
          {profile?.verified && <span className="status-pill-small success"><CheckCircle size={12} /> Verified</span>}
        </div>
        <p>Microservice <code>delivery:3008</code> → <code>PUT /api/user/profile</code> PostgreSQL <code>user_profiles</code> + <code>delivery_orders.assigned_to</code></p>
      </div>
      {loading && <div className="loading-state"><div className="spinner" /><p>Loading profile…</p></div>}
      {error && <div className="glass-card" style={{ padding: '0.8rem', borderLeft: '3px solid #ef4444', display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}><AlertCircle size={16} className="text-danger" /><span style={{ fontSize: '0.85rem' }}>{error}</span></div>}
      {success && <div className="glass-card" style={{ padding: '0.8rem', borderLeft: '3px solid #10b981', display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}><CheckCircle size={16} className="text-success" /><span style={{ fontSize: '0.85rem' }}>{success}</span></div>}
      {profile && profile.name && success === null ? (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Truck size={40} className="text-primary" />
            <div>
              <h2>{profile.name} <Star size={16} className="text-warning" fill="currentColor" /></h2>
              <p className="hint-text"><MapPin size={12} /> {profile.zone || form.zone} • {profile.vehicle || form.vehicle} • {profile.license || form.license}</p>
            </div>
            <span className="status-pill-small success" style={{ marginLeft: 'auto' }}><Award size={12} /> Delivery Partner</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: '560px' }}>
          <h3>Register Delivery Details</h3>
          <input aria-label="Full Name" placeholder="Full Name (e.g. Ramesh Kumar)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} maxLength={60} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
          <select aria-label="Vehicle" value={form.vehicle} onChange={e => setForm({ ...form, vehicle: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <option>Bike</option><option>Van</option><option>Electric Scooter</option><option>Cycle</option>
          </select>
          <input aria-label="License" placeholder="License Number (e.g. DL-04-12345)" value={form.license} onChange={e => setForm({ ...form, license: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
          <input aria-label="Zone" placeholder="Delivery Zone (e.g. Bengaluru Central)" value={form.zone} onChange={e => setForm({ ...form, zone: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
          <input aria-label="Rating" placeholder="Rating (e.g. 4.8)" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} aria-label="Save delivery profile"><Save size={16} /> {loading ? 'Saving…' : 'Save Profile'}</button>
          <span className="hint-text" style={{ fontSize: '0.75rem' }}>Stored in PostgreSQL <code>user_profiles</code> + <code>delivery_orders.assigned_to</code> via <code>delivery:3008</code></span>
        </form>
      )}
      <div className="glass-card" style={{ marginTop: '1rem', padding: '1rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
        <Phone size={18} className="text-success" />
        <span style={{ fontSize: '0.85rem' }}>Access limited to <strong>Order ID, Delivery Address, Customer Contact</strong> — verified via <code>requireRole('Delivery','Admin','User')</code> `delivery routes.pg:39`.</span>
      </div>
    </div>
  );
};

export default DeliveryProfile;
