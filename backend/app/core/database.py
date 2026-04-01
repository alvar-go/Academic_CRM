from __future__ import annotations

import sqlite3
from pathlib import Path

from fastapi import HTTPException, status

from backend.app.core.config import ROOT_DIR, get_settings
from backend.app.domain.models import Applicant, ApplicantCreate, AdvisingTask


MIGRATION_FILE = ROOT_DIR / "database" / "migrations" / "001_initial_schema.sql"
SEED_FILE = ROOT_DIR / "database" / "seeds" / "001_seed_demo.sql"


def _connect() -> sqlite3.Connection:
    settings = get_settings()
    settings.db_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(settings.db_path)
    connection.row_factory = sqlite3.Row
    return connection


def _execute_script(connection: sqlite3.Connection, script_path: Path) -> None:
    connection.executescript(script_path.read_text(encoding="utf-8"))


def ensure_database() -> None:
    with _connect() as connection:
        _execute_script(connection, MIGRATION_FILE)

        applicant_count = connection.execute("SELECT COUNT(*) AS total FROM applicants").fetchone()["total"]
        task_count = connection.execute("SELECT COUNT(*) AS total FROM advising_tasks").fetchone()["total"]

        if applicant_count == 0 and task_count == 0:
            _execute_script(connection, SEED_FILE)
        connection.commit()


def list_applicants() -> list[Applicant]:
    with _connect() as connection:
        rows = connection.execute(
            """
            SELECT id, full_name, email, program, status, stage, score, created_at
            FROM applicants
            ORDER BY created_at DESC, id DESC
            """
        ).fetchall()
    return [Applicant(**dict(row)) for row in rows]


def create_applicant(payload: ApplicantCreate) -> Applicant:
    with _connect() as connection:
        try:
            cursor = connection.execute(
                """
                INSERT INTO applicants (full_name, email, program, status, stage, score)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    payload.full_name,
                    payload.email,
                    payload.program,
                    payload.status,
                    payload.stage,
                    payload.score,
                ),
            )
        except sqlite3.IntegrityError as exc:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Applicant email already exists.",
            ) from exc
        row = connection.execute(
            """
            SELECT id, full_name, email, program, status, stage, score, created_at
            FROM applicants
            WHERE id = ?
            """,
            (cursor.lastrowid,),
        ).fetchone()
        connection.commit()

    return Applicant(**dict(row))


def list_tasks() -> list[AdvisingTask]:
    with _connect() as connection:
        rows = connection.execute(
            """
            SELECT id, student_name, program, owner, due_date, priority, status
            FROM advising_tasks
            ORDER BY due_date ASC, id ASC
            """
        ).fetchall()
    return [AdvisingTask(**dict(row)) for row in rows]
