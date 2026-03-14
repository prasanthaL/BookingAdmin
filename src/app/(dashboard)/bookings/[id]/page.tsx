import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate, formatMoney } from "@/lib/utils";
import { BookingSummary } from "@/components/bookings/booking-summary";
import { checkInBookingAction, checkOutBookingAction } from "@/app/actions/booking.actions";

export default async function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      guest: true,
      room: { include: { roomType: true } },
      addons: { include: { addon: true } },
      payments: true,
      checkinLogs: true,
      checkoutLogs: true,
    },
  });

  if (!booking) notFound();

  const serializedBooking = JSON.parse(JSON.stringify(booking));

  const canCheckIn = serializedBooking.status === "CONFIRMED" || serializedBooking.status === "PENDING";
  const canCheckOut = serializedBooking.status === "CHECKED_IN";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Booking Details</h1>
          <p className="text-zinc-600">Manage room stay, add-ons, and billing</p>
        </div>
        <div className="flex gap-2">
          {canCheckIn && (
            <form action={checkInBookingAction.bind(null, serializedBooking.id)}>
              <Button type="submit">Check In</Button>
            </form>
          )}
          {canCheckOut && (
            <form action={checkOutBookingAction.bind(null, serializedBooking.id)}>
              <Button type="submit" variant="outline">Check Out</Button>
            </form>
          )}
        </div>
      </div>

      <BookingSummary booking={serializedBooking} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Guest</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Name:</span> {serializedBooking.guest.fullName}</p>
            <p><span className="font-medium">Phone:</span> {serializedBooking.guest.phone}</p>
            <p><span className="font-medium">Email:</span> {serializedBooking.guest.email || "-"}</p>
            <p><span className="font-medium">NIC/Passport:</span> {serializedBooking.guest.nicPassport || "-"}</p>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Room</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Room No:</span> {serializedBooking.room.roomNumber}</p>
            <p><span className="font-medium">Type:</span> {serializedBooking.room.roomType.name}</p>
            <p><span className="font-medium">Status:</span> {serializedBooking.room.status}</p>
            <p><span className="font-medium">Nights:</span> {serializedBooking.nights}</p>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Add-ons</h2>
        <div className="space-y-3">
          {serializedBooking.addons.length === 0 && <p className="text-sm text-zinc-500">No add-ons.</p>}
          {serializedBooking.addons.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 text-sm">
              <div>
                <p className="font-medium">{item.addon.name}</p>
                <p className="text-zinc-600">
                  Qty: {item.quantity} • Date: {item.serviceDate ? formatDate(new Date(item.serviceDate)) : "-"} • {item.status}
                </p>
              </div>
              <div className="font-semibold">{formatMoney(String(item.totalPrice))}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Payments</h2>
          <div className="space-y-3 text-sm">
            {serializedBooking.payments.length === 0 && <p className="text-zinc-500">No payments yet.</p>}
            {serializedBooking.payments.map((payment: any) => (
              <div key={payment.id} className="flex items-center justify-between rounded-xl border border-zinc-200 p-3">
                <div>
                  <p className="font-medium">{payment.method}</p>
                  <p className="text-zinc-600">{formatDate(new Date(payment.createdAt))}</p>
                </div>
                <div className="font-semibold">{formatMoney(String(payment.amount))}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Totals</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Room Total:</span> {formatMoney(String(serializedBooking.roomTotal))}</p>
            <p><span className="font-medium">Add-on Total:</span> {formatMoney(String(serializedBooking.addonTotal))}</p>
            <p><span className="font-medium">Discount:</span> {formatMoney(String(serializedBooking.discount))}</p>
            <p><span className="font-medium">Grand Total:</span> {formatMoney(String(serializedBooking.grandTotal))}</p>
            <p><span className="font-medium">Paid:</span> {formatMoney(String(serializedBooking.paidAmount))}</p>
            <p><span className="font-medium">Due:</span> {formatMoney(String(serializedBooking.dueAmount))}</p>
          </div>
        </Card>
      </div>

    </div>
  );
}
