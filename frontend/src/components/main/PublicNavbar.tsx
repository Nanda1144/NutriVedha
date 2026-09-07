import { useState, useEffect, useRef } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import './PublicNavbar.css'

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Developers', to: '/developers' },
  { label: 'Contact', to: '/contact' },
]

export default function PublicNavbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setOpen(false) }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // lock scroll when mobile open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // close on escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  return (
    <header className={`pubnav ${scrolled ? 'pubnav--scrolled' : ''}`} role="banner">
      <a href="#main" className="skip-link">Skip to content</a>
      <div className="container pubnav__inner">
        {/* LEFT — logo */}
        <Link to="/" className="pubnav__brand" aria-label="NutriVedha home">
          <img src="/logo.jpeg" alt="NutriVedha — Ayurveda-Focused Dietetics Software" className="pubnav__logo" width={44} height={44} />
          <span className="pubnav__wordmark">
            <span className="pubnav__name">NutriVedha</span>
            <span className="pubnav__tagline">Ayurveda-Focused Dietetics</span>
          </span>
        </Link>

        {/* CENTER — desktop nav */}
        <nav className="pubnav__links" aria-label="Primary">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `pubnav__link ${isActive ? 'is-active' : ''}`}
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* RIGHT — auth */}
        <div className="pubnav__actions">
          <Link to="/login" className="btn btn-ghost btn-sm pubnav__login">Login</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Signup</Link>
          <button
            ref={btnRef}
            className="pubnav__burger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="pubnav-drawer"
            onClick={() => setOpen(v => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div id="pubnav-drawer" className={`pubnav__drawer ${open ? 'is-open' : ''}`} aria-hidden={!open} inert={!open ? true : undefined}>
        <nav className="pubnav__drawer-nav" aria-label="Mobile primary">
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `pubnav__drawer-link ${isActive ? 'is-active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
          <div className="pubnav__drawer-auth">
            <Link to="/login" className="btn btn-outline btn-lg" style={{ width: '100%' }}>Login</Link>
            <Link to="/signup" className="btn btn-primary btn-lg" style={{ width: '100%' }}>Create account</Link>
          </div>
        </nav>
      </div>
      {open && <button className="pubnav__backdrop" aria-label="Close menu" onClick={() => setOpen(false)} tabIndex={-1} />}
    </header>
  )
}
