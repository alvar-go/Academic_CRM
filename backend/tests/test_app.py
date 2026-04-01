from fastapi.testclient import TestClient
from uuid import uuid4

from backend.app.main import app
from backend.app.core.database import ensure_database


client = TestClient(app)


def test_healthcheck() -> None:
    ensure_database()
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_dashboard_returns_seeded_content() -> None:
    ensure_database()
    response = client.get("/api/dashboard")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload["stats"]) == 4
    assert len(payload["applicants"]) >= 3
    assert len(payload["tasks"]) >= 3


def test_create_applicant() -> None:
    ensure_database()
    unique_email = f"laura.rios.{uuid4().hex[:8]}@example.edu"
    response = client.post(
        "/api/applicants",
        json={
            "full_name": "Laura Rios",
            "email": unique_email,
            "program": "MBA",
            "status": "In Review",
            "stage": "Interview",
            "score": 91,
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["full_name"] == "Laura Rios"
    assert payload["program"] == "MBA"
