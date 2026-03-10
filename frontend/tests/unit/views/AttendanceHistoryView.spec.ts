import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import AttendanceHistoryView from "@/views/AttendanceHistoryView.vue";
import { makeRouter } from "../../utils";

const { mockFetchSessions, mockFetchSession } = vi.hoisted(() => ({
  mockFetchSessions: vi.fn().mockResolvedValue(undefined),
  mockFetchSession: vi.fn().mockResolvedValue(undefined),
}));

const sessions = [
  {
    id: 10,
    classId: 1,
    date: "2026-02-01",
    period: "1st",
    takenBy: 5,
    createdAt: "",
  },
  {
    id: 11,
    classId: 1,
    date: "2026-02-02",
    period: "1st",
    takenBy: 5,
    createdAt: "",
  },
];

const sessionDetail = {
  ...sessions[0],
  records: [
    { id: 1, studentId: 100, status: "present" },
    { id: 2, studentId: 101, status: "absent" },
  ],
};

let mockCurrentSession: typeof sessionDetail | null = null;
let mockAttendanceError: string | null = null;

vi.mock("@/stores/attendance", () => ({
  useAttendanceStore: () => ({
    sessions,
    get currentSession() {
      return mockCurrentSession;
    },
    loading: false,
    get error() {
      return mockAttendanceError;
    },
    fetchSessions: mockFetchSessions,
    fetchSession: mockFetchSession,
  }),
}));

vi.mock("@/stores/classes", () => ({
  useClassesStore: () => ({
    classes: [{ id: 1, name: "Math", period: "1st", teacherId: 5 }],
    fetchClasses: vi.fn(),
  }),
}));

function mountView() {
  return mount(AttendanceHistoryView, {
    global: {
      plugins: [
        makeRouter({ path: "/history", component: AttendanceHistoryView }),
      ],
    },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCurrentSession = null;
  mockAttendanceError = null;
});

// ─── Rendering ────────────────────────────────────────────────────────────────

describe("AttendanceHistoryView — rendering", () => {
  it("renders the session list table", async () => {
    const wrapper = mountView();
    await flushPromises();
    expect(wrapper.findAll("tbody tr")).toHaveLength(sessions.length);
  });

  it("calls fetchSessions on mount", async () => {
    mountView();
    await flushPromises();
    expect(mockFetchSessions).toHaveBeenCalledOnce();
  });

  it("displays error when attendanceStore.error is set", () => {
    mockAttendanceError = "Network error";
    const wrapper = mountView();
    expect(wrapper.find(".error").text()).toBe("Network error");
  });
});

// ─── Interaction ──────────────────────────────────────────────────────────────

describe("AttendanceHistoryView — interaction", () => {
  it("clicking a session row calls fetchSession with that session's id", async () => {
    const wrapper = mountView();
    await flushPromises();
    await wrapper.findAll("tbody tr")[0].trigger("click");
    expect(mockFetchSession).toHaveBeenCalledWith(sessions[0].id);
  });

  it("shows detail panel after clicking a row and currentSession is populated", async () => {
    mockCurrentSession = sessionDetail;
    const wrapper = mountView();
    await flushPromises();
    await wrapper.findAll("tbody tr")[0].trigger("click");
    await flushPromises();
    expect(wrapper.find(".detail-panel").exists()).toBe(true);
    expect(wrapper.find(".detail-panel").findAll("tbody tr")).toHaveLength(
      sessionDetail.records.length,
    );
  });
});
