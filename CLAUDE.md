# Claude Notes — Attendance Taker Project

This is a classroom attendance-taking web application being developed as a full-stack project.

## Project Overview

- **Goal:** Build a web app for teachers to manually track student attendance in a classroom setting
- **Frontend:** Vue.js + TypeScript (Vite)
- **Backend:** Python + FastAPI
- **Database:** PostgreSQL
- **Auth:** Session-based with role support (admin, teacher, student)

## Key Documents

- **[plan.md](./plan.md)** — High-level application flow, data model, key screens, file/module structure, API endpoints, and a six-phase build order

## Quick Links

- Backend entry point: `backend/app/main.py`
- Frontend entry point: `frontend/src/main.ts`
- Frontend component hierarchy starts in `frontend/src/App.vue`

## Frontend Styling

**Design System**: [`frontend/src/styles/DESIGN_SYSTEM.md`](./frontend/src/styles/DESIGN_SYSTEM.md)

This is the authoritative styling reference for all frontend visual elements. Reference this guide whenever creating or updating components, buttons, navbars, forms, or any UI element. Includes color palette, typography, spacing scale, responsive breakpoints, accessibility standards, and implementation guidelines.

## Authentication

Session-based auth using an HTTP-only cookie set by the backend. Note that by default when a user registers they are assigned teacher role.

**Flow:**

1. Frontend POSTs credentials to `POST /api/auth/login` via `src/api/auth.ts`
2. Backend verifies password hash, creates a server-side session, returns a `Set-Cookie` header
3. All subsequent requests include the cookie automatically (`withCredentials: true` in `src/api/client.ts`)
4. `GET /api/auth/me` is called on app load to restore session state into the Pinia auth store
5. `POST /api/auth/logout` destroys the server session; the frontend clears `user` in the store

**Key files:**

- `frontend/src/api/auth.ts` — `login()`, `logout()`, `getMe()` API calls
- `frontend/src/stores/auth.ts` — Pinia store: `user`, `isAuthenticated`, `login`, `logout`, `fetchCurrentUser`
- `frontend/src/api/client.ts` — Axios instance with `baseURL: /api` and `withCredentials: true`
- `backend/app/services/auth.py` — password hashing + session logic (Phase 2)
- `backend/app/routers/auth.py` — `/api/auth/*` endpoints (Phase 2)
- `backend/app/middleware/auth.py` — FastAPI dependency for protected routes (Phase 2)

**User roles:** `teacher` — stored as a string column on `users` and returned by `/api/auth/me`.

---

## Backend Database

**Stack:** PostgreSQL + SQLAlchemy (ORM) + Alembic (migrations)

**Configuration** (`backend/app/config.py`): reads `DATABASE_URL`, `SECRET_KEY`, and `DEBUG` from the environment via `pydantic-settings`. Settings are cached with `@lru_cache`.

**Engine & sessions** (`backend/app/database.py`):

- `get_engine()` — cached SQLAlchemy engine built from `settings.database_url`
- `get_session_local()` — cached `sessionmaker` bound to the engine
- `get_db()` — FastAPI dependency (`Depends(get_db)`); yields a session and closes it on exit

**ORM models** (`backend/app/models/`):

- `User` — `id`, `username`, `password_hash`, `role`, `created_at` (table: `users`)
- `Class`/`Enrollment`, `AttendanceSession`/`AttendanceRecord` — added in later phases

**Migrations** (`backend/alembic/versions`):

- Apply: `cd backend && alembic upgrade head`
- Generate new: `alembic revision --autogenerate -m "description"`

---

## Implementation Status

See [plan.md](./plan.md) for the suggested six-phase build order:

1. Foundation (scaffolding)
2. Auth (login/logout)
3. Class Management (CRUD)
4. Core Attendance (roster + submission)
5. History & Reports (queries + aggregation)
6. Polish (UI, CSV export, Docker, docs)
