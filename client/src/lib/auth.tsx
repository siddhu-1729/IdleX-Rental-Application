"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { api, getStoredUser, setStoredUser, setToken, clearAuth } from "@/lib/api-client";
import type { ApiError } from "@/lib/api-client";
import type { AuthResult, User } from "@/lib/api-types";
import { ROUTES } from "@/lib/constants";

type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
};

export type RegisterPayload = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  becomeOwner?: boolean;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(() => getStoredUser<User>());

  const login = React.useCallback(async (email: string, password: string) => {
    const result = await api.post<AuthResult>("/api/auth/login", { email, password });
    setToken(result.accessToken);
    setStoredUser(result.user);
    setUser(result.user);
    return result.user;
  }, []);

  const register = React.useCallback(async (payload: RegisterPayload) => {
    const result = await api.post<AuthResult>("/api/auth/register", {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
    });
    setToken(result.accessToken);
    setStoredUser(result.user);
    setUser(result.user);

    if (payload.becomeOwner) {
      const updated = await api.patch<User>("/api/auth/me", { becomeOwner: true });
      setStoredUser(updated);
      setUser(updated);
      return updated;
    }
    return result.user;
  }, []);

  const refreshUser = React.useCallback(async () => {
    const fresh = await api.get<User>("/api/auth/me");
    setStoredUser(fresh);
    setUser(fresh);
    return fresh;
  }, []);

  const logout = React.useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useErrorMessage(error: Error | null): string {
  return React.useMemo(() => (error instanceof Error ? error.message : ""), [error]);
}

/**
 * Client-side auth guard. Renders children once a user is loaded; if no
 * token exists it redirects to /login and shows a loading placeholder.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (getStoredUser<User>() && !user) {
      refreshUser().catch(() => clearAuth());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!user) router.replace(ROUTES.LOGIN);
  }, [user, router]);

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }
  return <>{children}</>;
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof Error && "status" in err;
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
