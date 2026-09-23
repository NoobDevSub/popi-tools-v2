"use client";

import { useEffect, useState } from "react";

export type SurfaceTheme = "auto" | "light" | "dark";

export function useSurfaceTheme(theme: SurfaceTheme = "auto"): "light" | "dark" | "auto" {
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark" | "auto">(() => {
    if (theme !== "auto") return theme;
    if (typeof window === "undefined") return "light";
    const isDarkClass = document.documentElement.classList.contains("dark");
    if (isDarkClass) return "dark";
    const isLightClass = document.documentElement.classList.contains("light");
    if (isLightClass) return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    if (theme !== "auto") {
      setResolvedTheme(theme);
      return;
    }

    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      if (isDark) {
        setResolvedTheme("dark");
        return;
      }
      const isLight = document.documentElement.classList.contains("light");
      if (isLight) {
        setResolvedTheme("light");
        return;
      }
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setResolvedTheme(mediaQuery.matches ? "dark" : "light");
    };

    checkTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (
        !document.documentElement.classList.contains("dark") &&
        !document.documentElement.classList.contains("light")
      ) {
        setResolvedTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    const observer = new MutationObserver(() => {
      checkTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      observer.disconnect();
    };
  }, [theme]);

  return resolvedTheme;
}

export default useSurfaceTheme;
