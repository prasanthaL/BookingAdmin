"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { DoorOpen, Hash, Layers, Notebook, Plus, Sparkles, Building2, LayoutGrid, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { roomSchema, type RoomInput } from "@/schemas/entities.schema";
import type { z } from "zod";
import { createRoomAction, updateRoomAction } from "@/app/actions/entity.actions";

interface RoomFormProps {
  roomTypes: { id: string; name: string }[];
  initialData?: RoomInput & { id: string };
}

export function RoomForm({ roomTypes, initialData }: RoomFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;

  type RoomFormValues = z.input<typeof roomSchema>;

  const { register, handleSubmit, formState: { errors } } = useForm<RoomFormValues, unknown, RoomInput>({
    resolver: zodResolver(roomSchema),
    defaultValues: initialData ?? {
      roomNumber: "", roomTypeId: "", floor: 1, notes: "",
    },
  });

  const onSubmit = async (data: RoomInput) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, String(value ?? "")));

    startTransition(async () => {
      const res = isEditing
        ? await updateRoomAction(initialData.id, formData)
        : await createRoomAction(formData);
      if (res && !res.success) {
        toast.error(res.message);
      } else {
        toast.success(isEditing ? "Room updated successfully" : "Room added successfully");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="animate-in">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 leading-tight">
            {isEditing ? `Edit Room ${initialData.roomNumber}` : "Add New Room"}
          </h1>
          <p className="mt-1 text-zinc-500 font-medium">
            {isEditing ? "Update room configuration." : "Configure a new physical room in your property."}
          </p>
        </div>
        <div className="animate-in delay-100 flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="gap-2">
            {isPending ? <Sparkles className="h-4 w-4 animate-spin" /> : isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isPending ? (isEditing ? "Saving..." : "Creating...") : isEditing ? "Save Changes" : "Confirm Room"}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-panel animate-in delay-200 rounded-[2.5rem] p-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-emerald-600">
              <DoorOpen size={120} strokeWidth={1} />
            </div>
            <div className="flex items-center gap-4 mb-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
                <Hash className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-zinc-900">Room Specs</h2>
                <p className="text-sm font-medium text-zinc-400">Core physical configuration</p>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Room Number</Label>
                <div className="relative group">
                  <Input {...register("roomNumber")} placeholder="e.g. 101, 202A" className="pl-12 font-bold h-14 uppercase" />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-emerald-600 transition-colors">
                    <DoorOpen className="h-5 w-5" />
                  </div>
                </div>
                {errors.roomNumber && <p className="text-xs font-bold text-red-500 ml-1 italic">{errors.roomNumber.message}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Room Category</Label>
                <div className="relative group">
                  <select {...register("roomTypeId")} className="h-14 w-full appearance-none rounded-2xl border border-zinc-200 bg-zinc-50/50 px-5 pr-12 text-sm font-bold text-zinc-900 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 pl-12">
                    <option value="">Select Category</option>
                    {roomTypes.map(rt => (
                      <option key={rt.id} value={rt.id}>{rt.name}</option>
                    ))}
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-emerald-600 transition-colors pointer-events-none">
                    <LayoutGrid className="h-5 w-5" />
                  </div>
                </div>
                {errors.roomTypeId && <p className="text-xs font-bold text-red-500 ml-1 italic">{errors.roomTypeId.message}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Room Status</Label>
                <div className="relative group">
                  <select {...register("status")} className="h-14 w-full appearance-none rounded-2xl border border-zinc-200 bg-zinc-50/50 px-5 pr-12 text-sm font-bold text-zinc-900 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 pl-12">
                    <option value="AVAILABLE">Available</option>
                    <option value="RESERVED">Reserved</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="DIRTY">Dirty</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-emerald-600 transition-colors pointer-events-none">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>
                {errors.status && <p className="text-xs font-bold text-red-500 ml-1 italic">{errors.status.message}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Floor Level</Label>
                <div className="relative group">
                  <Input {...register("floor")} type="number" placeholder="1" className="pl-12 font-bold h-14" />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-emerald-600 transition-colors">
                    <Layers className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-panel animate-in delay-300 rounded-[2.5rem] p-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 shadow-sm">
                <Notebook className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-zinc-900">Room Status Notes</h2>
                <p className="text-sm font-medium text-zinc-400">Internal management or housekeeping notes</p>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Operational Notes</Label>
              <textarea {...register("notes")} rows={4} className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 text-sm font-bold text-zinc-900 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600" placeholder="View, proximity to elevator, specific furniture..." />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <aside className="sticky top-8 glass-panel animate-in delay-400 rounded-3xl p-8 bg-zinc-900 text-white">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-6 w-6 text-emerald-400" />
              <h3 className="text-xl font-bold">Property Check</h3>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <p className="text-xs text-zinc-400 font-medium">Room numbers must be unique within the same property.</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <p className="text-xs text-zinc-400 font-medium">Selecting the correct category ensures accurate pricing.</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <p className="text-xs text-zinc-400 font-medium">Floor levels help housekeeping prioritize guest services.</p>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-zinc-800">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">GrandHotel Compliance</p>
              <p className="text-[10px] font-bold text-zinc-400 italic">"Delivering hospitality excellence through reliable property management."</p>
            </div>
          </aside>
        </div>
      </div>
    </form>
  );
}
