"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { DownloadIcon, SearchIcon } from "@/components/Icons";
import { PageHeader } from "@/components/PageHeader";
import { apiFetch, customersCsvUrl } from "@/lib/api";
import {
  BUDGET_OPTIONS,
  BUY_IN_OPTIONS,
  type Budget,
  type BuyIn,
  type PaginatedCustomers,
} from "@/lib/types";

export default function VendorCustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [budget, setBudget] = useState<Budget | null>(null);
  const [buyIn, setBuyIn] = useState<BuyIn | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data, isLoading } = useQuery({
    queryKey: [
      "vendor",
      "customers",
      { page, search, budget, buyIn, sortOrder },
    ],
    queryFn: () =>
      apiFetch<PaginatedCustomers>("/vendor/customers", {
        query: {
          page,
          page_size: 20,
          search: search || undefined,
          budget: budget || undefined,
          looking_to_buy_in: buyIn || undefined,
          sort_order: sortOrder,
        },
      }),
  });

  const total = data?.total ?? 0;
  const pageSize = data?.page_size ?? 20;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle={`${total} lead${total === 1 ? "" : "s"}`}
        actions={
          <a
            href={customersCsvUrl({
              search,
              budget: budget ?? undefined,
              looking_to_buy_in: buyIn ?? undefined,
            })}
            className="pill-ghost"
          >
            <DownloadIcon /> Export CSV
          </a>
        }
      />

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-2 animate-fadeInUp stagger-1">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                setSearch(searchDraft.trim());
              }
            }}
            placeholder="Search by name or phone…"
            className="input-base pl-10"
          />
        </div>
        <button
          type="button"
          className="pill-ghost"
          onClick={() => {
            setPage(1);
            setSearch(searchDraft.trim());
          }}
        >
          Search
        </button>

        <select
          className="input-base w-auto min-w-[140px]"
          value={budget ?? ""}
          onChange={(e) => {
            setPage(1);
            setBudget((e.target.value || null) as Budget | null);
          }}
        >
          <option value="">All budgets</option>
          {BUDGET_OPTIONS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          className="input-base w-auto min-w-[150px]"
          value={buyIn ?? ""}
          onChange={(e) => {
            setPage(1);
            setBuyIn((e.target.value || null) as BuyIn | null);
          }}
        >
          <option value="">All timeframes</option>
          {BUY_IN_OPTIONS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="pill-ghost"
          onClick={() => setSortOrder((o) => (o === "desc" ? "asc" : "desc"))}
        >
          Created · {sortOrder === "desc" ? "Newest" : "Oldest"}
        </button>
      </div>

      {/* Table */}
      <div className="surface overflow-hidden animate-fadeInUp stagger-2">
        <table className="w-full text-sm">
          <thead className="bg-bg-inset/50 text-[11px] uppercase tracking-widest text-muted">
            <tr>
              <th className="px-5 py-3.5 text-left font-semibold">Name</th>
              <th className="px-5 py-3.5 text-left font-semibold">Contact Number</th>
              <th className="px-5 py-3.5 text-left font-semibold">Budget</th>
              <th className="px-5 py-3.5 text-left font-semibold">Looking to Buy In</th>
              <th className="px-5 py-3.5 text-left font-semibold">Created At</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-muted-dim">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
                    </svg>
                    Loading…
                  </div>
                </td>
              </tr>
            )}
            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-muted-dim">
                  <div className="flex flex-col items-center gap-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-dim/50">
                      <circle cx="9" cy="8" r="3.5" />
                      <path d="M2.5 21c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
                    </svg>
                    No customers match these filters.
                  </div>
                </td>
              </tr>
            )}
            {data?.items.map((c, idx) => (
              <tr
                key={c.id}
                className={`border-t border-border-subtle table-row-hover animate-fadeInUp stagger-${Math.min(idx + 1, 6)}`}
              >
                <td className="px-5 py-3.5 font-medium text-zinc-100">{c.name}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-zinc-400">{c.contact_number}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center rounded-full bg-brand-purple/10 px-2.5 py-0.5 text-xs font-medium text-brand-purple">
                    {c.budget}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center rounded-full bg-brand-teal/10 px-2.5 py-0.5 text-xs font-medium text-brand-teal">
                    {c.looking_to_buy_in}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-muted-dim text-xs">
                  {new Date(c.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm text-muted animate-fadeIn">
          <span className="text-xs">
            Page <span className="font-semibold text-zinc-200">{page}</span> of{" "}
            <span className="font-semibold text-zinc-200">{pageCount}</span>
          </span>
          <div className="flex gap-2">
            <button
              className="pill-ghost text-xs"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Previous
            </button>
            <button
              className="pill-ghost text-xs"
              disabled={page === pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
