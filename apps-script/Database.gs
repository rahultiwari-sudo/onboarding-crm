/**
 * ==========================================
 * DATABASE HELPERS
 * ==========================================
 */


/**
 * Get all records from a sheet as objects.
 */
function getAllRows(sheetName) {

  const sheet =
    getSheet(sheetName);

  const lastRow =
    sheet.getLastRow();

  const lastColumn =
    sheet.getLastColumn();

  if (
    lastRow < 2 ||
    lastColumn === 0
  ) {
    return [];
  }

  const headers =
    getHeaders(sheet);

  const values =
    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        lastColumn
      )
      .getValues();

  return values.map(row => {

    const record = {};

    headers.forEach(
      (header, index) => {
        record[header] =
          row[index];
      }
    );

    return record;
  });
}


/**
 * Append a record according to
 * the sheet's header order.
 */
function appendRow(
  sheetName,
  record
) {

  const sheet =
    getSheet(sheetName);

  const headers =
    getHeaders(sheet);

  const row =
    headers.map(
      header => {

        return record[header] !==
          undefined
          ? record[header]
          : '';
      }
    );

  sheet.appendRow(row);
}


/**
 * Update a record using an ID field.
 */
function updateRowById(
  sheetName,
  idField,
  idValue,
  updates
) {

  const sheet =
    getSheet(sheetName);

  const headers =
    getHeaders(sheet);

  const map =
    headerMap(headers);

  if (
    map[idField] === undefined
  ) {
    throw new Error(
      `ID field "${idField}" not found.`
    );
  }

  const lastRow =
    sheet.getLastRow();

  if (lastRow < 2) {
    throw new Error(
      `No data found in ${sheetName}.`
    );
  }

  const idColumn =
    map[idField] + 1;

  const ids =
    sheet
      .getRange(
        2,
        idColumn,
        lastRow - 1,
        1
      )
      .getValues();

  for (
    let i = 0;
    i < ids.length;
    i++
  ) {

    if (
      normalizeText(ids[i][0]) ===
      normalizeText(idValue)
    ) {

      const rowNumber =
        i + 2;

      Object.keys(
        updates
      ).forEach(field => {

        if (
          map[field] === undefined
        ) {
          throw new Error(
            `Field "${field}" does not exist in ${sheetName}.`
          );
        }

        sheet
          .getRange(
            rowNumber,
            map[field] + 1
          )
          .setValue(
            updates[field]
          );
      });

      return true;
    }
  }

  throw new Error(
    `Record "${idValue}" not found in ${sheetName}.`
  );
}


/**
 * ==========================================
 * COSMOS QUEUE
 * ==========================================
 */


/**
 * Get active leads waiting for Cosmos enrichment.
 */
function getPendingCosmosLeads(
  limit = 50
) {

  const leads =
    getAllRows(
      CRM.SHEETS.LEADS
    );

  return leads
    .filter(lead => {

      const archived =
        String(
          lead.archived
        ).toUpperCase() ===
        'TRUE';

      const cosmosStatus =
        normalizeText(
          lead.cosmos_status
        ).toUpperCase();

      return (
        !archived &&
        cosmosStatus ===
        CRM.COSMOS_STATUS.PENDING
      );
    })
    .slice(
      0,
      limit
    );
}


/**
 * Get a lead by lead_id.
 */
function getLeadById(
  leadId
) {

  if (!leadId) {
    throw new Error(
      'leadId is required.'
    );
  }

  const leads =
    getAllRows(
      CRM.SHEETS.LEADS
    );

  const lead =
    leads.find(
      record =>
        String(
          record.lead_id
        ) ===
        String(
          leadId
        )
    );

  if (!lead) {
    throw new Error(
      `Lead not found: ${leadId}`
    );
  }

  return lead;
}


/**
 * Save Seller Number + Seller Email
 * after manual Cosmos lookup.
 */
