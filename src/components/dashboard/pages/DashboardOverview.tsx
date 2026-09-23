"use client";

import React, { useState, useEffect } from "react";
import {
  GameMode,
  HistoricalResult,
  ConnectionStatus,
  ResultsStatistics,
  getNextRoundCountdown,
} from "../../../services/resultsService";
import {
  Clock,
  Radio,
  RefreshCw,
  TrendingUp,
  Activity,
  Layers,
  ArrowRight,
  ShieldAlert,
  BarChart2,
  Sparkles,
  Zap,
  Crown,
  Key,
  UploadCloud,
  UserCheck,
  CreditCard,
} from "lucide-react";
import { DashboardPage } from "../Sidebar";
import { useAuth } from "../../../context/AuthContext";
import {
  subscribeToUserUsage,
  subscribeToApiKeys,
  POPI_PLANS,
  type UserUsageData,
  type ApiKeyRecord,
  type PopiPlanType,
} from "../../../lib/firebase";

interface DashboardOverviewProps {
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  results: HistoricalResult[];
  statistics: ResultsStatistics;
  connectionStatus: ConnectionStatus;
  isRefreshing: boolean;
  onRefresh: () => void;
  onNavigatePage: (page: DashboardPage) => void;
  isAdmin?: boolean;
}

export function DashboardOverview({
  selectedMode,
  onSelectMode,
  results,
  statistics,
  connectionStatus,
  isRefreshing,
  onRefresh,
  onNavigatePage,
  isAdmin = false,
}: DashboardOverviewProps) {
  const { user, profile } = useAuth();
  const latestResult = results[0];
  const countdown = getNextRoundCountdown(selectedMode);

  const [usage, setUsage] = useState<UserUsageData>({
    uploadCount: 0,
    remainingUploads: 4,
    lastUploadReset: new Date().toISOString(),
  });
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);

  const rawPlan = (profile as any)?.plan || (profile as any)?.subscriptionPlan || "free";
  const planKey = (rawPlan.toLowerCase() as PopiPlanType) in POPI_PLANS ? (rawPlan.toLowerCase() as PopiPlanType) : "free";
  const planInfo = POPI_PLANS[planKey] || POPI_PLANS.free;
  const weeklyQuota = isAdmin ? 9999 : planInfo.uploadsPerWeek;

  useEffect(() => {
    if (!user?.uid) return;
    const unsubUsage = subscribeToUserUsage(user.uid, (u: UserUsageData) => setUsage(u));
    const unsubKeys = subscribeToApiKeys(user.uid, (keys: ApiKeyRecord[]) => setApiKeys(keys));
    return () => {
      unsubUsage();
      unsubKeys();
    };
  }, [user?.uid]);

  const activeKeysCount = apiKeys.filter((k) => k.status === "active").length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Admin God Mode Tactical Bar */}
      {isAdmin && (
        <div className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-linear-to-r from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/40 text-white shadow-xl">
          <div className="absolute -right-6 -bottom-6 size-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <Crown className="size-6 text-amber-400 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black font-['Orbitron',sans-serif] tracking-wider text-amber-400">
                    ADMIN GOD MODE ACTIVE
                  </h3>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-['Orbitron',sans-serif]">
                    ALL FEATURES UNLOCKED
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  38+ companion moods, zero-delay round feeds, rolling 100+ telemetry, and unrestricted admin controls.
                </p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigatePage("admin")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-['Orbitron',sans-serif] tracking-wide transition-all shadow-md cursor-pointer"
              >
                <ShieldAlert className="size-3.5" />
                <span>Admin Command Suite</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigatePage("admin")}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs font-['Orbitron',sans-serif] border border-slate-700 transition-all cursor-pointer"
              >
                <span>Edit Live Plans & Prices</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. Live Local Time */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-widest font-['Orbitron',sans-serif]">
              Local Time
            </span>
            <Clock className="size-3.5 text-[#FF4625]" />
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono">
            {new Date().toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <p className="text-[10px] text-slate-400">Syncs every second</p>
        </div>

        {/* 2. Data Status */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-widest font-['Orbitron',sans-serif]">
              Data Status
            </span>
            <Radio className="size-3.5 text-emerald-500" />
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-500 font-['Orbitron',sans-serif]">
            {connectionStatus}
          </div>
          <p className="text-[10px] text-slate-400">Low latency stream</p>
        </div>

        {/* 3. Latest Result */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-widest font-['Orbitron',sans-serif]">
              Latest Result
            </span>
            <Zap className="size-3.5 text-[#FF4625]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-['Orbitron',sans-serif]">
              {latestResult ? latestResult.number : "--"}
            </span>
            {latestResult && (
              <span
                className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  latestResult.size === "Big"
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                }`}
              >
                {latestResult.size}
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400">
            {latestResult?.color || "Awaiting draw"}
          </p>
        </div>

        {/* 4. Results Today */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-widest font-['Orbitron',sans-serif]">
              Records Cached
            </span>
            <Layers className="size-3.5 text-sky-500" />
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-['Orbitron',sans-serif]">
            {results.length} Rounds
          </div>
          <p className="text-[10px] text-slate-400">Full audit log</p>
        </div>

        {/* 5. Analysis Window */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-widest font-['Orbitron',sans-serif]">
              Analysis Window
            </span>
            <BarChart2 className="size-3.5 text-[#FF4625]" />
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-['Orbitron',sans-serif]">
            Last 50
          </div>
          <p className="text-[10px] text-slate-400">Active sample</p>
        </div>
      </div>

      {/* POPI User Account & Firebase Realtime Database Usage Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white relative overflow-hidden shadow-lg space-y-4 font-['Rajdhani',sans-serif]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="size-full object-cover"
                />
              ) : (
                <UserCheck className="size-6 text-[#FF4625]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Orbitron',sans-serif] font-black text-sm text-white">
                  {profile?.displayName || user?.displayName || "POPI Gamer"}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono">
                  {(profile as any)?.status || (profile?.bannedAt ? "SUSPENDED" : "ACTIVE")}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#FF4625]/20 text-[#FF4625] text-[10px] font-bold font-['Orbitron',sans-serif]">
                  {isAdmin ? "GOD MODE" : `${planInfo.name} Plan (₹${planInfo.price})`}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {user?.email || "Connected via Firebase Authentication"}
              </p>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigatePage("uploads")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer transition-colors"
            >
              <UploadCloud className="size-3.5 text-emerald-400" />
              <span>Script Uploads</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage("api-keys")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer transition-colors"
            >
              <Key className="size-3.5 text-[#FF4625]" />
              <span>API Keys ({activeKeysCount})</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage("subscription")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-linear-to-r from-[#FF4625] to-amber-500 text-white text-xs font-black font-['Orbitron',sans-serif] hover:opacity-90 cursor-pointer transition-all shadow-xs"
            >
              <CreditCard className="size-3.5" />
              <span>Manage Plan</span>
            </button>
          </div>
        </div>

        {/* Real-time Usage Metrics Strip */}
        <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
              <span>WEEKLY SCRIPT UPLOADS</span>
              <UploadCloud className="size-3 text-emerald-400" />
            </div>
            <div className="font-['Orbitron',sans-serif] font-bold text-sm text-white">
              {usage.uploadCount} / {isAdmin ? "Unlimited" : weeklyQuota}
            </div>
            <div className="text-[10px] text-emerald-400">
              {isAdmin ? "God Mode (No Limits)" : `${usage.remainingUploads} remaining this week`}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
              <span>DEVELOPER API KEYS</span>
              <Key className="size-3 text-[#FF4625]" />
            </div>
            <div className="font-['Orbitron',sans-serif] font-bold text-sm text-white">
              {activeKeysCount} Active Key{activeKeysCount !== 1 ? "s" : ""}
            </div>
            <div className="text-[10px] text-slate-400">
              Encrypted Realtime Database storage
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
              <span>SUBSCRIPTION STATUS</span>
              <Sparkles className="size-3 text-amber-400" />
            </div>
            <div className="font-['Orbitron',sans-serif] font-bold text-sm text-amber-400">
              {isAdmin ? "GOD MODE VIP" : `${planInfo.name.toUpperCase()} (₹${planInfo.price})`}
            </div>
            <div className="text-[10px] text-slate-400">
              {isAdmin ? "Infinite lifetime license" : "Auto-synced with Firebase"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Overview Card: Live Results Monitor */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-6">
        {/* Subtle decorative background circuit */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[#FF4625]/5 blur-3xl"
        />

        {/* Card Header: Title & Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-['Orbitron',sans-serif] tracking-wider">
                Live Results Monitor
              </h2>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deterministic historical draw monitor. Displays settled numbers, size, and color parity.
            </p>
          </div>

          {/* Mode Switcher Pill */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onSelectMode("30s")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-['Orbitron',sans-serif] ${
                selectedMode === "30s"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              30 Seconds
            </button>
            <button
              type="button"
              onClick={() => onSelectMode("1m")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-['Orbitron',sans-serif] ${
                selectedMode === "1m"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              1 Minute
            </button>
          </div>
        </div>

        {/* Big Live Result Display Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2 relative z-10">
          {/* Main Settled Result Spotlight */}
          <div className="md:col-span-5 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 font-['Orbitron',sans-serif]">
              Settled Round Result
            </span>

            {/* Giant Number Indicator */}
            <div className="relative">
              <div
                className={`size-24 sm:size-28 rounded-3xl flex items-center justify-center font-['Orbitron',sans-serif] text-5xl sm:text-6xl font-black shadow-lg transition-transform duration-300 hover:scale-105 ${
                  latestResult?.color.includes("Red") &&
                  latestResult?.color.includes("Violet")
                    ? "bg-gradient-to-br from-rose-500 to-purple-600 text-white"
                    : latestResult?.color.includes("Green") &&
                      latestResult?.color.includes("Violet")
                    ? "bg-gradient-to-br from-emerald-500 to-purple-600 text-white"
                    : latestResult?.color.includes("Red")
                    ? "bg-rose-500 text-white"
                    : "bg-emerald-500 text-white"
                }`}
              >
                {latestResult ? latestResult.number : "?"}
              </div>
            </div>

            {/* Size & Color Classification Badges */}
            <div className="flex items-center gap-2 pt-1">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-['Orbitron',sans-serif] ${
                  latestResult?.size === "Big"
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                }`}
              >
                {latestResult?.size || "--"} (
                {latestResult?.size === "Big" ? "5–9" : "0–4"})
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-['Orbitron',sans-serif] ${
                  latestResult?.color.includes("Red") &&
                  latestResult?.color.includes("Violet")
                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30"
                    : latestResult?.color.includes("Green") &&
                      latestResult?.color.includes("Violet")
                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30"
                    : latestResult?.color === "Red"
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {latestResult?.color || "--"}
              </span>
            </div>
          </div>

          {/* Round Metadata & Countdown Timer */}
          <div className="md:col-span-7 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-['Orbitron',sans-serif]">
                  Current Round ID
                </span>
                <div className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {latestResult?.roundId || "--"}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-['Orbitron',sans-serif]">
                  Settlement Time
                </span>
                <div className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {latestResult?.timeFormatted || "--"}
                </div>
              </div>
            </div>

            {/* Next Round Progress Bar */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-300 font-['Orbitron',sans-serif]">
                  Next Round Settlement In:
                </span>
                <span className="font-mono font-bold text-[#FF4625]">
                  {countdown.secondsLeft}s
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF4625] to-orange-400 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${countdown.percentRemaining}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Mode: {selectedMode} draw cycle</span>
                <span>Auto-refresh active</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 font-['Orbitron',sans-serif]"
              >
                <RefreshCw
                  className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span>Sync Now</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigatePage("live")}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#FF4625] hover:underline cursor-pointer"
              >
                <span>Full Live Feed</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sequence Preview Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-[#FF4625]" />
            <h3 className="font-['Orbitron',sans-serif] text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Recent 10 Draw Sequence
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Chronological Flow
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {statistics.recentSequence.map((item, idx) => (
            <div
              key={idx}
              className="shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 min-w-[54px]"
            >
              <span
                className={`size-7 rounded-lg flex items-center justify-center text-xs font-black text-white font-['Orbitron',sans-serif] ${
                  item.color.includes("Red") ? "bg-rose-500" : "bg-emerald-500"
                }`}
              >
                {item.number}
              </span>
              <span
                className={`text-[9px] font-bold uppercase ${
                  item.size === "Big" ? "text-amber-500" : "text-indigo-500"
                }`}
              >
                {item.size}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mini Quick History Table & Shortcut Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick 5 Table */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-['Orbitron',sans-serif] text-sm font-bold text-slate-900 dark:text-white">
              Latest Settled Rounds
            </h3>
            <button
              type="button"
              onClick={() => onNavigatePage("history")}
              className="text-xs text-[#FF4625] font-bold hover:underline cursor-pointer"
            >
              View All History &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-['Rajdhani',sans-serif]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 font-['Orbitron',sans-serif]">
                  <th className="pb-2.5">Round ID</th>
                  <th className="pb-2.5">Number</th>
                  <th className="pb-2.5">Size</th>
                  <th className="pb-2.5">Color</th>
                  <th className="pb-2.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {results.slice(0, 5).map((r) => (
                  <tr
                    key={r.roundId}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 font-mono font-bold text-slate-900 dark:text-white">
                      {r.roundId}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`size-6 rounded-md inline-flex items-center justify-center font-bold font-['Orbitron',sans-serif] text-white ${
                          r.color.includes("Red")
                            ? "bg-rose-500"
                            : "bg-emerald-500"
                        }`}
                      >
                        {r.number}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          r.size === "Big"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        }`}
                      >
                        {r.size}
                      </span>
                    </td>
                    <td className="py-2.5 font-medium text-slate-600 dark:text-slate-300">
                      {r.color}
                    </td>
                    <td className="py-2.5 text-slate-400 font-mono">
                      {r.timeFormatted}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Analytical Breakdown Card */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-['Orbitron',sans-serif] text-sm font-bold text-slate-900 dark:text-white">
                Distribution Quick View
              </h3>
              <span className="text-[10px] text-slate-400">Past 50</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Big ({statistics.bigCount})</span>
                  <span>Small ({statistics.smallCount})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-indigo-500 overflow-hidden flex">
                  <div
                    className="h-full bg-amber-500"
                    style={{
                      width: `${
                        (statistics.bigCount /
                          (statistics.totalRecords || 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Red ({statistics.redCount})</span>
                  <span>Green ({statistics.greenCount})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-emerald-500 overflow-hidden flex">
                  <div
                    className="h-full bg-rose-500"
                    style={{
                      width: `${
                        (statistics.redCount /
                          (statistics.totalRecords || 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigatePage("analysis")}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-900 dark:text-white transition-all cursor-pointer font-['Orbitron',sans-serif]"
          >
            <BarChart2 className="size-3.5 text-[#FF4625]" />
            <span>Open Deep Analytics</span>
          </button>
        </div>
      </div>

      {/* Real-Time Firebase Stream & Community Lounge Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 text-white relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 w-80 h-full bg-linear-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Radio className="size-6 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black font-['Orbitron',sans-serif] tracking-wider text-white">
                  Cloud Firestore Real-Time Stream
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                  CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Live draw broadcasts, multi-device sync, and community gamer prediction lounge.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigatePage("realtime")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-[#FF4625] to-amber-500 hover:opacity-90 text-white font-black text-xs font-['Orbitron',sans-serif] tracking-wide transition-all shadow-md cursor-pointer self-start sm:self-auto"
          >
            <span>Open Realtime Lounge</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
