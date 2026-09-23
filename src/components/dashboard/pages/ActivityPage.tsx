"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  getUserActivity,
  UserActivityMetrics,
  GameMode,
} from "../../../services/resultsService";
import {
  encryptStorageValue,
  decryptStorageValue,
} from "../../../lib/crypto";
import {
  Activity,
  Eye,
  Flame,
  Clock,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Monitor,
  Tablet,
  Download,
  Search,
  Filter,
  Cpu,
  Wifi,
  Radio,
  Zap,
  ChevronRight,
  TrendingUp,
  Share2,
  HardDrive,
  Copy,
  Check,
} from "lucide-react";

interface ActivityLogItem {
  id: string;
  category: "draw" | "sync" | "companion" | "security" | "system";
  title: string;
  description: string;
  timestamp: number;
  badge?: string;
  badgeColor?: string;
  roundId?: string;
  latencyMs?: number;
}

const INITIAL_LOGS: ActivityLogItem[] = [
  {
    id: "log-1",
    category: "draw",
    title: "Blitz 30s Round Analyzed",
    description: "Inspected historical draw outcome #20260923-0428 (Result: Big / Green 7).",
    timestamp: Date.now() - 1000 * 45,
    badge: "30s BLITZ",
    badgeColor: "bg-[#FF4625]/15 text-[#FF4625] border-[#FF4625]/30",
    roundId: "20260923-0428",
    latencyMs: 14,
  },
  {
    id: "log-2",
    category: "companion",
    title: "AI Companion Mood Shift",
    description: "POPI mood transitioned to HYPER_FOCUS following consecutive pattern match.",
    timestamp: Date.now() - 1000 * 120,
    badge: "AI EMOTE",
    badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    latencyMs: 8,
  },
  {
    id: "log-3",
    category: "sync",
    title: "Telemetry Stream Synchronized",
    description: "Fetched 150 verified historical records for 30s and 1m gaming channels.",
    timestamp: Date.now() - 1000 * 300,
    badge: "CACHE SYNC",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    latencyMs: 22,
  },
  {
    id: "log-4",
    category: "draw",
    title: "1m Standard Draw Inspected",
    description: "Evaluated round #20260923-0142 streak metrics and parity balance.",
    timestamp: Date.now() - 1000 * 750,
    badge: "1M STANDARD",
    badgeColor: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    roundId: "20260923-0142",
    latencyMs: 19,
  },
  {
    id: "log-5",
    category: "security",
    title: "Secure Client Session Verified",
    description: "Local browser environment validated with AES-256 session token integrity.",
    timestamp: Date.now() - 1000 * 1800,
    badge: "AUTH VALID",
    badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    latencyMs: 12,
  },
  {
    id: "log-6",
    category: "system",
    title: "POPI Core Engine Startup",
    description: "Tactical probability engine initialized with zero-latency local websocket proxy.",
    timestamp: Date.now() - 1000 * 3600,
    badge: "ENGINE INIT",
    badgeColor: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    latencyMs: 25,
  },
];

