export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecordDraft {
  studentId: number;
  status: AttendanceStatus;
}

export interface AttendanceRecordCreate {
  studentId: number;
  status: AttendanceStatus;
}

export interface AttendanceSessionCreate {
  classId: number;
  date: string;
  records: AttendanceRecordCreate[];
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  status: AttendanceStatus;
}

export interface AttendanceSession {
  id: number;
  classId: number;
  date: string;
  period: string;
  takenBy: number;
  createdAt: string;
}

export interface AttendanceSessionDetail extends AttendanceSession {
  records: AttendanceRecord[];
}

export interface StudentAttendanceSummary {
  studentId: number;
  studentName: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

export interface ClassReport {
  classId: number;
  className: string;
  period: string;
  totalSessions: number;
  students: StudentAttendanceSummary[];
}

export interface StudentSessionRecord {
  sessionId: number;
  date: string;
  period: string;
  status: AttendanceStatus;
}

export interface StudentHistory {
  studentId: number;
  studentName: string;
  classId: number;
  className: string;
  records: StudentSessionRecord[];
}
