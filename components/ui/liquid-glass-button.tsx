import * as React from "react";
import { cn } from "@/lib/utils";

export interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | string;
  isOutlined?: boolean;
}

export const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant = "default", isOutlined, children, ...props }, ref) => {
    let variantStyles =
      "bg-gradient-to-r from-[#FF4625] to-orange-500 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:brightness-105";

    if (variant === "destructive") {
      variantStyles = "bg-red-500/15 text-red-500 border border-red-500/30 hover:bg-red-500/25";
    } else if (variant === "secondary") {
      variantStyles =
        "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700";
    } else if (variant === "outline" || isOutlined) {
      variantStyles =
        "border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800";
    }

    return (
      <button
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl font-bold transition-all duration-300 active:scale-98 cursor-pointer inline-flex items-center justify-center font-['Orbitron',sans-serif]",
          variantStyles,
          className
        )}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        {/* Specular shimmer highlight */}
        <div className="absolute inset-0 -translate-x-full hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      </button>
    );
  }
);
LiquidButton.displayName = "LiquidButton";