function saveCosmosEnrichment(
  leadId,
  sellerNumber,
  sellerEmail
) {

  if (!leadId) {
    throw new Error(
      'leadId is required.'
    );
  }

  if (!sellerNumber) {
    throw new Error(
      'Seller Number is required.'
    );
  }

  if (!sellerEmail) {
    throw new Error(
      'Seller Email is required.'
    );
  }

  const lead =
    getLeadById(
      leadId
    );

  const normalizedSellerNumber =
    normalizeText(
      sellerNumber
    );

  const normalizedSellerEmail =
    normalizeEmail(
      sellerEmail
    );

  const now =
    getCurrentTimestamp();

  updateRowById(

    CRM.SHEETS.LEADS,

    'lead_id',

    leadId,

    {

      seller_number:
        normalizedSellerNumber,

      seller_email:
        normalizedSellerEmail,

      cosmos_status:
        CRM.COSMOS_STATUS.ENRICHED,

      cosmos_lookup_by:
        Session.getActiveUser()
          .getEmail(),

      cosmos_lookup_at:
        now,

      updated_at:
        now
    }
  );

  writeAudit({

    action:
      'COSMOS_ENRICHED',

    leadId:
      leadId,

    field:
      'cosmos_status',

    oldValue:
      lead.cosmos_status,

    newValue:
      CRM.COSMOS_STATUS.ENRICHED,

    source:
      'COSMOS_ENRICHMENT'
  });

  return getLeadById(
    leadId
  );
}


/**
 * ==========================================
 * USER / ACCESS CONTROL
 * ==========================================
 */


/**
 * Find a CRM user by email.
 */
function getUserByEmail(
  email
) {

  if (!email) {
    return null;
  }

  const normalizedEmail =
    normalizeEmail(
      email
    );

  const users =
    getAllRows(
      CRM.SHEETS.USERS
    );

  const user =
    users.find(
      record =>
        normalizeEmail(
          record.email
        ) ===
        normalizedEmail
    );

  return user || null;
}


/**
 * Get the currently authenticated
 * Google account and CRM user.
 */
function getCurrentUser() {

  const email =
    Session.getActiveUser()
      .getEmail();

  if (!email) {
    throw new Error(
      'Unable to identify the current Google account.'
    );
  }

  const user =
    getUserByEmail(
      email
    );

  if (!user) {
    throw new Error(
      `User ${email} is not registered in the CRM.`
    );
  }

  const active =
    String(
      user.is_active
    ).toUpperCase() ===
    'TRUE';

  if (!active) {
    throw new Error(
      `User ${email} is inactive.`
    );
  }

  return {

    user_id:
      normalizeText(
        user.user_id
      ),

    name:
      normalizeText(
        user.name
      ),

    email:
      normalizeEmail(
        user.email
      ),

    role:
      normalizeText(
        user.role
      ),

    program_access:
      normalizeText(
        user.program_access
      ),

    is_active:
      true
  };
}


/**
 * Check whether the current user
 * has access to a program.
 *
 * Supported values in program_access:
 *
 * ANA
 * Elevate
 * ANA,Elevate
 * ALL
 */
function userHasProgramAccess(
  program
) {

  const user =
    getCurrentUser();

  const requestedProgram =
    normalizeText(
      program
    ).toUpperCase();

  const access =
    user.program_access
      .split(',')
      .map(
        value =>
          normalizeText(
            value
          ).toUpperCase()
      )
      .filter(Boolean);

  return (
    access.includes('ALL') ||
    access.includes(
      requestedProgram
    )
  );
}


/**
 * Check whether current user
 * has one of the specified roles.
 */
function userHasRole(
  allowedRoles
) {

  const user =
    getCurrentUser();

  const roles =
    Array.isArray(
      allowedRoles
    )
      ? allowedRoles
      : [allowedRoles];

  return roles.some(
    role =>
      normalizeText(
        role
      ).toUpperCase() ===
      normalizeText(
        user.role
      ).toUpperCase()
  );
}


