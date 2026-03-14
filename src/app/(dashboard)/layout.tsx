import { Building2, ChevronDown } from "lucide-react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/layout/logout-button";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

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
    <div className="min-h-screen bg-zinc-50/50">
      <DashboardSidebar 
        business={{ name: business.name, id: business.id }}
        user={{ name: session.user.name, email: session.user.email }}
        role={role}
        initials={initials}
      />

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen transition-all duration-300 ease-in-out pt-16 lg:pt-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in">
          {children}
        </div>
      </main>
    </div>
  );
}
