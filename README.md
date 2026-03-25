# Attendance Taker

A web application for teachers to track classroom attendance. Create classes, build student rosters, take attendance each session, and view historical reports.

---

## Quick Start (Docker)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### For users

Runs a production build behind a reverse proxy. No source code or tooling required.

```bash
# 1. Clone the repo
git clone <repo-url>
cd attendance-taker

# 2. Create your environment file and fill in both values
cp .env.example .env
#    SECRET_KEY        — any long random string (e.g. openssl rand -hex 32)
#    POSTGRES_PASSWORD — any password you choose

# 3. Build and start all services
docker compose up --build

# 4. Open http://localhost:8080 in your browser and register your account on first use
```

```bash
docker compose down      # stop containers; your data is preserved
docker compose down -v   # stop containers AND wipe the database
```

### For developers (VS Code Dev Container)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) and the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-remote.remote-containers)

Open the repo in VS Code, then when prompted choose **Reopen in Container** (or run `Dev Containers: Reopen in Container` from the command palette). VS Code will build the container, install all dependencies, and run migrations automatically.

Once inside, start each service in a separate integrated terminal:

```bash
# Terminal 1 — backend
cd backend && uvicorn app.main:app --reload

# Terminal 2 — frontend
cd frontend && npm run dev
```

| Service | URL |
|---|---|
| Frontend (Vite + HMR) | http://localhost:5173 |
| Backend API | http://localhost:8000 |

Extensions (Pylance, Volar, ESLint, Prettier, Black) are installed automatically inside the container.

### For developers (standalone Docker Compose)

No VS Code integration — services run in the background and you edit files on your host machine. Hot-reload works via bind mounts.

```bash
docker compose -f docker-compose.dev.yml up --build
```

| Service | URL |
|---|---|
| Frontend (Vite + HMR) | http://localhost:5173 |
| Backend API | http://localhost:8000 |

```bash
docker compose -f docker-compose.dev.yml down      # stop; data preserved
docker compose -f docker-compose.dev.yml down -v   # stop and wipe dev database
```

---

## Development Setup (without Docker)

You'll need Python 3.10+, Node 20+, and a running PostgreSQL instance.

Please see `backend/README.md` for some quick tips on how the database works, or how to install a PostgreSQL instance with Docker.

### Pre-commit hooks

Pre-commit hooks run automatically on every `git commit` to enforce code quality. They run ESLint and Prettier on the frontend, Black and isort on the backend, and a few general checks (large files, merge conflicts, trailing whitespace, etc.).

```bash
# Install the pre-commit tool (once, into your system Python or a venv)
pip install pre-commit

# Register the hooks with Git (run once per clone)
pre-commit install
```

After that, hooks run automatically. To run them manually against all files:

```bash
pre-commit run --all-files
```

### Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL to your local postgres connection string,
# and fill in SECRET_KEY

# Apply migrations
alembic upgrade head

# Start the server (runs on http://localhost:8000)
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend

npm install

# Start the dev server (runs on http://localhost:5173)
npm run dev
```

### Running tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

---

## Stack

- **Frontend:** Vue 3 + TypeScript (Vite)
- **Backend:** Python + FastAPI
- **Database:** PostgreSQL (SQLAlchemy ORM, Alembic migrations)
- **Auth:** Session-based with HTTP-only cookie
