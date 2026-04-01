# Runtime Stack

## Backend

- Python 3.11
- FastAPI
- SQLite

## Frontend

- Static HTML
- Modular JavaScript
- Custom CSS served by FastAPI
- Bootstrap Icons via CDN
- Runtime design-token configuration
- Runtime applicant-pipeline graph configuration
- Program-specific applicant-flow versions with active-version switching
- Route-aware shell with module URLs
- No Bootstrap or Tailwind in the base layer

## Why This Stack

The current environment has Python available but does not expose Node.js, so the frontend is implemented without a JS build step. The visual foundation uses semantic CSS tokens and a configuration module so the brand layer can change before business modules are designed.

The Applicants module follows the same approach for workflow design: its pipeline is modeled in runtime configuration first, with local persistence, before the API and database are hardened around the final graph contract.
