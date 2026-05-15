"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TopVendor } from "@/lib/types";

interface TopVendorsBarChartProps {
  data: TopVendor[];
  height?: number;
}

export function TopVendorsBarChart({ data, height = 280 }: TopVendorsBarChartProps) {
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
  const chartData = data.map((d) => ({
    name: d.vendor_name,
    count: d.customer_count,
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 8, right: 12, left: 12, bottom: 0 }}
      >
        <CartesianGrid stroke="#26262e" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" stroke="#71717a" tick={{ fontSize: 11 }} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          stroke="#71717a"
          tick={{ fontSize: 11 }}
          width={120}
        />
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
        <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="#a855f7" />
      </BarChart>
    </ResponsiveContainer>
  );
}
