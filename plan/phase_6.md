## Phase 6 Deliverables — Polish & Local Deployment

### Design decisions

- **Docker Compose is the local deployment story.** A teacher installs Docker Desktop, runs `docker compose up`, and opens `http://localhost:8080`. No Python, Node, or PostgreSQL installation required.
- **Frontend container: multi-stage build.** Stage 1 (node:20-slim) runs `npm ci && npm run build`. Stage 2 (nginx:alpine) copies the static output and serves it on port 80. Nginx also reverse-proxies `/api/` to the backend container — same-origin requests, so no CORS configuration is needed in production.
- **Backend container: python:3.12-slim with pip.** The existing `backend/requirements.txt` is used to install dependencies (no Poetry in the image). An entrypoint shell script runs `alembic upgrade head` before starting uvicorn, so migrations apply automatically on first boot and on upgrades.
- **Postgres container: postgres:15-alpine** with a named volume so attendance data survives `docker compose down`.
- **Health check on postgres.** The backend container uses `depends_on: db: condition: service_healthy` so it never starts before the database is accepting connections.
- **Secrets via a `.env` file.** `docker-compose.yml` references `${SECRET_KEY}` and `${POSTGRES_PASSWORD}` from a `.env` file that the teacher creates from `.env.example`. Neither secret is hard-coded in any tracked file.
- **`CORS_ORIGINS` in the backend config** should be set to `*` (or the compose-specific origin) only if needed. Because nginx proxies everything through port 80, the frontend and API are same-origin in Docker, so CORS is irrelevant for the Docker setup. The existing dev default (`http://localhost:5173`) is preserved for local development without Docker.
- **CSV export** is a backend-only feature: a new `GET /api/attendance/reports/export?class_id=X` endpoint streams a `text/csv` response. The frontend adds a "Download CSV" anchor/button to `ReportsView`.
- **No toast notification library.** Existing inline error/loading states in each view are sufficient.

---

### Deliverable 1 — Docker Compose

**`backend/Dockerfile`**

- [x] Multi-stage? No — single stage: `FROM python:3.12-slim`
- [x] `WORKDIR /app`
- [x] `COPY requirements.txt .` → `RUN pip install --no-cache-dir -r requirements.txt`
- [x] `COPY . .`
- [x] `COPY entrypoint.sh /entrypoint.sh` → `RUN chmod +x /entrypoint.sh`
- [x] `ENTRYPOINT ["/entrypoint.sh"]`

**`backend/entrypoint.sh`**

- [x] `#!/bin/sh` — runs `alembic upgrade head`, then `exec uvicorn app.main:app --host 0.0.0.0 --port 8000`

**`frontend/Dockerfile`**

- [x] Stage 1: `FROM node:20-slim AS build` — `WORKDIR /app`, `COPY package*.json .`, `RUN npm ci`, `COPY . .`, `RUN npm run build`
- [x] Stage 2: `FROM nginx:alpine` — `COPY --from=build /app/dist /usr/share/nginx/html`, `COPY nginx.conf /etc/nginx/conf.d/default.conf`
- [x] `EXPOSE 80`

**`frontend/nginx.conf`**

- [x] Serve static files from `/usr/share/nginx/html` with `try_files $uri $uri/ /index.html` (SPA fallback)
- [x] `location /api/ { proxy_pass http://backend:8000; proxy_set_header Host $host; }` — proxies API requests to the backend service

**`docker-compose.yml`** (repo root)

- [ ] Service `db`:
  - `image: postgres:15-alpine`
  - `environment`: `POSTGRES_DB: attendance`, `POSTGRES_USER: attendance`, `POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}`
  - `volumes`: named volume `pgdata` → `/var/lib/postgresql/data`
  - `healthcheck`: `pg_isready -U attendance`, interval 5s, retries 5
- [ ] Service `backend`:
  - `build: ./backend`
  - `environment`: `DATABASE_URL: postgresql://attendance:${POSTGRES_PASSWORD}@db:5432/attendance`, `SECRET_KEY: ${SECRET_KEY}`, `DEBUG: "false"`
  - `depends_on: db: condition: service_healthy`
  - No exposed ports (internal only; nginx proxies to it)
- [ ] Service `frontend`:
  - `build: ./frontend`
  - `ports: ["8080:80"]`
  - `depends_on: [backend]`
- [ ] `volumes: pgdata:`

**`.env.example`** (repo root)

- [ ] Add `SECRET_KEY=` (blank — teacher must fill in), `POSTGRES_PASSWORD=` (blank)
- [ ] Add comment: "Copy this file to .env and fill in both values before running docker compose up"

**`.gitignore`** (repo root)

- [ ] Ensure `.env` is listed (it should be already, but verify)

---

### Deliverable 2 — CSV Export

**Backend**

- [ ] Add `GET /api/attendance/reports/export` endpoint to `backend/app/routers/attendance.py`:
  - Query param: `class_id: int` (required — 422 if absent)
  - Auth: `Depends(get_current_user)`, ownership check (403 if not owner)
  - Returns a `StreamingResponse` with `media_type="text/csv"` and `Content-Disposition: attachment; filename="report_{class_name}.csv"`
  - CSV columns: `Student Name`, `Total`, `Present`, `Absent`, `Late`, `Excused`, `Present %`
  - One row per student; rows ordered by student name ascending
  - Note: declare this route **before** `GET /reports` in the router file to avoid path ambiguity

- [ ] Add test to `backend/tests/test_reports.py`:
  - `GET /api/attendance/reports/export?class_id=X` as owner → 200, `content-type: text/csv`, CSV body contains student names and correct counts
  - `GET /api/attendance/reports/export?class_id=X` as non-owner → 403

**Frontend**

- [ ] Add `exportReportsCsv(classId: number): string` (returns a URL) **or** a direct download helper to `frontend/src/api/attendance.ts`:
  - Use `client.get(..., { responseType: "blob" })`, create an object URL, trigger a download via a temporary `<a>` element
- [ ] Add "Download CSV" button to `frontend/src/views/ReportsView.vue` — visible only when a class is selected and `reports` is non-null; calls the download helper

---

### Deliverable 3 — README

- [ ] Update `README.md` (repo root) with:
  - **Quick start (Docker)** section — the only section most teachers need:
    1. Install Docker Desktop
    2. Clone or download the repo
    3. `cp .env.example .env`, fill in `SECRET_KEY` (any long random string) and `POSTGRES_PASSWORD`
    4. `docker compose up --build`
    5. Open `http://localhost:8080`, register your account
  - **Development setup** section (for developers) — how to run backend and frontend separately without Docker
  - **Stopping / data** — `docker compose down` to stop (data persists); `docker compose down -v` to wipe the database

---

### Phase 6 Success Criteria

- `docker compose up --build` from a clean checkout starts all three services without errors
- `http://localhost:8080` loads the app; a teacher can register, create a class, take attendance, view history, and view reports
- Attendance data persists after `docker compose down` + `docker compose up`
- `GET /api/attendance/reports/export?class_id=X` returns a valid CSV with correct per-student counts
- "Download CSV" button in ReportsView triggers a file download in the browser
- All existing backend and frontend tests still pass
