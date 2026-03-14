import Link from "next/link";
import { formatDate, formatMoney, cn } from "@/lib/utils";
import { BookingStatusBadge } from "./booking-status-badge";
import { MoreHorizontal, Calendar, User, DoorOpen, ArrowRight } from "lucide-react";

type Row = {
  id: string;
  bookingNo: string;
  guest: { fullName: string; email: string };
  room: { roomNumber: string; roomType: { name: string } };
  checkInDate: string;
  checkOutDate: string;
  grandTotal: unknown;
  status: string;
};

export function BookingTable({ rows }: { rows: Row[] }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-zinc-50/50">
            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100">Booking Details</th>
            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100">Guest Information</th>
            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100">Stay Duration</th>
            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100">Current Status</th>
            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100 text-right">Total Amount</th>
            <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100/50 bg-white/30 backdrop-blur-sm">
          {rows.map((row, idx) => (
            <tr key={row.id} className="group transition-all hover:bg-zinc-50/80 animate-in" style={{ animationDelay: `${idx * 50}ms` }}>
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-xl shadow-zinc-900/10 transition-transform group-hover:scale-105">
                    <span className="text-[10px] font-black leading-none opacity-50 mb-0.5">RM</span>
                    <span className="text-sm font-black leading-none">{row.room.roomNumber}</span>
                  </div>
                  <div>
                    <Link href={`/bookings/${row.id}`} className="block text-sm font-black text-zinc-900 hover:text-blue-600 transition-colors">
                      #{row.bookingNo}
                    </Link>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-0.5">{row.room.roomType.name}</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm transition-all">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-zinc-900">{row.guest.fullName}</p>
                    <p className="text-[10px] font-bold text-zinc-400">{row.guest.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-zinc-900">{formatDate(row.checkInDate)}</p>
                    <div className="flex items-center gap-2">
                      <div className="h-px w-3 bg-zinc-200"></div>
                      <p className="text-[10px] font-black uppercase text-zinc-400 leading-none">{formatDate(row.checkOutDate)}</p>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <BookingStatusBadge status={row.status} />
              </td>
              <td className="px-8 py-6 text-right">
                <p className="text-sm font-black text-zinc-900">{formatMoney(String(row.grandTotal))}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 mt-0.5">Paid in full</p>
              </td>
              <td className="px-8 py-6">
                <div className="flex justify-center">
                  <Link 
                    href={`/bookings/${row.id}`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all shadow-sm hover:shadow-lg hover:shadow-zinc-900/10 active:scale-90"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-zinc-50 text-zinc-200">
            <Calendar className="h-12 w-12" />
          </div>
          <h3 className="text-xl font-black text-zinc-900">No Reservations</h3>
          <p className="text-zinc-400 font-medium italic mt-1 max-w-xs mx-auto">Your booking schedule is currently empty. Start by creating a new reservation.</p>
        </div>
      )}
    </div>
  );
}


