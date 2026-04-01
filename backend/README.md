# Backend

FastAPI application for the Academic CRM.

## Run

```powershell
python -m pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload
```

## Main Areas

- `app/api/`: routes and transport layer
- `app/core/`: configuration and database bootstrap
- `app/domain/`: pydantic models
- `tests/`: API smoke tests
