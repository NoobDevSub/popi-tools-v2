/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const DEFAULT_GA_ID = "G-POPI2026IN";

/**
 * Initializes Google Analytics gtag.js if not already present
 */
export function initGoogleAnalytics(measurementId: string = DEFAULT_GA_ID): void {
  if (typeof window === "undefined") return;

  const activeId = localStorage.getItem("popi_custom_ga_id") || measurementId;

  // Avoid duplicate script injections
  if (document.getElementById("google-analytics-script")) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", activeId, {
    send_page_view: true,
  });

  const script = document.createElement("script");
  script.id = "google-analytics-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${activeId}`;
  document.head.appendChild(script);

  console.log(`[Google Analytics] Initialized with Measurement ID: ${activeId}`);
}

/**
 * Log pageview to Google Analytics and send to server telemetry
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  if (typeof window === "undefined") return;

  try {
    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_path: pagePath,
        page_title: pageTitle || document.title,
      });
    }

    // Also send to backend telemetry
    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: "page_view",
        category: "navigation",
        metadata: { path: pagePath, title: pageTitle },
      }),
    }).catch(() => {});
  } catch (err) {
    console.warn("GA tracking error:", err);
  }
}

/**
 * Track custom event to Google Analytics and backend telemetry
 */
export function trackCustomEvent(
  eventName: string,
  category: string,
  metadata?: Record<string, any>,
): void {
  if (typeof window === "undefined") return;

  try {
    if (window.gtag) {
      window.gtag("event", eventName, {
        event_category: category,
        ...metadata,
      });
    }

    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        category,
        metadata,
      }),
    }).catch(() => {});
  } catch (err) {
    console.warn("GA event tracking error:", err);
  }
}
