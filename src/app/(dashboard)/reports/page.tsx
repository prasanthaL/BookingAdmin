import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/session";
import { formatMoney } from "@/lib/utils";
import { Suspense } from "react";
import {
  BarChart3, TrendingUp, BedDouble, Users, CheckCircle2,
  XCircle, Clock, DoorOpen, CalendarCheck, Banknote,
  CreditCard, Building2, PlusSquare, ArrowUpRight,
} from "lucide-react";
import { ReportFilters } from "@/components/reports/report-filters";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } from "date-fns";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pct(n: number, total: number) {
  if (!total) return 0;
  return Math.round((n / total) * 100);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface ReportsPageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const businessId = await getBusinessId();
  const { from, to } = await searchParams;

  const now = new Date();

  // Date range for filtered data
  const dateFilter = {
    gte: from ? startOfDay(new Date(from)) : undefined,
    lte: to ? endOfDay(new Date(to)) : undefined,
  };

  const hasDateFilter = !!from || !!to;

  // Comparison ranges
  const currentMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  // ── Fetch all data in parallel ──────────────────────────────────────────────
  const [
    filteredRevenue,
    monthRevenue,
    lastMonthRevenue,
    bookingCounts,
    rooms,
    occupiedRooms,
    totalGuests,
    newGuestsCount,
    recentBookings,
    paymentMethods,
    last6Months,
    topAddons,
  ] = await Promise.all([
    // Revenue based on filter
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { businessId: businessId as string, createdAt: dateFilter }
    }),

    // This month revenue (for growth stat)
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { businessId: businessId as string, createdAt: { gte: currentMonthStart } },
    }),

    // Last month revenue (for growth stat)
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        businessId: businessId as string,
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
    }),

    // Booking status counts with filter
    prisma.booking.groupBy({
      by: ["status"],
      where: { businessId: businessId as string, createdAt: dateFilter },
      _count: true,
    }),

    // Total rooms
    prisma.room.count({ where: { businessId: businessId as string } }),

    // Occupied rooms (global current state, unaffected by filter to show live status)
    prisma.room.count({
      where: { businessId: businessId as string, status: { in: ["OCCUPIED", "RESERVED"] } },
    }),

    // Guests based on filter
    prisma.guest.count({ where: { businessId: businessId as string, createdAt: dateFilter } }),

    // New guests this month (for stat)
    prisma.guest.count({
      where: { businessId: businessId as string, createdAt: { gte: currentMonthStart } },
    }),

    // Recent bookings with filter
    prisma.booking.findMany({
      where: { businessId: businessId as string, createdAt: dateFilter },
      select: {
        id: true,
        bookingNo: true,
        grandTotal: true,
        paidAmount: true,
        createdAt: true,
        status: true,
        guest: { select: { fullName: true, phone: true } },
        room: { select: { roomNumber: true } }
      },
      orderBy: { createdAt: "desc" },
      take: hasDateFilter ? 200 : 10,
    }),

    // Payment method breakdown with filter
    prisma.payment.groupBy({
      by: ["method"],
      where: { businessId: businessId as string, createdAt: dateFilter },
      _sum: { amount: true },
      _count: true,
    }),

    // Monthly data (always last 6 months for chart)
    prisma.payment.findMany({
      where: {
        businessId: businessId as string,
        createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
      },
      select: { amount: true, createdAt: true },
    }),

    // Top add-ons with filter
    prisma.bookingAddon.groupBy({
      by: ["addonId"],
      where: { booking: { businessId: businessId as string, createdAt: dateFilter } },
      _sum: { totalPrice: true },
      _count: true,
      orderBy: { _count: { addonId: "desc" } },
      take: 5,
    }),
  ]);

  // ── Derived totals ──────────────────────────────────────────────────────────
  // Calculate total income from the actual bookings in the period (sum of paidAmount)
  const incomeDetails = await prisma.booking.aggregate({
    _sum: { paidAmount: true },
    where: { businessId: businessId as string, createdAt: dateFilter }
  });
  
  const revenueAmt = Number(incomeDetails._sum.paidAmount ?? 0);
  const monthRevenueAmt = Number(monthRevenue._sum.amount ?? 0);
  const lastMonthRevenueAmt = Number(lastMonthRevenue._sum.amount ?? 0);
  const revenueGrowth = lastMonthRevenueAmt
    ? pct(monthRevenueAmt - lastMonthRevenueAmt, lastMonthRevenueAmt)
    : 0;

  const totalBookings = bookingCounts.reduce((s, b) => s + b._count, 0);
  const confirmedBookings = bookingCounts.find((b) => b.status === "CONFIRMED")?._count ?? 0;
  const checkedIn = bookingCounts.find((b) => b.status === "CHECKED_IN")?._count ?? 0;
  const checkedOut = bookingCounts.find((b) => b.status === "CHECKED_OUT")?._count ?? 0;
  const cancelled = bookingCounts.find((b) => b.status === "CANCELLED")?._count ?? 0;
  const pending = bookingCounts.find((b) => b.status === "PENDING")?._count ?? 0;
  const occupancyRate = pct(occupiedRooms, rooms);

  // ── Build monthly chart data (last 6 months) ────────────────────────────────
  const monthlyData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const label = d.toLocaleString("en-US", { month: "short" });
    const total = last6Months
      .filter((p) => {
        const pd = new Date(p.createdAt);
        return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
      })
      .reduce((s, p) => s + Number(p.amount), 0);
    return { label, total };
  });

  const maxMonthly = Math.max(...monthlyData.map((m) => m.total), 1);

  // ── Get addon names ──────────────────────────────────────────────────────────
  const addonIds = topAddons.map((a) => a.addonId);
  const addonDetails = await prisma.addon.findMany({
    where: { id: { in: addonIds } },
    select: { id: true, name: true, category: true },
  });
  const addonMap = Object.fromEntries(addonDetails.map((a) => [a.id, a]));

  // ── Status color map ─────────────────────────────────────────────────────────
  const statusStyles: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
    CONFIRMED: "bg-blue-50 text-blue-700 ring-blue-200",
    CHECKED_IN: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    CHECKED_OUT: "bg-zinc-50 text-zinc-500 ring-zinc-200",
    CANCELLED: "bg-red-50 text-red-600 ring-red-200",
    NO_SHOW: "bg-orange-50 text-orange-600 ring-orange-200",
  };

  const serializedRecent = JSON.parse(JSON.stringify(recentBookings));

  return (
    <div className="space-y-8 pb-12 print:pb-0">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="animate-in">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 leading-tight">Reports</h1>
          <p className="mt-1 text-zinc-500 font-medium">Business performance and analytics.</p>
        </div>
        <div className="animate-in delay-100 no-print">
          <Suspense fallback={<div className="h-10 w-48 bg-zinc-100 animate-pulse rounded-xl" />}>
            <ReportFilters 
              data={serializedRecent} 
              totalIncome={revenueAmt} 
              period={hasDateFilter ? `${from} to ${to}` : 'All Time'} 
            />
          </Suspense>
        </div>
      </div>

      {/* ── Print Header ───────────────────────────────────────────────────── */}
      <div className="hidden print:block border-b-2 border-zinc-900 pb-6 mb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter">GrandHotel Performance Report</h1>
        <div className="mt-2 text-sm font-bold text-zinc-500 flex justify-between">
          <span>{hasDateFilter ? `Period: ${from} to ${to}` : 'All Time Performance'}</span>
          <span>Generated on: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-in delay-200">
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">{hasDateFilter ? 'Filtered Revenue' : 'Total Revenue'}</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 no-print">
              <Banknote className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-zinc-900">{formatMoney(revenueAmt)}</p>
          <p className="mt-1 text-xs font-bold text-zinc-400">{hasDateFilter ? 'Current Selection' : 'All time'}</p>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Monthly Revenue</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 no-print">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-zinc-900">{formatMoney(monthRevenueAmt)}</p>
          <div className={`mt-1 flex items-center gap-1 ${revenueGrowth === 0 ? 'hidden' : ''}`}>
            <ArrowUpRight className={`h-3.5 w-3.5 font-bold ${revenueGrowth >= 0 ? "text-emerald-500" : "text-red-400 rotate-180"}`} />
            <p className={`text-xs font-bold ${revenueGrowth >= 0 ? "text-emerald-500" : "text-red-400"}`}>
              {revenueGrowth >= 0 ? "+" : ""}{revenueGrowth}% growth vs last month
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Live Occupancy</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 no-print">
              <BedDouble className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-zinc-900">{occupancyRate}%</p>
          <p className="mt-1 text-xs font-bold text-zinc-400">{occupiedRooms} rooms in use</p>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Guests</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 no-print">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-zinc-900">{hasDateFilter ? totalGuests : totalGuests}</p>
          <p className="mt-1 text-xs font-bold text-zinc-400">{hasDateFilter ? 'Registered in period' : `+${newGuestsCount} this month`}</p>
        </div>
      </div>

      {/* ── Mid row ─────────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-5 animate-in delay-300">
        <section className="glass-panel lg:col-span-3 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 no-print">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900">Revenue Trend</h2>
              <p className="text-xs font-medium text-zinc-400">Last 6 months overall</p>
            </div>
          </div>
          <div className="flex items-end gap-3 h-48 print:h-32">
            {monthlyData.map((m) => {
              const barH = maxMonthly > 0 ? Math.max(4, Math.round((m.total / maxMonthly) * 100)) : 4;
              const isCurrentMonth = m.label === now.toLocaleString("en-US", { month: "short" });
              return (
                <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
                  <p className="text-[10px] font-black text-zinc-400 tabular-nums">
                    {m.total > 0 ? formatMoney(m.total).replace("LKR", "").trim() : "–"}
                  </p>
                  <div className="w-full flex items-end justify-center" style={{ height: "120px" }}>
                    <div
                      className={`w-full rounded-t-xl transition-all ${isCurrentMonth ? "bg-blue-600" : "bg-zinc-200"}`}
                      style={{ height: `${barH}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">{m.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="glass-panel lg:col-span-2 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 no-print">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900">Bookings by Status</h2>
              <p className="text-xs font-medium text-zinc-400">{hasDateFilter ? 'In selected period' : 'All time'}</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: "Checked In", count: checkedIn, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Confirmed", count: confirmedBookings, icon: CalendarCheck, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Checked Out", count: checkedOut, icon: DoorOpen, color: "text-zinc-500", bg: "bg-zinc-100" },
              { label: "Pending", count: pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Cancelled", count: cancelled, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${s.bg} ${s.color} no-print`}>
                  <s.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <p className="text-xs font-bold text-zinc-700">{s.label}</p>
                    <p className="text-xs font-black text-zinc-900">{s.count}</p>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.bg.replace("bg-", "bg-").replace("-50", "-400").replace("-100", "-300")}`}
                      style={{ width: `${pct(s.count, totalBookings)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Bottom row ──────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3 animate-in delay-400">
        <section className="glass-panel lg:col-span-2 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 no-print">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900">{hasDateFilter ? 'Filtered' : 'Recent'} Bookings</h2>
              <p className="text-xs font-medium text-zinc-400">{hasDateFilter ? `${totalBookings} bookings in period` : 'Last 8 records'}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="pb-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Booking #</th>
                  <th className="pb-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Guest</th>
                  <th className="pb-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Room</th>
                  <th className="pb-3 text-right text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Payable</th>
                  <th className="pb-3 text-right text-[10px] font-black uppercase tracking-widest text-zinc-400">Advance Paid</th>
                  <th className="pb-3 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {serializedRecent.map((b: any) => (
                  <tr key={b.id} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3 font-black text-zinc-900 text-xs">{b.bookingNo}</td>
                    <td className="py-3 font-bold text-zinc-700 text-xs truncate max-w-[120px]">{b.guest.fullName}</td>
                    <td className="py-3 font-bold text-zinc-500 text-xs">#{b.room.roomNumber}</td>
                    <td className="py-3 text-right font-black text-zinc-900 text-xs">{formatMoney(b.grandTotal)}</td>
                    <td className="py-3 text-right font-black text-emerald-600 text-xs">{formatMoney(b.paidAmount)}</td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ring-1 ${statusStyles[b.status] ?? "bg-zinc-50 text-zinc-500 ring-zinc-200"}`}>
                        {b.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
                {serializedRecent.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-400 font-medium italic text-sm">
                      No records found for this selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-6">
          <section className="glass-panel rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 no-print">
                <CreditCard className="h-4 w-4" />
              </div>
              <h2 className="text-base font-black text-zinc-900">Payments by Method</h2>
            </div>
            <div className="space-y-3">
              {paymentMethods.length === 0 && (
                <p className="text-xs text-zinc-400 italic font-medium">No data available.</p>
              )}
              {paymentMethods.map((pm) => (
                <div key={pm.method} className="flex items-center justify-between">
                  <p className="text-xs font-bold text-zinc-700">{pm.method.replace("_", " ")}</p>
                  <div className="text-right">
                    <p className="text-xs font-black text-zinc-900">{formatMoney(Number(pm._sum.amount ?? 0))}</p>
                    <p className="text-[10px] text-zinc-400 font-bold">{pm._count} records</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 no-print">
                <PlusSquare className="h-4 w-4" />
              </div>
              <h2 className="text-base font-black text-zinc-900">Top Add-ons</h2>
            </div>
            <div className="space-y-3">
              {topAddons.length === 0 && (
                <p className="text-xs text-zinc-400 italic font-medium">No data available.</p>
              )}
              {topAddons.map((a) => {
                const addon = addonMap[a.addonId];
                return (
                  <div key={a.addonId} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-zinc-700">{addon?.name ?? "Unknown"}</p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{addon?.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-zinc-900">{formatMoney(Number(a._sum.totalPrice ?? 0))}</p>
                      <p className="text-[10px] text-zinc-400 font-bold">{a._count} usage</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
