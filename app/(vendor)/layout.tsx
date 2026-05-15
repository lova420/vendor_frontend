"use client";

import type { ReactNode } from "react";

import { CarIcon, DashboardIcon, UsersIcon } from "@/components/Icons";
import { Sidebar, type SidebarItem } from "@/components/Sidebar";
import { RequireRole } from "@/lib/auth";

const VENDOR_NAV: SidebarItem[] = [
  { href: "/vendor/customers", label: "Customers", icon: <UsersIcon /> },
  { href: "/vendor/cars", label: "Cars", icon: <CarIcon /> },
  { href: "/vendor/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
];

export default function VendorLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="vendor_admin">
      <div className="flex min-h-screen">
        <Sidebar items={VENDOR_NAV} />
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="mx-auto max-w-[1400px] px-6 py-6 lg:px-10 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </RequireRole>
  );
}
