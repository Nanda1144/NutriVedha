import React, { useEffect, useState } from 'react';
import { ShieldCheck, Award, Clock, CheckCircle, AlertCircle, Save, Star } from 'lucide-react';
import { fetchDoctorProfile, registerDoctor } from '../services/doctor.service';
import { getAuthToken } from '../services/client';

const DoctorProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', specialization: 'General Ayurveda', regNumber: '', experience: '5+ Years' });

  const load = async () => {
    if (!getAuthToken()) { setError('Login as Doctor to view profile (gateway :8080 requires Bearer token)'); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetchDoctorProfile();
      setProfile(res.profile);
    } catch (e: any) {
      if (e.message.includes('not found') || e.message.includes('404')) setProfile(null);
      else setError(e.message);
    }
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!form.name.trim() || !form.regNumber.trim()) { setError('Name and Registration Number required'); return; }
    if (form.regNumber.length < 5) { setError('Registration number must be at least 5 characters'); return; }
    setLoading(true);
    try {
      const res = await registerDoctor(form);
      setProfile(res.profile);
      setSuccess(res.message || 'Registration submitted — awaiting admin verification');
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="doctor-profile-page container section-padding">
      <div className="section-header">
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <ShieldCheck size={28} className="text-primary" />
          <h1>Doctor Profile</h1>
          {profile?.verified && <span className="status-pill-small success"><CheckCircle size={12} /> Verified</span>}
          {profile && !profile.verified && <span className="status-pill-small warning"><Clock size={12} /> Pending Verification</span>}
        </div>
        <p>Microservice <code>doctor:3014</code> → <code>POST /api/doctor/profile</code> PostgreSQL <code>doctor_profiles</code> `reg_number unique`</p>
      </div>

      {loading && <div className="loading-state"><div className="spinner" /><p>Loading profile…</p></div>}
      {error && <div className="glass-card" style={{ padding: '0.8rem', borderLeft: '3px solid #ef4444', display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}><AlertCircle size={16} className="text-danger" /><span style={{ fontSize: '0.85rem' }}>{error}</span></div>}
      {success && <div className="glass-card" style={{ padding: '0.8rem', borderLeft: '3px solid #10b981', display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}><CheckCircle size={16} className="text-success" /><span style={{ fontSize: '0.85rem' }}>{success}</span></div>}

      {profile ? (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="patient-avatar-mini" style={{ width: '56px', height: '56px', fontSize: '1.5rem' }}>{profile.name.charAt(0)}</div>
            <div>
              <h2>{profile.name} {profile.verified && <Star size={16} className="text-warning" fill="currentColor" />}</h2>
              <p className="hint-text">{profile.specialization} • {profile.experience} • {profile.regNumber}</p>
              <p className="hint-text">{profile.patients} patients • Fee ₹{profile.fee || 500}</p>
            </div>
          </div>
          <div className="glass-card" style={{ marginTop: '1rem', padding: '1rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <Award size={18} className="text-primary" />
            <span style={{ fontSize: '0.85rem' }}>{profile.verified ? 'Verified by Admin — you can now accept patients' : 'Awaiting admin verification — POST /verify/:id requires Admin role'}</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: '560px' }}>
          <h3>Register as Practitioner</h3>
          <input placeholder="Full Name (e.g. Dr. Arjun Rao)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} maxLength={60} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
          <select value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <option>General Ayurveda</option><option>Ayurvedic Internal Medicine</option><option>Ayurvedic Skin Specialist</option><option>Nutrition & Dietetics</option><option>Stress Management</option>
          </select>
          <input placeholder="Registration Number (e.g. AYU-REG-123)" value={form.regNumber} onChange={e => setForm({ ...form, regNumber: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
          <select value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <option>5+ Years</option><option>8+ Years</option><option>10+ Years</option><option>12+ Years</option><option>15+ Years</option>
          </select>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}><Save size={16} /> {loading ? 'Submitting…' : 'Submit for Verification'}</button>
          <span className="hint-text" style={{ fontSize: '0.75rem' }}>Stored in PostgreSQL <code>doctor_profiles</code> `reg_number unique` `verified false` until Admin approves via <code>POST /verify/:id</code></span>
        </form>
      )}
    </div>
  );
};

export default DoctorProfile;
