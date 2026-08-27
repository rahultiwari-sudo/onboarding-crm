# Onboarding CRM - Clean QA Build

This package separates the local React/Vite source from the Google Apps Script production backend.

## Local source
- `src/` is the React application source.
- `src/services/api.js` uses `google.script.run` inside Apps Script and mock data for local Vite development.
- `scripts/build-apps-script.mjs` generates `apps-script/Index.html` from the Vite build.

## Apps Script production files
Copy the files listed in `APPS_SCRIPT_FILES.txt` into the same Apps Script project attached to the CRM spreadsheet.

`LeadsBackend.gs` is intentionally not used. Its read API is consolidated in `Database.gs`; write/supporting frontend endpoints are in `ServerApi.gs`.

## QA fixes included
- Lead Detail Save supports seller name, email, phone, city and notes.
- Lead ID comparisons are normalized during sheet updates.
- Leads program access is checked without rereading the Users sheet for every lead.
- Dashboard lead metrics respect program access.
- Production API routes exist for Leads, calls, callbacks, dashboard, reports, audit logs and CRM users.
- Import and Bulk Email are explicitly blocked in Apps Script until their backend workflows are implemented, instead of falsely reporting success.
- Dashboard activity chart reads backend `daily_activity` rather than hard-coded sample values.
- Lead Detail and Leads save/assignment/call paths surface backend errors.

## Build
Run:
`npm install`
`npm run build:apps-script`

The Apps Script HTML output is written to `apps-script/Index.html`.

## Deploy
1. Open the Apps Script project bound to the CRM spreadsheet.
2. Replace/add the `.gs` files from `apps-script/`.
3. Replace `Index.html` with the generated `apps-script/Index.html`.
4. Run `testCRMDatabase()` and confirm required headers exist.
5. Deploy as Web app.
6. Execute as the owner account.
7. Choose the appropriate access setting for your organization.
