"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  Sparkles,
  Lock,
  Unlock,
  Shuffle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
  Zap,
} from "lucide-react";
import {
  POPI_MOODS,
  type PopiEmotion,
  type MoodCategory,
  playMoodChime,
} from "../data/popiMoods";
import { MetalButton } from "@/components/ui/metal-button";

interface MoodSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMood: PopiEmotion;
  onSelectMood: (mood: PopiEmotion) => void;
  isAutoSwitch: boolean;
  onToggleAutoSwitch: () => void;
  autoInterval: number; // in seconds
  onChangeAutoInterval: (interval: number) => void;
  autoMode: "shuffle" | "sequential";
  onToggleAutoMode: () => void;
}

export function MoodSwitcherModal({
  isOpen,
  onClose,
  currentMood,
  onSelectMood,
  isAutoSwitch,
  onToggleAutoSwitch,
  autoInterval,
  onChangeAutoInterval,
  autoMode,
  onToggleAutoMode,
}: MoodSwitcherModalProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [secretsUnlocked, setSecretsUnlocked] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const categories: { label: string; value: string; count: number }[] = useMemo(() => {
    const coreCount = POPI_MOODS.filter((m) => m.category === "Core").length;
    const gamingCount = POPI_MOODS.filter((m) => m.category === "Gaming").length;
    const cyberCount = POPI_MOODS.filter((m) => m.category === "Cyber").length;
    const secretCount = POPI_MOODS.filter((m) => m.isSecret).length;

    return [
      { label: "All Moods", value: "All", count: POPI_MOODS.length },
      { label: "Core", value: "Core", count: coreCount },
      { label: "Gaming", value: "Gaming", count: gamingCount },
      { label: "Cyber & Tech", value: "Cyber", count: cyberCount },
      { label: "🔒 Secret Vault", value: "Secret", count: secretCount },
    ];
  }, []);

  const filteredMoods = useMemo(() => {
    return POPI_MOODS.filter((mood) => {
      const matchCat =
        selectedCategory === "All"
          ? true
          : selectedCategory === "Secret"
          ? mood.isSecret
          : mood.category === selectedCategory;

      const matchSearch =
        mood.label.toLowerCase().includes(search.toLowerCase()) ||
        mood.quote.toLowerCase().includes(search.toLowerCase()) ||
        mood.id.toLowerCase().includes(search.toLowerCase());

      return matchCat && matchSearch;
    });
  }, [selectedCategory, search]);

  if (!isOpen) return null;

  const handlePickMood = (mood: typeof POPI_MOODS[0]) => {
    if (soundEnabled && mood.frequency) {
      playMoodChime(mood.frequency);
    }
    onSelectMood(mood.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="POPI 30+ Mood Switcher & Auto-Cycle Engine"
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden font-['Rajdhani',sans-serif]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gradient-to-tr from-[#FF4625] to-amber-400 text-white flex items-center justify-center shadow-md shadow-orange-500/20 text-xl shrink-0">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-['Orbitron',sans-serif] tracking-wide">
                  MOOD VAULT & ENGINE
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-orange-100 text-[#FF4625] dark:bg-orange-950/60 dark:text-orange-400 font-['Orbitron',sans-serif]">
                  38+ Moods
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                Select from 38+ interactive emotions or activate the Auto-Switcher loop.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-mood-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Auto-Switch Engine Control Bar */}
        <div className="px-5 sm:px-7 py-3 bg-slate-50 dark:bg-slate-900/90 text-slate-800 dark:text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="modal-toggle-auto-switch-btn"
              onClick={onToggleAutoSwitch}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer font-['Orbitron',sans-serif] ${
                isAutoSwitch
                  ? "bg-[#FF4625] text-white shadow-md shadow-orange-500/30"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-300 dark:border-slate-700"
              }`}
            >
              {isAutoSwitch ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              <span>AUTO-CHANGE: {isAutoSwitch ? "ON" : "OFF"}</span>
            </button>

            <button
              type="button"
              id="modal-toggle-auto-mode-btn"
              onClick={onToggleAutoMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-semibold tracking-wide border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
              title="Toggle Random Shuffle vs Sequential Mood Cycle"
            >
              <Shuffle className="size-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>{autoMode === "shuffle" ? "Random Shuffle" : "Sequential"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Speed Picker */}
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="size-3.5 text-amber-500" />
              <span className="hidden min-[480px]:inline">Interval:</span>
              {[2.5, 4, 7, 10].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => onChangeAutoInterval(sec)}
                  className={`px-2 py-0.5 rounded-md text-xs font-bold font-['Orbitron',sans-serif] transition-colors cursor-pointer ${
                    autoInterval === sec
                      ? "bg-amber-400 text-slate-950 shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title={soundEnabled ? "Mute synth chime" : "Enable synth chime"}
            >
              {soundEnabled ? <Volume2 className="size-4 text-emerald-600" /> : <VolumeX className="size-4 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Search and Category Filters */}
        <div className="px-5 sm:px-7 pt-4 pb-2 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold font-['Orbitron',sans-serif] whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.value
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search 38+ moods..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 font-['Rajdhani',sans-serif]"
            />
          </div>
        </div>

        {/* Moods Grid Scroll Container */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
          {filteredMoods.map((mood) => {
            const isSelected = currentMood === mood.id;

            return (
              <button
                key={mood.id}
                type="button"
                id={`modal-mood-card-${mood.id}`}
                onClick={() => handlePickMood(mood)}
                className={`relative group flex flex-col items-start p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "border-[#FF4625] bg-orange-50/70 dark:bg-orange-950/30 ring-2 ring-[#FF4625]/40 shadow-md"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-sm"
                }`}
              >
                {/* Top Badge: Category or Secret */}
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    {mood.icon}
                  </span>
                  {mood.isSecret && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-['Orbitron',sans-serif]">
                      <Sparkles className="size-2.5" /> Secret
                    </span>
                  )}
                  {isSelected && (
                    <span className="size-2 rounded-full bg-[#FF4625] animate-ping" />
                  )}
                </div>

                {/* Mood Label */}
                <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-['Orbitron',sans-serif] tracking-wide truncate w-full">
                  {mood.label}
                </div>

                {/* Mood Quote */}
                <div className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-tight">
                  "{mood.quote}"
                </div>

                {/* Visual Eye Preview Dot */}
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 w-full flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{mood.category}</span>
                  <div className="flex items-center gap-1">
                    <span className={`size-2.5 rounded-full border ${mood.eyeBorder} ${mood.eyeBg}`} />
                    <span className={`size-2 rounded-xs ${mood.pupilBg}`} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-7 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Zap className="size-3.5 text-amber-500" />
            <span>Click any mood to instantly test POPI's eyes & voice quote</span>
          </div>

          <MetalButton
            preset="silver"
            size="sm"
            onClick={onClose}
            className="font-bold text-xs px-4"
          >
            Done
          </MetalButton>
        </div>
      </div>
    </div>
  );
}
