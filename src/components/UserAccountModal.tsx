"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  subscribeToGameNotes,
  addGameNote,
  deleteGameNote,
  type GameNote,
} from "../lib/firebase";
import {
  POPI_MOODS,
  MOOD_MAP,
  type PopiEmotion,
  playMoodChime,
} from "../data/popiMoods";
import { MoodSwitcherModal } from "./MoodSwitcherModal";
import {
  X,
  User,
  ShieldCheck,
  Gamepad2,
  Trash2,
  Plus,
  LogOut,
  Save,
  Check,
  Sparkles,
  Play,
  Pause,
  Shuffle,
  Clock,
  Copy,
  Fingerprint,
} from "lucide-react";

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmotion?: PopiEmotion;
  onSelectEmotion?: (emotion: PopiEmotion) => void;
  isAutoSwitch?: boolean;
  onToggleAutoSwitch?: () => void;
  autoInterval?: number;
  onChangeAutoInterval?: (sec: number) => void;
  autoMode?: "shuffle" | "sequential";
  onToggleAutoMode?: () => void;
}

export function UserAccountModal({
  isOpen,
  onClose,
  currentEmotion: externalEmotion,
  onSelectEmotion: externalSelectEmotion,
  isAutoSwitch: externalAutoSwitch = false,
  onToggleAutoSwitch: externalToggleAutoSwitch,
  autoInterval: externalAutoInterval = 3.5,
  onChangeAutoInterval: externalChangeAutoInterval,
  autoMode: externalAutoMode = "shuffle",
  onToggleAutoMode: externalToggleAutoMode,
}: UserAccountModalProps) {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [telegramHandle, setTelegramHandle] = useState("");
  const [preferredGames, setPreferredGames] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState<PopiEmotion>(
    externalEmotion || "idle",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  const handleCopyUid = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard && user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  // Auto-switch local fallback state if not externally controlled
  const [localAutoSwitch, setLocalAutoSwitch] = useState(externalAutoSwitch);
  const [localAutoInterval, setLocalAutoInterval] = useState(externalAutoInterval);
  const [localAutoMode, setLocalAutoMode] = useState<"shuffle" | "sequential">(externalAutoMode);

  // Vault modal state
  const [isVaultOpen, setIsVaultOpen] = useState(false);

  // Game notes state
  const [notes, setNotes] = useState<GameNote[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newGame, setNewGame] = useState("Free Fire");
  const [newContent, setNewContent] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    if (profile) {
      setTelegramHandle(profile.telegramHandle || "");
      setPreferredGames(profile.preferredGames || "Free Fire, BGMI");
      if (profile.selectedEmotion) {
        setSelectedEmotion(profile.selectedEmotion as PopiEmotion);
      }
    }
  }, [profile]);

  useEffect(() => {
    if (externalEmotion) {
      setSelectedEmotion(externalEmotion);
    }
  }, [externalEmotion]);

  useEffect(() => {
    setLocalAutoSwitch(externalAutoSwitch);
  }, [externalAutoSwitch]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToGameNotes(
      user.uid,
      (incomingNotes) => setNotes(incomingNotes),
      (err) => console.error("Notes sync error:", err),
    );
    return () => unsub();
  }, [user]);

  if (!isOpen || !user) return null;

  const handlePickMood = (emotion: PopiEmotion) => {
    setSelectedEmotion(emotion);
    const config = MOOD_MAP[emotion];
    if (config?.frequency) {
      playMoodChime(config.frequency);
    }

    if (externalSelectEmotion) {
      externalSelectEmotion(emotion);
    } else {
      updateProfile({ selectedEmotion: emotion }).catch((e) =>
        console.error("Failed to sync mood:", e),
      );
    }
  };

  const handleToggleAutoSwitch = () => {
    if (externalToggleAutoSwitch) {
      externalToggleAutoSwitch();
    } else {
      setLocalAutoSwitch((prev) => !prev);
    }
  };

  const handleToggleAutoMode = () => {
    if (externalToggleAutoMode) {
      externalToggleAutoMode();
    } else {
      setLocalAutoMode((prev) => (prev === "shuffle" ? "sequential" : "shuffle"));
    }
  };

  const handleChangeAutoInterval = (sec: number) => {
    if (externalChangeAutoInterval) {
      externalChangeAutoInterval(sec);
    } else {
      setLocalAutoInterval(sec);
    }
  };

  const currentAutoSwitch = externalToggleAutoSwitch ? externalAutoSwitch : localAutoSwitch;
  const currentAutoMode = externalToggleAutoMode ? externalAutoMode : localAutoMode;
  const currentAutoInterval = externalChangeAutoInterval ? externalAutoInterval : localAutoInterval;

  const currentMoodConfig = MOOD_MAP[selectedEmotion] || MOOD_MAP["idle"];

  const quickMoodOptions: { id: PopiEmotion; label: string; icon: string }[] = [
    { id: "idle", label: "Idle", icon: "👀" },
    { id: "happy", label: "Happy", icon: "😊" },
    { id: "rage", label: "Rage", icon: "🔥" },
    { id: "gg", label: "GG", icon: "🏆" },
    { id: "cyber", label: "Cyber", icon: "🤖" },
    { id: "laser", label: "Laser", icon: "🚨" },
    { id: "demon", label: "Demon", icon: "😈" },
    { id: "heart", label: "Heart", icon: "💖" },
    { id: "glitch", label: "Glitch", icon: "👾" },
    { id: "rainbow", label: "RGB", icon: "🌈" },
  ];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await updateProfile({
        telegramHandle: telegramHandle.trim(),
        preferredGames: preferredGames.trim(),
        selectedEmotion: selectedEmotion,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setIsAddingNote(true);
    try {
      await addGameNote(user.uid, newTitle.trim(), newGame.trim(), newContent.trim());
      setNewTitle("");
      setNewContent("");
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteGameNote(user.uid, noteId);
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="User Profile & POPI Companion Settings"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-8 text-left font-['Rajdhani',sans-serif]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                referrerPolicy="no-referrer"
                className="size-12 rounded-full border-2 border-orange-400 shadow-sm object-cover shrink-0"
              />
            ) : (
              <div className="size-12 rounded-full bg-orange-100 dark:bg-orange-950/40 text-[#FF4625] flex items-center justify-center font-bold text-lg shrink-0">
                <User className="size-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-['Orbitron',sans-serif] tracking-wide">
                  {user.displayName || "POPI Gamer"}
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <ShieldCheck className="size-3" />
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                  <Fingerprint className="size-3 text-[#FF4625]" />
                  <span className="text-[10px] text-slate-400 font-sans font-bold uppercase">UID:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white select-all">{user.uid}</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyUid}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Copy UID to clipboard"
                >
                  {copiedUid ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            id="close-profile-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Profile"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* POPI Companion Mood Customizer Section */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-['Orbitron',sans-serif] flex items-center gap-1.5">
                <span>POPI Companion Mood</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-[#FF4625] font-semibold">
                  38+ Moods
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Select your active POPI mood or launch the full 38+ emotion vault.
              </p>
            </div>

            {/* 38+ Mood Vault Trigger Button */}
            <button
              type="button"
              id="profile-open-vault-btn"
              onClick={() => setIsVaultOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black font-['Orbitron',sans-serif] tracking-wider shadow-sm cursor-pointer transition-transform hover:scale-105"
            >
              <Sparkles className="size-3 text-yellow-200" />
              <span>38+ MOOD VAULT</span>
            </button>
          </div>

          {/* Active Mood Display Card */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{currentMoodConfig.icon}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold font-['Orbitron',sans-serif] text-slate-900 dark:text-white uppercase tracking-wide">
                    {currentMoodConfig.label}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-orange-100 text-[#FF4625] font-semibold">
                    {currentMoodConfig.category}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 italic">
                  "{currentMoodConfig.quote}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pr-1">
              <span className={`size-3 rounded-full border ${currentMoodConfig.eyeBorder} ${currentMoodConfig.eyeBg}`} />
              <span className={`size-2.5 rounded-xs ${currentMoodConfig.pupilBg}`} />
            </div>
          </div>

          {/* Quick Mood Chips for Instant 1-Click Switching */}
          <div>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1.5 font-['Orbitron',sans-serif] uppercase tracking-wider">
              Quick Switch:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickMoodOptions.map((mood) => {
                const isSelected = selectedEmotion === mood.id;
                return (
                  <button
                    key={mood.id}
                    type="button"
                    id={`profile-quick-mood-${mood.id}`}
                    onClick={() => handlePickMood(mood.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#FF4625] text-white shadow-xs font-bold scale-105"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <span>{mood.icon}</span>
                    <span>{mood.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auto-Switch Controls inside Profile */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="profile-toggle-auto-switch-btn"
                onClick={handleToggleAutoSwitch}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-['Orbitron',sans-serif] tracking-wider transition-all cursor-pointer ${
                  currentAutoSwitch
                    ? "bg-[#FF4625] text-white shadow-xs"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
              >
                {currentAutoSwitch ? (
                  <Pause className="size-3 text-white" />
                ) : (
                  <Play className="size-3 text-emerald-600" />
                )}
                <span>AUTO-CHANGE: {currentAutoSwitch ? "ON" : "OFF"}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleAutoMode}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100"
                title="Toggle Random Shuffle vs Sequential"
              >
                <Shuffle className="size-3 text-cyan-600" />
                <span className="text-[11px] capitalize">{currentAutoMode}</span>
              </button>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Clock className="size-3 text-amber-500" />
              <span>Speed:</span>
              {[2.5, 3.5, 7].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => handleChangeAutoInterval(sec)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    currentAutoInterval === sec
                      ? "bg-amber-400 text-slate-950 font-black"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Settings Form */}
        <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-['Orbitron',sans-serif]">
            Gaming Profile & Telegram Access
          </h4>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Telegram Username / Handle
            </label>
            <div className="relative">
              <input
                type="text"
                value={telegramHandle}
                onChange={(e) => setTelegramHandle(e.target.value)}
                placeholder="@your_telegram_handle"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4625]/40 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Required for connecting with the official POPI channel & access.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Preferred Games
            </label>
            <input
              type="text"
              value={preferredGames}
              onChange={(e) => setPreferredGames(e.target.value)}
              placeholder="e.g. Free Fire, BGMI, PUBG Mobile"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4625]/40"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold bg-[#FF4625] text-white hover:bg-orange-600 transition-colors shadow-md disabled:opacity-50 cursor-pointer font-['Orbitron',sans-serif]"
            >
              {savedSuccess ? (
                <>
                  <Check className="size-3.5" /> Saved to Firestore!
                </>
              ) : (
                <>
                  <Save className="size-3.5" /> Save Preferences
                </>
              )}
            </button>

            <button
              type="button"
              onClick={async () => {
                await signOut();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 py-1 px-3 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <LogOut className="size-3.5" />
              Sign Out
            </button>
          </div>
        </form>

        {/* Saved Game Strategies / Notes (Persistent in Firestore) */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gamepad2 className="size-4 text-[#FF4625]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-['Orbitron',sans-serif]">
                Your Cloud Gaming Strategies ({notes.length})
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 font-semibold">
              Synced with Firestore
            </span>
          </div>

          {/* Add Strategy Form */}
          <form onSubmit={handleAddNote} className="space-y-2 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Strategy title (e.g. Factory Roof Drop)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF4625]"
              />
              <input
                type="text"
                placeholder="Game (Free Fire, BGMI...)"
                value={newGame}
                onChange={(e) => setNewGame(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF4625]"
              />
            </div>
            <textarea
              placeholder="Enter strategy notes, recoil settings, sensitivity, or POPI callout cues..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF4625]"
            />
            <button
              type="submit"
              disabled={isAddingNote || !newTitle.trim() || !newContent.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Plus className="size-3.5" />
              Add Strategy Note
            </button>
          </form>

          {/* Notes list */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {notes.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No saved gaming notes yet. Add your first strategy above!
              </p>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {note.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-100 text-[#FF4625] dark:bg-orange-950/60 dark:text-orange-400 font-semibold">
                        {note.game}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors cursor-pointer"
                    title="Delete note"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 38+ Mood Switcher Modal launched from Profile */}
      <MoodSwitcherModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        currentMood={selectedEmotion}
        onSelectMood={(mood) => handlePickMood(mood)}
        isAutoSwitch={currentAutoSwitch}
        onToggleAutoSwitch={handleToggleAutoSwitch}
        autoInterval={currentAutoInterval}
        onChangeAutoInterval={handleChangeAutoInterval}
        autoMode={currentAutoMode}
        onToggleAutoMode={handleToggleAutoMode}
      />
    </div>
  );
}
