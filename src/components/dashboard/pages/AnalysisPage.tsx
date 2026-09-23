"use client";

import React, { useState, useMemo } from "react";
import {
  GameMode,
  HistoricalResult,
  calculateStatistics,
} from "../../../services/resultsService";
import {
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Layers,
  Flame,
  Info,
  Calendar,
  Activity,
  ArrowRight,
} from "lucide-react";

interface AnalysisPageProps {
  selectedMode: GameMode;
  results: HistoricalResult[];
}

export function AnalysisPage({ selectedMode, results }: AnalysisPageProps) {
  const [rollingWindow, setRollingWindow] = useState<10 | 25 | 50 | 100>(50);

  // Slice results according to rolling window
  const windowResults = useMemo(() => {
    return results.slice(0, rollingWindow);
  }, [results, rollingWindow]);

  const stats = useMemo(() => {
    return calculateStatistics(windowResults);
  }, [windowResults]);

  const maxFrequency = Math.max(
    ...Object.values(stats.numberFrequencies),
    1,
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Important Statistical Disclaimer Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-amber-950 dark:text-amber-200">
        <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm">
          <div className="font-bold font-['Orbitron',sans-serif] uppercase tracking-wide">
            Important Statistical Disclaimer
          </div>
          <p className="leading-relaxed opacity-90">
            Historical patterns describe previous results and do not guarantee future results. Independent random draws cannot be reliably predicted from previous outcomes.
          </p>
        </div>
      </div>

      {/* Rolling Window Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
        <div>
          <h2 className="font-['Orbitron',sans-serif] text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Analytical Sample Window ({selectedMode} Mode)
          </h2>
          <p className="text-xs text-slate-500">
            Select the sample size of recent rounds to evaluate frequency distributions.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          {[10, 25, 50, 100].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setRollingWindow(size as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-['Orbitron',sans-serif] ${
                rollingWindow === size
                  ? "bg-white dark:bg-slate-900 text-[#FF4625] shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Last {size}
            </button>
          ))}
        </div>
      </div>

      {/* Section 1: Recent Distribution Overview */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-[#FF4625]" />
            <h3 className="font-['Orbitron',sans-serif] text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Category Distribution (Sample: {stats.totalRecords} Rounds)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Window: Last {rollingWindow}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Big */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 font-['Orbitron',sans-serif]">
              Big (5–9)
            </span>
            <div className="text-2xl font-black text-amber-500 font-['Orbitron',sans-serif]">
              {stats.bigCount}
            </div>
            <div className="text-xs text-slate-500 font-mono">
              {(
                (stats.bigCount / (stats.totalRecords || 1)) *
                100
              ).toFixed(1)}
              % of sample
            </div>
          </div>

          {/* Small */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 font-['Orbitron',sans-serif]">
              Small (0–4)
            </span>
            <div className="text-2xl font-black text-indigo-500 font-['Orbitron',sans-serif]">
              {stats.smallCount}
            </div>
            <div className="text-xs text-slate-500 font-mono">
              {(
                (stats.smallCount / (stats.totalRecords || 1)) *
                100
              ).toFixed(1)}
              % of sample
            </div>
          </div>

          {/* Red */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 font-['Orbitron',sans-serif]">
              Red Parity
            </span>
            <div className="text-2xl font-black text-rose-500 font-['Orbitron',sans-serif]">
              {stats.redCount}
            </div>
            <div className="text-xs text-slate-500 font-mono">
              {(
                (stats.redCount / (stats.totalRecords || 1)) *
                100
              ).toFixed(1)}
              % of sample
            </div>
          </div>

          {/* Green */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 font-['Orbitron',sans-serif]">
              Green Parity
            </span>
            <div className="text-2xl font-black text-emerald-500 font-['Orbitron',sans-serif]">
              {stats.greenCount}
            </div>
            <div className="text-xs text-slate-500 font-mono">
              {(
                (stats.greenCount / (stats.totalRecords || 1)) *
                100
              ).toFixed(1)}
              % of sample
            </div>
          </div>
        </div>

        {/* Visual Dual Distribution Bars */}
        <div className="space-y-4 pt-2">
          {/* Big vs Small Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-amber-500">
                Big ({stats.bigCount} /{" "}
                {(
                  (stats.bigCount / (stats.totalRecords || 1)) *
                  100
                ).toFixed(0)}
                %)
              </span>
              <span className="text-indigo-500">
                Small ({stats.smallCount} /{" "}
                {(
                  (stats.smallCount / (stats.totalRecords || 1)) *
                  100
                ).toFixed(0)}
                %)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-indigo-500 overflow-hidden flex">
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{
                  width: `${
                    (stats.bigCount / (stats.totalRecords || 1)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Red vs Green Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-rose-500">
                Red ({stats.redCount} /{" "}
                {(
                  (stats.redCount / (stats.totalRecords || 1)) *
                  100
                ).toFixed(0)}
                %)
              </span>
              <span className="text-emerald-500">
                Green ({stats.greenCount} /{" "}
                {(
                  (stats.greenCount / (stats.totalRecords || 1)) *
                  100
                ).toFixed(0)}
                %)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-emerald-500 overflow-hidden flex">
              <div
                className="h-full bg-rose-500 transition-all duration-500"
                style={{
                  width: `${
                    (stats.redCount / (stats.totalRecords || 1)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Number Frequency Bar Chart (0–9) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-[#FF4625]" />
            <h3 className="font-['Orbitron',sans-serif] text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Number Frequency Distribution (0 to 9)
            </h3>
          </div>
          <div className="text-xs text-slate-400">
            Max count:{" "}
            <strong className="text-slate-700 dark:text-slate-200">
              {maxFrequency}
            </strong>
          </div>
        </div>

        {/* Clean Responsive Bar Chart */}
        <div className="grid grid-cols-10 gap-2 sm:gap-4 items-end pt-8 pb-4 h-56 sm:h-64 border-b border-slate-100 dark:border-slate-800">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const count = stats.numberFrequencies[num] || 0;
            const heightPercent = Math.max((count / maxFrequency) * 100, 8);
            const isRed = num % 2 === 0 || num === 0;

            return (
              <div
                key={num}
                className="flex flex-col items-center h-full justify-end group"
              >
                {/* Count tooltip above bar */}
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 group-hover:text-[#FF4625] transition-colors">
                  {count}
                </span>

                {/* Animated Vertical Bar */}
                <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden flex items-end h-full">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      num === stats.mostFrequentNumber
                        ? "bg-[#FF4625]"
                        : isRed
                        ? "bg-rose-500/80 group-hover:bg-rose-500"
                        : "bg-emerald-500/80 group-hover:bg-emerald-500"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                {/* Number Label */}
                <span className="mt-2 text-xs sm:text-sm font-black text-slate-900 dark:text-white font-['Orbitron',sans-serif]">
                  {num}
                </span>
                <span className="text-[9px] text-slate-400">
                  {num >= 5 ? "B" : "S"}
                </span>
              </div>
            );
          })}
        </div>

        {/* High/Low Outliers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500">Most Frequent Number:</span>
            <div className="flex items-center gap-2">
              <span className="size-6 rounded bg-[#FF4625] text-white flex items-center justify-center font-bold font-['Orbitron',sans-serif]">
                {stats.mostFrequentNumber}
              </span>
              <span className="text-slate-400">
                ({stats.numberFrequencies[stats.mostFrequentNumber]} draws)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500">Least Frequent Number:</span>
            <div className="flex items-center gap-2">
              <span className="size-6 rounded bg-slate-800 text-white flex items-center justify-center font-bold font-['Orbitron',sans-serif]">
                {stats.leastFrequentNumber}
              </span>
              <span className="text-slate-400">
                ({stats.numberFrequencies[stats.leastFrequentNumber]} draws)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Recent Sequence Visualization */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-[#FF4625]" />
            <h3 className="font-['Orbitron',sans-serif] text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Recent Sequence Flow (Newest &rarr; Older)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Visual Pattern Map</span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Historical sequence flow showing consecutive settlement outcomes.
        </p>

        {/* Visual sequence bubbles */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {stats.recentSequence.map((item, idx) => (
            <React.Fragment key={idx}>
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold font-['Orbitron',sans-serif] ${
                  item.size === "Big"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
                    : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    item.color.includes("Red") ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                />
                <span>{item.size.toUpperCase()}</span>
                <span className="text-[10px] opacity-75 font-mono">
                  ({item.number})
                </span>
              </div>
              {idx < stats.recentSequence.length - 1 && (
                <ArrowRight className="size-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Section 4: Streak Analysis */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="size-4 text-[#FF4625]" />
            <h3 className="font-['Orbitron',sans-serif] text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Historical Streak Analysis
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Within active {rollingWindow} window
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Current Big Streak */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 font-['Orbitron',sans-serif]">
              Current Big Streak
            </span>
            <div className="text-2xl font-black text-amber-500 font-['Orbitron',sans-serif]">
              {stats.currentBigStreak} In A Row
            </div>
            <p className="text-[10px] text-slate-400">Active run</p>
          </div>

          {/* Current Small Streak */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 font-['Orbitron',sans-serif]">
              Current Small Streak
            </span>
            <div className="text-2xl font-black text-indigo-500 font-['Orbitron',sans-serif]">
              {stats.currentSmallStreak} In A Row
            </div>
            <p className="text-[10px] text-slate-400">Active run</p>
          </div>

          {/* Longest Streaks in Sample */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 font-['Orbitron',sans-serif]">
              Longest Streaks in Sample
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white font-['Orbitron',sans-serif] pt-1">
              Big:{" "}
              <span className="text-amber-500">
                {stats.longestBigStreak}
              </span>{" "}
              &bull; Small:{" "}
              <span className="text-indigo-500">
                {stats.longestSmallStreak}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Peak consecutive occurrences</p>
          </div>

          {/* Current Color Streak */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 font-['Orbitron',sans-serif]">
              Current Color Streak
            </span>
            <div className="text-2xl font-black text-rose-500 font-['Orbitron',sans-serif]">
              {stats.currentColorStreak.count}x {stats.currentColorStreak.color}
            </div>
            <p className="text-[10px] text-slate-400">Active color run</p>
          </div>

          {/* Longest Color Streak */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1 sm:col-span-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 font-['Orbitron',sans-serif]">
              Longest Color Streak in Sample
            </span>
            <div className="text-2xl font-black text-emerald-500 font-['Orbitron',sans-serif]">
              {stats.longestColorStreak.count}x {stats.longestColorStreak.color}
            </div>
            <p className="text-[10px] text-slate-400">
              Maximum consecutive color uniformity recorded in the active sample window.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalysisPage;
