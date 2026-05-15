"use client";

import type { ReactNode } from "react";

import { Sidebar, type SidebarItem } from "@/components/Sidebar";
import {
  DashboardIcon,
  QrIcon,
  VendorIcon,
} from "@/components/Icons";
import { RequireRole } from "@/lib/auth";

const ADMIN_NAV: SidebarItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  { href: "/admin/vendors", label: "Manage Vendor", icon: <VendorIcon /> },
  { href: "/admin/qr", label: "Generate QR", icon: <QrIcon /> },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="super_admin">
      <div className="flex min-h-screen">
        <Sidebar items={ADMIN_NAV} />
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="mx-auto max-w-[1400px] px-6 py-6 lg:px-10 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </RequireRole>
  );
}
