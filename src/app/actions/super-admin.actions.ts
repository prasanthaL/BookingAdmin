"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function toggleBusinessStatusAction(businessId: string, current: boolean) {
  await prisma.business.update({
    where: { id: businessId },
    data: {
      isActive: !current,
      accessStatus: current ? "DEACTIVATED" : "ACTIVE",
    },
  });

  revalidatePath("/super-admin/hotels");
}

export async function markBusinessPaidAction(businessId: string, plan: "STARTER" | "PROFESSIONAL" | "ENTERPRISE") {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await prisma.$transaction([
    prisma.business.update({
      where: { id: businessId },
      data: {
        isActive: true,
        plan,
        accessStatus: "ACTIVE",
        subscriptionEndsAt: nextMonth,
      },
    }),
    prisma.subscription.create({
      data: {
        businessId,
        plan,
        provider: "MANUAL",
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
      },
    }),
  ]);

  revalidatePath("/super-admin/hotels");
}
