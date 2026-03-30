import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import RegisterView from "@/views/RegisterView.vue";
import { makeRouter, makeI18n, TEST_LOCALES } from "../../utils";
import { PATHS } from "@/router/paths";

const { mockRegister } = vi.hoisted(() => ({ mockRegister: vi.fn() }));

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
    register: mockRegister,
  }),
}));

function mountRegisterView() {
  return mount(RegisterView, {
    global: {
      plugins: [
        makeRouter({ path: PATHS.register, component: RegisterView }),
        makeI18n(),
      ],
    },
  });
}

async function fillForm(
  wrapper: ReturnType<typeof mountRegisterView>,
  username: string,
  password: string,
  confirmPassword: string,
) {
  await wrapper.find("#username").setValue(username);
  await wrapper.find("#password").setValue(password);
  await wrapper.find("#confirm-password").setValue(confirmPassword);
}

// ─── non-English smoke test ────────────────────────────────────────────────────

describe("RegisterView — French locale", () => {
  it("renders translated heading and submit button in French", () => {
    const wrapper = mount(RegisterView, {
      global: {
        plugins: [
          makeRouter({ path: PATHS.register, component: RegisterView }),
          makeI18n({ locale: "fr", messages: TEST_LOCALES }),
        ],
      },
    });
    expect(wrapper.find("h1").text()).toBe("Créer un compte");
    expect(wrapper.find('button[type="submit"]').text()).toBe(
      "Créer un compte",
    );
  });
});

// ─── render tests ──────────────────────────────────────────────────────────────

describe("RegisterView", () => {
  it("renders the page heading", () => {
    const wrapper = mountRegisterView();
    expect(wrapper.find("h1").text()).toBe("Create Account");
  });

  it("renders username, password and confirm-password inputs", () => {
    const wrapper = mountRegisterView();
    expect(wrapper.find("#username").exists()).toBe(true);
    expect(wrapper.find("#password").exists()).toBe(true);
    expect(wrapper.find("#confirm-password").exists()).toBe(true);
  });

  it("renders a submit button with default text", () => {
    const wrapper = mountRegisterView();
    expect(wrapper.find('button[type="submit"]').text()).toBe("Create Account");
  });

  it("does not show an error on initial render", () => {
    const wrapper = mountRegisterView();
    expect(wrapper.find(".error").exists()).toBe(false);
  });
});

// ─── behaviour tests ───────────────────────────────────────────────────────────

describe("RegisterView — behaviour", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegister.mockResolvedValue(undefined);
  });

  it("calls authStore.register with username and password on valid submit", async () => {
    const wrapper = mountRegisterView();
    await fillForm(wrapper, "newuser", "mypassword", "mypassword");
    await wrapper.find("form").trigger("submit");

    expect(mockRegister).toHaveBeenCalledOnce();
    expect(mockRegister).toHaveBeenCalledWith("newuser", "mypassword");
  });

  it("shows a password mismatch error without calling register", async () => {
    const wrapper = mountRegisterView();
    await fillForm(wrapper, "newuser", "password1", "password2");
    await wrapper.find("form").trigger("submit");

    expect(mockRegister).not.toHaveBeenCalled();
    expect(wrapper.find(".error").text()).toBe("Passwords do not match.");
  });

  it("shows 'username taken' error on 409", async () => {
    mockRegister.mockRejectedValueOnce({ response: { status: 409 } });
    const wrapper = mountRegisterView();
    await fillForm(wrapper, "takenuser", "mypassword", "mypassword");
    await wrapper.find("form").trigger("submit");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".error").text()).toBe("Username is already taken.");
  });

  it("shows validation detail on 422", async () => {
    mockRegister.mockRejectedValueOnce({
      response: {
        status: 422,
        data: {
          detail: [{ msg: "String should have at least 8 characters" }],
        },
      },
    });
    const wrapper = mountRegisterView();
    await fillForm(wrapper, "u", "short", "short");
    await wrapper.find("form").trigger("submit");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".error").text()).toContain(
      "String should have at least 8 characters",
    );
  });

  it("shows a generic error for other failures", async () => {
    mockRegister.mockRejectedValueOnce(new Error("network error"));
    const wrapper = mountRegisterView();
    await fillForm(wrapper, "newuser", "mypassword", "mypassword");
    await wrapper.find("form").trigger("submit");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".error").text()).toBe(
      "Registration failed. Please try again.",
    );
  });

  it("disables button and shows loading text while register is pending", async () => {
    let resolveRegister!: () => void;
    mockRegister.mockReturnValueOnce(
      new Promise<void>((r) => {
        resolveRegister = r;
      }),
    );

    const wrapper = mountRegisterView();
    await fillForm(wrapper, "newuser", "mypassword", "mypassword");

    wrapper.find("form").trigger("submit");
    await wrapper.vm.$nextTick();

    const button = wrapper.find('button[type="submit"]');
    expect(button.attributes("disabled")).toBeDefined();
    expect(button.text()).toBe("Creating account…");

    resolveRegister();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(button.attributes("disabled")).toBeUndefined();
    expect(button.text()).toBe("Create Account");
  });
});
