# DuplexOps MVP API

A lightweight Express + TypeScript API that demonstrates the core flows for a tenant management and automation platform:

- Tenant profiles and CRUD operations
- SMS-style message ingestion and replies (Twilio-ready webhook surface)
- Maintenance request queue with status transitions
- Rent and automation helpers (rent reminders, late notices with fees)
- Dashboard summary endpoint for daily visibility

## Getting started

```bash
npm install
npm run dev # starts on http://localhost:4000
```

The API seeds a sample tenant on first boot and persists data to `data/store.json`.

## Key endpoints

- `GET /` – API metadata and links
- `GET /api/tenants` – list tenants; supports `GET /api/tenants/:id`, `POST /api/tenants`, `PUT /api/tenants/:id`, and `POST /api/tenants/:id/archive`
- `POST /api/messages/webhook` – Twilio-friendly inbound SMS webhook (`from`, `body`); auto-creates maintenance tickets when issues are detected
- `POST /api/messages/reply` – capture outbound responses (wire your Twilio credentials where you dispatch)
- `GET /api/maintenance` – maintenance queue; `POST /api/maintenance` to create, `PATCH /api/maintenance/:id` to update status/notes
- `GET /api/automations` – active rules; `POST /api/automations/run` to simulate date-driven reminders/late notices
- `GET /api/dashboard/summary` – today’s tasks, pending requests, and rent status rollup

## Automations

Date-triggered rules use the `triggerValue` format `monthly-<day>` and the `/api/automations/run` endpoint. Example payload to run late notices on the 6th:

```bash
curl -X POST http://localhost:4000/api/automations/run \
  -H "Content-Type: application/json" \
  -d '{"dayOfMonth":6}'
```

Late-fee rules add $50 to the tenant balance and log an outgoing SMS entry.

## Data model

Data is defined in `src/types/models.ts` and stored in `data/store.json`:

- Tenant: contact, lease, rent, balance, notes, status
- Message: inbound/outbound SMS events
- MaintenanceRequest: status-driven queue with optional categories/notes
- AutomationRule: date-driven reminder/late-fee templates

## Extending toward production

- Replace the file-backed store with Postgres/Prisma
- Add authentication + multi-landlord support
- Wire Twilio credentials into the reply webhook and delivery receipts
- Frontend: Next.js dashboard that consumes these endpoints
- Background worker (cron) for daily automation runs
