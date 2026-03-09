import client from "./client";
import type {
  AttendanceSession,
  AttendanceSessionCreate,
  AttendanceSessionDetail,
} from "../types/attendance";

export async function submitAttendance(
  data: AttendanceSessionCreate,
): Promise<AttendanceSessionDetail> {
  // Backend request schemas use snake_case field names
  const response = await client.post<AttendanceSessionDetail>(
    "/attendance/sessions",
    {
      class_id: data.classId,
      date: data.date,
      records: data.records.map((r) => ({
        student_id: r.studentId,
        status: r.status,
      })),
    },
  );
  return response.data;
}

export async function listSessions(params?: {
  classId?: number;
  date?: string;
}): Promise<AttendanceSession[]> {
  const response = await client.get<AttendanceSession[]>(
    "/attendance/sessions",
    {
      params: {
        ...(params?.classId !== undefined && { class_id: params.classId }),
        ...(params?.date !== undefined && { date: params.date }),
      },
    },
  );
  return response.data;
}
