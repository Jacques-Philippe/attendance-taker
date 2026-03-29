import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { PATHS } from "@/router/paths";

const { mockPush, mockLogin, mockLogout, mockRegister, mockGetMe } = vi.hoisted(
  () => ({
    mockPush: vi.fn(),
    mockLogin: vi.fn(),
    mockLogout: vi.fn(),
    mockRegister: vi.fn(),
    mockGetMe: vi.fn(),
  }),
);

vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-router")>();
  return { ...actual, useRouter: () => ({ push: mockPush }) };
});

vi.mock("@/api/auth", () => ({
  login: mockLogin,
  logout: mockLogout,
  register: mockRegister,
  getMe: mockGetMe,
}));

const testUser = { id: 1, username: "teacher1", role: "teacher" };

beforeEach(() => {
  vi.clearAllMocks();
  setActivePinia(createPinia());
});

// ─── login ──────────────────────────────────────────────────────────────────

describe("useAuthStore — login()", () => {
  it("calls api/auth.login with username and password", async () => {
    mockLogin.mockResolvedValueOnce({ user: testUser });
    const store = useAuthStore();
    await store.login("teacher1", "mypassword");
    expect(mockLogin).toHaveBeenCalledOnce();
    expect(mockLogin).toHaveBeenCalledWith({
      username: "teacher1",
      password: "mypassword",
    });
  });

  it("sets user and isAuthenticated after login", async () => {
    mockLogin.mockResolvedValueOnce({ user: testUser });
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
    await store.login("teacher1", "mypassword");
    expect(store.user).toEqual(testUser);
    expect(store.isAuthenticated).toBe(true);
  });

  it("navigates to /dashboard after login", async () => {
    mockLogin.mockResolvedValueOnce({ user: testUser });
    const store = useAuthStore();
    await store.login("teacher1", "mypassword");
    expect(mockPush).toHaveBeenCalledWith(PATHS.dashboard);
  });
});

// ─── logout ─────────────────────────────────────────────────────────────────

describe("useAuthStore — logout()", () => {
  it("calls api/auth.logout", async () => {
    mockLogout.mockResolvedValueOnce(undefined);
    const store = useAuthStore();
    await store.logout();
    expect(mockLogout).toHaveBeenCalledOnce();
  });

  it("clears user after logout", async () => {
    mockLogin.mockResolvedValueOnce({ user: testUser });
    mockLogout.mockResolvedValueOnce(undefined);
    const store = useAuthStore();
    await store.login("teacher1", "mypassword");
    expect(store.user).toEqual(testUser);
    await store.logout();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it("navigates to /login after logout", async () => {
    mockLogout.mockResolvedValueOnce(undefined);
    const store = useAuthStore();
    await store.logout();
    expect(mockPush).toHaveBeenCalledWith(PATHS.login);
  });
});

// ─── register ───────────────────────────────────────────────────────────────

describe("useAuthStore — register()", () => {
  it("calls api/auth.register with username and password", async () => {
    mockRegister.mockResolvedValueOnce(testUser);
    const store = useAuthStore();
    await store.register("newuser", "mypassword");
    expect(mockRegister).toHaveBeenCalledOnce();
    expect(mockRegister).toHaveBeenCalledWith({
      username: "newuser",
      password: "mypassword",
    });
  });

  it("sets user and isAuthenticated after register", async () => {
    mockRegister.mockResolvedValueOnce(testUser);
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
    await store.register("newuser", "mypassword");
    expect(store.user).toEqual(testUser);
    expect(store.isAuthenticated).toBe(true);
  });

  it("navigates to /dashboard after register", async () => {
    mockRegister.mockResolvedValueOnce(testUser);
    const store = useAuthStore();
    await store.register("newuser", "mypassword");
    expect(mockPush).toHaveBeenCalledWith(PATHS.dashboard);
  });
});

// ─── fetchCurrentUser ────────────────────────────────────────────────────────

describe("useAuthStore — fetchCurrentUser()", () => {
  it("sets user when getMe resolves", async () => {
    mockGetMe.mockResolvedValueOnce(testUser);
    const store = useAuthStore();
    await store.fetchCurrentUser();
    expect(store.user).toEqual(testUser);
    expect(store.isAuthenticated).toBe(true);
  });

  it("sets user to null on 401 without throwing", async () => {
    mockGetMe.mockRejectedValueOnce({ response: { status: 401 } });
    const store = useAuthStore();
    store.user = testUser; // seed a user first
    await expect(store.fetchCurrentUser()).resolves.not.toThrow();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });
});
