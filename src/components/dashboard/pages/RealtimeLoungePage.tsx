"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  subscribeToRealtimeChat,
  sendRealtimeChatMessage,
  deleteRealtimeChatMessage,
  subscribeToActivePresence,
  sendPresenceHeartbeat,
  subscribeToRealtimeRound,
  broadcastRealtimeRound,
  RealtimeChatMessage,
  RealtimeRound,
  RealtimePresence,
  checkIsAdmin,
} from "../../../lib/firebase";
import {
  Radio,
  Send,
  Trash2,
  Users,
  Wifi,
  Sparkles,
  Zap,
  Activity,
  Flame,
  ShieldCheck,
  TrendingUp,
  Clock,
  RotateCcw,
} from "lucide-react";

interface RealtimeLoungePageProps {
  userId: string;
  userName: string;
  userEmail?: string;
  userPhoto?: string;
  plan?: string;
  isAdmin?: boolean;
}

export function RealtimeLoungePage({
  userId,
  userName,
  userEmail = "",
  userPhoto = "",
  plan = "PREMIUM",
  isAdmin = false,
}: RealtimeLoungePageProps) {
  // Chat state
  const [messages, setMessages] = useState<RealtimeChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("PREDICTION");
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Presence state
  const [onlineCount, setOnlineCount] = useState<number>(28);
  const [activePlayers, setActivePlayers] = useState<RealtimePresence[]>([]);

  // Realtime round feed for each mode
  const [currentMode, setCurrentMode] = useState<"30s" | "1m" | "3m" | "5m">("30s");
  const [latestRound, setLatestRound] = useState<RealtimeRound | null>(null);
  const [roundBroadcasting, setRoundBroadcasting] = useState(false);

  // Ping & Latency simulation
  const [livePing, setLivePing] = useState(32);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Periodic simulated latency jitter (20ms - 45ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePing(Math.floor(22 + Math.random() * 20));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to real-time chat messages via Firestore onSnapshot
  useEffect(() => {
    const unsub = subscribeToRealtimeChat(
      (newMsgs) => {
        setMessages(newMsgs);
      },
      50,
      (err) => {
        setChatError("Real-time stream notice: " + err.message);
      },
    );
    return () => unsub();
  }, []);

  // Subscribe to real-time presence
  useEffect(() => {
    const unsub = subscribeToActivePresence((count, players) => {
      setOnlineCount(count);
      setActivePlayers(players);
    });
    return () => unsub();
  }, []);

  // Send periodic presence heartbeat
  useEffect(() => {
    sendPresenceHeartbeat(userId, userName, `Realtime Lounge (${currentMode})`);
    const interval = setInterval(() => {
      sendPresenceHeartbeat(userId, userName, `Realtime Lounge (${currentMode})`);
    }, 45000);
    return () => clearInterval(interval);
  }, [userId, userName, currentMode]);

  // Subscribe to real-time round results for the selected mode
  useEffect(() => {
    const unsub = subscribeToRealtimeRound(currentMode, (round) => {
      if (round) {
        setLatestRound(round);
      }
    });
    return () => unsub();
  }, [currentMode]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    setChatError(null);

    const badgeLabel = isAdmin ? "ADMIN" : plan === "PREMIUM" ? "VIP" : "GAMER";
    const fullText = selectedTag ? `[${selectedTag}] ${inputText.trim()}` : inputText.trim();

    try {
      await sendRealtimeChatMessage({
        userId: userId || "guest_player",
        userName: userName || "Player",
        avatar: userPhoto,
        message: fullText,
        badge: badgeLabel,
      });
      setInputText("");
    } catch (err: any) {
      setChatError(err.message || "Failed to broadcast message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    try {
      await deleteRealtimeChatMessage(msgId);
    } catch (err: any) {
      console.error("Delete message error:", err);
    }
  };

  // Broadcast a live round result test (Admins or user trigger)
  const handleBroadcastSimulatedRound = async () => {
    setRoundBroadcasting(true);
    const winNum = Math.floor(Math.random() * 10);
    const isGreen = [1, 3, 7, 9].includes(winNum);
    const isViolet = winNum === 0 || winNum === 5;
    const color = isViolet ? "violet" : isGreen ? "green" : "red";
    const size = winNum >= 5 ? "Big" : "Small";

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const roundNumber = `${dateStr}0${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await broadcastRealtimeRound(currentMode, {
        mode: currentMode,
        roundNumber,
        winningNumber: winNum,
        winningColor: color,
        size,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error("Broadcast round error:", err);
    } finally {
      setRoundBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6 font-['Rajdhani',sans-serif]">
      {/* Real-Time Database Connection Telemetry Ribbon */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#FF4625]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Wifi className="size-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Orbitron',sans-serif] text-sm font-black tracking-wider text-white">
                  Firebase Real-Time Stream Active
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Cloud Firestore bi-directional WebSockets • Real-time telemetry, draw results & predictions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2">
              <Activity className="size-3.5 text-emerald-400" />
              <span className="text-slate-400 font-medium">Latency:</span>
              <span className="text-emerald-400 font-bold font-mono">{livePing} ms</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2">
              <Users className="size-3.5 text-amber-400" />
              <span className="text-slate-400 font-medium">Gamers Online:</span>
              <span className="text-amber-400 font-bold font-mono">{onlineCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Live Real-Time Round Telemetry + Real-Time Gamer Community Lounge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Real-Time Round Broadcaster & Synchronizer */}
        <div className="lg:col-span-1 space-y-6">
          {/* Live Mode Selection Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="size-4 text-[#FF4625]" />
                <h3 className="font-['Orbitron',sans-serif] font-bold text-sm text-slate-900 dark:text-white">
                  Live Draw Channel
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF4625]/10 text-[#FF4625] font-['Orbitron',sans-serif]">
                SYNCED
              </span>
            </div>

            {/* Mode Selector Buttons */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              {(["30s", "1m", "3m", "5m"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setCurrentMode(mode)}
                  className={`py-2 rounded-xl text-xs font-bold font-['Orbitron',sans-serif] transition-all cursor-pointer ${
                    currentMode === mode
                      ? "bg-white dark:bg-slate-950 text-[#FF4625] shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Latest Synchronized Round Display */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="size-3 text-slate-400" />
                  Round: {latestRound?.roundNumber || "Synchronizing..."}
                </span>
                <span className="font-bold uppercase text-[10px] text-slate-500">
                  {currentMode} Stream
                </span>
              </div>

              {latestRound ? (
                <div className="flex items-center justify-center gap-4 py-2">
                  <div
                    className={`size-16 rounded-2xl flex items-center justify-center font-['Orbitron',sans-serif] text-3xl font-black text-white shadow-lg ${
                      latestRound.winningColor === "green"
                        ? "bg-emerald-500 shadow-emerald-500/30"
                        : latestRound.winningColor === "violet"
                          ? "bg-purple-600 shadow-purple-600/30"
                          : "bg-rose-500 shadow-rose-500/30"
                    }`}
                  >
                    {latestRound.winningNumber}
                  </div>

                  <div className="text-left space-y-1">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Parity Classification
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-black font-['Orbitron',sans-serif] bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                        {latestRound.size}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-xl text-xs font-black font-['Orbitron',sans-serif] uppercase ${
                          latestRound.winningColor === "green"
                            ? "bg-emerald-500/20 text-emerald-500"
                            : latestRound.winningColor === "violet"
                              ? "bg-purple-500/20 text-purple-500"
                              : "bg-rose-500/20 text-rose-500"
                        }`}
                      >
                        {latestRound.winningColor}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-xs text-slate-400">
                  Awaiting next round broadcast from database...
                </div>
              )}

              {/* Broadcast Round Action */}
              <button
                type="button"
                onClick={handleBroadcastSimulatedRound}
                disabled={roundBroadcasting}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-bold text-xs font-['Orbitron',sans-serif] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RotateCcw className={`size-3.5 text-[#FF4625] ${roundBroadcasting ? "animate-spin" : ""}`} />
                <span>Broadcast Round to Database</span>
              </button>
            </div>
          </div>

          {/* Active Online Gamers List */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-amber-500" />
                <h3 className="font-['Orbitron',sans-serif] font-bold text-sm text-slate-900 dark:text-white">
                  Connected Players
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-500 font-bold">
                ● {onlineCount} live
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {userName} (You)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Online Now</span>
              </div>

              {activePlayers
                .filter((p) => p.userId !== userId)
                .slice(0, 6)
                .map((player) => (
                  <div
                    key={player.userId}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300"
                  >
                    <div className="flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-emerald-400" />
                      <span className="font-medium truncate max-w-[120px]">
                        {player.userName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
                      {player.activeGame || "Active"}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Community Lounge & Prediction Signals */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[640px]">
          {/* Lounge Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-2xl bg-linear-to-tr from-[#FF4625] to-amber-500 flex items-center justify-center text-white shadow-md">
                <Flame className="size-5" />
              </div>
              <div>
                <h3 className="font-['Orbitron',sans-serif] font-black text-sm text-slate-900 dark:text-white">
                  Community Prediction Lounge
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Real-time member predictions, win streaks, and companion tips
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-500 font-bold font-mono">LIVE FEED</span>
            </div>
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2">
            {chatError && (
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs">
                {chatError}
              </div>
            )}

            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <Sparkles className="size-8 text-amber-400 animate-bounce" />
                <p className="text-xs font-medium">
                  Be the first to share a tactical prediction or game tip in the live real-time stream!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.userId === userId;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 group ${
                      isMine ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* User Avatar Initial */}
                    <div className="size-8 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black flex items-center justify-center text-xs shrink-0 font-['Orbitron',sans-serif]">
                      {msg.userName.slice(0, 2).toUpperCase()}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[78%] rounded-2xl p-3 text-xs space-y-1 shadow-xs ${
                        isMine
                          ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[11px] font-['Orbitron',sans-serif]">
                            {msg.userName}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase font-['Orbitron',sans-serif] ${
                              msg.badge === "ADMIN"
                                ? "bg-rose-500 text-white"
                                : msg.badge === "VIP"
                                  ? "bg-amber-500 text-slate-950"
                                  : "bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {msg.badge}
                          </span>
                        </div>

                        {/* Delete button (Author or Admin) */}
                        {(isMine || isAdmin) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity cursor-pointer p-0.5"
                            title="Delete message"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        )}
                      </div>

                      <div className="leading-relaxed font-sans break-words whitespace-pre-wrap">
                        {msg.message}
                      </div>

                      <div className="text-[9px] opacity-60 text-right font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Signal Tags Selector */}
          <div className="pt-2 pb-2 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-[10px] text-slate-400 font-bold uppercase font-['Orbitron',sans-serif] shrink-0">
              Signal:
            </span>
            {["PREDICTION", "BIG ALERT", "SMALL ALERT", "STREAK", "TIP"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold font-['Orbitron',sans-serif] transition-colors cursor-pointer shrink-0 ${
                  selectedTag === tag
                    ? "bg-[#FF4625] text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleSendMessage} className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                selectedTag
                  ? `Broadcasting [${selectedTag}] signal...`
                  : "Type live tactical message or strategy..."
              }
              maxLength={250}
              className="flex-1 h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF4625]/30 focus:border-[#FF4625] transition-all"
            />
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="h-11 px-4 rounded-2xl bg-linear-to-r from-[#FF4625] to-amber-500 hover:opacity-90 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50 font-['Orbitron',sans-serif]"
            >
              <Send className="size-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
