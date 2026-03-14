"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/session";
import { guestSchema, addonSchema, roomSchema, roomTypeSchema } from "@/schemas/entities.schema";

// ─── GUEST ────────────────────────────────────────────────────────────────────

export async function createGuestAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = guestSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: "Please check the form errors." };
  
  const businessId = (await getBusinessId()) as string;
  try {
    await prisma.guest.create({ data: { ...parsed.data, businessId } });
    revalidatePath("/guests");
    redirect("/guests");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return { success: false, message: "Failed to create guest." };
  }
}

export async function updateGuestAction(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = guestSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: "Please check the form errors." };
  
  const businessId = (await getBusinessId()) as string;
  try {
    await prisma.guest.update({ 
      where: { id, businessId }, 
      data: parsed.data 
    });
    revalidatePath("/guests");
    redirect("/guests");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return { success: false, message: "Failed to update guest." };
  }
}

export async function deleteGuestAction(id: string) {
  const businessId = (await getBusinessId()) as string;
  try {
    await prisma.guest.delete({ 
      where: { id, businessId } 
    });
    revalidatePath("/guests");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to delete guest." };
  }
}

// ─── ADDON ────────────────────────────────────────────────────────────────────

export async function createAddonAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = addonSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: "Please check the form errors." };

  const businessId = (await getBusinessId()) as string;
  try {
    await prisma.addon.create({ data: { ...parsed.data, businessId } });
    revalidatePath("/addons");
    redirect("/addons");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return { success: false, message: "Failed to create add-on." };
  }
}

export async function updateAddonAction(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = addonSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: "Please check the form errors." };

  const businessId = (await getBusinessId()) as string;
  try {
    await prisma.addon.update({ 
      where: { id, businessId }, 
      data: parsed.data 
    });
    revalidatePath("/addons");
    redirect("/addons");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return { success: false, message: "Failed to update add-on." };
  }
}

export async function deleteAddonAction(id: string) {
  const businessId = (await getBusinessId()) as string;
  try {
    await prisma.addon.delete({ 
      where: { id, businessId } 
    });
    revalidatePath("/addons");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to delete add-on." };
  }
}

// ─── ROOM ─────────────────────────────────────────────────────────────────────

export async function createRoomAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = roomSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: "Please check the form errors." };

  const businessId = (await getBusinessId()) as string;
  try {
    const existing = await prisma.room.findFirst({
      where: { roomNumber: parsed.data.roomNumber, businessId },
    });
    if (existing) return { success: false, message: "Room number already exists." };
    await prisma.room.create({ data: { ...parsed.data, businessId } });
    revalidatePath("/rooms");
    redirect("/rooms");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return { success: false, message: "Failed to create room." };
  }
}

export async function updateRoomAction(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = roomSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: "Please check the form errors." };

  const businessId = (await getBusinessId()) as string;
  try {
    await prisma.room.update({ 
      where: { id, businessId }, 
      data: parsed.data 
    });
    revalidatePath("/rooms");
    redirect("/rooms");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return { success: false, message: "Failed to update room." };
  }
}

export async function deleteRoomAction(id: string) {
  const businessId = (await getBusinessId()) as string;
  try {
    await prisma.room.delete({ 
      where: { id, businessId } 
    });
    revalidatePath("/rooms");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to delete room." };
  }
}

// ─── ROOM TYPE ───────────────────────────────────────────────────────────────

export async function createRoomTypeAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = roomTypeSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: "Please check the form errors." };

  const businessId = (await getBusinessId()) as string;
  try {
    await prisma.roomType.create({ data: { ...parsed.data, businessId } });
    revalidatePath("/rooms");
    redirect("/rooms?tab=categories");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return { success: false, message: "Failed to create category." };
  }
}

export async function updateRoomTypeAction(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = roomTypeSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: "Please check the form errors." };

  const businessId = (await getBusinessId()) as string;
  try {
    await prisma.roomType.update({ 
      where: { id, businessId }, 
      data: parsed.data 
    });
    revalidatePath("/rooms");
    redirect("/rooms?tab=categories");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return { success: false, message: "Failed to update category." };
  }
}

export async function deleteRoomTypeAction(id: string) {
  try {
    const businessId = (await getBusinessId()) as string;
    // Check if any rooms use this type
    const count = await prisma.room.count({ where: { roomTypeId: id, businessId } });
    if (count > 0) return { success: false, message: "Cannot delete category with associated rooms." };
    
    await prisma.roomType.delete({ where: { id, businessId } });
    revalidatePath("/rooms");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to delete category." };
  }
}
