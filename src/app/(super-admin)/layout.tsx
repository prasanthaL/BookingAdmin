import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sparkles, Hotel, LayoutDashboard, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/layout/logout-button";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "SUPER_ADMIN") redirect("/auth/redirect");

  return (
    <div className="flex min-h-screen bg-[#060606] text-white">
      {/* Sidebar */}
      <aside className="w-80 border-r border-white/5 bg-black/50 backdrop-blur-3xl flex flex-col p-8">
        <div className="flex items-center gap-3 mb-16">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black tracking-tight text-xl">Admin<span className="text-zinc-500">Center</span></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Super Admin</span>
          </div>
        </div>

        <nav className="space-y-2 flex-grow">
          <Link href="/super-admin" className="flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/5 transition-all group font-bold">
            <LayoutDashboard className="h-5 w-5 text-zinc-500 group-hover:text-white transition-colors" />
            Overview
          </Link>
          <Link href="/super-admin/hotels" className="flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/5 transition-all group font-bold">
            <Hotel className="h-5 w-5 text-zinc-500 group-hover:text-white transition-colors" />
            Hotels
          </Link>
          <Link href="/super-admin/settings" className="flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/5 transition-all group font-bold">
            <Settings className="h-5 w-5 text-zinc-500 group-hover:text-white transition-colors" />
            System
          </Link>
        </nav>

        <div className="pt-8 border-t border-white/5">
          <div className="flex items-center gap-4 px-4 py-4 mb-6">
            <div className="h-10 w-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-black">SA</div>
            <div className="flex flex-col">
              <span className="text-sm font-bold truncate max-w-[140px]">{session.user.name}</span>
              <span className="text-[10px] text-zinc-500 truncate max-w-[140px] uppercase font-bold tracking-widest leading-none mt-1">Global Root</span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
