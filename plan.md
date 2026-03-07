# Attendance Taker — Application Plan

## Overview

A web application for tracking classroom/school attendance. Teachers manually check in students for each class session. The system provides dashboards, reports, and historical views of attendance data.

**Frontend:** Vue.js + TypeScript
**Backend:** Python (FastAPI)
**Database:** PostgreSQL
**Auth:** Session-based with role support (admin, teacher, student)

---

## 1. High-Level Flow

### 1.1 User Roles

- **Admin** — manages schools, classes, teachers, and students; views aggregate reports
- **Teacher** — takes attendance for their classes; views per-class reports
- **Student** — views their own attendance history

### 1.2 Core Workflow

```
Login ─► Dashboard ─► Select Class ─► Take Attendance ─► Submit ─► View Reports
```

**Step-by-step:**

1. User logs in (role is determined from their account).
2. Dashboard shows contextual information based on role:
   - Teacher sees today's classes and pending attendance.
   - Admin sees school-wide overview.
   - Student sees their own record.
3. Teacher selects a class session (date + period are pre-filled for today).
4. A roster is displayed with each student's name and a present/absent/late/excused toggle.
5. Teacher submits the attendance record. It is timestamped and locked.
6. Reports are available at any time — filtered by class, date range, or student.

### 1.3 Data Model (Conceptual)

```
School
  └── Class
        ├── teacher (User)
        └── enrollments ──► Student (User)

AttendanceSession
  ├── class_id
  ├── date
  ├── period
  └── taken_by (teacher)

AttendanceRecord
  ├── session_id
  ├── student_id
  └── status: present | absent | late | excused
```

### 1.4 Key Screens

| Screen             | Role(s)          | Purpose                                   |
| ------------------ | ---------------- | ----------------------------------------- |
| Login              | All              | Authenticate and route to dashboard       |
| Dashboard          | All              | Role-specific home view                   |
| Take Attendance    | Teacher          | Mark students present/absent/late/excused |
| Attendance History | Teacher, Admin   | View and filter past sessions             |
| Student Record     | Student, Teacher | View one student's attendance over time   |
| Class Management   | Admin            | CRUD for classes, enrollments             |
| User Management    | Admin            | CRUD for users and role assignment        |
| Reports            | Teacher, Admin   | Aggregate stats, trends, exportable data  |

---

## 2. Concrete Executables — File & Module Plan

### 2.1 Repository Structure

```
attendance-taker/
├── plan.md                      # This file
├── backend/
│   ├── pyproject.toml           # Python project config (dependencies, scripts)
│   ├── alembic.ini              # DB migration config
│   ├── alembic/
│   │   └── versions/            # Migration scripts
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Settings / env loading
│   │   ├── database.py          # SQLAlchemy engine & session
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py          # User, Role
│   │   │   ├── school.py        # School
│   │   │   ├── class_.py        # Class, Enrollment
│   │   │   └── attendance.py    # AttendanceSession, AttendanceRecord
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py          # Pydantic request/response models
│   │   │   ├── class_.py
│   │   │   └── attendance.py
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py          # POST /login, POST /logout, GET /me
│   │   │   ├── users.py         # CRUD users (admin)
│   │   │   ├── classes.py       # CRUD classes, enrollments
│   │   │   └── attendance.py    # POST session, GET history, GET reports
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py          # Password hashing, session management
│   │   │   ├── attendance.py    # Business logic for taking/querying attendance
│   │   │   └── reports.py       # Aggregation and export logic
│   │   └── middleware/
│   │       ├── __init__.py
│   │       └── auth.py          # Dependency injection for auth checks
│   └── tests/
│       ├── conftest.py
│       ├── test_auth.py
│       ├── test_attendance.py
│       └── test_reports.py
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── src/
│   │   ├── main.ts              # App bootstrap
│   │   ├── App.vue              # Root component
│   │   ├── router/
│   │   │   └── index.ts         # Vue Router config
│   │   ├── stores/
│   │   │   ├── auth.ts          # Pinia store — auth state
│   │   │   ├── attendance.ts    # Pinia store — attendance data
│   │   │   └── classes.ts       # Pinia store — class data
│   │   ├── api/
│   │   │   ├── client.ts        # Axios/fetch wrapper with auth
│   │   │   ├── auth.ts          # Auth API calls
│   │   │   ├── attendance.ts    # Attendance API calls
│   │   │   └── classes.ts       # Class API calls
│   │   ├── views/
│   │   │   ├── LoginView.vue
│   │   │   ├── DashboardView.vue
│   │   │   ├── TakeAttendanceView.vue
│   │   │   ├── AttendanceHistoryView.vue
│   │   │   ├── StudentRecordView.vue
│   │   │   ├── ClassManagementView.vue
│   │   │   ├── UserManagementView.vue
│   │   │   └── ReportsView.vue
│   │   ├── components/
│   │   │   ├── AttendanceRoster.vue    # Roster table with status toggles
│   │   │   ├── AttendanceStatusBadge.vue
│   │   │   ├── ClassSelector.vue
│   │   │   ├── DateRangePicker.vue
│   │   │   ├── NavBar.vue
│   │   │   └── StatCard.vue
│   │   └── types/
│   │       ├── user.ts
│   │       ├── class.ts
│   │       └── attendance.ts
│   └── tests/
│       └── ...
├── docker-compose.yml           # Postgres + backend + frontend for local dev
└── README.md
```

