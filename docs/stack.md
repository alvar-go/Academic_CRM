# Runtime Stack

## Backend

- Python 3.11
- FastAPI
- SQLite

## Frontend

- Static HTML
- Modular JavaScript
- Custom CSS served by FastAPI
- Runtime design-token configuration
- Route-aware shell with module URLs
- No Bootstrap or Tailwind in the base layer

## Why This Stack

The current environment has Python available but does not expose Node.js, so the frontend is implemented without a JS build step. The visual foundation uses semantic CSS tokens and a configuration module so the brand layer can change before business modules are designed.
