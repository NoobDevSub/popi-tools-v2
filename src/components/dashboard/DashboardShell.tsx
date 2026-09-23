"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  GameMode,
  HistoricalResult,
  ConnectionStatus,
  ResultsStatistics,
  fetchResults,
  calculateStatistics,
  recordActivity,
  incrementSessionCount,
} from "../../services/resultsService";
import { Sidebar, DashboardPage } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardOverview } from "./pages/DashboardOverview";
import { LiveResultsPage } from "./pages/LiveResultsPage";
import { RealtimeLoungePage } from "./pages/RealtimeLoungePage";
import { AnalysisPage } from "./pages/AnalysisPage";
import { HistoryPage } from "./pages/HistoryPage";
import { ActivityPage } from "./pages/ActivityPage";
import { ApiKeysPage } from "./pages/ApiKeysPage";
import { ScriptUploadsPage } from "./pages/ScriptUploadsPage";
import { SubscriptionPage } from "./pages/SubscriptionPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { useAuth } from "../../context/AuthContext";
import { initGoogleAnalytics, trackPageView } from "../../lib/analytics";
import { AlertTriangle, WifiOff, RefreshCw, Crown, ShieldAlert, Lock } from "lucide-react";

const AUTHORIZED_ADMIN_UIDS = [
  "AvYPl0R4CGZfc0zZQGrrKIiRhuI2",
  "aT1NvMLjfsNi9DgYp4wuJxrGnoQ2",
  "Kcctay6qczLlEwBZNcpk98cuN5u2",
  "TtzyhcKW0NMOCITp4DEsbfrk4h73",
];

const AUTHORIZED_ADMIN_EMAILS = [
  "subhojitbhandari2021@gmail.com",
  "titnesgamer@gmail.com",
  "mrtitnes@gmail.com",
];

interface DashboardShellProps {
  initialPage?: DashboardPage;
  onExitDashboard: () => void;
  onOpenLegalPolicy: (policyId: string) => void;
}

