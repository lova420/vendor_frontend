"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DailyCount } from "@/lib/types";

interface Series {
  data: DailyCount[];
  name: string;
  color: string;
}

interface LineSeriesChartProps {
  series: Series[];
  height?: number;
}

export function LineSeriesChart({ series, height = 280 }: LineSeriesChartProps) {
  // Merge series into one array keyed by day for Recharts.
  const allDays = new Set<string>();
  series.forEach((s) => s.data.forEach((d) => allDays.add(d.day)));
  const days = Array.from(allDays).sort();
  const merged = days.map((day) => {
    const row: Record<string, number | string> = { day };
    series.forEach((s, idx) => {
      const found = s.data.find((d) => d.day === day);
      row[`v${idx}`] = found ? found.count : 0;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={merged} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#26262e" strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          stroke="#71717a"
          tick={{ fontSize: 11 }}
          tickFormatter={(v: string) => v.slice(5)}
        />
        <YAxis stroke="#71717a" tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: "#15151f",
            border: "1px solid #26262e",
            borderRadius: 12,
            color: "#e4e4e7",
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#a1a1aa" }} />
        {series.map((s, idx) => (
          <Line
            key={s.name}
            type="monotone"
            dataKey={`v${idx}`}
            name={s.name}
            stroke={s.color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
