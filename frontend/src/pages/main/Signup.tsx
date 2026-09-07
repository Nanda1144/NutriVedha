import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, AlertCircle, CheckCircle2, Loader2, ShieldCheck, Lock } from 'lucide-react'
import { register as apiRegister } from '../../services/auth.service'
import { setAuthToken } from '../../services/client'
import './Auth.css'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', role: 'User' as string })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null)
  const isProfessional = ['Doctor', 'Trainer', 'Farmer', 'Delivery'].includes(form.role)

  const validate = (): string | null => {
    if (!form.name.trim() || form.name.trim().length < 2) return 'Enter your full name'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email'
    if (form.phone && !/^[0-9+\-()\s]{8,15}$/.test(form.phone)) return 'Enter a valid phone or leave it empty'
    if (form.password.length < 8) return 'Password must be at least 8 characters'
    if (form.password !== form.confirm) return 'Passwords do not match'
    return null
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (err) { setMsg({ type: 'error', text: err }); return }
    setLoading(true)
    setMsg(null)
    try {
      const res = await apiRegister({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        role: form.role as any,
      })
      const anyRes = res as any
      // Professional flows may return pending
      if (anyRes.status === 'pending' || isProfessional) {
        setMsg({ type: 'info', text: `Application received as ${form.role}. Verification pending — admin will review before activation. You can login once approved.` })
        // still store token if provided for pending login
        if (res.token) setAuthToken(res.token)
        setTimeout(() => navigate('/login'), 1800)
        return
      }
      // Normal user: auto-login
      setAuthToken(res.token)
      localStorage.setItem('nv_role', res.user.role)
      localStorage.setItem('nv_user', JSON.stringify(res.user))
      setMsg({ type: 'success', text: `Account created as ${res.user.role} — redirecting…` })
      setTimeout(() => window.location.assign('/'), 700)
    } catch (e: any) {
      const m = e.message || 'Signup failed'
      if (/already exists|duplicate|taken/i.test(m)) setMsg({ type: 'error', text: 'An account with this email already exists. Try logging in.' })
      else if (/network|fetch/i.test(m)) setMsg({ type: 'error', text: 'Network error — backend unreachable. Please try again.' })
      else setMsg({ type: 'error', text: m })
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card" role="main" aria-label="Signup">
        <div className="auth-head">
          <img src="/logo.jpeg" alt="NutriVedha" />
          <h1>Create account</h1>
          <p>Join NutriVedha. Professionals are verified before activation.</p>
        </div>

        {msg && (
          <div className={`alert ${msg.type === 'error' ? 'alert--error' : msg.type === 'success' ? 'alert--success' : 'alert--info'}`} role={msg.type === 'error' ? 'alert' : 'status'}>
            {msg.type === 'error' ? <AlertCircle size={16} /> : msg.type === 'success' ? <CheckCircle2 size={16} /> : <ShieldCheck size={16} />}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="su-name">Full name *</label>
            <input id="su-name" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoComplete="name" required />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="su-email">Email *</label>
              <input id="su-email" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} autoComplete="email" required />
            </div>
            <div className="field">
              <label htmlFor="su-phone">Phone</label>
              <input id="su-phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} autoComplete="tel" inputMode="tel" />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="su-pass">Password *</label>
              <input id="su-pass" type="password" placeholder="At least 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} autoComplete="new-password" required />
            </div>
            <div className="field">
              <label htmlFor="su-confirm">Confirm *</label>
              <input id="su-confirm" type="password" placeholder="Repeat password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} autoComplete="new-password" required />
            </div>
          </div>

          <div className="field">
            <label htmlFor="su-role">Account type</label>
            <select id="su-role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="User">User — standard access (instant)</option>
              <option value="Doctor">Doctor — requires verification</option>
              <option value="Trainer">Trainer — requires verification</option>
              <option value="Farmer">Farmer — requires verification</option>
              <option value="Delivery">Delivery Partner — requires verification</option>
            </select>
          </div>

          {isProfessional && (
            <div className="verify-note">
              <strong>Professional verification:</strong> Your application will be reviewed by an admin. You&apos;ll be notified once approved. You cannot access professional dashboards until activation — this is enforced by the backend, not the frontend.
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 14 }}>
            {loading ? <Loader2 size={16} className="spin" /> : <UserPlus size={16} />}
            {loading ? 'Creating…' : isProfessional ? 'Submit application' : 'Create account'}
          </button>
        </form>

        <p className="auth-foot">
          Already have an account? <Link to="/login">Login</Link> • <Link to="/">Back to home</Link>
        </p>
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-faint)', fontWeight: 600 }}>
          <Lock size={12} /> No professional privilege granted from frontend alone
        </div>
      </div>
    </div>
  )
}
