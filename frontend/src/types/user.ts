export type UserRole = "admin" | "teacher" | "student";

export interface User {
  id: number;
  username: string;
  role: UserRole | string; // backend persists role as an unconstrained string
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

export interface RegisterRequest {
  username: string;
  password: string;
}
