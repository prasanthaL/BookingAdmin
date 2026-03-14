import { formatDate, formatMoney } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { BookingStatusBadge } from "./booking-status-badge";

export function BookingSummary({ booking }: { booking: any }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <p className="text-sm text-zinc-500">Booking No</p>
        <h2 className="mt-2 text-xl font-semibold">{booking.bookingNo}</h2>
        <div className="mt-3"><BookingStatusBadge status={booking.status} /></div>
      </Card>
      <Card>
        <p className="text-sm text-zinc-500">Stay</p>
        <h2 className="mt-2 text-xl font-semibold">Room {booking.room.roomNumber}</h2>
        <p className="mt-2 text-sm text-zinc-600">
          {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
        </p>
      </Card>
      <Card>
        <p className="text-sm text-zinc-500">Finance</p>
        <h2 className="mt-2 text-xl font-semibold">{formatMoney(String(booking.grandTotal))}</h2>
        <p className="mt-2 text-sm text-zinc-600">Due: {formatMoney(String(booking.dueAmount))}</p>
      </Card>
    </div>
  );
}
