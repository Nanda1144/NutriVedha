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
    Users,
    ShieldCheck,
    ShieldAlert,
    Settings,
    ChevronRight,
    LayoutDashboard,
    LogIn,
    Package,
    BarChart3,
    Sprout,
    Truck,
    Clock
} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import './Sidebar.css';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { isAdminAuthenticated, userProfile } = useUserStore();
    const role = userProfile.role;

    const allMenuItems = [
        { name: 'Home Portal', path: '/', icon: <Home size={20} />, roles: ['User', 'Doctor', 'Trainer', 'Farmer', 'Delivery', 'Admin'] },
        { name: 'Command Center', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['User', 'Doctor', 'Trainer', 'Farmer', 'Delivery'] },
        { name: 'AI Disease Scan', path: '/scan', icon: <Zap size={20} />, roles: ['User', 'Doctor'] },
        { name: 'Ayurvedic Diet', path: '/diet', icon: <Utensils size={20} />, roles: ['User', 'Doctor'] },
        { name: 'Recipe Generator', path: '/recipes', icon: <BookOpen size={20} />, roles: ['User'] },
        { name: 'Food Intelligence', path: '/food-intel', icon: <Info size={20} />, roles: ['User'] },
        { name: 'Marketplace', path: '/marketplace', icon: <ShoppingBag size={20} />, roles: ['User', 'Farmer'] },
        { name: 'Fitness & Yoga', path: '/fitness', icon: <Dumbbell size={20} />, roles: ['User', 'Trainer'] },
        { name: 'Telemedicine', path: '/telemedicine', icon: <Stethoscope size={20} />, roles: ['User', 'Doctor'] },
        { name: 'Sign AI', path: '/sign-ai', icon: <MessageSquare size={20} />, roles: ['User'] },
        { name: 'Reports Vault', path: '/reports', icon: <ShieldCheck size={20} />, roles: ['User', 'Doctor'] },
        { name: 'Delivery Tracking', path: '/delivery-tracking', icon: <ShoppingBag size={20} />, roles: ['User', 'Delivery'] },
        { name: 'Saved Vault', path: '/saved', icon: <BookOpen size={20} />, roles: ['User'] },
        { name: 'Search', path: '/search', icon: <Info size={20} />, roles: ['User', 'Doctor', 'Trainer', 'Farmer', 'Delivery'] },
    ];

    const doctorMenuItems: { name: string; path: string; icon: React.ReactNode }[] = [
        { name: 'Doctor Availability', path: '/doctor/availability', icon: <Stethoscope size={20} /> },
        { name: 'Doctor Profile', path: '/doctor/profile', icon: <ShieldCheck size={20} /> },
    ];
    const trainerMenuItems: { name: string; path: string; icon: React.ReactNode }[] = [
        { name: 'Trainer Profile', path: '/trainer/profile', icon: <Dumbbell size={20} /> },
        { name: 'Trainee Details', path: '/dashboard', icon: <Users size={20} /> },
    ];
    const farmerMenuItems: { name: string; path: string; icon: React.ReactNode }[] = [
        { name: 'Farmer Profile', path: '/farmer/profile', icon: <Sprout size={20} /> },
        { name: 'My Products', path: '/farmer/products', icon: <Package size={20} /> },
        { name: 'Customer Orders', path: '/farmer/orders', icon: <ShoppingBag size={20} /> },
        { name: 'Sales Reports', path: '/farmer/reports', icon: <BarChart3 size={20} /> },
    ];
    const deliveryMenuItems: { name: string; path: string; icon: React.ReactNode }[] = [
        { name: 'Delivery Profile', path: '/delivery/profile', icon: <Truck size={20} /> },
        { name: 'Delivery History', path: '/delivery/history', icon: <Clock size={20} /> },
        { name: 'Customer Orders', path: '/farmer/orders', icon: <ShoppingBag size={20} /> },
    ];

    const menuItems = allMenuItems.filter(item => (item.roles as string[]).includes(role));
    const showDoctorExtras = role === 'Doctor';

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
                        {showDoctorExtras && doctorMenuItems.map((item) => (
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
                        {role === 'Trainer' && trainerMenuItems.map((item) => (
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
                        {role === 'Farmer' && farmerMenuItems.map((item) => (
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
                        {role === 'Delivery' && deliveryMenuItems.map((item) => (
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
                                <Link to="/admin/users" className="sidebar-link admin-link" onClick={onClose}>
                                    <span className="link-icon"><Users size={20} className="text-primary" /></span>
                                    <span className="link-text">User Management</span>
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
