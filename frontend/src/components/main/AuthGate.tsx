import { Navigate } from 'react-router-dom'
import { getAuthToken } from '../../services/client'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = getAuthToken()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function DashboardStub() {
  const token = getAuthToken()
  if (!token) return <Navigate to="/login" replace />
  const role = localStorage.getItem('nv_role') || 'User'
  const frontendUrl = (import.meta.env.VITE_FRONTEND_URL as string | undefined) || 'http://localhost:5174'
  return (
    <div className="section-padding">
      <div className="container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <span className="badge">Dashboard</span>
        <h1 style={{ marginTop: 16 }}>Welcome — {role} Command Center</h1>
        <p style={{ marginTop: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
          Main_interface → Login → Authentication → <strong>Dashboard</strong> ✓ Authenticated as <strong>{role}</strong>.
          Your features are now unlocked. In production this routes to the role dashboard at <code>{frontendUrl}/dashboard</code>.
        </p>
        <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={frontendUrl + '/dashboard'} className="btn btn-primary">Open App Dashboard</a>
          <a href="/services" className="btn btn-outline">Explore Services</a>
        </div>
        <p style={{ marginTop: 16, fontSize: '0.82rem', color: 'var(--text-faint)' }}>JWT nv_token present • Role verified by backend • /scan and other features require the same auth.</p>
      </div>
    </div>
  )
}

export function ScanStub() {
  const token = getAuthToken()
  if (!token) return <Navigate to="/login" replace />
  return (
    <div className="section-padding">
      <div className="container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <span className="badge">AI Health Scan</span>
        <h1 style={{ marginTop: 16 }}>AI Health Scan — Authenticated</h1>
        <p style={{ marginTop: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
          This is the protected feature from the hero. Main_interface → Login → Authentication → <strong>AI Health Scan</strong> ✓
        </p>
        <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
          <a href={(import.meta.env.VITE_FRONTEND_URL as string | undefined || 'http://localhost:5174') + '/scan'} className="btn btn-outline">Open in App</a>
        </div>
      </div>
    </div>
  )
}
