"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { LEGAL_CONFIG } from "../../config/legalConfig";
import { LEGAL_POLICIES, POLICY_LIST, LegalPolicy } from "../../data/legalPolicies";
import { MetalButton } from "@/components/ui/metal-button";
import {
  Search,
  ArrowLeft,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  ArrowUp,
  ExternalLink,
  ShieldCheck,
  Check,
} from "lucide-react";

interface LegalCenterProps {
  initialPolicyId?: string;
  onBackToHome?: () => void;
}

export function LegalCenter({
  initialPolicyId = "privacy",
  onBackToHome,
}: LegalCenterProps) {
  const [activePolicyId, setActivePolicyId] = useState<string>(initialPolicyId);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdminChecklist, setShowAdminChecklist] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Sync with prop when passed or changed
  useEffect(() => {
    if (initialPolicyId && LEGAL_POLICIES[initialPolicyId]) {
      setActivePolicyId(initialPolicyId);
    }
  }, [initialPolicyId]);

  // Track window scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 350);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activePolicy: LegalPolicy =
    LEGAL_POLICIES[activePolicyId] || LEGAL_POLICIES.privacy;

  // Filter sections if search query is present
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) {
      return activePolicy.sections;
    }
    const query = searchQuery.toLowerCase();
    return activePolicy.sections.filter((sec) => {
      const matchTitle = sec.title.toLowerCase().includes(query);
      const matchContent = sec.content.toLowerCase().includes(query);
      const matchSub = sec.subsections?.some(
        (sub) =>
          sub.subtitle.toLowerCase().includes(query) ||
          sub.body.toLowerCase().includes(query),
      );
      return matchTitle || matchContent || matchSub;
    });
  }, [activePolicy, searchQuery]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#${activePolicy.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToAnchor = (anchorId: string) => {
    const elem = document.getElementById(anchorId);
    if (elem) {
      const yOffset = -90;
      const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div
      id="popi-legal-center"
      className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Rajdhani',sans-serif] selection:bg-[#FF4625] selection:text-white"
    >
      {/* Top Legal Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Return to POPI Tools Homepage"
              >
                <ArrowLeft className="size-4 text-[#FF4625]" />
                <span className="hidden sm:inline">Back to Home</span>
              </button>
            )}

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="size-6 rounded-lg bg-slate-950 flex items-center justify-center gap-0.5 shadow-2xs">
                <div className="size-1 rounded-xs bg-white" />
                <div className="size-1 rounded-xs bg-white" />
              </div>
              <span className="font-['Orbitron',sans-serif] text-sm sm:text-base font-black tracking-wider text-slate-900 dark:text-white">
                POPI Tools
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hidden md:inline-block">
                Legal & Policy Desk
              </span>
            </div>
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-2">
            {/* Developer/Admin Pre-Launch Checklist Button */}
            <button
              type="button"
              onClick={() => setShowAdminChecklist(!showAdminChecklist)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
              title="View Operator & Pre-Launch Configuration Checklist"
            >
              <AlertCircle className="size-3.5 shrink-0" />
              <span className="hidden md:inline">Admin Checklist</span>
              <span className="md:hidden">Checklist</span>
            </button>

            {/* Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Copy direct link to this policy"
            >
              {copiedLink ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-bold hidden sm:inline">
                    Copied
                  </span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span className="hidden sm:inline">Copy Link</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Print document"
            >
              <Printer className="size-3.5" />
              <span className="hidden sm:inline ml-1">Print</span>
            </button>
          </div>
        </div>
      </header>

      {/* Developer / Admin Checklist Drawer / Banner */}
      {showAdminChecklist && (
        <div className="bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 px-4 sm:px-6 py-5 transition-all animate-in fade-in slide-in-from-top-2">
          <div className="max-w-7xl mx-auto space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-['Orbitron',sans-serif] text-sm sm:text-base font-bold text-amber-950 dark:text-amber-200 tracking-wide">
                  Pre-Launch Legal & Operator Checklist (Admin / Developer)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminChecklist(false)}
                className="text-xs text-amber-800 dark:text-amber-400 hover:underline cursor-pointer font-bold"
              >
                Dismiss
              </button>
            </div>
            <p className="text-xs sm:text-sm text-amber-900/80 dark:text-amber-300/80 leading-relaxed max-w-4xl">
              Before taking POPI Tools public in production, replace the bracketed placeholders (such as{" "}
              <code className="bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded font-mono text-[11px] text-amber-950 dark:text-amber-200">
                [ADD LEGAL BUSINESS NAME]
              </code>{" "}
              and{" "}
              <code className="bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded font-mono text-[11px] text-amber-950 dark:text-amber-200">
                [ADD SUPPORT EMAIL]
              </code>
              ) in <code className="font-mono text-xs">src/config/legalConfig.ts</code> with your verified business details. Do not invent fake registration or GST numbers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
              {LEGAL_CONFIG.adminChecklist.map((item) => (
                <div
                  key={item.key}
                  className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-amber-200/70 dark:border-amber-900/50 flex items-start gap-2 text-xs"
                >
                  {item.status === "verified" ? (
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.label}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner with Title & Last Updated */}
      <div className="relative border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 px-4 sm:px-6 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[#FF4625] border border-slate-200 dark:border-slate-700 font-['Orbitron',sans-serif]">
                {activePolicy.badge}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Last Updated: <strong className="text-slate-700 dark:text-slate-200">{activePolicy.lastUpdated}</strong>
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Effective: <strong className="text-slate-700 dark:text-slate-200">{LEGAL_CONFIG.effectiveDate}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white font-['Orbitron',sans-serif] tracking-wide">
              {activePolicy.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              {activePolicy.summary}
            </p>
          </div>

          {/* Quick Search within Current Document */}
          <div className="w-full md:w-72 relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activePolicy.shortTitle}...`}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF4625] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Scroll Tab Switcher */}
      <div className="lg:hidden sticky top-[57px] z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 overflow-x-auto scrollbar-none flex items-center gap-2">
        {POLICY_LIST.map((policy) => {
          const isActive = policy.id === activePolicyId;
          return (
            <button
              key={policy.id}
              type="button"
              onClick={() => {
                setActivePolicyId(policy.id);
                setSearchQuery("");
                window.location.hash = policy.id;
              }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <i className={`${policy.iconClass} text-xs`} />
              <span>{policy.shortTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Main Dual-Column Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Desktop Left Sticky Navigation Menu */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-20 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-3 space-y-1 shadow-2xs">
              <div className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 font-['Orbitron',sans-serif]">
                Legal Documents
              </div>

              {POLICY_LIST.map((policy) => {
                const isActive = policy.id === activePolicyId;
                return (
                  <button
                    key={policy.id}
                    type="button"
                    onClick={() => {
                      setActivePolicyId(policy.id);
                      setSearchQuery("");
                      window.location.hash = policy.id;
                      scrollToTop();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-left ${
                      isActive
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold shadow-xs"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <i
                        className={`${policy.iconClass} text-sm shrink-0 ${
                          isActive ? "text-[#FF4625]" : "text-slate-400"
                        }`}
                      />
                      <span className="truncate">{policy.name}</span>
                    </div>
                    {isActive && (
                      <span className="size-1.5 rounded-full bg-[#FF4625] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Document Table of Contents */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 space-y-3 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-['Orbitron',sans-serif]">
                In This Document
              </h4>
              <nav className="space-y-1.5 text-xs max-h-60 overflow-y-auto pr-1">
                {activePolicy.sections.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollToAnchor(sec.id)}
                    className="w-full text-left text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:underline truncate block py-1 cursor-pointer"
                  >
                    {sec.title}
                  </button>
                ))}
              </nav>
            </div>

            {/* Support Escalation Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 shadow-sm border border-slate-800">
              <div className="flex items-center gap-2">
                <i className="fi fi-rr-headset text-base text-[#FF4625]" />
                <span className="font-['Orbitron',sans-serif] text-xs font-bold tracking-wider">
                  Need Clarification?
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                For questions regarding subscriptions, data privacy, or terms, contact our Indian support desk.
              </p>
              <a
                href={`mailto:${LEGAL_CONFIG.businessOperator.supportEmail}`}
                className="inline-flex items-center gap-1.5 text-xs text-[#FF4625] font-bold hover:underline"
              >
                <span>{LEGAL_CONFIG.businessOperator.supportEmail}</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </aside>

          {/* Right Main Document Content Area */}
          <main
            ref={contentRef}
            className="lg:col-span-8 xl:col-span-9 space-y-8"
          >
            {/* Key Policy Highlights Box */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 font-['Orbitron',sans-serif]">
                <ShieldCheck className="size-4 text-[#FF4625]" />
                <span>Executive Summary & Key Takeaways</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {activePolicy.keyHighlights.map((hl, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2"
                  >
                    <span className="size-4 rounded-full bg-[#FF4625]/10 text-[#FF4625] font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Plan Pricing Display for Payments Tab */}
            {activePolicy.id === "payments" && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Orbitron',sans-serif] text-base font-bold text-slate-900 dark:text-white">
                    Active Subscription Pricing Configuration
                  </h3>
                  <span className="text-xs text-slate-400">
                    Currency: {LEGAL_CONFIG.operations.primaryCurrency}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {LEGAL_CONFIG.samplePricingPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-xl border transition-all ${
                        plan.popular
                          ? "border-[#FF4625] bg-[#FF4625]/5 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                      }`}
                    >
                      {plan.popular && (
                        <span className="inline-block text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#FF4625] text-white mb-2">
                          Popular
                        </span>
                      )}
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white font-['Orbitron',sans-serif]">
                        {plan.name}
                      </h4>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-xl font-black text-slate-950 dark:text-white font-['Orbitron',sans-serif]">
                          {plan.price}
                        </span>
                        <span className="text-xs text-slate-500">
                          /{plan.period}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Policy Sections */}
            {filteredSections.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800 space-y-2">
                <Search className="size-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 dark:text-slate-200">
                  No matches found for "{searchQuery}"
                </h4>
                <p className="text-xs text-slate-500">
                  Try searching for a different keyword or reset search to view full policy.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-xs text-[#FF4625] font-bold hover:underline cursor-pointer"
                >
                  Clear Search Filter
                </button>
              </div>
            ) : (
              filteredSections.map((sec) => (
                <article
                  key={sec.id}
                  id={sec.id}
                  className={`rounded-2xl p-6 sm:p-8 space-y-4 shadow-2xs scroll-mt-24 transition-colors ${
                    sec.highlight
                      ? "bg-sky-50/40 dark:bg-sky-950/20 border-2 border-sky-300 dark:border-sky-700/60"
                      : sec.warning
                      ? "bg-amber-50/40 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-700/60"
                      : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      {sec.highlight && (
                        <ShieldCheck className="size-4 text-sky-500 shrink-0" />
                      )}
                      {sec.warning && (
                        <AlertCircle className="size-4 text-amber-500 shrink-0" />
                      )}
                      <h3 className="font-['Orbitron',sans-serif] text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wide">
                        {sec.title}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => scrollToAnchor(sec.id)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-mono"
                      title="Direct section anchor"
                    >
                      #{sec.id}
                    </button>
                  </div>

                  {/* Main section body text */}
                  <div className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                    {sec.content}
                  </div>

                  {/* Optional Subsections */}
                  {sec.subsections && sec.subsections.length > 0 && (
                    <div className="space-y-4 pt-2">
                      {sec.subsections.map((sub) => (
                        <div
                          key={sub.id}
                          id={sub.id}
                          className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
                            sub.highlight
                              ? "bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 text-sky-950 dark:text-sky-200"
                              : sub.warning
                              ? "bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-rose-950 dark:text-rose-200"
                              : "bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <div className="font-bold font-['Orbitron',sans-serif] text-xs sm:text-sm mb-1.5 flex items-center gap-1.5">
                            {sub.warning && (
                              <AlertCircle className="size-3.5 text-rose-500 shrink-0" />
                            )}
                            {sub.highlight && (
                              <CheckCircle2 className="size-3.5 text-sky-500 shrink-0" />
                            )}
                            <span>{sub.subtitle}</span>
                          </div>
                          <p className="whitespace-pre-line font-sans">
                            {sub.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))
            )}

            {/* Document Bottom Navigation Cards */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Official policy text &copy; {new Date().getFullYear()} {LEGAL_CONFIG.brandName}. All rights reserved.
              </div>

              {onBackToHome && (
                <MetalButton
                  preset="silver"
                  size="sm"
                  onClick={onBackToHome}
                  className="font-bold text-xs"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Return to Website Homepage</span>
                </MetalButton>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Floating Back-to-Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer"
          title="Scroll to top of document"
          aria-label="Scroll to top"
        >
          <ArrowUp className="size-5" />
        </button>
      )}
    </div>
  );
}

export default LegalCenter;
