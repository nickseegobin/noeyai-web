import axios, { AxiosError } from "axios";
import type { NoeyError } from "@/types/noey";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("noey_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("noey_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;

export function getApiError(err: unknown): NoeyError {
  if (err instanceof AxiosError && err.response?.data) {
    return err.response.data as NoeyError;
  }
  return { code: "unknown", message: "An unexpected error occurred." };
}
