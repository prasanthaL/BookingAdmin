"use client";

import { useEffect, useMemo, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBookingSchema, type CreateBookingInput, type CreateBookingOutput } from "@/schemas/booking.schema";
import { calculateAddonLineTotal, calculateNights } from "@/lib/calculations";
import { formatMoney } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  User, 
  DoorOpen, 
  Plus, 
  Trash2, 
  Info, 
  CreditCard,
  ChevronRight,
  Sparkles
} from "lucide-react";

type GuestOption = { id: string; fullName: string; phone: string };
type RoomOption = { id: string; roomNumber: string; roomType: { name: string; basePrice: unknown } };
type AddonOption = { id: string; name: string; unitPrice: unknown; priceType: string };

export function BookingForm({
  guests,
  rooms,
  addons,
  action,
}: {
  guests: GuestOption[];
  rooms: RoomOption[];
  addons: AddonOption[];
  action: (formData: FormData) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<CreateBookingInput, any, CreateBookingOutput>({
    resolver: zodResolver<CreateBookingInput, any, CreateBookingOutput>(createBookingSchema),
    defaultValues: {
      guestId: "",
      roomId: "",
      checkInDate: "",
      checkOutDate: "",
      adults: 1,
      children: 0,
      discount: 0,
      notes: "",
      addons: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "addons",
  });

  const watched = form.watch();
  const nights = useMemo(() => {
    if (!watched.checkInDate || !watched.checkOutDate) return 1;
    return calculateNights(watched.checkInDate, watched.checkOutDate);
  }, [watched.checkInDate, watched.checkOutDate]);

  const selectedRoom = rooms.find((r) => r.id === watched.roomId);
  const roomRate = Number(selectedRoom?.roomType.basePrice ?? 0);
  const roomTotal = roomRate * nights;

  const addonTotal = (watched.addons ?? []).reduce((sum, item) => {
    return (
      sum +
      calculateAddonLineTotal({
        unitPrice: Number(item.unitPrice || 0),
        quantity: Number(item.quantity || 1),
        priceType: item.priceType,
        nights,
        adults: Number(watched.adults || 1),
      })
    );
  }, 0);

  const grandTotal = roomTotal + addonTotal - Number(watched.discount || 0);

  useEffect(() => {
    const subscription = form.watch((value, info) => {
      if (!info.name?.startsWith("addons.")) return;
      const match = info.name.match(/^addons\.(\d+)\.addonId$/);
      if (!match) return;
      const index = Number(match[1]);
      const addonId = value.addons?.[index]?.addonId;
      const selected = addons.find((a) => a.id === addonId);
      if (!selected) return;
      update(index, {
        addonId: selected.id,
        serviceDate: (value.addons?.[index] as any)?.serviceDate || "",
        quantity: (value.addons?.[index] as any)?.quantity || 1,
        unitPrice: Number(selected.unitPrice),
        priceType: selected.priceType as any,
        notes: (value.addons?.[index] as any)?.notes || "",
      });
    });

    return () => subscription.unsubscribe();
  }, [addons, form, update]);

  const onSubmit = (values: CreateBookingOutput) => {
    const fd = new FormData();
    fd.set("guestId", values.guestId);
    fd.set("roomId", values.roomId);
    fd.set("checkInDate", values.checkInDate);
    fd.set("checkOutDate", values.checkOutDate);
    fd.set("adults", String(values.adults));
    fd.set("children", String(values.children));
    fd.set("discount", String(values.discount));
    fd.set("advanceAmount", String(values.advanceAmount));
    fd.set("notes", values.notes ?? "");
    fd.set("addons", JSON.stringify(values.addons ?? []));

    startTransition(async () => {
      // Note: We don't wrap this in a try/catch because redirect() throws an error 
      // that Next.js uses to handle the navigation. Catching it triggers the error toast.
      const result = await (action as any)(fd);
      
      if (result && !result.success) {
        toast.error(result.message || "Something went wrong.");
      } else {
        toast.success("Booking submitted.");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-6xl space-y-8 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="animate-in">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Create New Booking</h1>
          <p className="text-zinc-500">Manage guest stay and additional services</p>
        </div>
        <div className="animate-in delay-100">
          <Button disabled={pending} type="submit" size="lg" className="h-12 rounded-xl bg-brand-primary px-8 font-semibold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98]">
            {pending ? (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Confirm Booking
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Guest & Stay - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-panel animate-in delay-200 rounded-3xl p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Guest Information</h2>
                <p className="text-sm text-zinc-500">Select guest and stay duration</p>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-700">Guest Name</Label>
                <div className="relative">
                  <select 
                    className="h-12 w-full appearance-none rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 pr-10 text-sm ring-brand-primary/20 focus:border-brand-primary focus:bg-white focus:ring-4" 
                    {...form.register("guestId")}
                  >
                    <option value="">Select guest</option>
                    {guests.map((guest) => (
                      <option key={guest.id} value={guest.id}>
                        {guest.fullName} — {guest.phone}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -rotate-90 text-zinc-400" />
                </div>
                {form.formState.errors.guestId && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-red-500">
                    <Info className="h-3 w-3" />
                    {form.formState.errors.guestId.message}
                  </p>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-zinc-700">Room Selection</Label>
                  <div className="relative">
                    <select 
                      className="h-12 w-full appearance-none rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 pr-10 text-sm ring-brand-primary/20 focus:border-brand-primary focus:bg-white focus:ring-4" 
                      {...form.register("roomId")}
                    >
                      <option value="">Select room</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.roomNumber} ({room.roomType.name}) — {formatMoney(String(room.roomType.basePrice))}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -rotate-90 text-zinc-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-zinc-700">Adults</Label>
                    <Input type="number" min={1} className="h-12 rounded-2xl" {...form.register("adults")} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-zinc-700">Children</Label>
                    <Input type="number" min={0} className="h-12 rounded-2xl" {...form.register("children")} />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <Calendar className="h-4 w-4" />
                    Check-in Date
                  </Label>
                  <Input type="date" className="h-12 rounded-2xl" {...form.register("checkInDate")} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <Calendar className="h-4 w-4 text-brand-secondary" />
                    Check-out Date
                  </Label>
                  <Input type="date" className="h-12 rounded-2xl" {...form.register("checkOutDate")} />
                </div>
              </div>
            </div>
          </section>

          <section className="glass-panel animate-in delay-300 rounded-3xl p-8">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-secondary/10 text-brand-secondary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Add-on Services</h2>
                  <p className="text-sm text-zinc-500">Personalize the guest experience</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="group h-10 rounded-xl border-zinc-200 hover:border-brand-primary"
                onClick={() =>
                  append({
                    addonId: "",
                    serviceDate: "",
                    quantity: 1,
                    unitPrice: 0,
                    priceType: "PER_BOOKING",
                    notes: "",
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90 text-brand-primary" />
                Add Service
              </Button>
            </div>

            <div className="space-y-4">
              {fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-100 py-12 text-center">
                  <div className="mb-3 rounded-full bg-zinc-50 p-4">
                    <Plus className="h-6 w-6 text-zinc-300" />
                  </div>
                  <p className="text-sm font-medium text-zinc-400">No add-ons selected yet</p>
                  <p className="text-xs text-zinc-300">Click the button above to add extra services</p>
                </div>
              ) : (
                fields.map((field, index) => {
                  const selectedAddon = addons.find((a) => a.id === watched.addons?.[index]?.addonId);
                  const lineTotal = calculateAddonLineTotal({
                    unitPrice: Number(watched.addons?.[index]?.unitPrice || 0),
                    quantity: Number(watched.addons?.[index]?.quantity || 1),
                    priceType: String(watched.addons?.[index]?.priceType || "PER_BOOKING"),
                    nights,
                    adults: Number(watched.adults || 1),
                  });

                  return (
                    <div key={field.id} className="group animate-in relative overflow-hidden rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm ring-brand-primary/5 transition-all hover:border-brand-primary/20 hover:ring-4">
                      <div className="mb-6 grid gap-6 md:grid-cols-4">
                        <div className="md:col-span-2 space-y-2">
                          <Label className="text-xs uppercase tracking-wider text-zinc-400">Service</Label>
                          <select
                            className="h-11 w-full rounded-xl border border-zinc-100 bg-zinc-50 px-3 text-sm focus:bg-white"
                            {...form.register(`addons.${index}.addonId`)}
                          >
                            <option value="">Select add-on</option>
                            {addons.map((addon) => (
                              <option key={addon.id} value={addon.id}>
                                {addon.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-wider text-zinc-400">Date</Label>
                          <Input type="date" className="h-11 rounded-xl" {...form.register(`addons.${index}.serviceDate`)} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-wider text-zinc-400">Qty</Label>
                          <Input type="number" min={1} className="h-11 rounded-xl" {...form.register(`addons.${index}.quantity`)} />
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-4">
                        <div className="md:col-span-3 space-y-2">
                          <Label className="text-xs uppercase tracking-wider text-zinc-400">Internal Notes</Label>
                          <Input placeholder="Extra instructions..." className="h-11 rounded-xl" {...form.register(`addons.${index}.notes`)} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-wider text-zinc-400">Unit Price</Label>
                          <Input type="number" step="0.01" className="h-11 rounded-xl" {...form.register(`addons.${index}.unitPrice`)} />
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-zinc-50 pt-4">
                        <div className="flex items-center gap-4">
                          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                            {selectedAddon?.priceType || "N/A"}
                          </span>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-red-400 transition-colors hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-zinc-400">Line Total</p>
                          <p className="text-lg font-bold text-zinc-900">{formatMoney(lineTotal)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="glass-panel animate-in delay-400 rounded-3xl p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                <Info className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">Additional Notes</h2>
            </div>
            <div className="mt-6">
              <Textarea 
                placeholder="Special requests, dietary requirements, etc." 
                className="min-h-[120px] rounded-2xl border-zinc-200 bg-zinc-50/50 p-4 focus:bg-white" 
                {...form.register("notes")} 
              />
            </div>
          </section>
        </div>

        {/* Sidebar: Billing Summary */}
        <div className="space-y-6">
          <aside className="sticky top-8 glass-panel animate-in delay-500 rounded-3xl p-8">
            <div className="mb-6 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-primary" />
              <h2 className="text-xl font-bold">Payment Summary</h2>
            </div>

            <div className="grid gap-4 py-6 border-b border-zinc-100">
              <div className="flex justify-between text-zinc-600">
                <span>Room Stay ({nights} {nights === 1 ? 'night' : 'nights'})</span>
                <span className="font-medium text-zinc-900">{formatMoney(roomTotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Add-on Services</span>
                <span className="font-medium text-zinc-900">{formatMoney(addonTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-600">
                <div className="flex items-center gap-1.5">
                  <span>Discount</span>
                  <Info className="h-3.5 w-3.5 text-zinc-300" />
                </div>
                <div className="w-24">
                  <Input 
                    type="number" 
                    step="0.01" 
                    className="h-9 rounded-lg px-2 text-right text-sm font-medium" 
                    {...form.register("discount")} 
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-zinc-600">
                <div className="flex items-center gap-1.5">
                  <span>Advance Payment</span>
                  <CreditCard className="h-3.5 w-3.5 text-zinc-300" />
                </div>
                <div className="w-24">
                  <Input 
                    type="number" 
                    step="0.01" 
                    className="h-9 rounded-lg px-2 text-right text-sm font-medium border-blue-100 bg-blue-50/30" 
                    {...form.register("advanceAmount")} 
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Grand Total</p>
                  <p className="text-2xl font-black tracking-tight text-zinc-900">{formatMoney(grandTotal)}</p>
                </div>
              </div>
              
              <div className="mb-8 flex items-end justify-between rounded-2xl bg-zinc-950 p-4 text-white">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Balance Due</p>
                  <p className="text-2xl font-black tracking-tight text-white">{formatMoney(grandTotal - Number(watched.advanceAmount || 0))}</p>
                </div>
                <div className="text-right text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                  At Checkout
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <div className="h-1 w-1 rounded-full bg-emerald-500" />
                  Availability confirmed for dates
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <div className="h-1 w-1 rounded-full bg-emerald-500" />
                  Pricing includes current seasonal rates
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </form>
  );
}
