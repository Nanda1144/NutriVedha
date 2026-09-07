import { Leaf, HeartPulse, Sparkles, Sprout, ShieldCheck, Eye, Target, Cpu, Users2 } from 'lucide-react'
import { Reveal } from '../../components/main/Reveal'
import { Link } from 'react-router-dom'
import './About.css'

export default function About() {
  return (
    <div className="about">
      {/* DARK hero-section — reference style with hero.png preserved */}
      <section className="hero-section" aria-label="About NutriVedha">
        <div className="container hero-container">
          <div className="hero-content animate-fade-in">
            <span className="badge"><Eye size={14} /> About NutriVedha</span>
            <h1 className="hero-title">Where 5,000 years of Ayurveda meets generative AI.</h1>
            <p className="hero-description">NutriVedha is an Ayurveda-Focused Dietetics Software — a health-tech ecosystem that turns fragmented care into a connected journey: from personal insight to professional guidance to farm-fresh nourishment.</p>
            <div className="hero-actions">
              <Link to="/services" className="btn btn-primary" style={{ background: 'var(--accent)', color: 'var(--primary-dark)' }}>Explore Services</Link>
              <Link to="/contact" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>Contact Us</Link>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <img alt="About NutriVedha" className="hero-img" src="/hero.png" />
            <div className="hero-overlay-card glass-card"><div className="pulse-dot"></div><span>Ancient Wisdom × AI</span></div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <Reveal stagger>
            <div className="about-cards">
              <div className="about-card">
                <Target size={20} />
                <h3>Vision</h3>
                <p>Every person — regardless of background — has access to personalized, preventive, culturally rooted healthcare that is understandable, affordable and human.</p>
              </div>
              <div className="about-card">
                <HeartPulse size={20} />
                <h3>Mission</h3>
                <p>Bridge ancient wisdom and modern intelligence to deliver biological precision, market-aware dietetics and real-time support — without replacing doctors.</p>
              </div>
              <div className="about-card">
                <Cpu size={20} />
                <h3>Technology</h3>
                <p>Generative AI for scan, diet and recipe intelligence; microservices gateway; role-aware dashboards; and a farmer-direct marketplace — all verified by the backend.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <Reveal>
            <div className="section-header centered">
              <span className="eyebrow">Problem → Solution</span>
              <h2>We didn&apos;t build another app. We connected the dots.</h2>
            </div>
          </Reveal>
          <div className="ps-grid">
            <Reveal>
              <div className="ps-card ps-card--problem">
                <h3>The problem</h3>
                <ul>
                  <li>Health data scattered across apps and paper</li>
                  <li>Diets that ignore budget, region and season</li>
                  <li>Fitness plans that ignore your actual body</li>
                  <li>Hard to find and trust the right professional</li>
                  <li>Food supply disconnected from health needs</li>
                </ul>
              </div>
            </Reveal>
            <Reveal>
              <div className="ps-card ps-card--solution">
                <h3>The NutriVedha solution</h3>
                <ul>
                  <li><strong>One ecosystem</strong> — User → AI → Doctor → Trainer → Farmer → Delivery</li>
                  <li><strong>AI that assists, not replaces</strong> — suggestions are guidance, verified by humans</li>
                  <li><strong>Market-aware dietetics</strong> — plans use what is locally available and affordable</li>
                  <li><strong>Roles with trust</strong> — professional access requires verification & approval</li>
                  <li><strong>Farming meets health</strong> — pre-book harvests, transparent sourcing</li>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-padding gradient-soft">
        <div className="container">
          <Reveal>
            <div className="section-header centered">
              <span className="eyebrow">How AI helps</span>
              <h2>AI as a careful assistant — not a doctor.</h2>
              <p>AI accelerates understanding and personalization; humans provide judgment and care.</p>
            </div>
          </Reveal>
          <Reveal stagger>
            <div className="ai-grid">
              <div className="ai-card"><Sparkles size={20} /><h3>Health Scan</h3><p>Image-aware analysis that surfaces context — not diagnoses — for professional review.</p></div>
              <div className="ai-card"><Leaf size={20} /><h3>Diet Intelligence</h3><p>Plans shaped by your profile, locally available ingredients and seasonal wisdom.</p></div>
              <div className="ai-card"><Sprout size={20} /><h3>Market & Farmer</h3><p>Recommendations connect to what farmers actually grow near you.</p></div>
              <div className="ai-card"><ShieldCheck size={20} /><h3>Safety</h3><p>All AI suggestions carry a disclaimer and route to professionals when needed.</p></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <Reveal>
            <div className="section-header centered">
              <span className="eyebrow">Ecosystem & Agriculture</span>
              <h2>Health doesn&apos;t end at the clinic. It grows in the field.</h2>
            </div>
          </Reveal>
          <Reveal>
            <div className="ag-card">
              <div className="ag-card__copy">
                <h3>From soil to system</h3>
                <p>NutriVedha links your health profile to the agricultural layer — so diet plans and marketplace offerings stay aligned with what is in season, affordable and traceable.</p>
                <ul className="ag-list">
                  <li>Farmers manage inventory, harvest dates and pre-bookings</li>
                  <li>Users see farmer profiles, location, experience and impact</li>
                  <li>Delivery partners ensure tracked, accountable fulfillment</li>
                </ul>
                <Link to="/services" className="btn btn-primary">Explore services</Link>
              </div>
              <div className="ag-card__visual" aria-hidden>
                <div className="ag-visual__line" />
                <div className="ag-visual__nodes">
                  <span><Users2 size={16} /> Community</span>
                  <span><Sprout size={16} /> Soil</span>
                  <span><Leaf size={16} /> Food</span>
                  <span><HeartPulse size={16} /> Health</span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="future">
              <h3>Future vision</h3>
              <p>A future where preventive care is personalized, food is traceable, professionals are accessible, and every health decision is informed — not guessed. We build toward that, step by step, with verification and consent at each layer.</p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
