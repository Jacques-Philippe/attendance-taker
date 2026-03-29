import axios from "axios";
import { PATHS } from "../router/paths";

const client = axios.create({
  baseURL: "/api",
  withCredentials: true, // send session cookie with every request
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? "";

    const isSessionBootstrap = url.includes("/auth/me");
    const isLoginAttempt = url.includes("/auth/login");

    if (
      status === 401 &&
      !isSessionBootstrap &&
      !isLoginAttempt &&
      !window.location.pathname.endsWith(PATHS.login)
    ) {
      window.location.href = PATHS.login;
    }

    return Promise.reject(error);
  },
);

export default client;
