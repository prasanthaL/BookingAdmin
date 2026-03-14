import { Building2, ChevronDown } from "lucide-react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/layout/logout-button";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const businessId = (session.user as any).businessId;
  const role = (session.user as any).role;

  // Protect against non-admin access to hotel dashboard
  if (role !== "ADMIN") redirect("/auth/redirect");

  const business = await prisma.business.findUnique({
    where: { id: businessId }
  }) as any; // Cast to any to bypass stale type definitions if prisma generate hasn't refreshed the IDE cache

  if (!business) redirect("/login");

  // Multi-tenant Access Gating
  const now = new Date();
  const trialEndsAt = business.trialEndsAt ? new Date(business.trialEndsAt) : now;
  const trialExpired = now > trialEndsAt;
  const accessStatus = business.accessStatus || "TRIAL";
  const paidActive = accessStatus === "ACTIVE";

  if (!business.isActive || ["SUSPENDED", "DEACTIVATED"].includes(accessStatus)) {
    redirect("/blocked");
  }

  if (trialExpired && !paidActive && accessStatus !== "ACTIVE") {
    redirect("/billing/upgrade");
  }

  const initials = (session.user.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex min-h-screen bg-zinc-50/50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-68 bg-zinc-950 text-zinc-400">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              {business.name}
            </span>
          </div>
        </div>

        <div className="px-4 py-4">
          <button className="flex w-full items-center justify-between rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-zinc-800 transition-all hover:bg-zinc-800">
            <span className="truncate">{business.name}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />
          </button>
        </div>

        <div className="flex flex-col justify-between h-[calc(100vh-140px)]">
          <SidebarNav />

          <div className="mt-auto px-4 pb-6">
            <div className="flex items-center gap-3 rounded-2xl bg-zinc-900/50 p-3 ring-1 ring-zinc-800/50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-600/20 text-sm">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-bold text-white">{session.user.name}</p>
                <p className="truncate text-[10px] text-zinc-500">{session.user.email}</p>
                <p className="truncate text-[10px] text-zinc-600 capitalize">{role.toLowerCase()}</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-68 flex-1 p-8">
        <div className="mx-auto max-w-7xl animate-in">{children}</div>
      </main>
    </div>
  );
}
