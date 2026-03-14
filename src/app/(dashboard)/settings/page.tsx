import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/session";
import { Building2, Save, Globe, Shield, Bell, CreditCard } from "lucide-react";
import { SettingsForm } from "@/components/forms/business-settings-form";

export default async function SettingsPage() {
  const businessId = await getBusinessId();
  
  const business = await prisma.business.findUnique({
    where: { id: businessId as string },
  });

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-zinc-500 font-medium italic">Business settings not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">Settings</h1>
        <p className="mt-1 text-zinc-500 font-medium">Manage your hotel details and preferences.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1 space-y-1">
          {[
            { label: "General", icon: Building2, active: true },
            { label: "Website", icon: Globe, active: false },
            { label: "Security", icon: Shield, active: false },
            { label: "Notifications", icon: Bell, active: false },
            { label: "Billing", icon: CreditCard, active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                item.active
                  ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/10"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          <section className="glass-panel rounded-3xl p-8">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-zinc-900">General Information</h2>
              <p className="text-sm text-zinc-500 font-medium">This is how your business appears to guests.</p>
            </div>

            <SettingsForm business={business} />
          </section>

          {/* Dummy Sections for visual completeness */}
          <section className="glass-panel rounded-3xl p-8 opacity-50 grayscale pointer-events-none">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-zinc-900">Logo & Branding</h2>
              <p className="text-xs text-zinc-500">Coming soon</p>
            </div>
            <div className="h-20 w-20 rounded-2xl bg-zinc-100 border-2 border-dashed border-zinc-200 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-zinc-300" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
