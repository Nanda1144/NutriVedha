import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, ShieldCheck, Send, User, Activity, Scale, Heart } from 'lucide-react';
import { fetchPatients, updatePatientNotes } from '../services/doctor.service';
import { fetchReport } from '../services/medical.service';
import { sendNotification } from '../services/notification.service';
import { getAuthToken } from '../services/client';

const DoctorPatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if (!getAuthToken()) { setError('Login as Doctor'); return; }
      setLoading(true);
      try {
        const res = await fetchPatients();
        const p = res.patients.find((x: any) => x.id === id);
        if (!p) setError('Patient not found in your queue');
        else {
          setPatient(p);
          setNotes(p.notes || '');
          // Try fetch latest medical report for this patient if userId available
          if ((p as any).userId) {
            try { const r = await fetchReport((p as any).userId); setReport(r.report); } catch {}
          }
        }
      } catch (e: any) { setError(e.message); }
      setLoading(false);
    };
    void load();
  }, [id]);

  const handleSave = async () => {
    if (!notes.trim() || notes.trim().length < 5) { setError('Note must be at least 5 characters'); return; }
    setError(null); setSuccess(null); setLoading(true);
    try {
      const res = await updatePatientNotes(id!, notes.trim());
      setPatient(res.patient);
      setSuccess('Clinical note saved — patient will be notified');
      // Notify patient
      try { await sendNotification({ title: 'Doctor Update', message: `Dr. updated your care plan: ${notes.trim().slice(0, 80)}`, type: 'health' }); } catch {}
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  if (loading && !patient) return <div className="container section-padding"><div className="spinner" /><p>Loading patient…</p></div>;
  if (error && !patient) return <div className="container section-padding"><div className="glass-card" style={{ padding: '1rem', borderLeft: '3px solid #ef4444' }}>{error} <Link to="/dashboard">← Back</Link></div></div>;
  if (!patient) return null;

  return (
    <div className="container section-padding">
      <Link to="/dashboard" className="btn btn-ghost btn-xs" style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}><ArrowLeft size={14} /> Back to Queue</Link>
      <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="patient-avatar-mini" style={{ width: '48px', height: '48px' }}>{patient.name.charAt(0)}</div>
          <div>
            <h1>{patient.name}</h1>
            <p className="hint-text">{patient.condition || 'Ayurvedic review'} • Last visit {patient.lastVisit}</p>
          </div>
          <span className={`risk-badge risk-${(patient.risk || 'low').toLowerCase()}`} style={{ marginLeft: 'auto' }}>{patient.risk || 'Low'}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.8rem', marginTop: '1rem' }}>
          <div className="glass-card" style={{ padding: '0.8rem' }}><User size={16} /> <strong>DOB / Age</strong><p className="hint-text">{patient.dob || '—'} / {patient.age || '—'}</p></div>
          <div className="glass-card" style={{ padding: '0.8rem' }}><Scale size={16} /> <strong>Weight / Height</strong><p className="hint-text">{patient.weight || '—'}kg / {patient.height || '—'}cm</p></div>
          <div className="glass-card" style={{ padding: '0.8rem' }}><Heart size={16} /> <strong>Blood / Diseases</strong><p className="hint-text">{patient.bloodGroup || '—'} / {(patient.diseases || []).join(', ') || 'None'}</p></div>
          <div className="glass-card" style={{ padding: '0.8rem' }}><Activity size={16} /> <strong>Fitness Goal</strong><p className="hint-text">{patient.fitnessGoal || '—'}</p></div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
        <h3 style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><FileText size={18} /> Health Reports (decrypted on-read)</h3>
        <p className="hint-text" style={{ fontSize: '0.8rem' }}>GET /api/medical/reports/:id → AES-256-GCM decrypt (PostgreSQL medical_reports.encrypted_data)</p>
        {report ? (
          <div className="glass-card" style={{ padding: '1rem', marginTop: '0.8rem' }}>
            <strong>{report.condition}</strong> <span className={`severity-badge ${report.severity?.toLowerCase()}`}>{report.severity}</span>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>{(report.symptoms || []).map((s: string, i: number) => <span key={i} className="ing-tag">{s}</span>)}</div>
            {(report.recommendations || []).map((r: any, i: number) => <div key={i} style={{ marginTop: '0.6rem' }}><strong>{r.title}</strong><p style={{ fontSize: '0.85rem', opacity: 0.8 }}>{r.text}</p></div>)}
          </div>
        ) : (
          <p className="hint-text" style={{ marginTop: '0.8rem' }}>No report linked — patient has not run Scan yet, or report is private.</p>
        )}
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
        <h3>Diet Prescription / Clinical Notes</h3>
        <p className="hint-text" style={{ fontSize: '0.8rem' }}>POST /api/doctor/patients/:id/notes → patient_records.notes → notification type health to patient</p>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ayurvedic prescription, diet plan, follow-up (min 5 chars) e.g. Pitta cooling: Cucumber & Mint, avoid spicy 3 days..." rows={4} maxLength={500} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '0.8rem', resize: 'none' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <span className="hint-text">{notes.length}/500</span>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={loading}><Send size={14} /> {loading ? 'Saving…' : 'Save & Notify Patient'}</button>
        </div>
        {error && <div className="glass-card" style={{ padding: '0.6rem', borderLeft: '3px solid #ef4444', marginTop: '0.8rem' }}>{error}</div>}
        {success && <div className="glass-card" style={{ padding: '0.6rem', borderLeft: '3px solid #10b981', marginTop: '0.8rem' }}>{success}</div>}
      </div>

      <div className="glass-card" style={{ padding: '1rem', marginTop: '1rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
        <ShieldCheck size={18} className="text-success" />
        <span style={{ fontSize: '0.85rem' }}>All access logged to audit_logs + encrypted at rest AES-256-GCM — patient receives update via notification.</span>
      </div>
    </div>
  );
};

export default DoctorPatientDetails;
