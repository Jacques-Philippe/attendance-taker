# Attendance Taker — Application Plan

## Overview

A web application for tracking classroom/school attendance. Teachers manually check in students for each class session. The system provides dashboards, reports, and historical views of attendance data.

**Frontend:** Vue.js + TypeScript
**Backend:** Python (FastAPI)
**Database:** PostgreSQL
**Auth:** Session-based (single role: teacher)

---

## 1. High-Level Flow

### 1.1 User Roles

- **Teacher** — manages classes and students, takes attendance for their classes; views per-class reports

### 1.2 Core Workflow

```
Login ─► Dashboard ─► Select Class ─► Take Attendance ─► Submit ─► View Reports
```

**Step-by-step:**

1. Teacher registers and logs in — no setup by anyone else required.
2. Dashboard shows today's classes and any sessions with pending attendance.
3. Teacher creates classes (name + period) and adds student names to each class roster.
4. Teacher selects a class, picks a date (pre-filled to today), and sees the roster.
5. Each student's row has a present/absent/late/excused toggle.
6. Teacher submits the attendance record. It is timestamped.
7. Reports are available at any time — filtered by class, date range, or student name.

### 1.3 Data Model (Conceptual)

```
User (teacher)
  └── Class
        ├── name, period
        └── students ──► Student (name only, not a user account)

AttendanceSession
  ├── class_id
  ├── date
  └── taken_by (teacher)

AttendanceRecord
  ├── session_id
  ├── student_id ──► Student
  └── status: present | absent | late | excused
```

### 1.4 Key Screens

| Screen             | Purpose                                             |
| ------------------ | --------------------------------------------------- |
| Login / Register   | Create an account or sign in                        |
| Dashboard          | Today's classes and pending attendance at a glance  |
| Class Management   | Create classes, add/rename/remove student names     |
| Take Attendance    | Mark each student present/absent/late/excused       |
| Attendance History | Browse and filter past sessions by class or date    |
| Student Record     | One student's attendance over time                  |
| Reports            | Aggregate stats per class or student                |

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
│   │   │   ├── user.py          # User
│   │   │   ├── class_.py        # Class, Student
│   │   │   └── attendance.py    # AttendanceSession, AttendanceRecord
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py          # Pydantic request/response models
│   │   │   ├── class_.py
│   │   │   └── attendance.py
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py          # POST /login, POST /logout, GET /me
│   │   │   ├── classes.py       # CRUD classes + student roster
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
| GET    | `/api/classes`                            | Teacher | List own classes                        |
| POST   | `/api/classes`                            | Teacher | Create class                            |
| PATCH  | `/api/classes/{id}`                       | Owner   | Update class name/period                |
| DELETE | `/api/classes/{id}`                       | Owner   | Delete class and its students           |
| GET    | `/api/classes/{id}`                       | Owner   | Class detail with student roster        |
| POST   | `/api/classes/{id}/students`              | Owner   | Add student by name                     |
| PATCH  | `/api/classes/{id}/students/{student_id}` | Owner   | Rename student                          |
| DELETE | `/api/classes/{id}/students/{student_id}` | Owner   | Remove student                          |
| POST   | `/api/attendance/sessions`                | Teacher | Create session + submit records         |
| GET    | `/api/attendance/sessions`                | Teacher | List sessions (filterable)              |
| GET    | `/api/attendance/sessions/{id}`           | Owner   | Session detail with all records         |
| GET    | `/api/attendance/reports`                 | Teacher | Aggregated stats (by class/student)     |
| GET    | `/api/attendance/student/{id}`            | Owner   | One student's attendance history        |

### 2.3 Build Order (Suggested Implementation Phases)

**Phase 1 — Foundation**

- Backend: project scaffold, database models, migrations, config
- Frontend: project scaffold, router, layout shell, login view

**Phase 2 — Auth**

- Backend: auth service, login/logout/me endpoints, auth middleware
- Frontend: auth store, login form, route guards

**Phase 3 — Class Management**

- Backend: class CRUD endpoints, student roster endpoints (add/rename/remove by name)
- Frontend: class management view, class selector component

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
