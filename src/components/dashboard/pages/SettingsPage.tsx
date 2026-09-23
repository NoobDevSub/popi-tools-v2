"use client";

import React, { useState } from "react";
import {
  Settings,
  Moon,
  Sun,
  Laptop,
  Database,
  Bell,
  Shield,
  FileText,
  ExternalLink,
  Check,
  LogOut,
} from "lucide-react";

interface SettingsPageProps {
  onOpenLegalPolicy: (policyId: string) => void;
  onSignOut?: () => Promise<void>;
}

export function SettingsPage({
  onOpenLegalPolicy,
  onSignOut,
}: SettingsPageProps) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
  const [refreshInterval, setRefreshInterval] = useState<number>(10);
  const [displayCount, setDisplayCount] = useState<number>(25);
  const [compactMode, setCompactMode] = useState<boolean>(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [resultUpdates, setResultUpdates] = useState(true);
  const [accountAlerts, setAccountAlerts] = useState(true);
  const [subAlerts, setSubAlerts] = useState(true);

  const [saveBanner, setSaveBanner] = useState(false);

  const triggerSaveNotification = () => {
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2000);
  };

  const legalLinks = [
    { id: "privacy", label: "Privacy Policy" },
    { id: "terms", label: "Terms & Conditions" },
    { id: "refunds", label: "Refund & Cancellation Policy" },
    { id: "payments", label: "Payment & Subscription Policy" },
    { id: "disclaimer", label: "Disclaimer & Risk Notice" },
    { id: "cookies", label: "Cookie Policy" },
    { id: "acceptable_use", label: "Acceptable Use Policy" },
    { id: "intellectual_property", label: "Intellectual Property Policy" },
    { id: "security", label: "Account & Security Policy" },
    { id: "contact", label: "Contact & Legal Information" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Toast Banner */}
      {saveBanner && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Check className="size-4" />
          <span>Settings saved to local preferences</span>
        </div>
      )}

      {/* 1. Appearance Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-5">
        <div className="flex items-center gap-2">
          <Sun className="size-4 text-[#FF4625]" />
          <h3 className="font-['Orbitron',sans-serif] text-base font-bold text-slate-900 dark:text-white">
            Appearance & Interface Theme
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              setTheme("dark");
              triggerSaveNotification();
            }}
            className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 cursor-pointer transition-all ${
              theme === "dark"
                ? "bg-slate-950 text-white border-[#FF4625]"
                : "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            }`}
          >
            <Moon className="size-4 text-[#FF4625]" />
            <span>Dark (Gaming)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme("light");
              triggerSaveNotification();
            }}
            className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 cursor-pointer transition-all ${
              theme === "light"
                ? "bg-slate-950 text-white border-[#FF4625]"
                : "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            }`}
          >
            <Sun className="size-4 text-amber-500" />
            <span>Light</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme("system");
              triggerSaveNotification();
            }}
            className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 cursor-pointer transition-all ${
              theme === "system"
                ? "bg-slate-950 text-white border-[#FF4625]"
                : "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            }`}
          >
            <Laptop className="size-4 text-sky-500" />
            <span>System Default</span>
          </button>
        </div>
      </div>

      {/* 2. Data & Polling Configuration */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-5">
        <div className="flex items-center gap-2">
          <Database className="size-4 text-[#FF4625]" />
          <h3 className="font-['Orbitron',sans-serif] text-base font-bold text-slate-900 dark:text-white">
            Data Refresh & Results Display
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 font-['Orbitron',sans-serif]">
              Auto-Sync Refresh Interval
            </label>
            <select
              value={refreshInterval}
              onChange={(e) => {
                setRefreshInterval(Number(e.target.value));
                triggerSaveNotification();
              }}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer focus:outline-none"
            >
              <option value={5}>Every 5 Seconds (Ultra Low-latency)</option>
              <option value={10}>Every 10 Seconds (Recommended)</option>
              <option value={30}>Every 30 Seconds (Data Saver)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 font-['Orbitron',sans-serif]">
              History Records Per Page
            </label>
            <select
              value={displayCount}
              onChange={(e) => {
                setDisplayCount(Number(e.target.value));
                triggerSaveNotification();
              }}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer focus:outline-none"
            >
              <option value={15}>15 Records per page</option>
              <option value={25}>25 Records per page</option>
              <option value={50}>50 Records per page</option>
              <option value={100}>100 Records per page</option>
            </select>
          </div>
        </div>

        {/* Compact Mode Switch */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white font-['Orbitron',sans-serif]">
              Compact Table Rows
            </div>
            <p className="text-xs text-slate-500">
              Reduces padding on desktop table cells to maximize visible rows.
            </p>
          </div>
          <input
            type="checkbox"
            checked={compactMode}
            onChange={(e) => {
              setCompactMode(e.target.checked);
              triggerSaveNotification();
            }}
            className="size-4 accent-[#FF4625] cursor-pointer"
          />
        </div>
      </div>

      {/* 3. Notifications */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-5">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-[#FF4625]" />
          <h3 className="font-['Orbitron',sans-serif] text-base font-bold text-slate-900 dark:text-white">
            Notification Preferences
          </h3>
        </div>

        <div className="space-y-3 text-xs divide-y divide-slate-100 dark:divide-slate-800/80">
          <div className="flex items-center justify-between pb-3">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                Enable In-App Notifications
              </div>
              <p className="text-slate-500">
                Receive badge indicators in header for essential events.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="size-4 accent-[#FF4625] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                Result Settlement Alerts
              </div>
              <p className="text-slate-500">
                Notify when a new 30s or 1m round is confirmed.
              </p>
            </div>
            <input
              type="checkbox"
              checked={resultUpdates}
              onChange={(e) => setResultUpdates(e.target.checked)}
              className="size-4 accent-[#FF4625] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                Subscription Expiration Reminders
              </div>
              <p className="text-slate-500">
                Receive reminder 48 hours prior to VIP renewal or expiration.
              </p>
            </div>
            <input
              type="checkbox"
              checked={subAlerts}
              onChange={(e) => setSubAlerts(e.target.checked)}
              className="size-4 accent-[#FF4625] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. Privacy & Official Legal Documentation Links */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-5">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-[#FF4625]" />
          <h3 className="font-['Orbitron',sans-serif] text-base font-bold text-slate-900 dark:text-white">
            Privacy, Policies & Regulatory Compliance
          </h3>
        </div>

        <p className="text-xs text-slate-500">
          POPI Tools operates strictly under Indian IT Act 2000, SPDI Rules 2011, and RBI payment processing norms.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {legalLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => onOpenLegalPolicy(link.id)}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>{link.label}</span>
              <ExternalLink className="size-3.5 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
