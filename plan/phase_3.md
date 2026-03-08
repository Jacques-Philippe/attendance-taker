## Phase 3 Deliverables — Class & Student Management

### Design decisions

- Students are lightweight records (name only) owned by a class. They do not have user accounts or passwords. A teacher adds student names to a class they own; the names appear on that class's attendance roster.
- The `Enrollment` model is replaced by a direct `Student` model with a `class_id` FK.
- The admin role is eliminated. Any authenticated user (teacher) can create and manage their own classes and students.
- `Class.teacher_id` is set server-side from the session — teachers cannot create classes on behalf of others.
- All class and student endpoints enforce ownership: a teacher can only read/write their own data.

---

### Backend Phase 3 Deliverables

**Migration**

- [x] `backend/alembic/versions/004_classes.py` — creates `classes` and `students` tables:
  - `classes`: `id`, `name` (NOT NULL), `period` (NOT NULL), `teacher_id` (FK→users, NOT NULL)
  - `students`: `id`, `name` (NOT NULL), `class_id` (FK→classes NOT NULL)
  - Use `op.batch_alter_table` for any subsequent column changes to stay compatible with the SQLite test database

**ORM Models — update**

- [x] `backend/app/models/class_.py` — replace `Enrollment` with `Student`:
  - `Class`: keep `id`, `name`, `period`, `teacher_id` FK→users (no change)
  - `Student`: `id` (PK), `name` (String NOT NULL), `class_id` (FK→classes NOT NULL)
- [x] `backend/app/models/attendance.py` — change `AttendanceRecord.student_id` FK from `users.id` to `students.id`
- [x] `backend/app/models/__init__.py` — export `Student`; remove `Enrollment`

**Schemas**

- [x] `backend/app/schemas/class_.py`:
  - `ClassCreate`: `name: str` (non-empty), `period: str` (non-empty)
  - `ClassUpdate`: `name: str | None`, `period: str | None` — at least one must be provided
  - `StudentResponse`: `id`, `name`, `class_id` — `model_config = ConfigDict(from_attributes=True)`
  - `StudentCreate`: `name: str` (non-empty)
  - `StudentUpdate`: `name: str`
  - `ClassResponse`: `id`, `name`, `period`, `teacher_id` — `from_attributes=True`
  - `ClassDetailResponse`: extends `ClassResponse` with `students: list[StudentResponse]`

- [x] `backend/app/schemas/__init__.py` — export all new schemas

**Classes Router**

- [x] `backend/app/routers/classes.py` — `APIRouter(prefix="/api/classes", tags=["classes"])`
  - `GET /` — `Depends(get_current_user)` — returns `list[ClassResponse]` scoped to `teacher_id == current_user.id`
  - `POST /` — `Depends(get_current_user)` — accepts `ClassCreate`; sets `teacher_id = current_user.id` server-side; returns `ClassResponse` (201)
  - `GET /{class_id}` — `Depends(get_current_user)` — returns `ClassDetailResponse` with `students`; returns 403 if class does not belong to current user; returns 404 if class not found
  - `PATCH /{class_id}` — `Depends(get_current_user)` — accepts `ClassUpdate`; 403 if not owner; returns updated `ClassResponse`
  - `DELETE /{class_id}` — `Depends(get_current_user)` — 403 if not owner; deletes class and all its students (cascade or explicit); returns 204
  - `POST /{class_id}/students` — `Depends(get_current_user)` — 403 if not owner; accepts `StudentCreate`; returns `StudentResponse` (201)
  - `PATCH /{class_id}/students/{student_id}` — `Depends(get_current_user)` — 403 if class not owned; 404 if student not in class; accepts `StudentUpdate`; returns updated `StudentResponse`
  - `DELETE /{class_id}/students/{student_id}` — `Depends(get_current_user)` — 403 if class not owned; 404 if student not in class; returns 204

- [x] Register router in `backend/app/main.py`
- [x] Export from `backend/app/routers/__init__.py`

**Testing**

- [x] `backend/tests/test_classes.py` — setup seeds two teacher users (teacher A and teacher B); uses Alembic upgrade/downgrade (matching `test_auth.py` pattern):
  - `POST /api/classes` as teacher A → 201, correct fields, `teacher_id` matches session user
  - `GET /api/classes` as teacher A → sees only teacher A's classes (not teacher B's)
  - `GET /api/classes/{id}` as owner → 200, includes `students` list
  - `GET /api/classes/{id}` as non-owner → 403
  - `PATCH /api/classes/{id}` as owner → 200, updated fields
  - `PATCH /api/classes/{id}` as non-owner → 403
  - `DELETE /api/classes/{id}` as owner → 204
  - `DELETE /api/classes/{id}` as non-owner → 403
  - `POST /api/classes/{id}/students` as owner → 201, student name in response
  - `POST /api/classes/{id}/students` as non-owner → 403
  - `PATCH /api/classes/{id}/students/{student_id}` as owner → 200, updated name
  - `DELETE /api/classes/{id}/students/{student_id}` as owner → 204
  - `DELETE /api/classes/{id}/students/{student_id}` for non-existent student → 404

