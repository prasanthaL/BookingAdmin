import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/session";
import { 
  Plus, 
  Filter, 
  Download,
} from "lucide-react";
import { BookingTable } from "@/components/bookings/booking-table";
import { BookingSearch } from "@/components/bookings/booking-search";
import { Suspense } from "react";

interface BookingsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function BookingsPage(props: BookingsPageProps) {
  const searchParams = await props.searchParams;
  const q = searchParams.q;
  const businessId = (await getBusinessId()) as string;

  const [bookings, stats] = await Promise.all([
    prisma.booking.findMany({
      where: {
        businessId,
        ...(q ? {
          OR: [
            { bookingNo: { contains: q, mode: "insensitive" } },
            { guest: { fullName: { contains: q, mode: "insensitive" } } },
            { room: { roomNumber: { contains: q, mode: "insensitive" } } },
          ]
        } : {})
      },
      orderBy: { createdAt: "desc" },
      include: {
        guest: { select: { fullName: true, email: true } },
        room: { select: { roomNumber: true, roomType: { select: { name: true } } } },
      },
    }),
    prisma.booking.groupBy({
      by: ['status'],
      where: { businessId },
      _count: { _all: true }
    })
  ]);

  const serializedBookings = JSON.parse(JSON.stringify(bookings));
  
  // Calculate some quick stats
  const pendingCount = stats.find(s => s.status === 'PENDING')?._count._all || 0;
  const confirmedCount = stats.find(s => s.status === 'CONFIRMED')?._count._all || 0;
  const activeCount = stats.find(s => s.status === 'CHECKED_IN')?._count._all || 0;

  return (
    <div className="space-y-10 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between animate-in">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-zinc-900 sm:text-5xl">
            Reservations <span className="text-zinc-400">& Bookings</span>
          </h1>
          <p className="mt-2 text-zinc-500 font-medium italic">Manage guest stays and track occupancy status.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/bookings/new"
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-zinc-900 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-zinc-800 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
            <Plus className="h-4 w-4 relative" />
            <span className="relative">Create Reservation</span>
          </Link>
        </div>
      </div>

      {/* Controller Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between animate-in delay-200 glass-panel rounded-3xl p-2 bg-white/50 backdrop-blur-sm">
        <Suspense>
          <BookingSearch />
        </Suspense>
        <div className="flex items-center gap-2 pr-2">
          <button className="inline-flex h-12 items-center gap-2 rounded-2xl border border-zinc-100 bg-white px-5 text-xs font-black uppercase tracking-widest text-zinc-900 transition-all hover:bg-zinc-50 active:scale-95">
            <Filter className="h-4 w-4 text-zinc-400" />
            Filter
          </button>
          <button className="inline-flex h-12 items-center gap-2 rounded-2xl bg-zinc-900 px-6 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-zinc-800 active:scale-95">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Booking Table Section */}
      <div className="glass-panel overflow-hidden rounded-[2.5rem] animate-in delay-300">
        <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
          <h2 className="text-xl font-black text-zinc-900">Recent Reservations</h2>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Updated just now</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <BookingTable rows={serializedBookings as any[]} />
        </div>
      </div>
    </div>
  );
}
