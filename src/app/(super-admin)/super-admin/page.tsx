import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Hotel, Users, CreditCard, TrendingUp, Sparkles } from "lucide-react";

export default async function SuperAdminDashboard() {
  const [totalBusinesses, totalUsers, activeTrials, expiredTrials] = await Promise.all([
    prisma.business.count(),
    prisma.user.count(),
    prisma.business.count({ where: { accessStatus: "TRIAL", trialEndsAt: { gt: new Date() } } }),
    prisma.business.count({ where: { accessStatus: "TRIAL", trialEndsAt: { lt: new Date() } } }),
  ]);

  const stats = [
    { name: "Total Hotels", value: totalBusinesses, icon: Hotel, color: "blue" },
    { name: "Global Users", value: totalUsers, icon: Users, color: "purple" },
    { name: "Active Trials", value: activeTrials, icon: Sparkles, color: "emerald" },
    { name: "Expired Trials", value: expiredTrials, icon: CreditCard, color: "orange" },
  ];

  return (
    <div className="space-y-12 max-w-7xl">
      <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
        <h1 className="text-5xl font-black tracking-tighter mb-4 italic">System <span className="text-zinc-500">Overview</span></h1>
        <p className="text-zinc-500 font-medium text-lg italic">Real-time snapshots of the booking platform's global state.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <div 
            key={stat.name} 
            className="group rounded-[2.5rem] p-8 border border-white/5 bg-zinc-900/40 backdrop-blur-3xl hover:border-white/10 transition-all hover:-translate-y-1 animate-in zoom-in-95 duration-700"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 shadow-xl ${
              stat.color === 'blue' ? 'bg-blue-600/20 text-blue-500 shadow-blue-500/10' :
              stat.color === 'purple' ? 'bg-purple-600/20 text-purple-500 shadow-purple-500/10' :
              stat.color === 'emerald' ? 'bg-emerald-600/20 text-emerald-500 shadow-emerald-500/10' :
              'bg-orange-600/20 text-orange-500 shadow-orange-500/10'
            }`}>
              <stat.icon className="h-7 w-7" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">{stat.name}</p>
            <h2 className="text-4xl font-black tracking-tighter">{stat.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-[3rem] border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-10 animate-in fade-in duration-1000 delay-500">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 italic">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
              Growth Activity
            </h3>
            <button className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">See Details</button>
          </div>
          <div className="h-60 flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-white/5 rounded-[2rem]">
            <p className="font-bold italic">Analytics sync in progress...</p>
          </div>
        </div>

        <div className="rounded-[3rem] border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-10 animate-in fade-in duration-1000 delay-700">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 italic text-zinc-300">
              System Health
            </h3>
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">
              Stable
            </div>
          </div>
          <div className="space-y-6">
            {['API Server', 'Auth Service', 'Primary Database', 'Edge Runtime'].map((service) => (
              <div key={service} className="flex items-center justify-between group">
                <span className="text-zinc-400 font-bold group-hover:text-white transition-colors">{service}</span>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