/**
 * Require authenticated CRM access.
 */
function requireCRMAccess() {

  return getCurrentUser();
}


/**
 * Require access to a particular program.
 */
function requireProgramAccess(
  program
) {

  const user =
    requireCRMAccess();

  if (
    !userHasProgramAccess(
      program
    )
  ) {
    throw new Error(
      `You do not have access to ${program}.`
    );
  }

  return user;
}
function testDashboardMetrics() {

  const result = getDashboardMetrics('All Programs');

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );
}

/**
 * Require one of the specified roles.
 */
function requireRole(
  allowedRoles
) {

  const user =
    requireCRMAccess();

  if (
    !userHasRole(
      allowedRoles
    )
  ) {
    throw new Error(
      'You do not have permission to perform this action.'
    );
  }

  return user;
}

/**
 * ==========================================
 * DASHBOARD METRICS
 * ==========================================
 */
function getDashboardMetrics(
  program = 'All Programs'
) {

  const dashboardUser = requireCRMAccess();
  const dashboardAccess = normalizeText(dashboardUser.program_access).toUpperCase().split(',').map(normalizeText).filter(Boolean);
  const dashboardHasAll = dashboardAccess.includes('ALL');

  const leads =
    getAllRows(
      CRM.SHEETS.LEADS
    );

  const callLogs =
    getAllRows(
      CRM.SHEETS.CALL_LOGS
    );

  const emailLogs =
    getAllRows(
      CRM.SHEETS.EMAIL_LOGS
    );

  const auditLogs =
    getAllRows(
      CRM.SHEETS.AUDIT_LOGS
    );


  // ----------------------------------------
  // FILTER LEADS
  // ----------------------------------------

  const filteredLeads =
    leads.filter(lead => {

      const archived =
        String(
          lead.archived
        ).toUpperCase() === 'TRUE';

      if (archived) {
        return false;
      }

      const leadProgram = normalizeText(lead.program).toUpperCase();
      if (!dashboardHasAll && !dashboardAccess.includes(leadProgram)) {
        return false;
      }

      if (
        program &&
        program !== 'All Programs'
      ) {
        return normalizeText(
          lead.program
        ).toUpperCase() ===
        normalizeText(
          program
        ).toUpperCase();
      }

      return true;
    });


  // ----------------------------------------
  // DATE HELPERS
  // ----------------------------------------

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const todayKey =
    formatDateKey(today);


  const startOfWeek =
    new Date(today);

  startOfWeek.setDate(
    today.getDate() - 6
  );


  // ----------------------------------------
  // STATUS COUNTS
  // ----------------------------------------

  const byStatus = {};

  filteredLeads.forEach(
    lead => {

      const status =
        normalizeText(
          lead.current_status
        ) || 'Unknown';

      byStatus[status] =
        (
          byStatus[status] || 0
        ) + 1;
    }
  );


  // ----------------------------------------
  // KPI COUNTS
  // ----------------------------------------

  const total =
    filteredLeads.length;


  const pending =
    filteredLeads.filter(
      lead =>
        normalizeText(
          lead.current_status
        ).toUpperCase() ===
        'PENDING'
    ).length;


  const contacted =
    filteredLeads.filter(
      lead => {

        const status =
          normalizeText(
            lead.current_status
          ).toUpperCase();

        return [
          'CONTACTED',
          'CONNECT LATER',
          'BUSY',
          'RNR'
        ].includes(status);
      }
    ).length;


  const onboarded =
    filteredLeads.filter(
      lead =>
        normalizeText(
          lead.current_status
        ).toUpperCase() ===
        'ONBOARDED'
    ).length;


  const callbacksToday =
    filteredLeads.filter(
      lead => {

        if (!lead.callback_date) {
          return false;
        }

        return (
          formatDateKey(
            new Date(
              lead.callback_date
            )
          ) ===
          todayKey
        );
      }
    ).length;


  const overdueCallbacks =
    filteredLeads.filter(
      lead => {

        if (!lead.callback_date) {
          return false;
        }

        const callbackDate =
          new Date(
            lead.callback_date
          );

        callbackDate.setHours(
          0,
          0,
          0,
          0
        );

        return (
          callbackDate < today &&
          ![
            'ONBOARDED',
            'NOT INTERESTED'
          ].includes(
            normalizeText(
              lead.current_status
            ).toUpperCase()
          )
        );
      }
    ).length;


  // ----------------------------------------
  // EXECUTIVE PERFORMANCE
  // ----------------------------------------

  const executiveMap = {};

  filteredLeads.forEach(
    lead => {

      const assignedTo =
        normalizeText(
          lead.assigned_to
        ) || 'Unassigned';

      if (
        !executiveMap[
          assignedTo
        ]
      ) {

        executiveMap[
          assignedTo
        ] = {

          name:
            assignedTo,

          assigned:
            0,

          contacted:
            0,

          onboarded:
            0
        };
      }

      executiveMap[
        assignedTo
      ].assigned++;


      const status =
        normalizeText(
          lead.current_status
        ).toUpperCase();


      if (
        [
          'CONTACTED',
          'CONNECT LATER',
          'BUSY',
          'RNR'
        ].includes(status)
      ) {

        executiveMap[
          assignedTo
        ].contacted++;
      }


      if (
        status === 'ONBOARDED'
      ) {

        executiveMap[
          assignedTo
        ].onboarded++;
      }
    }
  );


  // ----------------------------------------
  // DAILY ACTIVITY
  // ----------------------------------------

  const dailyMap = {};

  for (
    let i = 0;
    i < 7;
    i++
  ) {

    const date =
      new Date(
        startOfWeek
      );

    date.setDate(
      startOfWeek.getDate() + i
    );

    const key =
      formatDateKey(
        date
      );

    dailyMap[key] = {

      date:
        key,

      day:
        date.toLocaleDateString(
          'en-US',
          {
            weekday: 'short'
          }
        ),

      calls:
        0,

      emails:
        0,

      onboardings:
        0
    };
  }


  // Calls
  callLogs.forEach(
    log => {

      if (!log.call_datetime) {
        return;
      }

      const date =
        new Date(
          log.call_datetime
        );

      const key =
        formatDateKey(
          date
        );

      if (
        dailyMap[key]
      ) {
        dailyMap[key].calls++;
      }
    }
  );


  // Emails
  emailLogs.forEach(
    log => {

      if (!log.sent_at) {
        return;
      }

      const date =
        new Date(
          log.sent_at
        );

      const key =
        formatDateKey(
          date
        );

      if (
        dailyMap[key]
      ) {
        dailyMap[key].emails++;
      }
    }
  );


  // Onboardings
  filteredLeads.forEach(
    lead => {

      if (!lead.onboarding_date) {
        return;
      }

      const date =
        new Date(
          lead.onboarding_date
        );

      const key =
        formatDateKey(
          date
        );

      if (
        dailyMap[key]
      ) {
        dailyMap[key].onboardings++;
      }
    }
  );


  // ----------------------------------------
  // RECENT ACTIVITY
  // ----------------------------------------

  const recentActivity =
    auditLogs
      .filter(log => {

        if (
          !log.timestamp
        ) {
          return false;
        }

        return (
          new Date(
            log.timestamp
          ) >= startOfWeek
        );
      })
      .sort(
        (a, b) =>
          new Date(
            b.timestamp
          ) -
          new Date(
            a.timestamp
          )
      )
      .slice(
        0,
        20
      )
      .map(log => ({

        time:
          formatActivityTime(
            log.timestamp
          ),

        user:
          normalizeText(
            log.user_name
          ) || 'System',

        action:
          normalizeText(
            log.action
          ),

        lead:
          normalizeText(
            log.lead_id
          ) || '—',

        details:
          buildAuditDetails(
            log
          )
      }));


  // ----------------------------------------
  // RESULT
  // ----------------------------------------

  return {

    total,

    pending,

    contacted,

    onboarded,

    callbacks_today:
      callbacksToday,

    overdue_callbacks:
      overdueCallbacks,

    by_status:
      byStatus,

    by_exec:
      Object.values(
        executiveMap
      ),

    activity:
      recentActivity,

    daily_activity:
      Object.values(
        dailyMap
      )
  };
}


