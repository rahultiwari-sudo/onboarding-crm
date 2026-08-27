function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(sheetName) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
  return sheet;
}

function generateId(prefix) {
  return `${prefix}-${new Date().getTime()}-${Math.floor(Math.random() * 100000)}`;
}

function getCurrentTimestamp() { return new Date(); }

function normalizeText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function normalizeEmail(value) { return normalizeText(value).toLowerCase(); }
function normalizeMID(value) { return normalizeText(value).toUpperCase(); }

function getHeaders(sheet) {
  const lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) return [];
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(normalizeText);
}

function headerMap(headers) {
  const map = {};
  headers.forEach((header, index) => { if (header) map[header] = index; });
  return map;
}

function getSourceMonth(value) {
  const fallback = () => Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM');
  if (!value) return fallback();
  const date = new Date(value);
  if (isNaN(date.getTime())) return fallback();
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM');
}
