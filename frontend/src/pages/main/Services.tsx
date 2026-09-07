import { Link } from 'react-router-dom'
import { ScanSearch, Apple, Dumbbell, Stethoscope, ShoppingBasket, Sprout, Truck, Sparkles, ArrowRight, Check } from 'lucide-react'
import { Reveal } from '../../components/main/Reveal'
import './Services.css'

const SERVICES = [
  {
    icon: Sparkles,
    group: 'AI',
    title: 'AI Health Scan',
    desc: 'Camera-assisted analysis that understands context and guides you to the right next step — with a clear disclaimer that AI does not replace professional diagnosis.',
    workflow: ['Capture / describe symptoms', 'AI surfaces context & suggestions', 'Route to doctor when needed'],
    cta: 'Try via dashboard after login',
  },
  {
    icon: Apple,
    group: 'Nutrition',
    title: 'Personalized Diet',
    desc: 'Budget-aware, locally available diet plans — not generic charts. Built from your profile, preferences and regional availability.',
    workflow: ['Profile & goals', 'Local & seasonal mapping', 'Daily plan with alternatives'],
    cta: 'Start diet planning',
  },
  {
    icon: Dumbbell,
    group: 'Fitness',
    title: 'Fitness & Yoga',
    desc: 'Programs adapted to body type, age stage and goals, with trainer guidance and progress tracking.',
    workflow: ['Assessment', 'Trainer-matched program', 'Track & adapt'],
    cta: 'Explore fitness',
  },
  {
    icon: Stethoscope,
    group: 'Medical Consultation',
    title: 'Doctor Consultation',
    desc: 'Connect with verified doctors for Ayurvedic and general guidance — secure, respectful and consent-driven.',
    workflow: ['Find specialist', 'Book & consult', 'Follow recommendations'],
    cta: 'Find a doctor',
  },
  {
    icon: ShoppingBasket,
    group: 'Marketplace',
    title: 'Marketplace',
    desc: 'Shop seasonally and pre-book harvests directly. See price, farmer and benefits before you buy.',
    workflow: ['Browse crops', 'Pre-book or buy', 'Track to delivery'],
    cta: 'Open marketplace',
  },
  {
    icon: Sprout,
    group: 'Agriculture',
    title: 'Farmer Connection',
    desc: 'Meet the grower behind your food — verified profiles, location, experience and transparent impact.',
    workflow: ['Discover farmer', 'View inventory', 'Direct connection'],
    cta: 'Meet farmers',
  },
  {
    icon: Truck,
    group: 'Delivery',
    title: 'Delivery & Tracking',
    desc: 'From packed to out-for-delivery to delivered — with real-time status for users and partners.',
    workflow: ['Order confirmed', 'Packed → in transit', 'Live tracking'],
    cta: 'Track an order',
  },
  {
    icon: ScanSearch,
    group: 'Health',
    title: 'Food Intelligence',
    desc: 'Understand what you eat — benefits, diet support and healthy alternatives, grounded in Ayurvedic context.',
    workflow: ['Search food', 'Learn benefits', 'Plan healthier swaps'],
    cta: 'Explore food intel',
  },
]

export default function Services() {
  return (
    <div className="services">
      <section className="hero-section" aria-label="Services">
        <div className="container hero-container">
          <div className="hero-content animate-fade-in">
            <span className="badge">Services</span>
            <h1 className="hero-title">Eight services. One verified account.</h1>
            <p className="hero-description">Each service is designed to work alone — and better together. No dashboard is exposed publicly; sign in to experience the full flow.</p>
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-primary" style={{ background: 'var(--accent)', color: 'var(--primary-dark)' }}>Get Started</Link>
              <Link to="/login" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>Login to Access</Link>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <img alt="Services" className="hero-img" src="/hero.png" />
            <div className="hero-overlay-card glass-card"><div className="pulse-dot"></div><span>Verified Services</span></div>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ paddingTop: 32 }}>
        <div className="container">
          <Reveal stagger>
            <div className="svc-grid">
              {SERVICES.map(s => (
                <div key={s.title} className="svc-card">
                  <div className="svc-card__top">
                    <span className="svc-card__group">{s.group}</span>
                    <span className="svc-card__icon"><s.icon size={20} /></span>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <div className="svc-card__workflow">
                    <span className="svc-card__workflow-label">Workflow</span>
                    <ul>
                      {s.workflow.map(w => <li key={w}><Check size={14} /> {w}</li>)}
                    </ul>
                  </div>
                  <Link to="/signup" className="svc-card__cta">{s.cta} <ArrowRight size={14} /></Link>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <div className="svc-note">
              <strong>Note on access:</strong> Professional capabilities (Doctor, Trainer, Farmer, Delivery) require an application and admin verification. We never grant professional privileges from a public form alone.
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
