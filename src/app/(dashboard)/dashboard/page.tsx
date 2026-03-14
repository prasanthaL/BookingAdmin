import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  Plus,
  Activity,
  Calendar,
  DoorOpen,
  Users,
  TrendingUp,
  ArrowRight,
  LucideIcon,
  Hotel
} from "lucide-react";
import { getBusinessId } from "@/lib/session";
import { redirect } from "next/navigation";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: string;
  color: string;
  bg: string;
  delay: string;
}

function StatCard({ label, value, subValue, icon: Icon, trend, color, bg, delay }: StatCardProps) {
  return (
    <div className={`animate-in ${delay} glass-panel group rounded-3xl p-6 hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-500 hover:-translate-y-1`}>
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${bg} ${color} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{label}</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-zinc-900">{value}</h2>
            {subValue && <p className="mt-1 text-xs font-bold text-zinc-500">{subValue}</p>}
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600 ring-1 ring-emerald-100">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const businessId = await getBusinessId();
  if (!businessId) {
    redirect("/login");
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    bookingsCount,
    totalRooms,
    availableRooms,
    guestsCount,
    recentBookings,
    revenueData,
    occupancyStatus
  ] = await Promise.all([
    prisma.booking.count({ 
      where: { 
        businessId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] } 
      } 
    }),
    prisma.room.count({ where: { businessId } }),
    prisma.room.count({ 
      where: { 
        businessId,
        status: "AVAILABLE" 
      } 
    }),
    prisma.guest.count({ where: { businessId } }),
    prisma.booking.findMany({
      where: { businessId },
      take: 5,
      include: { guest: true, room: { include: { roomType: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.booking.aggregate({
      where: { 
        businessId,
        createdAt: { gte: startOfMonth },
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] }
      },
      _sum: { grandTotal: true }
    }),
    prisma.room.groupBy({
      by: ['status'],
      where: { businessId },
      _count: { _all: true }
    })
  ]);

  const monthlyRevenue = revenueData._sum?.grandTotal ? Number(revenueData._sum.grandTotal) : 0;
  const occupancyRate = totalRooms > 0 ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) : 0;

  return (
    <div className="space-y-10 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="animate-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">System Live</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-zinc-900 sm:text-5xl">
            Overview <span className="text-zinc-400">Dashboard</span>
          </h1>
          <p className="mt-2 text-zinc-500 font-medium">Monitoring your resort performance in real-time.</p>
        </div>
        
        <div className="flex items-center gap-3 animate-in delay-100">
          <Link 
            href="/bookings/new"
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-zinc-900 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-zinc-800 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
            <Plus className="h-4 w-4 relative" />
            <span className="relative">Create New Booking</span>
          </Link>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Active Bookings" 
          value={bookingsCount} 
          subValue="Confirmed & Pending"
          icon={Calendar} 
          trend="+12%"
          color="text-blue-600" 
          bg="bg-blue-50"
          delay="delay-100"
        />
        <StatCard 
          label="Occupancy Rate" 
          value={`${occupancyRate}%`} 
          subValue={`${totalRooms - availableRooms} rooms occupied`}
          icon={DoorOpen} 
          color="text-purple-600" 
          bg="bg-purple-50"
          delay="delay-200"
        />
        <StatCard 
          label="Total Guests" 
          value={guestsCount} 
          subValue="Registered individuals"
          icon={Users} 
          color="text-emerald-600" 
          bg="bg-emerald-50"
          delay="delay-300"
        />
        <StatCard 
          label="Monthly Revenue" 
          value={`$${monthlyRevenue.toLocaleString()}`} 
          subValue="Total this month"
          icon={TrendingUp} 
          trend="+8%"
          color="text-amber-600" 
          bg="bg-amber-50"
          delay="delay-400"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Bookings - Large Section */}
        <section className="animate-in delay-500 lg:col-span-2 glass-panel rounded-[2rem] overflow-hidden">
          <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
            <div>
              <h2 className="text-xl font-black text-zinc-900">Recent Activity</h2>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Daily Reservations</p>
            </div>
            <Link href="/bookings" className="group flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400 transition-all hover:bg-zinc-900 hover:text-white">
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="p-4">
            {recentBookings.length > 0 ? (
              <div className="space-y-2">
                {recentBookings.map((booking: any) => (
                  <div key={booking.id} className="group flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-zinc-50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 font-black text-zinc-900 transition-all group-hover:bg-white group-hover:shadow-sm group-hover:scale-105">
                      {booking.room?.roomNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-black text-zinc-900">{booking.guest?.fullName || "Guest"}</p>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          booking.status === 'CONFIRMED' ? 'bg-emerald-500' : 
                          booking.status === 'CHECKED_IN' ? 'bg-blue-500' : 'bg-amber-500'
                        }`}></span>
                      </div>
                      <p className="truncate text-xs font-bold text-zinc-400">{booking.room?.roomType?.name} • {booking.nights} nights</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-zinc-900">${Number(booking.grandTotal).toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                        {new Date(booking.checkInDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-zinc-50 text-zinc-200">
                  <Activity className="h-10 w-10" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">Quiet for now</h3>
                <p className="text-zinc-400 max-w-xs mx-auto text-sm mt-1">No recent bookings have been recorded in the system yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Sidebar Status / Quick Stats */}
        <div className="space-y-8">
          {/* Room Status Summary */}
          <section className="animate-in delay-600 glass-panel rounded-[2rem] p-8">
            <h3 className="text-lg font-black text-zinc-900 mb-6">Room Status</h3>
            <div className="space-y-6">
              {occupancyStatus.map((status) => (
                <div key={status.status} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-zinc-500">
                    <span>{status.status.replace('_', ' ')}</span>
                    <span className="text-zinc-900">{(status._count as any)._all}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        status.status === 'AVAILABLE' ? 'bg-emerald-500' :
                        status.status === 'OCCUPIED' ? 'bg-blue-600' :
                        status.status === 'DIRTY' ? 'bg-amber-500' : 'bg-zinc-400'
                      }`}
                      style={{ width: `${((status._count as any)._all / (totalRooms || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {occupancyStatus.length === 0 && (
                <p className="text-center text-sm text-zinc-400 italic py-4">No room data available</p>
              )}
            </div>
          </section>

          {/* Quick Actions / Info */}
          <section className="animate-in delay-700 banner-gradient rounded-[2rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-transform group-hover:scale-150"></div>
            <Activity className="h-8 w-8 mb-4 text-white/50" />
            <h3 className="text-xl font-black mb-2">Efficiency Pro tip</h3>
            <p className="text-blue-50 text-sm leading-relaxed font-medium mb-6">
              You can now export daily booking reports directly from the reports tab for easier accounting.
            </p>
            <Link 
              href="/reports" 
              className="inline-flex h-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md px-6 text-xs font-black uppercase tracking-widest hover:bg-white/30 transition-colors"
            >
              Go to reports
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
