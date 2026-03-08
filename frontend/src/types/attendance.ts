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
