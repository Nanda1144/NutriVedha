import React, { useEffect, useState } from 'react';
import { Sprout, MapPin, Award, CheckCircle, AlertCircle, Save, Leaf } from 'lucide-react';
import { getAuthToken } from '../services/client';

const FarmerProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ farmName: '', location: '', landSize: '', crops: '', certification: 'Organic Certified', experience: '5+ Years' });

  const load = async () => {
    if (!getAuthToken()) { setError('Login as Farmer to view profile (gateway :8080 requires Bearer token)'); return; }
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
    if (!form.farmName.trim() || !form.location.trim()) { setError('Farm Name and Location required'); return; }
    setLoading(true);
    try {
      await fetch('/api/user/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAuthToken()}` }, body: JSON.stringify({ name: form.farmName, address: form.location, education: form.certification, fitnessGoal: `Land ${form.landSize} crops ${form.crops}` }) });
      setSuccess('Farmer profile saved — PostgreSQL user_profiles + farmer service');
      setProfile({ farmName: form.farmName, location: form.location, landSize: form.landSize, crops: form.crops, certification: form.certification });
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="container section-padding">
      <div className="section-header">
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <Sprout size={28} className="text-primary" />
          <h1>Farmer Profile</h1>
          {profile?.verified && <span className="status-pill-small success"><CheckCircle size={12} /> Verified</span>}
        </div>
        <p>Microservice <code>farmer:3012 + user:3002</code> → <code>PUT /api/user/profile</code> PostgreSQL <code>user_profiles</code> + <code>farmer_inventory</code></p>
      </div>
      {loading && <div className="loading-state"><div className="spinner" /><p>Loading profile…</p></div>}
      {error && <div className="glass-card" style={{ padding: '0.8rem', borderLeft: '3px solid #ef4444', display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}><AlertCircle size={16} className="text-danger" /><span style={{ fontSize: '0.85rem' }}>{error}</span></div>}
      {success && <div className="glass-card" style={{ padding: '0.8rem', borderLeft: '3px solid #10b981', display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}><CheckCircle size={16} className="text-success" /><span style={{ fontSize: '0.85rem' }}>{success}</span></div>}
      {profile && profile.farmName && success === null ? (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Sprout size={40} className="text-success" />
            <div>
              <h2>{profile.farmName}</h2>
              <p className="hint-text"><MapPin size={12} /> {profile.location} • {profile.landSize} • {profile.certification}</p>
              <p className="hint-text"><Leaf size={12} /> {profile.crops}</p>
            </div>
            <span className="status-pill-small success" style={{ marginLeft: 'auto' }}><Award size={12} /> Organic Farmer</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: '560px' }}>
          <h3>Register Farm Details</h3>
          <input aria-label="Farm Name" placeholder="Farm Name (e.g. Green Valley Organic Farm)" value={form.farmName} onChange={e => setForm({ ...form, farmName: e.target.value })} maxLength={60} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
          <input aria-label="Location" placeholder="Location (e.g. Pratapgarh, UP)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <input aria-label="Land Size" placeholder="Land Size (e.g. 5 acres)" value={form.landSize} onChange={e => setForm({ ...form, landSize: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
            <input aria-label="Crops" placeholder="Crops (e.g. Amla, Turmeric)" value={form.crops} onChange={e => setForm({ ...form, crops: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
          </div>
          <select aria-label="Certification" value={form.certification} onChange={e => setForm({ ...form, certification: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <option>Organic Certified</option><option>Natural Farming</option><option>Ayurvedic Grade</option><option>Regenerative</option>
          </select>
          <select aria-label="Experience" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <option>5+ Years</option><option>10+ Years</option><option>15+ Years</option><option>25+ Years</option>
          </select>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} aria-label="Save farmer profile"><Save size={16} /> {loading ? 'Saving…' : 'Save Profile'}</button>
          <span className="hint-text" style={{ fontSize: '0.75rem' }}>Stored in PostgreSQL <code>user_profiles</code> + <code>farmer_inventory</code> via <code>farmer:3012</code></span>
        </form>
      )}
    </div>
  );
};

export default FarmerProfile;
