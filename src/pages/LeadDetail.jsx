import React, { useEffect, useState } from 'react';
import { ArrowLeft, Phone, Mail, UserPlus, Edit2, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { getLead, getCallLogs, updateLead, addCallLog } from '../services/api.js';
import { STATUSES, USERS } from '../data/mockData.js';
import { useApp } from '../App.jsx';
import { StatusBadge, Btn, Card, Modal, Select, Textarea, Input, Skeleton } from '../components/ui.jsx';

export default function LeadDetail({ leadId }) {
  const { navigate, addToast } = useApp();
  const [lead, setLead] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [l, cls] = await Promise.all([getLead(leadId), getCallLogs(leadId)]);
      setLead(l);
      setLogs(Array.isArray(cls) ? cls : []);
    } catch (error) {
      setLead(null);
      setLogs([]);
      addToast(error?.message || 'Unable to load lead.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [leadId]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Skeleton height={40} width={200} />
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <Skeleton height={400} />
        <Skeleton height={400} />
      </div>
    </div>
  );

  if (!lead) return <div style={{ padding: 40, color: 'var(--text-2)' }}>Lead not found.</div>;

  const InfoRow = ({ label, value, mono }) => (
    <div style={{ display: 'flex', gap: 8, fontSize: 'var(--text-sm)', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
      <span style={{ width: 130, color: 'var(--text-3)', flexShrink: 0, fontSize: 12 }}>{label}</span>
      <span style={{ fontFamily: mono ? 'var(--font-mono)' : undefined, fontSize: mono ? 12 : undefined, fontWeight: 500 }}>{value || '—'}</span>
    </div>
  );

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 20 }}>
      <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>{title}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );

  const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const fmtDt = d => d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={() => navigate('leads')} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: 'var(--text-sm)', padding: '4px 0' }}>
          <ArrowLeft size={14} /> Back to Leads
        </button>
        <span style={{ color: 'var(--border)' }}>·</span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)' }}>MID: {lead.mid}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 6 }}>{lead.seller_name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <StatusBadge status={lead.seller_status} size="md" />
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{lead.program} · {lead.lead_type}</span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Assigned to <strong style={{ color: 'var(--text-2)' }}>{lead.assigned_to_name}</strong></span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <Btn variant="ghost" size="sm" icon={<Edit2 size={13} />} onClick={() => setShowEditModal(true)}>Edit</Btn>
          <Btn variant="secondary" size="sm" icon={<Phone size={13} />} onClick={() => setShowCallModal(true)}>Log Call</Btn>
          <Btn size="sm" icon={<Mail size={13} />}>Send Email</Btn>
        </div>
      </div>

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        {/* Left: info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <Section title="Seller Information">
              <InfoRow label="Seller Name" value={lead.seller_name} />
              <InfoRow label="MID" value={lead.mid} mono />
              <InfoRow label="Email" value={lead.email} />
              <InfoRow label="Phone" value={lead.phone} />
              <InfoRow label="City" value={lead.city} />
            </Section>
            <Section title="Program Information">
              <InfoRow label="Program" value={lead.program} />
              <InfoRow label="Lead Type" value={lead.lead_type} />
              <InfoRow label="Assigned To" value={lead.assigned_to_name} />
              <InfoRow label="Assignment Date" value={fmt(lead.created_at)} />
            </Section>
            <Section title="Onboarding Information">
              <InfoRow label="Seller Status" value={<StatusBadge status={lead.seller_status} />} />
              <InfoRow label="DS AM Status" value={lead.ds_am_status} />
              <InfoRow label="Onboarding Date" value={fmt(lead.onboarding_date)} />
            </Section>
          </Card>

          <Card>
            <Section title="Commercial Information">
              <InfoRow label="Wallet Recharge" value={lead.wallet_recharge ? `₹${lead.wallet_recharge.toLocaleString()}` : '—'} />
              <InfoRow label="Free Credit" value={lead.free_credit ? `₹${lead.free_credit.toLocaleString()}` : '—'} />
              <InfoRow label="Total" value={lead.wallet_recharge ? `₹${(lead.wallet_recharge + lead.free_credit).toLocaleString()}` : '—'} />
            </Section>
            <Section title="Reference Information">
              <InfoRow label="Case Number" value={lead.case_number} mono />
              <InfoRow label="Request ID" value={lead.request_id} mono />
              <InfoRow label="SPN Status" value={lead.spn_status} />
            </Section>
          </Card>

          {/* Notes */}
          <Card>
            <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>Notes</h4>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-2)', lineHeight: 1.6 }}>
              {lead.notes || <em style={{ color: 'var(--text-3)' }}>No notes yet.</em>}
            </p>
          </Card>
        </div>

        {/* Right: activity timeline */}
        <div>
          <Card padding={0} style={{ height: 'fit-content' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Activity Timeline</h3>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[
                  { label: 'Total Attempts', value: lead.attempts },
                  { label: 'Last Contacted', value: lead.last_contacted_at || 'Never' },
                  { label: 'Callback', value: lead.callback_date || 'None' },
                  { label: 'Updated', value: lead.updated_at },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--surface-alt)', borderRadius: 'var(--r)', padding: '8px 10px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              {logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-3)', fontSize: 'var(--text-sm)' }}>No activity yet</div>
              ) : (
                <div style={{ position: 'relative', paddingLeft: 20 }}>
                  <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: 'var(--border)' }} />
                  {logs.map((log, i) => (
                    <div key={log.call_log_id} style={{ position: 'relative', marginBottom: 18 }}>
                      <div style={{ position: 'absolute', left: -16, top: 4, width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)', border: '2px solid var(--surface)' }} />
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>{fmtDt(log.call_time)} · {log.executive}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Call Logged</div>
                      <div style={{ marginBottom: 2 }}><StatusBadge status={log.status} /></div>
                      {log.notes && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4, lineHeight: 1.5 }}>{log.notes}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {showCallModal && (
        <CallLogModal lead={lead} onClose={() => setShowCallModal(false)}
          onSave={async (data) => {
            try {
              await addCallLog({ lead_id: lead.lead_id, ...data });
              setShowCallModal(false);
              addToast('Call logged successfully', 'success');
              await load();
            } catch (error) {
              addToast(error?.message || 'Unable to log call.', 'error');
            }
          }} />
      )}

      {showEditModal && (
        <EditLeadModal lead={lead} onClose={() => setShowEditModal(false)}
          onSave={async (data) => {
            try {
              await updateLead(lead.lead_id, data);
              setShowEditModal(false);
              addToast('Lead updated successfully', 'success');
              await load();
            } catch (error) {
              addToast(error?.message || 'Unable to update lead.', 'error');
            }
          }} />
      )}
    </div>
  );
}

function CallLogModal({ lead, onClose, onSave }) {
  const [status, setStatus] = useState(lead.seller_status);
  const [callbackDate, setCallbackDate] = useState('');
  const [callbackTime, setCallbackTime] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const needsCb = ['Connect Later', 'Busy', 'RNR'].includes(status);

  const handleSave = async () => { setSaving(true); await onSave({ status, callback_date: callbackDate || null, callback_time: callbackTime || null, notes }); };

  return (
    <Modal title="Log Call" onClose={onClose} width={440}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Call'}</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Select label="Call Status" value={status} onChange={e => setStatus(e.target.value)} options={STATUSES} required />
        {needsCb && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>Callback Date</label>
              <input type="date" value={callbackDate} onChange={e => setCallbackDate(e.target.value)}
                style={{ width: '100%', height: 34, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 'var(--text-base)', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>Callback Time</label>
              <input type="time" value={callbackTime} onChange={e => setCallbackTime(e.target.value)}
                style={{ width: '100%', height: 34, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 'var(--text-base)', outline: 'none' }} />
            </div>
          </div>
        )}
        <Textarea label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="What happened on this call?" rows={3} />
      </div>
    </Modal>
  );
}

function EditLeadModal({ lead, onClose, onSave }) {
  const [form, setForm] = useState({ seller_name: lead.seller_name, email: lead.email, phone: lead.phone, city: lead.city, notes: lead.notes || '' });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Modal title="Edit Lead" onClose={onClose} width={480}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={async () => { setSaving(true); await onSave(form); }} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input label="Seller Name" value={form.seller_name} onChange={set('seller_name')} required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input label="Email" value={form.email} onChange={set('email')} type="email" />
          <Input label="Phone" value={form.phone} onChange={set('phone')} />
        </div>
        <Input label="City" value={form.city} onChange={set('city')} />
        <Textarea label="Notes" value={form.notes} onChange={set('notes')} rows={4} />
      </div>
    </Modal>
  );
}
