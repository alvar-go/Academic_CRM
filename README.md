# Academic_CRM

Academic CRM starter implemented as a runnable local stack.

## Stack

- FastAPI backend
- SQLite database
- Static frontend served by FastAPI

## Local Setup

```powershell
.\scripts\bootstrap.ps1
.\scripts\run_dev.ps1
```

Then open `http://127.0.0.1:8000`.

## Repository Structure

- `backend/`: API, domain contracts and tests
- `frontend/`: HTML, CSS and modular JavaScript UI
- `database/`: schema and demo seed data
- `docs/`: architecture and stack notes
- `scripts/`: local setup helpers

## Included Features

- Health endpoint at `/api/health`
- Dashboard endpoint at `/api/dashboard`
- Applicant listing and creation at `/api/applicants`
- Seeded local data for an immediate demo
