export type UserRole = "admin" | "teacher" | "student";

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}
