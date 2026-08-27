import React from 'react';
import {
  LayoutDashboard, Users, PhoneCall, Upload, Mail,
  BarChart2, ClipboardList, UserCog, Settings, LogOut, ChevronRight
} from 'lucide-react';

const nav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'callbacks', label: 'Callbacks', icon: PhoneCall },
  { id: 'import', label: 'Import', icon: Upload },
  { id: 'bulk-email', label: 'Bulk Email', icon: Mail },
  { id: 'reports', label: 'Reports', icon: BarChart2 },
  { id: 'audit', label: 'Audit', icon: ClipboardList },
  { id: 'users', label: 'Users', icon: UserCog },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activePage, onNavigate }) {
  const s = {
    wrap: {
      width: 'var(--sidebar-width)', height: '100%',
      background: 'var(--sidebar-bg)',
      display: 'flex', flexDirection: 'column',
      borderRight: '1px solid #1e293b',
    },
    logo: {
      padding: '18px 16px 14px',
      borderBottom: '1px solid #1e293b',
    },
    logoText: {
      fontSize: '13px', fontWeight: 700, color: '#fff',
      letterSpacing: '.3px', lineHeight: 1.2,
    },
    logoSub: { fontSize: '10px', color: '#475569', fontWeight: 500, marginTop: 1 },
    nav: { flex: 1, padding: '10px 8px', overflowY: 'auto' },
    item: (active) => ({
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 10px', borderRadius: 'var(--r)',
      marginBottom: 1, cursor: 'pointer', transition: 'all .12s',
      background: active ? 'var(--sidebar-active-bg)' : 'transparent',
      color: active ? '#fff' : 'var(--sidebar-text)',
      fontSize: '13px', fontWeight: active ? 600 : 400,
      border: 'none', width: '100%', textAlign: 'left',
    }),
    footer: {
      padding: '12px 8px',
      borderTop: '1px solid #1e293b',
    },
    avatar: {
      width: 32, height: 32, borderRadius: '50%',
      background: 'linear-gradient(135deg,#1e40af,#0891b2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
    },
    userInfo: { flex: 1, minWidth: 0 },
    userName: { fontSize: 12, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    userRole: { fontSize: 10, color: '#64748b', fontWeight: 500 },
    logout: {
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '7px 10px', borderRadius: 'var(--r)',
      color: '#64748b', fontSize: 12, cursor: 'pointer',
      border: 'none', background: 'transparent', width: '100%',
      marginTop: 4, transition: 'color .12s',
    },
  };

  return (
    <aside style={s.wrap} role="navigation" aria-label="Main navigation">
      <div style={s.logo}>
        <div style={s.logoText}>Onboarding CRM</div>
        <div style={s.logoSub}>SellerGeni Internal</div>
      </div>

      <nav style={s.nav}>
        {nav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            style={s.item(activePage === id || (activePage === 'lead-detail' && id === 'leads'))}
            onClick={() => onNavigate(id)}
            aria-current={activePage === id ? 'page' : undefined}
          >
            <Icon size={15} strokeWidth={activePage === id ? 2.2 : 1.8} />
            <span style={{ flex: 1 }}>{label}</span>
            {activePage === id && <ChevronRight size={12} />}
          </button>
        ))}
      </nav>

      <div style={s.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px' }}>
          <div style={s.avatar}>RT</div>
          <div style={s.userInfo}>
            <div style={s.userName}>Rahul Tiwari</div>
            <div style={s.userRole}>Admin</div>
          </div>
        </div>
        <button style={s.logout}
          onMouseOver={e => e.currentTarget.style.color = '#94a3b8'}
          onMouseOut={e => e.currentTarget.style.color = '#64748b'}
        >
          <LogOut size={13} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
