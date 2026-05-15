"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSession } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useSession();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
    } else if (user.user_type === "super_admin") {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/vendor/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex h-screen items-center justify-center text-muted">
      Redirecting…
    </div>
  );
}
