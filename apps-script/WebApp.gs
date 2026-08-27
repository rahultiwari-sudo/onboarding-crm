/**
 * ==========================================
 * ONBOARDING CRM - WEB APP ENTRY POINT
 * ==========================================
 *
 * Add this file to the existing Apps Script
 * project that contains Code.gs, Database.gs,
 * Config.gs and Validation.gs.
 */
function doGet() {
  return HtmlService
    .createHtmlOutputFromFile('Index')
    .setTitle('Onboarding CRM')
    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL
    );
}
