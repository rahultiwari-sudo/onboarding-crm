import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download } from 'lucide-react';
import { getReports } from '../services/api.js';
import { USERS } from '../data/mockData.js';
import { useApp } from '../App.jsx';
import { Card, Btn, FilterSelect, Skeleton } from '../components/ui.jsx';

const STATUS_COLORS = {
  'Pending': '#94a3b8', 'Contacted': '#3b82f6', 'RNR': '#f97316',
  'Busy': '#eab308', 'Connect Later': '#0ea5e9', 'Retail Issue': '#a855f7',
  'Not Interested': '#ef4444', 'Onboarded': '#22c55e',
};

export default function Reports() {
  const { program } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progFilter, setProgFilter] = useState('All Programs');
  const [execFilter, setExecFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    getReports({ program: progFilter, executive: execFilter })
      .then(d => { setData(d); setLoading(false); });
  }, [progFilter, execFilter]);

  const execOptions = USERS.map(u => ({ value: u.user_id, label: u.name }));

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[...Array(3)].map((_, i) => <Skeleton key={i} height={200} />)}
    </div>
  );

  const statusData = Object.entries(data.status_distribution).map(([name, value]) => ({ name, value }));

  const dailyActivity = [
    { date: 'Aug 20', calls: 24, emails: 8, onboardings: 2 },
    { date: 'Aug 21', calls: 31, emails: 14, onboardings: 4 },
    { date: 'Aug 22', calls: 19, emails: 6, onboardings: 1 },
    { date: 'Aug 23', calls: 38, emails: 18, onboardings: 6 },
    { date: 'Aug 24', calls: 27, emails: 11, onboardings: 3 },
    { date: 'Aug 25', calls: 35, emails: 17, onboardings: 5 },
    { date: 'Aug 26', calls: 22, emails: 9, onboardings: 2 },
  ];

  return (
    <div className="animate-fade-in">
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
        <FilterSelect value={progFilter} onChange={setProgFilter} options={['All Programs', 'ANA', 'Elevate']} />
        <FilterSelect value={execFilter} onChange={setExecFilter} options={execOptions} placeholder="All Executives" />
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          {[
            { label: 'This Week', active: true },
            { label: 'This Month', active: false },
            { label: 'Custom', active: false },
          ].map(b => (
            <button key={b.label}
              style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 12, cursor: 'pointer', fontWeight: b.active ? 600 : 400, background: b.active ? 'var(--primary)' : 'var(--surface)', color: b.active ? '#fff' : 'var(--text-2)' }}>
              {b.label}
            </button>
          ))}
        </div>
        <Btn variant="ghost" size="sm" icon={<Download size={13} />}>Export Report</Btn>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Executive Performance */}
        <Card padding={0}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Executive Performance</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ background: 'var(--surface-alt)' }}>
                {['Executive', 'Assigned', 'Calls Made', 'Contacted', 'Onboarded', 'Conversion %'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: h === 'Executive' ? 'left' : 'right', fontWeight: 600, fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.4px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.exec_performance.map(e => {
                const conv = e.assigned > 0 ? ((e.onboarded / e.assigned) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={e.name} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '11px 14px', fontWeight: 600 }}>{e.name}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', color: 'var(--text-2)' }}>{e.assigned}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', color: 'var(--text-2)' }}>{e.calls}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', color: 'var(--info)' }}>{e.contacted}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', color: 'var(--success)' }}>{e.onboarded}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: parseFloat(conv) >= 15 ? 'var(--success)' : parseFloat(conv) >= 8 ? 'var(--warning)' : 'var(--danger)' }}>
                        {conv}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {/* Program Performance */}
        <Card padding={0}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Program Performance</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ background: 'var(--surface-alt)' }}>
                {['Program', 'Total', 'Contacted', 'Onboarded', 'Pending', 'Conversion %'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: h === 'Program' ? 'left' : 'right', fontWeight: 600, fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.4px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.program_performance.map(p => {
                const conv = p.total > 0 ? ((p.onboarded / p.total) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={p.program} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '11px 14px', fontWeight: 600 }}>
                      <span style={{ background: p.program === 'ANA' ? '#eff6ff' : '#fdf4ff', color: p.program === 'ANA' ? '#1e40af' : '#7e22ce', padding: '2px 8px', borderRadius: 99, fontSize: 12 }}>{p.program}</span>
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', color: 'var(--text-2)' }}>{p.total}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', color: 'var(--info)' }}>{p.contacted}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', color: 'var(--success)' }}>{p.onboarded}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', color: 'var(--text-2)' }}>{p.pending}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 700, color: parseFloat(conv) >= 15 ? 'var(--success)' : 'var(--warning)' }}>{conv}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Status Distribution */}
          <Card>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 14 }}>Status Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={35}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Distribution table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
              {statusData.map(s => {
                const total = statusData.reduce((a, b) => a + b.value, 0);
                const pct = total > 0 ? ((s.value / total) * 100).toFixed(1) : '0';
                return (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[s.name], flexShrink: 0 }} />
                    <span style={{ flex: 1, color: 'var(--text-2)' }}>{s.name}</span>
                    <span style={{ fontWeight: 600 }}>{s.value}</span>
                    <span style={{ color: 'var(--text-3)', minWidth: 36, textAlign: 'right' }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Daily Activity */}
          <Card>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 14 }}>Daily Activity (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyActivity} barSize={7} barGap={2}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                <Bar dataKey="calls" fill="#3b82f6" name="Calls" radius={[2,2,0,0]} />
                <Bar dataKey="emails" fill="#0ea5e9" name="Emails" radius={[2,2,0,0]} />
                <Bar dataKey="onboardings" fill="#22c55e" name="Onboardings" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'center' }}>
              {[['Calls', '#3b82f6'], ['Emails', '#0ea5e9'], ['Onboardings', '#22c55e']].map(([l, c]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-2)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
