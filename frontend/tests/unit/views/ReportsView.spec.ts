import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import ReportsView from "@/views/ReportsView.vue";
import { makeRouter, makeI18n } from "../../utils";

const { mockFetchReports } = vi.hoisted(() => ({
  mockFetchReports: vi.fn().mockResolvedValue(undefined),
}));

const cls1 = { id: 1, name: "Biology", period: "2nd", teacherId: 5 };

const reportData = {
  classId: 1,
  className: "Biology",
  period: "2nd",
  totalSessions: 2,
  students: [
    {
      studentId: 100,
      studentName: "Alice",
      total: 2,
      present: 2,
      absent: 0,
      late: 0,
      excused: 0,
    },
    {
      studentId: 101,
      studentName: "Bob",
      total: 2,
      present: 1,
      absent: 1,
      late: 0,
      excused: 0,
    },
  ],
};

let mockReports: typeof reportData | null = null;

vi.mock("@/stores/attendance", () => ({
  useAttendanceStore: () => ({
    get reports() {
      return mockReports;
    },
    loading: false,
    error: null,
    fetchReports: mockFetchReports,
  }),
}));

vi.mock("@/stores/classes", () => ({
  useClassesStore: () => ({
    classes: [cls1],
    fetchClasses: vi.fn(),
  }),
}));

function mountView() {
  return mount(ReportsView, {
    global: {
      plugins: [
        makeRouter({ path: "/reports", component: ReportsView }),
        makeI18n(),
      ],
    },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockReports = null;
});

// ─── Rendering ────────────────────────────────────────────────────────────────

describe("ReportsView — rendering", () => {
  it("shows placeholder before a class is selected", () => {
    const wrapper = mountView();
    expect(wrapper.find(".muted").text()).toContain("Select a class");
    expect(wrapper.find("table").exists()).toBe(false);
  });
});

// ─── Interaction ──────────────────────────────────────────────────────────────

describe("ReportsView — interaction", () => {
  async function mountWithReport() {
    mockReports = reportData;
    const wrapper = mountView();
    await wrapper.find("select").setValue(String(cls1.id));
    await flushPromises();
    return wrapper;
  }

  it("calls fetchReports with the selected class id after class selection", async () => {
    const wrapper = mountView();
    await wrapper.find("select").setValue(String(cls1.id));
    await flushPromises();
    expect(mockFetchReports).toHaveBeenCalledWith(cls1.id);
  });

  it("renders stat cards and student table after class selection", async () => {
    const wrapper = await mountWithReport();
    expect(wrapper.findAll(".stat-card")).toHaveLength(2);
    expect(wrapper.findAll("tbody tr")).toHaveLength(
      reportData.students.length,
    );
  });

  it("student name links point to /students/:id", async () => {
    const wrapper = await mountWithReport();
    const links = wrapper.findAll(".student-link");
    expect(links[0].attributes("href")).toContain(
      `/students/${reportData.students[0].studentId}`,
    );
    expect(links[1].attributes("href")).toContain(
      `/students/${reportData.students[1].studentId}`,
    );
  });
});
