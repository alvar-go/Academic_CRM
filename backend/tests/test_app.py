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


def test_frontend_shell_loads() -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert 'data-route-link="/configuration"' in response.text
    assert "design-foundation" in response.text
    assert 'id="design-configurator"' in response.text
    assert 'id="applicant-search"' in response.text
    assert 'id="applicants-list"' in response.text
    assert 'id="applicant-pipeline"' in response.text


def test_module_routes_load() -> None:
    configuration_response = client.get("/configuration")
    applicants_response = client.get("/applicants")

    assert configuration_response.status_code == 200
    assert applicants_response.status_code == 200
    assert 'id="route-title"' in configuration_response.text
    assert 'id="route-title"' in applicants_response.text


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
