## Phase 4 Deliverables — Core Attendance

### Design decisions

- A single `POST /api/attendance/sessions` request creates the `AttendanceSession` and all `AttendanceRecord` rows atomically in one transaction. There is no multi-step "open session, then submit records" flow.
- `AttendanceSession.period` is copied from `Class.period` at submission time (denormalised). This preserves the period label even if the class is later edited.
- Status defaults to `"absent"` for every student in the roster draft before the teacher makes any selection. The teacher marks who is present/late/excused.
- A unique constraint on `(class_id, date)` prevents duplicate sessions for the same class on the same day. A second submission for the same class + date returns `409 Conflict`.
- Ownership is enforced the same way as in classes: the teacher must own the class they are submitting attendance for.
- The attendance date is sent from the frontend as an ISO-8601 date string (`YYYY-MM-DD`) and stored as a PostgreSQL `DATE` column (not `TIMESTAMP`). The existing `DateTime` column in the ORM model will be replaced in the migration.
- All response schemas use `alias_generator=to_camel` + `populate_by_name=True` so camelCase JSON is returned to the frontend, matching the pattern established in Phase 3.

---

### Backend Phase 4 Deliverables

**Migration**

- [x] `backend/alembic/versions/005_attendance.py` — creates `attendance_sessions` and `attendance_records` tables:
  - `attendance_sessions`: `id` (PK), `class_id` (FK→classes NOT NULL), `date` (Date NOT NULL), `period` (String NOT NULL), `taken_by` (FK→users NOT NULL), `created_at` (DateTime server_default)
  - Unique constraint on `(class_id, date)`
  - `attendance_records`: `id` (PK), `session_id` (FK→attendance_sessions NOT NULL), `student_id` (FK→students NOT NULL), `status` (Enum: present/absent/late/excused NOT NULL), `created_at` (DateTime server_default)
  - Use `op.batch_alter_table` for SQLite test-database compatibility

**ORM Models — update**

- [x] `backend/app/models/attendance.py` — change `date` column from `DateTime(timezone=True)` to `Date`; add `UniqueConstraint("class_id", "date")` to `AttendanceSession`
- [x] `backend/app/models/__init__.py` — export `AttendanceSession`, `AttendanceRecord`, `AttendanceStatus`

**Schemas**

- [x] `backend/app/schemas/attendance.py`:
  - `AttendanceRecordRequest`: `student_id: int`, `status: AttendanceStatus`
  - `AttendanceSessionCreate`: `class_id: int`, `date: datetime.date`, `records: list[AttendanceRecordRequest]` — `records` must be non-empty
  - `AttendanceRecordResponse`: `id`, `student_id`, `status` — `model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)`
  - `AttendanceSessionResponse`: `id`, `class_id`, `date`, `period`, `taken_by`, `created_at` — same `model_config`
  - `AttendanceSessionDetailResponse` extends `AttendanceSessionResponse`: adds `records: list[AttendanceRecordResponse]`

- [x] `backend/app/schemas/__init__.py` — export all new attendance schemas

**Attendance Router**

- [x] `backend/app/routers/attendance.py` — `APIRouter(prefix="/api/attendance", tags=["attendance"])`
  - `POST /sessions` — `Depends(get_current_user)`:
    - Verify class exists and `teacher_id == current_user.id` (403 otherwise)
    - Check no session already exists for `(class_id, date)` — return 409 if duplicate
    - Verify all `student_id` values in `records` belong to the class — return 422 if any are foreign
    - Create `AttendanceSession` + all `AttendanceRecord` rows in one db transaction
    - Return `AttendanceSessionDetailResponse` with status 201
  - `GET /sessions` — `Depends(get_current_user)`:
    - Returns `list[AttendanceSessionResponse]` for sessions whose class is owned by the current teacher
    - Accepts optional query params: `class_id: int | None`, `date: datetime.date | None`

- [x] Register router in `backend/app/main.py` and export from `backend/app/routers/__init__.py`

**Testing**

- [x] `backend/tests/test_attendance.py` — uses same Alembic upgrade/downgrade fixture as `test_classes.py`; seeds two teachers, each with a class and students:
  - `POST /api/attendance/sessions` as owner with all students → 201, session + records in response
  - `POST /api/attendance/sessions` as non-owner → 403
  - `POST /api/attendance/sessions` with unknown class → 404
  - `POST /api/attendance/sessions` for same class + date twice → 409
  - `POST /api/attendance/sessions` with a student_id from a different class → 422
  - `POST /api/attendance/sessions` with empty records list → 422
  - `GET /api/attendance/sessions` as teacher → returns only own sessions
  - `GET /api/attendance/sessions?class_id=X` → filters correctly
  - `GET /api/attendance/sessions?date=YYYY-MM-DD` → filters correctly

---

### Frontend Phase 4 Deliverables

**Types**

