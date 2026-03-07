## Phase 2 Deliverables — Auth

### Backend Phase 2 Deliverables

**Config**

- [x] `backend/app/config.py` — add `session_ttl_hours: int = 24` to `Settings`; add `SESSION_TTL_HOURS=24` to `backend/.env.example`

**Schemas**

- [x] `backend/app/schemas/__init__.py` — export all schemas
- [x] `backend/app/schemas/user.py` — `UserCreate` (username, password, role), `UserResponse` (id, username, role), `LoginRequest` (username, password), `LoginResponse` (user: UserResponse), `RegisterRequest` (username, password) with validation: username 3–50 chars, letters/numbers/underscores only; password min 8 chars

**Auth Service**

- [x] `backend/app/services/auth.py` — password hashing with `passlib[bcrypt]`; `hash_password(plain: str) -> str`; `verify_password(plain: str, hashed: str) -> bool`; `create_session(db, user_id) -> str` (generates a `secrets.token_hex(32)` token, stores it with `expires_at = now() + SESSION_TTL_HOURS`); `resolve_session(db, token: str) -> User | None` (must filter `expires_at > now()` — expired tokens return `None`)

**Session Storage**

Session tokens are stored in a `sessions` table (id, user_id, token, created_at, expires_at). Add a migration:

- [x] `backend/alembic/versions/002_sessions.py` — creates `sessions` table
- [x] `backend/app/models/session.py` — `Session` ORM model (id, user_id FK→users, token String unique, created_at, expires_at)
- [x] Export `Session` from `backend/app/models/__init__.py`

**Auth Router**

- [x] `backend/app/routers/auth.py` — `APIRouter(prefix="/api/auth")`
  - `POST /login` — look up user by username (return 401 if not found — do not 404, to avoid username enumeration), verify password (return 401 if wrong), create session, set `session_token` cookie (HttpOnly, SameSite=Lax, Secure=not settings.debug), return `LoginResponse`
  - `POST /logout` — delete session from DB, clear cookie, return 204
  - `GET /me` — resolve session cookie, return `UserResponse` or 401
  - `POST /register` — open registration; accepts `RegisterRequest` (username, password); returns 409 if username already taken; hashes password, creates user with `role="teacher"`, returns `UserResponse` (201)
- [x] Register auth router in `backend/app/main.py`
- [x] Export auth router from `backend/app/routers/__init__.py`

**Auth Middleware / Dependency**

- [x] `backend/app/middleware/auth.py` — `get_current_user(request: Request, db: Session = Depends(get_db)) -> User` FastAPI dependency; reads `session_token` cookie, calls `resolve_session`, raises `HTTPException(401)` if missing or expired; used by all protected routes

**Testing**

- [x] `backend/tests/test_auth.py` — tests using in-memory SQLite via existing `client` fixture:
  - Seed a hashed-password user before tests
  - `POST /api/auth/login` with valid credentials → 200, cookie set
  - `POST /api/auth/login` with wrong password → 401
  - `POST /api/auth/login` with non-existent username → 401 (not 404)
  - `GET /api/auth/me` with valid session cookie → 200, correct user fields
  - `GET /api/auth/me` with no cookie → 401
  - `POST /api/auth/logout` → 204, cookie cleared
  - `GET /api/auth/me` after logout → 401
- [x] `backend/tests/test_register.py` — registration tests:
  - `POST /api/auth/register` with new username → 201, `UserResponse` body, `role == "teacher"`
  - `POST /api/auth/register` with duplicate username → 409
  - Registered user can immediately log in via `POST /api/auth/login`
  - `POST /api/auth/register` with username shorter than 3 chars → 422
  - `POST /api/auth/register` with username containing invalid characters (e.g. space or `@`) → 422
  - `POST /api/auth/register` with password shorter than 8 chars → 422

### Frontend Phase 2 Deliverables

**Auth Store — wire up**

