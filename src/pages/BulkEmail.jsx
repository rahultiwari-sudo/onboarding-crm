import React, { useState } from 'react';
import { Mail, Eye, Send, Users } from 'lucide-react';
import { sendEmail } from '../services/api.js';
import { useApp } from '../App.jsx';
import { Btn, Card, Select, Textarea, Input, Modal } from '../components/ui.jsx';

const TEMPLATES = [
  { value: 'onboarding', label: 'Onboarding Email', subject: 'Welcome to Amazon Advertising — Next Steps', body: `Dear {{seller_name}},\n\nWelcome to the {{program}} program! We're excited to help you grow your business with Amazon Advertising.\n\nTo get started, please complete the following steps:\n1. Log in to your Amazon Ads account\n2. Set up your first campaign\n3. Add your wallet balance\n\nYour dedicated AM will be in touch shortly.\n\nClick here to begin: {{onboarding_link}}\n\nBest regards,\nSellerGeni Onboarding Team` },
  { value: 'followup', label: 'Follow-up Email', subject: 'Following up — Amazon Advertising Opportunity', body: `Dear {{seller_name}},\n\nI wanted to follow up on our recent conversation about the {{program}} program.\n\nWe believe Amazon Advertising can significantly boost your sales. Our team is ready to guide you through the setup process.\n\nWould you be available for a quick call this week?\n\nBest regards,\nSellerGeni Team` },
  { value: 'intro', label: 'Introduction Email', subject: 'Grow Your Business with Amazon Ads', body: `Dear {{seller_name}},\n\nMy name is Rahul from SellerGeni. I'm reaching out regarding the {{program}} program that can help accelerate your Amazon sales.\n\nAs part of this program, you'll receive:\n• Free advertising credits\n• Dedicated account management\n• Expert campaign setup support\n\nI'd love to connect and explain how this can benefit your business.\n\nBest regards,\nSellerGeni Onboarding Team` },
  { value: 'reminder', label: 'Onboarding Reminder', subject: 'Reminder: Complete Your Amazon Ads Setup', body: `Dear {{seller_name}},\n\nThis is a friendly reminder to complete your Amazon Advertising setup under the {{program}} program.\n\nYour account is ready — you just need to take the first step!\n\nLink: {{onboarding_link}}\n\nOur team is here to help if you have any questions.\n\nBest regards,\nSellerGeni Team` },
];

const VARIABLES = ['{{seller_name}}', '{{program}}', '{{onboarding_link}}', '{{am_name}}', '{{mid}}'];

