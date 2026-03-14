"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { type PaymentMethod } from "@prisma/client";
import { getBusinessId } from "@/lib/session";

export async function createPaymentAction(formData: FormData) {
  const businessId = await getBusinessId();
  if (!businessId) return { success: false, message: "Unauthorized." };

  const bookingId = String(formData.get("bookingId") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const method = String(formData.get("method") ?? "CASH") as PaymentMethod;
  const notes = String(formData.get("notes") ?? "");

  if (!bookingId || amount <= 0) {
    return { success: false, message: "Invalid payment details." };
  }

  try {
    const booking = await prisma.booking.findUnique({ 
      where: { id: bookingId } 
    });
    
    if (!booking || booking.businessId !== businessId) {
      return { success: false, message: "Booking not found or unauthorized." };
    }

    await prisma.$transaction([
      prisma.payment.create({
        data: {
          businessId: businessId as string,
          bookingId,
          amount,
          method,
          notes,
        },
      }),
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          paidAmount: { increment: amount },
          dueAmount: { decrement: amount },
        },
      }),
    ]);

    revalidatePath("/payments");
    revalidatePath("/dashboard");
    revalidatePath("/bookings");
    revalidatePath(`/bookings/${bookingId}`);

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to record payment." };
  }
}
