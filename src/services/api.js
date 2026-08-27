// ============================================================
// SERVICE LAYER — Mock implementation
//
// Current:  Frontend → api.js (mock) → mockData.js (in-memory)
// Future:   Frontend → api.js → google.script.run → Apps Script → Google Sheets
//
// To migrate, replace each function body with:
//   return new Promise((resolve, reject) => {
//     google.script.run
//       .withSuccessHandler(resolve)
//       .withFailureHandler(reject)
//       .functionName(args);
//   });
// ============================================================

import { leads as mockLeads, callLogs, emailLogs, auditLogs, activityFeed, USERS } from '../data/mockData.js';

// Mutable in-memory state
let _leads = [...mockLeads];
let _callLogs = [...callLogs];
let _auditLogs = [...auditLogs];
let _users = [...USERS];

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

const addAudit = (user, lead_id, action, field, old_value, new_value) => {
  _auditLogs.unshift({
    timestamp: new Date().toISOString(),
    user, lead_id, action, field,
    old_value: String(old_value ?? ''),
    new_value: String(new_value ?? ''),
  });
};

// ── Leads ──────────────────────────────────────────────────

export async function getLeads(filters = {}) {
  if (isAppsScriptRuntime()) {
    return runAppsScript('getLeads', filters);
  }

  await delay();
  let result = [..._leads];
  if (filters.program && filters.program !== 'All Programs') {
    result = result.filter(l => l.program === filters.program);
  }
  if (filters.status) result = result.filter(l => l.seller_status === filters.status);
  if (filters.executive) result = result.filter(l => l.assigned_to === filters.executive);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(l =>
      l.seller_name.toLowerCase().includes(q) ||
      l.mid.includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.case_number?.toLowerCase().includes(q) ||
      l.request_id?.toLowerCase().includes(q)
    );
  }
  return result;
}

export async function getLead(id) {
  if (isAppsScriptRuntime()) {
    return runAppsScript('getLeadForFrontend', id);
  }

  await delay();
  return _leads.find(l => l.lead_id === id) || null;
}

export async function updateLead(id, data) {
  if (isAppsScriptRuntime()) {
    return runAppsScript('updateLead', id, data);
  }

  await delay();
  const idx = _leads.findIndex(l => l.lead_id === id);
  if (idx === -1) throw new Error('Lead not found');
  const old = _leads[idx];
  _leads[idx] = { ..._leads[idx], ...data, updated_at: new Date().toISOString().split('T')[0] };
  Object.keys(data).forEach(key => {
    if (old[key] !== data[key]) {
      addAudit('Rahul Tiwari', id, 'Lead Updated', key, old[key], data[key]);
    }
  });
  return _leads[idx];
}

export async function createLead(data) {
  await delay();
  const newLead = {
    lead_id: `l${Date.now()}`,
    created_at: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString().split('T')[0],
    attempts: 0,
    ...data,
  };
  _leads.unshift(newLead);
  addAudit('Rahul Tiwari', newLead.lead_id, 'Lead Created', null, null, newLead.seller_name);
  return newLead;
}

export async function assignLeads(leadIds, userId, userName) {
  if (isAppsScriptRuntime()) {
    const assignmentDate = new Date().toISOString();
    await Promise.all(leadIds.map(id => runAppsScript('updateLead', id, {
      assigned_to: userId,
      assignment_date: assignmentDate,
    })));
    return { assigned: leadIds.length };
  }

  await delay();
  leadIds.forEach(id => {
    const idx = _leads.findIndex(l => l.lead_id === id);
    if (idx !== -1) {
      const old = _leads[idx].assigned_to_name;
      _leads[idx].assigned_to = userId;
      _leads[idx].assigned_to_name = userName;
      _leads[idx].updated_at = new Date().toISOString().split('T')[0];
      addAudit('Rahul Tiwari', id, 'Lead Assigned', 'assigned_to', old, userName);
    }
  });
  return { assigned: leadIds.length };
}

// ── Call Logs ──────────────────────────────────────────────

