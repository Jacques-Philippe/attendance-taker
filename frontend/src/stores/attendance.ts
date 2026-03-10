import axios from "axios";
import { defineStore } from "pinia";
import { ref } from "vue";
import * as attendanceApi from "../api/attendance";
import type {
  AttendanceSession,
  AttendanceSessionCreate,
  AttendanceSessionDetail,
} from "../types/attendance";

export const useAttendanceStore = defineStore("attendance", () => {
  const sessions = ref<AttendanceSession[]>([]);
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

  return {
    sessions,
    submitting,
    error,
    fetchSessions,
    submitAttendance,
  };
});
