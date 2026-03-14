"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User, Phone, Mail, FileText, Globe, MapPin, Notebook, Plus, Sparkles, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { guestSchema, type GuestInput } from "@/schemas/entities.schema";
import { createGuestAction, updateGuestAction } from "@/app/actions/entity.actions";

interface GuestFormProps {
  initialData?: GuestInput & { id: string };
}

export function GuestForm({ initialData }: GuestFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;

  const { register, handleSubmit, formState: { errors } } = useForm<GuestInput>({
    resolver: zodResolver(guestSchema),
    defaultValues: initialData ?? {
      fullName: "", phone: "", email: "", nicPassport: "", nationality: "", address: "", notes: "",
    },
  });

  const onSubmit = async (data: GuestInput) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, String(value ?? "")));

    startTransition(async () => {
      const res = isEditing
        ? await updateGuestAction(initialData.id, formData)
        : await createGuestAction(formData);
      if (res && !res.success) {
        toast.error(res.message);
      } else {
        toast.success(isEditing ? "Guest updated successfully" : "Guest registered successfully");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="animate-in">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 leading-tight">
            {isEditing ? "Edit Guest" : "Register New Guest"}
          </h1>
          <p className="mt-1 text-zinc-500 font-medium">
            {isEditing ? `Updating profile for ${initialData.fullName}.` : "Create a profile for a new client."}
          </p>
        </div>
        <div className="animate-in delay-100 flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="gap-2">
            {isPending ? <Sparkles className="h-4 w-4 animate-spin" /> : isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isPending ? (isEditing ? "Saving..." : "Creating...") : isEditing ? "Save Changes" : "Confirm Registration"}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-panel animate-in delay-200 rounded-[2.5rem] p-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <User size={120} strokeWidth={1} />
            </div>
            <div className="flex items-center gap-4 mb-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-zinc-900">Personal Details</h2>
                <p className="text-sm font-medium text-zinc-400">Core identification and contact info</p>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-3 col-span-full">
                <Label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Full Name</Label>
                <div className="relative group">
                  <Input {...register("fullName")} placeholder="Enter guest's full name" className="pl-12 font-bold h-14" />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-blue-600 transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                </div>
                {errors.fullName && <p className="text-xs font-bold text-red-500 ml-1 italic">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Phone Number</Label>
                <div className="relative group">
                  <Input {...register("phone")} placeholder="+94 77 123 4567" className="pl-12 font-bold h-14" />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-blue-600 transition-colors">
                    <Phone className="h-5 w-5" />
                  </div>
                </div>
                {errors.phone && <p className="text-xs font-bold text-red-500 ml-1 italic">{errors.phone.message}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Email Address</Label>
                <div className="relative group">
                  <Input {...register("email")} placeholder="guest@email.com" className="pl-12 font-bold h-14" />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-blue-600 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">NIC or Passport</Label>
                <div className="relative group">
                  <Input {...register("nicPassport")} placeholder="ID number" className="pl-12 font-bold h-14" />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-blue-600 transition-colors">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Nationality</Label>
                <div className="relative group">
                  <Input {...register("nationality")} placeholder="Sri Lankan, British, etc." className="pl-12 font-bold h-14" />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-blue-600 transition-colors">
                    <Globe className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-panel animate-in delay-300 rounded-[2.5rem] p-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 shadow-sm">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-zinc-900">Additional Info</h2>
                <p className="text-sm font-medium text-zinc-400">Address and internal records</p>
              </div>
            </div>
            <div className="grid gap-8">
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Home Address</Label>
                <textarea {...register("address")} rows={3} className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 text-sm font-bold text-zinc-900 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600" placeholder="Street address, city, country..." />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Manager's Notes</Label>
                <textarea {...register("notes")} rows={3} className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 text-sm font-bold text-zinc-900 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600" placeholder="VIP tags, previous preferences, dietary notes..." />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <aside className="sticky top-8 glass-panel animate-in delay-400 rounded-3xl p-8 bg-zinc-900 text-white">
            <div className="flex items-center gap-3 mb-6">
              <Notebook className="h-6 w-6 text-blue-400" />
              <h3 className="text-xl font-bold">Registry Check</h3>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                <p className="text-xs text-zinc-400 font-medium">Unique identification helps prevent duplicate profiles.</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                <p className="text-xs text-zinc-400 font-medium">Valid contact number is required for booking confirmations.</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                <p className="text-xs text-zinc-400 font-medium">Records are stored securely according to privacy regulations.</p>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-zinc-800">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">GrandHotel Compliance</p>
              <p className="text-[10px] font-bold text-zinc-400 italic">"Delivering hospitality excellence through reliable guest relationship management."</p>
            </div>
          </aside>
        </div>
      </div>
    </form>
  );
}
