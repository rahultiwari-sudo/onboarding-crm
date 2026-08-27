import React, { useState } from 'react';
import { Menu, Search, Bell, ChevronDown } from 'lucide-react';

const PROGRAMS = ['All Programs', 'ANA', 'Elevate'];

const notifications = [
  { id: 1, text: '3 overdue callbacks need attention', type: 'warning', time: '5m ago' },
  { id: 2, text: '5 new leads assigned to your team', type: 'info', time: '1h ago' },
  { id: 3, text: 'Import completed — 15 leads added', type: 'success', time: '2h ago' },
  { id: 4, text: '1 email delivery failed', type: 'error', time: '3h ago' },
];

export default function Header({ title, program, onProgramChange, onMenuClick, currentUser }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [progOpen, setProgOpen] = useState(false);
  const [search, setSearch] = useState('');

  const displayName = currentUser?.name || 'User';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <header style={{
      height: 54, background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px',
      flexShrink: 0, position: 'relative', zIndex: 20,
    }}>
      {/* Mobile menu */}
      <button onClick={onMenuClick} style={{ display: 'none', border: 'none', background: 'none', padding: 4, cursor: 'pointer', color: 'var(--text-2)' }}
        className="mobile-menu-btn" aria-label="Open menu">
        <Menu size={20} />
      </button>

      {/* Title */}
      <div style={{ fontWeight: 600, fontSize: 'var(--text-md)', color: 'var(--text)', flexShrink: 0 }}>
        {title}
      </div>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 320, position: 'relative', marginLeft: 8 }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
        <input
          type="search"
          placeholder="Search leads, MIDs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', paddingLeft: 32, paddingRight: 12, height: 32,
            border: '1px solid var(--border)', borderRadius: 'var(--r)',
            background: 'var(--surface-alt)', fontSize: 'var(--text-sm)',
            color: 'var(--text)', outline: 'none', transition: 'border-color .15s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--primary)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Program selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setProgOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 10px', border: '1px solid var(--border)',
              borderRadius: 'var(--r)', background: 'var(--surface-alt)',
              fontSize: 'var(--text-sm)', fontWeight: 500, cursor: 'pointer',
              color: 'var(--text)',
            }}
          >
            <span style={{ color: 'var(--text-3)', fontSize: 'var(--text-xs)' }}>Program:</span>
            <span>{program}</span>
            <ChevronDown size={13} color="var(--text-3)" />
          </button>
          {progOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-md)',
              minWidth: 140, zIndex: 100, overflow: 'hidden',
            }}>
              {PROGRAMS.map(p => (
                <button key={p} onClick={() => { onProgramChange(p); setProgOpen(false); }}
                  style={{
                    display: 'block', width: '100%', padding: '8px 14px',
                    textAlign: 'left', border: 'none', background: p === program ? 'var(--primary-light)' : 'transparent',
                    color: p === program ? 'var(--primary-text)' : 'var(--text)',
                    fontSize: 'var(--text-sm)', cursor: 'pointer', fontWeight: p === program ? 600 : 400,
                  }}
                >{p}</button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setNotifOpen(o => !o)} aria-label="Notifications"
            style={{ position: 'relative', border: 'none', background: 'none', cursor: 'pointer', padding: 6, color: 'var(--text-2)', borderRadius: 'var(--r)', display: 'flex' }}>
            <Bell size={17} />
            <span style={{
              position: 'absolute', top: 2, right: 2, width: 16, height: 16,
              background: 'var(--danger)', color: '#fff', borderRadius: '50%',
              fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, lineHeight: 1,
            }}>4</span>
          </button>
          {notifOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 6,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-lg)',
              width: 300, zIndex: 100,
            }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                Notifications
              </div>
              {notifications.map(n => (
                <div key={n.id} style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--surface-alt)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 2 }}>{n.text}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)' }}>{n.time}</div>
                </div>
              ))}
              <div style={{ padding: '8px 14px', textAlign: 'center' }}>
                <button onClick={() => setNotifOpen(false)} style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-text)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 500 }}>
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '4px 8px 4px 6px', borderRadius: 'var(--r)',
          border: '1px solid var(--border)', cursor: 'pointer',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'linear-gradient(135deg,#1e40af,#0891b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#fff',
          }}>{initials}</div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text)' }}>{displayName}</span>
            <span style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.3px' }}>{currentUser?.role || ''}</span>
          </div>
        </div>
      </div>

      {notifOpen && <div onClick={() => setNotifOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />}
      {progOpen && <div onClick={() => setProgOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />}
    </header>
  );
}