### 2.2 API Endpoints

| Method | Path                             | Auth      | Description                         |
| ------ | -------------------------------- | --------- | ----------------------------------- |
| POST   | `/api/auth/login`                | Public    | Log in, receive session cookie      |
| POST   | `/api/auth/logout`               | Logged in | Destroy session                     |
| GET    | `/api/auth/me`                   | Logged in | Current user + role                 |
| GET    | `/api/users`                     | Admin     | List users                          |
| POST   | `/api/users`                     | Admin     | Create user                         |
| PATCH  | `/api/users/{id}`                | Admin     | Update user                         |
| DELETE | `/api/users/{id}`                | Admin     | Deactivate user                     |
| GET    | `/api/classes`                   | Logged in | List classes (scoped by role)       |
| POST   | `/api/classes`                   | Admin     | Create class                        |
| PATCH  | `/api/classes/{id}`              | Admin     | Update class                        |
| POST   | `/api/classes/{id}/enroll`       | Admin     | Add students to class               |
| DELETE | `/api/classes/{id}/enroll/{uid}` | Admin     | Remove student from class           |
| POST   | `/api/attendance/sessions`       | Teacher   | Create session + submit records     |
| GET    | `/api/attendance/sessions`       | Teacher+  | List sessions (filterable)          |
| GET    | `/api/attendance/sessions/{id}`  | Teacher+  | Session detail with all records     |
| GET    | `/api/attendance/reports`        | Teacher+  | Aggregated stats (by class/student) |
| GET    | `/api/attendance/student/{id}`   | Student+  | One student's attendance history    |

### 2.3 Build Order (Suggested Implementation Phases)

**Phase 1 — Foundation**

- Backend: project scaffold, database models, migrations, config
- Frontend: project scaffold, router, layout shell, login view

**Phase 2 — Auth**

- Backend: auth service, login/logout/me endpoints, auth middleware
- Frontend: auth store, login form, route guards

**Phase 3 — Class Management**

- Backend: class CRUD endpoints, enrollment endpoints
- Frontend: class management view (admin), class selector component

**Phase 4 — Core Attendance**

- Backend: attendance session creation + record submission
- Frontend: take-attendance view with roster component

**Phase 5 — History & Reports**

- Backend: session listing, filtering, aggregation queries
- Frontend: history view, student record view, reports view

**Phase 6 — Polish**

- Error handling, loading states, toast notifications
- Responsive design pass
- Export to CSV
- Docker Compose for local dev
- README with setup instructions

---

## 3. Phase 1 Deliverables — Foundation

### 3.1 Backend Phase 1 Deliverables

**Project Setup & Config**

- [x] `backend/pyproject.toml` — Python project metadata, dependencies (FastAPI, SQLAlchemy, Pydantic, Alembic, pytest, black, flake8, mypy, isort)
- [x] `backend/requirements.txt` — Generated from pyproject.toml or pinned versions
- [ ] `backend/.env.example` — Template for environment variables (DB_URL, SECRET_KEY, DEBUG, etc.)
- [x] `backend/.gitignore` — Ignores venv/, **pycache**/, .env, \*.db, .pytest_cache/

