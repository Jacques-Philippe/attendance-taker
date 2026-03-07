# Claude Notes — Attendance Taker Project

This is a classroom/school attendance-taking web application being developed as a full-stack project.

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

## Implementation Status

See [plan.md](./plan.md) for the suggested six-phase build order:
1. Foundation (scaffolding)
2. Auth (login/logout)
3. Class Management (CRUD)
4. Core Attendance (roster + submission)
5. History & Reports (queries + aggregation)
6. Polish (UI, CSV export, Docker, docs)

---

*Project initialized: 2026-03-07*
