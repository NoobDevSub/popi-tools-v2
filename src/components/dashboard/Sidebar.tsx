"use client";

import React from "react";
import { PopiLogo } from "../PopiLogo";
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
  ShieldAlert,
  LogOut,
  X,
  Search,
  Key,
  UploadCloud,
  MessageSquare,
  Sparkles,
  Sliders,
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

interface NavItem {
  id: DashboardPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
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
  const navGroups: NavGroup[] = [
    {
      groupTitle: "MAIN MENU",
      items: [
        {
          id: "overview",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          id: "live",
          label: "Live Results Feed",
          icon: Radio,
          badge: "LIVE",
          badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        },
        {
          id: "realtime",
          label: "Real-time Lounge",
          icon: MessageSquare,
          badge: "HOT",
          badgeColor: "bg-[#FF4625]/15 text-[#FF4625] border border-[#FF4625]/25",
        },
        {
          id: "analysis",
          label: "Analytics & Trends",
          icon: BarChart3,
        },
        {
          id: "history",
          label: "Historical Draws",
          icon: History,
        },
      ],
    },
    {
      groupTitle: "MANAGEMENT",
      items: [
        {
          id: "activity",
          label: "Activity & Telemetry",
          icon: Activity,
        },
        {
          id: "api-keys",
          label: "Developer API Keys",
          icon: Key,
          badge: "DEV",
          badgeColor: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
        },
        {
          id: "uploads",
          label: "Script Uploads",
          icon: UploadCloud,
        },
        {
          id: "subscription",
          label: "Subscription & VIP",
          icon: CreditCard,
          badge: isAdmin ? "GOD MODE" : plan,
          badgeColor: isAdmin
            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
            : undefined,
        },
      ],
    },
    {
      groupTitle: "SYSTEM",
      items: [
        {
          id: "profile",
          label: "User Profile",
          icon: User,
        },
        {
          id: "settings",
          label: "Settings",
          icon: Settings,
        },
        {
          id: "help",
          label: "Legal & Compliance",
          icon: HelpCircle,
        },
        ...(isAdmin
          ? [
              {
                id: "admin" as DashboardPage,
                label: "Admin Command",
                icon: ShieldAlert,
                badge: "ADMIN",
                badgeColor: "bg-[#FF4625] text-white font-black",
              },
            ]
          : []),
      ],
    },
  ];

  const content = (
    <div className="h-full flex flex-col justify-between bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-r border-slate-200/90 dark:border-slate-850 selection:bg-[#FF4625] selection:text-white overflow-hidden font-sans">
      {/* Top Header & Navigation Container */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            {/* Square Geometric Logo Icon with User Logo */}
            <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center shadow-2xs shrink-0">
              <PopiLogo className="size-6 shrink-0" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-['Orbitron',sans-serif] text-base font-black tracking-wider text-slate-900 dark:text-white">
                  POPI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-[#FF4625]/10 text-[#FF4625] border border-[#FF4625]/20 font-mono">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                Tactical Draw Telemetry
              </p>
            </div>
          </div>

          {/* Close mobile button */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Global Quick Search Shortcut Bar (Square style like Image 1, 2, 5) */}
        <div className="relative">
          <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            readOnly
            onClick={() => onSelectPage("overview")}
            placeholder="Quick search..."
            className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-hidden cursor-pointer"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 font-mono">
            ⌘K
          </kbd>
        </div>

        {/* Grouped Navigation Links */}
        <nav className="space-y-6">
          {navGroups.map((group) => (
            <div key={group.groupTitle} className="space-y-1">
              <div className="px-3 pb-1.5 text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 font-['Orbitron',sans-serif]">
                {group.groupTitle}
              </div>

              {group.items.map((item) => {
                const isActive = activePage === item.id;
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectPage(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                      isActive
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <IconComponent
                        className={`size-4 shrink-0 transition-colors ${
                          isActive
                            ? "text-[#FF4625]"
                            : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md font-mono ${
                          item.badgeColor
                            ? item.badgeColor
                            : isActive
                            ? "bg-[#FF4625] text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Sidebar Bottom: User Profile Card & Back to site */}
      <div className="p-4 border-t border-slate-200/90 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950 space-y-2.5 shrink-0">
        {/* User Card */}
        <div
          onClick={() => {
            onSelectPage("profile");
            if (onCloseMobile) onCloseMobile();
          }}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between shadow-2xs"
        >
          <div className="flex items-center gap-2.5 truncate">
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={userDisplayName}
                className="size-8 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="size-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-xs font-black shrink-0">
                {userDisplayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="truncate">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {userDisplayName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {userEmail}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectPage("settings");
                if (onCloseMobile) onCloseMobile();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Settings"
            >
              <Settings className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Exit Dashboard */}
        {onExitDashboard && (
          <button
            type="button"
            onClick={onExitDashboard}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="size-3.5 text-[#FF4625]" />
            <span>Return to Main Site</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 h-screen sticky top-0 z-40 bg-white dark:bg-slate-950">
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
