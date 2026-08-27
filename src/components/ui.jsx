import React from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// ── Status Badge ───────────────────────────────────────────
const STATUS_CONFIG = {
  'Pending':       { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
  'Contacted':     { bg: '#eff6ff', color: '#1e40af', dot: '#3b82f6' },
  'RNR':           { bg: '#fff7ed', color: '#c2410c', dot: '#f97316' },
  'Busy':          { bg: '#fefce8', color: '#854d0e', dot: '#eab308' },
  'Connect Later': { bg: '#f0f9ff', color: '#0c4a6e', dot: '#0ea5e9' },
  'Retail Issue':  { bg: '#fdf4ff', color: '#7e22ce', dot: '#a855f7' },
  'Not Interested':{ bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
  'Onboarded':     { bg: '#f0fdf4', color: '#14532d', dot: '#22c55e' },
};

export function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Pending'];
  const fs = size === 'md' ? '12px' : '11px';
  const px = size === 'md' ? '9px' : '7px';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: cfg.bg, color: cfg.color,
      padding: `2px ${px}`, borderRadius: 99,
      fontSize: fs, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

// ── Button ─────────────────────────────────────────────────
export function Btn({ children, variant = 'primary', size = 'md', onClick, disabled, style: extStyle, type = 'button', icon }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--font)', fontWeight: 500, transition: 'all .12s',
    borderRadius: 'var(--r)', opacity: disabled ? .55 : 1,
    whiteSpace: 'nowrap',
  };
  const sizes = { sm: { fontSize: 12, padding: '4px 10px' }, md: { fontSize: 13, padding: '6px 14px' }, lg: { fontSize: 14, padding: '8px 18px' } };
  const variants = {
    primary: { background: 'var(--primary)', color: '#fff' },
    secondary: { background: 'var(--surface-alt)', color: 'var(--text)', border: '1px solid var(--border)' },
    danger: { background: 'var(--danger)', color: '#fff' },
    ghost: { background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border)' },
    success: { background: 'var(--success)', color: '#fff' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...extStyle }}>
      {icon && icon}
      {children}
    </button>
  );
}