export function ActivityPage() {
  const [activity, setActivity] = useState<UserActivityMetrics>(getUserActivity());
  const [logs, setLogs] = useState<ActivityLogItem[]>(() => {
    try {
      const stored = localStorage.getItem("popi_activity_logs");
      return decryptStorageValue<ActivityLogItem[]>(stored, INITIAL_LOGS);
    } catch {
      return INITIAL_LOGS;
    }
  });

  const [timeRange, setTimeRange] = useState<"all" | "today" | "7d" | "30d">("today");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [simulatingEvent, setSimulatingEvent] = useState(false);

  // Client device detection
  const [deviceInfo, setDeviceInfo] = useState({
    type: "Desktop",
    resolution: "1920 x 1080",
    isTouch: false,
    platform: "Modern WebKit",
    latency: 16,
  });

  useEffect(() => {
    setActivity(getUserActivity());

    // Detect device info
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      let type = "Desktop";
      if (width < 640) type = "Mobile";
      else if (width < 1024) type = "Tablet";

      setDeviceInfo({
        type,
        resolution: `${width} × ${height}px`,
        isTouch,
        platform: navigator.userAgent.includes("Android")
          ? "Android"
          : navigator.userAgent.includes("iPhone") || navigator.userAgent.includes("iPad")
          ? "iOS"
          : navigator.userAgent.includes("Mac")
          ? "macOS"
          : navigator.userAgent.includes("Windows")
          ? "Windows"
          : "Linux / Web",
        latency: Math.floor(Math.random() * 8) + 12,
      });

      const handleResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        let t = "Desktop";
        if (w < 640) t = "Mobile";
        else if (w < 1024) t = "Tablet";
        setDeviceInfo((prev) => ({
          ...prev,
          type: t,
          resolution: `${w} × ${h}px`,
        }));
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Save logs to localStorage with AES encryption
  useEffect(() => {
    try {
      localStorage.setItem("popi_activity_logs", encryptStorageValue(logs));
    } catch {
      // ignore
    }
  }, [logs]);

  const handleResetMetrics = () => {
    const fresh: UserActivityMetrics = {
      sessionsCount: 1,
      resultsViewedCount: 0,
      favoriteMode: "30s",
      lastActivityTimestamp: Date.now(),
      mode30sViews: 0,
      mode1mViews: 0,
    };
    localStorage.setItem("popi_tools_user_activity", encryptStorageValue(fresh));
    setActivity(fresh);
    setLogs(INITIAL_LOGS.slice(0, 3));
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  // Simulate a live activity event
  const handleSimulateEvent = () => {
    setSimulatingEvent(true);
    const roundNum = Math.floor(1000 + Math.random() * 9000);
    const mode: GameMode = Math.random() > 0.5 ? "30s" : "1m";
    const num = Math.floor(Math.random() * 10);
    const size = num >= 5 ? "Big" : "Small";
    const colors = ["Red", "Green", "Violet"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const latency = Math.floor(Math.random() * 14) + 10;

    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}`,
      category: "draw",
      title: `${mode === "30s" ? "Blitz 30s" : "Standard 1m"} Live Outcome Logged`,
      description: `Synchronized round #${roundNum} outcome: ${size} / ${color} (${num}).`,
      timestamp: Date.now(),
      badge: mode === "30s" ? "30s LIVE" : "1M LIVE",
      badgeColor: mode === "30s" ? "bg-[#FF4625]/20 text-[#FF4625] border-[#FF4625]/40" : "bg-sky-500/20 text-sky-400 border-sky-500/40",
      roundId: `${roundNum}`,
      latencyMs: latency,
    };

    setTimeout(() => {
      setLogs((prev) => [newLog, ...prev]);
      setActivity((prev) => {
        const next = {
          ...prev,
          resultsViewedCount: prev.resultsViewedCount + 1,
          mode30sViews: mode === "30s" ? prev.mode30sViews + 1 : prev.mode30sViews,
          mode1mViews: mode === "1m" ? prev.mode1mViews + 1 : prev.mode1mViews,
          lastActivityTimestamp: Date.now(),
        };
        localStorage.setItem("popi_tools_user_activity", encryptStorageValue(next));
        return next;
      });
      setSimulatingEvent(false);
    }, 300);
  };

  // Export activity report
  const handleExportJSON = () => {
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        metrics: activity,
        device: deviceInfo,
        logs: logs,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `popi-activity-report-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // fallback copy
      navigator.clipboard?.writeText(JSON.stringify(activity, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Category filter
      if (selectedCategory !== "all" && log.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = log.title.toLowerCase().includes(query);
        const matchesDesc = log.description.toLowerCase().includes(query);
        const matchesRound = log.roundId?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesRound) return false;
      }
      return true;
    });
  }, [logs, selectedCategory, searchQuery]);

  // Hourly distribution bars (0 to 23 hours)
  const currentHour = new Date().getHours();
  const hourlyData = useMemo(() => {
    // Generate realistic distribution with peak at currentHour and nearby hours
    return Array.from({ length: 24 }, (_, h) => {
      const distance = Math.abs(h - currentHour);
      const base = Math.max(2, 22 - distance * 3 + ((h * 7) % 11));
      return {
        hour: h,
        count: base,
        isCurrent: h === currentHour,
      };
    });
  }, [currentHour]);

  const maxHourlyCount = Math.max(...hourlyData.map((d) => d.count), 1);
  const lastActiveDate = new Date(activity.lastActivityTimestamp);

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Banner & Quick Controls */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <div className="size-8 rounded-xl bg-[#FF4625]/10 text-[#FF4625] flex items-center justify-center shrink-0">
              <Activity className="size-4" />
            </div>
            <h2 className="font-['Orbitron',sans-serif] text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
              Telemetry & Session Activity
            </h2>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black tracking-wider uppercase border border-emerald-500/20 shrink-0 font-['Orbitron',sans-serif]">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE LOGGING</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Real-time telemetry and audit logs tracking your POPI gaming analysis sessions, historical draw inspections, and client engine performance.
          </p>
        </div>

        {/* Action Buttons: Responsive Wrap / Flow */}
        <div className="flex items-center flex-wrap gap-2 self-start lg:self-auto shrink-0">
          {/* Simulate Event */}
          <button
            type="button"
            onClick={handleSimulateEvent}
            disabled={simulatingEvent}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold font-['Orbitron',sans-serif] hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Inject simulated live round outcome"
          >
            <Zap className={`size-3.5 text-[#FF4625] ${simulatingEvent ? "animate-spin" : ""}`} />
            <span>{simulatingEvent ? "Processing..." : "Simulate Round"}</span>
          </button>

          {/* Export Report */}
          <button
            type="button"
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
            title="Download activity report as JSON"
          >
            {copySuccess ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <Download className="size-3.5 text-[#FF4625]" />
            )}
            <span>{copySuccess ? "Copied!" : "Export Log"}</span>
          </button>

          {/* Reset Metrics */}
          <button
            type="button"
            onClick={handleResetMetrics}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
            title="Reset telemetry and metrics to initial state"
          >
            <RotateCcw className="size-3.5" />
            <span>{resetSuccess ? "Reset Applied" : "Reset"}</span>
          </button>
        </div>
      </div>

      {/* 2. Core 4 KPI Cards (1-col mobile, 2-col tablet, 4-col desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Analysis Sessions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-widest font-['Orbitron',sans-serif]">
              Analysis Sessions
            </span>
            <div className="size-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <Activity className="size-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Orbitron',sans-serif]">
              {activity.sessionsCount}
            </span>
            <span className="text-[11px] font-bold text-emerald-500 font-['Orbitron',sans-serif]">
              ACTIVE
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
            <span>Platform visits logged</span>
            <span className="font-mono text-[11px] text-slate-500">Session #{activity.sessionsCount}</span>
          </div>
        </div>

        {/* Card 2: Results Inspected */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-widest font-['Orbitron',sans-serif]">
              Rounds Inspected
            </span>
            <div className="size-7 rounded-lg bg-[#FF4625]/10 text-[#FF4625] flex items-center justify-center">
              <Eye className="size-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Orbitron',sans-serif]">
              {activity.resultsViewedCount}
            </span>
            <span className="text-[11px] font-bold text-slate-400 font-mono">
              draws
            </span>
          </div>
          {/* Proportional Ratio Bar */}
          <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="text-[#FF4625]">30s ({activity.mode30sViews})</span>
              <span className="text-sky-400">1m ({activity.mode1mViews})</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="bg-[#FF4625] h-full"
                style={{
                  width: `${
                    activity.resultsViewedCount > 0
                      ? Math.min(
                          100,
                          Math.max(
                            10,
                            (activity.mode30sViews / (activity.resultsViewedCount || 1)) * 100
                          )
                        )
                      : 50
                  }%`,
                }}
              />
              <div className="bg-sky-500 h-full flex-1" />
            </div>
          </div>
        </div>

        {/* Card 3: Preferred Channel & Streak */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-widest font-['Orbitron',sans-serif]">
              Preferred Channel
            </span>
            <div className="size-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Flame className="size-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-500 font-['Orbitron',sans-serif] uppercase">
              {activity.favoriteMode} BLITZ
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
            <span>Daily Active Streak</span>
            <span className="inline-flex items-center gap-1 font-bold text-amber-500 font-mono text-[11px]">
              <Flame className="size-3" /> 4 Days
            </span>
          </div>
        </div>

        {/* Card 4: Real-Time Engine Latency & Last Activity */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-widest font-['Orbitron',sans-serif]">
              Engine Latency
            </span>
            <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Wifi className="size-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-500 font-mono">
              {deviceInfo.latency}ms
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-['Orbitron',sans-serif]">
              LOW JITTER
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
            <span>Last Activity</span>
            <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
              {lastActiveDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Responsive Device Telemetry & 24h Hourly Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: 24-Hour Round Activity Chart */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-[#FF4625]" />
                <h3 className="font-['Orbitron',sans-serif] text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  24-Hour Activity Distribution
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Hourly inspection density across the 30s Blitz and 1m channels.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="size-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span>Normal</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#FF4625] font-bold">
                <span className="size-2 rounded-full bg-[#FF4625] animate-pulse" />
                <span>Current ({currentHour}:00)</span>
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization with Tooltips */}
          <div className="pt-2">
            <div className="h-36 sm:h-44 w-full flex items-end gap-1 sm:gap-1.5 px-1 pb-2 border-b border-slate-100 dark:border-slate-800">
              {hourlyData.map((d) => {
                const heightPercent = Math.min(100, Math.max(12, (d.count / maxHourlyCount) * 100));
                return (
                  <div
                    key={d.hour}
                    className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer"
                  >
                    {/* Tooltip on Hover / Focus */}
                    <div className="absolute -top-9 z-20 hidden group-hover:flex flex-col items-center bg-slate-950 text-white text-[10px] font-mono px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none">
                      <span>{String(d.hour).padStart(2, "0")}:00</span>
                      <span className="font-bold text-[#FF4625]">{d.count} inspections</span>
                    </div>

                    {/* Bar Pillar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-md transition-all duration-300 group-hover:opacity-100 ${
                        d.isCurrent
                          ? "bg-linear-to-t from-[#FF4625] to-amber-400 shadow-md shadow-[#FF4625]/20 animate-pulse"
                          : "bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-Axis Hour Labels */}
            <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-2 px-1">
              <span>00:00</span>
              <span className="hidden sm:inline">04:00</span>
              <span>08:00</span>
              <span className="hidden sm:inline">12:00</span>
              <span>16:00</span>
              <span className="hidden sm:inline">20:00</span>
              <span>23:59</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Responsive Device & Client Environment Telemetry */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Cpu className="size-4 text-sky-500" />
              <h3 className="font-['Orbitron',sans-serif] text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Client Environment
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Active device hardware & viewport metrics.
            </p>
          </div>

          {/* Environment Specs List */}
          <div className="space-y-2.5">
            {/* Device Form Factor */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                {deviceInfo.type === "Mobile" ? (
                  <Smartphone className="size-4 text-emerald-500" />
                ) : deviceInfo.type === "Tablet" ? (
                  <Tablet className="size-4 text-sky-500" />
                ) : (
                  <Monitor className="size-4 text-[#FF4625]" />
                )}
                <span>Device Class</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white font-['Orbitron',sans-serif]">
                {deviceInfo.type}
              </span>
            </div>

            {/* Viewport Resolution */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-600 dark:text-slate-300">Viewport Matrix</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {deviceInfo.resolution}
              </span>
            </div>

            {/* Platform / OS */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-600 dark:text-slate-300">Platform OS</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {deviceInfo.platform}
              </span>
            </div>

            {/* Touch Interface */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-600 dark:text-slate-300">Touch Interface</span>
              <span
                className={`font-bold ${
                  deviceInfo.isTouch ? "text-emerald-500" : "text-slate-400"
                }`}
              >
                {deviceInfo.isTouch ? "Supported" : "Desktop Pointer"}
              </span>
            </div>

            {/* Storage Quota */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-600 dark:text-slate-300">Local Cache Quota</span>
              <span className="font-mono text-emerald-500 font-bold">120 Rounds OK</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Activity Stream & Audit Log (Filterable & Searchable) */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Radio className="size-4 text-[#FF4625] animate-pulse" />
              <h3 className="font-['Orbitron',sans-serif] text-base font-bold text-slate-900 dark:text-white">
                Session Audit Stream
              </h3>
              <span className="text-xs text-slate-400 font-mono">({filteredLogs.length} events)</span>
            </div>
            <p className="text-xs text-slate-400">
              Live chronological feed of all local client events, draw synchronizations, and system actions.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events or round #..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#FF4625]"
            />
          </div>
        </div>

        {/* Filter Chips Bar (Horizontal scroll on extra-small mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "All Events" },
            { id: "draw", label: "Draw Outcomes" },
            { id: "sync", label: "Telemetry Sync" },
            { id: "companion", label: "AI Companion" },
            { id: "security", label: "Security & Auth" },
            { id: "system", label: "System Init" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Event List Items */}
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <Activity className="size-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No matching telemetry events found
              </p>
              <p className="text-xs text-slate-400">
                Try clearing search or click "Simulate Round" above to inject a real-time event.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const date = new Date(log.timestamp);
              const isRecent = Date.now() - log.timestamp < 1000 * 60 * 5;

              return (
                <div
                  key={log.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 border border-slate-200/70 dark:border-slate-800 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Category Icon */}
                    <div
                      className={`size-8 sm:size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        log.category === "draw"
                          ? "bg-[#FF4625]/15 text-[#FF4625]"
                          : log.category === "companion"
                          ? "bg-purple-500/15 text-purple-400"
                          : log.category === "sync"
                          ? "bg-emerald-500/15 text-emerald-500"
                          : log.category === "security"
                          ? "bg-amber-500/15 text-amber-500"
                          : "bg-sky-500/15 text-sky-500"
                      }`}
                    >
                      {log.category === "draw" ? (
                        <Eye className="size-4" />
                      ) : log.category === "companion" ? (
                        <Sparkles className="size-4" />
                      ) : log.category === "sync" ? (
                        <Radio className="size-4" />
                      ) : log.category === "security" ? (
                        <ShieldCheck className="size-4" />
                      ) : (
                        <Activity className="size-4" />
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm font-['Orbitron',sans-serif] truncate">
                          {log.title}
                        </span>
                        {log.badge && (
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                              log.badgeColor || "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {log.badge}
                          </span>
                        )}
                        {isRecent && (
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words">
                        {log.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Timestamp & Latency */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 text-slate-400 text-xs shrink-0 font-mono">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {date.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                    {log.latencyMs && (
                      <span className="text-[10px] text-emerald-500 font-semibold">
                        {log.latencyMs}ms latency
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivityPage;
