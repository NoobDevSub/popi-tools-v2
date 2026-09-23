"use client";

import React, { useState, useMemo } from "react";
import {
  GameMode,
  HistoricalResult,
  ConnectionStatus,
  getNextRoundCountdown,
} from "../../../services/resultsService";
import {
  Radio,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  CheckCircle2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

interface LiveResultsPageProps {
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  results: HistoricalResult[];
  connectionStatus: ConnectionStatus;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function LiveResultsPage({
  selectedMode,
  onSelectMode,
  results,
  connectionStatus,
  isRefreshing,
  onRefresh,
}: LiveResultsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState<"All" | "Big" | "Small">("All");
  const [colorFilter, setColorFilter] = useState<"All" | "Red" | "Green" | "Violet">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const itemsPerPage = 15;
  const currentResult = results[0];
  const countdown = getNextRoundCountdown(selectedMode);

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      // Search by roundId
      if (searchQuery.trim() && !r.roundId.includes(searchQuery.trim())) {
        return false;
      }
      // Size filter
      if (sizeFilter !== "All" && r.size !== sizeFilter) {
        return false;
      }
      // Color filter
      if (colorFilter !== "All" && !r.color.includes(colorFilter)) {
        return false;
      }
      return true;
    });
  }, [results, searchQuery, sizeFilter, colorFilter]);

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage) || 1;
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleCopyRound = (roundId: string) => {
    navigator.clipboard.writeText(roundId);
    setCopiedId(roundId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Mode Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Radio className="size-4 text-[#FF4625]" />
            <h2 className="font-['Orbitron',sans-serif] text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Draw Frequency Mode
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              LIVE AR-LOTTERY FEED
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time synchronization with {selectedMode === "30s" ? "WinGo 30S" : "WinGo 1M"} API.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              onSelectMode("30s");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer font-['Orbitron',sans-serif] ${
              selectedMode === "30s"
                ? "bg-white dark:bg-slate-900 text-[#FF4625] shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            30 Seconds Mode
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectMode("1m");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer font-['Orbitron',sans-serif] ${
              selectedMode === "1m"
                ? "bg-white dark:bg-slate-900 text-[#FF4625] shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            1 Minute Mode
          </button>
        </div>
      </div>

      {/* Main Card: Current Result */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-['Orbitron',sans-serif] font-black text-sm shadow-sm">
              {selectedMode}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Orbitron',sans-serif] text-base sm:text-xl font-bold text-slate-900 dark:text-white">
                  Current Result Spotlight
                </h3>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    connectionStatus === "CONNECTED"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {connectionStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Round ID: {currentResult?.roundId || "--"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Next Draw in:{" "}
              <strong className="text-[#FF4625] font-mono">
                {countdown.secondsLeft}s
              </strong>
            </span>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer disabled:opacity-50"
              title="Refresh result"
            >
              <RefreshCw
                className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Big Spotlight Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Number Circle */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-['Orbitron',sans-serif]">
              Settled Number
            </span>
            <div
              className={`size-24 rounded-2xl flex items-center justify-center font-['Orbitron',sans-serif] text-5xl font-black text-white shadow-md ${
                currentResult?.color.includes("Red") &&
                currentResult?.color.includes("Violet")
                  ? "bg-gradient-to-br from-rose-500 to-purple-600"
                  : currentResult?.color.includes("Green") &&
                    currentResult?.color.includes("Violet")
                  ? "bg-gradient-to-br from-emerald-500 to-purple-600"
                  : currentResult?.color.includes("Red")
                  ? "bg-rose-500"
                  : "bg-emerald-500"
              }`}
            >
              {currentResult ? currentResult.number : "?"}
            </div>
            <span className="text-xs font-mono text-slate-500">
              Parity: {currentResult?.color}
            </span>
          </div>

          {/* Size Classification */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-['Orbitron',sans-serif]">
              Size Classification
            </span>
            <div
              className={`px-6 py-3 rounded-2xl font-['Orbitron',sans-serif] text-2xl font-black ${
                currentResult?.size === "Big"
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                  : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
              }`}
            >
              {currentResult?.size || "--"}
            </div>
            <span className="text-xs text-slate-500">
              {currentResult?.size === "Big" ? "Numbers 5 to 9" : "Numbers 0 to 4"}
            </span>
          </div>

          {/* Timestamp & Source */}
          <div className="flex flex-col justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
              <span className="text-slate-400 font-medium">Draw Timestamp:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {currentResult?.timeFormatted || "--"}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
              <span className="text-slate-400 font-medium">Data Pipeline:</span>
              <span className="font-bold text-emerald-500">
                Verified Engine
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Last Settled:</span>
              <span className="font-mono text-slate-500">
                {currentResult ? "Just now" : "--"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent History Table & Mobile Cards */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-['Orbitron',sans-serif] text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Recent Historical Draw Records
            </h3>
            <p className="text-xs text-slate-500">
              Auditable list of past settled outcomes for {selectedMode} mode.
            </p>
          </div>

          {/* Filters and Search Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Round */}
            <div className="relative w-full sm:w-48">
              <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search Round ID..."
                className="w-full h-8 pl-8 pr-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#FF4625]"
              />
            </div>

            {/* Size Filter */}
            <select
              value={sizeFilter}
              onChange={(e) => {
                setSizeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="h-8 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All">All Sizes</option>
              <option value="Big">Big (5–9)</option>
              <option value="Small">Small (0–4)</option>
            </select>

            {/* Color Filter */}
            <select
              value={colorFilter}
              onChange={(e) => {
                setColorFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="h-8 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All">All Colors</option>
              <option value="Red">Red</option>
              <option value="Green">Green</option>
              <option value="Violet">Violet</option>
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs font-['Rajdhani',sans-serif]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 font-['Orbitron',sans-serif]">
                <th className="pb-3 px-3">Round ID</th>
                <th className="pb-3 px-3">Number</th>
                <th className="pb-3 px-3">Size</th>
                <th className="pb-3 px-3">Color</th>
                <th className="pb-3 px-3">Time</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginatedResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No results match your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedResults.map((r) => (
                  <tr
                    key={r.roundId}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {r.roundId}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`size-7 rounded-lg inline-flex items-center justify-center font-bold font-['Orbitron',sans-serif] text-white shadow-2xs ${
                          r.color.includes("Red")
                            ? "bg-rose-500"
                            : "bg-emerald-500"
                        }`}
                      >
                        {r.number}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-['Orbitron',sans-serif] ${
                          r.size === "Big"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                            : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                        }`}
                      >
                        {r.size}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                      {r.color}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {r.timeFormatted}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleCopyRound(r.roundId)}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                        title="Copy Round ID"
                      >
                        {copiedId === r.roundId ? (
                          <span className="text-emerald-500 font-bold">
                            Copied
                          </span>
                        ) : (
                          <>
                            <Copy className="size-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Compact Cards View */}
        <div className="md:hidden space-y-2.5">
          {paginatedResults.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No results match your filter criteria.
            </div>
          ) : (
            paginatedResults.map((r) => (
              <div
                key={r.roundId}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`size-9 rounded-xl flex items-center justify-center font-black font-['Orbitron',sans-serif] text-sm text-white ${
                      r.color.includes("Red") ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                  >
                    {r.number}
                  </span>
                  <div>
                    <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {r.roundId}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {r.timeFormatted} &bull; {r.color}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-['Orbitron',sans-serif] ${
                      r.size === "Big"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                    }`}
                  >
                    {r.size}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyRound(r.roundId)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredResults.length)} of{" "}
            {filteredResults.length} records
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
              title="Previous page"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="font-bold px-2 font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
              title="Next page"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveResultsPage;
