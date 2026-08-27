const REQUIRED_HEADERS = {
  '01_Incoming_ANA': ['intake_id','received_at','source_file','source_row','company_name','case_number','account_name','entity_id','merchant_token','priority','amazon_am_email','ds_am_phone','onboarding_status','program','wallet_recharge','last_30_days_spend','cosmos_id','subscription_start','subscription_end','case_id','status_notes','eligibility_criteria','amazon_status','processing_status','lead_id','processed_at','processing_error'],
  '02_Incoming_Elevate': ['intake_id','received_at','source_file','source_row','company_name','entity','merchant_token','case_number','account_name','onboarding_status','last_30_days_spend','cosmos_id','subscription_start','subscription_end','status_notes','eligibility_criteria','amazon_status','processing_status','lead_id','processed_at','processing_error'],
  '03_Leads': ['lead_id','program','source_month','source_file','source_row','case_number','request_id','company_name','account_name','entity_id','entity','merchant_token','priority','amazon_am_email','ds_am_phone','amazon_onboarding_status','amazon_status','amazon_status_notes','eligibility_criteria','wallet_recharge','last_30_days_spend','subscription_start','subscription_end','cosmos_id','cosmos_status','seller_number','seller_email','cosmos_lookup_by','cosmos_lookup_at','mid','seller_name','phone','email','city','lead_type','am_reply_status','spn_status','free_credit','total','whatsapp_link','assigned_to','assignment_date','current_status','current_sub_status','attempts','last_connected_at','callback_date','callback_time','onboarded_by','onboarding_date','notes','created_at','updated_at','archived','archived_at','archived_by'],
  '04_CallLogs': ['call_log_id','lead_id','call_datetime','user_id','user_name','call_status','previous_status','new_status','callback_date','callback_time','notes','created_at'],
  '05_EmailLogs': ['email_log_id','lead_id','sent_at','sent_by','email_type','recipient','cc','subject','template_id','status','error_message'],
  '06_AuditLogs': ['audit_id','timestamp','user_id','user_name','action','lead_id','field','old_value','new_value','source'],
  '07_Users': ['user_id','name','email','role','program_access','is_active','created_at','updated_at'],
  '08_Programs': ['program_id','program_name','code','active','description','onboarding_link','created_at'],
  '09_EmailTemplates': ['template_id','program','template_type','subject','body_html','active','updated_by','updated_at'],
  '10_Settings': ['setting_key','setting_value','description','updated_by','updated_at'],
  '11_ImportHistory': ['import_id','processed_at','processed_by','program','source_file','total_rows','new_leads','duplicates','invalid','errors','status','error_details']
};

function validateSheetHeaders(sheetName) {
  const actualHeaders = getHeaders(getSheet(sheetName));
  const requiredHeaders = REQUIRED_HEADERS[sheetName] || [];
  const missing = requiredHeaders.filter(h => !actualHeaders.includes(h));
  const extra = actualHeaders.filter(h => h && !requiredHeaders.includes(h));
  return { sheet: sheetName, valid: missing.length === 0, missing, extra, actualCount: actualHeaders.length, requiredCount: requiredHeaders.length };
}

function validateCRMStructure() {
  return Object.values(CRM.SHEETS).map(validateSheetHeaders);
}

function validateANAIncomingRecord(record) {
  const errors = [];
  if (!normalizeText(record.company_name)) errors.push('Missing company_name');
  if (!normalizeText(record.case_number)) errors.push('Missing case_number');
  if (!normalizeText(record.account_name)) errors.push('Missing account_name');
  if (!normalizeText(record.merchant_token)) errors.push('Missing merchant_token');
  if (!normalizeText(record.program)) errors.push('Missing program');
  if (normalizeText(record.program).toUpperCase() !== 'ANA') errors.push('Program must be ANA');
  return { valid: errors.length === 0, errors };
}

function normalizeIdentifier(value) { return normalizeText(value).toUpperCase().replace(/\s+/g, ''); }

function findLeadMatches(incomingRecord, program) {
  const leads = getAllRows(CRM.SHEETS.LEADS);
  const incomingCase = normalizeIdentifier(incomingRecord.case_number);
  const incomingRequest = normalizeIdentifier(incomingRecord.request_id);
  const incomingCosmos = normalizeIdentifier(incomingRecord.cosmos_id);
  const incomingMerchant = normalizeIdentifier(incomingRecord.merchant_token);
  const incomingMID = normalizeMID(incomingRecord.mid);
  const matches = [];
  leads.forEach(lead => {
    if (normalizeText(lead.program).toUpperCase() !== normalizeText(program).toUpperCase()) return;
    const matchReasons = [];
    const leadCase = normalizeIdentifier(lead.case_number);
    const leadRequest = normalizeIdentifier(lead.request_id);
    const leadCosmos = normalizeIdentifier(lead.cosmos_id);
    const leadMerchant = normalizeIdentifier(lead.merchant_token);
    const leadMID = normalizeMID(lead.mid);
    if (incomingCase && leadCase && incomingCase === leadCase) matchReasons.push('CASE_NUMBER');
    if (incomingRequest && leadRequest && incomingRequest === leadRequest) matchReasons.push('REQUEST_ID');
    if (incomingCosmos && leadCosmos && incomingCosmos === leadCosmos) matchReasons.push('COSMOS_ID');
    if (incomingMerchant && leadMerchant && incomingMerchant === leadMerchant) matchReasons.push('MERCHANT_TOKEN');
    if (incomingMID && leadMID && incomingMID === leadMID) matchReasons.push('MID');
    if (matchReasons.length) matches.push({ leadId: lead.lead_id, sourceMonth: lead.source_month, sourceFile: lead.source_file, caseNumber: lead.case_number, requestId: lead.request_id, cosmosId: lead.cosmos_id, merchantToken: lead.merchant_token, mid: lead.mid, matchReasons });
  });
  return matches;
}

function classifyLeadMatch(incomingRecord, program) {
  const matches = findLeadMatches(incomingRecord, program);
  if (!matches.length) return { classification: 'NEW', matches: [] };
  const incomingCase = normalizeIdentifier(incomingRecord.case_number);
  const incomingRequest = normalizeIdentifier(incomingRecord.request_id);
  const incomingCosmos = normalizeIdentifier(incomingRecord.cosmos_id);
  for (const match of matches) {
    if ((incomingCase && normalizeIdentifier(match.caseNumber) === incomingCase) || (incomingRequest && normalizeIdentifier(match.requestId) === incomingRequest)) return { classification: 'EXACT_DUPLICATE', matches };
    if (incomingCosmos && normalizeIdentifier(match.cosmosId) === incomingCosmos) return { classification: 'HISTORICAL_MATCH', matches };
  }
  return { classification: 'NEEDS_REVIEW', matches };
}
