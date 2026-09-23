import * as React from "react";
import { cn } from "@/lib/utils";

export interface LiquidCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const LiquidCard = React.forwardRef<HTMLDivElement, LiquidCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-3xl transition-all duration-500",
          "bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl",
          "border border-white/60 dark:border-white/10",
          "shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.7)]",
          "dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)]",
          "hover:shadow-[0_16px_48px_rgba(255,70,37,0.12),inset_0_1px_2px_rgba(255,255,255,0.9)]",
          "group",
          className
        )}
        {...props}
      >
        {/* Specular Liquid Glass Highlight & Ambient Glow */}
        <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-[#FF4625]/10 via-transparent to-orange-400/5 rounded-3xl" />
        <div className="pointer-events-none absolute -top-24 -right-24 size-48 rounded-full bg-[#FF4625]/10 blur-3xl group-hover:bg-[#FF4625]/20 transition-all duration-700" />
        {children}
      </div>
    );
  }
);
LiquidCard.displayName = "LiquidCard";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";
