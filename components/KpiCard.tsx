import type { ReactNode } from "react";

import { CountUp } from "@/components/CountUp";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  accent?: "purple" | "teal" | "neutral";
}

// Renders the value with a CountUp animation when it's a plain number,
// or a number-like string (e.g. "12.4%"). Falls through for everything else.
function AnimatedValue({ value }: { value: ReactNode }) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return <CountUp value={value} />;
  }
  if (typeof value === "string") {
    const match = value.match(/^(-?\d+(?:\.\d+)?)(.*)$/);
    if (match) {
      const num = Number(match[1]);
      const suffix = match[2];
      if (Number.isFinite(num)) {
        const decimals = match[1].includes(".") ? match[1].split(".")[1].length : 0;
        return <CountUp value={num} suffix={suffix} decimals={decimals} />;
      }
    }
  }
  return <>{value}</>;
}

export function KpiCard({ label, value, hint, accent = "neutral" }: KpiCardProps) {
  const gradientLine =
    accent === "purple"
      ? "from-brand-purple to-brand-purple/0"
      : accent === "teal"
        ? "from-brand-teal to-brand-teal/0"
        : "from-white/20 to-white/0";

  const glowColor =
    accent === "purple"
      ? "rgba(168, 85, 247, 0.08)"
      : accent === "teal"
        ? "rgba(45, 212, 191, 0.08)"
        : "rgba(255, 255, 255, 0.02)";

  const valueColor =
    accent === "purple"
      ? "bg-gradient-to-r from-brand-purple to-purple-300 bg-clip-text text-transparent"
      : accent === "teal"
        ? "bg-gradient-to-r from-brand-teal to-teal-200 bg-clip-text text-transparent"
        : "text-white";

  return (
    <div
      className="group surface relative overflow-hidden p-5 transition-all duration-300 hover:shadow-lg hover:border-white/[0.1] hover:-translate-y-0.5"
      style={{
        background: `radial-gradient(120px 120px at 100% 0%, ${glowColor}, transparent), rgba(21,21,31,0.8)`,
      }}
    >
      {/* Top gradient line */}
      <div className={`absolute top-0 left-4 right-4 h-px bg-gradient-to-r ${gradientLine}`} />

      {/* Hover sheen */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transition-transform duration-700 group-hover:translate-x-full" />

      <div className="relative">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted">
          {label}
        </div>
        <div className={`mt-2.5 text-3xl font-bold tracking-tight tabular-nums ${valueColor}`}>
          <AnimatedValue value={value} />
        </div>
        {hint !== undefined && (
          <div className="mt-1.5 text-xs text-muted-dim">{hint}</div>
        )}
      </div>
    </div>
  );
}
