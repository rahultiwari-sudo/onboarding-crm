# Onboarding CRM - Apps Script Backend

Copy these `.gs` files into the SAME Apps Script project that serves `Index.html`:

- Config.gs
- Utils.gs
- Validation.gs
- Audit.gs
- Database.gs
- ServerApi.gs
- Code.gs
- WebApp.gs

`LeadsBackend.gs` is intentionally NOT included because its functionality is now consolidated in `Database.gs` and `ServerApi.gs`.

## Deployment
1. Open the Apps Script project bound to the CRM spreadsheet.
2. Replace/add the files above.
3. Keep `Index.html` generated from the local project.
4. Run `testCRMDatabase()` once and fix any missing sheet headers before using the app.
5. Deploy as a Web app.
6. Execute as the owner account that has access to the spreadsheet.
7. Set the access level required by your Google Workspace/users.

## Production API
`Index.html` calls Apps Script through `google.script.run`.
The server API includes Leads, call logs, callbacks, dashboard metrics, reports, audit logs and CRM users.
Bulk email and import remain local/mock workflows until their exact business rules and provider requirements are implemented.
