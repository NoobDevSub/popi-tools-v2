/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TelegramGateProvider, useTelegramGate } from "./context/TelegramGateContext";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import FAQSection from "@/components/ui/faq1";
import { Footer } from "./components/Footer";
import { LegalCenter } from "./components/legal/LegalCenter";
import { LEGAL_POLICIES } from "./data/legalPolicies";
import { DashboardShell } from "./components/dashboard/DashboardShell";
import { DashboardPage } from "./components/dashboard/Sidebar";
import { TelegramChannelGateModal } from "./components/telegram/TelegramChannelGateModal";

function AppContent() {
  const { user, isAdmin } = useAuth();
  const {
    isChannelJoined,
    showGateModal,
    openGateModal,
    closeGateModal,
    config,
  } = useTelegramGate();

  const [currentView, setCurrentView] = useState<"home" | "dashboard" | "legal">("home");
  const [selectedLegalPolicy, setSelectedLegalPolicy] = useState<string>("privacy");
  const [selectedDashboardPage, setSelectedDashboardPage] = useState<DashboardPage>("overview");
  const hasAutoNavigatedRef = useRef(false);

  // When user logs in, if channel is joined or admin, open dashboard; otherwise prompt gate
  useEffect(() => {
    if (user && !hasAutoNavigatedRef.current) {
      if (isChannelJoined || isAdmin) {
        setCurrentView("dashboard");
        const hash = window.location.hash.toLowerCase();
        if (isAdmin && (hash.includes("admin") || hash.includes("godmode"))) {
          setSelectedDashboardPage("admin");
        }
      } else {
        openGateModal();
      }
      hasAutoNavigatedRef.current = true;
    } else if (!user) {
      hasAutoNavigatedRef.current = false;
    }
  }, [user, isAdmin, isChannelJoined, openGateModal]);

  // Sync with URL hash for direct deep links
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      if (!hash) return;

      // Dashboard routes (require channel join if not admin)
      if (hash.startsWith("dashboard")) {
        if (!isChannelJoined && !isAdmin) {
          openGateModal();
          return;
        }
        setCurrentView("dashboard");
        const sub = hash.replace("dashboard/", "").replace("dashboard", "");
        if (sub && ["overview", "live", "analysis", "history", "activity", "subscription", "profile", "settings", "admin"].includes(sub)) {
          setSelectedDashboardPage(sub as DashboardPage);
        } else {
          setSelectedDashboardPage("overview");
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Quick shortcuts to dashboard subpages
      if (["live", "analysis", "history", "activity", "subscription", "profile", "settings", "admin"].includes(hash)) {
        if (!isChannelJoined && !isAdmin) {
          openGateModal();
          return;
        }
        setCurrentView("dashboard");
        setSelectedDashboardPage(hash as DashboardPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Check if hash corresponds to any legal policy
      const normalizedKey = hash.replace(/-/g, "_");
      if (LEGAL_POLICIES[hash]) {
        setSelectedLegalPolicy(hash);
        setCurrentView("legal");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (LEGAL_POLICIES[normalizedKey]) {
        setSelectedLegalPolicy(normalizedKey);
        setCurrentView("legal");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (hash === "legal") {
        setSelectedLegalPolicy("privacy");
        setCurrentView("legal");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    // Initial check on mount
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [isChannelJoined, isAdmin, openGateModal]);

  const openLegalPolicy = (policyId: string) => {
    setSelectedLegalPolicy(policyId);
    setCurrentView("legal");
    window.location.hash = policyId;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDashboard = (page: DashboardPage = "overview") => {
    if (!isChannelJoined && !isAdmin) {
      openGateModal();
      return;
    }
    setSelectedDashboardPage(page);
    setCurrentView("dashboard");
    window.location.hash = page === "overview" ? "dashboard" : `dashboard/${page}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToHome = (targetId?: string) => {
    setCurrentView("home");
    window.location.hash = targetId ? `#${targetId}` : "";
    if (targetId) {
      setTimeout(() => {
        const elem = document.getElementById(targetId);
        if (elem) elem.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      id="app-root-container"
      className="min-h-screen w-full overflow-x-hidden bg-white text-slate-900 selection:bg-[#FF4625] selection:text-white font-['Rajdhani',sans-serif]"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {/* Top Banner: Channel Requirement to use POPI Tools */}
      {!isChannelJoined && !isAdmin && (
        <aside
          aria-label="Telegram Channel Requirement"
          className="bg-gradient-to-r from-sky-950 via-slate-900 to-blue-950 text-white border-b border-sky-800/60 py-2 px-3 sm:px-6 text-xs font-['Rajdhani',sans-serif] flex flex-wrap items-center justify-between gap-2 z-40 relative shadow-sm"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex size-2 rounded-full bg-sky-400 animate-ping" />
            <span className="font-bold text-sky-300 uppercase tracking-wider text-[11px] font-['Orbitron',sans-serif]">
              Channel Required:
            </span>
            <span className="text-slate-200 text-xs">
              Join official channel <b>@{config.publicChannelUsername}</b> to unlock full POPI Tools & tactical radar.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={config.publicChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] uppercase tracking-wider transition-colors shadow-xs"
            >
              Join Channel
            </a>
            <button
              type="button"
              onClick={openGateModal}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/40 font-bold text-[11px] uppercase tracking-wider cursor-pointer transition-colors"
            >
              Verify Membership
            </button>
          </div>
        </aside>
      )}

      <div
        id="app-content-wrapper"
        className="relative w-full max-w-full overflow-x-hidden flex flex-col"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {currentView === "dashboard" ? (
          /* Complete POPI Tools Gaming Results & Analytics Dashboard */
          <DashboardShell
            initialPage={selectedDashboardPage}
            onExitDashboard={() => navigateToHome()}
            onOpenLegalPolicy={(policyId) => openLegalPolicy(policyId)}
          />
        ) : currentView === "legal" ? (
          /* Dedicated Comprehensive Legal & Policy Center */
          <div className="w-full flex flex-col min-h-screen">
            <LegalCenter
              initialPolicyId={selectedLegalPolicy}
              onBackToHome={() => navigateToHome()}
            />
            <Footer
              onOpenLegal={openLegalPolicy}
              onNavigateHome={() => navigateToHome()}
              onOpenDashboard={() => openDashboard("overview")}
            />
          </div>
        ) : (
          /* Main POPI Tools Landing Experience */
          <>
            {/* Floating Header with Brand Logo, Dashboard launch, Telegram, Google Sign-in & Download */}
            <Header onOpenDashboard={() => openDashboard("overview")} />

            {/* Part 1: Interactive POPI Hero with Eye Tracking & GridPulse */}
            <main className="w-full flex-1 overflow-x-hidden">
              <Hero />

              {/* Part 2: POPI How It Works 5-Step Journey */}
              <HowItWorks />

              {/* Part 3: POPI Frequently Asked Questions */}
              <FAQSection />
            </main>

            {/* Part 4: Official POPI Footer with All Legal Links & Dashboard launch */}
            <Footer
              onOpenLegal={openLegalPolicy}
              onNavigateHome={() => navigateToHome()}
              onOpenDashboard={() => openDashboard("overview")}
            />
          </>
        )}
      </div>

      {/* Official Telegram Channel Gate Modal */}
      <TelegramChannelGateModal
        isOpen={showGateModal || (!isChannelJoined && !isAdmin && currentView === "dashboard")}
        onClose={closeGateModal}
        isBlocking={!isChannelJoined && !isAdmin}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TelegramGateProvider>
        <AppContent />
      </TelegramGateProvider>
    </AuthProvider>
  );
}
