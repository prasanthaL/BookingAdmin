"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, Loader2 } from "lucide-react";

export function BookingSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (value: string) => {
    startTransition(() => {
      const qs = createQueryString({ q: value });
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`);
    });
  };

  return (
    <div className="relative flex-1 group pl-2">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        ) : (
          <Search className="h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-blue-600" />
        )}
      </div>
      <input
        type="text"
        placeholder="Search bookings by guest name or reservation id..."
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full rounded-2xl bg-transparent py-3.5 pl-12 pr-4 text-sm font-bold text-zinc-900 placeholder:text-zinc-400 placeholder:font-medium outline-none transition-all focus:bg-white/50"
      />
    </div>
  );
}