/**
 * Format date as YYYY-MM-DD.
 */
function formatDateKey(
  date
) {

  return Utilities.formatDate(
    new Date(date),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );
}


/**
 * Format activity timestamp.
 */
function formatActivityTime(
  timestamp
) {

  if (!timestamp) {
    return '';
  }

  return Utilities.formatDate(
    new Date(timestamp),
    Session.getScriptTimeZone(),
    'hh:mm a'
  );
}


/**
 * Build readable audit detail.
 */
function buildAuditDetails(
  log
) {

  const oldValue =
    normalizeText(
      log.old_value
    );

  const newValue =
    normalizeText(
      log.new_value
    );

  if (
    oldValue &&
    newValue
  ) {

    return (
      `${oldValue} → ${newValue}`
    );
  }

  if (newValue) {
    return newValue;
  }

  if (oldValue) {
    return oldValue;
  }

  return '';
}

/**
 * ==========================================
 * LEADS READ API
 * ==========================================
 * Add these functions to your existing Database.gs.
 * They are intentionally read-only for the first Leads integration.
 */

function getLeads(filters) {

  filters = filters || {};

  const user = requireCRMAccess();
  const accessPrograms = normalizeText(user.program_access).toUpperCase().split(',').map(normalizeText).filter(Boolean);
  const hasAllProgramAccess = accessPrograms.includes('ALL');

  const requestedProgram = normalizeText(filters.program);

  if (
    requestedProgram &&
    requestedProgram !== 'All Programs'
  ) {
    if (!hasAllProgramAccess && !accessPrograms.includes(requestedProgram.toUpperCase())) {
      throw new Error(
        `You do not have access to ${requestedProgram}.`
      );
    }
  }

  const leads = getAllRows(CRM.SHEETS.LEADS);
  const users = getAllRows(CRM.SHEETS.USERS);

  const userMap = {};

  users.forEach(record => {
    const id = normalizeText(record.user_id);
    if (id) {
      userMap[id] = record;
    }
  });

  const search = normalizeText(filters.search).toLowerCase();
  const status = normalizeText(filters.status);
  const executive = normalizeText(filters.executive);

  return leads
    .filter(lead => {

      if (
        String(lead.archived).toUpperCase() === 'TRUE'
      ) {
        return false;
      }

      const program = normalizeText(lead.program);

      // Respect the logged-in user's program access.
      if (
        !hasAllProgramAccess && !accessPrograms.includes(program.toUpperCase())
      ) {
        return false;
      }

      if (
        requestedProgram &&
        requestedProgram !== 'All Programs' &&
        program.toUpperCase() !== requestedProgram.toUpperCase()
      ) {
        return false;
      }

      const currentStatus =
        normalizeText(lead.current_status);

      if (
        status &&
        currentStatus.toUpperCase() !== status.toUpperCase()
      ) {
        return false;
      }

      const assignedTo =
        normalizeText(lead.assigned_to);

      if (
        executive &&
        assignedTo !== executive
      ) {
        return false;
      }

      if (search) {
        const searchable = [
          lead.lead_id,
          lead.mid,
          lead.seller_number,
          lead.seller_name,
          lead.email,
          lead.seller_email,
          lead.phone,
          lead.company_name,
          lead.account_name,
          lead.case_number,
          lead.request_id,
          lead.cosmos_id,
          lead.merchant_token,
          lead.entity_id
        ]
          .map(value => normalizeText(value).toLowerCase())
          .join(' ');

        if (!searchable.includes(search)) {
          return false;
        }
      }

      return true;
    })
    .map(lead => mapLeadForFrontend_(lead, userMap));
}