// ── Input ──────────────────────────────────────────────────
export function Input({ label, value, onChange, type = 'text', placeholder, required, name, readOnly, style: extStyle }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.4px' }}>{label}{required && ' *'}</span>}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        name={name} readOnly={readOnly} required={required}
        style={{
          height: 34, padding: '0 10px', border: `1px solid ${focused ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--r)', fontSize: 'var(--text-base)', color: 'var(--text)',
          background: readOnly ? 'var(--surface-alt)' : 'var(--surface)', outline: 'none',
          ...extStyle,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </label>
  );
}

// ── Select ─────────────────────────────────────────────────
export function Select({ label, value, onChange, options, required }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.4px' }}>{label}{required && ' *'}</span>}
      <select value={value} onChange={onChange} required={required}
        style={{
          height: 34, padding: '0 10px', border: `1px solid ${focused ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--r)', fontSize: 'var(--text-base)', color: 'var(--text)',
          background: 'var(--surface)', outline: 'none', cursor: 'pointer',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    </label>
  );
}

// ── Textarea ───────────────────────────────────────────────
export function Textarea({ label, value, onChange, placeholder, rows = 3 }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.4px' }}>{label}</span>}
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
        style={{
          padding: '8px 10px', border: `1px solid ${focused ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--r)', fontSize: 'var(--text-base)', color: 'var(--text)',
          background: 'var(--surface)', outline: 'none', resize: 'vertical', lineHeight: 1.5,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </label>
  );
}

// ── Card ───────────────────────────────────────────────────
export function Card({ children, style: extStyle, padding = 16 }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)', padding, ...extStyle,
    }}>
      {children}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────
export function Modal({ title, onClose, children, width = 480, footer }) {
  React.useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,.45)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: width,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        animation: 'fadeIn .16s ease',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0,
        }}>
          <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)' }}>{title}</h2>
          <button onClick={onClose} aria-label="Close"
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, borderRadius: 4, display: 'flex' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '18px', overflowY: 'auto', flex: 1 }}>{children}</div>
        {footer && (
          <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ── KPI Card ───────────────────────────────────────────────
export function KpiCard({ label, value, change, changeDir, color, icon }) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</span>
        {icon && <span style={{ color: color || 'var(--primary)', opacity: .7 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
      {change && (
        <div style={{ fontSize: 'var(--text-xs)', color: changeDir === 'up' ? 'var(--success)' : changeDir === 'down' ? 'var(--danger)' : 'var(--text-3)', fontWeight: 500 }}>
          {change}
        </div>
      )}
    </Card>
  );
}

// ── Empty State ────────────────────────────────────────────
export function EmptyState({ icon, title, description }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-3)' }}>
      {icon && <div style={{ fontSize: 36, marginBottom: 12, opacity: .4 }}>{icon}</div>}
      <div style={{ fontWeight: 600, color: 'var(--text-2)', fontSize: 'var(--text-md)', marginBottom: 6 }}>{title}</div>
      {description && <div style={{ fontSize: 'var(--text-sm)' }}>{description}</div>}
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────
export function Skeleton({ height = 16, width = '100%', style: s }) {
  return <div className="skeleton" style={{ height, width, ...s }} />;
}

// ── Confirm Modal ──────────────────────────────────────────
export function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = 'Confirm', confirmVariant = 'danger' }) {
  const icon = confirmVariant === 'danger' ? <AlertTriangle size={20} color="var(--danger)" /> : <CheckCircle size={20} color="var(--success)" />;
  return (
    <Modal title={title} onClose={onCancel} width={400}
      footer={<><Btn variant="ghost" onClick={onCancel}>Cancel</Btn><Btn variant={confirmVariant} onClick={onConfirm}>{confirmText}</Btn></>}>
      <div style={{ display: 'flex', gap: 12 }}>
        {icon}
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-2)', lineHeight: 1.6 }}>{message}</p>
      </div>
    </Modal>
  );
}

// ── Tab Bar ────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{
            padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 'var(--text-sm)', fontWeight: 500,
            color: active === t.id ? 'var(--primary-text)' : 'var(--text-2)',
            borderBottom: active === t.id ? '2px solid var(--primary)' : '2px solid transparent',
            marginBottom: -1, transition: 'all .12s',
          }}>
          {t.label}
          {t.count !== undefined && (
            <span style={{ marginLeft: 6, background: active === t.id ? 'var(--primary)' : 'var(--border)', color: active === t.id ? '#fff' : 'var(--text-2)', padding: '1px 6px', borderRadius: 99, fontSize: 10, fontWeight: 600 }}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Filter Bar ─────────────────────────────────────────────
export function FilterSelect({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{
        height: 32, padding: '0 28px 0 10px', border: '1px solid var(--border)',
        borderRadius: 'var(--r)', fontSize: 'var(--text-sm)', color: 'var(--text)',
        background: 'var(--surface)', cursor: 'pointer', outline: 'none',
      }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  );
}

// ── Search Input ───────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Search...', width = 240 }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ position: 'relative', width }}>
      <input
        type="search" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', height: 32, paddingLeft: 30, paddingRight: 10,
          border: `1px solid ${focused ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--r)', fontSize: 'var(--text-sm)', color: 'var(--text)',
          background: 'var(--surface)', outline: 'none',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <svg style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth={2.5} strokeLinecap="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    </div>
  );
}

// ── Pagination ─────────────────────────────────────────────
export function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', fontSize: 'var(--text-sm)', color: 'var(--text-2)' }}>
      <span>Showing {start}–{end} of {total}</span>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          style={{ padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--surface)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? .4 : 1, fontSize: 'var(--text-sm)' }}>
          ‹ Prev
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
          return (
            <button key={p} onClick={() => onChange(p)}
              style={{ padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: p === page ? 'var(--primary)' : 'var(--surface)', color: p === page ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: p === page ? 600 : 400 }}>
              {p}
            </button>
          );
        })}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          style={{ padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--surface)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? .4 : 1, fontSize: 'var(--text-sm)' }}>
          Next ›
        </button>
      </div>
    </div>
  );
}
