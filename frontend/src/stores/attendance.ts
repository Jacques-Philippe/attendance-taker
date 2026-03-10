import axios from "axios";
import { defineStore } from "pinia";
import { ref } from "vue";
import * as attendanceApi from "../api/attendance";
import type {
  AttendanceSession,
  AttendanceSessionCreate,
  AttendanceSessionDetail,
  ClassReport,
  StudentHistory,
} from "../types/attendance";

export const useAttendanceStore = defineStore("attendance", () => {
  const sessions = ref<AttendanceSession[]>([]);
  const currentSession = ref<AttendanceSessionDetail | null>(null);
  const reports = ref<ClassReport | null>(null);
  const studentHistory = ref<StudentHistory | null>(null);
  const loading = ref(false);
  const submitting = ref(false);
  const error = ref<string | null>(null);

  async function fetchSessions(params?: {
    classId?: number;
    date?: string;
  }): Promise<void> {
    error.value = null;
    try {
      sessions.value = await attendanceApi.listSessions(params);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to load sessions";
    }
  }

  async function submitAttendance(
    data: AttendanceSessionCreate,
  ): Promise<AttendanceSessionDetail | null> {
    submitting.value = true;
    error.value = null;
    try {
      return await attendanceApi.submitAttendance(data);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        error.value =
          "Attendance for this class on this date has already been submitted";
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to submit attendance";
      }
      return null;
    } finally {
      submitting.value = false;
    }
  }

  async function fetchSession(id: number): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      currentSession.value = await attendanceApi.getSession(id);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to load session";
    } finally {
      loading.value = false;
    }
  }

  async function fetchReports(classId: number): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      reports.value = await attendanceApi.getReports(classId);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to load reports";
    } finally {
      loading.value = false;
    }
  }

  async function fetchStudentHistory(studentId: number): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      studentHistory.value = await attendanceApi.getStudentHistory(studentId);
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to load student history";
    } finally {
      loading.value = false;
    }
  }

  return {
    sessions,
    currentSession,
    reports,
    studentHistory,
    loading,
    submitting,
    error,
    fetchSessions,
    submitAttendance,
    fetchSession,
    fetchReports,
    fetchStudentHistory,
  };
});
