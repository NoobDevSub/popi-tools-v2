/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Telegram Channel Gate Modal
 * Blocks or prompts app access until user joins the official POPI Telegram channel
 */

import React, { useState } from "react";
import { useTelegramGate } from "../../context/TelegramGateContext";
import { useAuth } from "../../context/AuthContext";
import {
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Lock,
  Radio,
  ArrowRight,
  ShieldCheck,
  Bot,
} from "lucide-react";

interface TelegramChannelGateModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isBlocking?: boolean;
}

export function TelegramChannelGateModal({
  isOpen,
  onClose,
  isBlocking = true,
}: TelegramChannelGateModalProps) {
  const {
    isChannelJoined,
    telegramHandle,
    setTelegramHandle,
    isChecking,
    checkStatusMessage,
    config,
    verifyMembership,
    bypassGateForAdmin,
  } = useTelegramGate();
  const { isAdmin, user } = useAuth();
  const [inputHandle, setInputHandle] = useState<string>(telegramHandle || "");
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLocalError(null);
    const target = inputHandle.trim();
    if (!target) {
      setLocalError("Please enter your Telegram username or numeric ID.");
      return;
    }
    const success = await verifyMembership(target);
    if (!success && !checkStatusMessage) {
      setLocalError("Could not verify channel membership. Make sure you joined @popitools first.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-5 sm:p-7 text-white font-['Rajdhani',sans-serif] space-y-5 my-auto">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#FF4625] to-transparent rounded-full" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
              <i className="fi fi-brands-telegram text-2xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black font-['Orbitron',sans-serif] tracking-wide text-white">
                  Telegram Channel Gate
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-[#FF4625]/20 text-[#FF4625] text-[10px] font-bold tracking-widest uppercase border border-[#FF4625]/30">
                  Required
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Telegram verification for ✦ ק๏קเ (@{config.botUsername})
              </p>
            </div>
          </div>

          {!isBlocking && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Main Banner / Notice */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 font-['Orbitron',sans-serif]">
            <Radio className="size-3.5 text-sky-400 animate-pulse" />
            <span>JOIN TO UNLOCK POPI TOOLS</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            To use POPI Tools, access live prediction feeds, and run tactical scripts, you must be a member of our official Telegram community.
          </p>
        </div>

        {/* Step 1: Join Channels */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 font-['Orbitron',sans-serif]">
            <span>Step 1: Join Official Channels</span>
            <span className="text-[10px] text-sky-400">Public & VIP</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Public Channel Button */}
            <a
              href={config.publicChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 hover:border-sky-500/50 text-sky-300 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 truncate">
                <i className="fi fi-brands-telegram text-lg text-sky-400 shrink-0" />
                <div className="truncate text-left">
                  <div className="text-xs font-bold text-white group-hover:text-sky-300 truncate">
                    Join Public Channel
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    @{config.publicChannelUsername}
                  </div>
                </div>
              </div>
              <ExternalLink className="size-3.5 text-sky-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* VIP Private Channel Button */}
            <a
              href={config.privateChannelInvite}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-300 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Lock className="size-4 text-amber-400 shrink-0" />
                <div className="truncate text-left">
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                    VIP Private Channel
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    Invite Link
                  </div>
                </div>
              </div>
              <ExternalLink className="size-3.5 text-amber-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Bot Assistant Link */}
          <a
            href={config.botUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
          >
            <Bot className="size-3.5 text-sky-400" />
            <span>Open Bot: <b>@{config.botUsername}</b> (Sends payment notifications)</span>
          </a>
        </div>

        {/* Step 2: Verify Membership */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 font-['Orbitron',sans-serif]">
            <span>Step 2: Verify Membership</span>
            {isChannelJoined && (
              <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
                <CheckCircle2 className="size-3" /> VERIFIED
              </span>
            )}
          </div>

          <form onSubmit={handleVerify} className="space-y-2.5">
            <div className="relative">
              <input
                type="text"
                value={inputHandle}
                onChange={(e) => {
                  setInputHandle(e.target.value);
                  setLocalError(null);
                }}
                placeholder="Enter @your_username or Telegram user ID"
                className="w-full pl-3.5 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm text-white placeholder:text-slate-500 font-mono outline-none transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">
                TG
              </span>
            </div>

            {/* Status Feedback */}
            {(localError || checkStatusMessage) && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  isChannelJoined
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                    : "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                }`}
              >
                {isChannelJoined ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <ShieldAlert className="size-4 shrink-0 text-amber-400 mt-0.5" />
                )}
                <span>{localError || checkStatusMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="submit"
                disabled={isChecking}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider font-['Orbitron',sans-serif] shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4" />
                    <span>Verify & Unlock App</span>
                  </>
                )}
              </button>

              {isChannelJoined && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider font-['Orbitron',sans-serif] transition-all cursor-pointer"
                >
                  Continue to App →
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Admin or Bypass Footer for Testing */}
        {(isAdmin || (user?.email && ["subhojitbhandari2021@gmail.com", "titnesgamer@gmail.com", "mrtitnes@gmail.com", "subhojit62950@gmail.com"].includes(user.email))) && (
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Sparkles className="size-3" /> Admin Recognized
            </span>
            <button
              type="button"
              onClick={bypassGateForAdmin}
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              Instant Admin Bypass (Dev Mode)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