export async function addCallLog(data) {
  if (isAppsScriptRuntime()) {
    return runAppsScript('addCallLog', data);
  }
  await delay();
  const log = {
    call_log_id: `cl${Date.now()}`,
    call_time: new Date().toISOString(),
    ...data,
  };
  _callLogs.unshift(log);

  // Update the lead
  const idx = _leads.findIndex(l => l.lead_id === data.lead_id);
  if (idx !== -1) {
    const old = _leads[idx];
    _leads[idx] = {
      ..._leads[idx],
      seller_status: data.status,
      attempts: (_leads[idx].attempts || 0) + 1,
      last_contacted_at: new Date().toISOString().split('T')[0],
      callback_date: data.callback_date || _leads[idx].callback_date,
      callback_time: data.callback_time || _leads[idx].callback_time,
      updated_at: new Date().toISOString().split('T')[0],
    };
    addAudit('Rahul Tiwari', data.lead_id, 'Status Changed', 'seller_status', old.seller_status, data.status);
    addAudit('Rahul Tiwari', data.lead_id, 'Call Logged', 'attempts', old.attempts, _leads[idx].attempts);
  }
  return log;
}

export async function getCallLogs(leadId) {
  if (isAppsScriptRuntime()) {
    return runAppsScript('getCallLogs', leadId);
  }
  await delay();
  return _callLogs.filter(cl => cl.lead_id === leadId);
}

// ── Callbacks ──────────────────────────────────────────────

export async function getCallbacks(filter = 'all') {
  if (isAppsScriptRuntime()) {
    return runAppsScript('getCallbacks', filter);
  }
  await delay();
  const today = new Date().toISOString().split('T')[0];
  const withCb = _leads.filter(l => l.callback_date);

  if (filter === 'today') return withCb.filter(l => l.callback_date === today);
  if (filter === 'overdue') return withCb.filter(l => l.callback_date < today);
  if (filter === 'upcoming') return withCb.filter(l => l.callback_date > today);
  if (filter === 'completed') return _leads.filter(l => l.seller_status === 'Onboarded' || l.seller_status === 'Contacted');
  return withCb;
}

export async function completeCallback(leadId) {
  if (isAppsScriptRuntime()) {
    return runAppsScript('completeCallback', leadId);
  }
  await delay();
  const idx = _leads.findIndex(l => l.lead_id === leadId);
  if (idx !== -1) {
    _leads[idx].callback_date = null;
    _leads[idx].callback_time = null;
    _leads[idx].updated_at = new Date().toISOString().split('T')[0];
    addAudit('Rahul Tiwari', leadId, 'Callback Updated', 'callback_date', _leads[idx].callback_date, 'Completed');
  }
}

// ── Dashboard ──────────────────────────────────────────────

export async function getDashboardMetrics(program = 'All Programs') {
  if (isAppsScriptRuntime()) {
    return runAppsScript('getDashboardMetrics', program);
  }
  await delay();
  const filtered = program === 'All Programs' ? _leads : _leads.filter(l => l.program === program);
  const today = new Date().toISOString().split('T')[0];

  const byStatus = {};
  filtered.forEach(l => { byStatus[l.seller_status] = (byStatus[l.seller_status] || 0) + 1; });

  const byExec = {};
  filtered.forEach(l => {
    if (!byExec[l.assigned_to_name]) byExec[l.assigned_to_name] = { assigned: 0, contacted: 0, onboarded: 0 };
    byExec[l.assigned_to_name].assigned++;
    if (['Contacted', 'Connect Later', 'Busy', 'RNR'].includes(l.seller_status)) byExec[l.assigned_to_name].contacted++;
    if (l.seller_status === 'Onboarded') byExec[l.assigned_to_name].onboarded++;
  });

  return {
    total: filtered.length,
    pending: byStatus['Pending'] || 0,
    contacted: (byStatus['Contacted'] || 0) + (byStatus['RNR'] || 0) + (byStatus['Busy'] || 0),
    onboarded: byStatus['Onboarded'] || 0,
    callbacks_today: filtered.filter(l => l.callback_date === today).length,
    overdue_callbacks: filtered.filter(l => l.callback_date && l.callback_date < today).length,
    by_status: byStatus,
    by_exec: Object.entries(byExec).map(([name, v]) => ({ name, ...v })),
    activity: activityFeed,
  };
}

// ── Reports ────────────────────────────────────────────────

