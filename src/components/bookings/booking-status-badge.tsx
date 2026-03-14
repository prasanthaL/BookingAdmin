import { cn } from "@/lib/utils";

export function BookingStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
    CONFIRMED: "bg-blue-50 text-blue-700 ring-blue-200",
    CHECKED_IN: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    CHECKED_OUT: "bg-zinc-50 text-zinc-600 ring-zinc-200",
    CANCELLED: "bg-red-50 text-red-700 ring-red-200",
    NO_SHOW: "bg-violet-50 text-violet-700 ring-violet-200",
  };

  return (
    <div className={cn(
      "inline-flex items-center rounded-xl px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ring-1",
      map[status] || "bg-zinc-50 text-zinc-500 ring-zinc-100"
    )}>
      {status.replaceAll("_", " ")}
    </div>
  );
}

