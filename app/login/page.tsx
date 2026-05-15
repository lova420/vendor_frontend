"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ArrowRightIcon } from "@/components/Icons";
import { useSession } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import type { LoginResponse } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !user) return;
    router.replace(
      user.user_type === "super_admin" ? "/admin/dashboard" : "/vendor/dashboard"
    );
  }, [user, isLoading, router]);

  const login = useMutation({
    mutationFn: async (vars: { email: string; password: string }) =>
      apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: vars,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(["session"], data.user);
      router.replace(
        data.user.user_type === "super_admin" ? "/admin/dashboard" : "/vendor/dashboard"
      );
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("Invalid email or password.");
        } else if (err.status === 429) {
          setError("Too many attempts. Try again in a minute.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } else {
        setError("Could not reach the server.");
      }
    },
  });

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-8 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-purple/5 blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-teal/5 blur-[128px] pointer-events-none" />

      <div className="relative w-full max-w-md animate-fadeInUp">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="animate-float">
            <Image
              src="/logo.png"
              alt="MagickVoice Logo"
              width={64}
              height={64}
              className="drop-shadow-[0_0_16px_rgba(168,85,247,0.3)]"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-100">
            Magick<span className="bg-gradient-to-r from-brand-purple to-blue-400 bg-clip-text text-transparent">Voice</span>
          </span>
        </div>

        <div className="relative surface-glass p-8 shadow-2xl">
          {/* Gradient accent at top */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-brand-purple/50 to-transparent" />

          <h1 className="text-xl font-bold text-white">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted">
            Sign in to your MagickVoice workspace.
          </p>

          <form
            className="mt-7 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              login.mutate({ email: email.trim().toLowerCase(), password });
            }}
          >
            <div>
              <label htmlFor="email" className="label-base">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="input-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="label-base">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger flex items-center gap-2 animate-fadeIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="pill-primary w-full py-3"
              disabled={login.isPending}
            >
              {login.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRightIcon />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-dim">
          Need help? Contact your workspace administrator.
        </p>
      </div>
    </main>
  );
}
