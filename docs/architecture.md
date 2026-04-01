# Architecture Notes

## Goal

Build a modular Academic CRM that centralizes applicant tracking and advising operations in a single local-first repository.

## Current Runtime Design

- FastAPI exposes JSON endpoints under `/api`.
- SQLite stores local operational data and is bootstrapped from `database/migrations` and `database/seeds`.
- FastAPI serves the frontend directly, so the UI and API can run as one deployable unit.
- The frontend shell is route-aware, with dedicated module URLs such as `/configuration` and `/applicants`.

## Bounded Areas

- `applicants`: admissions pipeline, graph-based routing and review status
- `advising_tasks`: operational follow-up for active students
- `dashboard`: roll-up metrics for admissions and advising teams

## Design Principle

Keep infrastructure minimal while preserving separation between API, persistence, and UI so the project can later swap SQLite for PostgreSQL or a build-less frontend for React if Node becomes available.

## Current Applicants Modeling Direction

- The Applicants module now treats progression as a graph, not a fixed ordered list.
- Top-level stages define families, sub-stages refine local checkpoints, and transition rules carry direction plus condition text.
- The graph currently lives in the frontend configuration layer with local persistence so the workflow can be refined before the API and database contract are expanded.
- The graph registry now supports a global default flow plus program-specific flow versions, so a program can clone and specialize its own stage definitions before backend persistence is introduced.
