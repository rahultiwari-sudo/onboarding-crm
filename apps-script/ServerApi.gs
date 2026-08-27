/**
 * ONBOARDING CRM - FRONTEND SERVER API
 *
 * Production-only endpoints used by src/services/api.js.
 * Depends on Config.gs, Utils.gs, Database.gs, Validation.gs and Audit.gs.
 */

function getCallLogs(leadId) {
  const user = requireCRMAccess();
  const lead = getLeadByIdRaw_(leadId);
  if (!lead) throw new Error(`Lead not found in Leads sheet: ${normalizeText(leadId)}`);
  if (!userHasProgramAccess(lead.program)) throw new Error('You do not have access to this lead.');

  return getAllRows(CRM.SHEETS.CALL_LOGS)
    .filter(log => normalizeText(log.lead_id) === normalizeText(leadId))
    .sort((a, b) => new Date(b.call_datetime || b.created_at) - new Date(a.call_datetime || a.created_at))
    .map(log => ({
      call_log_id: normalizeText(log.call_log_id),
      lead_id: normalizeText(log.lead_id),
      call_time: serializeSheetValue_(log.call_datetime || log.created_at),
      executive: normalizeText(log.user_name),
      status: normalizeFrontendStatus_(log.new_status || log.call_status),
      previous_status: normalizeFrontendStatus_(log.previous_status),
      callback_date: serializeSheetValue_(log.callback_date),
      callback_time: serializeSheetValue_(log.callback_time),
      notes: normalizeText(log.notes),
      created_at: serializeSheetValue_(log.created_at)
    }));
}

function addCallLog(data) {
  const user = requireCRMAccess();
  data = data || {};
  const leadId = normalizeText(data.lead_id);
  if (!leadId) throw new Error('lead_id is required.');

  const lead = getLeadByIdRaw_(leadId);
  if (!lead) throw new Error(`Lead not found in Leads sheet: ${leadId}`);
  if (!userHasProgramAccess(lead.program)) throw new Error('You do not have access to this lead.');

  const frontendStatus = normalizeText(data.status) || normalizeFrontendStatus_(lead.current_status);
  const newStatus = normalizeBackendStatus_(frontendStatus);
  const previousStatus = normalizeText(lead.current_status).toUpperCase();
  const now = getCurrentTimestamp();
  const callbackDate = normalizeText(data.callback_date);
  const callbackTime = normalizeText(data.callback_time);
  const notes = normalizeText(data.notes);

  const log = {
    call_log_id: generateId('CALL'),
    lead_id: leadId,
    call_datetime: now,
    user_id: normalizeText(user.user_id),
    user_name: normalizeText(user.name),
    call_status: frontendStatus,
    previous_status: previousStatus,
    new_status: newStatus,
    callback_date: callbackDate,
    callback_time: callbackTime,
    notes,
    created_at: now
  };

  appendRow(CRM.SHEETS.CALL_LOGS, log);

  const updates = {
    current_status: newStatus,
    attempts: Number(lead.attempts || 0) + 1,
    last_connected_at: now,
    callback_date: callbackDate,
    callback_time: callbackTime,
    updated_at: now
  };
  if (notes) updates.notes = notes;

  updateRowById(CRM.SHEETS.LEADS, 'lead_id', leadId, updates);

  writeAudit({
    action: 'STATUS_CHANGED', leadId, field: 'current_status',
    oldValue: previousStatus, newValue: newStatus, source: 'CALL_LOG'
  });
  writeAudit({
    action: 'CALL_LOGGED', leadId, field: 'attempts',
    oldValue: Number(lead.attempts || 0), newValue: Number(lead.attempts || 0) + 1, source: 'CALL_LOG'
  });

  return {
    call_log_id: log.call_log_id,
    lead_id: leadId,
    call_time: serializeSheetValue_(now),
    executive: user.name,
    status: normalizeFrontendStatus_(newStatus),
    previous_status: normalizeFrontendStatus_(previousStatus),
    callback_date: callbackDate,
    callback_time: callbackTime,
    notes,
    created_at: serializeSheetValue_(now)
  };
}

function getCallbacks(filter) {
  const currentUser = requireCRMAccess();
  const leads = getAllRows(CRM.SHEETS.LEADS);
  const users = getAllRows(CRM.SHEETS.USERS);
  const userMap = {};
  users.forEach(u => { const id = normalizeText(u.user_id); if (id) userMap[id] = u; });

  const todayKey = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const requested = normalizeText(filter || 'all').toLowerCase();

  return leads
    .filter(lead => String(lead.archived).toUpperCase() !== 'TRUE')
    .filter(lead => {
      const access = normalizeText(currentUser.program_access).toUpperCase().split(',').map(normalizeText).filter(Boolean);
      return access.includes('ALL') || access.includes(normalizeText(lead.program).toUpperCase());
    })
    .map(lead => mapLeadForFrontend_(lead, userMap))
    .filter(lead => {
      if (!lead.callback_date) return false;
      const d = String(lead.callback_date).slice(0, 10);
      if (requested === 'today') return d === todayKey;
      if (requested === 'overdue') return d < todayKey;
      if (requested === 'upcoming') return d > todayKey;
      return true;
    });
}

