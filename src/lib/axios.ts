import axios, { type AxiosError } from "axios";

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

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "";
const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";

const axiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
  },
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ message?: string }>) => {
    const message =
      error.response?.data?.message ??
      (error.message || "Request failed");
    const statusCode = error.response?.status ?? null;
    throw new ApiError(message, statusCode);
  },
);

export default axiosInstance;
