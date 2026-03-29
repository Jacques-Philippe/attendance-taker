import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, enableAutoUnmount } from "@vue/test-utils";

enableAutoUnmount(afterEach);
import { createRouter, createMemoryHistory } from "vue-router";
import TopBar from "@/components/TopBar.vue";
import { makeI18n } from "../../utils";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const { mockLogout } = vi.hoisted(() => ({ mockLogout: vi.fn() }));

const testUser = { id: 1, username: "alice", role: "teacher" };

// Mutable so individual tests can swap user/logout state before mounting.
let mockAuthStore: { user: typeof testUser | null; logout: typeof mockLogout } =
  { user: testUser, logout: mockLogout };

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => mockAuthStore,
}));

// ─── Router helpers ───────────────────────────────────────────────────────────

const stub = { template: "<div />" };

const namedRoutes = [
  { path: "/dashboard", name: "dashboard", component: stub },
  { path: "/classes", name: "classes", component: stub },
  { path: "/attendance", name: "attendance", component: stub },
  { path: "/history", name: "history", component: stub },
  { path: "/reports", name: "reports", component: stub },
  { path: "/students/:id", name: "student-record", component: stub },
];

const routePath: Record<string, string> = {
  dashboard: "/dashboard",
  classes: "/classes",
  attendance: "/attendance",
  history: "/history",
  reports: "/reports",
  "student-record": "/students/1",
};

async function mountTopBar(routeName = "dashboard") {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: namedRoutes,
  });
  await router.push(routePath[routeName] ?? "/dashboard");
  await router.isReady();
  return mount(TopBar, { global: { plugins: [router, makeI18n()] } });
}

// ─── Avatar letter ────────────────────────────────────────────────────────────

describe("TopBar — avatar letter", () => {
  it("shows the first letter of the username uppercased", async () => {
    const wrapper = await mountTopBar();
    expect(wrapper.find(".avatar-button").text()).toBe("A");
  });

  it("reflects a different username", async () => {
    mockAuthStore = {
      user: { ...testUser, username: "bob" },
      logout: mockLogout,
    };
    const wrapper = await mountTopBar();
    expect(wrapper.find(".avatar-button").text()).toBe("B");
  });
});

// ─── Breadcrumbs ─────────────────────────────────────────────────────────────

describe("TopBar — breadcrumbs", () => {
  beforeEach(() => {
    mockAuthStore = { user: testUser, logout: mockLogout };
  });

  it("hides breadcrumbs on the dashboard route", async () => {
    const wrapper = await mountTopBar("dashboard");
    expect(wrapper.find(".breadcrumbs").exists()).toBe(false);
  });

  it("shows breadcrumbs on non-dashboard routes", async () => {
    const wrapper = await mountTopBar("classes");
    expect(wrapper.find(".breadcrumbs").exists()).toBe(true);
  });

  it("shows a 'Home' link and the current page label", async () => {
    const wrapper = await mountTopBar("classes");
    const items = wrapper.findAll(".breadcrumb-item");
    expect(items[0].find(".breadcrumb-link").text()).toBe("Home");
    expect(items[1].find(".breadcrumb-current").text()).toBe("Classes");
  });

  it.each([
    ["attendance", "Take Attendance"],
    ["history", "History"],
    ["reports", "Reports"],
    ["student-record", "Student Record"],
  ])("labels the '%s' route as '%s'", async (routeName, label) => {
    const wrapper = await mountTopBar(routeName);
    expect(wrapper.find(".breadcrumb-current").text()).toBe(label);
  });

  it("'Home' link points to /dashboard", async () => {
    const wrapper = await mountTopBar("classes");
    const homeLink = wrapper.find(".breadcrumb-link");
    expect(homeLink.attributes("href")).toBe("/dashboard");
  });
});

// ─── Dropdown ─────────────────────────────────────────────────────────────────

describe("TopBar — dropdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStore = { user: testUser, logout: mockLogout };
  });

  it("is hidden initially", async () => {
    const wrapper = await mountTopBar();
    expect(wrapper.find(".dropdown-menu").exists()).toBe(false);
  });

  it("opens when the avatar is clicked", async () => {
    const wrapper = await mountTopBar();
    await wrapper.find(".avatar-button").trigger("click");
    expect(wrapper.find(".dropdown-menu").exists()).toBe(true);
  });

  it("closes when the avatar is clicked again", async () => {
    const wrapper = await mountTopBar();
    await wrapper.find(".avatar-button").trigger("click");
    await wrapper.find(".avatar-button").trigger("click");
    expect(wrapper.find(".dropdown-menu").exists()).toBe(false);
  });

  it("displays the username in the dropdown header", async () => {
    const wrapper = await mountTopBar();
    await wrapper.find(".avatar-button").trigger("click");
    expect(wrapper.find(".username").text()).toBe("alice");
  });

  it("renders the logout button inside the dropdown", async () => {
    const wrapper = await mountTopBar();
    await wrapper.find(".avatar-button").trigger("click");
    expect(wrapper.find(".logout-button").exists()).toBe(true);
  });
});

// ─── Logout ───────────────────────────────────────────────────────────────────

describe("TopBar — logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogout.mockResolvedValue(undefined);
    mockAuthStore = { user: testUser, logout: mockLogout };
  });

  it("calls authStore.logout when the logout button is clicked", async () => {
    const wrapper = await mountTopBar();
    await wrapper.find(".avatar-button").trigger("click");
    await wrapper.find(".logout-button").trigger("click");
    expect(mockLogout).toHaveBeenCalledOnce();
  });

  it("closes the dropdown after logout", async () => {
    const wrapper = await mountTopBar();
    await wrapper.find(".avatar-button").trigger("click");
    await wrapper.find(".logout-button").trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".dropdown-menu").exists()).toBe(false);
  });
});

// ─── Click outside ───────────────────────────────────────────────────────────

describe("TopBar — click outside", () => {
  beforeEach(() => {
    mockAuthStore = { user: testUser, logout: mockLogout };
  });

  it("closes the dropdown when clicking outside the component", async () => {
    const wrapper = await mountTopBar();
    await wrapper.find(".avatar-button").trigger("click");
    expect(wrapper.find(".dropdown-menu").exists()).toBe(true);

    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".dropdown-menu").exists()).toBe(false);
  });
});
