"use client";

import React, { useState, useEffect } from "react";
import { motion, type Variants } from "motion/react";
import { PopiFace, type PopiEmotion } from "./PopiFace";
import { GridPulse } from "@/components/ui/grid-pulse";
import { MetalButton } from "@/components/ui/metal-button";
import { useAuth } from "../context/AuthContext";
import {
  POPI_MOODS,
} from "../data/popiMoods";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function Hero() {
  const { profile } = useAuth();
  const [selectedEmotion, setSelectedEmotion] = useState<PopiEmotion>("idle");

  // Auto-switch state
  const [isAutoSwitch] = useState(false);
  const [autoInterval] = useState(3.5);
  const [autoMode] = useState<"shuffle" | "sequential">("shuffle");

  // Sync with Firestore user profile
  useEffect(() => {
    if (profile?.selectedEmotion) {
      setSelectedEmotion(profile.selectedEmotion as PopiEmotion);
    }
  }, [profile?.selectedEmotion]);

  // Automatic Mood Switcher Engine Loop (active when enabled via Profile)
  useEffect(() => {
    if (!isAutoSwitch) return;

    const intervalId = window.setInterval(() => {
      setSelectedEmotion((prev) => {
        const allIds = POPI_MOODS.map((m) => m.id);
        if (autoMode === "shuffle") {
          const candidates = allIds.filter((id) => id !== prev);
          const next = candidates[Math.floor(Math.random() * candidates.length)];
          return next;
        } else {
          const currentIndex = allIds.indexOf(prev);
          const nextIndex = (currentIndex + 1) % allIds.length;
          return allIds[nextIndex];
        }
      });
    }, autoInterval * 1000);

    return () => clearInterval(intervalId);
  }, [isAutoSwitch, autoInterval, autoMode]);

  return (
    <section
      id="popi-hero-section"
      className="relative min-h-[92vh] sm:min-h-screen w-full flex flex-col items-center justify-between pt-20 sm:pt-28 pb-10 sm:pb-16 px-3 sm:px-6 overflow-hidden bg-white text-slate-900"
    >
      {/* GridPulse Background */}
      <GridPulse
        cell={28}
        reach={3.2}
        ambient={3}
        maxLit={160}
        className="opacity-45"
      />

      {/* Subtle Ambient Radial Lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[800px] h-[340px] sm:h-[500px] rounded-full bg-blue-500/5 blur-[80px] sm:blur-[120px]"
      />

      {/* Main Hero Center Content with Staggered Entrance */}
      <motion.div
        className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center justify-center my-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Dominant POPI Face Visual */}
        <motion.div
          variants={itemVariants}
          className="mb-4 sm:mb-8 md:mb-10 w-full flex flex-col items-center"
        >
          <PopiFace
            emotion={selectedEmotion}
            onEmotionChange={(e) => setSelectedEmotion(e)}
          />
        </motion.div>

        {/* Minimal Hero Text */}
        <motion.div
          variants={itemVariants}
          className="space-y-2 sm:space-y-4 max-w-xl mx-auto px-2"
        >
          <h1
            id="hero-title"
            className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-black tracking-wider text-slate-900 font-['Orbitron',sans-serif]"
          >
            Meet POPI.
          </h1>
          <p
            id="hero-tagline"
            data-grid-avoid
            className="text-sm xs:text-base sm:text-xl md:text-2xl font-semibold text-slate-600 leading-relaxed max-w-md mx-auto font-['Rajdhani',sans-serif] tracking-wide"
          >
            Your AI-powered gaming companion.
          </p>
        </motion.div>

        {/* Primary and Secondary CTA Buttons with MetalButton */}
        <motion.div
          variants={itemVariants}
          id="hero-cta-group"
          className="mt-6 sm:mt-8 flex flex-col xs:flex-row flex-wrap items-center justify-center gap-2.5 sm:gap-4 w-full sm:w-auto px-3 max-w-md sm:max-w-none mx-auto"
        >
          {/* Download App Button (Google Play) */}
          <MetalButton
            id="hero-download-app-btn"
            preset="chromatic"
            size="md"
            href="https://play.google.com/store/apps/details?id=com.popi.popitools.ai"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download POPI on Google Play"
            className="font-bold text-slate-900 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-6 gap-2 w-full xs:w-auto shadow-md shadow-orange-500/10"
            title="Download POPI on Google Play"
          >
            <svg
              className="size-4 sm:size-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.609 1.814L13.792 12 3.61 22.186A2.37 2.37 0 013 20.533V3.467c0-.643.226-1.233.609-1.653z"
                fill="#00E676"
              />
              <path
                d="M17.228 8.563l-3.436 3.437 3.436 3.437 3.864-2.196a1.5 1.5 0 000-2.678l-3.864-2.678z"
                fill="#FFD600"
              />
              <path
                d="M3.609 1.814L17.228 8.563l-3.436 3.437L3.609 1.814z"
                fill="#00B0FF"
              />
              <path
                d="M3.609 22.186L13.792 12l3.436 3.437-13.619 6.749z"
                fill="#FF3D00"
              />
            </svg>
            <span>Download App</span>
          </MetalButton>

          {/* Telegram Community Button */}
          <MetalButton
            id="hero-telegram-btn"
            preset="silver"
            size="md"
            href="https://t.me/popitools"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join POPI Telegram Community"
            className="text-slate-800 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-6 gap-2 w-full xs:w-auto"
            title="Join POPI Telegram Community"
          >
            <i className="fi fi-brands-telegram text-base sm:text-lg text-[#0284C7] shrink-0" />
            <span>Join Telegram</span>
          </MetalButton>
        </motion.div>
      </motion.div>

      {/* Downward Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="relative z-10 mt-6 flex flex-col items-center"
      >
        <a
          id="scroll-to-how-it-works"
          href="#how-it-works"
          aria-label="Scroll down to How It Works"
          className="group flex flex-col items-center gap-1 text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors duration-200"
        >
          <span>How It Works</span>
          <svg
            className="size-4 animate-bounce text-slate-400 group-hover:text-slate-800"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </a>
      </motion.div>
    </section>
  );
}