---

### Frontend Phase 3 Deliverables

**Types**

- [x] `frontend/src/types/class.ts`:
  - `Student { id: number; name: string; classId: number }`
  - `Class { id: number; name: string; period: string; teacherId: number }`
  - `ClassDetail extends Class { students: Student[] }`
  - `ClassCreate { name: string; period: string }`
  - `ClassUpdate { name?: string; period?: string }`

**API Layer**

- [x] `frontend/src/api/classes.ts`:
  - `listClasses(): Promise<Class[]>`
  - `getClass(id: number): Promise<ClassDetail>`
  - `createClass(data: ClassCreate): Promise<Class>`
  - `updateClass(id: number, data: ClassUpdate): Promise<Class>`
  - `deleteClass(id: number): Promise<void>`
  - `addStudent(classId: number, name: string): Promise<Student>`
  - `updateStudent(classId: number, studentId: number, name: string): Promise<Student>`
  - `removeStudent(classId: number, studentId: number): Promise<void>`

**Store**

- [x] `frontend/src/stores/classes.ts` — Pinia setup store:
  - State: `classes: ref<Class[]>`, `currentClass: ref<ClassDetail | null>`, `loading: ref<boolean>`, `error: ref<string | null>`
  - `fetchClasses()` — populates `classes`
  - `fetchClass(id)` — populates `currentClass`
  - `createClass(data)` — calls api, appends to `classes`
  - `updateClass(id, data)` — calls api, updates entry in `classes`
  - `deleteClass(id)` — calls api, removes from `classes`
  - `addStudent(classId, name)` — calls api, appends to `currentClass.students`
  - `updateStudent(classId, studentId, name)` — calls api, updates in `currentClass.students`
  - `removeStudent(classId, studentId)` — calls api, removes from `currentClass.students`

**Views**

- [x] `frontend/src/views/ClassManagementView.vue`:
  - Lists the teacher's classes (name, period, student count)
  - "New class" button: inline form for name and period
  - Each class row: "Edit" (name/period inline), "Delete" (with confirmation), "Manage students" expander
  - "Manage students" section: lists student names, inline rename, remove button, "Add student" text input
- [x] `frontend/src/views/DashboardView.vue` — added "Manage Classes" `RouterLink` navigating to `/classes`

**Components**

- [x] `frontend/src/components/ClassSelector.vue` — dropdown populated from `classesStore.classes`; emits `update:modelValue` with selected `class.id`; used by Phase 4's attendance-taking flow

**Router**

- [x] `frontend/src/router/index.ts` — add `/classes` route pointing to `ClassManagementView.vue`

**Testing**

- [x] `frontend/tests/unit/stores/classes.spec.ts` — mocks `@/api/classes`; tests:
  - `fetchClasses()` populates `classes` and clears `loading`
  - `createClass()` calls api and appends to `classes`
  - `deleteClass()` calls api and removes from `classes`
  - `addStudent()` calls api and appends to `currentClass.students`
  - `removeStudent()` calls api and removes from `currentClass.students`
  - On API error, `error` is set and `loading` is cleared

- [x] `frontend/tests/unit/views/ClassManagementView.spec.ts` — mocks `useClassesStore`; tests:
  - Renders class list from store
  - "Delete" calls `classesStore.deleteClass` with correct id
  - "New class" form calls `classesStore.createClass` on submit

---

### Phase 3 Success Criteria

- `POST /api/classes` creates a class owned by the authenticated teacher; `teacher_id` is never accepted from the request body
- `GET /api/classes` returns only the current teacher's classes
- `GET /api/classes/{id}` returns class detail with students; non-owner gets 403
- `PATCH` and `DELETE` on a class work for the owner; non-owner gets 403
- `POST /api/classes/{id}/students` adds a student by name; non-owner gets 403
- `PATCH` and `DELETE` on a student update/remove the name; non-existent student returns 404
- Deleting a class also deletes all its students
- Teacher sees their class list and can manage students without any setup by another user
- `ClassSelector` component renders a dropdown of classes bound via `v-model`
- Backend tests pass: `pytest backend/tests/test_classes.py`
- Frontend tests pass: `npm test`
