function writeAudit({
  action,
  leadId = '',
  field = '',
  oldValue = '',
  newValue = '',
  source = 'APPS_SCRIPT'
}) {
  const email = Session.getActiveUser().getEmail();
  const record = {
    audit_id: generateId('AUDIT'),
    timestamp: getCurrentTimestamp(),
    user_id: email,
    user_name: email,
    action,
    lead_id: leadId,
    field,
    old_value: oldValue,
    new_value: newValue,
    source
  };
  appendRow(CRM.SHEETS.AUDIT_LOGS, record);
  return record.audit_id;
}
