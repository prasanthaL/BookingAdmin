"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, Filter, ChevronDown, Loader2 } from "lucide-react";

interface RoomsSearchProps {
  roomTypes: { id: string; name: string }[];
}

export function RoomsSearch({ roomTypes }: RoomsSearchProps) {
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

  const handleFilter = (value: string) => {
    startTransition(() => {
      const qs = createQueryString({ type: value });
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`);
    });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search Input Group */}
      <div className="relative flex-1 group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          ) : (
            <Search className="h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-blue-600" />
          )}
        </div>
        <input
          type="text"
          placeholder="Search by room number or category..."
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-3.5 pl-11 pr-4 text-sm font-bold text-zinc-900 placeholder:text-zinc-400 placeholder:font-medium outline-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20"
        />
      </div>

      {/* Filter Select Group */}
      <div className="relative group min-w-[180px]">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Filter className="h-3.5 w-3.5 text-zinc-400 transition-colors group-hover:text-zinc-900" />
        </div>
        <select
          defaultValue={searchParams.get("type") ?? ""}
          onChange={(e) => handleFilter(e.target.value)}
          className="w-full appearance-none rounded-2xl border border-zinc-200 bg-zinc-50/50 py-3.5 pl-10 pr-10 text-xs font-black uppercase tracking-widest text-zinc-900 hover:bg-zinc-100/50 transition-all outline-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 cursor-pointer"
        >
          <option value="">All Categories</option>
          {roomTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        </div>
      </div>
    </div>
  );
}

