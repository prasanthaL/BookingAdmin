import { Shield, Hammer, Bell, Globe, Database, Cpu, Lock } from "lucide-react";

export default function SuperAdminSettings() {
  const categories = [
    {
      title: "Core Infrastructure",
      description: "Manage global server clusters and database nodes.",
      icon: Database,
      items: ["Primary Database Pool", "Edge Cache Locations", "Backup Manifests"],
      color: "blue"
    },
    {
      title: "Security Protocols",
      description: "System-wide authentication and authorization rules.",
      icon: Shield,
      items: ["Global JWT Policy", "Rate Limiting Rules", "IP Blacklist Management"],
      color: "purple"
    },
    {
      title: "System Maintenance",
      description: "Diagnostics and optimization tools for the entire platform.",
      icon: Hammer,
      items: ["Cache Purge (Global)", "Log Retention Policy", "Schema Migration Logs"],
      color: "emerald"
    }
  ];

  return (
    <div className="space-y-12 max-w-7xl animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-tighter mb-4 italic">System <span className="text-zinc-500">Settings</span></h1>
          <p className="text-zinc-500 font-medium text-lg italic tracking-tight">Configure the global parameters of the Booking platform.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <Lock className="h-3 w-3 text-emerald-500" /> Root Access Active
            </div>
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, idx) => (
          <div 
            key={cat.title} 
            className="rounded-[3rem] p-10 border border-white/5 bg-zinc-900/40 backdrop-blur-3xl hover:border-white/10 transition-all group relative overflow-hidden"
            style={{ animationDelay: `${idx * 150}ms` }}
          >
            {/* Background Glow */}
            <div className={`absolute -top-24 -right-24 h-48 w-48 rounded-full blur-[80px] opacity-20 transition-all group-hover:opacity-40 ${
                cat.color === 'blue' ? 'bg-blue-600' :
                cat.color === 'purple' ? 'bg-purple-600' :
                'bg-emerald-600'
            }`}></div>

            <div className={`h-16 w-16 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl transition-transform group-hover:scale-110 duration-700 ${
                cat.color === 'blue' ? 'bg-blue-600/20 text-blue-500' :
                cat.color === 'purple' ? 'bg-purple-600/20 text-purple-500' :
                'bg-emerald-600/20 text-emerald-500'
            }`}>
              <cat.icon className="h-8 w-8" />
            </div>

            <h3 className="text-2xl font-black tracking-tight mb-4">{cat.title}</h3>
            <p className="text-zinc-500 text-sm font-medium mb-8 leading-relaxed italic">{cat.description}</p>
            
            <div className="space-y-4 pt-6 border-t border-white/5">
              {cat.items.map(item => (
                <div key={item} className="flex items-center justify-between group/item cursor-pointer">
                  <span className="text-xs font-bold text-zinc-400 group-hover/item:text-white transition-colors">{item}</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-800 group-hover/item:bg-zinc-400 transition-colors"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Section */}
      <div className="rounded-[4rem] border border-white/5 bg-zinc-900/40 backdrop-blur-3xl overflow-hidden animate-in fade-in duration-1000 delay-500">
          <div className="p-10 sm:p-14 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-3xl font-black tracking-tighter mb-2 italic">Monitoring <span className="text-zinc-500">& Alerts</span></h3>
                <p className="text-zinc-500 font-medium italic">Configure real-time notifications for system events.</p>
              </div>
              <button className="px-8 py-4 rounded-2xl bg-white text-black text-sm font-black uppercase tracking-widest hover:bg-zinc-200 active:scale-95 transition-all">
                  Save Changes
              </button>
          </div>
          <div className="p-10 sm:p-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {[
                  { label: "Notification Channels", value: "Slack, Email, SMS", icon: Bell },
                  { label: "Alert Thresholds", value: "99.9% Uptime", icon: Cpu },
                  { label: "Global Scope", value: "All Edge Nodes", icon: Globe }
              ].map(stat => (
                  <div key={stat.label} className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center">
                              <stat.icon className="h-4 w-4 text-zinc-500" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{stat.label}</span>
                      </div>
                      <span className="text-xl font-black">{stat.value}</span>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
}
