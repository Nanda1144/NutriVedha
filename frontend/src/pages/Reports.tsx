import React, { useEffect, useState } from 'react';
import { FileText, ShieldCheck, Eye, Trash2, Download, AlertCircle, Search, Calendar } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { fetchReports, deleteReport, fetchReport } from '../services/medical.service';
import { getAuthToken } from '../services/client';
import './Reports.css';

const Reports: React.FC = () => {
  const { reports: localReports } = useUserStore();
  const [reports, setReports] = useState<any[]>(localReports);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true); setError(null);
    if (getAuthToken()) {
      try {
        const res = await fetchReports();
        setReports(res.reports.length ? res.reports : localReports);
        return;
      } catch (e: any) { setError(e.message); }
    }
    setReports(localReports);
    setLoading(false);
  };
  useEffect(() => { void load(); }, [localReports.length]);
  useEffect(() => { setLoading(false); }, [reports]);

  const filtered = reports.filter(r =>
    r.condition.toLowerCase().includes(search.toLowerCase()) ||
    r.severity?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = async (id: string) => {
    if (getAuthToken()) {
      try { const res = await fetchReport(id); setSelected(res.report); return; } catch {}
    }
    const r = reports.find(x => x.id === id);
    setSelected(r || null);
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this encrypted report?')) return;
    if (getAuthToken()) { try { await deleteReport(id); } catch {} }
    setReports(prev => prev.filter(r => r.id !== id));
    setSelected(null);
  };
  const handleRevoke = (r: any) => {
    alert(`Access revoked for ${r.condition} — audit logged (mock)`);
  };

  return (
    <div className="reports-page container section-padding">
      <div className="section-header">
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <FileText size={28} className="text-primary" />
          <h1>Health Reports Vault</h1>
          <span className="status-pill-small success" style={{ marginLeft: '0.6rem' }}><ShieldCheck size={12} /> AES-256-GCM Encrypted</span>
        </div>
        <p>All scans decrypted on-read via <code>/api/medical/reports</code> PostgreSQL `medical_reports.encrypted_data`</p>
      </div>

      <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1rem' }}>
        <Search size={18} className="text-muted" />
        <input placeholder="Search condition or severity (Low/Medium/High)" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent' }} />
        <button className="btn btn-ghost btn-xs" onClick={load}>Refresh</button>
        <span className="hint-text">{filtered.length} reports</span>
      </div>

      {loading && <div className="loading-state"><div className="spinner" /> <p>Decrypting reports…</p></div>}
      {error && <div className="glass-card" style={{ padding: '0.8rem', borderLeft: '3px solid #ef4444', display: 'flex', gap: '0.6rem' }}><AlertCircle size={16} className="text-danger" /><span style={{ fontSize: '0.85rem' }}>{error}</span></div>}

      {filtered.length === 0 && !loading ? (
        <div className="empty-state glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <FileText size={48} className="text-muted" />
          <h3>No reports yet</h3>
          <p>Run an <a href="/scan">AI Disease Scan</a> to generate your first encrypted report.</p>
        </div>
      ) : (
        <div className="reports-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '1rem' }}>
          {filtered.map(r => (
            <div key={r.id} className="report-card glass-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`severity-badge ${r.severity?.toLowerCase()}`}>{r.severity}</span>
                <span className="hint-text" style={{ fontSize: '0.75rem' }}><Calendar size={12} /> {r.date}</span>
              </div>
              <h3 style={{ margin: '0.6rem 0 0.2rem' }}>{r.condition}</h3>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                {(r.symptoms || []).map((s: string, i: number) => <span key={i} className="ing-tag">{s}</span>)}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary btn-xs" onClick={() => handleOpen(r.id)}><Eye size={14} /> Open</button>
                <button className="btn btn-outline btn-xs" onClick={() => { const blob = new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `report-${r.id}.json`; a.click(); URL.revokeObjectURL(url); }}><Download size={14} /> Export</button>
                <button className="btn btn-ghost btn-xs text-danger" onClick={() => handleRevoke(r)}>Revoke</button>
                <button className="btn btn-ghost btn-xs text-danger" onClick={() => handleDelete(r.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="glass-card animate-scale-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px', width: '92%', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{selected.condition}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <p className="hint-text">{selected.date} • {selected.severity}</p>
            <div style={{ marginTop: '1rem' }}>
              <h4>Recommendations</h4>
              {(selected.recommendations || []).map((rec: any, i: number) => (
                <div key={i} className="glass-card" style={{ padding: '0.7rem', marginTop: '0.5rem' }}>
                  <strong>{rec.title}</strong><p style={{ fontSize: '0.85rem', opacity: 0.8 }}>{rec.text}</p>
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-full" onClick={() => setSelected(null)} style={{ marginTop: '1rem' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
