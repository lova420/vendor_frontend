"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { EditIcon, PlusIcon, SearchIcon, TrashIcon } from "@/components/Icons";
import { Modal } from "@/components/Modal";
import { PageHeader } from "@/components/PageHeader";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/lib/toast";
import type { PaginatedVendors, VendorListItem } from "@/lib/types";

export default function VendorsListPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [toDelete, setToDelete] = useState<VendorListItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "vendors", { page, search }],
    queryFn: () =>
      apiFetch<PaginatedVendors>("/admin/vendors", {
        query: { page, page_size: 20, search: search || undefined },
      }),
  });

  const del = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/vendors/${id}`, { method: "DELETE" }),
    onSuccess: (_data, _id) => {
      const name = toDelete?.name;
      setToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] });
      toast.success(name ? `Vendor “${name}” deleted` : "Vendor deleted");
    },
    onError: () => toast.error("Could not delete vendor. Please try again."),
  });

  const total = data?.total ?? 0;
  const pageSize = data?.page_size ?? 20;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <PageHeader
        title="Manage Vendor"
        subtitle={`${total} vendor${total === 1 ? "" : "s"}`}
        actions={
          <Link href="/admin/vendors/new" className="pill-primary">
            <PlusIcon /> New vendor
          </Link>
        }
      />

      {/* Search bar */}
      <div className="mb-5 flex items-center gap-2 animate-fadeInUp stagger-1">
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
            placeholder="Search by name, email, or city…"
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
        {search && (
          <button
            type="button"
            className="text-xs text-muted hover:text-zinc-200 transition-colors"
            onClick={() => {
              setSearchDraft("");
              setSearch("");
              setPage(1);
            }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="surface overflow-hidden animate-fadeInUp stagger-2">
        <table className="w-full text-sm">
          <thead className="bg-bg-inset/50 text-[11px] uppercase tracking-widest text-muted">
            <tr>
              <th className="px-5 py-3.5 text-left font-semibold">Vendor Name</th>
              <th className="px-5 py-3.5 text-left font-semibold">Email</th>
              <th className="px-5 py-3.5 text-left font-semibold">City</th>
              <th className="px-5 py-3.5 text-left font-semibold">State</th>
              <th className="px-5 py-3.5 text-left font-semibold">Created</th>
              <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-muted-dim">
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
                <td colSpan={6} className="px-5 py-12 text-center text-muted-dim">
                  <div className="flex flex-col items-center gap-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-dim/50">
                      <path d="M3 9l1.5-5h15L21 9" />
                      <path d="M5 9v11h14V9" />
                      <path d="M9 13h6" />
                    </svg>
                    No vendors yet.
                  </div>
                </td>
              </tr>
            )}
            {data?.items.map((v, idx) => (
              <tr
                key={v.id}
                className={`border-t border-border-subtle table-row-hover animate-fadeInUp stagger-${Math.min(idx + 1, 6)}`}
              >
                <td className="px-5 py-3.5 font-medium text-zinc-100">{v.name}</td>
                <td className="px-5 py-3.5 text-zinc-300">{v.email}</td>
                <td className="px-5 py-3.5 text-zinc-400">{v.city ?? "—"}</td>
                <td className="px-5 py-3.5 text-zinc-400">{v.state ?? "—"}</td>
                <td className="px-5 py-3.5 text-muted-dim">
                  {new Date(v.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex gap-1">
                    <Link
                      href={`/admin/vendors/${v.id}/edit`}
                      className="rounded-lg p-2 text-muted transition-all duration-200 hover:bg-brand-teal/10 hover:text-brand-teal hover:shadow-[0_0_8px_rgba(45,212,191,0.15)]"
                      aria-label={`Edit ${v.name}`}
                    >
                      <EditIcon />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setToDelete(v)}
                      className="rounded-lg p-2 text-muted transition-all duration-200 hover:bg-danger/10 hover:text-danger hover:shadow-[0_0_8px_rgba(248,113,113,0.15)]"
                      aria-label={`Delete ${v.name}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
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

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete vendor?"
        footer={
          <>
            <button
              type="button"
              className="pill-ghost"
              onClick={() => setToDelete(null)}
              disabled={del.isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              className="pill-danger"
              onClick={() => toDelete && del.mutate(toDelete.id)}
              disabled={del.isPending}
            >
              {del.isPending ? "Deleting…" : "Delete"}
            </button>
          </>
        }
      >
        <p>
          This soft-deletes <strong className="text-white">{toDelete?.name}</strong> and
          prevents future logins. Existing customers stay in the database.
        </p>
      </Modal>
    </>
  );
}
