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
