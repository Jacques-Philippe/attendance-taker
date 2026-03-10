import client from "./client";
import type {
  AttendanceSession,
  AttendanceSessionCreate,
  AttendanceSessionDetail,
  ClassReport,
  StudentHistory,
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

export async function getSession(id: number): Promise<AttendanceSessionDetail> {
  const response = await client.get<AttendanceSessionDetail>(
    `/attendance/sessions/${id}`,
  );
  return response.data;
}

export async function getReports(classId: number): Promise<ClassReport> {
  const response = await client.get<ClassReport>("/attendance/reports", {
    params: { class_id: classId },
  });
  return response.data;
}

export async function getStudentHistory(
  studentId: number,
): Promise<StudentHistory> {
  const response = await client.get<StudentHistory>(
    `/attendance/student/${studentId}`,
  );
  return response.data;
}

export async function downloadReportsCsv(classId: number): Promise<void> {
  const response = await client.get("/attendance/reports/export", {
    params: { class_id: classId },
    responseType: "blob",
  });
  const url = URL.createObjectURL(response.data as Blob);
  const a = document.createElement("a");
  const disposition = (response.headers["content-disposition"] as string) ?? "";
  const match = disposition.match(/filename="([^"]+)"/);
  a.href = url;
  a.download = match ? match[1] : `report_${classId}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