export async function getReports(filters = {}) {
  if (isAppsScriptRuntime()) {
    return runAppsScript('getReports', filters);
  }
  await delay();
  let data = [..._leads];
  if (filters.program && filters.program !== 'All Programs') data = data.filter(l => l.program === filters.program);
  if (filters.executive) data = data.filter(l => l.assigned_to === filters.executive);

  const execPerf = {};
  data.forEach(l => {
    if (!execPerf[l.assigned_to_name]) execPerf[l.assigned_to_name] = { name: l.assigned_to_name, assigned: 0, calls: 0, contacted: 0, onboarded: 0 };
    execPerf[l.assigned_to_name].assigned++;
    execPerf[l.assigned_to_name].calls += l.attempts;
    if (!['Pending', 'Not Interested', 'Retail Issue'].includes(l.seller_status)) execPerf[l.assigned_to_name].contacted++;
    if (l.seller_status === 'Onboarded') execPerf[l.assigned_to_name].onboarded++;
  });

  const progPerf = {};
  data.forEach(l => {
    if (!progPerf[l.program]) progPerf[l.program] = { program: l.program, total: 0, contacted: 0, onboarded: 0, pending: 0 };
    progPerf[l.program].total++;
    if (l.seller_status === 'Onboarded') progPerf[l.program].onboarded++;
    else if (l.seller_status === 'Pending') progPerf[l.program].pending++;
    else progPerf[l.program].contacted++;
  });

  return {
    exec_performance: Object.values(execPerf),
    program_performance: Object.values(progPerf),
    status_distribution: data.reduce((acc, l) => {
      acc[l.seller_status] = (acc[l.seller_status] || 0) + 1;
      return acc;
    }, {}),
  };
}

// ── Audit ──────────────────────────────────────────────────

export async function getAuditLogs(filters = {}) {
  if (isAppsScriptRuntime()) {
    return runAppsScript('getAuditLogs', filters);
  }
  await delay();
  let logs = [..._auditLogs];
  if (filters.user) logs = logs.filter(l => l.user === filters.user);
  if (filters.action) logs = logs.filter(l => l.action === filters.action);
  if (filters.lead_id) logs = logs.filter(l => l.lead_id === filters.lead_id);
  return logs;
}

// ── Users ──────────────────────────────────────────────────

export async function getUsers() {
  if (isAppsScriptRuntime()) {
    return runAppsScript('getCRMUsers');
  }

  await delay();
  return [..._users];
}

export async function saveUser(data) {
  if (isAppsScriptRuntime()) {
    return runAppsScript('saveCRMUser', data);
  }
  await delay();
  if (data.user_id) {
    const idx = _users.findIndex(u => u.user_id === data.user_id);
    if (idx !== -1) _users[idx] = { ..._users[idx], ...data };
  } else {
    _users.push({ user_id: `u${Date.now()}`, created_at: new Date().toISOString().split('T')[0], ...data });
  }
  return data;
}

// ── Import ─────────────────────────────────────────────────

export async function importLeads(rows) {
  if (isAppsScriptRuntime()) {
    throw new Error('Lead import is not connected to Apps Script yet.');
  }
  await delay(800);
  let imported = 0, duplicates = 0, invalid = 0;
  rows.forEach(row => {
    if (!row.seller_name || !row.mid) { invalid++; return; }
    const exists = _leads.find(l => l.mid === row.mid);
    if (exists) { duplicates++; return; }
    _leads.unshift({ lead_id: `l${Date.now()}-${imported}`, attempts: 0, seller_status: 'Pending', created_at: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString().split('T')[0], ...row });
    imported++;
  });
  addAudit('Rahul Tiwari', null, 'Import Completed', null, null, `${imported} leads imported`);
  return { imported, duplicates, invalid };
}

// ── Email ──────────────────────────────────────────────────

export async function sendEmail(data) {
  if (isAppsScriptRuntime()) {
    throw new Error('Bulk email is not connected to Apps Script yet.');
  }
  await delay(500);
  // Future: google.script.run.withSuccessHandler(resolve).sendBulkEmail(data)
  addAudit('Rahul Tiwari', null, 'Email Sent', null, null, `Bulk email to ${data.recipient_count} leads`);
  return { queued: data.recipient_count };
}

// ── Current User ───────────────────────────────────────────

export function isAppsScriptRuntime() {
  return typeof window !== 'undefined' &&
    typeof window.google !== 'undefined' &&
    typeof window.google.script !== 'undefined' &&
    typeof window.google.script.run !== 'undefined';
}

function runAppsScript(functionName, ...args) {
  return new Promise((resolve, reject) => {
    if (!isAppsScriptRuntime()) {
      reject(new Error('Apps Script runtime is not available.'));
      return;
    }

    window.google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(error => {
        const message = error?.message || String(error) || 'Apps Script request failed.';
        reject(new Error(message));
      })
      [functionName](...args);
  });
}

// Current user: real Apps Script identity in production, mock user in local Vite.
export async function getCurrentUser() {
  if (isAppsScriptRuntime()) {
    return runAppsScript('getCurrentUser');
  }

  return {
    user_id: 'DEV-001',
    name: 'Local Developer',
    email: 'local@development',
    role: 'ADMIN',
    program_access: 'ALL',
    is_active: true,
  };
}
