"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { ChipSelect } from "@/components/Chip";
import { ArrowRightIcon } from "@/components/Icons";
import { SparkleBurst } from "@/components/SparkleBurst";
import { apiFetch, ApiError } from "@/lib/api";
import {
  BUDGET_OPTIONS,
  BUY_IN_OPTIONS,
  type Budget,
  type BuyIn,
  type PublicVendorInfo,
} from "@/lib/types";

const PHONE_RE = /^\d{10}$/;

export default function PublicRegisterPage() {
  const params = useSearchParams();
  const vendorId = params.get("vendor_id");

  const {
    data: vendor,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["public-vendor", vendorId],
    queryFn: () => apiFetch<PublicVendorInfo>(`/public/vendors/${vendorId}`),
    enabled: !!vendorId,
    retry: false,
  });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState<Budget | null>(null);
  const [buyIn, setBuyIn] = useState<BuyIn | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const submit = useMutation({
    mutationFn: (body: unknown) =>
      apiFetch("/public/customers", { method: "POST", body }),
    onSuccess: () => {
      setSubmitted(true);
      setServerError(null);
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 429) {
        setServerError("Too many submissions. Please wait a moment.");
      } else {
        setServerError("Could not submit. Please try again.");
      }
    },
  });

  if (!vendorId) {
    return <InvalidQrScreen message="Missing vendor information in the link." />;
  }

  if (isLoading) {
    return (
      <Frame>
        <div className="flex items-center justify-center py-8 text-muted">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
          </svg>
          Loading…
        </div>
      </Frame>
    );
  }

  if (isError || !vendor) {
    return <InvalidQrScreen />;
  }

  if (submitted) {
    return (
      <Frame>
        <div className="relative py-10 text-center animate-scaleIn">
          <SparkleBurst />
          <div className="relative z-10">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-teal/30 to-brand-purple/20 text-brand-teal text-4xl shadow-[0_0_40px_rgba(45,212,191,0.35)]">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              You&apos;re all set!
            </h1>
            <p className="mt-2 text-sm text-muted">
              <strong className="text-zinc-200">{vendor.name}</strong> will be in touch soon.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-pill border border-border-subtle bg-bg-inset/60 px-3 py-1.5 text-[11px] text-muted-dim">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-teal animate-pulse" />
              Submission received
            </div>
          </div>
        </div>
      </Frame>
    );
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Required";
    if (!PHONE_RE.test(phone)) e.phone = "Phone must be 10 digits";
    if (!budget) e.budget = "Pick a budget";
    if (!buyIn) e.buyIn = "Pick a timeframe";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  return (
    <Frame>
      <header className="mb-6 text-center">
        <h1 className="text-xl font-bold text-white">{vendor.name}</h1>
        {(vendor.city || vendor.state) && (
          <p className="mt-1 text-xs uppercase tracking-wider text-muted">
            {[vendor.city, vendor.state].filter(Boolean).join(", ")}
          </p>
        )}
        <p className="mt-3 text-sm text-muted">
          Tell us a little about what you&apos;re looking for.
        </p>
      </header>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          setServerError(null);
          if (!validate()) return;
          submit.mutate({
            vendor_id: vendor.id,
            name: name.trim(),
            contact_number: phone,
            budget,
            looking_to_buy_in: buyIn,
          });
        }}
      >
        <div>
          <label className="label-base">Your name</label>
          <input
            className="input-base"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter your name"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-danger flex items-center gap-1 animate-fadeIn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label className="label-base">Phone number</label>
          <input
            className="input-base"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            required
            placeholder="10-digit number"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-danger flex items-center gap-1 animate-fadeIn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errors.phone}
            </p>
          )}
        </div>

        <div>
          <label className="label-base">Budget</label>
          <ChipSelect
            options={BUDGET_OPTIONS}
            value={budget}
            onChange={setBudget}
            ariaLabel="Budget"
          />
          {errors.budget && (
            <p className="mt-1 text-xs text-danger flex items-center gap-1 animate-fadeIn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errors.budget}
            </p>
          )}
        </div>

        <div>
          <label className="label-base">Looking to buy in</label>
          <ChipSelect
            options={BUY_IN_OPTIONS}
            value={buyIn}
            onChange={setBuyIn}
            ariaLabel="Looking to buy in"
          />
          {errors.buyIn && (
            <p className="mt-1 text-xs text-danger flex items-center gap-1 animate-fadeIn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errors.buyIn}
            </p>
          )}
        </div>

        {serverError && (
          <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger flex items-center gap-2 animate-fadeIn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {serverError}
          </div>
        )}

        <button
          type="submit"
          className="pill-primary w-full py-3"
          disabled={submit.isPending}
        >
          {submit.isPending ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
              </svg>
              Submitting…
            </>
          ) : (
            <>
              Submit
              <ArrowRightIcon />
            </>
          )}
        </button>
      </form>
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-8 overflow-hidden">
      {/* Background blurs */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-brand-purple/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-brand-teal/5 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md animate-fadeInUp">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="animate-float">
            <Image
              src="/logo.png"
              alt="MagickVoice Logo"
              width={48}
              height={48}
              className="drop-shadow-[0_0_12px_rgba(168,85,247,0.3)]"
              priority
            />
          </div>
          <span className="text-base font-bold tracking-tight text-zinc-100">
            Magick<span className="bg-gradient-to-r from-brand-purple to-blue-400 bg-clip-text text-transparent">Voice</span>
          </span>
        </div>
        <div className="relative surface-glass p-7 shadow-2xl">
          <div className="absolute top-0 left-7 right-7 h-px bg-gradient-to-r from-transparent via-brand-purple/50 to-transparent" />
          {children}
        </div>
        <p className="mt-6 text-center text-[11px] text-muted-dim">
          Powered by MagickVoice
        </p>
      </div>
    </main>
  );
}

function InvalidQrScreen({
  message = "This QR is no longer valid or has expired.",
}: {
  message?: string;
}) {
  return (
    <Frame>
      <div className="py-8 text-center animate-fadeIn">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger text-xl">
          ✕
        </div>
        <h1 className="text-lg font-bold text-white">Something&apos;s not right</h1>
        <p className="mt-2 text-sm text-muted">{message}</p>
      </div>
    </Frame>
  );
}
