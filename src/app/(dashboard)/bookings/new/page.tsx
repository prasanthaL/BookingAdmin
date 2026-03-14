import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/session";
import { createBookingAction } from "@/app/actions/booking.actions";
import { BookingForm } from "@/components/forms/booking-form";

export default async function NewBookingPage() {
  const businessId = await getBusinessId();
  const [guests, rooms, addons] = await Promise.all([
    prisma.guest.findMany({ 
      where: { businessId: businessId as string },
      orderBy: { fullName: "asc" } 
    }),
    prisma.room.findMany({
      where: { 
        businessId: businessId as string,
        status: { in: ["AVAILABLE", "RESERVED"] } 
      },
      orderBy: { roomNumber: "asc" },
      include: { roomType: true },
    }),
    prisma.addon.findMany({ 
      where: { 
        businessId: businessId as string,
        active: true 
      }, 
      orderBy: { name: "asc" } 
    }),
  ]);

  // Serialize to plain objects to avoid Decimal/Date serialization issues in Client Components
  const serializedRooms = JSON.parse(JSON.stringify(rooms));
  const serializedAddons = JSON.parse(JSON.stringify(addons));
  const serializedGuests = JSON.parse(JSON.stringify(guests));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Booking</h1>
        <p className="text-zinc-600">Create reservation with room, guest, and add-ons</p>
      </div>

      <BookingForm
        guests={serializedGuests as any[]}
        rooms={serializedRooms as any[]}
        addons={serializedAddons as any[]}
        action={createBookingAction.bind(null, { success: false, message: "" }) as any}
      />
    </div>
  );
}
