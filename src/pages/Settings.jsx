import React, { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { useApp } from '../App.jsx';
import { Btn, Card, Input, Select } from '../components/ui.jsx';

export default function Settings() {
  const { addToast } = useApp();
  const [general, setGeneral] = useState({ crmName: 'Onboarding CRM', pageSize: '10', timezone: 'Asia/Kolkata' });
  const [automation, setAutomation] = useState({ reminderDays: '2', escalationEnabled: true, callbackRules: 'daily', maxAttempts: '6' });
  const [email, setEmail] = useState({ defaultSender: 'onboarding@sellergeni.com', replyTo: 'rahul@sellergeni.com', dailyLimit: '200' });

  const setG = k => e => setGeneral(f => ({ ...f, [k]: e.target.value }));
  const setA = k => e => setAutomation(f => ({ ...f, [k]: typeof e === 'boolean' ? e : e.target.value }));
  const setE = k => e => setEmail(f => ({ ...f, [k]: e.target.value }));

  const save = (section) => {
    addToast(`${section} settings saved`, 'success');
  };

  const SectionCard = ({ title, description, children, onSave }) => (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: 3 }}>{title}</h3>
          {description && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)' }}>{description}</p>}
        </div>
        <Btn size="sm" variant="secondary" icon={<Save size={13} />} onClick={onSave}>Save</Btn>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 520 }}>
        {children}
      </div>
    </Card>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: 720 }}>
      {/* General */}
      <SectionCard title="General" description="Basic CRM configuration" onSave={() => save('General')}>
        <Input label="CRM Name" value={general.crmName} onChange={setG('crmName')} />
        <Select label="Default Page Size" value={general.pageSize} onChange={setG('pageSize')} options={['10', '25', '50', '100'].map(v => ({ value: v, label: `${v} rows` }))} />
        <Select label="Timezone" value={general.timezone} onChange={setG('timezone')} options={[
          { value: 'Asia/Kolkata', label: 'IST (Asia/Kolkata)' },
          { value: 'UTC', label: 'UTC' },
          { value: 'Asia/Dubai', label: 'GST (Asia/Dubai)' },
        ]} />
      </SectionCard>

      {/* Automation */}
      <SectionCard title="Automation" description="Callback reminders and escalation rules" onSave={() => save('Automation')}>
        <Input label="Reminder Days Before Callback" value={automation.reminderDays} onChange={setA('reminderDays')} type="number" />
        <Select label="Callback Notification Frequency" value={automation.callbackRules} onChange={setA('callbackRules')} options={[
          { value: 'daily', label: 'Daily digest' },
          { value: 'realtime', label: 'Real-time' },
          { value: 'disabled', label: 'Disabled' },
        ]} />
        <Input label="Max Call Attempts Before Escalation" value={automation.maxAttempts} onChange={setA('maxAttempts')} type="number" />
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={automation.escalationEnabled} onChange={e => setA('escalationEnabled')(e.target.checked)} style={{ width: 16, height: 16 }} />
          <div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Enable Escalation Alerts</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)' }}>Notify admin when leads exceed max attempts</div>
          </div>
        </label>
      </SectionCard>

      {/* Email */}
      <SectionCard title="Email" description="Outbound email settings" onSave={() => save('Email')}>
        <Input label="Default Sender Address" value={email.defaultSender} onChange={setE('defaultSender')} type="email" />
        <Input label="Reply-To Address" value={email.replyTo} onChange={setE('replyTo')} type="email" />
        <Input label="Daily Email Limit (per exec)" value={email.dailyLimit} onChange={setE('dailyLimit')} type="number" />
      </SectionCard>

      {/* Programs */}
      <Card>
        <div style={{ paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: 3 }}>Programs</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)' }}>Active program configuration</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { name: 'ANA', fullName: 'Amazon New Advertiser', status: 'Active', leads: 18, credit: '₹10,000' },
            { name: 'Elevate', fullName: 'Amazon Elevate Program', status: 'Active', leads: 12, credit: '₹25,000' },
          ].map(p => (
            <div key={p.name} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{p.name}</span>
                <span style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{p.status}</span>
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)', marginBottom: 8 }}>{p.fullName}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[['Active Leads', p.leads], ['Free Credit', p.credit]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-3)' }}>{l}</span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Integration */}
      <Card style={{ marginTop: 16, background: 'var(--surface-alt)', border: '1px dashed var(--border-strong)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Backend Integration</h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-2)', marginBottom: 12 }}>
          Currently using mock data. Replace <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--border)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>src/services/api.js</code> functions with <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--border)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>google.script.run</code> calls to connect to Apps Script.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['getLeads()', 'updateLead()', 'addCallLog()', 'assignLeads()', 'importLeads()', 'sendEmail()'].map(fn => (
            <code key={fn} style={{ fontFamily: 'var(--font-mono)', background: 'var(--surface)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: 'var(--r-sm)', fontSize: 11, color: 'var(--primary-text)' }}>{fn}</code>
          ))}
        </div>
      </Card>
    </div>
  );
}
