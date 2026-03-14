"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  id: string;
  label: string;
  action: (id: string) => Promise<{ success: boolean; message?: string }>;
}

export function DeleteButton({ id, label, action }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete "${label}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await action(id);
      if (res.success) {
        toast.success(`"${label}" deleted.`);
        router.refresh();
      } else {
        toast.error(res.message ?? "Failed to delete.");
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 transition-all hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
