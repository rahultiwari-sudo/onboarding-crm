function testCRMDatabase() {
  const results = validateCRMStructure();

  Logger.log('====================================');
  Logger.log('ONBOARDING CRM DATABASE VALIDATION');
  Logger.log('====================================');

  let allValid = true;

  results.forEach(result => {

    const status = result.valid ? 'PASS' : 'FAIL';

    Logger.log(
      `${status} | ${result.sheet} | ` +
      `Required: ${result.requiredCount} | ` +
      `Found: ${result.actualCount}`
    );

    if (result.missing.length > 0) {
      Logger.log(
        `  Missing: ${result.missing.join(', ')}`
      );

      allValid = false;
    }

    if (result.extra.length > 0) {
      Logger.log(
        `  Extra: ${result.extra.join(', ')}`
      );
    }
  });

  Logger.log('====================================');
  Logger.log(
    allValid
      ? 'RESULT: PASS'
      : 'RESULT: FAILED'
  );
  Logger.log('====================================');

  return results;
}

function processIncomingANA() {
  const sheet = getSheet(CRM.SHEETS.INCOMING_ANA);
  const headers = getHeaders(sheet);
  const map = headerMap(headers);

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    Logger.log('No ANA intake records found.');
    return;
  }

  const values = sheet
    .getRange(2, 1, lastRow - 1, headers.length)
    .getValues();

  let processed = 0;
  let duplicates = 0;
  let invalid = 0;
  let errors = 0;

  values.forEach((row, index) => {
    const sheetRow = index + 2;

    try {
      const record = {};

      headers.forEach((header, columnIndex) => {
        record[header] = row[columnIndex];
      });

      const processingStatus = normalizeText(
        record.processing_status
      ).toUpperCase();

      // Only process NEW records.
      // Blank processing_status is also treated as NEW.
      if (
        processingStatus &&
        processingStatus !== 'NEW'
      ) {
        return;
      }

      // Basic validation
      const validation = validateANAIncomingRecord(record);

      if (!validation.valid) {
        sheet
          .getRange(sheetRow, map.processing_status + 1)
          .setValue('INVALID');

        sheet
          .getRange(sheetRow, map.processing_error + 1)
          .setValue(validation.errors.join('; '));

        invalid++;
        return;
      }

      // Generate CRM lead ID
      // ------------------------------------
// DUPLICATE / MATCH CHECK
// ------------------------------------

const matchResult = classifyLeadMatch(
  record,
  'ANA'
);

Logger.log(
  `Row ${sheetRow} classification: ${matchResult.classification}`
);

// Exact duplicate
if (
  matchResult.classification ===
  'EXACT_DUPLICATE'
) {

  sheet
    .getRange(
      sheetRow,
      map.processing_status + 1
    )
    .setValue('DUPLICATE');

  sheet
    .getRange(
      sheetRow,
      map.processing_error + 1
    )
    .setValue(
      'Existing lead found: ' +
      matchResult.matches
        .map(match => match.leadId)
        .join(', ')
    );

  matchResult.matches.forEach(match => {
    writeAudit({
      action: 'EXACT_DUPLICATE',
      leadId: match.leadId,
      source: 'ANA_INTAKE'
    });
  });

  duplicates++;
  return;
}


// Historical match
if (
  matchResult.classification ===
  'HISTORICAL_MATCH'
) {

  Logger.log(
    `Historical match found for row ${sheetRow}`
  );
}


// Needs review
if (
  matchResult.classification ===
  'NEEDS_REVIEW'
) {

  sheet
    .getRange(
      sheetRow,
      map.processing_status + 1
    )
    .setValue('INVALID');

  sheet
    .getRange(
      sheetRow,
      map.processing_error + 1
    )
    .setValue(
      'Potential existing lead. Manual review required.'
    );

  matchResult.matches.forEach(match => {
    writeAudit({
      action: 'LEAD_MATCH_NEEDS_REVIEW',
      leadId: match.leadId,
      source: 'ANA_INTAKE'
    });
  });

  invalid++;
  return;
}

function archiveTestLeads() {
  const sheet = getSheet(CRM.SHEETS.LEADS);
  const headers = getHeaders(sheet);
  const map = headerMap(headers);

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    Logger.log('No leads found.');
    return;
  }

  const values = sheet
    .getRange(2, 1, lastRow - 1, headers.length)
    .getValues();

  let archivedCount = 0;

  values.forEach((row, index) => {
    const sheetRow = index + 2;

    const companyName = normalizeText(
      row[map.company_name]
    );

    if (!companyName.startsWith('TEST ')) {
      return;
    }

    const leadId = normalizeText(
      row[map.lead_id]
    );

    if (!leadId) {
      return;
    }

    sheet
      .getRange(sheetRow, map.archived + 1)
      .setValue(true);

    sheet
      .getRange(sheetRow, map.archived_at + 1)
      .setValue(getCurrentTimestamp());

    sheet
      .getRange(sheetRow, map.archived_by + 1)
      .setValue(
        Session.getActiveUser().getEmail()
      );

    sheet
      .getRange(sheetRow, map.updated_at + 1)
      .setValue(getCurrentTimestamp());

    writeAudit({
      action: 'TEST_LEAD_ARCHIVED',
      leadId: leadId,
      source: 'TEST_CLEANUP'
    });

    archivedCount++;
  });

  Logger.log(
    `Archived test leads: ${archivedCount}`
  );
}

// ------------------------------------
// CREATE NEW LEAD
// ------------------------------------

const leadId = generateId('LEAD');

      // Create central CRM lead
      const lead = {
        lead_id: leadId,

        program: 'ANA',

        source_month: getSourceMonth(record.received_at),

        source_file: normalizeText(record.source_file),

        source_row: record.source_row,

        case_number: normalizeText(record.case_number),

        request_id: '',

        company_name: normalizeText(record.company_name),

        account_name: normalizeText(record.account_name),

        entity_id: normalizeText(record.entity_id),

        entity: '',

        merchant_token: normalizeText(record.merchant_token),

        priority: normalizeText(record.priority),

        amazon_am_email: normalizeEmail(record.amazon_am_email),

        ds_am_phone: normalizeText(record.ds_am_phone),

        amazon_onboarding_status:
          normalizeText(record.onboarding_status),

        amazon_status:
          normalizeText(record.amazon_status),

        amazon_status_notes:
          normalizeText(record.status_notes),

        eligibility_criteria:
          normalizeText(record.eligibility_criteria),

        wallet_recharge:
          record.wallet_recharge,

        last_30_days_spend:
          record.last_30_days_spend,

        subscription_start:
          record.subscription_start,

        subscription_end:
          record.subscription_end,

        cosmos_id:
          normalizeText(record.cosmos_id),

        cosmos_status:
          record.cosmos_id
            ? CRM.COSMOS_STATUS.PENDING
            : CRM.COSMOS_STATUS.INVALID_ID,

        seller_number: '',

        seller_email: '',

        cosmos_lookup_by: '',

        cosmos_lookup_at: '',

        mid: '',

        seller_name:
          normalizeText(record.account_name),

        phone: '',

        email: '',

        city: '',

        lead_type: '',

        am_reply_status: '',

        spn_status: '',

        free_credit: '',

        total: '',

        whatsapp_link: '',

        assigned_to: '',

        assignment_date: '',

        current_status: CRM.STATUS.PENDING,

        current_sub_status: '',

        attempts: 0,

        last_connected_at: '',

        callback_date: '',

        callback_time: '',

        onboarded_by: '',

        onboarding_date: '',

        notes: '',

        created_at: getCurrentTimestamp(),

        updated_at: getCurrentTimestamp(),

        archived: false,

        archived_at: '',

        archived_by: ''
      };

      appendRow(CRM.SHEETS.LEADS, lead);

if (
  matchResult.classification ===
  'HISTORICAL_MATCH'
) {

  matchResult.matches.forEach(match => {

    writeAudit({
      action: 'HISTORICAL_MATCH',
      leadId: leadId,
      field: 'matched_existing_lead',
      oldValue: '',
      newValue: match.leadId,
      source: 'ANA_INTAKE'
    });

  });
}
      // Update intake record
      sheet
        .getRange(sheetRow, map.intake_id + 1)
        .setValue(generateId('INTAKE'));

      sheet
        .getRange(sheetRow, map.received_at + 1)
        .setValue(
          record.received_at || getCurrentTimestamp()
        );

      sheet
        .getRange(sheetRow, map.processing_status + 1)
        .setValue('PROCESSED');

      sheet
        .getRange(sheetRow, map.lead_id + 1)
        .setValue(leadId);

      sheet
        .getRange(sheetRow, map.processed_at + 1)
        .setValue(getCurrentTimestamp());

      sheet
        .getRange(sheetRow, map.processing_error + 1)
        .setValue('');

      writeAudit({
        action: 'LEAD_CREATED',
        leadId: leadId,
        source: 'ANA_INTAKE'
      });

      processed++;

    } catch (error) {

      sheet
        .getRange(
          sheetRow,
          map.processing_status + 1
        )
        .setValue('ERROR');

      sheet
        .getRange(
          sheetRow,
          map.processing_error + 1
        )
        .setValue(error.message);

      errors++;

      Logger.log(
        `ANA row ${sheetRow} error: ${error.message}`
      );
    }
  });

  Logger.log('====================================');
  Logger.log('ANA PROCESSING COMPLETE');
  Logger.log('====================================');
  Logger.log(`Processed: ${processed}`);
  Logger.log(`Duplicates: ${duplicates}`);
  Logger.log(`Invalid: ${invalid}`);
  Logger.log(`Errors: ${errors}`);
  Logger.log('====================================');
}