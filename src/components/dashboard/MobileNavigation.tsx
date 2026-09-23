"use client";

import React from "react";
import { DashboardPage } from "./Sidebar";
import {
  LayoutDashboard,
  Radio,
  BarChart3,
  History,
  Menu,
} from "lucide-react";

interface MobileNavigationProps {
  activePage: DashboardPage;
  onSelectPage: (page: DashboardPage) => void;
  onOpenMenu: () => void;
}

export function MobileNavigation({
  activePage,
  onSelectPage,
  onOpenMenu,
}: MobileNavigationProps) {
  const items: {
    id: DashboardPage | "menu";
    label: string;
    iconClass: string;
    isMenu?: boolean;
  }[] = [
    {
      id: "overview",
      label: "Home",
      iconClass: "fi fi-rr-apps",
    },
    {
      id: "live",
      label: "Live",
      iconClass: "fi fi-rr-signal-stream",
    },
    {
      id: "activity",
      label: "Activity",
      iconClass: "fi fi-rr-dashboard-monitor",
    },
    {
      id: "analysis",
      label: "Analysis",
      iconClass: "fi fi-rr-chart-histogram",
    },
    {
      id: "menu",
      label: "More",
      iconClass: "fi fi-rr-menu-burger",
      isMenu: true,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-850 px-2 py-1.5 flex items-center justify-around font-['Rajdhani',sans-serif]">
      {items.map((item) => {
        const isActive = !item.isMenu && activePage === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (item.isMenu) {
                onOpenMenu();
              } else {
                onSelectPage(item.id as DashboardPage);
              }
            }}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              isActive
                ? "text-white font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="relative">
              <i
                className={`${item.iconClass} text-lg ${
                  isActive ? "text-[#FF4625]" : "text-slate-400"
                }`}
              />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-[#FF4625]" />
              )}
            </div>
            <span className="text-[10px] tracking-wider mt-0.5 font-medium">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default MobileNavigation;
