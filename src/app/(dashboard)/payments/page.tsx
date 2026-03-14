import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/session";
import { CreditCard, History, ArrowDownLeft, Receipt, DollarSign } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/utils";
import { AddPaymentModal } from "@/components/payments/add-payment-modal";

export default async function PaymentsPage() {
  const businessId = await getBusinessId();
  const [payments, bookings] = await Promise.all([
    prisma.payment.findMany({
      where: { businessId: businessId as string },
      include: { booking: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.findMany({
      where: { businessId: businessId as string, NOT: { status: "CANCELLED" } },
      select: { id: true, bookingNo: true, dueAmount: true, grandTotal: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const serializedPayments = JSON.parse(JSON.stringify(payments));
  const serializedBookings = bookings.map(b => ({
    ...b,
    dueAmount: Number(b.dueAmount),
    grandTotal: Number(b.grandTotal),
  }));

  return (
    <div className="space-y-8 pb-12 animate-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 leading-tight">Payments</h1>
          <p className="mt-1 text-zinc-500 font-medium">Track collected amounts and transaction history.</p>
        </div>
        <AddPaymentModal bookings={serializedBookings} />
      </div>

      <div className="grid gap-6">
        <section className="glass-panel overflow-hidden rounded-[2rem]">
          <div className="bg-zinc-50/50 border-b border-zinc-100/50 px-8 py-5">
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">Transaction History</h2>
          </div>
          <div className="divide-y divide-zinc-100 flex flex-col">
            {serializedPayments.map((payment: any) => (
              <div key={payment.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-7 hover:bg-blue-50/20 transition-all group">
                <div className="flex items-center gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-zinc-100/80 text-zinc-600 transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-blue-600/20">
                    <ArrowDownLeft className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-zinc-900">Booking #{payment.booking.bookingNo}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-lg">
                        {payment.method}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400">•</span>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none translate-y-[1px]">
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <p className="text-2xl font-black text-zinc-900 tracking-tight">
                    {formatMoney(String(payment.amount))}
                   </p>
                   {payment.notes && (
                     <p className="text-[11px] font-medium text-zinc-400 italic">"{payment.notes}"</p>
                   )}
                </div>
              </div>
            ))}
            {serializedPayments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-50 text-zinc-200">
                  <History className="h-10 w-10 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 italic lowercase tracking-tight opacity-40">No payments found yet</h3>
                <p className="mt-2 text-sm font-medium text-zinc-400 max-w-[240px] leading-relaxed italic opacity-60">Record your first payment using the button above to start tracking revenue.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

