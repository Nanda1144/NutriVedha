import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Menu, User, Bell, ShieldCheck, Search } from 'lucide-react';
import { useEffect as useEffect2, useState as useState2 } from 'react';
import { fetchNotifications } from '../services/notification.service';
import { getAuthToken } from '../services/client';
import './Navbar.css';

interface NavbarProps {
    onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
    const [scrolled, setScrolled] = useState(false);
    const [unread, setUnread] = useState2(0);
    useEffect2(() => {
        if (!getAuthToken()) return;
        fetchNotifications().then(r => setUnread(r.unread)).catch(() => {});
        const id = setInterval(() => { if (getAuthToken()) fetchNotifications().then(r => setUnread(r.unread)).catch(() => {}); }, 30000);
        return () => clearInterval(id);
    }, []);

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
                    <Link to="/search" className="icon-btn" title="Search & Discovery">
                        <Search size={20} />
                    </Link>
                    <Link to="/notifications" className="icon-btn" style={{ position: 'relative' }} title="Notifications">
                        <Bell size={20} />
                        {unread > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', borderRadius: '999px', fontSize: '0.65rem', padding: '0 4px', minWidth: '16px', textAlign: 'center' }}>{unread > 9 ? '9+' : unread}</span>}
                    </Link>
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
