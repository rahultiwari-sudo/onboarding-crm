import React, { useState } from 'react';
import { Upload, CheckCircle, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import { importLeads } from '../services/api.js';
import { useApp } from '../App.jsx';
import { Btn, Card } from '../components/ui.jsx';

const STEPS = ['Upload', 'Map Columns', 'Validate', 'Review', 'Import', 'Summary'];

const MOCK_ROWS = [
  { seller_name: 'New Seller One', mid: '200001', email: 'new1@example.com', phone: '+91 9900001111', program: 'ANA', city: 'Mumbai', status: 'NEW' },
  { seller_name: 'New Seller Two', mid: '200002', email: 'new2@example.com', phone: '+91 9900002222', program: 'Elevate', city: 'Delhi', status: 'NEW' },
  { seller_name: 'New Seller Three', mid: '200003', email: 'new3@example.com', phone: '+91 9900003333', program: 'ANA', city: 'Bangalore', status: 'NEW' },
  { seller_name: 'Duplicate Seller', mid: '100200', email: 'dup@example.com', phone: '+91 9900004444', program: 'ANA', city: 'Chennai', status: 'DUPLICATE' },
  { seller_name: 'Another New', mid: '200004', email: 'new4@example.com', phone: '+91 9900005555', program: 'Elevate', city: 'Hyderabad', status: 'NEW' },
  { seller_name: '', mid: '', email: 'invalid@example.com', phone: '', program: 'ANA', city: '', status: 'INVALID' },
  { seller_name: 'Existing Update', mid: '100201', email: 'up@example.com', phone: '+91 9900006666', program: 'ANA', city: 'Pune', status: 'UPDATE' },
];

const STATUS_STYLE = {
  NEW: { bg: '#f0fdf4', color: '#14532d', label: 'NEW' },
  DUPLICATE: { bg: '#fefce8', color: '#854d0e', label: 'DUPLICATE' },
  INVALID: { bg: '#fef2f2', color: '#991b1b', label: 'INVALID' },
  UPDATE: { bg: '#eff6ff', color: '#1e40af', label: 'UPDATE' },
};

export default function Import() {
  const { addToast, navigate } = useApp();
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const stats = {
    total: MOCK_ROWS.length,
    new: MOCK_ROWS.filter(r => r.status === 'NEW').length,
    duplicate: MOCK_ROWS.filter(r => r.status === 'DUPLICATE').length,
    invalid: MOCK_ROWS.filter(r => r.status === 'INVALID').length,
    update: MOCK_ROWS.filter(r => r.status === 'UPDATE').length,
  };

  const handleFile = (f) => {
    setFile(f);
    setTimeout(() => setStep(1), 400);
  };

  const handleImport = async () => {
    setImporting(true);
    const rows = MOCK_ROWS.filter(r => r.status === 'NEW' || (!skipDuplicates && r.status === 'DUPLICATE'));
    const res = await importLeads(rows.map(r => ({ seller_name: r.seller_name, mid: r.mid, email: r.email, phone: r.phone, program: r.program, city: r.city })));
    setResult(res);
    setStep(5);
    setImporting(false);
    addToast(`Import complete — ${res.imported} leads added`, 'success');
  };

  const StepIndicator = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24 }}>
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i < step ? 'var(--success)' : i === step ? 'var(--primary)' : 'var(--border)',
              color: i <= step ? '#fff' : 'var(--text-3)', fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>
              {i < step ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span style={{ fontSize: 12, fontWeight: i === step ? 600 : 400, color: i === step ? 'var(--text)' : i < step ? 'var(--success)' : 'var(--text-3)', whiteSpace: 'nowrap' }}>{s}</span>
          </div>
          {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: 'var(--border)', margin: '0 8px', minWidth: 16 }} />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: 900 }}>
      <Card>
        <StepIndicator />

        {/* Step 0: Upload */}
        {step === 0 && (
          <div>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              style={{
                border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--r-lg)', padding: '48px 24px',
                textAlign: 'center', background: dragOver ? 'var(--primary-light)' : 'var(--surface-alt)',
                transition: 'all .15s', cursor: 'pointer',
              }}
              onClick={() => document.getElementById('file-input').click()}
            >
              <Upload size={36} style={{ color: 'var(--text-3)', marginBottom: 12 }} />
              <div style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                Drag & drop your CSV or XLSX file here
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)', marginBottom: 16 }}>or</div>
              <Btn variant="secondary" size="sm" icon={<FileText size={13} />}>Choose File</Btn>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 12 }}>Supports CSV and XLSX files · Max 10MB</div>
              <input id="file-input" type="file" accept=".csv,.xlsx" style={{ display: 'none' }}
                onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
            </div>
            <div style={{ marginTop: 16, padding: 14, background: 'var(--surface-alt)', borderRadius: 'var(--r)', fontSize: 'var(--text-sm)', color: 'var(--text-2)' }}>
              <strong>Expected columns:</strong> Seller Name, MID, Email, Phone, Program (ANA/Elevate), City
            </div>
          </div>
        )}

        {/* Step 1: Map Columns */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '10px 14px', background: 'var(--success-light)', borderRadius: 'var(--r)', border: '1px solid #bbf7d0' }}>
              <CheckCircle size={16} color="var(--success)" />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                <strong>{file?.name || 'leads_import.csv'}</strong> — 7 rows detected
              </span>
            </div>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 12 }}>Map CSV Columns to CRM Fields</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['Seller Name', 'seller_name'], ['MID', 'mid'], ['Email', 'email'], ['Phone', 'phone'], ['Program', 'program'], ['City', 'city']].map(([label, field]) => (
                <div key={field} style={{ display: 'grid', gridTemplateColumns: '1fr 24px 1fr', gap: 12, alignItems: 'center' }}>
                  <div style={{ padding: '8px 12px', background: 'var(--surface-alt)', borderRadius: 'var(--r)', fontSize: 'var(--text-sm)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>{label}</div>
                  <ChevronRight size={14} color="var(--text-3)" />
                  <select defaultValue={field} style={{ height: 34, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 'var(--text-sm)', background: 'var(--surface)', outline: 'none', cursor: 'pointer' }}>
                    <option value={field}>{label}</option>
                    <option>-- Ignore this column --</option>
                  </select>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <Btn variant="ghost" onClick={() => setStep(0)}>Back</Btn>
              <Btn onClick={() => setStep(2)}>Continue</Btn>
            </div>
          </div>
        )}

        {/* Step 2: Validate */}
        {step === 2 && (
          <div>
            <h3 style={{ fontWeight: 600, marginBottom: 14 }}>Validation Results</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Total Rows', value: stats.total, color: 'var(--text)' },
                { label: 'New', value: stats.new, color: 'var(--success)' },
                { label: 'Duplicates', value: stats.duplicate, color: 'var(--warning)' },
                { label: 'Invalid', value: stats.invalid, color: 'var(--danger)' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '14px', background: 'var(--surface-alt)', borderRadius: 'var(--r)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {stats.invalid > 0 && (
              <div style={{ display: 'flex', gap: 10, padding: '10px 14px', background: 'var(--danger-light)', borderRadius: 'var(--r)', marginBottom: 14, border: '1px solid #fecaca' }}>
                <AlertTriangle size={16} color="var(--danger)" />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--danger)' }}>{stats.invalid} rows have missing required fields and will be skipped.</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Btn variant="ghost" onClick={() => setStep(1)}>Back</Btn>
              <Btn onClick={() => setStep(3)}>Continue</Btn>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontWeight: 600 }}>Preview Import ({stats.total} rows)</h3>
              <div style={{ display: 'flex', gap: 16, fontSize: 'var(--text-sm)', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={skipDuplicates} onChange={e => setSkipDuplicates(e.target.checked)} />
                  <span>Skip Duplicates</span>
                </label>
              </div>
            </div>
            <div style={{ overflowX: 'auto', borderRadius: 'var(--r)', border: '1px solid var(--border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-alt)' }}>
                    {['Status', 'Seller Name', 'MID', 'Email', 'Program', 'City'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_ROWS.map((row, i) => {
                    const st = STATUS_STYLE[row.status];
                    return (
                      <tr key={i} style={{ borderTop: '1px solid var(--border)', opacity: (row.status === 'DUPLICATE' && skipDuplicates) || row.status === 'INVALID' ? .45 : 1 }}>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{ background: st.bg, color: st.color, padding: '2px 7px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>{st.label}</span>
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: row.status === 'NEW' ? 500 : 400 }}>{row.seller_name || <em style={{ color: 'var(--danger)' }}>Missing</em>}</td>
                        <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{row.mid || <em style={{ color: 'var(--danger)' }}>Missing</em>}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-2)' }}>{row.email}</td>
                        <td style={{ padding: '8px 12px' }}>{row.program}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-2)' }}>{row.city}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <Btn variant="ghost" onClick={() => setStep(2)}>Back</Btn>
              <Btn onClick={() => setStep(4)}>Continue</Btn>
            </div>
          </div>
        )}

        {/* Step 4: Confirm Import */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Upload size={40} style={{ color: 'var(--primary)', marginBottom: 16 }} />
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 8 }}>Ready to Import</h3>
            <p style={{ color: 'var(--text-2)', marginBottom: 6 }}>
              <strong>{stats.new + (skipDuplicates ? 0 : stats.duplicate)}</strong> leads will be added.
            </p>
            <p style={{ color: 'var(--text-3)', fontSize: 'var(--text-sm)', marginBottom: 24 }}>
              {skipDuplicates ? stats.duplicate + ' duplicates will be skipped. ' : ''}
              {stats.invalid} invalid rows will be skipped.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Btn variant="ghost" onClick={() => setStep(3)}>Back</Btn>
              <Btn onClick={handleImport} disabled={importing}>
                {importing ? 'Importing...' : 'Import Leads'}
              </Btn>
            </div>
          </div>
        )}

        {/* Step 5: Summary */}
        {step === 5 && result && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={28} color="var(--success)" />
            </div>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 16 }}>Import Complete</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, maxWidth: 400, margin: '0 auto 24px' }}>
              {[
                { label: 'Imported', value: result.imported, color: 'var(--success)' },
                { label: 'Skipped', value: result.duplicates, color: 'var(--warning)' },
                { label: 'Invalid', value: result.invalid, color: 'var(--danger)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--surface-alt)', padding: 14, borderRadius: 'var(--r)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Btn variant="ghost" onClick={() => { setStep(0); setFile(null); setResult(null); }}>Import Again</Btn>
              <Btn onClick={() => navigate('leads')}>View Leads</Btn>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
