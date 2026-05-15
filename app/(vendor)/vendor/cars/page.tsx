"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { DownloadIcon, SearchIcon, UploadIcon } from "@/components/Icons";
import { PageHeader } from "@/components/PageHeader";
import { apiFetch, ApiError, uploadVendorCarsCsv, vendorCarsSampleUrl } from "@/lib/api";
import type {
  CarUploadResult,
  PaginatedVendorCars,
} from "@/lib/types";

export default function VendorCarsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [uploadResult, setUploadResult] = useState<CarUploadResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["vendor", "cars", { page, search, sortOrder }],
    queryFn: () =>
      apiFetch<PaginatedVendorCars>("/vendor/cars", {
        query: {
          page,
          page_size: 20,
          search: search || undefined,
          sort_order: sortOrder,
        },
      }),
  });

  const upload = useMutation({
    mutationFn: (file: File) => uploadVendorCarsCsv<CarUploadResult>(file),
    onSuccess: (result) => {
      setUploadResult(result);
      setUploadError(null);
      queryClient.invalidateQueries({ queryKey: ["vendor", "cars"] });
    },
    onError: (err) => {
      setUploadResult(null);
      if (err instanceof ApiError) {
        const detail =
          typeof err.detail === "object" && err.detail !== null && "detail" in err.detail
            ? String((err.detail as { detail: unknown }).detail)
            : typeof err.detail === "string"
              ? err.detail
              : `Upload failed (${err.status})`;
        setUploadError(detail);
      } else {
        setUploadError("Could not reach the server.");
      }
    },
  });

  const total = data?.total ?? 0;
  const pageSize = data?.page_size ?? 20;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  function pickFile() {
    fileInputRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadResult(null);
    setUploadError(null);
    upload.mutate(file);
  }

  return (
    <>
      <PageHeader
        title="Cars"
        subtitle={`${total} car${total === 1 ? "" : "s"} in your inventory`}
        actions={
          <>
            <a href={vendorCarsSampleUrl()} className="pill-ghost">
              <DownloadIcon /> Sample CSV
            </a>
            <button
              type="button"
              onClick={pickFile}
              disabled={upload.isPending}
              className="pill-primary"
            >
              {upload.isPending ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
                  </svg>
                  Uploading…
                </>
              ) : (
                <>
                  <UploadIcon /> Upload CSV
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={onFileChange}
            />
          </>
        }
      />

      <p className="mb-5 text-xs text-muted-dim animate-fadeIn">
        Expected columns: Car Name, Model, Year, KM Driven, Cost, Registration Year,
        Transmission, Fuel Type, Owner Type. Duplicate rows (within the file or against
        what you&apos;ve uploaded before) are skipped automatically.
      </p>

      {uploadError && (
        <div className="mb-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger flex items-start gap-2 animate-fadeIn">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 flex-shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{uploadError}</span>
        </div>
      )}

      {uploadResult && <UploadResultPanel result={uploadResult} onDismiss={() => setUploadResult(null)} />}

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
            placeholder="Search by car name or model…"
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-inset/50 text-[11px] uppercase tracking-widest text-muted">
              <tr>
                <th className="px-5 py-3.5 text-left font-semibold">Car</th>
                <th className="px-5 py-3.5 text-left font-semibold">Model</th>
                <th className="px-5 py-3.5 text-left font-semibold">Year</th>
                <th className="px-5 py-3.5 text-right font-semibold">KM Driven</th>
                <th className="px-5 py-3.5 text-right font-semibold">Cost</th>
                <th className="px-5 py-3.5 text-left font-semibold">Reg.</th>
                <th className="px-5 py-3.5 text-left font-semibold">Trans.</th>
                <th className="px-5 py-3.5 text-left font-semibold">Fuel</th>
                <th className="px-5 py-3.5 text-left font-semibold">Owner</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-muted-dim">
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
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
                  <td colSpan={9} className="px-5 py-12 text-center text-muted-dim">
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-muted-dim/50"
                      >
                        <path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13" />
                        <path d="M3 17v-3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3" />
                      </svg>
                      No cars yet — upload a CSV to get started.
                    </div>
                  </td>
                </tr>
              )}
              {data?.items.map((c, idx) => (
                <tr
                  key={c.car_id}
                  className={`border-t border-border-subtle table-row-hover animate-fadeInUp stagger-${Math.min(idx + 1, 6)}`}
                >
                  <td className="px-5 py-3.5 font-medium text-zinc-100">{c.car_name}</td>
                  <td className="px-5 py-3.5 text-zinc-300">{c.model}</td>
                  <td className="px-5 py-3.5 text-zinc-300">{c.year}</td>
                  <td className="px-5 py-3.5 text-right text-zinc-300 font-mono text-xs">
                    {c.km_driven.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="inline-flex items-center rounded-full bg-brand-purple/10 px-2.5 py-0.5 text-xs font-medium text-brand-purple">
                      ₹{c.cost_lakh} L
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-300">{c.registration_year}</td>
                  <td className="px-5 py-3.5 text-zinc-300">{c.transmission}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center rounded-full bg-brand-teal/10 px-2.5 py-0.5 text-xs font-medium text-brand-teal">
                      {c.fuel_type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-300">{c.owner_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

function UploadResultPanel({
  result,
  onDismiss,
}: {
  result: CarUploadResult;
  onDismiss: () => void;
}) {
  const hasErrors = result.errors.length > 0;
  const allDuplicates = result.inserted === 0 && result.total_rows > 0;
  const tone = hasErrors || allDuplicates ? "warn" : "success";

  return (
    <div
      className={`mb-5 rounded-xl border px-4 py-3 text-sm animate-fadeIn ${
        tone === "success"
          ? "border-brand-teal/30 bg-brand-teal/10 text-brand-teal"
          : "border-amber-500/30 bg-amber-500/10 text-amber-400"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="font-semibold">
            {result.inserted > 0
              ? `Imported ${result.inserted} car${result.inserted === 1 ? "" : "s"}`
              : "No new cars imported"}
          </div>
          <div className="mt-1 text-xs text-zinc-300 flex flex-wrap gap-x-4 gap-y-1">
            <span>Total rows: {result.total_rows}</span>
            <span>Duplicates in file: {result.duplicates_in_file}</span>
            <span>Already in your inventory: {result.duplicates_in_db}</span>
            {result.errors.length > 0 && (
              <span className="text-danger">Errors: {result.errors.length}</span>
            )}
          </div>
          {result.errors.length > 0 && (
            <details className="mt-2 text-xs text-zinc-300">
              <summary className="cursor-pointer text-danger hover:text-danger/80">
                Show row errors
              </summary>
              <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {result.errors.map((e) => (
                  <li key={e.row} className="font-mono">
                    Row {e.row}: {e.message}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-zinc-500 hover:text-zinc-300 flex-shrink-0"
          aria-label="Dismiss"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
