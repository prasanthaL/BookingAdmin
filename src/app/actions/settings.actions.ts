"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/session";
import { businessSchema } from "@/schemas/entities.schema";

export async function updateBusinessAction(formData: FormData) {
  const businessId = await getBusinessId();
  if (!businessId) return { success: false, message: "Unauthorized." };

  const raw = Object.fromEntries(formData.entries());
  const parsed = businessSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, message: "Please check the form errors." };
  }

  try {
    await prisma.business.update({
      where: { id: businessId as string },
      data: parsed.data,
    });

    revalidatePath("/");
    revalidatePath("/(dashboard)", "layout");
    
    return { success: true, message: "Settings updated successfully." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update settings." };
  }
}
