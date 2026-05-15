"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { DownloadIcon, SearchIcon } from "@/components/Icons";
import { PageHeader } from "@/components/PageHeader";
import { apiFetch, qrImageUrl } from "@/lib/api";
import type { QrInfo, VendorDropdownItem } from "@/lib/types";

export default function GenerateQrPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: vendors } = useQuery({
    queryKey: ["admin", "vendor-dropdown"],
    queryFn: () =>
      apiFetch<VendorDropdownItem[]>("/admin/vendors/dropdown"),
  });

  const filtered = useMemo(() => {
    if (!vendors) return [];
    const q = search.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter((v) => v.name.toLowerCase().includes(q));
  }, [vendors, search]);

  const selected = vendors?.find((v) => v.id === selectedId) ?? null;

  const { data: info } = useQuery({
    queryKey: ["admin", "qr", "info", selectedId],
    queryFn: () => apiFetch<QrInfo>(`/admin/qr/${selectedId}/info`),
    enabled: !!selectedId,
  });

  return (
    <>
      <PageHeader
        title="Generate QR"
        subtitle="Pick a vendor and download a QR for their public registration page."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px,1fr]">
        {/* Vendor selector panel */}
        <div className="surface p-5 animate-fadeInUp stagger-1">
          <label className="label-base">Search vendors</label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input-base pl-10"
              placeholder="Type to filter…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="mt-4 max-h-[420px] overflow-y-auto pr-1">
            {filtered.length === 0 && (
              <div className="px-2 py-8 text-center text-sm text-muted-dim">
                No vendors found.
              </div>
            )}
            <ul className="space-y-1">
              {filtered.map((v) => {
                const active = v.id === selectedId;
                return (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(v.id)}
                      className={`group w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                        active
                          ? "bg-gradient-to-r from-brand-purple/20 to-brand-purple/5 text-white shadow-[inset_0_0_0_1px_rgba(168,85,247,0.2)]"
                          : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold uppercase transition-colors ${
                          active
                            ? "bg-brand-purple/25 text-brand-purple"
                            : "bg-white/[0.05] text-muted-dim group-hover:bg-white/[0.08]"
                        }`}>
                          {v.name.charAt(0)}
                        </div>
                        {v.name}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* QR display panel */}
        <div className="surface p-6 animate-fadeInUp stagger-2">
          {!selected ? (
            <div className="flex h-80 flex-col items-center justify-center text-center animate-fadeIn">
              <div className="mb-4 rounded-2xl bg-white/[0.03] p-5 border border-white/[0.04]">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-muted-dim/50">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <path d="M14 14h3v3M20 14v3M14 20h3M20 20v.01" />
                </svg>
              </div>
              <p className="text-sm text-muted-dim">Select a vendor to generate a QR code.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 animate-scaleIn">
              <div className="text-center">
                <h2 className="text-xl font-bold text-white">
                  {selected.name}
                </h2>
                {info && (
                  <p className="mt-2 break-all text-xs text-muted bg-bg-inset/50 rounded-lg px-3 py-1.5 border border-border-subtle">
                    {info.url}
                  </p>
                )}
              </div>

              <div className="relative group">
                {/* Rotating gradient halo behind the QR */}
                <div
                  className="absolute -inset-1.5 rounded-[20px] opacity-70 blur-md transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "conic-gradient(from 0deg at 50% 50%, #a855f7, #2dd4bf, #f472b6, #a855f7)",
                    animation: "qrRingSpin 6s linear infinite",
                  }}
                  aria-hidden
                />
                <div className="relative rounded-2xl bg-white p-5 shadow-glow transition-transform duration-300 group-hover:scale-[1.02]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrImageUrl(selected.id, "png")}
                    alt={`QR for ${selected.name}`}
                    width={256}
                    height={256}
                    className="rounded-lg"
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {(["png", "jpeg", "svg"] as const).map((fmt) => (
                  <a
                    key={fmt}
                    href={qrImageUrl(selected.id, fmt, { download: true })}
                    className="pill-ghost text-xs transition-all duration-200 hover:border-brand-purple/40 hover:text-brand-purple"
                  >
                    <DownloadIcon />
                    {fmt.toUpperCase()}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
