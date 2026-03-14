import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SuperSidebar } from "@/components/layout/super-sidebar";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "SUPER_ADMIN") redirect("/auth/redirect");

  return (
    <div className="flex min-h-screen bg-[#060606] text-white">
      <SuperSidebar user={{ name: session.user.name }} />

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-12 overflow-y-auto lg:ml-80 pt-20 lg:pt-12">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
