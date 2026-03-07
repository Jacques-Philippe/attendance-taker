import client from "./client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
} from "../types/user";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await client.post<LoginResponse>("/auth/login", credentials);
  return response.data;
}

export async function logout(): Promise<void> {
  await client.post("/auth/logout");
}

export async function getMe(): Promise<User> {
  const response = await client.get<User>("/auth/me");
  return response.data;
}

export async function register(credentials: RegisterRequest): Promise<User> {
  const response = await client.post<User>("/auth/register", credentials);
  return response.data;
}
