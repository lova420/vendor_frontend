"use client";

import { useQuery } from "@tanstack/react-query";

import { KpiCard } from "@/components/KpiCard";
import { PageHeader } from "@/components/PageHeader";
import {
  ChartSkeleton,
  KpiSkeletonRow,
  TableSkeleton,
} from "@/components/Skeleton";
import { LineSeriesChart } from "@/components/charts/LineSeriesChart";
import { PieDistributionChart } from "@/components/charts/PieDistributionChart";
import { TopVendorsBarChart } from "@/components/charts/TopVendorsBarChart";
import { apiFetch } from "@/lib/api";
import type { AdminDashboardStats } from "@/lib/types";

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => apiFetch<AdminDashboardStats>("/admin/dashboard/stats"),
  });

  if (isLoading || !data) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Global view across all vendors." />
        <KpiSkeletonRow count={4} />
        <div className="mt-5">
          <KpiSkeletonRow count={3} />
        </div>
        <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </section>
        <section className="mt-6">
          <TableSkeleton rows={5} columns={6} />
        </section>
      </>
    );
  }

  const k = data.kpi;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Global view across all vendors."
      />

      {/* KPI Row 1 */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="animate-fadeInUp stagger-1">
          <KpiCard label="Active vendors" value={k.total_vendors} accent="purple" />
        </div>
        <div className="animate-fadeInUp stagger-2">
          <KpiCard label="Total customers" value={k.total_customers} accent="teal" />
        </div>
        <div className="animate-fadeInUp stagger-3">
          <KpiCard label="Customers today" value={k.customers_today} />
        </div>
        <div className="animate-fadeInUp stagger-4">
          <KpiCard label="Customers this month" value={k.customers_this_month} />
        </div>
      </section>

      {/* KPI Row 2 — Scans */}
      <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="animate-fadeInUp stagger-3">
          <KpiCard
            label="QR scans (all time)"
            value={k.scans.total_scans}
            hint={`${k.scans.unique_visitors} unique visitors`}
            accent="purple"
          />
        </div>
        <div className="animate-fadeInUp stagger-4">
          <KpiCard
            label="Conversion rate"
            value={pct(k.scans.conversion_rate)}
            hint="submissions ÷ unique visitors"
            accent="teal"
          />
        </div>
        <div className="animate-fadeInUp stagger-5">
          <KpiCard
            label="Scans this month"
            value={k.scans_this_month.total_scans}
            hint={`${k.scans_this_month.unique_visitors} unique · ${pct(
              k.scans_this_month.conversion_rate
            )} converted`}
          />
        </div>
      </section>

      {/* Charts Row 1 */}
      <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="surface p-6 animate-fadeInUp stagger-4">
          <h2 className="mb-4 text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-purple" />
            Activity — last 30 days
          </h2>
          <LineSeriesChart
            series={[
              {
                data: data.daily_last_30_days,
                name: "Customers",
                color: "#a855f7",
              },
              {
                data: data.daily_scans_last_30_days,
                name: "Scans",
                color: "#2dd4bf",
              },
            ]}
          />
        </div>

        <div className="surface p-6 animate-fadeInUp stagger-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-teal" />
            Top vendors by customers
          </h2>
          <TopVendorsBarChart data={data.top_vendors} />
        </div>
      </section>

      {/* Charts Row 2 — Pie charts */}
      <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="surface p-6 animate-fadeInUp stagger-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-pink-400" />
            Budget distribution
          </h2>
          <PieDistributionChart data={data.budget_distribution} />
        </div>
        <div className="surface p-6 animate-fadeInUp stagger-6">
          <h2 className="mb-4 text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
            Buying timeframe
          </h2>
          <PieDistributionChart data={data.buy_in_distribution} />
        </div>
      </section>

      {/* Latest registrations table */}
      <section className="mt-6 surface overflow-hidden animate-fadeInUp stagger-6">
        <div className="px-6 pt-5 pb-3">
          <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-purple animate-pulse" />
            Latest customer registrations
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-inset/50 text-[11px] uppercase tracking-widest text-muted">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Vendor</th>
                <th className="px-5 py-3 text-left font-semibold">Customer</th>
                <th className="px-5 py-3 text-left font-semibold">Phone</th>
                <th className="px-5 py-3 text-left font-semibold">Budget</th>
                <th className="px-5 py-3 text-left font-semibold">Buy-in</th>
                <th className="px-5 py-3 text-left font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {data.latest_customers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-muted-dim"
                  >
                    No registrations yet.
                  </td>
                </tr>
              )}
              {data.latest_customers.map((c) => (
                <tr key={c.id} className="border-t border-border-subtle table-row-hover">
                  <td className="px-5 py-3">{c.vendor_name}</td>
                  <td className="px-5 py-3 font-medium text-zinc-100">{c.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-zinc-400">
                    {c.contact_number}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center rounded-full bg-brand-purple/10 px-2.5 py-0.5 text-xs font-medium text-brand-purple">
                      {c.budget}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center rounded-full bg-brand-teal/10 px-2.5 py-0.5 text-xs font-medium text-brand-teal">
                      {c.looking_to_buy_in}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-dim text-xs">
                    {new Date(c.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