function completeCallback(leadId) {
  const user = requireCRMAccess();
  const lead = getLeadByIdRaw_(leadId);
  if (!lead) throw new Error(`Lead not found in Leads sheet: ${normalizeText(leadId)}`);
  if (!userHasProgramAccess(lead.program)) throw new Error('You do not have access to this lead.');

  updateRowById(CRM.SHEETS.LEADS, 'lead_id', leadId, {
    callback_date: '',
    callback_time: '',
    updated_at: getCurrentTimestamp()
  });

  writeAudit({
    action: 'CALLBACK_UPDATED', leadId,
    field: 'callback_date',
    oldValue: serializeSheetValue_(lead.callback_date),
    newValue: 'Completed',
    source: 'CALLBACK'
  });

  return getLeadForFrontend(leadId);
}

function getReports(filters) {
  filters = filters || {};
  const user = requireCRMAccess();
  const access = normalizeText(user.program_access).toUpperCase().split(',').map(normalizeText).filter(Boolean);
  const all = access.includes('ALL');
  const requestedProgram = normalizeText(filters.program);
  if (requestedProgram && requestedProgram !== 'All Programs' && !all && !access.includes(requestedProgram.toUpperCase())) {
    throw new Error(`You do not have access to ${requestedProgram}.`);
  }

  const leads = getAllRows(CRM.SHEETS.LEADS).filter(l => String(l.archived).toUpperCase() !== 'TRUE')
    .filter(l => all || access.includes(normalizeText(l.program).toUpperCase()))
    .filter(l => !requestedProgram || requestedProgram === 'All Programs' || normalizeText(l.program).toUpperCase() === requestedProgram.toUpperCase())
    .filter(l => !normalizeText(filters.executive) || normalizeText(l.assigned_to) === normalizeText(filters.executive));

  const execPerf = {};
  leads.forEach(l => {
    const name = normalizeText(l.assigned_to) || 'Unassigned';
    if (!execPerf[name]) execPerf[name] = { name, assigned: 0, calls: 0, contacted: 0, onboarded: 0 };
    execPerf[name].assigned++;
    execPerf[name].calls += Number(l.attempts || 0);
    const s = normalizeText(l.current_status).toUpperCase();
    if (!['PENDING', 'NOT_INTERESTED', 'ISSUE'].includes(s)) execPerf[name].contacted++;
    if (s === 'ONBOARDED') execPerf[name].onboarded++;
  });

  const progPerf = {};
  leads.forEach(l => {
    const p = normalizeText(l.program) || 'Unknown';
    if (!progPerf[p]) progPerf[p] = { program: p, total: 0, contacted: 0, onboarded: 0, pending: 0 };
    progPerf[p].total++;
    const s = normalizeText(l.current_status).toUpperCase();
    if (s === 'ONBOARDED') progPerf[p].onboarded++;
    else if (s === 'PENDING') progPerf[p].pending++;
    else progPerf[p].contacted++;
  });

  const statusDistribution = {};
  leads.forEach(l => { const s = normalizeFrontendStatus_(l.current_status); statusDistribution[s] = (statusDistribution[s] || 0) + 1; });

  return {
    exec_performance: Object.values(execPerf),
    program_performance: Object.values(progPerf),
    status_distribution: statusDistribution
  };
}

function getAuditLogs(filters) {
  filters = filters || {};
  const currentUser = requireCRMAccess();
  const access = normalizeText(currentUser.program_access).toUpperCase().split(',').map(normalizeText).filter(Boolean);
  const all = access.includes('ALL');
  const leadMap = {};
  getAllRows(CRM.SHEETS.LEADS).forEach(l => { leadMap[normalizeText(l.lead_id)] = l; });

  return getAllRows(CRM.SHEETS.AUDIT_LOGS)
    .filter(log => {
      if (!normalizeText(log.lead_id)) return true;
      const lead = leadMap[normalizeText(log.lead_id)];
      return lead && (all || access.includes(normalizeText(lead.program).toUpperCase()));
    })
    .filter(log => !filters.user || normalizeText(log.user_name) === normalizeText(filters.user) || normalizeText(log.user_id) === normalizeText(filters.user))
    .filter(log => !filters.action || normalizeText(log.action) === normalizeText(filters.action))
    .filter(log => !filters.lead_id || normalizeText(log.lead_id) === normalizeText(filters.lead_id))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .map(log => ({
      audit_id: normalizeText(log.audit_id),
      timestamp: serializeSheetValue_(log.timestamp),
      user: normalizeText(log.user_name) || normalizeText(log.user_id),
      user_id: normalizeText(log.user_id),
      user_name: normalizeText(log.user_name),
      action: normalizeText(log.action),
      lead_id: normalizeText(log.lead_id),
      field: normalizeText(log.field),
      old_value: normalizeText(log.old_value),
      new_value: normalizeText(log.new_value),
      source: normalizeText(log.source)
    }));
}