**Database & ORM**

- [ ] `backend/app/config.py` — Load settings from environment, database URL, secret key
- [ ] `backend/app/database.py` — SQLAlchemy engine, SessionLocal, Base declarative class
- [x] `backend/alembic.ini` — Alembic configuration
- [x] `backend/alembic/env.py` — Auto-generate migrations on model changes
- [x] `backend/alembic/versions/001_initial.py` — Initial migration creating all tables

**Models**

- [x] `backend/app/models/__init__.py` — Export all models
- [x] `backend/app/models/user.py` — User (id, username, email, password_hash, role, created_at)
- [ ] `backend/app/models/school.py` — School (id, name, created_at)
- [ ] `backend/app/models/class_.py` — Class (id, school_id, name, period, teacher_id), Enrollment (class_id, student_id)
- [ ] `backend/app/models/attendance.py` — AttendanceSession (id, class_id, date, period, taken_by, created_at), AttendanceRecord (id, session_id, student_id, status, created_at)

**Schemas (Request/Response Models)**

- [ ] `backend/app/schemas/__init__.py` — Export all schemas
- [ ] `backend/app/schemas/user.py` — UserCreate, UserResponse, UserUpdate
- [ ] `backend/app/schemas/school.py` — SchoolCreate, SchoolResponse
- [ ] `backend/app/schemas/class_.py` — ClassCreate, ClassResponse, EnrollmentCreate
- [ ] `backend/app/schemas/attendance.py` — AttendanceSessionCreate, AttendanceRecordCreate, AttendanceSessionResponse

**API & App**

- [x] `backend/app/__init__.py` — Package marker
- [x] `backend/app/main.py` — FastAPI app initialization, CORS middleware, health check endpoint (`GET /api/health`), router registrations
- [x] `backend/app/routers/__init__.py` — Export all routers
- [x] `backend/app/routers/health.py` — Simple health check endpoint (optional, can be in main.py)

**Testing**

- [x] `backend/tests/conftest.py` — pytest fixtures (test database, app client, test data)
- [x] `backend/tests/test_health.py` — Test health check endpoint

### 3.2 Frontend Phase 1 Deliverables

**Project Setup**

