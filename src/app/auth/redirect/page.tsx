import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function AuthRedirectPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as any).role;
  const businessId = (session.user as any).businessId;

  if (role === "SUPER_ADMIN") {
    redirect("/super-admin");
  }

  if (!businessId) {
    // This shouldn't happen for ADMINs unless business was deleted
    redirect("/login");
  }

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) redirect("/login");

  const now = new Date();
  const trialExpired = now > business.trialEndsAt;
  const paidActive = business.accessStatus === "ACTIVE";

  if (!business.isActive || ["SUSPENDED", "DEACTIVATED"].includes(business.accessStatus)) {
    redirect("/blocked");
  }

  // If trial expired and hasn't upgraded to paid
  if (trialExpired && !paidActive && business.accessStatus !== "ACTIVE") {
    redirect("/billing/upgrade");
  }

  redirect("/dashboard");
}
