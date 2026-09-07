import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone, Github, Linkedin, Shield, FileText, Leaf } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link to="/" className="footer__logo-row">
              <img src="/logo.jpeg" alt="NutriVedha" width={40} height={40} className="footer__logo" />
              <span className="footer__brand-name">NutriVedha</span>
            </Link>
            <p className="footer__desc">
              Ayurveda-Focused Dietetics Software — bridging 5,000 years of Ayurvedic wisdom with generative AI, connecting users, doctors, trainers, farmers and delivery partners in one health ecosystem.
            </p>
            <div className="footer__contact-mini">
              <span><Mail size={14} /> hello@nutrivedha.health</span>
              <span><MapPin size={14} /> Bengaluru, Karnataka — India</span>
              <span><Phone size={14} /> Support via Contact page</span>
            </div>
          </div>

          <div className="footer__col">
            <h4>Navigate</h4>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/services">Services</Link>
            <Link to="/developers">Developers</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className="footer__col">
            <h4>Services</h4>
            <Link to="/services">AI Health Scan</Link>
            <Link to="/services">Personalized Diet</Link>
            <Link to="/services">Fitness & Yoga</Link>
            <Link to="/services">Doctor Consultation</Link>
            <Link to="/services">Marketplace & Farmer Connect</Link>
            <Link to="/services">Delivery Tracking</Link>
          </div>

          <div className="footer__col">
            <h4>Legal & Social</h4>
            <a href="/privacy" onClick={e => e.preventDefault()}><Shield size={14} /> Privacy Policy</a>
            <a href="/terms" onClick={e => e.preventDefault()}><FileText size={14} /> Terms of Service</a>
            <a href="https://github.com/Nanda1144/NutriVedha" target="_blank" rel="noreferrer"><Github size={14} /> GitHub</a>
            <a href="#" onClick={e => e.preventDefault()}><Linkedin size={14} /> LinkedIn</a>
            <span className="footer__muted"><Leaf size={14} /> AI suggestions are not a replacement for professional diagnosis.</span>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} NutriVedha. All rights reserved. Built with care for holistic health.</p>
          <span className="footer__bottom-tag">Ayurveda • AI • Community</span>
        </div>
      </div>
    </footer>
  )
}
