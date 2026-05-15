"use client";

import { useState, type FormEvent } from "react";

import { ApiError } from "@/lib/api";

const PASSWORD_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const PIN_RE = /^\d{6}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface VendorFormValues {
  name: string;
  email: string;
  password?: string;
  confirm_password?: string;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  pin_code?: number | null;
}

export interface VendorFormDefaults {
  name?: string;
  email?: string;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  pin_code?: number | null;
}

interface VendorFormProps {
  mode: "create" | "edit";
  defaults?: VendorFormDefaults;
  submitting?: boolean;
  serverError?: string | null;
  onSubmit: (values: VendorFormValues) => void | Promise<void>;
  onCancel?: () => void;
}

export function VendorForm({
  mode,
  defaults,
  submitting,
  serverError,
  onSubmit,
  onCancel,
}: VendorFormProps) {
  const [name, setName] = useState(defaults?.name ?? "");
  const [email, setEmail] = useState(defaults?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [location, setLocation] = useState(defaults?.location ?? "");
  const [city, setCity] = useState(defaults?.city ?? "");
  const [state, setState] = useState(defaults?.state ?? "");
  const [pin, setPin] = useState(
    defaults?.pin_code != null ? String(defaults.pin_code) : ""
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): VendorFormValues | null {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Required";
    if (!EMAIL_RE.test(email.trim())) e.email = "Invalid email";

    const wantsPassword = mode === "create" || password.length > 0;
    if (wantsPassword) {
      if (!PASSWORD_RE.test(password)) {
        e.password =
          "Min 8 chars, with uppercase, lowercase, digit, and special character";
      }
      if (password !== confirmPassword) {
        e.confirm_password = "Passwords do not match";
      }
    }

    if (pin && !PIN_RE.test(pin)) e.pin_code = "Pin code must be 6 digits";

    setErrors(e);
    if (Object.keys(e).length > 0) return null;

    return {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: wantsPassword ? password : undefined,
      confirm_password: wantsPassword ? confirmPassword : undefined,
      location: location.trim() || null,
      city: city.trim() || null,
      state: state.trim() || null,
      pin_code: pin ? Number(pin) : null,
    };
  }

  function handle(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = validate();
    if (values) void onSubmit(values);
  }

  return (
    <form onSubmit={handle} className="space-y-5 animate-fadeInUp">
      {/* Section: Account Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-purple">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
          </svg>
          Account Information
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Vendor Name" error={errors.name}>
            <input
              className="input-base"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter vendor name"
              required
            />
          </Field>
          <Field label="Email" error={errors.email}>
            <input
              type="email"
              className="input-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vendor@example.com"
              required
            />
          </Field>
        </div>
      </div>

      {/* Section: Security */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-teal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Security
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label={mode === "create" ? "Password" : "New Password (optional)"}
            error={errors.password}
          >
            <input
              type="password"
              className="input-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </Field>
          <Field label="Confirm Password" error={errors.confirm_password}>
            <input
              type="password"
              className="input-base"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </Field>
        </div>
      </div>

      {/* Section: Location */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Location Details
        </div>
        <Field label="Location">
          <input
            className="input-base"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Street / area"
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="City">
            <input
              className="input-base"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
            />
          </Field>
          <Field label="State">
            <input
              className="input-base"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State"
            />
          </Field>
          <Field label="Pin Code" error={errors.pin_code}>
            <input
              inputMode="numeric"
              maxLength={6}
              className="input-base"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
            />
          </Field>
        </div>
      </div>

      {serverError && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger flex items-center gap-2 animate-fadeInUp">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {serverError}
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            className="pill-ghost"
            onClick={onCancel}
            disabled={submitting}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Cancel
          </button>
        )}
        <button type="submit" className="pill-primary" disabled={submitting}>
          {submitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
              </svg>
              {mode === "create" ? "Creating…" : "Saving…"}
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {mode === "create" ? "Create vendor" : "Save changes"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group">
      <label className="label-base">{label}</label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-danger flex items-center gap-1 animate-fadeIn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export function explainApiError(err: unknown): string {
  if (err instanceof ApiError) {
    const detail =
      (typeof err.detail === "object" && err.detail !== null && "detail" in err.detail
        ? (err.detail as Record<string, unknown>).detail
        : err.detail) ?? "";
    if (err.status === 409 || detail === "email_already_exists") {
      return "That email is already in use.";
    }
    if (err.status === 422) {
      return "Some fields are invalid. Please check the form.";
    }
    return typeof detail === "string" && detail
      ? detail
      : `Request failed (${err.status}).`;
  }
  return "Could not reach the server.";
}
