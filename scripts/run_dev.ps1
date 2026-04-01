if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
    Write-Host "Virtual environment not found. Run scripts/bootstrap.ps1 first."
    exit 1
}

.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload
