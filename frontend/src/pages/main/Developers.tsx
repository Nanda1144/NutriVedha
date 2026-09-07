import { Github, Linkedin, Code2, Shield, Database, Palette } from 'lucide-react'
import { Reveal } from '../../components/main/Reveal'
import './Developers.css'

type Dev = {
  name: string
  role: string
  skills: string[]
  responsibilities: string[]
  avatar: string
  github?: string
  linkedin?: string
  accent: string
}

const DEVS: Dev[] = [
  {
    name: 'Development Team',
    role: 'Full-Stack & Product — NutriVedha',
    skills: ['React + TypeScript', 'Microservices', 'PostgreSQL', 'AI Integration', 'UI/UX'],
    responsibilities: ['Public interface & design system', 'Gateway & auth flow', 'Role-based dashboards', 'Marketplace & delivery tracking'],
    avatar: 'NV',
    github: 'https://github.com/Nanda1144/NutriVedha',
    accent: '#2d5a27',
  },
]

export default function Developers() {
  return (
    <div className="devs">
      <section className="hero-section" aria-label="Developers">
        <div className="container hero-container">
          <div className="hero-content animate-fade-in">
            <span className="badge"><Code2 size={14} /> Developers</span>
            <h1 className="hero-title">Built by people who care about health, code and craft.</h1>
            <p className="hero-description">We don&apos;t invent team members. This page shows the actual contributors and the structure any future member will follow — real names, real links, real work.</p>
            <div className="hero-actions">
              <a href="https://github.com/Nanda1144/NutriVedha" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ background: 'var(--accent)', color: 'var(--primary-dark)' }}>View GitHub</a>
              <a href="/contact" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>Contact Team</a>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <img alt="Developers" className="hero-img" src="/hero.png" />
            <div className="hero-overlay-card glass-card"><div className="pulse-dot"></div><span>Craft & Code</span></div>
          </div>
        </div>
      </section>
      <section className="section-padding">
        <div className="container">
          <Reveal>
            <div className="devs-notice">
              <Shield size={16} />
              <span>We only publish information that is actually configured. No placeholder names or fake profiles are shown as if they were real.</span>
            </div>
          </Reveal>

          <Reveal>
            <div className="devs-notice">
              <Shield size={16} />
              <span>We only publish information that is actually configured. No placeholder names or fake profiles are shown as if they were real.</span>
            </div>
          </Reveal>

          <Reveal stagger>
            <div className="devs-grid">
              {DEVS.map(dev => (
                <div key={dev.name} className="dev-card">
                  <div className="dev-card__avatar" style={{ background: `linear-gradient(135deg, ${dev.accent} 0%, #a7c957 100%)` }}>
                    {dev.avatar}
                  </div>
                  <h3>{dev.name}</h3>
                  <span className="dev-card__role">{dev.role}</span>
                  <div className="dev-card__skills">
                    {dev.skills.map(s => <span key={s} className="skill-pill">{s}</span>)}
                  </div>
                  <ul className="dev-card__resp">
                    {dev.responsibilities.map(r => <li key={r}>{r}</li>)}
                  </ul>
                  <div className="dev-card__social">
                    {dev.github && <a href={dev.github} target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={16} /> GitHub</a>}
                    {dev.linkedin && <a href={dev.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={16} /> LinkedIn</a>}
                    {!dev.linkedin && <span className="dev-card__muted">Add LinkedIn when configured</span>}
                  </div>
                </div>
              ))}

              {/* Template card to show structure without fake data */}
              <div className="dev-card dev-card--template">
                <div className="dev-card__avatar dev-card__avatar--template">+</div>
                <h3>Future contributor</h3>
                <span className="dev-card__role">Role will appear here when added</span>
                <div className="dev-card__skills">
                  <span className="skill-pill skill-pill--muted">Skills appear here</span>
                  <span className="skill-pill skill-pill--muted">Real data only</span>
                </div>
                <ul className="dev-card__resp dev-card__resp--muted">
                  <li>Responsibilities will be listed with verified information</li>
                  <li>Social links appear only when actually configured</li>
                </ul>
                <div className="dev-card__social">
                  <span className="dev-card__muted">Template — awaiting real member</span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="stack">
              <h3>Stack & standards</h3>
              <div className="stack-grid">
                <span><Code2 size={14} /> React 19 + Vite + TypeScript</span>
                <span><Palette size={14} /> Design tokens — preserved brand palette</span>
                <span><Database size={14} /> PostgreSQL + microservices gateway</span>
                <span><Shield size={14} /> JWT auth • RBAC • verified approvals</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
