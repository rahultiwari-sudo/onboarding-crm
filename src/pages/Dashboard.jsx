import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, PhoneCall, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { getDashboardMetrics } from '../services/api.js';
import { useApp } from '../App.jsx';
import { Card, KpiCard, Skeleton, StatusBadge } from '../components/ui.jsx';

const STATUS_COLORS = {
  'Pending': '#94a3b8', 'Contacted': '#3b82f6', 'RNR': '#f97316',
  'Busy': '#eab308', 'Connect Later': '#0ea5e9', 'Retail Issue': '#a855f7',
  'Not Interested': '#ef4444', 'Onboarded': '#22c55e',
};

export default function Dashboard() {
  const { program } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDashboardMetrics(program).then(d => { setData(d); setLoading(false); }).catch(() => { setData({ total: 0, pending: 0, contacted: 0, onboarded: 0, callbacks_today: 0, overdue_callbacks: 0, by_status: {}, by_exec: [], activity: [], daily_activity: [] }); setLoading(false); });
  }, [program]);

  if (loading) return <DashboardSkeleton />;

  const statusChartData = Object.entries(data.by_status).map(([name, value]) => ({ name, value }));
  const dailyActivity = Array.isArray(data.daily_activity) ? data.daily_activity : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        <KpiCard label="Total Leads" value={data.total.toLocaleString()} change={`+8.4% this month`} changeDir="up" icon={<Users size={18} />} />
        <KpiCard label="Pending" value={data.pending} change="Awaiting contact" icon={<Clock size={18} />} />
        <KpiCard label="Contacted" value={data.contacted} change={`${Math.round(data.contacted/data.total*100)}% reach rate`} changeDir="up" icon={<PhoneCall size={18} />} />
        <KpiCard label="Onboarded" value={data.onboarded} change={`${Math.round(data.onboarded/data.total*100)}% conversion`} changeDir="up" icon={<CheckCircle size={18} />} color="var(--success)" />
        <KpiCard label="Callbacks Today" value={data.callbacks_today} change="Scheduled" icon={<TrendingUp size={18} />} color="var(--info)" />
        <KpiCard label="Overdue" value={data.overdue_callbacks} change={data.overdue_callbacks > 0 ? 'Needs attention' : 'All caught up'} changeDir={data.overdue_callbacks > 0 ? 'down' : 'up'} icon={<AlertCircle size={18} />} color="var(--danger)" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 14 }}>
        {/* Status Pie */}
        <Card>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-2)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.4px' }}>Leads by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                {statusChartData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.name] || '#ccc'} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Daily Activity */}
        <Card>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-2)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.4px' }}>Daily Activity (This Week)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyActivity} barSize={8} barGap={3}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
              <Bar dataKey="calls" fill="#3b82f6" name="Calls" radius={[3,3,0,0]} />
              <Bar dataKey="emails" fill="#0ea5e9" name="Emails" radius={[3,3,0,0]} />
              <Bar dataKey="onboardings" fill="#22c55e" name="Onboardings" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Exec Performance + Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14 }}>
        {/* Exec table */}
        <Card padding={0}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Executive Performance</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ background: 'var(--surface-alt)' }}>
                {['Executive', 'Assigned', 'Contacted', 'Onboarded'].map(h => (
                  <th key={h} style={{ padding: '8px 14px', textAlign: h === 'Executive' ? 'left' : 'center', fontWeight: 600, color: 'var(--text-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.4px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.by_exec.map(e => (
                <tr key={e.name} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>{e.name}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-2)' }}>{e.assigned}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--info)' }}>{e.contacted}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--success)' }}>{e.onboarded}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Recent Activity */}
        <Card padding={0}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Recent Activity</h3>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 280 }}>
            {data.activity.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', whiteSpace: 'nowrap', minWidth: 70, paddingTop: 1 }}>{a.time}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                    <strong style={{ fontWeight: 600 }}>{a.user}</strong> — {a.action}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', marginTop: 2 }}>
                    {a.lead !== '—' && <span style={{ color: 'var(--primary-text)', marginRight: 4 }}>{a.lead}</span>}
                    {a.details}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Callback Summary */}
      <Card>
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 12 }}>Callback Summary</h3>
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { label: 'Today', value: data.callbacks_today, color: 'var(--info)' },
            { label: 'Overdue', value: data.overdue_callbacks, color: 'var(--danger)' },
            { label: 'Upcoming', value: 7, color: 'var(--warning)' },
            { label: 'Completed', value: data.contacted, color: 'var(--success)' },
          ].map(c => (
            <div key={c.label} style={{ textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.value}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-2)', fontWeight: 500, marginTop: 2 }}>{c.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12 }}>
        {[...Array(6)].map((_, i) => <div key={i} style={{ background: 'var(--surface)', borderRadius: 8, padding: 16, height: 100 }}><Skeleton height={12} style={{ marginBottom: 12 }} /><Skeleton height={28} width="60%" /></div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 14 }}>
        <Skeleton height={280} />
        <Skeleton height={280} />
      </div>
    </div>
  );
}
