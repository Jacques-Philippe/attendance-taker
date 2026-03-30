import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, enableAutoUnmount } from "@vue/test-utils";
import LocaleModal from "@/components/LocaleModal.vue";
import { makeI18n } from "../../utils";

enableAutoUnmount(afterEach);

// ─── Mocks ────────────────────────────────────────────────────────────────────

const { mockSetLocale, SUPPORTED_LOCALES } = vi.hoisted(() => ({
  mockSetLocale: vi.fn(),
  SUPPORTED_LOCALES: [
    { code: "en", label: "English" },
    { code: "fr", label: "Français" },
    { code: "cs", label: "Čeština" },
  ] as const,
}));

let mockCurrentLocale = "en";

vi.mock("@/stores/locale", () => ({
  SUPPORTED_LOCALES,
  useLocaleStore: () => ({
    get current() {
      return mockCurrentLocale;
    },
    setLocale: mockSetLocale,
  }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mountModal() {
  return mount(LocaleModal, {
    attachTo: document.body,
    global: { plugins: [makeI18n()] },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCurrentLocale = "en";
});

// ─── Rendering ────────────────────────────────────────────────────────────────

describe("LocaleModal — rendering", () => {
  it("renders one .locale-button per supported locale", () => {
    const wrapper = mountModal();
    expect(wrapper.findAll(".locale-button")).toHaveLength(
      SUPPORTED_LOCALES.length,
    );
  });

  it("the active locale's button has the .active class", () => {
    const wrapper = mountModal();
    const active = wrapper
      .findAll(".locale-button")
      .filter((b) => b.classes("active"));
    expect(active).toHaveLength(1);
    expect(active[0].text()).toBe("English");
  });
});

// ─── Locale selection ─────────────────────────────────────────────────────────

describe("LocaleModal — locale selection", () => {
  it("clicking a locale button calls setLocale with the correct code", async () => {
    const wrapper = mountModal();
    const frBtn = wrapper
      .findAll(".locale-button")
      .find((b) => b.text() === "Français");
    await frBtn!.trigger("click");
    expect(mockSetLocale).toHaveBeenCalledOnce();
    expect(mockSetLocale).toHaveBeenCalledWith("fr");
  });

  it("clicking a locale button emits close", async () => {
    const wrapper = mountModal();
    await wrapper.findAll(".locale-button")[1].trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});

// ─── Dismissal ────────────────────────────────────────────────────────────────

describe("LocaleModal — dismissal", () => {
  it("clicking the .close-button emits close", async () => {
    const wrapper = mountModal();
    await wrapper.find(".close-button").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("clicking the backdrop emits close", async () => {
    const wrapper = mountModal();
    await wrapper.find(".backdrop").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("pressing Escape emits close", async () => {
    const wrapper = mountModal();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});
