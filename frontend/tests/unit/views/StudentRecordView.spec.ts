import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import StudentRecordView from "@/views/StudentRecordView.vue";
import { makeRouter, makeI18n } from "../../utils";

const { mockFetchStudentHistory } = vi.hoisted(() => ({
  mockFetchStudentHistory: vi.fn().mockResolvedValue(undefined),
}));

const history = {
  studentId: 100,
  studentName: "Alice",
  classId: 1,
  className: "Biology",
  records: [
    { sessionId: 10, date: "2026-02-02", period: "2nd", status: "late" },
    { sessionId: 9, date: "2026-02-01", period: "2nd", status: "present" },
  ],
};

vi.mock("@/stores/attendance", () => ({
  useAttendanceStore: () => ({
    studentHistory: history,
    loading: false,
    error: null,
    fetchStudentHistory: mockFetchStudentHistory,
  }),
}));

async function mountView(studentId = 100) {
  const router = makeRouter({
    path: "/students/:id",
    component: StudentRecordView,
  });
  router.push(`/students/${studentId}`);
  await router.isReady();
  return mount(StudentRecordView, {
    global: { plugins: [router, makeI18n()] },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Rendering & mounting ─────────────────────────────────────────────────────

describe("StudentRecordView", () => {
  it("calls fetchStudentHistory with the route param id on mount", async () => {
    await mountView(100);
    await flushPromises();
    expect(mockFetchStudentHistory).toHaveBeenCalledWith(100);
  });

  it("renders the student name in the heading", async () => {
    const wrapper = await mountView();
    expect(wrapper.find("h1").text()).toBe("Alice");
  });

  it("renders the class name", async () => {
    const wrapper = await mountView();
    expect(wrapper.find(".class-label").text()).toBe("Biology");
  });

  it("renders one table row per attendance record", async () => {
    const wrapper = await mountView();
    expect(wrapper.findAll("tbody tr")).toHaveLength(history.records.length);
  });
});
