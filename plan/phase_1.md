## Phase 1 Deliverables — Foundation

### Backend Phase 1 Deliverables

**Project Setup & Config**

- [x] `backend/pyproject.toml` — Python project metadata, dependencies (FastAPI, SQLAlchemy, Pydantic, Alembic, pytest, black, flake8, mypy, isort)
- [x] `backend/requirements.txt` — Generated from pyproject.toml or pinned versions
- [ ] `backend/.env.example` — Template for environment variables (DB_URL, SECRET_KEY, DEBUG, etc.)
- [x] `backend/.gitignore` — Ignores venv/, **pycache**/, .env, \*.db, .pytest_cache/

**Database & ORM**

- [x] `backend/app/config.py` — Load settings from environment, database URL, secret key
- [x] `backend/app/database.py` — SQLAlchemy engine, SessionLocal, Base declarative class
- [x] `backend/alembic.ini` — Alembic configuration
- [x] `backend/alembic/env.py` — Auto-generate migrations on model changes
- [x] `backend/alembic/versions/001_initial.py` — Initial migration creating all tables

**Models**

- [x] `backend/app/models/__init__.py` — Export all models
- [x] `backend/app/models/user.py` — User (id, username, email, password_hash, role, created_at)
- [x] `backend/app/models/school.py` — School (id, name, created_at)
- [x] `backend/app/models/class_.py` — Class (id, school_id, name, period, teacher_id), Enrollment (class_id, student_id)
- [x] `backend/app/models/attendance.py` — AttendanceSession (id, class_id, date, period, taken_by, created_at), AttendanceRecord (id, session_id, student_id, status, created_at)

**Schemas (Request/Response Models)**

- [x] `backend/app/schemas/__init__.py` — Export all schemas
- [x] `backend/app/schemas/user.py` — UserCreate, UserResponse, UserUpdate
- [x] `backend/app/schemas/school.py` — SchoolCreate, SchoolResponse
- [x] `backend/app/schemas/class_.py` — ClassCreate, ClassResponse, EnrollmentCreate
- [x] `backend/app/schemas/attendance.py` — AttendanceSessionCreate, AttendanceRecordCreate, AttendanceSessionResponse

**API & App**

- [x] `backend/app/__init__.py` — Package marker
- [x] `backend/app/main.py` — FastAPI app initialization, CORS middleware (must set `allow_credentials=True` and list trusted origins explicitly — `allow_origins=["*"]` is incompatible with credentialed requests), health check endpoint (`GET /api/health`), router registrations
- [x] `backend/app/routers/__init__.py` — Export all routers
- [x] `backend/app/routers/health.py` — Simple health check endpoint (optional, can be in main.py)

**Testing**

- [x] `backend/tests/conftest.py` — pytest fixtures (test database, app client, test data)
- [x] `backend/tests/test_health.py` — Test health check endpoint

### Frontend Phase 1 Deliverables

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

- [x] `frontend/src/stores/auth.ts` — Auth store (user state, login action, logout action, isAuthenticated getter)

**API Layer**

- [x] `frontend/src/api/client.ts` — Axios instance with base URL, `withCredentials: true` (required so session cookies are sent on every cross-origin request), interceptors for auth
- [x] `frontend/src/api/auth.ts` — Auth API functions (login, logout, getMe)

**Type Definitions**

- [x] `frontend/src/types/user.ts` — User, LoginRequest, LoginResponse interfaces
- [ ] `frontend/src/types/common.ts` — ApiResponse, ApiError (if needed)

**Styling**

- [x] `frontend/src/style.css` — Global CSS variables (colors, fonts), resets, basic layout

**Testing**

- [x] `frontend/tests/unit/views/LoginView.spec.ts` — Basic snapshot or structure test
- [x] `frontend/vitest.config.ts` — Vitest configuration (optional, can be in vite.config.ts)

### Phase 1 Success Criteria

- Backend runs without errors: `python -m uvicorn app.main:app --reload`
- Frontend builds without errors: `npm run build`
- Health check endpoint responds: `GET http://localhost:8000/api/health` → `{"status": "ok"}`
- Login form displays on frontend: Navigate to http://localhost:5173 → see login page
- API client is wired up: frontend can import and use `api/auth.ts`; Axios instance has `withCredentials: true` so session cookies are included in requests
- Credentialed CORS is configured: backend CORS middleware sets `allow_credentials=True` with an explicit `allow_origins` allowlist (not `"*"`), so the browser accepts `Set-Cookie` headers from the API
- Database migrations work: Alembic can create fresh schema from migration files
- Tests run: `pytest` (backend) and `npm test` (frontend) pass
