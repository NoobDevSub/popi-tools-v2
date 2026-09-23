"use client";

import React, { useState, useMemo } from "react";
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
  Search,
  Filter,
  Download,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  MoreVertical,
  Scale,
  Palette,
  Target,
} from "lucide-react";
import { DashboardPage } from "../Sidebar";
import { useAuth } from "../../../context/AuthContext";
import {
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

  // Table filtering and pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<"ALL" | "Big" | "Small">("ALL");
  const [selectedColorFilter, setSelectedColorFilter] = useState<"ALL" | "Red" | "Green" | "Violet">("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [copiedRoundId, setCopiedRoundId] = useState<string | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  const rawPlan = (profile as any)?.plan || (profile as any)?.subscriptionPlan || "free";
  const planKey = (rawPlan.toLowerCase() as PopiPlanType) in POPI_PLANS ? (rawPlan.toLowerCase() as PopiPlanType) : "free";
  const planInfo = POPI_PLANS[planKey] || POPI_PLANS.free;

  // Filter & sort results for the table
  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesIssue = item.roundId.toLowerCase().includes(q);
        const matchesNum = item.number.toString() === q;
        if (!matchesIssue && !matchesNum) return false;
      }
      if (selectedSizeFilter !== "ALL" && item.size !== selectedSizeFilter) {
        return false;
      }
      if (selectedColorFilter !== "ALL") {
        if (selectedColorFilter === "Violet" && !item.color.toLowerCase().includes("violet")) {
          return false;
        }
        if (selectedColorFilter === "Red" && !item.color.toLowerCase().includes("red")) {
          return false;
        }
        if (selectedColorFilter === "Green" && !item.color.toLowerCase().includes("green")) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortOrder === "asc") {
        return a.roundId.localeCompare(b.roundId, undefined, { numeric: true });
      }
      return b.roundId.localeCompare(a.roundId, undefined, { numeric: true });
    });
  }, [results, searchQuery, selectedSizeFilter, selectedColorFilter, sortOrder]);

  const totalPages = Math.ceil(filteredResults.length / pageSize) || 1;
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredResults.slice(start, start + pageSize);
  }, [filteredResults, currentPage, pageSize]);

  const handleCopy = (roundId: string) => {
    navigator.clipboard.writeText(roundId);
    setCopiedRoundId(roundId);
    setTimeout(() => setCopiedRoundId(null), 2000);
  };

  const handleToggleSelectAll = () => {
    if (selectedRowIds.size === paginatedResults.length) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(paginatedResults.map((r) => r.roundId)));
    }
  };

  const handleToggleRow = (roundId: string) => {
    const next = new Set(selectedRowIds);
    if (next.has(roundId)) {
      next.delete(roundId);
    } else {
      next.add(roundId);
    }
    setSelectedRowIds(next);
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;
    const headers = ["Issue Number", "Number", "Size", "Color", "Settled Time", "Mode"];
    const rows = results.map((r) => [
      r.roundId,
      r.number,
      r.size,
      `"${r.color}"`,
      `"${r.timeFormatted}"`,
      r.mode,
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `popi-wingo-${selectedMode}-draws-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sparkline generator helper
  const sparklineBars = useMemo(() => {
    return results.slice(0, 24).reverse().map((r, i) => {
      const isRed = r.color.toLowerCase().includes("red");
      const isGreen = r.color.toLowerCase().includes("green");
      const heightPercent = 25 + (r.number * 7.5);
      return {
        key: i,
        height: `${heightPercent}%`,
        color: isRed ? "bg-rose-400 dark:bg-rose-500" : isGreen ? "bg-emerald-400 dark:bg-emerald-500" : "bg-purple-400",
      };
    });
  }, [results]);

  const bigPercentage = Math.round(((statistics.bigCount || 0) / (statistics.totalRecords || 1)) * 100);
  const smallPercentage = 100 - bigPercentage;
  const redPercentage = Math.round(((statistics.redCount || 0) / (statistics.totalRecords || 1)) * 100);
  const greenPercentage = Math.round(((statistics.greenCount || 0) / (statistics.totalRecords || 1)) * 100);
  const violetPercentage = Math.max(0, 100 - redPercentage - greenPercentage);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* 4 Crisp Square-Type Metric Cards (Exact structure of Reference Image 1 & 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Latest Settled Round Issue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Latest Settled Issue
            </span>
            <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Layers className="size-4 text-[#FF4625]" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="font-mono text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                {latestResult ? `#${latestResult.roundId.slice(-6)}` : "--"}
              </div>
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                ↑ 100% Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
              {latestResult ? latestResult.roundId : "Awaiting draw"}
            </p>
          </div>

          {/* Micro Sparkline Bar Chart at bottom (as in Image 1!) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/70">
            <div className="flex items-end gap-1 h-7 w-full overflow-hidden">
              {sparklineBars.map((bar) => (
                <div
                  key={bar.key}
                  className={`flex-1 rounded-xs transition-all duration-300 opacity-80 hover:opacity-100 ${bar.color}`}
                  style={{ height: bar.height }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Size Parity (Big vs Small) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Size Parity (Big vs Small)
            </span>
            <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Scale className="size-4 text-amber-500" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-['Orbitron',sans-serif]">
                {bigPercentage}% Big
              </div>
              <span className="inline-flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                {smallPercentage}% Small
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {statistics.bigCount} Big vs {statistics.smallCount} Small in last {statistics.totalRecords} draws
            </p>
          </div>

          {/* Segmented Dual Bar at bottom */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/70 space-y-1">
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${bigPercentage}%` }}
              />
              <div
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${smallPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span className="text-amber-600 dark:text-amber-400 font-bold">Big (5-9)</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Small (0-4)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Color Matrix & Dominance */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Dominant Color Matrix
            </span>
            <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Palette className="size-4 text-rose-500" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-['Orbitron',sans-serif]">
                {redPercentage >= greenPercentage ? "Red Flow" : "Green Flow"}
              </div>
              <span className="inline-flex items-center text-[10px] font-bold text-rose-600 dark:text-rose-400 font-mono">
                {redPercentage}% R / {greenPercentage}% G
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Violet parity balance: {violetPercentage}% occurrence
            </p>
          </div>

          {/* Tri-color Micro Bar */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/70 space-y-1">
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
              <div
                className="h-full bg-rose-500 transition-all duration-500"
                style={{ width: `${redPercentage}%` }}
              />
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${greenPercentage}%` }}
              />
              <div
                className="h-full bg-purple-500 transition-all duration-500"
                style={{ width: `${violetPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span className="text-rose-500 font-bold">Red ({statistics.redCount})</span>
              <span className="text-emerald-500 font-bold">Grn ({statistics.greenCount})</span>
              <span className="text-purple-400 font-bold">Vio</span>
            </div>
          </div>
        </div>

        {/* Card 4: Tactical Win Confidence Index */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex flex-col justify-between space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Tactical Confidence
            </span>
            <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Target className="size-4 text-emerald-500" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-['Orbitron',sans-serif]">
                88.5% Index
              </div>
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                ↑ High Signal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Algorithmic momentum & reversion telemetry
            </p>
          </div>

          {/* Progress bar */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/70 space-y-1">
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-emerald-500 to-teal-400 rounded-full"
                style={{ width: "88.5%" }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Volatility: Low</span>
              <span className="text-emerald-500 font-bold">Optimal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Spotlight & Settlement Countdown Banner (Square Card) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Settled Winning Number in Square Tile */}
          <div className="lg:col-span-4 flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70">
            {/* Square Tile */}
            <div
              className={`size-16 sm:size-20 rounded-2xl flex items-center justify-center font-['Orbitron',sans-serif] text-3xl sm:text-4xl font-black text-white shadow-sm shrink-0 ${
                latestResult?.color.includes("Red") && latestResult?.color.includes("Violet")
                  ? "bg-linear-to-br from-rose-500 to-purple-600"
                  : latestResult?.color.includes("Green") && latestResult?.color.includes("Violet")
                  ? "bg-linear-to-br from-emerald-500 to-purple-600"
                  : latestResult?.color.includes("Red")
                  ? "bg-rose-500"
                  : "bg-emerald-500"
              }`}
            >
              {latestResult ? latestResult.number : "?"}
            </div>

            <div className="space-y-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-['Orbitron',sans-serif]">
                Settled Result
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-['Orbitron',sans-serif] ${
                    latestResult?.size === "Big"
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                  }`}
                >
                  {latestResult?.size} ({latestResult?.size === "Big" ? "5–9" : "0–4"})
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-['Orbitron',sans-serif] ${
                    latestResult?.color.includes("Red")
                      ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {latestResult?.color}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                Issue #{latestResult ? latestResult.roundId : "--"}
              </p>
            </div>
          </div>

          {/* Center: Next Settlement Countdown */}
          <div className="lg:col-span-5 space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 font-['Orbitron',sans-serif]">
                Next Round Settlement:
              </span>
              <span className="font-mono text-base font-black text-[#FF4625]">
                {countdown.secondsLeft < 10 ? `0${countdown.secondsLeft}` : countdown.secondsLeft}s
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#FF4625] to-amber-500 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${countdown.percentRemaining}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Mode: {selectedMode} draw cycle</span>
              <span>Auto-refresh active</span>
            </div>
          </div>

          {/* Right: Tactical Radar Suggestion */}
          <div className="lg:col-span-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 space-y-2 text-center lg:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-['Orbitron',sans-serif]">
              Tactical Signal
            </span>
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <span className="text-sm font-black font-['Orbitron',sans-serif] text-slate-900 dark:text-white">
                {latestResult?.size === "Big" ? "SMALL (REVERT)" : "BIG (CONTINUE)"}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono">
                86%
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigatePage("live")}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#FF4625] hover:underline cursor-pointer"
            >
              <span>Inspect Live Stream</span>
              <ArrowRight className="size-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Draw Results Table (Modeled directly after Reference Image 1 & 2!) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4">
        {/* Table Top Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Draw Results & Telemetry
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified ar-lottery01 issues ({selectedMode === "30s" ? "WinGo 30S" : "WinGo 1M"})
              </p>
            </div>

            {/* Cycle Selector Pills */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
              <button
                type="button"
                onClick={() => onSelectMode("30s")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer font-['Orbitron',sans-serif] ${
                  selectedMode === "30s"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                30S
              </button>
              <button
                type="button"
                onClick={() => onSelectMode("1m")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer font-['Orbitron',sans-serif] ${
                  selectedMode === "1m"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                1M
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search issue or number..."
                className="w-40 sm:w-52 pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden"
              />
            </div>

            {/* Size Filter Pills */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setSelectedSizeFilter("ALL");
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  selectedSizeFilter === "ALL"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedSizeFilter("Big");
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  selectedSizeFilter === "Big"
                    ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Big
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedSizeFilter("Small");
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  selectedSizeFilter === "Small"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Small
              </button>
            </div>

            {/* Sort Toggle */}
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Sort Order"
            >
              <SlidersHorizontal className="size-3" />
              <span className="hidden sm:inline">{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
              title="Export CSV Audit"
            >
              <Download className="size-3" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Clean Responsive Table (Like Reference Image 1 & 2) */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRowIds.size === paginatedResults.length && paginatedResults.length > 0}
                    onChange={handleToggleSelectAll}
                    className="rounded-sm border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="p-3.5">Issue Number</th>
                <th className="p-3.5">Settled Time</th>
                <th className="p-3.5 text-center">Number</th>
                <th className="p-3.5">Size</th>
                <th className="p-3.5">Color</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
              {paginatedResults.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    No lottery draw records match your current filters.
                  </td>
                </tr>
              ) : (
                paginatedResults.map((row) => {
                  const isSelected = selectedRowIds.has(row.roundId);
                  const isRed = row.color.toLowerCase().includes("red");
                  const isGreen = row.color.toLowerCase().includes("green");
                  const isViolet = row.color.toLowerCase().includes("violet");

                  return (
                    <tr
                      key={row.roundId}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? "bg-slate-50 dark:bg-slate-800/30" : ""
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(row.roundId)}
                          className="rounded-sm border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Issue Number */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 font-mono text-slate-900 dark:text-white font-semibold">
                          <span>{row.roundId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(row.roundId)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            title="Copy Issue Number"
                          >
                            {copiedRoundId === row.roundId ? (
                              <Check className="size-3 text-emerald-500" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Settled Time */}
                      <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">
                        {row.timeFormatted}
                      </td>

                      {/* Number Badge (Square badge with color) */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`size-7 rounded-lg inline-flex items-center justify-center font-['Orbitron',sans-serif] text-xs font-black text-white shadow-2xs ${
                            isRed && isViolet
                              ? "bg-linear-to-br from-rose-500 to-purple-600"
                              : isGreen && isViolet
                              ? "bg-linear-to-br from-emerald-500 to-purple-600"
                              : isRed
                              ? "bg-rose-500"
                              : "bg-emerald-500"
                          }`}
                        >
                          {row.number}
                        </span>
                      </td>

                      {/* Size Tag (Pastel pill tag) */}
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            row.size === "Big"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                          }`}
                        >
                          {row.size} ({row.size === "Big" ? "5-9" : "0-4"})
                        </span>
                      </td>

                      {/* Color Tag */}
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            isRed && isViolet
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20"
                              : isGreen && isViolet
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20"
                              : isRed
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {row.color}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold font-mono">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Confirmed
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleCopy(row.roundId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (Exact structure of Reference Image 1 & 2) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              {filteredResults.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              {Math.min(currentPage * pageSize, filteredResults.length)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              {filteredResults.length}
            </span>{" "}
            results
          </div>

          <div className="flex items-center gap-3">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5">
              <span>Per page</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Prev / Next Pagination Numbers */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="size-3.5" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`size-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950"
                        : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account & Storage Strip (Square Container) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
              <UserCheck className="size-5 text-[#FF4625]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {profile?.displayName || user?.displayName || "POPI Gamer"}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold font-mono">
                  {isAdmin ? "ADMIN" : `${planInfo.name.toUpperCase()} PLAN`}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {user?.email || "Connected via Firebase Authentication"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigatePage("uploads")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <UploadCloud className="size-3.5 text-emerald-500" />
              <span>Algorithm Vault</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage("api-keys")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <Key className="size-3.5 text-indigo-500" />
              <span>API Keys</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage("subscription")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF4625] hover:bg-[#E03A1B] text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
            >
              <CreditCard className="size-3.5" />
              <span>Manage Plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
