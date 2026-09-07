import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { RoleSidebar, type NavItem } from './RoleSidebar';

type RoleTheme = 'doctor' | 'trainer' | 'farmer' | 'delivery' | 'admin' | 'user';

const themeStyles: Record<RoleTheme, { css: string; mobileLabel: string }> = {
  doctor: { css: '../styles/doctor.css', mobileLabel: 'Doctor' },
  trainer: { css: '../styles/trainer.css', mobileLabel: 'Trainer' },
  farmer: { css: '../styles/farmer.css', mobileLabel: 'Farmer' },
  delivery: { css: '../styles/delivery.css', mobileLabel: 'Delivery' },
  admin: { css: '../styles/admin.css', mobileLabel: 'Admin' },
  user: { css: '../styles/user.css', mobileLabel: 'User' },
};

export const RoleLayout: React.FC<{ nav: NavItem[]; theme: RoleTheme; roleNote?: string }> = ({ nav, theme, roleNote }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Dynamically import theme css (each role css is already imported via sidebar, but ensure)
  // css import is handled by sidebar's css import; this layout just provides structure
  const layoutClass = theme === 'doctor' ? 'doc-layout' : theme === 'trainer' ? 'trainer-layout' : theme === 'farmer' ? 'farm-layout' : theme === 'delivery' ? 'del-layout' : theme === 'admin' ? 'admin-layout' : 'user-layout';
  const mainClass = theme === 'doctor' ? 'doc-main' : theme === 'trainer' ? 'trainer-main' : theme === 'farmer' ? 'farm-main' : theme === 'delivery' ? 'del-main' : theme === 'admin' ? 'admin-main' : '';
  const mobileBarClass = theme === 'doctor' ? 'doc-mobile-bar' : theme === 'trainer' ? 'trainer-mobile-bar' : theme === 'farmer' ? 'farm-mobile-bar' : theme === 'delivery' ? 'del-mobile-bar' : 'admin-mobile-bar';
  // Ensure theme css loaded — side effect import via sidebar already
  void themeStyles[theme];

  return (
    <div className={layoutClass}>
      <RoleSidebar nav={nav} theme={theme} collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} roleNote={roleNote} />
      <div className={mainClass} style={mainClass ? undefined : { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'none' }} className={mobileBarClass}>
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu" style={{ padding: 10, border: '1px solid #e6ece3', borderRadius: 10, background: '#fff' }}><Menu size={18} /></button>
          <span style={{ marginLeft: 12, fontWeight: 800, color: '#1b3a17' }}>{themeStyles[theme].mobileLabel}</span>
        </div>
        <style>{`@media(max-width:1024px){.${mobileBarClass}{display:flex !important; align-items:center; padding:10px 14px; background:#fff; border-bottom:1px solid #e6ece3; position:sticky; top:0; z-index:30}}`}</style>
        <main style={{ flex: 1, minWidth: 0 }}><Outlet /></main>
      </div>
    </div>
  );
};
