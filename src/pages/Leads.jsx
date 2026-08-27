import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Download, UserPlus, Phone, MoreHorizontal, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
import { getLeads, assignLeads, addCallLog, getUsers } from '../services/api.js';
import { USERS, STATUSES } from '../data/mockData.js';
import { useApp } from '../App.jsx';
import { StatusBadge, Btn, Card, Modal, Select, Textarea, SearchInput, FilterSelect, Pagination, EmptyState, ConfirmModal } from '../components/ui.jsx';

const PAGE_SIZE = 10;

export default function Leads() {
  const { program, navigate, addToast } = useApp();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [execFilter, setExecFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [sort, setSort] = useState({ key: 'updated_at', dir: 'desc' });
  const [showCallModal, setShowCallModal] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [users, setUsers] = useState([]);
  const debounceRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    getLeads({ program, status: statusFilter, executive: execFilter, search })
      .then(data => {
        const sorted = [...data].sort((a, b) => {
          const va = a[sort.key] ?? '', vb = b[sort.key] ?? '';
          return sort.dir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
        });
        setLeads(sorted);
        setPage(1);
      })
      .catch(error => {
        setLeads([]);
        addToast(error?.message || 'Unable to load leads.', 'error');
      })
      .finally(() => setLoading(false));
  }, [program, statusFilter, execFilter, search, sort]);

  useEffect(() => {
    let mounted = true;
    getUsers().then(data => {
      if (mounted && Array.isArray(data)) setUsers(data);
    }).catch(error => {
      if (mounted) addToast(error?.message || 'Unable to load CRM users.', 'error');
    });
    return () => { mounted = false; };
  }, [addToast]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(load, search ? 300 : 0);
  }, [load]);

  const pageLeads = leads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allSelected = pageLeads.length > 0 && pageLeads.every(l => selected.has(l.lead_id));

  const toggleAll = () => {
    if (allSelected) setSelected(s => { const n = new Set(s); pageLeads.forEach(l => n.delete(l.lead_id)); return n; });
    else setSelected(s => { const n = new Set(s); pageLeads.forEach(l => n.add(l.lead_id)); return n; });
  };

  const toggleOne = id => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const sortBy = key => setSort(s => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));

  const SortIcon = ({ k }) => sort.key === k
    ? (sort.dir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)
    : <span style={{ opacity: .3 }}><ChevronDown size={11} /></span>;

  const th = (label, key) => (
    <th onClick={key ? () => sortBy(key) : undefined}
      style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.4px', whiteSpace: 'nowrap', cursor: key ? 'pointer' : 'default', userSelect: 'none', background: 'var(--surface-alt)' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{label}{key && <SortIcon k={key} />}</span>
    </th>
  );

  const execOptions = (users.length ? users : USERS)
    .filter(u => u.role === 'Executive' || u.role === 'Admin')
    .map(u => ({ value: u.user_id, label: u.name }));

  return (
    <div className="animate-fade-in">
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search MID, seller, phone..." width={260} />
        <FilterSelect value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} options={STATUSES} placeholder="All Statuses" />
        <FilterSelect value={execFilter} onChange={v => { setExecFilter(v); setPage(1); }} options={execOptions} placeholder="All Executives" />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {selected.size > 0 && (
            <Btn variant="secondary" size="sm" onClick={() => setShowAssignModal(true)} icon={<UserPlus size={13} />}>
              Assign ({selected.size})
            </Btn>
          )}
          <Btn variant="ghost" size="sm" icon={<Download size={13} />}>Export</Btn>
          <Btn size="sm" onClick={() => navigate('import')} icon={<Plus size={13} />}>Import</Btn>
        </div>
      </div>

      {/* Table */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr>
                <th style={{ padding: '9px 12px', background: 'var(--surface-alt)', width: 36 }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
                </th>
                {th('MID', 'mid')}
                {th('Seller', 'seller_name')}
                {th('Program', 'program')}
                {th('Assigned To', 'assigned_to_name')}
                {th('Status', 'seller_status')}
                {th('Attempts', 'attempts')}
                {th('Callback', 'callback_date')}
                {th('Last Contacted', 'last_contacted_at')}
                {th('Updated', 'updated_at')}
                <th style={{ padding: '9px 12px', background: 'var(--surface-alt)', width: 60 }} />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                    {[...Array(11)].map((_, j) => (
                      <td key={j} style={{ padding: '12px' }}>
                        <div className="skeleton" style={{ height: 12, borderRadius: 4, width: j === 0 ? 16 : '80%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pageLeads.length === 0 ? (
                <tr><td colSpan={11}><EmptyState title="No leads found" description="Try adjusting your filters or search terms." /></td></tr>
              ) : pageLeads.map(l => (
                <tr key={l.lead_id}
                  style={{ borderTop: '1px solid var(--border)', background: selected.has(l.lead_id) ? 'var(--primary-light)' : 'transparent', transition: 'background .1s' }}
                  onMouseOver={e => { if (!selected.has(l.lead_id)) e.currentTarget.style.background = 'var(--surface-alt)'; }}
                  onMouseOut={e => { if (!selected.has(l.lead_id)) e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '10px 12px' }}>
                    <input type="checkbox" checked={selected.has(l.lead_id)} onChange={() => toggleOne(l.lead_id)} />
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{l.mid}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <button onClick={() => navigate('lead-detail', l.lead_id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--primary-text)', fontSize: 'var(--text-sm)', padding: 0, textAlign: 'left' }}>
                      {l.seller_name}
                    </button>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{l.city}</div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: l.program === 'ANA' ? '#eff6ff' : '#fdf4ff', color: l.program === 'ANA' ? '#1e40af' : '#7e22ce', padding: '2px 7px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{l.program}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-2)' }}>{l.assigned_to_name}</td>
                  <td style={{ padding: '10px 12px' }}><StatusBadge status={l.seller_status} /></td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-2)' }}>{l.attempts}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: l.callback_date && l.callback_date <= new Date().toISOString().split('T')[0] ? 'var(--danger)' : 'var(--text-2)' }}>
                    {l.callback_date ? `${l.callback_date}` : '—'}
                    {l.callback_time && <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{l.callback_time}</div>}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-3)' }}>{l.last_contacted_at || '—'}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-3)' }}>{l.updated_at}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button title="Log Call" onClick={() => setShowCallModal(l)}
                        style={{ border: 'none', background: 'var(--surface-alt)', borderRadius: 'var(--r-sm)', padding: '4px 6px', cursor: 'pointer', color: 'var(--text-2)', display: 'flex' }}>
                        <Phone size={12} />
                      </button>
                      <button title="Open Lead" onClick={() => navigate('lead-detail', l.lead_id)}
                        style={{ border: 'none', background: 'var(--surface-alt)', borderRadius: 'var(--r-sm)', padding: '4px 6px', cursor: 'pointer', color: 'var(--text-2)', display: 'flex' }}>
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '0 14px', borderTop: leads.length > 0 ? '1px solid var(--border)' : 'none' }}>
          <Pagination page={page} total={leads.length} pageSize={PAGE_SIZE} onChange={setPage} />
        </div>
      </Card>

      {showCallModal && (
        <CallLogModal lead={showCallModal} onClose={() => setShowCallModal(null)}
          onSave={async (data) => {
            try {
              await addCallLog({ lead_id: showCallModal.lead_id, ...data });
              setShowCallModal(null);
              addToast('Call logged successfully', 'success');
              await load();
            } catch (error) {
              addToast(error?.message || 'Unable to log call.', 'error');
            }
          }} />
      )}

      {showAssignModal && (
        <AssignModal
          count={selected.size}
          executives={execOptions}
          onClose={() => setShowAssignModal(false)}
          onSave={async (userId, userName) => {
            const count = selected.size;
            try {
              await assignLeads([...selected], userId, userName);
              setSelected(new Set());
              setShowAssignModal(false);
              addToast(`${count} lead${count !== 1 ? 's' : ''} assigned to ${userName}`, 'success');
              await load();
            } catch (error) {
              addToast(error?.message || 'Unable to assign leads.', 'error');
            }
          }}
        />
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

  const handleSave = async () => {
    setSaving(true);
    await onSave({ status, callback_date: callbackDate || null, callback_time: callbackTime || null, notes });
  };

  return (
    <Modal title={`Log Call — ${lead.seller_name}`} onClose={onClose} width={440}
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
        <div style={{ background: 'var(--surface-alt)', borderRadius: 'var(--r)', padding: '10px 12px', fontSize: 'var(--text-xs)', color: 'var(--text-2)' }}>
          <strong>MID:</strong> {lead.mid} &nbsp;·&nbsp; <strong>Attempts:</strong> {lead.attempts} &nbsp;·&nbsp; <strong>Current:</strong> {lead.seller_status}
        </div>
      </div>
    </Modal>
  );
}

function AssignModal({ count, executives, onClose, onSave }) {
  const [exec, setExec] = useState(executives[0]?.value || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const ex = executives.find(e => e.value === exec);
    await onSave(exec, ex?.label || '');
  };

  return (
    <Modal title="Assign Leads" onClose={onClose} width={380}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={handleSave} disabled={saving}>{saving ? 'Assigning...' : 'Assign Leads'}</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Select label="Executive" value={exec} onChange={e => setExec(e.target.value)} options={executives} required />
        <div style={{ background: 'var(--surface-alt)', borderRadius: 'var(--r)', padding: '12px', fontSize: 'var(--text-sm)', color: 'var(--text-2)' }}>
          <strong style={{ color: 'var(--text)' }}>{count} lead{count !== 1 ? 's' : ''}</strong> will be reassigned.
        </div>
      </div>
    </Modal>
  );
}
