"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save, Loader2, BedDouble, Users, IndianRupee } from "lucide-react";
import { roomTypeSchema, type RoomTypeInput } from "@/schemas/entities.schema";
import { createRoomTypeAction, updateRoomTypeAction } from "@/app/actions/entity.actions";

interface RoomTypeFormProps {
  initialData?: any;
  id?: string;
}

export function RoomTypeForm({ initialData, id }: RoomTypeFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(roomTypeSchema),
    defaultValues: (initialData ? {
      name: initialData.name,
      description: initialData.description || "",
      capacity: Number(initialData.capacity),
      basePrice: Number(initialData.basePrice),
    } : {
      name: "",
      description: "",
      capacity: 2,
      basePrice: 0,
    }),
  });

  const onSubmit = (data: any) => {
    const validatedData = data as RoomTypeInput;
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      const res = id 
        ? await updateRoomTypeAction(id, formData)
        : await createRoomTypeAction(formData);

      if (res?.success === false) {
        toast.error(res.message);
      } else {
        toast.success(id ? "Category updated" : "Category created");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Name */}
        <div className="sm:col-span-2 space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
            Category Name
          </label>
          <div className="relative group">
            <BedDouble className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-blue-600" />
            <input
              {...register("name")}
              placeholder="e.g. Deluxe King Suite"
              className="block w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-11 pr-5 py-3.5 text-sm font-bold text-zinc-900 outline-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20"
            />
          </div>
          {errors.name && (
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500 ml-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Capacity */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
            Max Occupancy
          </label>
          <div className="relative group">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-blue-600" />
            <input
              type="number"
              {...register("capacity")}
              className="block w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-11 pr-5 py-3.5 text-sm font-bold text-zinc-900 outline-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20"
            />
          </div>
          {errors.capacity && (
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500 ml-1">
              {errors.capacity.message}
            </p>
          )}
        </div>

        {/* Base Price */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
            Base Price
          </label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-400 group-focus-within:text-blue-600">$</span>
            <input
              type="number"
              step="0.01"
              {...register("basePrice")}
              className="block w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-11 pr-5 py-3.5 text-sm font-bold text-zinc-900 outline-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20"
            />
          </div>
          {errors.basePrice && (
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500 ml-1">
              {errors.basePrice.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="sm:col-span-2 space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={4}
            placeholder="Describe the room features, bed type, etc..."
            className="block w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-3.5 text-sm font-bold text-zinc-900 outline-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 resize-none"
          />
        </div>
      </div>

      <div className="pt-4 flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-8 py-4 text-sm font-black text-white shadow-xl shadow-zinc-900/20 transition-all hover:bg-zinc-800 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {id ? "Update Category" : "Save Category"}
        </button>
      </div>
    </form>
  );
}
