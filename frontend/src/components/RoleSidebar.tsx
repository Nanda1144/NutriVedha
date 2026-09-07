import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = { label: string; path: string; icon: LucideIcon };

type Theme = 'doctor' | 'trainer' | 'farmer' | 'delivery' | 'admin' | 'user';

// Single generic sidebar — replaces 6 duplicated *Sidebar.tsx files
// Each role keeps its own CSS file for theming, but logic is centralized here.
export const RoleSidebar: React.FC<{
  nav: NavItem[];
  theme: Theme;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  roleNote?: string;
}> = ({ nav, theme, collapsed, onToggle, mobileOpen, onMobileClose, roleNote }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('nv_token');
    localStorage.removeItem('ayurai-health-storage-v8');
    navigate('/login');
  };

  // Theme-specific class prefixes and css imports
  const prefix = theme === 'doctor' ? 'doc' : theme;
  // Import theme css dynamically — side effect (each theme file defines same structure with different vars)
  // We rely on the role's layout having already imported its css; this component just uses class names

  const sidebarClass = `${prefix}-sidebar`;
  const sidebarMobileClass = `${prefix}-sidebar--mobile`;
  const overlayClass = `${prefix}-sidebar__overlay`;
  const collapsedClass = 'collapsed';
  const headerClass = `${prefix}-sidebar__header`;
  const brandClass = `${prefix}-sidebar__brand`;
  const toggleClass = `${prefix}-sidebar__toggle`;
  const navClass = `${prefix}-sidebar__nav`;
  const linkClass = `${prefix}-sidebar__link`;
  const arrowClass = `${prefix}-sidebar__arrow`;
  const footerClass = `${prefix}-sidebar__footer`;
  const logoutClass = `${prefix}-sidebar__logout`;
  const noteClass = `${prefix}-sidebar__note`;

  const brandSuffix: Record<Theme, string> = {
    doctor: 'MD',
    trainer: 'FIT',
    farmer: 'FARM',
    delivery: 'GO',
    admin: 'ADMIN',
    user: 'USER',
  };

  const Content = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      <div className={headerClass}>
        {(!collapsed || isMobile) && (
          <span className={brandClass}>
            NutriVedha <strong style={{ color: `var(--${prefix}-primary)` }}>{brandSuffix[theme]}</strong>
          </span>
        )}
        <button className={toggleClass} onClick={isMobile ? onMobileClose : onToggle} aria-label={collapsed ? 'Expand' : 'Collapse'}>
          {isMobile ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      <nav className={navClass} aria-label={`${theme} navigation`}>
        {nav.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={isMobile ? onMobileClose : undefined}
            title={collapsed && !isMobile ? item.label : undefined}
            className={({ isActive }) => `${linkClass} ${isActive ? 'active' : ''} ${collapsed && !isMobile ? collapsedClass : ''}`}
          >
            <item.icon size={18} />
            {(!collapsed || isMobile) && <span>{item.label}</span>}
            {(!collapsed || isMobile) && <ChevronRight size={14} className={arrowClass} />}
          </NavLink>
        ))}
      </nav>
      <div className={footerClass}>
        <button className={`${logoutClass} ${collapsed && !isMobile ? collapsedClass : ''}`} onClick={handleLogout} title={collapsed ? 'Logout' : undefined}>
          <LogOut size={18} />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>
        {roleNote && <span className={noteClass}>{roleNote}</span>}
      </div>
    </>
  );

  return (
    <>
      <aside className={`${sidebarClass} ${collapsed ? collapsedClass : ''}`} aria-label={`${theme} sidebar`}>
        <Content />
      </aside>
      {mobileOpen && <div className={overlayClass} onClick={onMobileClose} aria-hidden="true" />}
      <aside className={`${sidebarMobileClass} ${mobileOpen ? 'open' : ''}`}>
        <Content isMobile />
      </aside>
    </>
  );
};
