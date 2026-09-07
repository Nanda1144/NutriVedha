import { useState } from 'react'
import { Mail, MapPin, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Reveal } from '../../components/main/Reveal'
import './Contact.css'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function Contact() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const errors: Record<string, string> = {}
  if (!form.name.trim()) errors.name = 'Name is required'
  else if (form.name.trim().length < 2) errors.name = 'Name is too short'
  if (!form.email.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email'
  if (form.phone && !/^[0-9+\-()\s]{8,15}$/.test(form.phone)) errors.phone = 'Enter a valid phone'
  if (!form.subject.trim()) errors.subject = 'Subject is required'
  if (!form.message.trim()) errors.message = 'Message is required'
  else if (form.message.trim().length < 10) errors.message = 'Message should be at least 10 characters'

  const isValid = Object.keys(errors).length === 0

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, email: true, subject: true, message: true, phone: true })
    if (!isValid) return
    setStatus('loading')
    setErrorMsg('')
    try {
      // Try gateway if available — never expose internal credentials
      const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080/api'
      const res = await fetch(`${base}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({})) as any).error || `Request failed (${res.status})`)
      setStatus('success')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
      setTouched({})
    } catch (err: any) {
      // Graceful fallback: still show success locally if backend not configured, but indicate pending delivery
      // For QA we surface error state distinctly
      setStatus('error')
      setErrorMsg(err.message || 'Unable to send message. Please try again or email hello@nutrivedha.health')
    }
  }

  return (
    <div className="contact">
      {/* DARK hero-section — reference style with hero.png */}
      <section className="hero-section" aria-label="Contact NutriVedha">
        <div className="container hero-container">
          <div className="hero-content animate-fade-in">
            <span className="badge">Contact Us</span>
            <h1 className="hero-title">We&apos;d love to hear from you.</h1>
            <p className="hero-description">Questions, feedback or partnership ideas — send a message. We respond with care, not automation.</p>
            <div className="hero-actions">
              <a href="mailto:hello@nutrivedha.health" className="btn btn-primary" style={{ background: 'var(--accent)', color: 'var(--primary-dark)' }}><Mail size={16} /> hello@nutrivedha.health</a>
              <span className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.7)', color: 'white', cursor: 'default' }}><MapPin size={16} /> Bengaluru, India</span>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <img alt="Contact NutriVedha" className="hero-img" src="/hero.png" />
            <div className="hero-overlay-card glass-card"><div className="pulse-dot"></div><span>We Reply in 24h</span></div>
          </div>
        </div>
      </section>
      <section className="section-padding">
        <div className="container contact-hero__inner">
          <Reveal>
            <div>
              <h2>Reach us directly</h2>
              <p className="contact-hero__lead" style={{ marginTop: 12 }}>Or use the secure form — messages go only to the configured backend.</p>
              <div className="contact-info">
                <div className="contact-info__item"><Mail size={16} /> hello@nutrivedha.health</div>
                <div className="contact-info__item"><MapPin size={16} /> Bengaluru, Karnataka — India</div>
                <div className="contact-info__item contact-info__note">No credentials or secrets are ever exposed from this form. Messages are sent to the configured backend only.</div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <form className="contact-form" onSubmit={submit} noValidate aria-label="Contact form">
              <div className="contact-form__head">
                <h2>Send a message</h2>
                <span className="contact-form__hint">All fields marked * are required</span>
              </div>

              {status === 'success' && (
                <div className="alert alert--success" role="status">
                  <CheckCircle2 size={16} /> Message sent — thank you! We&apos;ll be in touch soon.
                </div>
              )}
              {status === 'error' && (
                <div className="alert alert--error" role="alert">
                  <AlertCircle size={16} /> {errorMsg}
                </div>
              )}

              <div className="field-grid">
                <label className="field">
                  <span>Name *</span>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} onBlur={() => setTouched(t => ({ ...t, name: true }))} placeholder="Your full name" autoComplete="name" aria-invalid={!!(touched.name && errors.name)} />
                  {touched.name && errors.name && <em className="field-error">{errors.name}</em>}
                </label>
                <label className="field">
                  <span>Email *</span>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} onBlur={() => setTouched(t => ({ ...t, email: true }))} placeholder="you@example.com" autoComplete="email" aria-invalid={!!(touched.email && errors.email)} />
                  {touched.email && errors.email && <em className="field-error">{errors.email}</em>}
                </label>
              </div>

              <div className="field-grid">
                <label className="field">
                  <span>Phone</span>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} onBlur={() => setTouched(t => ({ ...t, phone: true }))} placeholder="+91 98765 43210" autoComplete="tel" inputMode="tel" aria-invalid={!!(touched.phone && errors.phone)} />
                  {touched.phone && errors.phone && <em className="field-error">{errors.phone}</em>}
                </label>
                <label className="field">
                  <span>Subject *</span>
                  <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} onBlur={() => setTouched(t => ({ ...t, subject: true }))} placeholder="How can we help?" aria-invalid={!!(touched.subject && errors.subject)} />
                  {touched.subject && errors.subject && <em className="field-error">{errors.subject}</em>}
                </label>
              </div>

              <label className="field">
                <span>Message *</span>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} onBlur={() => setTouched(t => ({ ...t, message: true }))} placeholder="Tell us a bit more..." rows={5} aria-invalid={!!(touched.message && errors.message)} />
                {touched.message && errors.message ? <em className="field-error">{errors.message}</em> : <span className="field-hint">{form.message.length}/500</span>}
              </label>

              <button type="submit" className="btn btn-primary btn-lg" disabled={status === 'loading'} style={{ width: '100%' }}>
                {status === 'loading' ? <><Loader2 size={16} className="spin" /> Sending…</> : <>Send message <Send size={16} /></>}
              </button>

              <p className="form-foot">By sending, you agree we may contact you regarding your message. We never share your data.</p>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
