"use client";

import React, { useState, useEffect } from "react";
import { ConnectionStatus } from "../../services/resultsService";
import {
  Bell,
  RefreshCw,
  Clock,
  Radio,
  X,
  ShieldAlert,
  Menu,
  Search,
  CheckCircle2,
  Download,
  Filter,
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
  onSearchClick?: () => void;
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
  onSearchClick,
}: DashboardHeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [timeZone, setTimeZone] = useState<string>("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Tactical Engine Live",
      message: "Directly connected to ar-lottery01 WinGo 30S & 1M telemetry streams.",
      time: "Just now",
      read: false,
    },
    {
      id: "2",
      title: "PRO Plan Active",
      message: "High-frequency analysis models and historical draw archive enabled.",
      time: "1h ago",
      read: false,
    },
  ]);

  // Live dynamic clock updated every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
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
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3 transition-colors font-sans">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Hamburger + Page Title & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shrink-0"
              title="Open navigation menu"
              aria-label="Open menu"
            >
              <Menu className="size-4" />
            </button>
          )}

          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">
              {description}
            </p>
          </div>
        </div>

        {/* Center: Global Search Bar (like Image 1, 2, 5, 7) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search draw rounds, issue IDs, algorithms..."
              onClick={onSearchClick}
              className="w-full pl-10 pr-12 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] text-slate-500 dark:text-slate-300 font-mono shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Side: Telemetry pill, Clock, Actions, Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Admin Command Shortcut */}
          {isAdmin && onNavigateAdmin && (
            <button
              type="button"
              onClick={onNavigateAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF4625] hover:bg-[#E03A1B] text-white text-xs font-bold font-['Orbitron',sans-serif] transition-all cursor-pointer shadow-xs"
              title="Admin Command Suite"
            >
              <ShieldAlert className="size-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Real-time Status Badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold tracking-wider font-mono ${
              connectionStatus === "CONNECTED"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : connectionStatus === "UPDATING"
                ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                connectionStatus === "CONNECTED"
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-amber-500"
              }`}
            />
            <span>{connectionStatus}</span>
          </div>

          {/* Dynamic Real-time Clock */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
            <Clock className="size-3.5 text-[#FF4625]" />
            <span>{currentTime || "--:--:--"}</span>
          </div>

          {/* Sync / Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            title="Sync latest live draw results"
          >
            <RefreshCw
              className={`size-4 ${isRefreshing ? "animate-spin text-[#FF4625]" : ""}`}
            />
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 size-4 rounded-full bg-[#FF4625] text-white text-[9px] font-black flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="size-4 text-[#FF4625]" />
                    <span className="text-xs font-bold font-['Orbitron',sans-serif] text-slate-900 dark:text-white">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF4625]/15 text-[#FF4625] font-bold">
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
                        Mark all read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-60 overflow-y-auto py-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl text-xs space-y-1 transition-colors ${
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
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
            title="Open User Profile"
          >
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={userDisplayName}
                className="size-7 rounded-lg object-cover"
              />
            ) : (
              <div className="size-7 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-xs font-black">
                {userDisplayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-left hidden lg:block">
              <div className="text-xs font-bold text-slate-900 dark:text-white max-w-[110px] truncate leading-tight">
                {userDisplayName}
              </div>
              <div className="text-[10px] text-slate-400 leading-none mt-0.5">
                {isAdmin ? "Admin User" : `${plan} Plan`}
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
