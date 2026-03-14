import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[1.0]",
    secondary: "bg-brand-secondary text-white shadow-lg shadow-brand-secondary/20 hover:scale-[1.02]",
    outline: "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300",
    destructive: "bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600",
    ghost: "bg-transparent hover:bg-zinc-100 text-zinc-600",
  };

  const sizes = {
    sm: "h-9 px-3 text-xs",
    md: "h-11 px-6 text-sm",
    lg: "h-14 px-10 text-base font-bold",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
