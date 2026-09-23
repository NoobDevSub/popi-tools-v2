"use client";

import React from "react";
import { LazyMotion, domAnimation, m } from "motion/react";

export interface CardProps {
  number: string;
  title: string;
  description: string;
  colorTheme?: "orange" | "blue" | "purple";
  className?: string;
  rotate?: string;
  icon?: React.ReactNode;
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

export interface Step {
  number?: string;
  title: string;
  description: string;
  colorTheme?: "orange" | "blue" | "purple";
  icon?: React.ReactNode;
  rotate?: string;
  className?: string;
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

export interface StepPosition {
  className: string;
  rotate: string;
}

export interface HowItWorksProps {
  features?: Step[];
  className?: string;
  stepPositions?: StepPosition[];
}

export const DEFAULT_CARD_POSITIONS: StepPosition[] = [
  {
    className: "md:absolute md:top-0 md:left-[15%]",
    rotate: "rotate-8",
  },
  {
    className: "md:absolute md:top-[120px] md:right-[15%]",
    rotate: "-rotate-8",
  },
  {
    className: "md:absolute md:top-[450px] md:left-[15%]",
    rotate: "rotate-8",
  },
  {
    className: "md:absolute md:top-[570px] md:right-[10%]",
    rotate: "-rotate-8",
  },
  {
    className: "md:absolute md:top-[850px] md:left-[15%]",
    rotate: "rotate-8",
  },
];

const THEME_STYLES = {
  orange: {
    badge: "bg-[#FF4625] text-white",
    pin: "bg-[#FF4625]",
    border: "border-orange-400/40",
    accent: "text-[#FF4625]",
    halo: "bg-orange-500/10",
  },
  blue: {
    badge: "bg-[#2563EB] text-white",
    pin: "bg-[#2563EB]",
    border: "border-blue-400/40",
    accent: "text-[#60A5FA]",
    halo: "bg-blue-500/10",
  },
  purple: {
    badge: "bg-[#9333EA] text-white",
    pin: "bg-[#9333EA]",
    border: "border-purple-400/40",
    accent: "text-[#C084FC]",
    halo: "bg-purple-500/10",
  },
};

/** Pin component reflecting the pinned note visual */
export function Pin({ theme = "orange" }: { theme?: "orange" | "blue" | "purple" }) {
  const currentTheme = THEME_STYLES[theme] || THEME_STYLES.orange;
  return (
    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
      {/* Pin head */}
      <div
        className={`size-4 rounded-full ${currentTheme.pin} shadow-md border-2 border-white/80 ring-2 ring-black/20`}
      />
      {/* Pin needle tip shadow */}
      <div className="w-0.5 h-1.5 bg-black/40 rounded-full" />
    </div>
  );
}

/** Card component for each journey step */
export function Card({
  number,
  title,
  description,
  colorTheme = "orange",
  className = "",
  rotate = "",
  icon,
  colors,
}: CardProps) {
  const theme = THEME_STYLES[colorTheme] || THEME_STYLES.orange;

  return (
    <div
      className={`relative w-full md:w-[280px] select-none transition-all duration-300 ease-out hover:z-30 hover:scale-105 ${rotate} ${className}`}
    >
      {/* Decorative Pin */}
      <Pin theme={colorTheme} />

      {/* Inner Card Content */}
      <div
        className={`relative rounded-2xl p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 shadow-xl ${theme.border} border ${theme.halo} bg-slate-900/90 text-white`}
        style={
          colors
            ? {
                backgroundColor: colors.bg,
                color: colors.text,
                borderColor: colors.border,
              }
            : undefined
        }
      >
        {/* Step Header: Number & Icon */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <span
            className={`text-xs font-black tracking-wider px-2.5 py-1 rounded-full ${theme.badge} shadow-xs font-['Orbitron',sans-serif]`}
          >
            {number}
          </span>

          {icon && (
            <div
              className={`size-9 rounded-xl flex items-center justify-center bg-white/10 border border-white/15 ${theme.accent} text-lg`}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Step Title */}
        <h3 className="text-base sm:text-lg font-bold tracking-wide text-white mb-2 font-['Orbitron',sans-serif]">
          {title}
        </h3>

        {/* Step Description */}
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium font-['Rajdhani',sans-serif]">
          {description}
        </p>
      </div>
    </div>
  );
}

/** The default POPI 5-step onboarding journey */
export const defaultFeatures: Step[] = [
  {
    title: "Download POPI",
    description:
      "Download POPI from Google Play and install the app on your Android device.",
    colorTheme: "orange",
    icon: <i className="fi fi-rr-download" aria-hidden="true" />,
  },
  {
    title: "Login with Google",
    description:
      "Open POPI and sign in securely using your Google account.",
    colorTheme: "blue",
    icon: <i className="fi fi-brands-google" aria-hidden="true" />,
  },
  {
    title: "Login with Telegram",
    description:
      "Connect your Telegram account so POPI can verify your access and community connection.",
    colorTheme: "purple",
    icon: <i className="fi fi-brands-telegram" aria-hidden="true" />,
  },
  {
    title: "Join POPI Channel",
    description:
      "Join the official POPI Telegram channel to complete the access requirements.",
    colorTheme: "orange",
    icon: <i className="fi fi-brands-telegram" aria-hidden="true" />,
  },
  {
    title: "Start Enjoying POPI",
    description:
      "You’re all set. Explore POPI, discover the tools, and start using your AI gaming companion.",
    colorTheme: "blue",
    icon: <i className="fi fi-sr-rocket" aria-hidden="true" />,
  },
];

export function HowItWorks({
  features,
  className = "",
  stepPositions = DEFAULT_CARD_POSITIONS,
}: HowItWorksProps) {
  const data = features && features.length > 0 ? features : defaultFeatures;

  return (
    <LazyMotion features={domAnimation}>
      <section
        id="how-it-works"
        className={`relative w-full py-20 sm:py-24 px-4 sm:px-6 overflow-hidden bg-white text-slate-900 border-t border-slate-100 ${className}`}
      >

        {/* Subtle Tech Grid lines for section coherence */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto mb-16 sm:mb-20">
            <h2
              id="how-it-works-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-wider text-slate-900 font-['Orbitron',sans-serif]"
            >
              Get Started with POPI
            </h2>
            <p
              id="how-it-works-subtitle"
              className="mt-3 text-base sm:text-xl text-slate-600 leading-relaxed font-semibold font-['Rajdhani',sans-serif] tracking-wide"
            >
              Follow these simple steps and start using POPI.
            </p>
          </div>

          {/* Desktop Timeline with animated SVG connecting path */}
          <div className="relative hidden md:block w-full h-[1130px]">
            {/* Animated dashed SVG connecting path */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              viewBox="0 0 1000 1130"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <m.path
                d="M 280 120 C 650 120, 680 240, 720 250 C 760 260, 760 480, 520 490 C 320 500, 260 520, 290 600 C 320 680, 680 660, 750 720 C 820 780, 580 920, 290 980"
                fill="none"
                stroke="rgba(15, 23, 42, 0.22)"
                strokeWidth="2.5"
                strokeDasharray="8 6"
                animate={{ strokeDashoffset: [0, -28] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
              />
            </svg>

            {/* Positioned Cards */}
            {data.map((step, index) => {
              const pos = stepPositions[index] || {
                className: "relative",
                rotate: "",
              };
              return (
                <div
                  key={index}
                  className={pos.className}
                  id={`step-desktop-${index + 1}`}
                >
                  <Card
                    number={`0${index + 1}`}
                    title={step.title}
                    description={step.description}
                    colorTheme={step.colorTheme}
                    rotate={step.rotate || pos.rotate}
                    icon={step.icon}
                    colors={step.colors}
                  />
                </div>
              );
            })}
          </div>

          {/* Mobile Vertical Flow with connecting dashed timeline */}
          <div className="relative flex flex-col items-center gap-7 sm:gap-8 md:hidden w-full max-w-md mx-auto px-1">
            {/* Mobile Vertical Dashed Guide Line */}
            <div
              aria-hidden="true"
              className="absolute top-12 bottom-12 left-1/2 -translate-x-1/2 w-0.5 border-l-2 border-dashed border-slate-300 pointer-events-none z-0 opacity-70"
            />

            {data.map((step, index) => (
              <div
                key={index}
                className="w-full relative z-10"
                id={`step-mobile-${index + 1}`}
              >
                <Card
                  number={`0${index + 1}`}
                  title={step.title}
                  description={step.description}
                  colorTheme={step.colorTheme}
                  icon={step.icon}
                  colors={step.colors}
                  className="mx-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}

export default function HowItWorksDemo() {
  return <HowItWorks />;
}
