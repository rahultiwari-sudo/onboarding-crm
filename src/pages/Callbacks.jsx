import React, { useEffect, useState } from 'react';
import { ExternalLink, CheckCircle, RefreshCw } from 'lucide-react';
import { getCallbacks, completeCallback } from '../services/api.js';
import { useApp } from '../App.jsx';
import { StatusBadge, Btn, Card, Tabs, EmptyState, Modal, Select, Textarea } from '../components/ui.jsx';
import { STATUSES } from '../data/mockData.js';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'upcoming', label: 'Upcoming' },
];

export default function Callbacks() {
  const { navigate, addToast } = useApp();
  const [tab, setTab] = useState('all');
  const [callbacks, setCallbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reschedule, setReschedule] = useState(null);
  const [tabCounts, setTabCounts] = useState({});

  const load = async (t = tab) => {
    setLoading(true);
    const [all, today, overdue, upcoming] = await Promise.all([
      getCallbacks('all'), getCallbacks('today'), getCallbacks('overdue'), getCallbacks('upcoming'),
    ]);
    setTabCounts({ all: all.length, today: today.length, overdue: overdue.length, upcoming: upcoming.length });
    const map = { all, today, overdue, upcoming };
    setCallbacks(map[t] || all);
    setLoading(false);
  };

  useEffect(() => { load(tab); }, [tab]);

  const handleComplete = async (leadId) => {
    await completeCallback(leadId);
    addToast('Callback marked complete', 'success');
    load(tab);
  };

  const today = new Date().toISOString().split('T')[0];

  const rowBg = (cb) => {
    if (cb.callback_date < today) return '#fef2f2';
    if (cb.callback_date === today) return '#fffbeb';
    return 'transparent';
  };

  return (
    <div className="animate-fade-in">
      {/* KPI summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
        {[
          { label: 'Today', value: tabCounts.today || 0, color: 'var(--warning)' },
          { label: 'Overdue', value: tabCounts.overdue || 0, color: 'var(--danger)' },
          { label: 'Upcoming', value: tabCounts.upcoming || 0, color: 'var(--info)' },
          { label: 'Total Pending', value: tabCounts.all || 0, color: 'var(--text-2)' },
        ].map(k => (
          <Card key={k.label} style={{ textAlign: 'center', padding: 14 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.4px' }}>{k.label}</div>
          </Card>
        ))}
      </div>

      <Tabs tabs={TABS.map(t => ({ ...t, count: tabCounts[t.id] }))} active={tab} onChange={t => setTab(t)} />

      <Card padding={0}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
          <thead>
            <tr style={{ background: 'var(--surface-alt)' }}>
              {['Seller', 'MID', 'Executive', 'Callback Date', 'Time', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.4px', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                  {[...Array(7)].map((_, j) => <td key={j} style={{ padding: 14 }}><div className="skeleton" style={{ height: 12, borderRadius: 4 }} /></td>)}
                </tr>
              ))
            ) : callbacks.length === 0 ? (
              <tr><td colSpan={7}><EmptyState title={tab === 'today' ? 'No callbacks today' : 'No callbacks found'} description="You're all caught up." /></td></tr>
            ) : callbacks.map(cb => (
              <tr key={cb.lead_id} style={{ borderTop: '1px solid var(--border)', background: rowBg(cb) }}>
                <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--text)' }}>{cb.seller_name}</td>
                <td style={{ padding: '11px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>{cb.mid}</td>
                <td style={{ padding: '11px 14px', color: 'var(--text-2)' }}>{cb.assigned_to_name}</td>
                <td style={{ padding: '11px 14px' }}>
                  <span style={{ color: cb.callback_date < today ? 'var(--danger)' : cb.callback_date === today ? 'var(--warning)' : 'var(--text)', fontWeight: 600 }}>
                    {cb.callback_date < today ? '⚠ ' : ''}{cb.callback_date}
                  </span>
                </td>
                <td style={{ padding: '11px 14px', color: 'var(--text-2)' }}>{cb.callback_time || '—'}</td>
                <td style={{ padding: '11px 14px' }}><StatusBadge status={cb.seller_status} /></td>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button title="Open Lead" onClick={() => navigate('lead-detail', cb.lead_id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 'var(--r-sm)', padding: '4px 8px', cursor: 'pointer', fontSize: 11, color: 'var(--text-2)' }}>
                      <ExternalLink size={11} /> Open
                    </button>
                    <button title="Mark Complete" onClick={() => handleComplete(cb.lead_id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1px solid var(--success)', background: 'var(--success-light)', borderRadius: 'var(--r-sm)', padding: '4px 8px', cursor: 'pointer', fontSize: 11, color: 'var(--success)' }}>
                      <CheckCircle size={11} /> Done
                    </button>
                    <button title="Reschedule" onClick={() => setReschedule(cb)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 'var(--r-sm)', padding: '4px 8px', cursor: 'pointer', fontSize: 11, color: 'var(--text-2)' }}>
                      <RefreshCw size={11} /> Reschedule
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {reschedule && (
        <RescheduleModal lead={reschedule} onClose={() => setReschedule(null)}
          onSave={() => { setReschedule(null); addToast('Callback rescheduled', 'success'); load(tab); }} />
      )}
    </div>
  );
}

function RescheduleModal({ lead, onClose, onSave }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  return (
    <Modal title={`Reschedule — ${lead.seller_name}`} onClose={onClose} width={380}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={onSave}>Reschedule</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>New Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ width: '100%', height: 34, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 'var(--text-base)', outline: 'none' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>New Time</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)}
            style={{ width: '100%', height: 34, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 'var(--text-base)', outline: 'none' }} />
        </div>
      </div>
    </Modal>
  );
}
