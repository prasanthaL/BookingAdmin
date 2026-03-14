"use client";

import { useState, useMemo } from "react";
import { Plus, CreditCard, X, History, Building2, Receipt, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPaymentAction } from "@/app/actions/payment.actions";
import { toast } from "sonner";
import { formatMoney } from "@/lib/utils";

export function AddPaymentModal({ bookings }: { bookings: { id: string; bookingNo: string; dueAmount: number; grandTotal: number }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const selectedBooking = useMemo(() => 
    bookings.find(b => b.id === selectedId),
    [selectedId, bookings]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = await createPaymentAction(fd);
    setPending(false);
    if (res.success) {
      toast.success("Payment recorded successfully");
      setIsOpen(false);
      setSelectedId("");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Record Payment
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md animate-in zoom-in-95 rounded-[2.5rem] bg-white p-10 shadow-2xl shadow-zinc-950/20">
            <button onClick={() => setIsOpen(false)} className="absolute right-8 top-8 text-zinc-400 hover:text-zinc-900 transition-colors">
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-2 mb-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <CreditCard className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Record Payment</h2>
              <p className="text-sm text-zinc-500 font-medium">Capture a transaction for a guest booking.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Select Booking</Label>
                <div className="relative group">
                  <select 
                    name="bookingId" 
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    required 
                    className="flex h-14 w-full appearance-none rounded-2xl border border-zinc-200 bg-zinc-50/50 px-5 py-2 text-sm font-bold text-zinc-900 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600"
                  >
                    <option value="">Search by Booking ID</option>
                    {bookings.map(b => (
                      <option key={b.id} value={b.id}>#{b.bookingNo}</option>
                    ))}
                  </select>
                  <Receipt className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-hover:text-blue-600 transition-colors pointer-events-none" />
                </div>
              </div>

              {selectedBooking && (
                <div className="animate-in slide-in-from-top-4 fade-in">
                  <div className="rounded-3xl bg-blue-400 p-6 text-white shadow-xl shadow-blue-600/20">
                    <div className="flex items-center justify-between opacity-80">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Current Balance Due</p>
                      <Calculator className="h-4 w-4" />
                    </div>
                    <p className="mt-1 text-4xl font-black tracking-tighter">
                      {formatMoney(selectedBooking.dueAmount)}
                    </p>
                    <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4">
                      <div className="flex-1">
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Total Bill</p>
                        <p className="text-sm font-bold">{formatMoney(selectedBooking.grandTotal)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Paid Amount</Label>
                  <Input 
                    name="amount" 
                    type="number" 
                    step="0.01" 
                    required 
                    defaultValue={selectedBooking?.dueAmount || ""}
                    placeholder="0.00" 
                    className="font-bold h-14"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Method</Label>
                  <select name="method" required className="flex h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 px-5 py-2 text-sm font-bold text-zinc-900 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600">
                    <option value="CASH">CASH</option>
                    <option value="CARD">CARD</option>
                    <option value="BANK_TRANSFER">BANK TRANSFER</option>
                    <option value="ONLINE">ONLINE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Internal Notes</Label>
                <Input name="notes" placeholder="Any extra details..." className="h-14 font-medium" />
              </div>

              <Button type="submit" disabled={pending} className="w-full h-14 font-black text-sm uppercase tracking-widest text-white shadow-lg shadow-blue-600/20 active:scale-[0.98]">
                {pending ? "Processing..." : "Finalize Transaction"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

