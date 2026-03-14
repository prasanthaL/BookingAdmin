"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createBookingSchema } from "@/schemas/booking.schema";
import { calculateAddonLineTotal, calculateNights } from "@/lib/calculations";
import { DEMO_BUSINESS_ID } from "@/lib/constants";
import type { ActionState } from "@/types/action-state";
import { getBusinessId } from "@/lib/session";

export async function createBookingAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    guestId: String(formData.get("guestId") ?? ""),
    roomId: String(formData.get("roomId") ?? ""),
    checkInDate: String(formData.get("checkInDate") ?? ""),
    checkOutDate: String(formData.get("checkOutDate") ?? ""),
    adults: formData.get("adults"),
    children: formData.get("children"),
    discount: formData.get("discount"),
    advanceAmount: formData.get("advanceAmount"),
    notes: String(formData.get("notes") ?? ""),
    addons: JSON.parse(String(formData.get("addons") ?? "[]")),
  };

  const parsed = createBookingSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the form errors.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const businessId = (await getBusinessId()) as string;

  const room = await prisma.room.findFirst({
    where: { id: data.roomId, businessId },
    include: { roomType: true },
  });

  if (!room) {
    return { success: false, message: "Room not found." };
  }

  const overlap = await prisma.booking.findFirst({
    where: {
      businessId,
      roomId: data.roomId,
      status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] },
      AND: [
        { checkInDate: { lt: new Date(data.checkOutDate) } },
        { checkOutDate: { gt: new Date(data.checkInDate) } },
      ],
    },
  });

  if (overlap) {
    return { success: false, message: "This room is already booked for the selected dates." };
  }

  const nights = calculateNights(data.checkInDate, data.checkOutDate);
  const roomRate = Number(room.roomType.basePrice);
  const roomTotal = roomRate * nights;

  const addonTotal = data.addons.reduce((sum, item) => {
    return (
      sum +
      calculateAddonLineTotal({
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        priceType: item.priceType,
        nights,
        adults: data.adults,
      })
    );
  }, 0);

  const grandTotal = roomTotal + addonTotal - data.discount;
  const paidAmount = data.advanceAmount;
  const dueAmount = grandTotal - paidAmount;

  const booking = await prisma.booking.create({
    data: {
      businessId,
      guestId: data.guestId,
      roomId: data.roomId,
      bookingNo: `BK-${Date.now()}`,
      checkInDate: new Date(data.checkInDate),
      checkOutDate: new Date(data.checkOutDate),
      nights,
      adults: data.adults,
      children: data.children,
      roomTotal,
      addonTotal,
      discount: data.discount,
      grandTotal,
      paidAmount,
      dueAmount,
      notes: data.notes,
      addons: {
        create: data.addons.map((item: any) => ({
          addonId: item.addonId,
          serviceDate: item.serviceDate ? new Date(item.serviceDate) : null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: calculateAddonLineTotal({
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            priceType: item.priceType,
            nights,
            adults: data.adults,
          }),
          notes: item.notes,
        })),
      },
      payments: data.advanceAmount > 0 ? {
        create: {
          businessId,
          amount: data.advanceAmount,
          method: "CASH",
          notes: "Advance payment during booking",
        },
      } : undefined,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/bookings");
  redirect(`/bookings/${booking.id}`);
}

export async function checkInBookingAction(bookingId: string) {
  const businessId = (await getBusinessId()) as string;
  const booking = await prisma.booking.findFirst({ 
    where: { id: bookingId, businessId } 
  });
  if (!booking) return;

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId, businessId },
      data: { status: "CHECKED_IN" },
    }),
    prisma.room.update({
      where: { id: booking.roomId },
      data: { status: "OCCUPIED" },
    }),
    prisma.checkinLog.create({
      data: { bookingId },
    }),
  ]);

  revalidatePath(`/bookings/${bookingId}`);
  revalidatePath("/bookings");
}

export async function checkOutBookingAction(bookingId: string) {
  const businessId = (await getBusinessId()) as string;
  const booking = await prisma.booking.findFirst({ 
    where: { id: bookingId, businessId } 
  });
  if (!booking) return;

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CHECKED_OUT" },
    }),
    prisma.room.update({
      where: { id: booking.roomId },
      data: { status: "DIRTY" },
    }),
    prisma.checkoutLog.create({
      data: { bookingId },
    }),
  ]);

  revalidatePath(`/bookings/${bookingId}`);
  revalidatePath("/bookings");
}
