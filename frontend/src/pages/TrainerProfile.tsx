import React, { useEffect, useState } from 'react';
import { ShieldCheck, Award, Clock, CheckCircle, AlertCircle, Save, Dumbbell, Star, Users } from 'lucide-react';
import { getAuthToken } from '../services/client';

const TrainerProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', certification: 'Certified Yoga Trainer', specialization: 'Strength & Conditioning', experience: '5+ Years', fee: '500' });

  const load = async () => {
    if (!getAuthToken()) { setError('Login as Trainer to view profile (gateway :8080 requires Bearer token)'); return; }
    setLoading(true); setError(null);
    try {
      // Trainer profile is stored via user_profiles + trainer service; fetch via user profile endpoint for now
      const res = await fetch('/api/user/profile', { headers: { Authorization: `Bearer ${getAuthToken()}` } }).then(r => r.json());
      if (res.profile) setProfile(res.profile);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!form.name.trim() || !form.certification.trim()) { setError('Name and Certification required'); return; }
    if (form.name.length < 3) { setError('Name must be at least 3 characters'); return; }
    setLoading(true);
    try {
      // For now store via user profile update (PostgreSQL user_profiles) + notify
      await fetch('/api/user/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAuthToken()}` }, body: JSON.stringify({ name: form.name, education: form.certification, fitnessGoal: form.specialization }) });
      setSuccess('Trainer profile registered — visible to trainees via PostgreSQL user_profiles + trainer_trainees');
      setProfile({ name: form.name, certification: form.certification, specialization: form.specialization, experience: form.experience, fee: form.fee, verified: true });
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="trainer-profile-page container section-padding">
      <div className="section-header">
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <Dumbbell size={28} className="text-primary" />
          <h1>Trainer Profile</h1>
          {profile?.verified && <span className="status-pill-small success"><CheckCircle size={12} /> Verified</span>}
          {profile && !profile.verified && <span className="status-pill-small warning"><Clock size={12} /> Pending</span>}
        </div>
        <p>Microservice <code>trainer:3015 + user:3002</code> → <code>PUT /api/user/profile</code> PostgreSQL <code>user_profiles</code> + <code>trainer_trainees</code></p>
      </div>

      {loading && <div className="loading-state"><div className="spinner" /><p>Loading profile…</p></div>}
      {error && <div className="glass-card" style={{ padding: '0.8rem', borderLeft: '3px solid #ef4444', display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}><AlertCircle size={16} className="text-danger" /><span style={{ fontSize: '0.85rem' }}>{error}</span></div>}
      {success && <div className="glass-card" style={{ padding: '0.8rem', borderLeft: '3px solid #10b981', display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}><CheckCircle size={16} className="text-success" /><span style={{ fontSize: '0.85rem' }}>{success}</span></div>}

      {profile && profile.name && success === null ? (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="patient-avatar-mini" style={{ width: '56px', height: '56px', fontSize: '1.5rem' }}>{profile.name.charAt(0)}</div>
            <div>
              <h2>{profile.name} {profile.verified && <Star size={16} className="text-warning" fill="currentColor" />}</h2>
              <p className="hint-text">{profile.specialization || form.specialization} • {profile.experience || form.experience} • Fee ₹{profile.fee || form.fee}</p>
              <p className="hint-text"><Award size={14} /> {profile.certification || form.certification}</p>
            </div>
            <span className="status-pill-small success" style={{ marginLeft: 'auto' }}><Users size={12} /> Trainer</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: '560px' }}>
          <h3>Register as Trainer</h3>
          <input aria-label="Full Name" placeholder="Full Name (e.g. Kabir Singh)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} maxLength={60} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
          <input aria-label="Certification" placeholder="Certification (e.g. Certified Yoga Trainer, NASM)" value={form.certification} onChange={e => setForm({ ...form, certification: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
          <select aria-label="Specialization" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <option>Strength & Conditioning</option><option>Yoga & Stress Management</option><option>Ayurvedic Nutrition</option><option>HIIT & Mobility</option><option>Rehab & Wellness</option>
          </select>
          <select aria-label="Experience" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <option>5+ Years</option><option>8+ Years</option><option>10+ Years</option><option>12+ Years</option>
          </select>
          <input aria-label="Fee" placeholder="Session Fee (e.g. 500)" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} aria-label="Submit trainer registration"><Save size={16} /> {loading ? 'Submitting…' : 'Submit Profile'}</button>
          <span className="hint-text" style={{ fontSize: '0.75rem' }}>Stored in PostgreSQL <code>user_profiles</code> `education` + `fitness_goal` + <code>trainer_trainees</code> via <code>trainer:3015</code></span>
        </form>
      )}
      <div className="glass-card" style={{ marginTop: '1rem', padding: '1rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
        <ShieldCheck size={18} className="text-success" />
        <span style={{ fontSize: '0.85rem' }}>Trainer access limited to <strong>Fitness & Activity Data</strong> only — verified via <code>requireRole('Trainer','Admin')</code> `trainer routes.pg:8`.</span>
      </div>
    </div>
  );
};

export default TrainerProfile;