- [x] `frontend/src/stores/auth.ts` — implement the three stubs plus registration:
  - `register(username, password)` — calls `api/auth.register()`, logs the user in (sets `user.value`), redirects to `/dashboard`
  - `login(username, password)` — calls `api/auth.login()`, sets `user.value` from response, redirects to `/dashboard`
  - `logout()` — calls `api/auth.logout()`, clears `user.value`, redirects to `/login`
  - `fetchCurrentUser()` — calls `api/auth.getMe()`, sets `user.value`; on 401 sets `user.value = null` without throwing

**Register View**

- [ ] `frontend/src/views/RegisterView.vue` — username + password + confirm-password form:
  - Validate that password and confirm-password match client-side before submitting
  - Call `authStore.register(username, password)`
  - Show inline error on failure (e.g. username taken)
  - Show loading state on submit button while request is in-flight
  - Link to `/login` for users who already have an account
  - If already authenticated on mount, redirect to `/dashboard`

**Login View — wire up**

- [x] `frontend/src/views/LoginView.vue` — implement `handleSubmit`:
  - Call `authStore.login(username, password)`
  - Show inline error message on failure (wrong credentials)
  - Show loading state on the submit button while request is in-flight
  - If already authenticated on mount, redirect to `/dashboard`

**Route Guards**

- [x] `frontend/src/router/index.ts` — add `beforeEach` navigation guard:
  - Protected routes (all except `/login` and `/register`) redirect to `/login` if `!authStore.isAuthenticated`
  - `/login` and `/register` redirect to `/dashboard` if already authenticated
  - Call `authStore.fetchCurrentUser()` once on first navigation to restore session
  - Add `/register` route pointing to `RegisterView.vue`

**API Layer — verify shapes**

- [x] Confirm `LoginResponse` shape matches backend response and update `frontend/src/types/user.ts` if needed; add `RegisterRequest` type (username, password)
- [x] `frontend/src/api/auth.ts` — add `register(credentials: RegisterRequest): Promise<UserResponse>` calling `POST /auth/register`
- [x] `frontend/src/api/client.ts` — implement the 401 interceptor: on 401 response, call `authStore.logout()` and redirect to `/login`; skip this redirect if the failing request is to `/auth/me` (that call is used to probe session status and handles 401 itself)

**Testing**

- [ ] `frontend/tests/unit/views/LoginView.spec.ts` — extend with Phase 2 tests:
  - Mocks `useAuthStore`; on submit calls `authStore.login` with form values
  - Shows error message when `authStore.login` rejects
  - Submit button is disabled / shows loading text while `login` is pending
- [ ] `frontend/tests/unit/stores/auth.spec.ts` — unit tests for the wired-up store:
  - `login()` calls `api/auth.login`, sets `user`, sets `isAuthenticated = true`
  - `logout()` calls `api/auth.logout`, clears `user`
  - `fetchCurrentUser()` on 401 sets `user = null` without throwing

### Phase 2 Success Criteria

- `POST /api/auth/register` with a new username returns 201, `role == "teacher"`, and the user can immediately log in
- `POST /api/auth/register` with a duplicate username returns 409
- `POST /api/auth/login` with valid credentials returns 200 and sets an HttpOnly `session_token` cookie
- `POST /api/auth/login` with invalid credentials returns 401
- `GET /api/auth/me` with a valid session cookie returns the authenticated user's id, username, and role
- `GET /api/auth/me` with no cookie (or expired/invalid token) returns 401
- `POST /api/auth/logout` returns 204 and the cookie is cleared; subsequent `GET /api/auth/me` returns 401
- Navigating to `/dashboard` without being logged in redirects to `/login`
- Navigating to `/login` or `/register` while already logged in redirects to `/dashboard`
- Submitting the register form with a new username creates the account and navigates to `/dashboard`
- Submitting the register form with a taken username shows an inline error
- Mismatched confirm-password shows a client-side error without submitting
- Submitting the login form with correct credentials navigates to `/dashboard`
- Submitting the login form with wrong credentials shows an inline error without redirecting
- Page reload on an authenticated route restores the session (no spurious redirect to `/login`)
- Backend tests pass: `pytest backend/tests/test_auth.py`
- Frontend tests pass: `npm test`
