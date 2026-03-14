import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toggleBusinessStatusAction } from "@/app/actions/super-admin.actions";
import { formatDate } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, Zap, Layers, Calendar, ChevronRight, Hotel } from "lucide-react";

export default async function SuperAdminHotelsPage() {
  const hotels = await prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { users: true, bookings: true } } },
  });

  return (
    <div className="space-y-12 max-w-7xl pb-20">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between animate-in slide-in-from-bottom-5 duration-700">
        <div>
          <h1 className="text-5xl font-black tracking-tighter italic">Hotel <span className="text-zinc-500">Inventory</span></h1>
          <p className="mt-2 text-zinc-500 font-medium italic text-lg">Managing the life-cycle of all partner businesses.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {hotels.map((hotel, idx) => {
          const isTrial = hotel.accessStatus === "TRIAL";
          const isTrialExpired = isTrial && new Date() > hotel.trialEndsAt;
          
          return (
            <div 
              key={hotel.id} 
              className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-8 transition-all hover:border-white/20 animate-in fade-in duration-700"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                <div className="flex items-start gap-6">
                  <div className={`h-20 w-20 rounded-3xl flex items-center justify-center p-0.5 shadow-2xl transition-transform group-hover:scale-110 duration-500 ${
                    hotel.isActive ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-zinc-800'
                  }`}>
                    <div className="h-full w-full rounded-[20px] bg-black flex items-center justify-center text-3xl font-black">
                      {hotel.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-3xl font-black tracking-tight">{hotel.name}</h2>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                        hotel.isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {hotel.isActive ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                        {hotel.isActive ? 'Active' : 'Suspended'}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-zinc-500 text-sm font-bold">
                      <span className="flex items-center gap-1.5"><Layers className="h-4 w-4" /> {hotel.plan}</span>
                      <span className="flex items-center gap-1.5"><Zap className="h-4 w-4" /> {hotel.accessStatus}</span>
                      <span className="flex items-center gap-1.5 italic underline underline-offset-4 decoration-zinc-700">{hotel.slug}.hotel.admin</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:px-8 lg:border-l lg:border-r border-white/5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Users</p>
                    <p className="text-xl font-black">{hotel._count.users}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Bookings</p>
                    <p className="text-xl font-black">{hotel._count.bookings}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-blue-500" />
                      Trial Expiry
                    </p>
                    <p className={`text-xl font-black ${isTrialExpired ? 'text-red-500 line-through opacity-50' : ''}`}>
                      {formatDate(hotel.trialEndsAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <form action={toggleBusinessStatusAction.bind(null, hotel.id, hotel.isActive)}>
                    <Button 
                      type="submit" 
                      className={`h-14 px-8 rounded-2xl font-black transition-all active:scale-95 ${
                        hotel.isActive 
                          ? 'bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20' 
                          : 'bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-500/20'
                      }`}
                    >
                      {hotel.isActive ? "Suspend Access" : "Re-activate Hub"}
                    </Button>
                  </form>
                  <Button className="h-14 w-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center p-0 transition-all border border-white/5">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Background Accent */}
              <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] -mr-16 -mt-16 opacity-20 pointer-events-none transition-colors ${
                hotel.isActive ? 'bg-blue-600' : 'bg-red-600'
              }`}></div>
            </div>
          );
        })}

        {hotels.length === 0 && (
          <div className="py-40 text-center rounded-[3rem] border-2 border-dashed border-white/5 bg-zinc-900/40 backdrop-blur-3xl">
            <Hotel className="h-16 w-16 text-zinc-800 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-zinc-500 italic">No hotels found in the global registry.</h3>
          </div>
        )}
      </div>
    </div>
  );
}
