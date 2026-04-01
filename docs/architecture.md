# Architecture Notes

## Goal

Build a modular Academic CRM that centralizes applicant tracking and advising operations in a single local-first repository.

## Current Runtime Design

- FastAPI exposes JSON endpoints under `/api`.
- SQLite stores local operational data and is bootstrapped from `database/migrations` and `database/seeds`.
- FastAPI serves the frontend directly, so the UI and API can run as one deployable unit.

## Bounded Areas

- `applicants`: admissions pipeline and review status
- `advising_tasks`: operational follow-up for active students
- `dashboard`: roll-up metrics for admissions and advising teams

## Design Principle

Keep infrastructure minimal while preserving separation between API, persistence, and UI so the project can later swap SQLite for PostgreSQL or a build-less frontend for React if Node becomes available.
