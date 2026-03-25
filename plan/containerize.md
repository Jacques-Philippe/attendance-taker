# Containerising the Development Environment

## Goal

Replace the current "run three things manually" workflow with a single command that starts PostgreSQL, the FastAPI backend, and the Vite frontend — all with hot-reload — and tears everything down cleanly.

---

## Deliverables

- [x] `frontend/vite.config.ts` — env-driven proxy target + `host: true`
- [x] `backend/Dockerfile.dev` — Python dev image
- [x] `frontend/Dockerfile.dev` — Node dev image
- [x] `docker-compose.dev.yml` — dev Compose file wiring all three services
- [x] `backend/.dockerignore`
- [x] `frontend/.dockerignore`
- [x] `README.md` — add dev quick-start alongside the user quick-start

---

## Relationship to the existing user-facing Docker setup

The `README.md` already documents a consumer quick-start:

```bash
docker compose up --build   # serves the built app on :8080
```

That setup (and its `docker-compose.yml`) is for **end users** — it builds a production frontend bundle and serves it behind a reverse proxy. It must not be changed.

The dev setup described in this plan is a **completely separate** Compose file: `docker-compose.dev.yml`. The two files coexist and are used by different audiences:

| Audience | File | Command | Frontend |
|---|---|---|---|
| End user / QA | `docker-compose.yml` | `docker compose up --build` | Static build, :8080 |
| Developer | `docker-compose.dev.yml` | `docker compose -f docker-compose.dev.yml up --build` | Vite dev server + HMR, :5173 |

The README's Quick Start section is **unaffected** by this plan.

---

## What needs to be created / changed

| File | Action |
|---|---|
| `docker-compose.dev.yml` | Create — dev-only Compose file |
| `backend/Dockerfile.dev` | Create — Python dev image with uvicorn --reload |
| `frontend/Dockerfile.dev` | Create — Node dev image with Vite dev server |
| `backend/.dockerignore` | Create — exclude `__pycache__`, `.env`, venvs |
| `frontend/.dockerignore` | Create — exclude `node_modules`, `dist` |
| `frontend/vite.config.ts` | Edit — read proxy target from env var |
| `README.md` | Edit — add dev quick-start alongside the existing user quick-start |

---

## Architecture

```
Host browser
  └── :5173  →  frontend container (Vite dev server + HMR)
                   └── /api proxy  →  backend container :8000 (uvicorn --reload)
                                          └── db container :5432 (postgres:15-alpine)
```

All three containers share one Docker network created implicitly by Compose.

---

## Step-by-step implementation

### 1. `frontend/vite.config.ts` — env-driven proxy target

Vite runs inside a container; `localhost:8000` resolves to the frontend container itself, not the backend. The proxy target must point to the backend service name on the Docker network.

Change the hardcoded target to read from an env variable:

```ts
proxy: {
  "/api": {
    target: process.env.VITE_API_TARGET ?? "http://localhost:8000",
    changeOrigin: true,
  },
},
```

`docker-compose.dev.yml` will pass `VITE_API_TARGET=http://backend:8000`. Local development without Docker continues to work unchanged (env var absent → falls back to `localhost:8000`).

Also add `server: { host: true }` so Vite binds to `0.0.0.0` inside the container:

```ts
server: {
  host: true,   // binds 0.0.0.0 — required inside Docker
  proxy: { ... },
},
```

---

### 2. `backend/Dockerfile.dev`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Source is bind-mounted at runtime — no COPY needed for dev
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

Key points:
- `--reload` picks up changes via the bind mount
- `python:3.11-slim` matches the CI Python version
- Dependencies are baked into the image layer so they survive the bind-mount overlay

---

### 3. `frontend/Dockerfile.dev`

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json .
RUN npm install

# Source is bind-mounted at runtime
CMD ["npm", "run", "dev"]
```

Key points:
- `node_modules` is installed into the image layer at build time
- The Compose file mounts `./frontend` over `/app` **and** declares an anonymous volume at `/app/node_modules` so the host directory does not shadow the installed modules (see section 4)

---

### 4. `docker-compose.dev.yml`

```yaml
services:

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: attendance_user
      POSTGRES_PASSWORD: attendance_pass
      POSTGRES_DB: attendance_dev
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U attendance_user -d attendance_dev"]
      interval: 5s
      timeout: 5s
      retries: 10

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    volumes:
      - ./backend:/app
    environment:
      DATABASE_URL: postgresql://attendance_user:attendance_pass@db:5432/attendance_dev
      SECRET_KEY: dev-secret-key-change-in-prod
      DEBUG: "true"
      CORS_ORIGINS: '["http://localhost:5173"]'
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    command: >
      sh -c "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    volumes:
      - ./frontend:/app
      - /app/node_modules    # anonymous volume — prevents host dir shadowing container modules
    environment:
      VITE_API_TARGET: http://backend:8000
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  postgres_dev_data:
```

The named volume is `postgres_dev_data` (not `postgres_data`) so it doesn't collide with the user-facing Compose stack if both are ever run on the same machine.

---

### 5. Update `README.md`

The Quick Start section currently only documents the user-facing command. It should be updated to clearly separate the two audiences and surface the dev command.

Replace the existing Quick Start block with two named sections:

**Quick Start — for users (or QA)**

```bash
docker compose up --build
# App available at http://localhost:8080
```

**Quick Start — for developers**

```bash
docker compose -f docker-compose.dev.yml up --build
# Frontend (Vite + HMR) at http://localhost:5173
# Backend API directly at http://localhost:8000
```

A short note explaining the difference is worth adding — e.g. the dev stack uses bind mounts and the Vite dev server for hot-reload, while the user stack builds a production bundle.

---

### 6. `.dockerignore` files

**`backend/.dockerignore`**
```
__pycache__
*.pyc
.env
.venv
venv
.pytest_cache
```

**`frontend/.dockerignore`**
```
node_modules
dist
.vite
```

---

## Developer workflow

```bash
# First run (or after adding a dependency)
docker compose -f docker-compose.dev.yml up --build

# Subsequent runs
docker compose -f docker-compose.dev.yml up

# Tear down (keeps postgres_dev_data volume)
docker compose -f docker-compose.dev.yml down

# Tear down and wipe the dev database
docker compose -f docker-compose.dev.yml down -v

# Run backend tests inside the container
docker compose -f docker-compose.dev.yml exec backend pytest .

# Open a psql shell
docker compose -f docker-compose.dev.yml exec db psql -U attendance_user -d attendance_dev
```

The frontend is available at `http://localhost:5173`. The backend API is also directly accessible at `http://localhost:8000` for tools like curl or Insomnia.

Hot-reload works for both services: Uvicorn watches `/app` via the bind mount; Vite's HMR works over the mapped port.

---

## Things to keep in mind

- **`SECRET_KEY`** in `docker-compose.dev.yml` is a dev placeholder. Do not use it for anything beyond local dev.
- **Volume naming**: `postgres_dev_data` is intentionally distinct from the volume used by the user-facing `docker-compose.yml` to prevent the two stacks from sharing or accidentally wiping each other's data.
- **Adding npm dependencies**: rebuild the frontend image after `npm install` so the new module is baked into the image layer before the bind mount runs: `docker compose -f docker-compose.dev.yml build frontend`.
- **CI is unaffected**: GitHub Actions installs dependencies natively and spins up its own Postgres service container. The `Dockerfile.dev` files are never built in CI.
