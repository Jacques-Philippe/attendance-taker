export const PATHS = {
  dashboard: "/",
  login: "/login",
  register: "/register",
  classes: "/classes",
  attendance: "/attendance",
  history: "/history",
  reports: "/reports",
  studentRecord: (id: number | string) => `/students/${id}`,
  studentRecordPattern: "/students/:id",
} as const;