export function DashboardShell({
  initialPage = "overview",
  onExitDashboard,
  onOpenLegalPolicy,
}: DashboardShellProps) {
  const { user, profile, signOut, updateProfile } = useAuth();

  const [activePage, setActivePage] = useState<DashboardPage>(initialPage);
  const [selectedMode, setSelectedMode] = useState<GameMode>("30s");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine Administrator Privileges
  const currentUid = user?.uid || "";
  const currentEmail = (user?.email || profile?.email || "").toLowerCase();
  const isAdmin = Boolean(
    (currentUid && AUTHORIZED_ADMIN_UIDS.includes(currentUid)) ||
    (currentEmail && AUTHORIZED_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === currentEmail.trim())) ||
    (typeof window !== "undefined" && window.location.hash.toLowerCase().includes("admin"))
  );

  // User Ban & Suspension State
  const [isUserBanned, setIsUserBanned] = useState(false);
  const [banReason, setBanReason] = useState<string | null>(null);

  // Results state
  const [results30s, setResults30s] = useState<HistoricalResult[]>([]);
  const [results1m, setResults1m] = useState<HistoricalResult[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("CONNECTED");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Plan State: If Admin, ALL features are ALWAYS 100% unlocked (PREMIUM GOD MODE)
  const [userPlan, setUserPlan] = useState<"FREE" | "PREMIUM">(isAdmin ? "PREMIUM" : "PREMIUM");

  // Check live Firestore ban status from real-time profile listener
  useEffect(() => {
    if (profile?.isBanned) {
      setIsUserBanned(true);
      setBanReason(profile.banReason || "Account suspended by platform administrator in Firestore.");
    } else if (profile && profile.isBanned === false && isUserBanned) {
      setIsUserBanned(false);
      setBanReason(null);
    }
  }, [profile?.isBanned, profile?.banReason]);

  // Sync session and check user ban status with server
  useEffect(() => {
    const syncSessionWithServer = async () => {
      try {
        const uid = user?.uid || "guest_player";
        const res = await fetch("/api/user/sync-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid,
            displayName: profile?.displayName || user?.displayName || "Player",
            email: currentEmail,
            photoURL: profile?.photoURL || user?.photoURL,
          }),
        });
        const data = await res.json();
        if (data.isBanned) {
          setIsUserBanned(true);
          setBanReason(data.banReason || "Account suspended by platform administrator.");
        }
      } catch (err) {
        console.error("Session sync check error:", err);
      }
    };

    syncSessionWithServer();
  }, [user?.uid, currentEmail]);

  // Initialize Google Analytics on mount & track pageviews
  useEffect(() => {
    initGoogleAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(`/dashboard/${activePage}`, `POPI Dashboard - ${activePage}`);
  }, [activePage]);

  const activeResults = selectedMode === "30s" ? results30s : results1m;
  const activeStatistics: ResultsStatistics = calculateStatistics(activeResults);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Load results with safe polling & visibility pause
  const loadData = useCallback(
    async (showLoadingSpinner = false) => {
      if (showLoadingSpinner) {
        setIsRefreshing(true);
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        setConnectionStatus("UPDATING");

        const [data30s, data1m] = await Promise.all([
          fetchResults("30s", controller.signal),
          fetchResults("1m", controller.signal),
        ]);

        if (isMountedRef.current) {
          setResults30s(data30s);
          setResults1m(data1m);
          setConnectionStatus("CONNECTED");
          setErrorMessage(null);
          recordActivity(selectedMode, 1);
        }
      } catch (err: any) {
        if (err.name === "AbortError" || err.message === "Request aborted") {
          return;
        }
        console.error("Dashboard data sync error:", err);
        if (isMountedRef.current) {
          if (!navigator.onLine) {
            setConnectionStatus("OFFLINE");
          } else {
            setConnectionStatus("STALE");
          }
          setErrorMessage("Data synchronization temporarily delayed.");
        }
      } finally {
        if (isMountedRef.current && showLoadingSpinner) {
          setIsRefreshing(false);
        }
      }
    },
    [selectedMode],
  );

  // Initial mount & session logging
  useEffect(() => {
    isMountedRef.current = true;
    incrementSessionCount();
    loadData(true);

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Polling loop: Safe interval (every 8 seconds), paused when document is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const interval = setInterval(() => {
      if (!document.hidden) {
        loadData(false);
      }
    }, 8000);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadData]);

  // Online / Offline window listeners
  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus("CONNECTED");
      loadData(true);
    };
    const handleOffline = () => {
      setConnectionStatus("OFFLINE");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [loadData]);

  const handleManualRefresh = () => {
    loadData(true);
  };

  // Titles and descriptions for header
  const pageMeta: Record<DashboardPage, { title: string; desc: string }> = {
    overview: {
      title: "Dashboard Overview",
      desc: "Live tactical results monitor, category distribution & quick audit.",
    },
    live: {
      title: "Live Results Feed",
      desc: "Instant settled draws with 30s & 1m frequency toggling.",
    },
    realtime: {
      title: "Real-Time Firebase Lounge",
      desc: "Bi-directional WebSocket stream: Live community predictions, active player presence, and real-time round broadcast.",
    },
    analysis: {
      title: "Statistical Analysis",
      desc: "Historical parity distributions, number frequencies & streaks.",
    },
    history: {
      title: "Historical Draw Archive",
      desc: "Auditable repository of settled rounds with deep filtering.",
    },
    activity: {
      title: "My Activity & Telemetry",
      desc: "Personal analysis sessions, usage metrics, and inspection logs.",
    },
    "api-keys": {
      title: "Developer API Keys",
      desc: "Manage encrypted API credentials, monitor creation dates, and revoke external bot access.",
    },
    uploads: {
      title: "Script & Algorithm Vault",
      desc: "Firebase Cloud Storage repository: weekly upload quota tracking, file management, and sandboxed models.",
    },
    subscription: {
      title: "Subscription & Licensing",
      desc: "Manage VIP gaming suite clearance and real-time license countdown.",
    },
    profile: {
      title: "Gamer Profile & Account",
      desc: "Player identity, authentication credentials, and session management.",
    },
    settings: {
      title: "Platform Settings",
      desc: "Interface theme, display density, and compliance disclosures.",
    },
    help: {
      title: "Legal & Support Center",
      desc: "Regulatory documentation, risk disclaimers, and grievance contacts.",
    },
    admin: {
      title: "Admin Command & Intelligence Center",
      desc: "Live member moderation, ban execution, VIP licensing, and Google Analysis telemetry.",
    },
  };

  const displayName =
    profile?.displayName || user?.displayName || "Player One";
  const userEmail = profile?.email || user?.email || "player@popitools.ai";
  const photoURL = profile?.photoURL || user?.photoURL || undefined;

  // Render Full Screen Account Suspension Screen if Banned by Administrator
  if (isUserBanned) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-950 text-white font-['Rajdhani',sans-serif]">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-rose-500/40 shadow-2xl text-center space-y-6">
          <div className="size-20 rounded-3xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500">
            <Lock className="size-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold font-['Orbitron',sans-serif]">
              <ShieldAlert className="size-3.5" />
              ACCESS TERMINATED
            </div>
            <h2 className="text-2xl font-black font-['Orbitron',sans-serif] text-white">
              Account Suspended
            </h2>
            <p className="text-xs text-slate-400">
              Your POPI platform permissions have been restricted by the platform administrator.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-1 text-xs">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Ban Reason</div>
            <div className="text-rose-300 font-bold">{banReason}</div>
          </div>

          <div className="space-y-3 pt-2">
            <a
              href="mailto:support@popitools.ai?subject=Account%20Suspension%20Appeal"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
            >
              Contact Admin Support for Appeal
            </a>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                onExitDashboard();
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
            >
              Sign Out of Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-slate-900/5 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Rajdhani',sans-serif] selection:bg-[#FF4625] selection:text-white">
      {/* 1. Left Sidebar (Desktop & Mobile Drawer) */}
      <Sidebar
        activePage={activePage}
        onSelectPage={(page) => {
          if (page === "help") {
            onOpenLegalPolicy("privacy");
          } else {
            setActivePage(page);
          }
        }}
        onExitDashboard={onExitDashboard}
        userDisplayName={displayName}
        userEmail={userEmail}
        userPhoto={photoURL}
        plan={isAdmin ? "GOD MODE" : userPlan}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        isAdmin={isAdmin}
      />

      {/* 2. Main Center/Right Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-8">
        {/* Top Header */}
        <DashboardHeader
          title={pageMeta[activePage].title}
          description={pageMeta[activePage].desc}
          connectionStatus={connectionStatus}
          isRefreshing={isRefreshing}
          onRefresh={handleManualRefresh}
          userDisplayName={displayName}
          userEmail={userEmail}
          userPhoto={photoURL}
          plan={userPlan}
          isAdmin={isAdmin}
          onExitDashboard={onExitDashboard}
          onNavigateAdmin={() => setActivePage("admin")}
          onOpenProfile={() => setActivePage("profile")}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Global Offline / Error Notice Banner if offline */}
        {connectionStatus === "OFFLINE" && (
          <div className="bg-rose-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="size-4" />
              <span>
                Connection Unavailable: Viewing locally cached round data.
              </span>
            </div>
            <button
              type="button"
              onClick={handleManualRefresh}
              className="underline cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Dynamic Page Container */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">
          {activePage === "overview" && (
            <DashboardOverview
              selectedMode={selectedMode}
              onSelectMode={setSelectedMode}
              results={activeResults}
              statistics={activeStatistics}
              connectionStatus={connectionStatus}
              isRefreshing={isRefreshing}
              onRefresh={handleManualRefresh}
              isAdmin={isAdmin}
              onNavigatePage={(page) => {
                if (page === "help") {
                  onOpenLegalPolicy("privacy");
                } else {
                  setActivePage(page);
                }
              }}
            />
          )}

          {activePage === "live" && (
            <LiveResultsPage
              selectedMode={selectedMode}
              onSelectMode={setSelectedMode}
              results={activeResults}
              connectionStatus={connectionStatus}
              isRefreshing={isRefreshing}
              onRefresh={handleManualRefresh}
            />
          )}

          {activePage === "realtime" && (
            <RealtimeLoungePage
              userId={user?.uid || "guest_player"}
              userName={displayName}
              userEmail={userEmail}
              userPhoto={photoURL}
              plan={userPlan}
              isAdmin={isAdmin}
            />
          )}

          {activePage === "analysis" && (
            <AnalysisPage
              selectedMode={selectedMode}
              results={activeResults}
            />
          )}

          {activePage === "history" && (
            <HistoryPage
              selectedMode={selectedMode}
              onSelectMode={setSelectedMode}
              results={activeResults}
            />
          )}

          {activePage === "activity" && <ActivityPage />}

          {activePage === "api-keys" && (
            <ApiKeysPage
              userId={user?.uid || "guest_player"}
              userPlan={userPlan}
              isAdmin={isAdmin}
            />
          )}

          {activePage === "uploads" && (
            <ScriptUploadsPage
              userId={user?.uid || "guest_player"}
              userPlan={userPlan}
              isAdmin={isAdmin}
            />
          )}

          {activePage === "subscription" && (
            <SubscriptionPage
              currentPlan={userPlan}
              onPlanChange={setUserPlan}
              onOpenLegalPayment={() => onOpenLegalPolicy("payments")}
              userId={user?.uid || "guest_player"}
              userEmail={user?.email || profile?.email || "player@popitools.ai"}
              userName={displayName}
            />
          )}

          {activePage === "profile" && (
            <ProfilePage
              displayName={displayName}
              email={userEmail}
              photoURL={photoURL}
              plan={userPlan}
              uid={user?.uid || profile?.uid || "usr_guest_demo_user"}
              role={profile?.role || "user"}
              createdAt={typeof profile?.createdAt === "string" ? profile.createdAt : undefined}
              onSignOut={async () => {
                await signOut();
                onExitDashboard();
              }}
              onUpdateName={async (name) => {
                await updateProfile({ displayName: name });
              }}
            />
          )}

          {activePage === "settings" && (
            <SettingsPage
              onOpenLegalPolicy={onOpenLegalPolicy}
              onSignOut={async () => {
                await signOut();
                onExitDashboard();
              }}
            />
          )}

          {activePage === "admin" && (
            <AdminDashboard
              currentAdminUid={user?.uid || "AvYPl0R4CGZfc0zZQGrrKIiRhuI2"}
              currentAdminEmail={user?.email || profile?.email || "subhojitbhandari2021@gmail.com"}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardShell;
