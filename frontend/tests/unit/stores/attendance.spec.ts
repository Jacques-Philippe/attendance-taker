import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAttendanceStore } from "@/stores/attendance";
import type {
  AttendanceSession,
  AttendanceSessionCreate,
  AttendanceSessionDetail,
} from "@/types/attendance";

const { mockSubmitAttendance, mockListSessions } = vi.hoisted(() => ({
  mockSubmitAttendance: vi.fn(),
  mockListSessions: vi.fn(),
}));

vi.mock("@/api/attendance", () => ({
  submitAttendance: mockSubmitAttendance,
  listSessions: mockListSessions,
}));

const session: AttendanceSession = {
  id: 1,
  classId: 1,
  date: "2026-01-15",
  period: "1st",
  takenBy: 10,
  createdAt: "2026-01-15T10:00:00Z",
};

const sessionDetail: AttendanceSessionDetail = {
  ...session,
  records: [{ id: 1, studentId: 100, status: "present" }],
};

const createData: AttendanceSessionCreate = {
  classId: 1,
  date: "2026-01-15",
  records: [{ studentId: 100, status: "present" }],
};

beforeEach(() => {
  vi.clearAllMocks();
  setActivePinia(createPinia());
});

// ─── fetchSessions ────────────────────────────────────────────────────────────

describe("useAttendanceStore — fetchSessions()", () => {
  it("populates sessions and clears error on success", async () => {
    mockListSessions.mockResolvedValueOnce([session]);
    const store = useAttendanceStore();
    await store.fetchSessions();
    expect(store.sessions).toEqual([session]);
    expect(store.error).toBeNull();
  });

  it("sets error on API failure", async () => {
    mockListSessions.mockRejectedValueOnce(new Error("Network error"));
    const store = useAttendanceStore();
    await store.fetchSessions();
    expect(store.error).toBe("Network error");
    expect(store.sessions).toEqual([]);
  });
});

// ─── submitAttendance ─────────────────────────────────────────────────────────

describe("useAttendanceStore — submitAttendance()", () => {
  it("calls api and returns session detail", async () => {
    mockSubmitAttendance.mockResolvedValueOnce(sessionDetail);
    const store = useAttendanceStore();
    const result = await store.submitAttendance(createData);
    expect(mockSubmitAttendance).toHaveBeenCalledWith(createData);
    expect(result).toEqual(sessionDetail);
    expect(store.submitting).toBe(false);
    expect(store.error).toBeNull();
  });

  it("sets duplicate-session message on 409 and returns null", async () => {
    const err = Object.assign(new Error("Conflict"), {
      isAxiosError: true,
      response: { status: 409 },
    });
    mockSubmitAttendance.mockRejectedValueOnce(err);
    const store = useAttendanceStore();
    const result = await store.submitAttendance(createData);
    expect(result).toBeNull();
    expect(store.error).toBe(
      "Attendance for this class on this date has already been submitted",
    );
    expect(store.submitting).toBe(false);
  });

  it("sets error message on other API failure and returns null", async () => {
    mockSubmitAttendance.mockRejectedValueOnce(new Error("Server error"));
    const store = useAttendanceStore();
    const result = await store.submitAttendance(createData);
    expect(result).toBeNull();
    expect(store.error).toBe("Server error");
    expect(store.submitting).toBe(false);
  });
});
