import React, { useEffect, useState } from 'react';
import { Plus, Edit2, UserX } from 'lucide-react';
import { getUsers, saveUser } from '../services/api.js';
import { useApp } from '../App.jsx';
import { Btn, Card, Modal, Input, Select, EmptyState } from '../components/ui.jsx';

const ROLES = ['Admin', 'Executive'];
const PROGRAM_ACCESS = ['ANA', 'Elevate', 'Both'];

export default function Users() {
  const { addToast } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = () => getUsers().then(u => { setUsers(u); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    await saveUser(data);
    setEditUser(null);
    setShowCreate(false);
    addToast(data.user_id ? 'User updated' : 'User created', 'success');
    load();
  };

  const StatusChip = ({ active }) => (
    <span style={{ background: active ? 'var(--success-light)' : 'var(--surface-alt)', color: active ? 'var(--success)' : 'var(--text-3)', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );

  const RoleChip = ({ role }) => (
    <span style={{ background: role === 'Admin' ? '#fdf4ff' : 'var(--surface-alt)', color: role === 'Admin' ? '#7e22ce' : 'var(--text-2)', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
      {role}
    </span>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <Btn icon={<Plus size={13} />} onClick={() => setShowCreate(true)}>Add User</Btn>
      </div>

      <Card padding={0}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
          <thead>
            <tr style={{ background: 'var(--surface-alt)' }}>
              {['Name', 'Email', 'Role', 'Program Access', 'Status', 'Created', 'Actions'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.4px', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                  {[...Array(7)].map((_, j) => <td key={j} style={{ padding: 12 }}><div className="skeleton" style={{ height: 12, borderRadius: 4 }} /></td>)}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={7}><EmptyState title="No users found" /></td></tr>
            ) : users.map(u => (
              <tr key={u.user_id} style={{ borderTop: '1px solid var(--border)' }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--surface-alt)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#1e40af,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: '11px 14px', color: 'var(--text-2)' }}>{u.email}</td>
                <td style={{ padding: '11px 14px' }}><RoleChip role={u.role} /></td>
                <td style={{ padding: '11px 14px', color: 'var(--text-2)' }}>{u.program_access}</td>
                <td style={{ padding: '11px 14px' }}><StatusChip active={u.is_active} /></td>
                <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-3)' }}>{u.created_at}</td>
                <td style={{ padding: '11px 14px' }}>
                  <button onClick={() => setEditUser(u)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 'var(--r-sm)', padding: '4px 8px', cursor: 'pointer', fontSize: 11, color: 'var(--text-2)' }}>
                    <Edit2 size={11} /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {(editUser || showCreate) && (
        <UserModal
          user={editUser}
          onClose={() => { setEditUser(null); setShowCreate(false); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState(user || { name: '', email: '', role: 'Executive', program_access: 'ANA', is_active: true });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Modal title={user ? 'Edit User' : 'Create User'} onClose={onClose} width={440}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={async () => { setSaving(true); await onSave(form); }} disabled={saving}>{saving ? 'Saving...' : user ? 'Save Changes' : 'Create User'}</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input label="Full Name" value={form.name} onChange={set('name')} required />
        <Input label="Email" value={form.email} onChange={set('email')} type="email" required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Select label="Role" value={form.role} onChange={set('role')} options={ROLES} />
          <Select label="Program Access" value={form.program_access} onChange={set('program_access')} options={PROGRAM_ACCESS} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
          <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
          <span style={{ fontWeight: 500 }}>Active</span>
        </label>
      </div>
    </Modal>
  );
}
