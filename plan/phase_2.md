## Phase 2 Deliverables — Auth

### Backend Phase 2 Deliverables

**Config**

- [ ] `backend/app/config.py` — add `session_ttl_hours: int = 24` to `Settings`; add `SESSION_TTL_HOURS=24` to `backend/.env.example`

**Schemas**

- [ ] `backend/app/schemas/__init__.py` — export all schemas
- [ ] `backend/app/schemas/user.py` — `UserCreate` (username, password, role), `UserResponse` (id, username, role), `LoginRequest` (username, password), `LoginResponse` (user: UserResponse)

**Auth Service**

- [ ] `backend/app/services/auth.py` — password hashing with `passlib[bcrypt]`; `hash_password(plain: str) -> str`; `verify_password(plain: str, hashed: str) -> bool`; `create_session(db, user_id) -> str` (generates a `secrets.token_hex(32)` token, stores it with `expires_at = now() + SESSION_TTL_HOURS`); `resolve_session(db, token: str) -> User | None` (must filter `expires_at > now()` — expired tokens return `None`)

**Session Storage**

Session tokens are stored in a `sessions` table (id, user_id, token, created_at, expires_at). Add a migration:

- [ ] `backend/alembic/versions/002_sessions.py` — creates `sessions` table
- [ ] `backend/app/models/session.py` — `Session` ORM model (id, user_id FK→users, token String unique, created_at, expires_at)
- [ ] Export `Session` from `backend/app/models/__init__.py`

**Auth Router**

- [ ] `backend/app/routers/auth.py` — `APIRouter(prefix="/api/auth")`
  - `POST /login` — look up user by username (return 401 if not found — do not 404, to avoid username enumeration), verify password (return 401 if wrong), create session, set `session_token` cookie (HttpOnly, SameSite=Lax, Secure=not settings.debug), return `LoginResponse`
  - `POST /logout` — delete session from DB, clear cookie, return 204
  - `GET /me` — resolve session cookie, return `UserResponse` or 401
- [ ] Register auth router in `backend/app/main.py`
- [ ] Export auth router from `backend/app/routers/__init__.py`

**Auth Middleware / Dependency**

- [ ] `backend/app/middleware/auth.py` — `get_current_user(request: Request, db: Session = Depends(get_db)) -> User` FastAPI dependency; reads `session_token` cookie, calls `resolve_session`, raises `HTTPException(401)` if missing or expired; used by all protected routes

**Testing**

- [ ] `backend/tests/test_auth.py` — tests using in-memory SQLite via existing `client` fixture:
  - Seed a hashed-password user before tests
  - `POST /api/auth/login` with valid credentials → 200, cookie set
  - `POST /api/auth/login` with wrong password → 401
  - `POST /api/auth/login` with non-existent username → 401 (not 404)
  - `GET /api/auth/me` with valid session cookie → 200, correct user fields
  - `GET /api/auth/me` with no cookie → 401
  - `POST /api/auth/logout` → 204, cookie cleared
  - `GET /api/auth/me` after logout → 401

### Frontend Phase 2 Deliverables

**Auth Store — wire up**

- [ ] `frontend/src/stores/auth.ts` — implement the three stubs:
  - `login(username, password)` — calls `api/auth.login()`, sets `user.value` from response, redirects to `/dashboard`
  - `logout()` — calls `api/auth.logout()`, clears `user.value`, redirects to `/login`
  - `fetchCurrentUser()` — calls `api/auth.getMe()`, sets `user.value`; on 401 sets `user.value = null` without throwing

**Login View — wire up**

- [ ] `frontend/src/views/LoginView.vue` — implement `handleSubmit`:
  - Call `authStore.login(username, password)`
  - Show inline error message on failure (wrong credentials)
  - Show loading state on the submit button while request is in-flight
  - If already authenticated on mount, redirect to `/dashboard`

**Route Guards**

- [ ] `frontend/src/router/index.ts` — add `beforeEach` navigation guard:
  - Protected routes (all except `/login`) redirect to `/login` if `!authStore.isAuthenticated`
  - `/login` redirects to `/dashboard` if already authenticated
  - Call `authStore.fetchCurrentUser()` once on first navigation to restore session

**API Layer — verify shapes**

- [ ] Confirm `LoginResponse` shape matches backend response and update `frontend/src/types/user.ts` if needed
- [ ] `frontend/src/api/client.ts` — implement the 401 interceptor: on 401 response, call `authStore.logout()` and redirect to `/login`; skip this redirect if the failing request is to `/auth/me` (that call is used to probe session status and handles 401 itself)

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

- `POST /api/auth/login` with valid credentials returns 200 and sets an HttpOnly `session_token` cookie
- `POST /api/auth/login` with invalid credentials returns 401
- `GET /api/auth/me` with a valid session cookie returns the authenticated user's id, username, and role
- `GET /api/auth/me` with no cookie (or expired/invalid token) returns 401
- `POST /api/auth/logout` returns 204 and the cookie is cleared; subsequent `GET /api/auth/me` returns 401
- Navigating to `/dashboard` without being logged in redirects to `/login`
- Navigating to `/login` while already logged in redirects to `/dashboard`
- Submitting the login form with correct credentials navigates to `/dashboard`
- Submitting the login form with wrong credentials shows an inline error without redirecting
- Page reload on an authenticated route restores the session (no spurious redirect to `/login`)
- Backend tests pass: `pytest backend/tests/test_auth.py`
- Frontend tests pass: `npm test`
