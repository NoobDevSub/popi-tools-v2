"use client";

import React from "react";
import {
  LayoutDashboard,
  Radio,
  BarChart3,
  History,
  Activity,
  CreditCard,
  User,
  Settings,
  HelpCircle,
  ArrowLeft,
  ChevronRight,
  Shield,
  LogOut,
  X,
} from "lucide-react";

export type DashboardPage =
  | "overview"
  | "live"
  | "realtime"
  | "analysis"
  | "history"
  | "activity"
  | "api-keys"
  | "uploads"
  | "subscription"
  | "profile"
  | "settings"
  | "help"
  | "admin";

interface SidebarProps {
  activePage: DashboardPage;
  onSelectPage: (page: DashboardPage) => void;
  onExitDashboard?: () => void;
  userDisplayName?: string;
  userEmail?: string;
  userPhoto?: string;
  plan?: string;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isAdmin?: boolean;
}

export function Sidebar({
  activePage,
  onSelectPage,
  onExitDashboard,
  userDisplayName = "Player One",
  userEmail = "player@popitools.ai",
  userPhoto,
  plan = "PRO",
  isOpenMobile = false,
  onCloseMobile,
  isAdmin = false,
}: SidebarProps) {
  const navItems: {
    id: DashboardPage;
    label: string;
    iconClass: string;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: "overview",
      label: "Dashboard",
      iconClass: "fi fi-rr-apps",
    },
    {
      id: "live",
      label: "Live Results",
      iconClass: "fi fi-rr-signal-stream",
      badge: "LIVE",
    },
    {
      id: "analysis",
      label: "Analysis",
      iconClass: "fi fi-rr-chart-histogram",
    },
    {
      id: "history",
      label: "Result History",
      iconClass: "fi fi-rr-time-past",
    },
    {
      id: "activity",
      label: "My Activity",
      iconClass: "fi fi-rr-dashboard-monitor",
    },
    {
      id: "api-keys",
      label: "API Keys",
      iconClass: "fi fi-rr-key",
      badge: "DEV",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40",
    },
    {
      id: "uploads",
      label: "Script Uploads",
      iconClass: "fi fi-rr-cloud-upload",
    },
    {
      id: "subscription",
      label: "Subscription",
      iconClass: "fi fi-rr-credit-card",
      badge: isAdmin ? "GOD MODE" : plan,
      badgeColor: isAdmin ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : undefined,
    },
    {
      id: "profile",
      label: "User Profile",
      iconClass: "fi fi-rr-user",
    },
    {
      id: "settings",
      label: "Settings",
      iconClass: "fi fi-rr-settings",
    },
    {
      id: "help",
      label: "Legal & Help",
      iconClass: "fi fi-rr-interrogation",
    },
    ...(isAdmin
      ? [
          {
            id: "admin" as DashboardPage,
            label: "Admin Command",
            iconClass: "fi fi-rr-shield-check text-amber-400",
            badge: "ADMIN",
            badgeColor: "bg-[#FF4625] text-white font-black animate-pulse",
          },
        ]
      : []),
  ];

  const content = (
    <div className="h-full flex flex-col justify-between gap-6 p-4 bg-slate-950 text-slate-300 font-['Rajdhani',sans-serif] selection:bg-[#FF4625] selection:text-white overflow-y-auto overscroll-contain">
      {/* Brand Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            {/* Mini POPI icon mark */}
            <div className="size-8 rounded-xl bg-white flex items-center justify-center gap-1 shadow-sm shrink-0">
              <div className="size-1.5 rounded-xs bg-slate-950" />
              <div className="size-1.5 rounded-xs bg-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-['Orbitron',sans-serif] text-lg font-black tracking-widest text-white">
                  POPI
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-orange-500/20 text-[#FF4625] border border-orange-500/30">
                  Dashboard
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                Tactical Gaming Utility
              </p>
            </div>
          </div>

          {/* Close mobile button */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Primary Navigation Links */}
        <nav className="space-y-1">
          <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-slate-500 font-['Orbitron',sans-serif]">
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectPage(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-left ${
                  isActive
                    ? "bg-white text-slate-950 font-bold shadow-md shadow-black/20"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <i
                    className={`${item.iconClass} text-base shrink-0 ${
                      isActive ? "text-[#FF4625]" : "text-slate-400"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                      item.badgeColor
                        ? item.badgeColor
                        : isActive
                        ? "bg-[#FF4625] text-white"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Bottom: User Profile Card, Plan status & Exit */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80 shrink-0">
        {/* User Card */}
        <div
          onClick={() => {
            onSelectPage("profile");
            if (onCloseMobile) onCloseMobile();
          }}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800/90 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5 truncate">
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={userDisplayName}
                className="size-8 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="size-8 rounded-lg bg-white text-slate-950 flex items-center justify-center text-xs font-black shrink-0">
                {userDisplayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">
                {userDisplayName}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {userEmail}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectPage("settings");
              if (onCloseMobile) onCloseMobile();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Settings"
          >
            <Settings className="size-3.5" />
          </button>
        </div>

        {/* Return to Website Landing button */}
        {onExitDashboard && (
          <button
            type="button"
            onClick={onExitDashboard}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800/80 transition-all cursor-pointer"
          >
            <ArrowLeft className="size-3.5 text-[#FF4625]" />
            <span>Return to Marketing Site</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 h-screen sticky top-0 z-40 border-r border-slate-850 bg-slate-950 overflow-y-auto">
        {content}
      </aside>

      {/* Mobile Slide-Out Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-200 overflow-hidden">
            {content}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