export default function BulkEmail() {
  const { addToast } = useApp();
  const [recipientCount] = useState(25); // mock selection
  const [template, setTemplate] = useState('onboarding');
  const [subject, setSubject] = useState(TEMPLATES[0].subject);
  const [body, setBody] = useState(TEMPLATES[0].body);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);

  const handleTemplateChange = (val) => {
    setTemplate(val);
    const t = TEMPLATES.find(t => t.value === val);
    if (t) { setSubject(t.subject); setBody(t.body); }
  };

  const handleSend = async () => {
    setSending(true);
    await sendEmail({ recipient_count: recipientCount, template, subject, body });
    setShowConfirm(false);
    setSending(false);
    addToast(`Email queued for ${recipientCount} recipients`, 'success');
  };

  const previewBody = body
    .replace(/{{seller_name}}/g, 'ABC Seller')
    .replace(/{{program}}/g, 'ANA')
    .replace(/{{onboarding_link}}/g, 'https://ads.amazon.in/start')
    .replace(/{{am_name}}/g, 'Rahul Tiwari')
    .replace(/{{mid}}/g, '100245');

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
      {/* Main compose area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Recipients bar */}
        <Card style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Users size={16} color="var(--primary-text)" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>{recipientCount} leads selected</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)' }}>From current Leads view — ANA program</div>
          </div>
          <Btn variant="ghost" size="sm" style={{ marginLeft: 'auto' }} onClick={() => addToast('Go to Leads page to change selection', 'info')}>
            Change Selection
          </Btn>
        </Card>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Select
              label="Email Template"
              value={template}
              onChange={e => handleTemplateChange(e.target.value)}
              options={TEMPLATES.map(t => ({ value: t.value, label: t.label }))}
            />

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>Subject</label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                style={{ width: '100%', height: 34, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 'var(--text-base)', color: 'var(--text)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>Message</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={14}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 'var(--text-sm)', color: 'var(--text)', outline: 'none', resize: 'vertical', lineHeight: 1.6, fontFamily: 'var(--font)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Btn variant="ghost" size="sm" icon={<Eye size={13} />} onClick={() => setShowPreview(true)}>Preview</Btn>
              <Btn variant="secondary" size="sm" icon={<Send size={13} />} onClick={() => addToast('Test email sent to rahul@sellergeni.com', 'success')}>
                Send Test
              </Btn>
              <Btn size="sm" icon={<Mail size={13} />} onClick={() => setShowConfirm(true)}>
                Send to {recipientCount} Leads
              </Btn>
            </div>
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Variables */}
        <Card>
          <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>Template Variables</h4>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', marginBottom: 10 }}>Click to insert at cursor. These are replaced per-recipient.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {VARIABLES.map(v => (
              <button key={v} onClick={() => { setBody(b => b + v); addToast(`Variable ${v} inserted`, 'info'); }}
                style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--surface-alt)', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--primary-text)', cursor: 'pointer', textAlign: 'left', transition: 'background .1s' }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--primary-light)'}
                onMouseOut={e => e.currentTarget.style.background = 'var(--surface-alt)'}
              >{v}</button>
            ))}
          </div>
        </Card>

        {/* Tips */}
        <Card style={{ background: 'var(--surface-alt)' }}>
          <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Sending Tips</h4>
          <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--text-2)', lineHeight: 1.8, paddingLeft: 14 }}>
            <li>Always send a test email first</li>
            <li>Use variables for personalization</li>
            <li>Keep subject lines under 60 characters</li>
            <li>Avoid sending during weekends</li>
            <li>Emails queue and send via Apps Script</li>
          </ul>
        </Card>

        {/* Recent sends */}
        <Card>
          <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>Recent Sends</h4>
          {[
            { label: 'Onboarding Email', count: 18, date: 'Aug 25', status: 'Delivered' },
            { label: 'Follow-up Email', count: 31, date: 'Aug 23', status: 'Delivered' },
            { label: 'Introduction Email', count: 12, date: 'Aug 20', status: 'Partial' },
          ].map((r, i) => (
            <div key={i} style={{ paddingBottom: 10, marginBottom: 10, borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{r.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{r.count} recipients · {r.date} ·
                <span style={{ color: r.status === 'Delivered' ? 'var(--success)' : 'var(--warning)', marginLeft: 4 }}>{r.status}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <Modal title="Email Preview" onClose={() => setShowPreview(false)} width={560}
          footer={<Btn onClick={() => setShowPreview(false)}>Close</Btn>}>
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
            <div style={{ background: 'var(--surface-alt)', padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>To: <span style={{ color: 'var(--text)' }}>ABC Seller &lt;seller100245@example.com&gt;</span></div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Subject: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{subject}</span></div>
            </div>
            <div style={{ padding: '16px 18px', whiteSpace: 'pre-wrap', fontSize: 'var(--text-sm)', lineHeight: 1.7, color: 'var(--text)', maxHeight: 400, overflowY: 'auto' }}>
              {previewBody}
            </div>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', marginTop: 10 }}>Preview shown with sample data for "ABC Seller / ANA"</p>
        </Modal>
      )}

      {/* Confirm Send Modal */}
      {showConfirm && (
        <Modal title="Confirm Send" onClose={() => setShowConfirm(false)} width={420}
          footer={
            <>
              <Btn variant="ghost" onClick={() => setShowConfirm(false)}>Cancel</Btn>
              <Btn onClick={handleSend} disabled={sending} icon={<Send size={13} />}>
                {sending ? 'Sending...' : `Confirm Send`}
              </Btn>
            </>
          }>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-2)', lineHeight: 1.7 }}>
            <p style={{ marginBottom: 12 }}>
              This will send <strong style={{ color: 'var(--text)' }}>"{subject}"</strong> to{' '}
              <strong style={{ color: 'var(--text)' }}>{recipientCount} leads</strong>.
            </p>
            <div style={{ background: 'var(--surface-alt)', borderRadius: 'var(--r)', padding: '10px 12px', fontSize: 12, color: 'var(--text-3)' }}>
              Emails will be queued and sent via Google Apps Script. This cannot be undone.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
