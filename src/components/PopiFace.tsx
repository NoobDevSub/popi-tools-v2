"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import {
  type PopiEmotion,
  MOOD_MAP,
  playMoodChime,
  POPI_MOODS,
} from "../data/popiMoods";

export type { PopiEmotion };

interface PopiFaceProps {
  emotion?: PopiEmotion;
  onEmotionChange?: (emotion: PopiEmotion) => void;
  className?: string;
  showQuoteBadge?: boolean;
}

export function PopiFace({
  emotion: controlledEmotion,
  onEmotionChange,
  className = "",
  showQuoteBadge = true,
}: PopiFaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);

  const [currentEmotion, setCurrentEmotion] = useState<PopiEmotion>("idle");
  const [isBlinking, setIsBlinking] = useState(false);
  const [isNear, setIsNear] = useState(false);
  const [clickReaction, setClickReaction] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Pupil offsets in px
  const [pupilLeft, setPupilLeft] = useState({ x: 0, y: 0 });
  const [pupilRight, setPupilRight] = useState({ x: 0, y: 0 });

  // Refs for smooth RAF animation
  const targetPos = useRef({ lx: 0, ly: 0, rx: 0, ry: 0 });
  const currentPos = useRef({ lx: 0, ly: 0, rx: 0, ry: 0 });
  const rafId = useRef<number | null>(null);

  const activeEmotion = controlledEmotion ?? currentEmotion;
  const moodConfig = MOOD_MAP[activeEmotion] || MOOD_MAP.idle;

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Smooth lerp animation loop
  useEffect(() => {
    if (reducedMotion) return;

    let isRunning = true;
    const lerpFactor = 0.16;

    const animate = () => {
      if (!isRunning) return;

      currentPos.current.lx +=
        (targetPos.current.lx - currentPos.current.lx) * lerpFactor;
      currentPos.current.ly +=
        (targetPos.current.ly - currentPos.current.ly) * lerpFactor;
      currentPos.current.rx +=
        (targetPos.current.rx - currentPos.current.rx) * lerpFactor;
      currentPos.current.ry +=
        (targetPos.current.ry - currentPos.current.ry) * lerpFactor;

      setPupilLeft({
        x: Math.round(currentPos.current.lx * 10) / 10,
        y: Math.round(currentPos.current.ly * 10) / 10,
      });
      setPupilRight({
        x: Math.round(currentPos.current.rx * 10) / 10,
        y: Math.round(currentPos.current.ry * 10) / 10,
      });

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      isRunning = false;
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [reducedMotion]);

  // Mouse / Touch tracking handler
  const handlePointerAt = useCallback(
    (clientX: number, clientY: number) => {
      if (reducedMotion) return;

      const leftEye = leftEyeRef.current;
      const rightEye = rightEyeRef.current;
      if (!leftEye || !rightEye) return;

      const leftRect = leftEye.getBoundingClientRect();
      const rightRect = rightEye.getBoundingClientRect();

      const leftCenter = {
        x: leftRect.left + leftRect.width / 2,
        y: leftRect.top + leftRect.height / 2,
      };
      const rightCenter = {
        x: rightRect.left + rightRect.width / 2,
        y: rightRect.top + rightRect.height / 2,
      };

      const faceCenter = {
        x: (leftCenter.x + rightCenter.x) / 2,
        y: (leftCenter.y + rightCenter.y) / 2,
      };

      const dist = Math.hypot(clientX - faceCenter.x, clientY - faceCenter.y);
      setIsNear(dist < 180);

      // Max pupil travel
      const eyeRadius = leftRect.width / 2;
      const maxDist = Math.max(14, eyeRadius * 0.38);

      // Derp easter egg mode
      if (activeEmotion === "derp") {
        targetPos.current = {
          lx: -maxDist,
          ly: -maxDist * 0.8,
          rx: maxDist,
          ry: maxDist * 0.8,
        };
        return;
      }

      // Left Eye offset
      const lDx = clientX - leftCenter.x;
      const lDy = clientY - leftCenter.y;
      const lDist = Math.hypot(lDx, lDy);
      const lClamped = Math.min(maxDist, lDist);
      const lAngle = Math.atan2(lDy, lDx);

      // Right Eye offset
      const rDx = clientX - rightCenter.x;
      const rDy = clientY - rightCenter.y;
      const rDist = Math.hypot(rDx, rDy);
      const rClamped = Math.min(maxDist, rDist);
      const rAngle = Math.atan2(rDy, rDx);

      targetPos.current = {
        lx: Math.cos(lAngle) * lClamped,
        ly: Math.sin(lAngle) * lClamped,
        rx: Math.cos(rAngle) * rClamped,
        ry: Math.sin(rAngle) * rClamped,
      };
    },
    [reducedMotion, activeEmotion],
  );

  const resetPupils = useCallback(() => {
    targetPos.current = { lx: 0, ly: 0, rx: 0, ry: 0 };
    setIsNear(false);
  }, []);

  // Listeners for mousemove and touch
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      handlePointerAt(e.clientX, e.clientY);
    };

    const onMouseLeaveDoc = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        resetPupils();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerAt(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchEnd = () => {
      resetPupils();
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeaveDoc);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeaveDoc);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [handlePointerAt, resetPupils]);

  // Natural Blink System
  useEffect(() => {
    if (reducedMotion) return;

    let timeoutId: number;

    const triggerBlink = () => {
      setIsBlinking(true);

      const blinkDuration = 140 + Math.random() * 40;
      window.setTimeout(() => {
        setIsBlinking(false);

        // 12% chance for a quick double-blink
        if (Math.random() < 0.12) {
          window.setTimeout(() => {
            setIsBlinking(true);
            window.setTimeout(() => {
              setIsBlinking(false);
            }, 120);
          }, 110);
        }
      }, blinkDuration);

      // Schedule next blink in 2.8 to 6.2 seconds
      const nextDelay = 2800 + Math.random() * 3400;
      timeoutId = window.setTimeout(triggerBlink, nextDelay);
    };

    timeoutId = window.setTimeout(triggerBlink, 3000);

    return () => clearTimeout(timeoutId);
  }, [reducedMotion]);

  // Click Interaction: playful reaction with sound
  const handleFaceClick = () => {
    setClickReaction((prev) => prev + 1);
    setIsBlinking(true);

    // Pick a surprise mood from the 38+ moods
    const available = POPI_MOODS.map((m) => m.id);
    const picked = available[Math.floor(Math.random() * available.length)];

    playMoodChime(MOOD_MAP[picked]?.frequency || 520);
    setCurrentEmotion(picked);
    onEmotionChange?.(picked);

    window.setTimeout(() => {
      setIsBlinking(false);
    }, 180);
  };

  // Thinking emotion pupil bias
  useEffect(() => {
    if (activeEmotion === "thinking") {
      targetPos.current = { lx: 14, ly: -16, rx: 14, ry: -16 };
      const timer = window.setTimeout(() => {
        resetPupils();
      }, 1600);
      return () => clearTimeout(timer);
    }
    if (activeEmotion === "derp") {
      targetPos.current = { lx: -18, ly: -16, rx: 18, ry: 16 };
    }
  }, [activeEmotion, resetPupils]);

  // Mood attributes
  const isSurprised =
    activeEmotion === "surprised" ||
    activeEmotion === "hyped" ||
    activeEmotion === "laser";
  const isExcited =
    activeEmotion === "excited" ||
    activeEmotion === "party" ||
    activeEmotion === "overclocked";
  const eyelids = moodConfig.eyelids || "none";

  return (
    <div
      ref={containerRef}
      id="popi-character-container"
      onClick={handleFaceClick}
      role="button"
      tabIndex={0}
      aria-label={`Interactive POPI character in ${moodConfig.label} mood. Click to change.`}
      className={`group relative flex flex-col items-center justify-center cursor-pointer select-none transition-transform duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-400/50 rounded-3xl ${className}`}
    >
      {/* Interactive Face Frame */}
      <motion.div
        animate={
          reducedMotion
            ? {}
            : {
                scale: clickReaction ? [1, 0.93, 1.07, 0.98, 1] : 1,
                y: isExcited ? [0, -6, 0, -4, 0] : [0, -2, 0],
                x: moodConfig.jitter ? [0, -3, 3, -2, 2, 0] : 0,
              }
        }
        transition={{
          duration: moodConfig.jitter ? 0.15 : clickReaction ? 0.45 : 3.5,
          repeat: moodConfig.jitter ? Infinity : clickReaction ? 0 : Infinity,
          ease: "easeInOut",
        }}
        className="relative flex flex-col items-center"
      >
        {/* The Two Eyes */}
        <div className="relative flex items-center justify-center gap-4 sm:gap-8 md:gap-14">
          {/* Left Eye */}
          <div
            ref={leftEyeRef}
            id="popi-eye-left"
            className={`relative flex items-center justify-center overflow-hidden transition-all duration-200 ${moodConfig.eyeBg} ${
              moodConfig.glow
                ? moodConfig.glow
                : "shadow-2xl shadow-slate-900/10"
            } ${
              isSurprised
                ? "w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-[24px] sm:rounded-[36px] md:rounded-[42px]"
                : "w-20 h-20 sm:w-32 sm:h-32 md:w-44 md:h-44 rounded-[20px] sm:rounded-[32px] md:rounded-[36px]"
            } border-3 sm:border-4 ${moodConfig.eyeBorder}`}
            style={{
              transform:
                isBlinking || eyelids === "zen"
                  ? "scaleY(0.06)"
                  : "scaleY(1)",
              transformOrigin: "center center",
              transition: isBlinking
                ? "transform 0.08s ease-in-out"
                : "transform 0.14s ease-out",
            }}
          >
            {/* Eyelid Masks */}
            {eyelids === "happy" && (
              <div className="absolute bottom-0 inset-x-0 h-1/3 bg-white z-10 rounded-t-full shadow-inner border-t-2 border-slate-200" />
            )}
            {eyelids === "sleepy" && (
              <div className="absolute top-0 inset-x-0 h-2/5 bg-slate-100 z-10 rounded-b-xl border-b border-slate-300 transition-all duration-300" />
            )}
            {eyelids === "angry" && (
              <div className="absolute -top-2 -right-2 w-full h-1/2 bg-red-600/30 z-10 -rotate-12 border-b-2 border-red-500" />
            )}
            {eyelids === "squint" && (
              <>
                <div className="absolute top-0 inset-x-0 h-1/4 bg-slate-900/30 z-10 border-b border-slate-400" />
                <div className="absolute bottom-0 inset-x-0 h-1/4 bg-slate-900/30 z-10 border-t border-slate-400" />
              </>
            )}

            {/* Laser Beam Effect */}
            {moodConfig.laserBeam && (
              <div className="absolute inset-0 bg-red-500/30 animate-pulse pointer-events-none z-20" />
            )}

            {/* Left Pupil */}
            <div
              id="popi-pupil-left"
              className={`relative ${moodConfig.pupilBg} shadow-inner transition-transform duration-75 ease-out flex items-center justify-center ${
                moodConfig.pupilShape === "slit"
                  ? "w-3 sm:w-5 md:w-6 h-10 sm:h-18 md:h-24 rounded-full"
                  : moodConfig.pupilShape === "pixel"
                  ? "w-9 h-9 sm:w-14 sm:h-14 md:w-20 md:h-20 rounded-none border-2 border-black/30"
                  : isNear
                  ? "w-12 h-12 sm:w-18 sm:h-18 md:w-24 md:h-24 rounded-[14px] sm:rounded-[20px] md:rounded-[22px]"
                  : "w-10 h-10 sm:w-16 sm:h-16 md:w-22 md:h-22 rounded-[12px] sm:rounded-[18px] md:rounded-[20px]"
              }`}
              style={{
                transform: `translate(${pupilLeft.x}px, ${pupilLeft.y}px)`,
              }}
            >
              {/* Pupil Shape Details */}
              {moodConfig.pupilShape === "heart" ? (
                <span className="text-white text-lg sm:text-2xl animate-pulse">
                  💖
                </span>
              ) : moodConfig.pupilShape === "star" ? (
                <span className="text-white text-base sm:text-xl">⭐</span>
              ) : moodConfig.pupilShape === "loading" ? (
                <div className="size-4 sm:size-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {/* Futuristic Specular Gloss */}
                  <div className="absolute top-1.5 right-2 w-2 h-2 sm:w-3 sm:h-3 bg-white/90 rounded-full blur-[0.4px]" />
                  <div className="absolute bottom-1.5 left-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-300/40 rounded-full" />
                </>
              )}
            </div>
          </div>

          {/* Right Eye */}
          <div
            ref={rightEyeRef}
            id="popi-eye-right"
            className={`relative flex items-center justify-center overflow-hidden transition-all duration-200 ${moodConfig.eyeBg} ${
              moodConfig.glow
                ? moodConfig.glow
                : "shadow-2xl shadow-slate-900/10"
            } ${
              isSurprised
                ? "w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-[24px] sm:rounded-[36px] md:rounded-[42px]"
                : "w-20 h-20 sm:w-32 sm:h-32 md:w-44 md:h-44 rounded-[20px] sm:rounded-[32px] md:rounded-[36px]"
            } border-3 sm:border-4 ${moodConfig.eyeBorder}`}
            style={{
              transform:
                isBlinking || eyelids === "zen" || eyelids === "wink"
                  ? "scaleY(0.06)"
                  : "scaleY(1)",
              transformOrigin: "center center",
              transition: isBlinking
                ? "transform 0.08s ease-in-out"
                : "transform 0.14s ease-out",
            }}
          >
            {/* Pirate Eyepatch */}
            {eyelids === "pirate" ? (
              <div className="absolute inset-0 bg-neutral-900 z-30 flex items-center justify-center border-2 border-amber-600">
                <span className="text-amber-500 font-bold text-xs sm:text-sm font-['Orbitron',sans-serif]">
                  ☠️
                </span>
              </div>
            ) : (
              <>
                {/* Eyelid Masks */}
                {eyelids === "happy" && (
                  <div className="absolute bottom-0 inset-x-0 h-1/3 bg-white z-10 rounded-t-full shadow-inner border-t-2 border-slate-200" />
                )}
                {eyelids === "sleepy" && (
                  <div className="absolute top-0 inset-x-0 h-2/5 bg-slate-100 z-10 rounded-b-xl border-b border-slate-300 transition-all duration-300" />
                )}
                {eyelids === "angry" && (
                  <div className="absolute -top-2 -left-2 w-full h-1/2 bg-red-600/30 z-10 rotate-12 border-b-2 border-red-500" />
                )}
                {eyelids === "squint" && (
                  <>
                    <div className="absolute top-0 inset-x-0 h-1/4 bg-slate-900/30 z-10 border-b border-slate-400" />
                    <div className="absolute bottom-0 inset-x-0 h-1/4 bg-slate-900/30 z-10 border-t border-slate-400" />
                  </>
                )}

                {/* Laser Beam Effect */}
                {moodConfig.laserBeam && (
                  <div className="absolute inset-0 bg-red-500/30 animate-pulse pointer-events-none z-20" />
                )}

                {/* Right Pupil */}
                <div
                  id="popi-pupil-right"
                  className={`relative ${moodConfig.pupilBg} shadow-inner transition-transform duration-75 ease-out flex items-center justify-center ${
                    moodConfig.pupilShape === "slit"
                      ? "w-3 sm:w-5 md:w-6 h-10 sm:h-18 md:h-24 rounded-full"
                      : moodConfig.pupilShape === "pixel"
                      ? "w-9 h-9 sm:w-14 sm:h-14 md:w-20 md:h-20 rounded-none border-2 border-black/30"
                      : isNear
                      ? "w-12 h-12 sm:w-18 sm:h-18 md:w-24 md:h-24 rounded-[14px] sm:rounded-[20px] md:rounded-[22px]"
                      : "w-10 h-10 sm:w-16 sm:h-16 md:w-22 md:h-22 rounded-[12px] sm:rounded-[18px] md:rounded-[20px]"
                  }`}
                  style={{
                    transform: `translate(${pupilRight.x}px, ${pupilRight.y}px)`,
                  }}
                >
                  {/* Pupil Shape Details */}
                  {moodConfig.pupilShape === "heart" ? (
                    <span className="text-white text-lg sm:text-2xl animate-pulse">
                      💖
                    </span>
                  ) : moodConfig.pupilShape === "star" ? (
                    <span className="text-white text-base sm:text-xl">⭐</span>
                  ) : moodConfig.pupilShape === "loading" ? (
                    <div className="size-4 sm:size-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {/* Futuristic Specular Gloss */}
                      <div className="absolute top-1.5 right-2 w-2 h-2 sm:w-3 sm:h-3 bg-white/90 rounded-full blur-[0.4px]" />
                      <div className="absolute bottom-1.5 left-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-300/40 rounded-full" />
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
