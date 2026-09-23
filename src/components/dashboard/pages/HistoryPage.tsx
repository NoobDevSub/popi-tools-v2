"use client";

import React, { useState, useMemo } from "react";
import {
  GameMode,
  HistoricalResult,
  calculateStatistics,
} from "../../../services/resultsService";
import {
  History,
  Search,
  Filter,
  Download,
  Copy,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Calendar,
} from "lucide-react";

interface HistoryPageProps {
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  results: HistoricalResult[];
}

export function HistoryPage({
  selectedMode,
  onSelectMode,
  results,
}: HistoryPageProps) {
  const [roundSearch, setRoundSearch] = useState("");
  const [numberFilter, setNumberFilter] = useState<string>("All");
  const [sizeFilter, setSizeFilter] = useState<"All" | "Big" | "Small">("All");
  const [colorFilter, setColorFilter] = useState<"All" | "Red" | "Green" | "Violet">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const itemsPerPage = 20;

  // Filtered dataset
  const filtered = useMemo(() => {
    return results.filter((r) => {
      if (roundSearch.trim() && !r.roundId.includes(roundSearch.trim())) {
        return false;
      }
      if (numberFilter !== "All" && r.number !== Number(numberFilter)) {
        return false;
      }
      if (sizeFilter !== "All" && r.size !== sizeFilter) {
        return false;
      }
      if (colorFilter !== "All" && !r.color.includes(colorFilter)) {
        return false;
      }
      return true;
    });
  }, [results, roundSearch, numberFilter, sizeFilter, colorFilter]);

  const stats = useMemo(() => {
    return calculateStatistics(filtered);
  }, [filtered]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleCopySingle = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCopyAllCSV = () => {
    const headers = "RoundID,Number,Size,Color,Time,Mode\n";
    const rows = filtered
      .map(
        (r) =>
          `${r.roundId},${r.number},${r.size},"${r.color}",${r.timeFormatted},${r.mode}`,
      )
      .join("\n");
    navigator.clipboard.writeText(headers + rows);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Statistics Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-[#FF4625]" />
            <h2 className="font-['Orbitron',sans-serif] text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Historical Aggregate Summary ({filtered.length} Filtered Records)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Active Mode: {selectedMode}
          </span>
        </div>

        {/* 7 KPI Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              Total Records
            </span>
            <div className="text-base font-bold font-['Orbitron',sans-serif] text-slate-900 dark:text-white mt-0.5">
              {stats.totalRecords}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              Big (5–9)
            </span>
            <div className="text-base font-bold font-['Orbitron',sans-serif] text-amber-500 mt-0.5">
              {stats.bigCount}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              Small (0–4)
            </span>
            <div className="text-base font-bold font-['Orbitron',sans-serif] text-indigo-500 mt-0.5">
              {stats.smallCount}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              Red Draws
            </span>
            <div className="text-base font-bold font-['Orbitron',sans-serif] text-rose-500 mt-0.5">
              {stats.redCount}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              Green Draws
            </span>
            <div className="text-base font-bold font-['Orbitron',sans-serif] text-emerald-500 mt-0.5">
              {stats.greenCount}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              Most Frequent
            </span>
            <div className="text-base font-bold font-['Orbitron',sans-serif] text-[#FF4625] mt-0.5">
              #{stats.mostFrequentNumber}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              Least Frequent
            </span>
            <div className="text-base font-bold font-['Orbitron',sans-serif] text-slate-500 mt-0.5">
              #{stats.leastFrequentNumber}
            </div>
          </div>
        </div>
      </div>

      {/* Full Filter Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                onSelectMode("30s");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-['Orbitron',sans-serif] ${
                selectedMode === "30s"
                  ? "bg-white dark:bg-slate-900 text-[#FF4625] shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              30s Mode
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectMode("1m");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-['Orbitron',sans-serif] ${
                selectedMode === "1m"
                  ? "bg-white dark:bg-slate-900 text-[#FF4625] shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              1m Mode
            </button>
          </div>

          {/* Copy CSV / Export */}
          <button
            type="button"
            onClick={handleCopyAllCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Copy className="size-3.5" />
            <span>{copiedAll ? "CSV Copied to Clipboard!" : "Copy as CSV"}</span>
          </button>
        </div>

        {/* Granular Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Search Round */}
          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={roundSearch}
              onChange={(e) => {
                setRoundSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter by Round ID..."
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#FF4625]"
            />
          </div>

          {/* Number Filter */}
          <select
            value={numberFilter}
            onChange={(e) => {
              setNumberFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
          >
            <option value="All">All Numbers (0–9)</option>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <option key={n} value={String(n)}>
                Number {n}
              </option>
            ))}
          </select>

          {/* Size Filter */}
          <select
            value={sizeFilter}
            onChange={(e) => {
              setSizeFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
          >
            <option value="All">All Sizes</option>
            <option value="Big">Big Only (5–9)</option>
            <option value="Small">Small Only (0–4)</option>
          </select>

          {/* Color Filter */}
          <select
            value={colorFilter}
            onChange={(e) => {
              setColorFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
          >
            <option value="All">All Colors</option>
            <option value="Red">Red Only</option>
            <option value="Green">Green Only</option>
            <option value="Violet">Violet Only</option>
          </select>
        </div>
      </div>

      {/* Main Full History Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-['Rajdhani',sans-serif]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 font-['Orbitron',sans-serif]">
                <th className="pb-3 px-3">Round ID</th>
                <th className="pb-3 px-3">Number</th>
                <th className="pb-3 px-3">Size Classification</th>
                <th className="pb-3 px-3">Color Parity</th>
                <th className="pb-3 px-3">Settlement Timestamp</th>
                <th className="pb-3 px-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No historical records match your filter criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((r) => (
                  <tr
                    key={r.roundId}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {r.roundId}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`size-7 rounded-lg inline-flex items-center justify-center font-black font-['Orbitron',sans-serif] text-white shadow-xs ${
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
                        onClick={() => handleCopySingle(r.roundId)}
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
                            <span>Copy ID</span>
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

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filtered.length)} of{" "}
            {filtered.length} total entries
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="font-bold px-2 font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;
