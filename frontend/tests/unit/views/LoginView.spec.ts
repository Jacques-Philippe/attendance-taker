import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import LoginView from "@/views/LoginView.vue";
import { makeRouter } from "../../utils";

// vi.mock is hoisted before variable declarations, so use vi.hoisted to share
// the mock fn reference with the factory.
const { mockLogin } = vi.hoisted(() => ({ mockLogin: vi.fn() }));

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
    login: mockLogin,
  }),
}));

function mountLoginView() {
  return mount(LoginView, {
    global: { plugins: [makeRouter({ path: "/login", component: LoginView })] },
  });
}

// ─── Phase 1 — render tests ───────────────────────────────────────────────────

describe("LoginView", () => {
  it("renders the app title", () => {
    const wrapper = mountLoginView();
    expect(wrapper.find("h1").text()).toBe("Attendance Taker");
  });

  it("renders a username input", () => {
    const wrapper = mountLoginView();
    const input = wrapper.find('input[type="text"]#username');
    expect(input.exists()).toBe(true);
    expect(input.attributes("autocomplete")).toBe("username");
    expect(input.attributes("required")).toBeDefined();
  });

  it("renders a password input", () => {
    const wrapper = mountLoginView();
    const input = wrapper.find('input[type="password"]#password');
    expect(input.exists()).toBe(true);
    expect(input.attributes("autocomplete")).toBe("current-password");
    expect(input.attributes("required")).toBeDefined();
  });

  it("renders a submit button", () => {
    const wrapper = mountLoginView();
    const button = wrapper.find('button[type="submit"]');
    expect(button.exists()).toBe(true);
    expect(button.text()).toBe("Sign In");
  });

  it("updates username ref when typing", async () => {
    const wrapper = mountLoginView();
    const input = wrapper.find("#username");
    await input.setValue("teacher1");
    expect((input.element as HTMLInputElement).value).toBe("teacher1");
  });

  it("updates password ref when typing", async () => {
    const wrapper = mountLoginView();
    const input = wrapper.find("#password");
    await input.setValue("s3cr3t");
    expect((input.element as HTMLInputElement).value).toBe("s3cr3t");
  });

  it("does not throw when the form is submitted", async () => {
    const wrapper = mountLoginView();
    await wrapper.find("#username").setValue("teacher1");
    await wrapper.find("#password").setValue("s3cr3t");
    await expect(wrapper.find("form").trigger("submit")).resolves.not.toThrow();
  });
});

// ─── Phase 2 — behaviour tests ────────────────────────────────────────────────

describe("LoginView — Phase 2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue(undefined);
  });

  it("calls authStore.login with the entered credentials on submit", async () => {
    const wrapper = mountLoginView();
    await wrapper.find("#username").setValue("teacher1");
    await wrapper.find("#password").setValue("mypassword");
    await wrapper.find("form").trigger("submit");

    expect(mockLogin).toHaveBeenCalledOnce();
    expect(mockLogin).toHaveBeenCalledWith("teacher1", "mypassword");
  });

  it("shows an error message when login rejects", async () => {
    mockLogin.mockRejectedValueOnce(new Error("401"));
    const wrapper = mountLoginView();
    await wrapper.find("#username").setValue("teacher1");
    await wrapper.find("#password").setValue("wrongpassword");
    await wrapper.find("form").trigger("submit");
    await wrapper.vm.$nextTick();

    const error = wrapper.find(".error");
    expect(error.exists()).toBe(true);
    expect(error.text()).toContain("Invalid");
  });

  it("does not show an error message on initial render", () => {
    const wrapper = mountLoginView();
    expect(wrapper.find(".error").exists()).toBe(false);
  });

  it("disables the button and shows loading text while login is pending", async () => {
    let resolveLogin!: () => void;
    mockLogin.mockReturnValueOnce(
      new Promise<void>((r) => {
        resolveLogin = r;
      }),
    );

    const wrapper = mountLoginView();
    await wrapper.find("#username").setValue("teacher1");
    await wrapper.find("#password").setValue("mypassword");

    // Trigger submit without awaiting so we can inspect mid-flight state.
    wrapper.find("form").trigger("submit");
    await wrapper.vm.$nextTick();

    const button = wrapper.find('button[type="submit"]');
    expect(button.attributes("disabled")).toBeDefined();
    expect(button.text()).toBe("Signing in…");

    // Finish the login and confirm button returns to normal.
    resolveLogin();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(button.attributes("disabled")).toBeUndefined();
    expect(button.text()).toBe("Sign In");
  });
});
