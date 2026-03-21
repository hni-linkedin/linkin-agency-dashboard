import axios, { type AxiosError } from "axios";
import { getToken } from "@/lib/auth";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number | null,
  ) {
    super(message);
    this.name = "ApiError";
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

const publicApiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

/**
 * Base URL for axios:
 * - **Server:** always `NEXT_PUBLIC_API_URL` (direct to the API).
 * - **Browser (development):** `""` — same-origin `/api/*` + Next.js rewrites to the backend (avoids CORS for localhost:3000 → :3001).
 * - **Browser (production):** `NEXT_PUBLIC_API_URL` — direct to the API; the API must allow CORS for the dashboard origin.
 */
function getAxiosBaseURL(): string {
  if (typeof window === "undefined") {
    return publicApiUrl;
  }
  if (process.env.NODE_ENV === "development") {
    return "";
  }
  return publicApiUrl;
}

const baseURL = getAxiosBaseURL();
const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";

const axiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const url = config.url ?? "";
  const isAuthRoute = url.startsWith("/api/auth/");

  if (apiKey && !isAuthRoute) {
    config.headers["x-api-key"] = apiKey;
  } else if (config.headers && "x-api-key" in config.headers) {
    delete config.headers["x-api-key"];
  }

  const token = getToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const message =
      error.response?.data?.message ??
      error.response?.data?.error ??
      (error.message || "Request failed");
    const statusCode = error.response?.status ?? null;
    throw new ApiError(message, statusCode);
  },
);

export default axiosInstance;
