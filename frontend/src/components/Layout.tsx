import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Chatbot from './Chatbot';
import { ShieldCheck } from 'lucide-react';
import './Layout.css';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="layout-root">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* Medical Disclaimer Banner */}
            <div className="disclaimer-banner">
                <div className="container disclaimer-content">
                    <ShieldCheck size={16} />
                    <span>AI suggestions are not a replacement for professional diagnosis. Consult a doctor for medical conditions.</span>
                </div>
            </div>

            <main className="main-content">
                {children}
            </main>

            <footer className="footer">
                <div className="container footer-grid">
                    <div className="footer-brand">
                        <h3 className="footer-logo">AyurAI Health</h3>
                        <p className="footer-motto">Bridging Ancient Wisdom with Modern AI for Holistic Healing.</p>
                    </div>
                    <div className="footer-links">
                        <h4>Platform</h4>
                        <a href="/scan">AI Health Scan</a>
                        <a href="/diet">Diet Planning</a>
                        <a href="/telemedicine">Telemedicine</a>
                    </div>
                    <div className="footer-links">
                        <h4>Support</h4>
                        <a href="/help">Help Center</a>
                        <a href="/privacy">Privacy Policy</a>
                        <a href="/terms">Terms of Service</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 AyurAI Health. All rights reserved.</p>
                </div>
            </footer>
            <Chatbot />
        </div>
    );
};

export default Layout;
