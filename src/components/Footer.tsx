"use client";

import React from "react";
import { PopiLogo } from "./PopiLogo";
import { MetalButton } from "@/components/ui/metal-button";
import { LEGAL_CONFIG } from "../config/legalConfig";

interface FooterProps {
  onOpenLegal?: (policyId: string) => void;
  onNavigateHome?: () => void;
  onOpenDashboard?: () => void;
}

export function Footer({ onOpenLegal, onNavigateHome, onOpenDashboard }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleLegalClick = (e: React.MouseEvent, policyId: string) => {
    e.preventDefault();
    if (onOpenLegal) {
      onOpenLegal(policyId);
    } else {
      window.location.hash = policyId;
    }
  };

  const handleHomeClick = (e: React.MouseEvent, targetId?: string) => {
    if (onNavigateHome) {
      onNavigateHome();
    }
    if (targetId) {
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer
      id="popi-footer"
      className="relative w-full bg-slate-950 text-slate-400 border-t border-slate-850 overflow-hidden font-['Rajdhani',sans-serif]"
    >
      {/* Subtle top ambient accent glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-px bg-gradient-to-r from-transparent via-[#FF4625]/40 to-transparent"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-14 sm:pt-16 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Col */}
          <div className="sm:col-span-2 md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              {/* Official POPI brand logo */}
              <PopiLogo className="size-8 shrink-0" />
              <span className="font-['Orbitron',sans-serif] text-2xl font-black tracking-widest text-white">
                POPI Tools
              </span>
            </div>

            <p className="text-xs uppercase tracking-widest text-[#FF4625] font-bold font-['Orbitron',sans-serif]">
              {LEGAL_CONFIG.tagline}
            </p>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              POPI Tools is an AI-powered gaming utility platform providing smart companion callouts, expressive mood tracking, tactical notes, and competitive tools for mobile players.
            </p>

            <div className="pt-2 flex flex-wrap gap-2.5 items-center">
              <MetalButton
                id="footer-download-btn"
                preset="chromatic"
                size="sm"
                href="https://play.google.com/store/apps/details?id=com.popi.popitools.ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download POPI App from Google Play"
                className="font-bold text-slate-900 text-xs px-3.5 py-1.5 gap-1.5 shadow-sm"
              >
                <svg
                  className="size-3.5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.609 1.814L13.792 12 3.61 22.186A2.37 2.37 0 013 20.533V3.467c0-.643.226-1.233.609-1.653z"
                    fill="#00E676"
                  />
                  <path
                    d="M17.228 8.563l-3.436 3.437 3.436 3.437 3.864-2.196a1.5 1.5 0 000-2.678l-3.864-2.678z"
                    fill="#FFD600"
                  />
                  <path
                    d="M3.609 1.814L17.228 8.563l-3.436 3.437L3.609 1.814z"
                    fill="#00B0FF"
                  />
                  <path
                    d="M3.609 22.186L13.792 12l3.436 3.437-13.619 6.749z"
                    fill="#FF3D00"
                  />
                </svg>
                <span>Google Play</span>
              </MetalButton>

              <MetalButton
                id="footer-telegram-btn"
                preset="silver"
                size="sm"
                href="https://t.me/popitools"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join Official POPI Telegram Channel"
                className="text-slate-900 text-xs px-3 py-1.5 gap-1.5 font-semibold"
              >
                <i className="fi fi-brands-telegram text-sm text-[#0284C7] shrink-0" />
                <span>Telegram</span>
              </MetalButton>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="sm:col-span-1 md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white font-['Orbitron',sans-serif]">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#popi-hero-section"
                  onClick={(e) => handleHomeClick(e, "popi-hero-section")}
                  className="hover:text-white transition-colors"
                >
                  Home
                </a>
              </li>
              {onOpenDashboard && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenDashboard}
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5 font-bold text-[#FF4625]"
                  >
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    <span>Live Dashboard</span>
                  </button>
                </li>
              )}
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => handleHomeClick(e, "how-it-works")}
                  className="hover:text-white transition-colors"
                >
                  Features & Tools
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  onClick={(e) => handleLegalClick(e, "payments")}
                  className="hover:text-white transition-colors"
                >
                  Pricing Plans
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  onClick={(e) => handleHomeClick(e, "faq")}
                  className="hover:text-white transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Policies (Column 1) */}
          <div className="sm:col-span-1 md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white font-['Orbitron',sans-serif]">
              Legal & Compliance
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#privacy"
                  onClick={(e) => handleLegalClick(e, "privacy")}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="text-[#FF4625] text-xs">&rsaquo;</span>
                  <span>Privacy Policy</span>
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  onClick={(e) => handleLegalClick(e, "terms")}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="text-[#FF4625] text-xs">&rsaquo;</span>
                  <span>Terms & Conditions</span>
                </a>
              </li>
              <li>
                <a
                  href="#refunds"
                  onClick={(e) => handleLegalClick(e, "refunds")}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="text-[#FF4625] text-xs">&rsaquo;</span>
                  <span>Refund & Cancellation</span>
                </a>
              </li>
              <li>
                <a
                  href="#payments"
                  onClick={(e) => handleLegalClick(e, "payments")}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="text-[#FF4625] text-xs">&rsaquo;</span>
                  <span>Payment & Subscription</span>
                </a>
              </li>
              <li>
                <a
                  href="#disclaimer"
                  onClick={(e) => handleLegalClick(e, "disclaimer")}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="text-[#FF4625] text-xs">&rsaquo;</span>
                  <span>Disclaimer & Risk Notice</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Policies & Security (Column 2) */}
          <div className="sm:col-span-2 md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white font-['Orbitron',sans-serif]">
              Policies & Support
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#cookies"
                  onClick={(e) => handleLegalClick(e, "cookies")}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="text-[#FF4625] text-xs">&rsaquo;</span>
                  <span>Cookie Policy</span>
                </a>
              </li>
              <li>
                <a
                  href="#acceptable_use"
                  onClick={(e) => handleLegalClick(e, "acceptable_use")}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="text-[#FF4625] text-xs">&rsaquo;</span>
                  <span>Acceptable Use Policy</span>
                </a>
              </li>
              <li>
                <a
                  href="#intellectual_property"
                  onClick={(e) => handleLegalClick(e, "intellectual_property")}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="text-[#FF4625] text-xs">&rsaquo;</span>
                  <span>Intellectual Property</span>
                </a>
              </li>
              <li>
                <a
                  href="#security"
                  onClick={(e) => handleLegalClick(e, "security")}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="text-[#FF4625] text-xs">&rsaquo;</span>
                  <span>Account & Security</span>
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => handleLegalClick(e, "contact")}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-sky-400 font-semibold"
                >
                  <span className="text-xs">&rsaquo;</span>
                  <span>Legal Contact & Grievances</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Consumer Notice */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {currentYear} {LEGAL_CONFIG.brandName}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-400">
            <button
              type="button"
              onClick={(e) => handleLegalClick(e, "privacy")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={(e) => handleLegalClick(e, "terms")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={(e) => handleLegalClick(e, "refunds")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Refund Policy
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={(e) => handleLegalClick(e, "contact")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Grievance Officer
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
