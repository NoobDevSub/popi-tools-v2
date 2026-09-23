"use client";

import React, { useState, useEffect } from "react";
import { MetalButton } from "@/components/ui/metal-button";
import { useAuth } from "../context/AuthContext";
import { useTelegramGate } from "../context/TelegramGateContext";
import { UserAccountModal } from "./UserAccountModal";
import { AuthModal } from "./auth/AuthModal";
import { User, Crown, LayoutDashboard, LogIn } from "lucide-react";

interface HeaderProps {
  onOpenDashboard?: () => void;
}

export function Header({ onOpenDashboard }: HeaderProps) {
  const { user, isAdmin, loading } = useAuth();
  const { isChannelJoined, openGateModal } = useTelegramGate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        id="popi-header"
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 px-3 sm:px-6 md:px-8 ${
          scrolled ? "py-2 sm:py-3" : "py-2.5 sm:py-4"
        }`}
      >
        <div
          className={`max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all duration-200 ${
            scrolled
              ? "bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800"
              : "bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 shadow-xs"
          }`}
        >
          {/* Brand Logo */}
          <a
            id="popi-brand-link"
            href="#"
            className="flex items-center gap-2 sm:gap-2.5 text-slate-900 dark:text-white group focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-lg shrink-0"
          >
            {/* Mini POPI icon mark */}
            <div className="size-7 sm:size-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center gap-1 transition-transform duration-200 group-hover:scale-105 shrink-0">
              <div className="size-1.5 sm:size-2 rounded-xs bg-white dark:bg-slate-900" />
              <div className="size-1.5 sm:size-2 rounded-xs bg-white dark:bg-slate-900" />
            </div>
            <span className="font-['Orbitron',sans-serif] text-base sm:text-2xl font-black tracking-widest text-slate-900 dark:text-white">
              POPI
            </span>
            <span className="hidden md:inline-flex items-center text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-['Rajdhani',sans-serif]">
              AI Companion
            </span>
          </a>

          {/* Header Actions: Dashboard, Telegram, Download, and Google Login OAuth */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* 1. Telegram Community / Gate Button */}
            {isChannelJoined ? (
              <a
                id="header-telegram-btn"
                href="https://t.me/popitools"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open POPI Telegram community"
                className="inline-flex items-center text-slate-800 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg gap-1.5 transition-colors cursor-pointer"
                title="POPI Telegram Community (Joined)"
              >
                <i className="fi fi-brands-telegram text-sm text-[#0284C7] shrink-0" />
                <span className="hidden min-[480px]:inline">Telegram</span>
                <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" title="Channel Member Verified" />
              </a>
            ) : (
              <button
                type="button"
                id="header-telegram-btn"
                onClick={openGateModal}
                aria-label="Join POPI Telegram channel to unlock"
                className="inline-flex items-center text-slate-800 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg gap-1.5 transition-colors cursor-pointer"
                title="Join POPI Channel to Unlock App"
              >
                <i className="fi fi-brands-telegram text-sm text-[#0284C7] shrink-0" />
                <span className="hidden min-[480px]:inline">Join Channel</span>
                <span className="size-1.5 rounded-full bg-amber-500 shrink-0" title="Membership Required" />
              </button>
            )}

            {/* 2. Download App Button (Google Play) */}
            <a
              id="header-download-btn"
              href="https://play.google.com/store/apps/details?id=com.popi.popitools.ai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download POPI on Google Play"
              className="inline-flex items-center font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-xs h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-lg gap-1.5 transition-colors cursor-pointer"
              title="Download POPI on Google Play"
            >
              <svg
                className="size-3.5 sm:size-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M3.609 1.814L13.792 12 3.61 22.186A1.85 1.85 0 0 1 3 20.857V3.143c0-.528.225-1.01.609-1.329z"
                  fill="#00D3FF"
                />
                <path
                  d="M17.186 8.608L13.792 12l3.394 3.392 3.797-2.183a1.44 1.44 0 0 0 0-2.418L17.186 8.608z"
                  fill="#FFD200"
                />
                <path
                  d="M3.609 1.814c.26-.217.59-.347.951-.347.534 0 1.04.225 1.488.483l11.138 6.658L13.792 12 3.609 1.814z"
                  fill="#00F076"
                />
                <path
                  d="M13.792 12l3.394 3.392-11.138 6.658a2.535 2.535 0 0 1-1.488.483c-.361 0-.691-.13-.951-.347L13.792 12z"
                  fill="#FF3333"
                />
              </svg>
              <span className="hidden min-[360px]:inline">Download</span>
            </a>

            {/* 3. Account Access / Profile Button */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {onOpenDashboard && (
                  <button
                    type="button"
                    id="header-dashboard-btn"
                    onClick={() => {
                      if (!isChannelJoined && !isAdmin) {
                        openGateModal();
                      } else {
                        onOpenDashboard();
                      }
                    }}
                    className="hidden sm:flex items-center gap-1.5 h-8 sm:h-9 px-3 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold font-['Orbitron',sans-serif] hover:opacity-90 transition-all cursor-pointer"
                  >
                    <LayoutDashboard className="size-3.5 text-[#FF4625]" />
                    <span>Dashboard</span>
                  </button>
                )}

                <button
                  type="button"
                  id="header-user-profile-btn"
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                  title="Open POPI Account & Cloud Strategies"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      referrerPolicy="no-referrer"
                      className="size-5 sm:size-6 rounded-md object-cover border border-slate-300 dark:border-slate-600 shrink-0"
                    />
                  ) : (
                    <div className="size-5 sm:size-6 rounded-md bg-[#FF4625] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                      {isAdmin ? <Crown className="size-3 text-white" /> : <User className="size-3" />}
                    </div>
                  )}
                  <span className="max-w-[55px] min-[400px]:max-w-[80px] sm:max-w-[100px] truncate font-medium">
                    {user.displayName?.split(" ")[0] || "Account"}
                  </span>
                  {isAdmin && (
                    <span className="hidden min-[480px]:inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                      ADMIN
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="header-google-login-btn"
                onClick={() => setIsAuthModalOpen(true)}
                disabled={loading}
                className="inline-flex items-center text-white bg-[#FF4625] hover:bg-[#E03A1B] font-bold text-xs h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-lg gap-1.5 transition-colors cursor-pointer"
                title="Sign in with Email or Google"
              >
                <LogIn className="size-3.5 text-white shrink-0" />
                <span className="hidden sm:inline">Sign In / Join</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Account & Cloud Strategy Modal */}
      <UserAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Email / Google Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          if (onOpenDashboard) onOpenDashboard();
        }}
      />
    </>
  );
}

