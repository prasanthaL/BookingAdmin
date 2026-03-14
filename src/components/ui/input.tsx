import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm ring-brand-primary/10 transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

