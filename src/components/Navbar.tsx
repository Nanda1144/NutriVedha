import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Menu, User, Bell, ShieldCheck } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
    onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
            <div className="container navbar-container">
                <div className="navbar-left">
                    <button className="menu-toggle-btn" onClick={onToggleSidebar}>
                        <Menu size={24} />
                    </button>
                    <Link to="/" className="navbar-logo">
                        <div className="logo-icon">
                            <Leaf size={24} />
                        </div>
                        <span className="logo-text">AyurAI <span className="logo-highlight">Health</span></span>
                    </Link>
                </div>

                <div className="nav-actions">
                    <div className="security-status-minimal">
                        <ShieldCheck size={16} className="text-success" />
                        <span>Secure</span>
                    </div>
                    <button className="icon-btn">
                        <Bell size={20} />
                    </button>
                    <Link to="/profile" className="profile-btn">
                        <User size={18} />
                        <span>Profile</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