- [x] `frontend/package.json` — Vue 3, TypeScript, Vite, Pinia, Vue Router, Axios, Prettier, ESLint
- [x] `frontend/tsconfig.json` — TypeScript configuration
- [x] `frontend/vite.config.ts` — Vite configuration with proxy to backend API
- [x] `frontend/.env.example` — Template (VITE_API_URL)
- [x] `frontend/.gitignore` — Ignores node_modules/, dist/, .env.local
- [x] `frontend/.eslintrc.cjs` — ESLint config with Vue 3 + TypeScript rules
- [x] `frontend/.prettierrc.json` — Prettier config
- [x] `frontend/index.html` — Root HTML (div#app)
- [x] frontend pre-commit hooks

**App Structure**

- [x] `frontend/src/main.ts` — Vue app bootstrap, mount to #app
- [x] `frontend/src/App.vue` — Root component with RouterView, basic layout shell
- [x] `frontend/src/router/index.ts` — Vue Router config with routes: /, /login, /dashboard, /404

**Views**

- [x] `frontend/src/views/LoginView.vue` — Login form skeleton (username, password fields, submit button)
- [x] `frontend/src/views/DashboardView.vue` — Empty dashboard placeholder (to be filled in Phase 2+)
- [x] `frontend/src/views/NotFoundView.vue` — 404 page

**State Management (Pinia)**

- [ ] `frontend/src/stores/auth.ts` — Auth store (user state, login action, logout action, isAuthenticated getter)

**API Layer**

- [ ] `frontend/src/api/client.ts` — Axios instance with base URL, interceptors for auth
- [ ] `frontend/src/api/auth.ts` — Auth API functions (login, logout, getMe)

**Type Definitions**

- [ ] `frontend/src/types/user.ts` — User, LoginRequest, LoginResponse interfaces
- [ ] `frontend/src/types/common.ts` — ApiResponse, ApiError (if needed)

**Styling**

- [x] `frontend/src/style.css` — Global CSS variables (colors, fonts), resets, basic layout

**Testing**

- [ ] `frontend/tests/unit/views/LoginView.spec.ts` — Basic snapshot or structure test
- [x] `frontend/vitest.config.ts` — Vitest configuration (optional, can be in vite.config.ts)

### 3.3 Phase 1 Success Criteria

- Backend runs without errors: `python -m uvicorn app.main:app --reload`
- Frontend builds without errors: `npm run build`
- Health check endpoint responds: `GET http://localhost:8000/api/health` → `{"status": "ok"}`
- Login form displays on frontend: Navigate to http://localhost:5173 → see login page
- API client is wired up: frontend can import and use `api/auth.ts`
- Database migrations work: Alembic can create fresh schema from migration files
- Tests run: `pytest` (backend) and `npm test` (frontend) pass

---

## 4. CI/CD & Development Workflow

### 3.1 Pre-commit Hooks

Local checks run before each commit to catch issues early.

**Configuration:** `.pre-commit-config.yaml` at repository root

**Backend hooks:**

- `black` — Python code formatter
- `isort` — Python import sorter
- `flake8` — Python linter (style/errors)
- `mypy` — Python static type checker
- `pytest` — Unit tests (fail commit if tests fail)

**Frontend hooks:**

- `prettier` — TypeScript/Vue formatter
- `eslint` — JavaScript/TypeScript linter
- `vue/recommended` — Vue 3 linting rules

**Installation (local dev machine):**

```bash
pip install pre-commit
cd attendance-taker
pre-commit install
```

On next commit, hooks run automatically. Developers can bypass with `git commit --no-verify` if needed (not recommended).

### 3.2 GitHub Actions CI/CD Pipeline

Automated workflows run on push and pull requests.

**Workflow files:** `.github/workflows/`

**Backend CI workflow** (`.github/workflows/backend-ci.yml`)

- Trigger: push to main + PRs
- Steps:
  1. Checkout code
  2. Set up Python 3.10+
  3. Install dependencies (`pip install -r backend/requirements.txt`)
  4. Run pre-commit hooks (black, isort, flake8, mypy)
  5. Run pytest with coverage report
  6. Upload coverage to Codecov (optional)
  7. Fail workflow if any step fails

**Frontend CI workflow** (`.github/workflows/frontend-ci.yml`)

- Trigger: push to main + PRs
- Steps:
  1. Checkout code
  2. Set up Node.js 18+
  3. Install dependencies (`npm install` in frontend/)
  4. Run ESLint + Prettier checks
  5. Run unit tests (Vitest)
  6. Build for production (`npm run build`)
  7. Fail workflow if any step fails

**Deployment workflow** (`.github/workflows/deploy.yml`) — optional, for later phases

- Trigger: push to main only
- Steps:
  1. Build backend Docker image
  2. Build frontend Docker image
  3. Push to Docker Hub or container registry
  4. Deploy to hosting platform (e.g., Heroku, Railway, AWS)

### 3.3 Repository Setup

**Required files & folders:**

```
attendance-taker/
├── .pre-commit-config.yaml      # Pre-commit hook config
├── .github/
│   └── workflows/
│       ├── backend-ci.yml       # Backend test + lint
│       ├── frontend-ci.yml      # Frontend test + lint
│       └── deploy.yml           # (Optional) Deployment workflow
├── backend/
│   ├── requirements.txt         # Python dependencies + dev tools
│   └── pyproject.toml           # Alternative: Poetry config
├── frontend/
│   ├── package.json             # NPM dependencies
│   └── .eslintrc.cjs            # ESLint config
└── .gitignore                   # Ignore node_modules, venv, __pycache__, .env, etc.
```

### 3.4 Local Development Setup

# First-time setup:

```bash
# Clone repository
git clone <repo-url>
cd attendance-taker

# Create and activate a project virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install pre-commit into the project virtualenv and install git hooks
pip install pre-commit
pre-commit install

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

**Running locally:**

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

**Running checks manually:**

```bash
# Backend
cd backend
black .
isort .
flake8 .
mypy .
pytest

# Frontend
cd frontend
npm run lint
npm run format
npm test
npm run build
```
