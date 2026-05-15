"use client";

import { useQuery } from "@tanstack/react-query";

import { DownloadIcon } from "@/components/Icons";
import { PageHeader } from "@/components/PageHeader";
import { apiFetch, vendorQrImageUrl } from "@/lib/api";
import type { QrInfo } from "@/lib/types";

export default function MyQrPage() {
  const { data: info, isLoading } = useQuery({
    queryKey: ["vendor", "my-qr"],
    queryFn: () => apiFetch<QrInfo>("/vendor/qr/info"),
  });

  return (
    <>
      <PageHeader
        title="My QR"
        subtitle="Print or share this QR — every scan is counted as a lead."
      />

      <div className="surface p-6 animate-fadeInUp stagger-1">
        {isLoading || !info ? (
          <div className="flex h-80 items-center justify-center text-sm text-muted-dim">
            <svg
              className="animate-spin h-5 w-5 mr-2"
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
        ) : (
          <div className="flex flex-col items-center gap-6 animate-scaleIn">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">{info.vendor_name}</h2>
              <p className="mt-2 break-all text-xs text-muted bg-bg-inset/50 rounded-lg px-3 py-1.5 border border-border-subtle">
                {info.url}
              </p>
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
                  src={vendorQrImageUrl("png")}
                  alt={`QR for ${info.vendor_name}`}
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
                  href={vendorQrImageUrl(fmt, { download: true })}
                  className="pill-ghost text-xs transition-all duration-200 hover:border-brand-purple/40 hover:text-brand-purple"
                >
                  <DownloadIcon />
                  {fmt.toUpperCase()}
                </a>
              ))}
            </div>

            <p className="mt-2 max-w-md text-center text-xs text-muted-dim leading-relaxed">
              When a customer scans this code, they land on your registration page
              and a row is added to your scan analytics — even before they submit
              the form.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