function getLeadForFrontend(leadId) {

  requireCRMAccess();

  const normalizedLeadId = normalizeText(leadId);

  if (!normalizedLeadId) {
    throw new Error('Lead ID is required.');
  }

  const lead = getLeadByIdRaw_(normalizedLeadId);

  if (!lead) {
    throw new Error(
      `Lead not found in Leads sheet: ${normalizedLeadId}`
    );
  }

  if (
    String(lead.archived).toUpperCase() === 'TRUE'
  ) {
    throw new Error(
      `Lead is archived: ${normalizedLeadId}`
    );
  }

  if (!userHasProgramAccess(lead.program)) {
    throw new Error(
      'You do not have access to this lead.'
    );
  }

  const users = getAllRows(CRM.SHEETS.USERS);
  const userMap = {};

  users.forEach(record => {
    const id = normalizeText(record.user_id);

    if (id) {
      userMap[id] = record;
    }
  });

  return mapLeadForFrontend_(
    lead,
    userMap
  );
}

function getLeadByIdRaw_(leadId) {
  const normalizedLeadId = normalizeText(leadId);

  if (!normalizedLeadId) {
    throw new Error('leadId is required.');
  }

  const leads = getAllRows(CRM.SHEETS.LEADS);

  return leads.find(lead =>
    normalizeText(lead.lead_id) === normalizedLeadId
  ) || null;
}


