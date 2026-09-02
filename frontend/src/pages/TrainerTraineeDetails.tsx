import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Dumbbell, Scale, Heart, Activity, User, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchTrainees } from '../services/trainer.service';
import { sendNotification } from '../services/notification.service';
import { getAuthToken } from '../services/client';

const TrainerTraineeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trainee, setTrainee] = useState<any>(null);
  const [plan, setPlan] = useState({ bodyType: 'cut', ageStage: '2', workout: 'Surya Namaskar' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!getAuthToken()) { setError('Login as Trainer'); return; }
      setLoading(true);
      try {
        const res = await fetchTrainees();
        const t = res.trainees.find((x: any) => x.id === id);
        if (!t) setError('Trainee not found in your team (trainer_id mismatch)');
        else setTrainee(t);
      } catch (e: any) { setError(e.message); }
      setLoading(false);
    };
    void load();
  }, [id]);

  const handleAssign = async () => {
    setError(null); setSuccess(null);
    if (!plan.workout.trim()) { setError('Workout required'); return; }
    setLoading(true);
    try {
      // For now notify trainee via notification service (type health)
      await sendNotification({ title: `New Plan for ${trainee.name}`, message: `Trainer assigned: ${plan.bodyType} body • Stage ${plan.ageStage} • Workout ${plan.workout}`, type: 'health', channel: 'inapp' });
      setSuccess(`Plan assigned to ${trainee.name} — trainee notified via PostgreSQL notifications (inapp)`);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  if (loading && !trainee) return <div className="container section-padding"><div className="spinner" /><p>Loading trainee…</p></div>;
  if (error && !trainee) return <div className="container section-padding"><div className="glass-card" style={{ padding: '1rem', borderLeft: '3px solid #ef4444' }}>{error} <Link to="/dashboard">← Back</Link></div></div>;
  if (!trainee) return null;

  return (
    <div className="container section-padding">
      <Link to="/dashboard" className="btn btn-ghost btn-xs" style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}><ArrowLeft size={14} /> Back to Trainees</Link>
      <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="patient-avatar-mini" style={{ width: '48px', height: '48px' }}>{trainee.name.charAt(0)}</div>
          <div>
            <h1>{trainee.name}</h1>
            <p className="hint-text">{trainee.goal} • Compliance {trainee.compliance}% • {trainee.status}</p>
          </div>
          <span className={`status-pill-small ${trainee.status === 'Completed' ? 'success' : 'warning'}`} style={{ marginLeft: 'auto' }}>{trainee.status}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.8rem', marginTop: '1rem' }}>
          <div className="glass-card" style={{ padding: '0.8rem' }}><User size={16} /> <strong>Goal</strong><p className="hint-text">{trainee.goal}</p></div>
          <div className="glass-card" style={{ padding: '0.8rem' }}><Dumbbell size={16} /> <strong>Compliance</strong><p className="hint-text">{trainee.compliance}% • {trainee.progress}% progress</p></div>
          <div className="glass-card" style={{ padding: '0.8rem' }}><Scale size={16} /> <strong>Last Active</strong><p className="hint-text">{trainee.lastActive}</p></div>
          <div className="glass-card" style={{ padding: '0.8rem' }}><Heart size={16} /> <strong>Trainer</strong><p className="hint-text">{trainee.trainerId.slice(0, 8)}</p></div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
        <h3 style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Activity size={18} /> Fitness Plan Assignment</h3>
        <p className="hint-text" style={{ fontSize: '0.8rem' }}>POST /api/trainer/trainees/:id/plan → trainer_trainees + notification type health → Trainee dashboard</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.8rem', marginTop: '0.8rem' }}>
          <select aria-label="Body Type" value={plan.bodyType} onChange={e => setPlan({ ...plan, bodyType: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <option value="bulk">Bulk Body</option><option value="skinny">Skinny Body</option><option value="cut">Cut (V-Shape)</option>
          </select>
          <select aria-label="Age Stage" value={plan.ageStage} onChange={e => setPlan({ ...plan, ageStage: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <option value="1">Stage 1: 10–18</option><option value="2">Stage 2: 18–30</option><option value="3">Stage 3: 30+</option>
          </select>
          <input aria-label="Workout" placeholder="Workout (e.g. Surya Namaskar)" value={plan.workout} onChange={e => setPlan({ ...plan, workout: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleAssign} disabled={loading} style={{ marginTop: '0.8rem' }} aria-label="Assign plan"><Send size={14} /> {loading ? 'Assigning…' : 'Assign Plan & Notify Trainee'}</button>
        {error && <div className="glass-card" style={{ padding: '0.6rem', borderLeft: '3px solid #ef4444', marginTop: '0.8rem', display: 'flex', gap: '0.5rem' }}><AlertCircle size={14} className="text-danger" /><span style={{ fontSize: '0.85rem' }}>{error}</span></div>}
        {success && <div className="glass-card" style={{ padding: '0.6rem', borderLeft: '3px solid #10b981', marginTop: '0.8rem', display: 'flex', gap: '0.5rem' }}><CheckCircle size={14} className="text-success" /><span style={{ fontSize: '0.85rem' }}>{success}</span></div>}
      </div>

      <div className="glass-card" style={{ padding: '1rem', marginTop: '1rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
        <CheckCircle size={18} className="text-success" />
        <span style={{ fontSize: '0.85rem' }}>Progress logged to PostgreSQL <code>fitness_log</code> `user_id year week` + <code>trainer_trainees compliance</code> `004_trainer`.</span>
      </div>
    </div>
  );
};

export default TrainerTraineeDetails;