- [x] `frontend/src/types/attendance.ts`:
  - `AttendanceStatus = "present" | "absent" | "late" | "excused"`
  - `AttendanceRecordDraft { studentId: number; status: AttendanceStatus }` — mutable draft used in the UI before submission
  - `AttendanceRecordCreate { studentId: number; status: AttendanceStatus }` — shape sent to the API
  - `AttendanceSessionCreate { classId: number; date: string; records: AttendanceRecordCreate[] }`
  - `AttendanceRecord { id: number; studentId: number; status: AttendanceStatus }`
  - `AttendanceSession { id: number; classId: number; date: string; period: string; takenBy: number; createdAt: string }`
  - `AttendanceSessionDetail extends AttendanceSession { records: AttendanceRecord[] }`

**API Layer**

- [x] `frontend/src/api/attendance.ts`:
  - `submitAttendance(data: AttendanceSessionCreate): Promise<AttendanceSessionDetail>`
  - `listSessions(params?: { classId?: number; date?: string }): Promise<AttendanceSession[]>`

**Store**

- [x] `frontend/src/stores/attendance.ts` — Pinia setup store:
  - State: `sessions: ref<AttendanceSession[]>`, `submitting: ref<boolean>`, `error: ref<string | null>`
  - `fetchSessions(params?)` — populates `sessions`; sets `error` on failure
  - `submitAttendance(data: AttendanceSessionCreate): Promise<AttendanceSessionDetail | null>` — calls api; on 409 sets a descriptive error ("Attendance for this class on this date has already been submitted"); clears `submitting` on completion

**Views**

- [x] `frontend/src/views/TakeAttendanceView.vue` — route `/attendance`:
  - Step 1 (class + date): `ClassSelector` dropdown (reuse existing component) + date input pre-filled to today
  - On class selection: calls `classesStore.fetchClass(id)` to load the student roster
  - Step 2 (roster): `AttendanceRoster` component displaying each student with a status toggle; shows loading state while class is fetching
  - "Submit" button: disabled until all students have a status; calls `attendanceStore.submitAttendance()`; shows inline error on 409; redirects to `/dashboard` on success
  - "← Dashboard" `RouterLink` back link in header (same pattern as `ClassManagementView`)

**Components**

- [x] `frontend/src/components/AttendanceRoster.vue`:
  - Props: `students: Student[]`, `modelValue: AttendanceRecordDraft[]`
  - Emits: `update:modelValue` with the updated draft array when any status changes
  - Renders a table: one row per student; each row shows the student name and four `AttendanceStatusBadge` buttons (present / absent / late / excused)
  - Highlights the active status for each student row

- [x] `frontend/src/components/AttendanceStatusBadge.vue`:
  - Props: `status: AttendanceStatus`, `active: boolean`
  - Emits: `click`
  - Renders a styled button/chip; colour-coded by status (green=present, red=absent, yellow=late, blue=excused); visually distinct when `active`

**Router**

- [x] `frontend/src/router/index.ts` — add `/attendance` route pointing to `TakeAttendanceView.vue` (lazy-loaded, protected by existing auth guard)

**Navigation**

- [x] `frontend/src/views/DashboardView.vue` — add "Take Attendance" `RouterLink` to `/attendance` alongside the existing "Manage Classes" link

**Testing**

- [x] `frontend/tests/unit/stores/attendance.spec.ts` — mocks `@/api/attendance`; tests:
  - `fetchSessions()` populates `sessions` and clears loading
  - `submitAttendance()` calls api and returns the session detail
  - On 409 API error, `error` is set to the duplicate-session message
  - On other API error, `error` is set to the error message and `submitting` is cleared

- [x] `frontend/tests/unit/components/AttendanceRoster.spec.ts` — mocks nothing; tests:
  - Renders one row per student
  - Clicking a status badge emits `update:modelValue` with the correct updated draft
  - Active status is visually distinguished (e.g. has `active` class or `aria-pressed`)

- [x] `frontend/tests/unit/views/TakeAttendanceView.spec.ts` — mocks `useClassesStore` and `useAttendanceStore`; tests:
  - Renders `ClassSelector` and date input
  - After class selection, renders `AttendanceRoster` with the class's students
  - "Submit" button is disabled when roster is empty (no class selected)
  - Clicking "Submit" calls `attendanceStore.submitAttendance` with correct payload
  - On store error, displays the error message inline

---

### Phase 4 Success Criteria

- `POST /api/attendance/sessions` creates a session + all records in one request; non-owner gets 403; duplicate class+date gets 409
- `GET /api/attendance/sessions` returns only the current teacher's sessions; filters by `class_id` and `date`
- Teacher can navigate to `/attendance`, select a class, pick a date, toggle each student's status, and submit — the session is recorded
- Submitting for a class+date that already has a session shows a clear error message in the UI
- Backend tests pass: `pytest backend/tests/test_attendance.py`
- Frontend tests pass: `npm test`