function getCRMUsers() {

  const currentUser = requireCRMAccess();

  const users = getAllRows(
    CRM.SHEETS.USERS
  );

  return users
    .filter(user => {
      const active =
        String(user.is_active).toUpperCase() === 'TRUE';

      if (!active) return false;

      // Only expose users the current user could reasonably assign/view.
      const access = normalizeText(
        user.program_access
      ).toUpperCase();

      return (
        currentUser.role.toUpperCase() === 'ADMIN' ||
        access === 'ALL' ||
        access === 'ANA' ||
        access === 'ELEVATE' ||
        access.includes('ANA') ||
        access.includes('ELEVATE')
      );
    })
    .map(user => ({
      user_id: normalizeText(user.user_id),
      name: normalizeText(user.name),
      email: normalizeEmail(user.email),
      role: normalizeFrontendRole_(user.role),
      program_access: normalizeText(user.program_access),
      is_active: true,
      created_at: serializeSheetValue_(user.created_at)
    }));
}


function mapLeadForFrontend_(lead, userMap) {
  const assigned =
    userMap[normalizeText(lead.assigned_to)] || {};

  return {
    // Core identity
    lead_id: normalizeText(lead.lead_id),
    program: normalizeText(lead.program),
    source_month: normalizeText(lead.source_month),
    source_file: normalizeText(lead.source_file),
    source_row: lead.source_row,

    // Amazon / source information
    case_number: normalizeText(lead.case_number),
    request_id: normalizeText(lead.request_id),
    company_name: normalizeText(lead.company_name),
    account_name: normalizeText(lead.account_name),
    entity_id: normalizeText(lead.entity_id),
    entity: normalizeText(lead.entity),
    merchant_token: normalizeText(lead.merchant_token),
    priority: normalizeText(lead.priority),
    amazon_am_email: normalizeEmail(lead.amazon_am_email),
    ds_am_phone: normalizeText(lead.ds_am_phone),
    amazon_onboarding_status: normalizeText(lead.amazon_onboarding_status),
    amazon_status: normalizeText(lead.amazon_status),
    amazon_status_notes: normalizeText(lead.amazon_status_notes),
    eligibility_criteria: normalizeText(lead.eligibility_criteria),
    wallet_recharge: numberOrValue_(lead.wallet_recharge),
    last_30_days_spend: numberOrValue_(lead.last_30_days_spend),
    subscription_start: serializeSheetValue_(lead.subscription_start),
    subscription_end: serializeSheetValue_(lead.subscription_end),

    // Cosmos / seller
    cosmos_id: normalizeText(lead.cosmos_id),
    cosmos_status: normalizeText(lead.cosmos_status),
    seller_number: normalizeText(lead.seller_number),
    seller_email: normalizeEmail(lead.seller_email),
    cosmos_lookup_by: normalizeText(lead.cosmos_lookup_by),
    cosmos_lookup_at: serializeSheetValue_(lead.cosmos_lookup_at),
    mid: normalizeText(lead.mid),
    seller_name: normalizeText(lead.seller_name || lead.account_name || lead.company_name),
    phone: normalizeText(lead.phone),
    email: normalizeEmail(lead.email || lead.seller_email),
    city: normalizeText(lead.city),
    lead_type: normalizeText(lead.lead_type),

    // CRM state
    am_reply_status: normalizeText(lead.am_reply_status),
    spn_status: normalizeText(lead.spn_status),
    free_credit: numberOrValue_(lead.free_credit),
    total: numberOrValue_(lead.total),
    whatsapp_link: normalizeText(lead.whatsapp_link),
    assigned_to: normalizeText(lead.assigned_to),
    assigned_to_name: normalizeText(assigned.name),
    assignment_date: serializeSheetValue_(lead.assignment_date),

    // Frontend compatibility aliases
    seller_status: normalizeFrontendStatus_(lead.current_status),
    current_status: normalizeText(lead.current_status),
    current_sub_status: normalizeText(lead.current_sub_status),
    ds_am_status: normalizeText(lead.amazon_onboarding_status),
    last_contacted_at: serializeSheetValue_(lead.last_connected_at),

    attempts: Number(lead.attempts || 0),
    last_connected_at: serializeSheetValue_(lead.last_connected_at),
    callback_date: serializeSheetValue_(lead.callback_date),
    callback_time: serializeSheetValue_(lead.callback_time),
    onboarded_by: normalizeText(lead.onboarded_by),
    onboarding_date: serializeSheetValue_(lead.onboarding_date),
    notes: normalizeText(lead.notes),

    created_at: serializeSheetValue_(lead.created_at),
    updated_at: serializeSheetValue_(lead.updated_at),

    archived: false
  };
}


