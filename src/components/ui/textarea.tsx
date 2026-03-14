import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[100px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
