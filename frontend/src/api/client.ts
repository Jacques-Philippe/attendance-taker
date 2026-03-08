import axios from "axios";

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
      !window.location.pathname.endsWith("/login")
    ) {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default client;
