import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../services/api.js';
import { USERS } from '../data/mockData.js';
import { Card, FilterSelect, SearchInput, EmptyState, Skeleton } from '../components/ui.jsx';

const ACTIONS = ['Lead Created', 'Lead Assigned', 'Status Changed', 'Callback Updated', 'Email Sent', 'Lead Updated', 'Import Completed', 'Call Logged'];

const ACTION_COLORS = {
  'Lead Created': { bg: '#f0fdf4', color: '#14532d' },
  'Lead Assigned': { bg: '#eff6ff', color: '#1e40af' },
  'Status Changed': { bg: '#fefce8', color: '#854d0e' },
  'Callback Updated': { bg: '#f0f9ff', color: '#0c4a6e' },
  'Email Sent': { bg: '#fdf4ff', color: '#7e22ce' },
  'Lead Updated': { bg: '#f1f5f9', color: '#475569' },
  'Import Completed': { bg: '#f0fdf4', color: '#14532d' },
  'Call Logged': { bg: '#fff7ed', color: '#c2410c' },
};

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    getAuditLogs({ user: userFilter || undefined, action: actionFilter || undefined })
      .then(l => { setLogs(l); setLoading(false); });
  }, [userFilter, actionFilter]);

  const filtered = logs.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (l.user || '').toLowerCase().includes(q) ||
      (l.action || '').toLowerCase().includes(q) ||
      (l.lead_id || '').toLowerCase().includes(q) ||
      (l.new_value || '').toLowerCase().includes(q);
  });

  const userOptions = USERS.map(u => ({ value: u.name, label: u.name }));

  const fmtDt = d => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search audit logs..." width={220} />
        <FilterSelect value={userFilter} onChange={setUserFilter} options={userOptions} placeholder="All Users" />
        <FilterSelect value={actionFilter} onChange={setActionFilter} options={ACTIONS} placeholder="All Actions" />
        <span style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', color: 'var(--text-3)' }}>{filtered.length} entries</span>
      </div>

      <Card padding={0}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
          <thead>
            <tr style={{ background: 'var(--surface-alt)' }}>
              {['Timestamp', 'User', 'Action', 'Lead', 'Field', 'Old Value', 'New Value'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.4px', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                  {[...Array(7)].map((_, j) => <td key={j} style={{ padding: 12 }}><div className="skeleton" style={{ height: 12, borderRadius: 4 }} /></td>)}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7}><EmptyState title="No audit records" description="Activity will appear here when changes are made." /></td></tr>
            ) : filtered.map((log, i) => {
              const ac = ACTION_COLORS[log.action] || { bg: '#f1f5f9', color: '#475569' };
              return (
                <tr key={i} style={{ borderTop: '1px solid var(--border)' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--surface-alt)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>{fmtDt(log.timestamp)}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>{log.user}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: ac.bg, color: ac.color, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{log.action}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>{log.lead_id || '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-2)' }}>{log.field || '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--danger)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.old_value || '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--success)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.new_value || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
