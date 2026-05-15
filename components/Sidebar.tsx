"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { ChevronLeftIcon } from "@/components/Icons";
import { Logo } from "@/components/Logo";
import { useLogout, useSession } from "@/lib/auth";

export interface SidebarItem {
  href: string;
  label: string;
  icon: ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
}

const COLLAPSED_STORAGE_KEY = "sidebar-collapsed";

function isActive(pathname: string, href: string) {
  if (href === pathname) return true;
  return pathname.startsWith(href + "/");
}

export function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useSession();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Collapsed only applies to the desktop sidebar. Persisted to localStorage
  // so the user's preference survives navigation and reloads. Initial render
  // is always expanded to avoid SSR/CSR mismatch; the saved value is read in
  // an effect.
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(COLLAPSED_STORAGE_KEY) === "true") {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(COLLAPSED_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const renderInner = (compact: boolean, isMobileDrawer: boolean) => (
    <>
      {/* Header: logo (when expanded) + close (mobile) / toggle (desktop) */}
      <div
        className={`flex items-center py-6 ${
          compact ? "justify-center px-3" : "justify-between px-5"
        }`}
      >
        {!compact && <Logo />}
        {isMobileDrawer ? (
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted hover:bg-white/5 hover:text-zinc-200"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-white/5 hover:text-zinc-200 transition-colors"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={compact ? "Expand sidebar" : "Collapse sidebar"}
            title={compact ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeftIcon
              className={`transition-transform duration-200 ${
                compact ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>

      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Navigation */}
      <nav className={`flex-1 space-y-1 py-4 ${compact ? "px-2" : "px-3"}`}>
        {items.map((item, index) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={compact ? item.label : undefined}
              className={`group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200 animate-slideInLeft stagger-${index + 1} ${
                compact ? "justify-center px-2 py-2.5" : "gap-3 px-3.5 py-2.5"
              } ${
                active
                  ? "bg-gradient-to-r from-brand-purple/20 to-brand-purple/5 text-white shadow-[inset_0_0_0_1px_rgba(168,85,247,0.2)]"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-brand-purple to-brand-teal" />
              )}
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                  active
                    ? "bg-brand-purple/20 text-brand-teal shadow-[0_0_12px_rgba(45,212,191,0.2)]"
                    : "text-muted group-hover:text-zinc-300 group-hover:bg-white/[0.04]"
                }`}
              >
                {item.icon}
              </span>
              {!compact && (
                <span className="relative">
                  {item.label}
                  {active && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-brand-purple/50 to-transparent" />
                  )}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* User area */}
      <div className={`py-4 ${compact ? "px-2" : "px-4"}`}>
        {user && !compact && (
          <div className="mb-3 rounded-xl bg-white/[0.03] px-3 py-2.5 border border-white/[0.04]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple/30 to-brand-teal/20 text-xs font-bold text-white uppercase">
                {user.email.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-zinc-200">
                  {user.email}
                </div>
                <div className="text-[11px] text-muted-dim capitalize">
                  {user.user_type.replace("_", " ")}
                </div>
              </div>
            </div>
          </div>
        )}
        {user && compact && (
          <div
            className="mb-3 flex h-9 w-9 mx-auto items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple/30 to-brand-teal/20 text-xs font-bold text-white uppercase"
            title={user.email}
          >
            {user.email.charAt(0)}
          </div>
        )}
        <button
          type="button"
          onClick={() => void logout()}
          className={`pill-ghost text-xs ${compact ? "w-9 h-9 mx-auto justify-center px-0" : "w-full"}`}
          title={compact ? "Log out" : undefined}
          aria-label="Log out"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!compact && "Log out"}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar (visible <lg) */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.06] bg-bg-elevated/80 px-4 py-3 backdrop-blur-xl">
        <Logo size="small" />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-zinc-300 hover:bg-white/5"
          aria-label="Open menu"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Desktop sidebar (lg+) */}
      <aside
        className={`hidden lg:sticky lg:top-0 lg:flex h-screen shrink-0 flex-col border-r border-white/[0.06] bg-gradient-to-b from-bg-elevated/90 to-bg-elevated/60 backdrop-blur-xl transition-[width] duration-200 ease-out ${
          collapsed ? "lg:w-[76px]" : "lg:w-[272px]"
        }`}
      >
        {renderInner(collapsed, false)}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] max-w-[85vw] flex-col border-r border-white/[0.08] bg-gradient-to-b from-bg-elevated to-bg-elevated/95 shadow-2xl animate-slideInLeft">
            {renderInner(false, true)}
          </aside>
        </div>
      )}
    </>
  );
}
