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

// Browser requests should stay same-origin and use Next rewrites,
// which avoids CORS preflight failures against localhost:3001.
const baseURL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_URL ?? ""
    : "";
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
