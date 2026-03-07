import axios from "axios";

const client = axios.create({
  baseURL: "/api",
  withCredentials: true, // send session cookie with every request
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor — TODO Phase 2: redirect to /login on 401
client.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

export default client;
