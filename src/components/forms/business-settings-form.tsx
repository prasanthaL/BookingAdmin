"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import { businessSchema, type BusinessInput } from "@/schemas/entities.schema";
import { updateBusinessAction } from "@/app/actions/settings.actions";

interface SettingsFormProps {
  business: {
    name: string;
  };
}

export function SettingsForm({ business }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessInput>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: business.name,
    },
  });

  const onSubmit = (data: BusinessInput) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", data.name);

      const res = await updateBusinessAction(formData);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">
          Business Name
        </label>
        <input
          {...register("name")}
          placeholder="e.g. Grand Hotel Resort"
          className="block w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-sm font-bold text-zinc-900 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600/20"
        />
        {errors.name && (
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500 ml-1">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Settings
        </button>
      </div>
    </form>
  );
}

