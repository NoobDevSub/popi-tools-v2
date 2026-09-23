"use client";

import React from "react";

export interface PopiLogoProps {
  className?: string;
  color?: string;
  alt?: string;
}

/**
 * Official POPI Brand Monogram Logo
 * Stylized geometric "P" with orbital telemetry loop in electric emerald green.
 */
export function PopiLogo({
  className = "size-8",
  color = "#10b981",
  alt = "POPI Logo",
}: PopiLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={alt}
      role="img"
    >
      <path
        d="M 45 27.2
           A 21 21 0 0 1 73 47
           A 21 21 0 0 1 52 68
           C 44.5 68 39.5 63.5 39.5 56.5
           L 39.5 73.5
           L 31 73.5
           L 31 43.5
           L 52 43.5
           L 52 52
           L 43.5 52
           C 44.8 56 48 59.5 52 59.5
           A 12.5 12.5 0 0 0 64.5 47
           A 12.5 12.5 0 0 0 45 36.6
           Z"
        fill={color}
      />
    </svg>
  );
}

export default PopiLogo;
