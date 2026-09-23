import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClasses = {
    default: "bg-[#FF4625] text-white hover:bg-[#FF4625]/90 border-transparent",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-transparent",
    destructive: "bg-red-500/20 text-red-500 dark:text-red-400 border-red-500/30",
    outline: "text-slate-900 dark:text-white border-slate-300 dark:border-slate-700",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantClasses[variant] || variantClasses.default,
        className
      )}
      {...props}
    />
  );
}
