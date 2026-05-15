"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: number;
  duration?: number; // ms
  decimals?: number;
  suffix?: string;
  prefix?: string;
}

// Eased ramp 0..1 (easeOutCubic)
function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function CountUp({
  value,
  duration = 900,
  decimals = 0,
  suffix = "",
  prefix = "",
}: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const startTime = useRef<number | null>(null);
  const startValue = useRef(0);
  const targetRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (Number.isNaN(value) || !Number.isFinite(value)) {
      setDisplay(value);
      return;
    }

    startValue.current = display;
    targetRef.current = value;
    startTime.current = null;

    const step = (ts: number) => {
      if (startTime.current === null) startTime.current = ts;
      const elapsed = ts - startTime.current;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOut(t);
      const next =
        startValue.current + (targetRef.current - startValue.current) * eased;
      setDisplay(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  const formatted = Number.isFinite(display)
    ? display.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : String(display);

  return (
    <>
      {prefix}
      {formatted}
      {suffix}
    </>
  );
}
