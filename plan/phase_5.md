## Phase 5 Deliverables — History & Reports

### Design decisions

- `GET /api/attendance/sessions/{id}` returns a full `AttendanceSessionDetailResponse` (session + all records). Ownership is verified via the session's class (403 if teacher does not own the class).
- `GET /api/attendance/reports?class_id=X` is required — `class_id` is a required query param. It returns aggregate per-student stats (counts of present / absent / late / excused across all sessions for that class). This fits the UI pattern: pick a class → see its stats. A teacher can only report on their own classes (403 otherwise).
- `GET /api/attendance/student/{student_id}` returns a chronological list of the student's attendance records. The teacher must own the class the student belongs to (403 otherwise).
- All new response schemas follow the established `alias_generator=to_camel` + `populate_by_name=True` pattern.
- **AttendanceHistoryView** (`/history`): lists sessions (filterable by class + date range); clicking a session row navigates to `/history/:id` which shows session detail inline in the same view using a conditional panel.
- **ReportsView** (`/reports`): uses a `ClassSelector` to pick a class; displays per-student aggregate stats in a table with `StatCard` summary tiles (total sessions, class-wide present rate).
- **StudentRecordView** (`/students/:id`): navigated to from the ReportsView or HistoryView; shows one student's full attendance record as a table.
- `DateRangePicker` is a simple presentational component: two date inputs (`from` / `to`), emits `update:modelValue` with `{ from: string; to: string }`.
- `StatCard` is a simple presentational component: accepts `label` and `value` props; no events.
- The `fetchSession`, `fetchReports`, and `fetchStudentHistory` actions are added to the existing `useAttendanceStore` to avoid a proliferation of stores.

---

### Backend Phase 5 Deliverables

**New Schemas**

- [x] Add to `backend/app/schemas/attendance.py`:
  - `StudentAttendanceSummary`: `student_id: int`, `student_name: str`, `total: int`, `present: int`, `absent: int`, `late: int`, `excused: int` — uses `_camel_config`
  - `ClassReportResponse`: `class_id: int`, `class_name: str`, `period: str`, `total_sessions: int`, `students: list[StudentAttendanceSummary]` — uses `_camel_config`
  - `StudentSessionRecord`: `session_id: int`, `date: datetime.date`, `period: str`, `status: AttendanceStatus` — uses `_camel_config`
  - `StudentHistoryResponse`: `student_id: int`, `student_name: str`, `class_id: int`, `class_name: str`, `records: list[StudentSessionRecord]` — uses `_camel_config`

- [x] Export new schemas from `backend/app/schemas/__init__.py`

**New Endpoints in `backend/app/routers/attendance.py`**

- [ ] `GET /sessions/{session_id}` — `Depends(get_current_user)`:
  - Fetch `AttendanceSession` by id; 404 if not found
  - Verify owning class's `teacher_id == current_user.id` (403 otherwise)
  - Load associated `AttendanceRecord` rows; return `AttendanceSessionDetailResponse`

- [ ] `GET /reports` — `Depends(get_current_user)`:
  - `class_id: int` is a required query param (422 if absent)
  - Verify teacher owns the class (403 otherwise)
  - Query all `AttendanceSession` rows for the class; count `total_sessions`
  - For each student in the class, count their records per status across all sessions
  - Return `ClassReportResponse`

- [ ] `GET /student/{student_id}` — `Depends(get_current_user)`:
  - Fetch `Student` by id; 404 if not found
  - Verify teacher owns the student's class (403 otherwise)
  - Query all `AttendanceRecord` rows for the student joined to `AttendanceSession` for date + period; order by `session.date` descending
  - Return `StudentHistoryResponse`

**Testing**

- [ ] `backend/tests/test_reports.py` — uses the same Alembic upgrade/downgrade fixture; seeds two teachers, each with a class and two students; creates two attendance sessions for teacher A's class:
  - `GET /api/attendance/sessions/{id}` as owner → 200 with records
  - `GET /api/attendance/sessions/{id}` as non-owner → 403
  - `GET /api/attendance/sessions/{id}` with unknown id → 404
  - `GET /api/attendance/reports?class_id=X` as owner → 200; `total_sessions` equals session count; per-student counts are correct
  - `GET /api/attendance/reports?class_id=X` as non-owner → 403
  - `GET /api/attendance/reports` (no class_id) → 422
  - `GET /api/attendance/student/{id}` as owner → 200; records in descending date order
  - `GET /api/attendance/student/{id}` as non-owner → 403
  - `GET /api/attendance/student/{id}` with unknown id → 404

---

### Frontend Phase 5 Deliverables

**New Types**

- [ ] Add to `frontend/src/types/attendance.ts`:
  - `StudentAttendanceSummary { studentId: number; studentName: string; total: number; present: number; absent: number; late: number; excused: number; }`
  - `ClassReport { classId: number; className: string; period: string; totalSessions: number; students: StudentAttendanceSummary[]; }`
  - `StudentSessionRecord { sessionId: number; date: string; period: string; status: AttendanceStatus; }`
  - `StudentHistory { studentId: number; studentName: string; classId: number; className: string; records: StudentSessionRecord[]; }`

**API Layer**

