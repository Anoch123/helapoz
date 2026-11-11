import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Download,
  Plus,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Package,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const instant = false;

/* ------------------------------------------------------------------ */
/* Placeholder data: replace with Prisma queries                       */
/* ------------------------------------------------------------------ */

const CURRENCY = "LKR";

const money = (n: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(n);

type Stat = {
  label: string;
  value: string;
  delta: number;
  icon: LucideIcon;
  tile: string;
};

const stats: Stat[] = [
  {
    label: "Today's sales",
    value: money(184250),
    delta: 12.4,
    icon: Banknote,
    tile: "bg-indigo-500/10 text-indigo-600",
  },
  {
    label: "Orders",
    value: "64",
    delta: 8.1,
    icon: Receipt,
    tile: "bg-emerald-500/10 text-emerald-600",
  },
  {
    label: "Avg. order value",
    value: money(2879),
    delta: -2.3,
    icon: TrendingUp,
    tile: "bg-amber-500/10 text-amber-600",
  },
  {
    label: "Items sold",
    value: "212",
    delta: 5.6,
    icon: ShoppingBag,
    tile: "bg-sky-500/10 text-sky-600",
  },
];

const hourly = [
  { h: "9", v: 8 },
  { h: "10", v: 14 },
  { h: "11", v: 22 },
  { h: "12", v: 31 },
  { h: "1", v: 27 },
  { h: "2", v: 18 },
  { h: "3", v: 24 },
  { h: "4", v: 36 },
  { h: "5", v: 41 },
  { h: "6", v: 33 },
  { h: "7", v: 19 },
  { h: "8", v: 9 },
];

const payments = [
  { label: "Cash", pct: 46, bar: "bg-indigo-600", dot: "bg-indigo-600" },
  { label: "Card", pct: 38, bar: "bg-emerald-500", dot: "bg-emerald-500" },
  { label: "Mobile pay", pct: 16, bar: "bg-amber-400", dot: "bg-amber-400" },
];

type Status = "Paid" | "Refunded" | "Pending";

const transactions: {
  id: string;
  customer: string;
  items: number;
  method: string;
  total: number;
  status: Status;
  time: string;
}[] = [
  { id: "#1048", customer: "Walk-in", items: 4, method: "Cash", total: 3250, status: "Paid", time: "2 min ago" },
  { id: "#1047", customer: "Nimali Perera", items: 2, method: "Card", total: 5800, status: "Paid", time: "11 min ago" },
  { id: "#1046", customer: "Walk-in", items: 1, method: "Mobile pay", total: 950, status: "Pending", time: "18 min ago" },
  { id: "#1045", customer: "Kasun Silva", items: 7, method: "Card", total: 12400, status: "Paid", time: "26 min ago" },
  { id: "#1044", customer: "Walk-in", items: 3, method: "Cash", total: 2100, status: "Refunded", time: "41 min ago" },
];

const statusStyle: Record<Status, string> = {
  Paid: "bg-emerald-500/10 text-emerald-700",
  Pending: "bg-amber-500/10 text-amber-700",
  Refunded: "bg-red-500/10 text-red-700",
};

const topProducts = [
  { name: "Bottled water 500ml", sold: 58, revenue: 8700 },
  { name: "Milk packet 1L", sold: 41, revenue: 14350 },
  { name: "White bread loaf", sold: 36, revenue: 10800 },
  { name: "Egg tray (10)", sold: 29, revenue: 8700 },
];

const lowStock = [
  { name: "Milk packet 1L", left: 4 },
  { name: "Cooking oil 1L", left: 6 },
  { name: "Sugar 1kg", left: 9 },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const peak = Math.max(...hourly.map((b) => b.v));
  const topMax = Math.max(...topProducts.map((p) => p.sold));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
          <p className="text-sm text-muted-foreground">
            How the shop is doing today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl">
            <Download className="size-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          const up = s.delta >= 0;
          return (
            <div
              key={s.label}
              className="rounded-2xl border bg-background p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {s.label}
                </p>
                <span className={`flex size-10 items-center justify-center rounded-xl ${s.tile}`}>
                  <Icon className="size-5" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight">{s.value}</p>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold ${
                    up
                      ? "bg-emerald-500/10 text-emerald-700"
                      : "bg-red-500/10 text-red-700"
                  }`}
                >
                  {up ? (
                    <ArrowUpRight className="size-3" />
                  ) : (
                    <ArrowDownRight className="size-3" />
                  )}
                  {Math.abs(s.delta)}%
                </span>
                <span className="text-muted-foreground">vs yesterday</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Chart + payments */}
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border bg-background p-6 shadow-sm xl:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">Sales by hour</h3>
              <p className="text-sm text-muted-foreground">
                Orders per hour, today
              </p>
            </div>
            <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-700">
              Peak 5 PM
            </span>
          </div>

          <div className="mt-6 flex h-56 items-end gap-2 sm:gap-3">
            {hourly.map((b) => {
              const isPeak = b.v === peak;
              return (
                <div key={b.h} className="group flex flex-1 flex-col items-center gap-2">
                  <div className="relative flex w-full flex-1 items-end">
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-md bg-slate-950 px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                      {b.v}
                    </span>
                    <div
                      style={{ height: `${(b.v / peak) * 100}%` }}
                      className={`w-full rounded-t-lg transition-colors ${
                        isPeak
                          ? "bg-indigo-600"
                          : "bg-indigo-500/20 group-hover:bg-indigo-500/60"
                      }`}
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground">{b.h}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border bg-background p-6 shadow-sm">
          <h3 className="font-semibold">Payment methods</h3>
          <p className="text-sm text-muted-foreground">Share of today's orders</p>

          <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-muted">
            {payments.map((p) => (
              <div key={p.label} style={{ width: `${p.pct}%` }} className={p.bar} />
            ))}
          </div>

          <ul className="mt-6 space-y-4">
            {payments.map((p) => (
              <li key={p.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5">
                  <span className={`size-2.5 rounded-full ${p.dot}`} />
                  {p.label}
                </span>
                <span className="font-semibold">{p.pct}%</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Transactions + side lists */}
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border bg-background shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between p-6 pb-4">
            <div>
              <h3 className="font-semibold">Recent transactions</h3>
              <p className="text-sm text-muted-foreground">Latest orders at the counter</p>
            </div>
            <Link
              href="/dashboard/orders"
              className="text-sm font-medium text-indigo-600 transition hover:text-indigo-500"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-y bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3">Order</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Method</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-6 py-3.5">
                      <p className="font-semibold">{t.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.items} items · {t.time}
                      </p>
                    </td>
                    <td className="px-3 py-3.5">{t.customer}</td>
                    <td className="px-3 py-3.5 text-muted-foreground">{t.method}</td>
                    <td className="px-3 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[t.status]}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold">
                      {money(t.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-background p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Package className="size-4 text-indigo-600" />
              <h3 className="font-semibold">Top products</h3>
            </div>

            <ul className="mt-5 space-y-4">
              {topProducts.map((p) => (
                <li key={p.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground">{p.sold} sold</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      style={{ width: `${(p.sold / topMax) * 100}%` }}
                      className="h-full rounded-full bg-indigo-600"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600" />
              <h3 className="font-semibold">Low stock</h3>
            </div>

            <ul className="mt-4 divide-y divide-amber-500/20">
              {lowStock.map((i) => (
                <li key={i.name} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="font-medium">{i.name}</span>
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    {i.left} left
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}