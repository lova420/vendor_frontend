"use client";

import { useMemo } from "react";

interface SparkleBurstProps {
  count?: number;
  radius?: number;
}

/**
 * A one-shot ring of sparkles that bloom outward from the center
 * and fade out. Drop inside a `relative` parent.
 */
export function SparkleBurst({ count = 14, radius = 90 }: SparkleBurstProps) {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
      const r = radius * (0.65 + Math.random() * 0.6);
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      const size = 4 + Math.random() * 6;
      const delay = Math.random() * 0.25;
      const colors = ["#a855f7", "#2dd4bf", "#f472b6", "#fbbf24"];
      const color = colors[i % colors.length];
      return { x, y, size, delay, color, id: i };
    });
  }, [count, radius]);

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute left-1/2 top-1/2 animate-sparkle"
          style={{
            transform: `translate(${p.x}px, ${p.y}px)`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: "9999px",
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
