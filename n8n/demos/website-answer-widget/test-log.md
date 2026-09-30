# Website Answer Widget leads: test log

Workflow "Portfolio demo · Website Answer Widget leads", run with the n8n MCP `execute_workflow` tool (manual mode) on 2026-09-30. Nothing was pinned. The workflow stays inactive.

| # | Execution | Input (POST body) | Result |
|---|---|---|---|
| 1 | 23878 | `{name: "Demo Visitor", phone: "0000000002", question: "Do you do home visits on Sundays?", page: "/demo-clinic"}` | Validation passed; the sheet append failed with 403 because the demo sheet was not yet shared with the Sheets credential's Google account. Fixed by sharing the sheet. |
| 2 | 23879 | `{name: "<script>x</script>", phone: "12", question: "test"}` | Rejected: angle brackets stripped, phone too short, so `valid: false` and the 400 reply "Please add your name and a phone number." Nothing reached the sheet. |
| 3 | 23881 | same as 1 | Success: one row added to the Leads tab of the dummy-data sheet, reply `{ "ok": true }`. |

All names and numbers are dummy data.
