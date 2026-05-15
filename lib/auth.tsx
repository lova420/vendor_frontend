"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, type ReactNode } from "react";

import { apiFetch, ApiError } from "@/lib/api";
import type { SessionUser, UserType } from "@/lib/types";

interface AuthContextValue {
  user: SessionUser | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
});

async function fetchMe(): Promise<SessionUser | null> {
  try {
    return await apiFetch<SessionUser>("/auth/me");
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}

export function useSession() {
  return useContext(AuthContext);
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // proceed even if backend logout fails — clear client state
    }
    queryClient.removeQueries({ queryKey: ["session"] });
    router.replace("/login");
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: fetchMe,
    staleTime: 60_000,
  });

  return (
    <AuthContext.Provider value={{ user: data ?? null, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

interface RequireRoleProps {
  role: UserType;
  children: ReactNode;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const router = useRouter();
  const { user, isLoading } = useSession();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.user_type !== role) {
      router.replace(user.user_type === "super_admin" ? "/admin/dashboard" : "/vendor/dashboard");
    }
  }, [user, isLoading, role, router]);

  if (isLoading || !user || user.user_type !== role) {
    return (
      <div className="flex h-screen items-center justify-center text-muted">
        Loading…
      </div>
    );
  }
  return <>{children}</>;
}
