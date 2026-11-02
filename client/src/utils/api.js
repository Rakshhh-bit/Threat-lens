import axios from "axios";
import { API_BASE_URL } from "./config";

console.log("API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((req) => {
  const url = req.url || "";
  const isAuthRoute =
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/forgot-password") ||
    url.includes("/auth/reset-password");

  // For public auth endpoints, do not attach Authorization header
  if (isAuthRoute) {
    delete req.headers.Authorization;
    return req;
  }

  const token = localStorage.getItem("token");
  if (token && typeof token === "string" && token.trim() !== "" && token !== "null" && token !== "undefined") {
    const cleanToken = token.trim();
    if (cleanToken.length < 4096) {
      req.headers.Authorization = `Bearer ${cleanToken}`;
    } else {
      console.warn("Cleared corrupted or oversized auth token from localStorage");
      localStorage.removeItem("token");
      delete req.headers.Authorization;
    }
  } else {
    delete req.headers.Authorization;
  }

  return req;
});

api.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    if (err.response?.status === 401) {
      const url = err.config?.url || "";
      const isAuthRoute =
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/verify-otp") ||
        url.includes("/auth/forgot-password") ||
        url.includes("/auth/reset-password");

      // Only purge and redirect if an authenticated API endpoint failed with 401
      if (!isAuthRoute) {
        console.warn("Session expired or invalid (401 Unauthorized). Purging stale token.");
        try {
          localStorage.removeItem("token");
          sessionStorage.removeItem("profile");
        } catch (e) {}

        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/" &&
          !window.location.pathname.startsWith("/reset/")
        ) {
          window.location.href = "/";
        }
      }
    }

    if (err.response?.status === 431) {
      console.warn("HTTP 431 Request Header Fields Too Large. Clearing stored token and stale cookies.");
      try {
        localStorage.removeItem("token");
      } catch (e) {}

      // If this was a request with Authorization header, retry once without Authorization
      if (err.config && !err.config.__is431Retry) {
        err.config.__is431Retry = true;
        if (err.config.headers) {
          delete err.config.headers.Authorization;
        }
        return api(err.config);
      }
    }
    return Promise.reject(err);
  }
);

export default api;

