import React from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle size={15} color="var(--success)" />,
  error: <XCircle size={15} color="var(--danger)" />,
  info: <Info size={15} color="var(--info)" />,
  warning: <AlertTriangle size={15} color="var(--warning)" />,
};

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 999,
      display: 'flex', flexDirection: 'column', gap: 8,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)', padding: '10px 14px',
          boxShadow: 'var(--shadow-lg)', minWidth: 260, maxWidth: 360,
          animation: 'toastIn .2s ease', pointerEvents: 'all',
          borderLeft: `3px solid ${t.type === 'success' ? 'var(--success)' : t.type === 'error' ? 'var(--danger)' : t.type === 'warning' ? 'var(--warning)' : 'var(--info)'}`,
        }}>
          {ICONS[t.type] || ICONS.info}
          <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text)', fontWeight: 500 }}>{t.message}</span>
          <button onClick={() => onDismiss(t.id)} aria-label="Dismiss"
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2, display: 'flex', flexShrink: 0 }}>
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
