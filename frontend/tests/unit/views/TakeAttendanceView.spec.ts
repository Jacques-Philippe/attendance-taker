import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import TakeAttendanceView from "@/views/TakeAttendanceView.vue";
import { makeRouter } from "../../utils";

const { mockFetchClass, mockSubmitAttendance } = vi.hoisted(() => ({
  mockFetchClass: vi.fn().mockResolvedValue(undefined),
  mockSubmitAttendance: vi.fn().mockResolvedValue(null),
}));

const students = [
  { id: 100, name: "Alice", classId: 1 },
  { id: 101, name: "Bob", classId: 1 },
];

const cls1 = { id: 1, name: "Math", period: "1st", teacherId: 10 };

let mockAttendanceError: string | null = null;

vi.mock("@/stores/classes", () => ({
  useClassesStore: () => ({
    classes: [cls1],
    currentClass: { ...cls1, students },
    loading: false,
    fetchClasses: vi.fn(),
    fetchClass: mockFetchClass,
  }),
}));

vi.mock("@/stores/attendance", () => ({
  useAttendanceStore: () => ({
    submitting: false,
    get error() {
      return mockAttendanceError;
    },
    set error(v: string | null) {
      mockAttendanceError = v;
    },
    submitAttendance: mockSubmitAttendance,
  }),
}));

function mountView() {
  return mount(TakeAttendanceView, {
    global: {
      plugins: [
        makeRouter({ path: "/attendance", component: TakeAttendanceView }),
      ],
    },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAttendanceError = null;
});

// ─── Rendering ────────────────────────────────────────────────────────────────

describe("TakeAttendanceView — rendering", () => {
  it("renders the ClassSelector and date input", () => {
    const wrapper = mountView();
    expect(wrapper.find("select").exists()).toBe(true);
    expect(wrapper.find('input[type="date"]').exists()).toBe(true);
  });

  it("does not render the submit button when no class is selected", () => {
    const wrapper = mountView();
    expect(wrapper.find("button.btn-primary").exists()).toBe(false);
  });

  it("renders AttendanceRoster with class students after class selection", async () => {
    const wrapper = mountView();
    await wrapper.find("select").setValue(String(cls1.id));
    await flushPromises();
    expect(mockFetchClass).toHaveBeenCalledWith(cls1.id);
    // AttendanceRoster renders a table with one tbody row per student
    expect(wrapper.findAll("tbody tr")).toHaveLength(students.length);
  });

  it("renders an error message when attendanceStore.error is set", () => {
    mockAttendanceError = "Something went wrong";
    const wrapper = mountView();
    expect(wrapper.find(".error").text()).toBe("Something went wrong");
  });
});

// ─── Submit ───────────────────────────────────────────────────────────────────

describe("TakeAttendanceView — submit", () => {
  async function mountWithRoster() {
    const wrapper = mountView();
    await wrapper.find("select").setValue(String(cls1.id));
    await flushPromises();
    return wrapper;
  }

  it("submit button is enabled once roster is loaded", async () => {
    const wrapper = await mountWithRoster();
    const btn = wrapper.find("button.btn-primary");
    expect(btn.exists()).toBe(true);
    expect(btn.attributes("disabled")).toBeUndefined();
  });

  it("clicking Submit calls submitAttendance with correct payload", async () => {
    const wrapper = await mountWithRoster();
    await wrapper.find("button.btn-primary").trigger("click");
    await flushPromises();

    expect(mockSubmitAttendance).toHaveBeenCalledOnce();
    const payload = mockSubmitAttendance.mock.calls[0][0];
    expect(payload.classId).toBe(cls1.id);
    expect(payload.records).toHaveLength(students.length);
    expect(
      payload.records.every((r: { status: string }) => r.status === "absent"),
    ).toBe(true);
  });
});