function saveCRMUser(data) {
  const currentUser = requireRole(['ADMIN', 'Admin']);
  data = data || {};
  const name = normalizeText(data.name);
  const email = normalizeEmail(data.email);
  const role = normalizeText(data.role);
  const accessInput = normalizeText(data.program_access);
  if (!name || !email) throw new Error('Name and email are required.');
  if (!['ADMIN', 'EXECUTIVE'].includes(role.toUpperCase())) throw new Error('Invalid role.');

  const access = accessInput.toUpperCase() === 'BOTH' ? 'ANA,Elevate' : accessInput;
  const validAccess = ['ALL','ANA','ELEVATE','ANA,ELEVATE'].includes(access.toUpperCase());
  if (!validAccess) throw new Error('Invalid program access.');

  const users = getAllRows(CRM.SHEETS.USERS);
  const existing = users.find(u => normalizeText(u.user_id) === normalizeText(data.user_id) || normalizeEmail(u.email) === email);
  const now = getCurrentTimestamp();

  if (existing) {
    updateRowById(CRM.SHEETS.USERS, 'user_id', existing.user_id, {
      name, email, role: role.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'EXECUTIVE',
      program_access: access, is_active: data.is_active !== false, updated_at: now
    });
    return getCRMUsers().find(u => u.user_id === normalizeText(existing.user_id));
  }

  const record = {
    user_id: generateId('USER'), name, email,
    role: role.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'EXECUTIVE',
    program_access: access, is_active: data.is_active !== false,
    created_at: now, updated_at: now
  };
  appendRow(CRM.SHEETS.USERS, record);
  writeAudit({ action: 'USER_CREATED', source: 'USERS' });
  return { ...record, role: normalizeFrontendRole_(record.role), is_active: true, created_at: serializeSheetValue_(record.created_at) };
}

function normalizeBackendStatus_(status) {
  const value = normalizeText(status).toUpperCase();
  const map = {
    'PENDING': 'PENDING', 'CONTACTED': 'CONTACTED', 'RNR': 'RNR', 'BUSY': 'BUSY',
    'CONNECT LATER': 'CALLBACK', 'CALLBACK': 'CALLBACK',
    'RETAIL ISSUE': 'ISSUE', 'ISSUE': 'ISSUE',
    'NOT INTERESTED': 'NOT_INTERESTED', 'NOT_INTERESTED': 'NOT_INTERESTED',
    'ONBOARDED': 'ONBOARDED', 'NOT RESPONDING': 'NOT_RESPONDING', 'NOT_RESPONDING': 'NOT_RESPONDING'
  };
  return map[value] || value;
}

function updateLead(leadId, data) {
  const user = requireCRMAccess();
  const id = normalizeText(leadId);
  if (!id) throw new Error('Lead ID is required.');
  if (!data || typeof data !== 'object') throw new Error('Lead update data is required.');

  const lead = getLeadByIdRaw_(id);
  if (!lead) throw new Error(`Lead not found in Leads sheet: ${id}`);
  if (String(lead.archived).toUpperCase() === 'TRUE') throw new Error('Cannot update an archived lead.');
  if (!userHasProgramAccess(lead.program)) throw new Error('You do not have access to this lead.');

  const allowedFields = [
    'seller_name','email','phone','city','current_status','current_sub_status',
    'callback_date','callback_time','notes','assigned_to','assignment_date',
    'onboarding_date','onboarded_by'
  ];
  const updates = {};
  const changed = [];

  allowedFields.forEach(field => {
    if (!Object.prototype.hasOwnProperty.call(data, field)) return;
    let value = data[field];
    if (field === 'email') value = normalizeEmail(value);
    else if (['seller_name','phone','city','current_sub_status','assigned_to','onboarded_by'].includes(field)) value = normalizeText(value);
    else if (['callback_date','callback_time','notes'].includes(field)) value = normalizeText(value);
    else if (field === 'current_status') value = normalizeBackendStatus_(value);

    const oldValue = lead[field] === undefined || lead[field] === null ? '' : lead[field];
    if (String(oldValue) !== String(value)) {
      updates[field] = value;
      changed.push({ field, oldValue, newValue: value });
    }
  });

  if (!changed.length) return getLeadForFrontend(id);
  updates.updated_at = getCurrentTimestamp();
  updateRowById(CRM.SHEETS.LEADS, 'lead_id', id, updates);

  changed.forEach(change => writeAudit({
    action: change.field === 'current_status' ? 'STATUS_CHANGED' : 'LEAD_UPDATED',
    leadId: id,
    field: change.field,
    oldValue: change.oldValue,
    newValue: change.newValue,
    source: 'LEAD_DETAIL'
  }));

  return getLeadForFrontend(id);
}
