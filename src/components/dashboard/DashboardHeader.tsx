"use client";

import React, { useState, useEffect } from "react";
import { ConnectionStatus } from "../../services/resultsService";
import {
  Bell,
  RefreshCw,
  Clock,
  Radio,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  ChevronDown,
  Crown,
  ShieldAlert,
  ArrowLeft,
  Menu,
} from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  description: string;
  connectionStatus: ConnectionStatus;
  isRefreshing: boolean;
  onRefresh: () => void;
  userDisplayName?: string;
  userEmail?: string;
  userPhoto?: string;
  plan?: string;
  isAdmin?: boolean;
  onNavigateAdmin?: () => void;
  onExitDashboard?: () => void;
  onOpenProfile?: () => void;
  onToggleMobileMenu?: () => void;
}

export function DashboardHeader({
  title,
  description,
  connectionStatus,
  isRefreshing,
  onRefresh,
  userDisplayName = "Player One",
  userEmail = "player@popitools.ai",
  userPhoto,
  plan = "PRO",
  isAdmin = false,
  onNavigateAdmin,
  onExitDashboard,
  onOpenProfile,
  onToggleMobileMenu,
}: DashboardHeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [timeZone, setTimeZone] = useState<string>("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Tactical Engine Synchronized",
      message: "Real-time 30s and 1m result channels are streaming at 100% fidelity.",
      time: "Just now",
      read: false,
    },
    {
      id: "2",
      title: "PRO Subscription Active",
      message: "All 38+ POPI companion moods & advanced historical analytics unlocked.",
      time: "1h ago",
      read: false,
    },
  ]);

  // Live dynamic clock updated every second (strictly not hardcoded)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setTimeZone(tz.split("/").pop()?.replace(/_/g, " ") || "Local");
      } catch {
        setTimeZone("Local");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        {/* Left: Hamburger menu (mobile) */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile Drawer Hamburger Button */}
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shrink-0"
              title="Open navigation menu"
              aria-label="Open menu"
            >
              <Menu className="size-4 text-slate-700 dark:text-slate-200" />
            </button>
          )}
        </div>

        {/* Right: Live Connection Indicator, Dynamic Clock, Admin Jump, Refresh, Notifications, Profile */}
        <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 justify-end">
          {/* Quick Admin Command Shortcut */}
          {isAdmin && onNavigateAdmin && (
            <button
              type="button"
              onClick={onNavigateAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF4625] hover:bg-[#E03A1B] text-white text-xs font-bold font-['Orbitron',sans-serif] transition-colors cursor-pointer shrink-0"
              title="Open Admin Command Center (Manage Users & Subscriptions)"
            >
              <ShieldAlert className="size-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Live Dynamic Clock */}
          <div
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-mono font-medium shrink-0"
            title={`Current local time (${timeZone})`}
          >
            <Clock className="size-3.5 text-[#FF4625] shrink-0" />
            <span className="font-semibold">{currentTime || "--:--:--"}</span>
            <span className="text-[10px] text-slate-400 hidden xl:inline">({timeZone})</span>
          </div>

          {/* Connection Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold tracking-wider uppercase font-['Orbitron',sans-serif] shrink-0 ${
              connectionStatus === "CONNECTED"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                : connectionStatus === "UPDATING"
                ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800"
                : connectionStatus === "STALE"
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800"
            }`}
            title={`Data status: ${connectionStatus}`}
          >
            <span
              className={`size-2 rounded-full shrink-0 ${
                connectionStatus === "CONNECTED"
                  ? "bg-emerald-500"
                  : connectionStatus === "UPDATING"
                  ? "bg-sky-500"
                  : connectionStatus === "STALE"
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
            />
            <span className="hidden xs:inline">{connectionStatus}</span>
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            title="Refresh latest results"
            aria-label="Refresh results"
          >
            <RefreshCw
              className={`size-3.5 ${isRefreshing ? "animate-spin text-[#FF4625]" : ""}`}
            />
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell className="size-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 size-4 rounded-full bg-[#FF4625] text-white text-[9px] font-black flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg p-3 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Bell className="size-4 text-[#FF4625]" />
                    <span className="text-xs font-bold font-['Orbitron',sans-serif] text-slate-900 dark:text-white">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#FF4625]/15 text-[#FF4625] font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="text-[10px] text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-60 overflow-y-auto py-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg text-xs space-y-1 transition-colors ${
                        !n.read
                          ? "bg-slate-50 dark:bg-slate-800/50"
                          : "opacity-75"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-snug">
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Quick Profile Snippet */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Open User Profile"
          >
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={userDisplayName}
                className="size-6 rounded-md object-cover"
              />
            ) : (
              <div className="size-6 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-xs font-black">
                {userDisplayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs font-bold text-slate-900 dark:text-white hidden lg:inline max-w-[100px] truncate">
              {userDisplayName}
            </span>
            {isAdmin ? (
              <span className="text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-['Orbitron',sans-serif]">
                GOD MODE
              </span>
            ) : (
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#FF4625] text-white">
                {plan}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