function normalizeFrontendStatus_(status) {
  const value = normalizeText(status).toUpperCase();

  const map = {
    PENDING: 'Pending',
    CONTACTED: 'Contacted',
    RNR: 'RNR',
    BUSY: 'Busy',
    'CONNECT LATER': 'Connect Later',
    'RETAIL ISSUE': 'Retail Issue',
    'NOT INTERESTED': 'Not Interested',
    ONBOARDED: 'Onboarded'
  };

  return map[value] || normalizeText(status) || 'Pending';
}


function normalizeFrontendRole_(role) {
  const value = normalizeText(role).toUpperCase();

  if (value === 'ADMIN') return 'Admin';
  if (value === 'EXECUTIVE') return 'Executive';

  return normalizeText(role);
}


function serializeSheetValue_(value) {

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '';
  }

  if (Object.prototype.toString.call(value) === '[object Date]') {
    if (isNaN(value.getTime())) return '';

    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd HH:mm:ss'
    );
  }

  return String(value);
}


function numberOrValue_(value) {
  if (value === '' || value === null || value === undefined) {
    return '';
  }

  const n = Number(value);
  return isNaN(n) ? value : n;
}

function testLeadsFrontendMapping() {
  const leads = getLeads({});

  Logger.log(
    JSON.stringify(leads, null, 2)
  );
}

function testLeadsRead() {
  const result = getLeads({
    program: 'All Programs',
    status: '',
    executive: '',
    search: ''
  });

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );
}