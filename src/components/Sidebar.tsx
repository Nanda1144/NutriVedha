import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    X,
    Home,
    Zap,
    Utensils,
    BookOpen,
    Info,
    ShoppingBag,
    Dumbbell,
    Stethoscope,
    MessageSquare,
    User,
    ShieldCheck,
    ShieldAlert,
    Settings,
    ChevronRight,
    LayoutDashboard,
    LogIn
} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import './Sidebar.css';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { isAdminAuthenticated } = useUserStore();

    const menuItems = [
        { name: 'Home Portal', path: '/', icon: <Home size={20} /> },
        { name: 'Command Center', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'AI Disease Scan', path: '/scan', icon: <Zap size={20} /> },
        { name: 'Ayurvedic Diet', path: '/diet', icon: <Utensils size={20} /> },
        { name: 'Recipe Generator', path: '/recipes', icon: <BookOpen size={20} /> },
        { name: 'Food Intelligence', path: '/food-intel', icon: <Info size={20} /> },
        { name: 'Marketplace', path: '/marketplace', icon: <ShoppingBag size={20} /> },
        { name: 'Fitness & Yoga', path: '/fitness', icon: <Dumbbell size={20} /> },
        { name: 'Telemedicine', path: '/telemedicine', icon: <Stethoscope size={20} /> },
        { name: 'Sign AI', path: '/sign-ai', icon: <MessageSquare size={20} /> },
    ];

    return (
        <>
            {/* Overlay */}
            <div
                className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
                onClick={onClose}
            ></div>

            {/* Sidebar Drawer */}
            <aside className={`sidebar-drawer ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <ShieldCheck className="text-primary" size={24} />
                        <span>AyurAI <strong>Health</strong></span>
                    </div>
                    <button className="close-sidebar" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="sidebar-content">
                    <div className="sidebar-section-label">Main Features</div>
                    <nav className="sidebar-nav">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <span className="link-icon">{item.icon}</span>
                                <span className="link-text">{item.name}</span>
                                <ChevronRight className="link-arrow" size={14} />
                            </Link>
                        ))}
                    </nav>

                    <div className="sidebar-section-label">Account</div>
                    <nav className="sidebar-nav">
                        <Link to="/profile" className="sidebar-link" onClick={onClose}>
                            <span className="link-icon"><User size={20} /></span>
                            <span className="link-text">Privacy Vault</span>
                        </Link>
                        <Link to="/login" className="sidebar-link" onClick={onClose}>
                            <span className="link-icon"><LogIn size={20} /></span>
                            <span className="link-text">Role Terminal</span>
                        </Link>
                        <Link to="/settings" className="sidebar-link disabled" onClick={(e) => e.preventDefault()}>
                            <span className="link-icon"><Settings size={20} /></span>
                            <span className="link-text">Settings</span>
                        </Link>
                    </nav>

                    {isAdminAuthenticated && (
                        <>
                            <div className="sidebar-section-label admin-label">Restricted Access</div>
                            <nav className="sidebar-nav">
                                <Link to="/admin-control" className="sidebar-link admin-link" onClick={onClose}>
                                    <span className="link-icon"><ShieldAlert size={20} className="text-danger" /></span>
                                    <span className="link-text">Admin Dashboard</span>
                                    <ChevronRight className="link-arrow" size={14} />
                                </Link>
                            </nav>
                        </>
                    )}
                </div>

                <div className="sidebar-footer">
                    <div className="sidebar-status-card">
                        <div className="status-dot"></div>
                        <div className="status-text">
                            <p>System Status: <strong>Optimal</strong></p>
                            <span>All modules encrypted</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