- [ ] Add to `frontend/src/api/attendance.ts`:
  - `getSession(id: number): Promise<AttendanceSessionDetail>`
  - `getReports(classId: number): Promise<ClassReport>`
  - `getStudentHistory(studentId: number): Promise<StudentHistory>`

**Store**

- [ ] Add to `frontend/src/stores/attendance.ts`:
  - State: `currentSession: ref<AttendanceSessionDetail | null>`, `reports: ref<ClassReport | null>`, `studentHistory: ref<StudentHistory | null>`, `loading: ref<boolean>`
  - `fetchSession(id: number)` — sets `currentSession`; sets `error` on failure
  - `fetchReports(classId: number)` — sets `reports`; sets `error` on failure
  - `fetchStudentHistory(studentId: number)` — sets `studentHistory`; sets `error` on failure

**New Components**

- [ ] `frontend/src/components/StatCard.vue`:
  - Props: `label: string`, `value: string | number`
  - Renders a labelled value card (no events)

- [ ] `frontend/src/components/DateRangePicker.vue`:
  - Props: `modelValue: { from: string; to: string }`
  - Emits: `update:modelValue`
  - Renders two labeled date inputs side by side

**New Views**

- [ ] `frontend/src/views/AttendanceHistoryView.vue` — route `/history`:
  - Controls: `ClassSelector` (optional, default = show all) + `DateRangePicker` for filtering
  - On mount: calls `attendanceStore.fetchSessions()` with current filters
  - Renders a table of sessions (date, class name, period, # records); each row is clickable
  - Clicking a row sets `selectedSessionId` and calls `attendanceStore.fetchSession(id)` to load its records
  - Shows a detail panel below the table with the records for the selected session (student name, status badge)
  - "← Dashboard" `RouterLink` back link in header

- [ ] `frontend/src/views/ReportsView.vue` — route `/reports`:
  - Controls: `ClassSelector` (required — shows placeholder until class chosen) + optional `DateRangePicker` (passed as `from`/`to` query params to `fetchReports`)
  - On class selection: calls `attendanceStore.fetchReports(classId)`
  - Shows two `StatCard` tiles: "Total Sessions" and "Class Present Rate" (percent)
  - Shows a per-student table: name, total, present, absent, late, excused, present%
  - Each student name links to `/students/:id`
  - "← Dashboard" `RouterLink` back link in header

- [ ] `frontend/src/views/StudentRecordView.vue` — route `/students/:id`:
  - On mount: calls `attendanceStore.fetchStudentHistory(route.params.id)`
  - Shows student name + class name in a heading
  - Renders a table of attendance records: date, period, status badge; ordered by date descending
  - "← Reports" `RouterLink` back link in header

**Router**

- [ ] Add to `frontend/src/router/index.ts`:
  - `/history` → `AttendanceHistoryView` (lazy-loaded, protected)
  - `/reports` → `ReportsView` (lazy-loaded, protected)
  - `/students/:id` → `StudentRecordView` (lazy-loaded, protected)

**Navigation**

- [ ] `frontend/src/views/DashboardView.vue` — add `RouterLink` entries for "Attendance History" (`/history`) and "Reports" (`/reports`)

**Testing**

- [ ] `frontend/tests/unit/components/StatCard.spec.ts` — renders `label` and `value` props; no events

- [ ] `frontend/tests/unit/components/DateRangePicker.spec.ts`:
  - Renders two date inputs
  - Changing "from" input emits `update:modelValue` with updated `from`; `to` unchanged
  - Changing "to" input emits `update:modelValue` with updated `to`; `from` unchanged

- [ ] `frontend/tests/unit/views/AttendanceHistoryView.spec.ts` — mocks `useAttendanceStore` and `useClassesStore`:
  - Renders session list table
  - Clicking a session row calls `fetchSession` and shows detail panel
  - Error message displays when `attendanceStore.error` is set

- [ ] `frontend/tests/unit/views/ReportsView.spec.ts` — mocks `useAttendanceStore` and `useClassesStore`:
  - Renders placeholder before class is selected
  - After class selection, calls `fetchReports` and renders stat cards + student table
  - Student name links navigate to `/students/:id`

- [ ] `frontend/tests/unit/views/StudentRecordView.spec.ts` — mocks `useAttendanceStore`:
  - On mount, calls `fetchStudentHistory` with the route param id
  - Renders student name, class name, and one row per record

- [ ] Update `frontend/tests/utils.ts` — add `/history`, `/reports`, `/students/:id` routes to `makeRouter`

---

### Phase 5 Success Criteria

- `GET /api/attendance/sessions/{id}` returns session + records; non-owner gets 403
- `GET /api/attendance/reports?class_id=X` returns correct per-student counts; non-owner gets 403; missing `class_id` gets 422
- `GET /api/attendance/student/{id}` returns the student's history in descending date order; non-owner gets 403
- Teacher can navigate to `/history`, filter by class + date range, click a session to see its records
- Teacher can navigate to `/reports`, select a class, view aggregate stats and per-student breakdown, and click a student to see their individual record
- Backend tests pass: `pytest backend/tests/test_reports.py`
- Frontend tests pass: `npm test`
