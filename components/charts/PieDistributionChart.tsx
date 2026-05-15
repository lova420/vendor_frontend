"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { CategoryCount } from "@/lib/types";

const PALETTE = ["#a855f7", "#2dd4bf", "#f472b6", "#60a5fa", "#fbbf24", "#34d399"];

interface PieDistributionChartProps {
  data: CategoryCount[];
  height?: number;
}

export function PieDistributionChart({ data, height = 240 }: PieDistributionChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-muted-dim"
        style={{ height }}
      >
        No data yet
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#0b0b14" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#15151f",
            border: "1px solid #26262e",
            borderRadius: 12,
            fontSize: 12,
          }}
          itemStyle={{ color: "#e4e4e7" }}
          labelStyle={{ color: "#a1a1aa" }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#a1a1aa" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
