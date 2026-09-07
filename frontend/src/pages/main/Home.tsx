import { Link } from 'react-router-dom'
import {
  ArrowRight, Sparkles, HeartPulse, Apple, Dumbbell, Stethoscope,
  ShoppingBasket, Sprout, Truck, ScanSearch, Users, Clock3, Quote, CheckCircle2, Camera
} from 'lucide-react'
import { Reveal } from '../../components/main/Reveal'
import './Home.css'

export default function Home() {
  return (
    <div className="home">
      {/* HERO — DARK reference: hero-section + hero.png preserved */}
      <section className="hero-section" aria-label="NutriVedha hero">
        <div className="container hero-container">
          <div className="hero-content animate-fade-in">
            <span className="badge">Ayurveda Meets Artificial Intelligence</span>
            <h1 className="hero-title">Scan. Analyze. Heal Naturally with AI.</h1>
            <p className="hero-description">Empowering you with AI-driven Ayurvedic insights for a healthier, balanced life. Accessible, affordable, and holistic care for everyone.</p>
            <div className="hero-actions">
              <Link to="/dashboard" className="btn btn-primary" style={{ background: 'var(--secondary)', color: 'var(--primary-dark)' }}>
                <ArrowRight size={20} /> Access Command Center
              </Link>
              <Link to="/scan" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>
                <Camera size={20} /> AI Health Scan
              </Link>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <img alt="AyurAI Health Hero" className="hero-img" src="/hero.png" />
            <div className="hero-overlay-card glass-card">
              <div className="pulse-dot"></div>
              <span>AI Analysis Live</span>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="section-padding">
        <div className="container">
          <Reveal>
            <div className="section-header centered">
              <span className="eyebrow">The challenge</span>
              <h2>Healthcare today is fragmented. NutriVedha makes it connected.</h2>
              <p>Six disconnects we were built to solve — without adding more apps to your life.</p>
            </div>
          </Reveal>
          <Reveal stagger>
            <div className="problem-grid">
              {[
                { title: 'Fragmented health management', desc: 'Reports, prescriptions and advice live in different places — no single view of your health.', icon: HeartPulse },
                { title: 'Poor nutrition planning', desc: 'Generic diets ignore your body, budget and locally available foods.', icon: Apple },
                { title: 'Lack of personalized fitness', desc: 'One-size workouts ignore age, body type and goals.', icon: Dumbbell },
                { title: 'Difficulty accessing professionals', desc: 'Finding the right doctor or trainer quickly is still hard.', icon: Stethoscope },
                { title: 'Disconnected food supply', desc: 'Market produce and health needs rarely talk to each other.', icon: ShoppingBasket },
                { title: 'No direct farmer connection', desc: 'Farmers grow what you need, but you never meet in the middle.', icon: Sprout },
              ].map(item => (
                <div key={item.title} className="problem-card">
                  <item.icon size={20} />
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ECOSYSTEM DIAGRAM */}
      <section className="ecosystem section-padding gradient-soft">
        <div className="container">
          <Reveal>
            <div className="section-header centered">
              <span className="eyebrow">The NutriVedha loop</span>
              <h2>From you, through intelligence, to care — and back to you.</h2>
            </div>
          </Reveal>
          <Reveal>
            <div className="eco-chain" role="list" aria-label="Ecosystem flow">
              {[
                { label: 'User', sub: 'You begin', icon: Users },
                { label: 'AI', sub: 'Scan & recommend', icon: Sparkles },
                { label: 'Doctor', sub: 'Consult & verify', icon: Stethoscope },
                { label: 'Trainer', sub: 'Guide & adapt', icon: Dumbbell },
                { label: 'Farmer', sub: 'Grow & supply', icon: Sprout },
                { label: 'Delivery', sub: 'Deliver & track', icon: Truck },
              ].map((node, i) => (
                <div key={node.label} className="eco-node-wrap" role="listitem">
                  <div className="eco-node">
                    <node.icon size={20} />
                    <strong>{node.label}</strong>
                    <span>{node.sub}</span>
                  </div>
                  {i < 5 && <ArrowRight className="eco-arrow" size={18} />}
                </div>
              ))}
            </div>
            <p className="eco-note">Each step is verified. No professional privilege is granted automatically — roles are approved by the backend.</p>
          </Reveal>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section-padding">
        <div className="container">
          <Reveal>
            <div className="section-header centered">
              <span className="eyebrow">Services</span>
              <h2>Everything you need — nothing you don&apos;t.</h2>
              <p>Eight services, one account. Hover to explore; tap to learn more.</p>
            </div>
          </Reveal>
          <Reveal stagger>
            <div className="services-grid">
              {[
                { icon: ScanSearch, title: 'AI Health Scan', desc: 'Camera-assisted symptom analysis with Ayurvedic context and guidance.' },
                { icon: Apple, title: 'Personalized Diet', desc: 'Budget-aware meal plans using what is available near you.' },
                { icon: Dumbbell, title: 'Fitness', desc: 'Yoga, strength and cardio adapted to your body and goals.' },
                { icon: Stethoscope, title: 'Doctor Consultation', desc: 'Connect with verified professionals, not anonymous advice.' },
                { icon: HeartPulse, title: 'Trainer Support', desc: 'Guided programs with progress you can actually track.' },
                { icon: ShoppingBasket, title: 'Marketplace', desc: 'Pre-book harvests and shop seasonally, directly.' },
                { icon: Sprout, title: 'Farmer Connection', desc: 'Meet the grower behind your food — transparent and direct.' },
                { icon: Truck, title: 'Delivery', desc: 'Real-time tracking from farm or store to your door.' },
              ].map(s => (
                <Link key={s.title} to="/services" className="service-card">
                  <span className="service-card__icon"><s.icon size={22} /></span>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <span className="service-card__cta">Learn more <ArrowRight size={14} /></span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how section-padding">
        <div className="container">
          <Reveal>
            <div className="section-header centered">
              <span className="eyebrow">How it works</span>
              <h2>Six steps from discovery to daily improvement.</h2>
            </div>
          </Reveal>
          <div className="timeline">
            {[
              { n: '01', title: 'Discover', desc: 'Explore NutriVedha and what matters to you.' },
              { n: '02', title: 'Register', desc: 'Create a secure account — User or apply as professional.' },
              { n: '03', title: 'Health Assessment', desc: 'AI scan + profile builds your baseline.' },
              { n: '04', title: 'Personalized Recommendations', desc: 'Diet, fitness and guidance tuned to you.' },
              { n: '05', title: 'Connect with Professionals', desc: 'Doctors, trainers and farmers — when you need them.' },
              { n: '06', title: 'Order / Track / Improve', desc: 'Shop, track delivery and watch your health improve.' },
            ].map(step => (
              <Reveal key={step.n}>
                <div className="timeline__row">
                  <span className="timeline__num">{step.n}</span>
                  <div className="timeline__card">
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="section-padding gradient-soft">
        <div className="container">
          <Reveal>
            <div className="section-header centered">
              <span className="eyebrow">Who is it for</span>
              <h2>One platform, six purposeful roles.</h2>
              <p>We describe what each role does — we don&apos;t expose dashboards publicly.</p>
            </div>
          </Reveal>
          <Reveal stagger>
            <div className="roles-grid">
              {[
                { title: 'User', desc: 'At the center. Scans, plans, consults and shops — with context from AI and humans.' },
                { title: 'Doctor', desc: 'Verified practitioners who review, advise and guide care — not replace it.' },
                { title: 'Trainer', desc: 'Fitness and yoga coaches who personalize and adapt your program.' },
                { title: 'Farmer', desc: 'Growers who list, manage inventory and fulfill marketplace orders.' },
                { title: 'Delivery Partner', desc: 'Reliable logistics with status updates from packed to delivered.' },
                { title: 'Admin', desc: 'Stewards of trust — approvals, safety and ecosystem health.' },
              ].map(r => (
                <div key={r.title} className="role-card">
                  <h3>{r.title}</h3>
                  <p>{r.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* STATISTICS — no fake numbers */}
      <section className="section-padding">
        <div className="container">
          <Reveal>
            <div className="stats-banner">
              <div className="stats-banner__copy">
                <h2>Built for trust, not vanity metrics.</h2>
                <p>We show real, verified statistics only when available from the backend. Until then, we focus on what truly matters:</p>
                <ul className="stats-list">
                  <li><CheckCircle2 size={16} /> Secure, role-aware authentication</li>
                  <li><CheckCircle2 size={16} /> Ayurveda-informed, AI-assisted recommendations</li>
                  <li><CheckCircle2 size={16} /> Transparent farmer-to-user marketplace</li>
                  <li><CheckCircle2 size={16} /> Privacy and consent by design</li>
                </ul>
              </div>
              <div className="stats-banner__values">
                {[
                  { k: 'Users', v: 'Growing community' },
                  { k: 'Doctors', v: 'Verified professionals' },
                  { k: 'Trainers', v: 'Certified guides' },
                  { k: 'Farmers', v: 'Direct supply' },
                  { k: 'Orders', v: 'Tracked end-to-end' },
                ].map(s => (
                  <div key={s.k} className="stat-pill">
                    <span className="stat-pill__k">{s.k}</span>
                    <span className="stat-pill__v">{s.v}</span>
                  </div>
                ))}
                <p className="stats-banner__note">Live counters will appear here once backend analytics are verified. We never invent numbers.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS — structural, no fake claims */}
      <section className="section-padding" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal>
            <div className="section-header centered">
              <span className="eyebrow">Testimonials</span>
              <h2>Voices from the community</h2>
              <p>This section is ready for real stories. We don&apos;t publish placeholder quotes as if they were real.</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="testimonials">
              <div className="testimonial-card testimonial-card--empty">
                <Quote size={20} />
                <h3>No testimonials published yet</h3>
                <p>When verified users share feedback, their stories will appear here — with consent, context and care.</p>
                <span className="testimonial__meta">Component ready • Awaiting real content</span>
              </div>
              <div className="testimonial-card testimonial-card--preview" aria-hidden>
                <div className="testimonial__avatar" />
                <p className="testimonial__quote">“Example layout — real quotes will replace this placeholder.”</p>
                <span className="testimonial__meta">Preview of card structure</span>
              </div>
              <div className="testimonial-card testimonial-card--preview" aria-hidden>
                <div className="testimonial__avatar" />
                <p className="testimonial__quote">“Cards support avatar, quote, name and role — all optional.”</p>
                <span className="testimonial__meta">Preview of card structure</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="cta section-padding">
        <div className="container">
          <Reveal>
            <div className="cta__card">
              <div className="cta__copy">
                <h2>Start your NutriVedha journey.</h2>
                <p>Create an account in seconds. Professional roles are verified before activation.</p>
              </div>
              <div className="cta__actions">
                <Link to="/signup" className="btn btn-primary btn-lg" style={{ background: '#fff', color: 'var(--primary-dark)' }}>Get Started <ArrowRight size={18} /></Link>
                <Link to="/login" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.7)', color: '#fff' }}>Login</Link>
              </div>
              <div className="cta__sub"><Clock3 size={14} /> No spam. No fake privileges. Just a healthier loop.</div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
