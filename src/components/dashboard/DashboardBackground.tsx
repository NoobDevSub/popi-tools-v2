"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface DashboardBackgroundProps {
  glowColor?: "emerald" | "indigo";
  className?: string;
}

export function DashboardBackground({
  glowColor = "emerald",
  className,
}: DashboardBackgroundProps) {
  // Light and dark radial gradient definitions matching the user's component specifications
  const lightGradient =
    glowColor === "indigo"
      ? "radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #6366f1 100%)"
      : "radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #10b981 100%)";

  const darkGradient =
    glowColor === "indigo"
      ? "radial-gradient(125% 125% at 50% 10%, #030712 40%, #312e81 100%)"
      : "radial-gradient(125% 125% at 50% 10%, #020617 40%, #064e3b 100%)";

  return (
    <div
      className={cn(
        "fixed inset-0 pointer-events-none z-0 transition-all duration-700 overflow-hidden",
        className
      )}
      aria-hidden="true"
    >
      {/* Light Mode Glow Background */}
      <div
        className="absolute inset-0 z-0 dark:hidden"
        style={{
          backgroundImage: lightGradient,
          backgroundSize: "100% 100%",
        }}
      />

      {/* Dark Mode Glow Background */}
      <div
        className="absolute inset-0 z-0 hidden dark:block"
        style={{
          backgroundImage: darkGradient,
          backgroundSize: "100% 100%",
        }}
      />
    </div>
  );
}

export default DashboardBackground;
