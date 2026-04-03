import axios, { AxiosError } from "axios";
import type { NoeyError } from "@/types/noey";


const WP_API = process.env.NEXT_PUBLIC_WP_API;  // e.g. http://noeyai.local/wp-json

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



export async function getSliderMessages() {
  const res = await fetch(`${WP_API}/noeyai/v1/messages`, {
    next: { revalidate: 3600 }, // cache for 1 hour, Next.js ISR
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getSiteSettings() {
  const res = await fetch(`${WP_API}/noeyai/v1/site`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return {};
  return res.json();
}
