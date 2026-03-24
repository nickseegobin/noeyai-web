"use client";
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import api, { getApiError } from "@/lib/api";
import type { NoeyUser } from "@/types/noey";

interface AuthContextValue {
  user: NoeyUser | null;
  loading: boolean;
  login: (token: string, userData: NoeyUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setActiveChild: (childId: number | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<NoeyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const init = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("noey_token") : null;
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.data);
    } catch {
      localStorage.removeItem("noey_token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { init(); }, [init]);

  const login = useCallback((token: string, userData: NoeyUser) => {
    localStorage.setItem("noey_token", token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("noey_token");
    setUser(null);
    router.push("/");
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.data);
    } catch { /* handled by interceptor */ }
  }, []);

  const setActiveChild = useCallback((childId: number | null) => {
    setUser((prev) => prev ? { ...prev, active_child_id: childId } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, setActiveChild }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
