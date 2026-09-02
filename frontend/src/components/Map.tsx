import React, { useEffect, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { fetchTrack, recordTrackingPoint } from '../services/delivery.service';

interface MapProps {
  orderId: string;
  address?: string;
  selected?: boolean;
}

const Map: React.FC<MapProps> = ({ orderId, address, selected }) => {
  const [points, setPoints] = useState<any[]>([]);
  const [recording, setRecording] = useState(false);

  const load = async () => {
    try { const res = await fetchTrack(orderId); setPoints(res.points); } catch {}
  };
  useEffect(() => { void load(); }, [orderId]);

  const handleRecord = async () => {
    setRecording(true);
    try { await recordTrackingPoint({ orderId, lat: 12.9716 + Math.random() * 0.01, lng: 77.5946 + Math.random() * 0.01, note: 'En route' }); await load(); } catch {}
    setRecording(false);
  };

  return (
    <div className="glass-card" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.6rem' }}>
        <MapPin size={18} className="text-primary" />
        <strong>Route Intelligence</strong>
        <span className="hint-text" style={{ fontSize: '0.7rem', marginLeft: 'auto' }}>tracking_points PG {points.length} points</span>
      </div>
      <div style={{ position: 'relative', height: '180px', background: 'linear-gradient(135deg,#e0f2fe 0%,#f0fdf4 100%)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: '15%', bottom: '20%', background: '#10b981', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>P</div>
        <div style={{ position: 'absolute', right: '18%', top: '22%', background: '#ef4444', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>D</div>
        <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path d="M20,80 Q50,20 80,20" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="4 2" />
          {points.map((_, i) => <circle key={i} cx={20 + i * 12} cy={80 - i * 10} r="2" fill="var(--primary)" opacity={0.6} />)}
          {selected && <circle cx="50" cy="40" r="3" fill="var(--primary)" />}
        </svg>
        <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', background: 'rgba(255,255,255,0.9)', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem' }}>
          {address ? `${address.slice(0, 30)}…` : 'Select order to see route'} • {points.length} GPS points
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
        <button className="btn btn-outline btn-xs" onClick={handleRecord} disabled={recording} aria-label="Record GPS"><Navigation size={12} /> {recording ? 'Recording…' : 'Record GPS'}</button>
        <button className="btn btn-ghost btn-xs" onClick={load}>Fetch Track</button>
      </div>
      {points.length > 0 && <div className="hint-text" style={{ fontSize: '0.7rem', marginTop: '0.4rem' }}>{points.map((p: any) => `${p.lat.toFixed(2)},${p.lng.toFixed(2)}`).join(' • ')}</div>}
    </div>
  );
};

export default Map;
