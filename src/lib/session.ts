import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function getSession() {
  return await auth();
}

export async function getRequiredSession() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function getBusinessId() {
  const session = await getRequiredSession();
  const businessId = (session.user as any).businessId;
  if (!businessId) {
    // If it's a super admin, they might not have a businessId
    if ((session.user as any).role === "SUPER_ADMIN") {
      return null;
    }
    redirect("/login");
  }
  return businessId as string;
}
