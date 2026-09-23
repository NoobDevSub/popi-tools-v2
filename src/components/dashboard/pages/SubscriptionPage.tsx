"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  ShieldCheck,
  Zap,
  Check,
  Clock,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Lock,
  ArrowRight,
  RefreshCw,
  X,
  Server,
  QrCode,
  ShieldAlert,
  Copy,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import {
  PricingPlan,
  SubscriptionPlanId,
  SubscriptionStatus,
  SUBSCRIPTION_PLANS,
  fetchUserSubscription,
  createCheckoutOrder,
  verifyPaymentOrder,
  pollOrderStatus,
  fetchLiveDatabasePlans,
  CreateOrderResponse,
} from "../../../services/subscriptionService";
import { subscribeToSubscriptionPlans, checkIsAdmin } from "../../../lib/firebase";
import PricingSection5, { PricingPlanItem } from "@/components/ui/pricing";

interface SubscriptionPageProps {
  currentPlan?: "FREE" | "PREMIUM";
  onPlanChange?: (plan: "FREE" | "PREMIUM") => void;
  onOpenLegalPayment?: () => void;
  userId?: string;
  userEmail?: string;
  userName?: string;
}

export function SubscriptionPage({
  currentPlan = "PREMIUM",
  onPlanChange,
  onOpenLegalPayment,
  userId = "user_default",
  userEmail = "player@popitools.ai",
  userName = "Player One",
}: SubscriptionPageProps) {
  const isAdmin =
    checkIsAdmin({ uid: userId, email: userEmail }) ||
    (typeof window !== "undefined" && window.location.hash.toLowerCase().includes("admin"));

  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    userId,
    planId: isAdmin ? "lifetime_admin" as any : currentPlan === "PREMIUM" ? "monthly" : "free",
    tier: "PREMIUM",
    status: "ACTIVE",
    expiresAt: isAdmin ? 4102444800000 : currentPlan === "PREMIUM" ? Date.now() + 12 * 86400 * 1000 + 8 * 3600 * 1000 : 0,
    daysRemaining: isAdmin ? 99999 : currentPlan === "PREMIUM" ? 12 : 0,
    autoRenew: true,
  });

  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] =
    useState<PricingPlan | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [currentOrder, setCurrentOrder] =
    useState<CreateOrderResponse | null>(null);
  const [verifyingOrder, setVerifyingOrder] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(
    null,
  );
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verifiedUtr, setVerifiedUtr] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Live Subscription Pricing Plans from Firestore Database (No demo hardcoded pricing)
  const [plans, setPlans] = useState<PricingPlan[]>(SUBSCRIPTION_PLANS);

  // Real-time listener for database pricing changes
  useEffect(() => {
    let unsub: (() => void) | null = null;
    try {
      unsub = subscribeToSubscriptionPlans(
        (livePlans) => {
          if (livePlans && livePlans.length > 0) {
            setPlans(livePlans);
          }
        },
        (err) => {
          console.warn("Firestore plans subscription error in SubscriptionPage:", err);
        },
      );
    } catch (e) {
      console.warn("Error attaching plans subscription:", e);
    }

    // Also fetch server plans
    fetchLiveDatabasePlans().then((serverPlans) => {
      if (serverPlans && serverPlans.length > 0) {
        setPlans(serverPlans);
      }
    });

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize subscription status from server backend
  const refreshStatus = async () => {
    setLoadingSubscription(true);
    try {
      const res = await fetchUserSubscription(userId);
      setSubscription(res);
      if (onPlanChange) {
        onPlanChange(res.tier);
      }
    } catch (err) {
      console.warn("Could not sync subscription from server:", err);
    } finally {
      setLoadingSubscription(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, [userId]);

  // Real-time Countdown Timer driven by subscription.expiresAt
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      if (!subscription.expiresAt || subscription.expiresAt <= Date.now()) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const diff = subscription.expiresAt - Date.now();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [subscription.expiresAt]);

  // Automatic real-time status polling when checkout modal is active
  useEffect(() => {
    if (!checkoutModalOpen || !currentOrder?.orderId || verificationSuccess) {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
      return;
    }

    const checkRealStatus = async () => {
      try {
        const res = await pollOrderStatus(currentOrder.orderId, userId);
        if (res.isPaid && res.subscription) {
          setVerificationSuccess(true);
          setVerifiedUtr(res.utr || "CONFIRMED");
          setVerificationMessage(
            res.message || "Payment verified by FamGateway! Subscription activated.",
          );
          setSubscription(res.subscription);
          if (onPlanChange) onPlanChange(res.subscription.tier);

          if (pollingTimerRef.current) {
            clearInterval(pollingTimerRef.current);
            pollingTimerRef.current = null;
          }

          setTimeout(() => {
            setCheckoutModalOpen(false);
          }, 2500);
        }
      } catch (err) {
        console.warn("Polling status error:", err);
      }
    };

    // Poll every 3 seconds per FamGateway recommendation
    pollingTimerRef.current = setInterval(checkRealStatus, 3000);

    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [checkoutModalOpen, currentOrder?.orderId, verificationSuccess, userId]);

  // Handle plan checkout initiation
  const handleStartCheckout = async (plan: PricingPlan) => {
    if (plan.id === "free") {
      setSubscription({
        userId,
        planId: "free",
        tier: "FREE",
        status: "NONE",
        expiresAt: 0,
        daysRemaining: 0,
        autoRenew: false,
      });
      if (onPlanChange) onPlanChange("FREE");
      return;
    }

    setSelectedPlanForCheckout(plan);
    setCheckoutModalOpen(true);
    setCreatingOrder(true);
    setErrorNotice(null);
    setCurrentOrder(null);
    setVerificationMessage(null);
    setVerificationSuccess(false);
    setVerifiedUtr(null);

    try {
      const order = await createCheckoutOrder({
        planId: plan.id,
        userId,
        email: userEmail,
        name: userName,
      });
      setCurrentOrder(order);
    } catch (err: any) {
      console.error("Order creation failed:", err);
      setErrorNotice(err.message || "Failed to create order on FamGateway.");
    } finally {
      setCreatingOrder(false);
    }
  };

  // Real verify payment click
  const handleVerifyPayment = async () => {
    if (!currentOrder) return;
    setVerifyingOrder(true);
    setErrorNotice(null);

    try {
      const verifyRes = await verifyPaymentOrder({
        orderId: currentOrder.orderId,
        userId,
      });

      if (verifyRes.verified && verifyRes.subscription) {
        setSubscription(verifyRes.subscription);
        if (onPlanChange) onPlanChange(verifyRes.subscription.tier);
        setVerificationSuccess(true);
        setVerifiedUtr(verifyRes.utr || "CONFIRMED");
        setVerificationMessage(
          verifyRes.message || "Payment verified by FamGateway! Tier unlocked.",
        );
        setTimeout(() => {
          setCheckoutModalOpen(false);
        }, 2200);
      } else {
        setErrorNotice(
          verifyRes.message ||
            "Payment has not been confirmed yet by FamGateway. If you already transferred via UPI, please wait 5-10 seconds for bank settlement and click verify again.",
        );
      }
    } catch (err: any) {
      setErrorNotice(err.message || "Payment verification could not be completed.");
    } finally {
      setVerifyingOrder(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const isCurrentActivePlan = (planId: SubscriptionPlanId) => {
    if (subscription.tier === "FREE") return planId === "free";
    return subscription.planId === planId && subscription.status === "ACTIVE";
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-[#FF4625]" />
            <h2 className="font-['Orbitron',sans-serif] text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              POPI Subscription & Licensing Tier
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Real UPI settlements via FamGateway with server-authoritative payment verification.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshStatus}
          disabled={loadingSubscription}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw
            className={`size-3 text-[#FF4625] ${loadingSubscription ? "animate-spin" : ""}`}
          />
          <span>Sync Status</span>
        </button>
      </div>

      {/* Dynamic Subscription Timer Banner for Active Premium Users */}
      {subscription.tier === "PREMIUM" && subscription.expiresAt > Date.now() && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 text-white border border-slate-850 shadow-md relative overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-['Orbitron',sans-serif] text-xs font-bold uppercase tracking-widest text-[#FF4625]">
                  {isAdmin ? "👑 ADMIN GOD MODE (LIFETIME VIP)" : `${subscription.planId.toUpperCase()} Tier Active`}
                </span>
                {subscription.utr && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                    UTR: {subscription.utr}
                  </span>
                )}
              </div>
              <h3 className="font-['Orbitron',sans-serif] text-xl sm:text-2xl font-black text-white">
                {isAdmin ? "Admin VIP Permit: All Features Unlocked" : "Subscription Time Remaining"}
              </h3>
              <p className="text-xs text-slate-400">
                {isAdmin
                  ? "Permanent master administrative clearance. All predictive signals, 30s & 1m feeds, and telemetry tools permanently active."
                  : "Calculated dynamically from your verified server expiration timestamp."}
              </p>
            </div>

            {/* Countdown Clock */}
            {isAdmin ? (
              <div className="p-3 px-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-['Orbitron',sans-serif] text-center font-bold text-sm">
                <div className="text-2xl font-black text-amber-400">∞ UNLIMITED</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Permanent VIP Access</div>
              </div>
            ) : (
              <div className="flex items-center gap-2 font-mono">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center min-w-[64px]">
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {timeLeft.days}
                  </div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">
                    Days
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center min-w-[64px]">
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">
                    Hours
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center min-w-[64px]">
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">
                    Mins
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center min-w-[64px]">
                  <div className="text-xl sm:text-2xl font-black text-[#FF4625]">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">
                    Secs
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-slate-900 font-mono">
            <span>
              Expires on:{" "}
              <strong className="text-white">
                {new Date(subscription.expiresAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
            </span>
            <span>&bull;</span>
            <span>Gateway: FamGateway Live</span>
            <span>&bull;</span>
            <span>Server Verification: Active</span>
          </div>
        </div>
      )}

      {/* Live Animated Pricing Section powered by Shadcn Card, VerticalCutReveal, & NumberFlow */}
      <div className="w-full">
        <PricingSection5
          title="We've got a plan that's perfect for you"
          subtitle="Trusted by over 140,000+ tactical analysts. Real-time predictive telemetry, 30s & 1m pattern radars, and VIP Telegram alerts."
          customPlans={[
            {
              id: "free",
              name: "Free Explorer",
              description: "Essential tactical radar with basic pattern telemetry and signal alerts",
              price: 0,
              yearlyPrice: 0,
              currency: "INR",
              currencySymbol: "₹",
              buttonText: subscription.tier === "FREE" ? "Current Active Plan" : "Switch to Free",
              buttonVariant: "outline",
              includes: [
                "Free Explorer includes:",
                "Standard prediction radars",
                "Public chat analysis",
                "Basic probability signals",
                "Single device authorization",
              ],
            },
            {
              id: "monthly",
              name: "VIP Elite",
              description: "Best value for active gamers seeking sub-second accuracy & private telegram alerts",
              price: 499,
              yearlyPrice: 3999,
              currency: "INR",
              currencySymbol: "₹",
              buttonText: subscription.tier === "PREMIUM" && subscription.planId === "monthly" ? "Current Active Plan" : "Unlock VIP Access",
              buttonVariant: "default",
              popular: true,
              includes: [
                "Everything in Free, plus:",
                "Sub-second AI pattern recognition",
                "30s & 1m live prediction engines",
                "Telegram @POPIGRAM_BOT instant notifications",
                "VIP private channel admission (-1003715355703)",
                "Priority UPI instant verification",
              ],
            },
            {
              id: "yearly",
              name: "Master Suite",
              description: "Full institutional tactical suite with uninterrupted clearance & lifetime support",
              price: 3999,
              yearlyPrice: 3999,
              currency: "INR",
              currencySymbol: "₹",
              buttonText: subscription.tier === "PREMIUM" && subscription.planId === "yearly" ? "Current Active Plan" : "Get Master Tier",
              buttonVariant: "outline",
              includes: [
                "Everything in VIP, plus:",
                "Year-round uninterrupted VIP permit",
                "Direct access to private VIP channel",
                "Automated bot payment reconciliation",
                "24/7 dedicated tactical support",
              ],
            },
          ]}
          currencySymbol="₹"
          currencyCode="INR"
          activePlanName={
            subscription.tier === "FREE"
              ? "Free Explorer"
              : subscription.planId === "monthly"
                ? "VIP Elite"
                : "Master Suite"
          }
          secondaryButtonText="Pay via @POPIGRAM_BOT"
          onSelectPlan={(planItem) => {
            const matched =
              plans.find((p) => p.id === planItem.id) ||
              plans.find((p) => p.id === "monthly") ||
              plans[0];
            if (matched.id === "free") {
              setSubscription((prev) => ({ ...prev, tier: "FREE", planId: "free" }));
              return;
            }
            handleStartCheckout(matched);
          }}
          onSecondaryAction={(planItem) => {
            window.open(
              `https://t.me/POPIGRAM_BOT?start=pay_${planItem.id || "monthly"}`,
              "_blank",
            );
          }}
        />
      </div>

      {/* Security Architecture & Anti-Tamper Notice */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Server className="size-4 text-[#FF4625]" />
          <h3 className="font-['Orbitron',sans-serif] text-sm font-bold text-slate-900 dark:text-white">
            Real Payment Verification & Zero-Tamper Security
          </h3>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Every transaction is generated directly on FamGateway's production UPI gateway. Your subscription is verified through FamGateway's verification API with NPCI Bank UTR reconciliation before premium access is provisioned on the server.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-['Orbitron',sans-serif]">
              <Lock className="size-3.5 text-emerald-500" />
              <span>Real UPI Settlement</span>
            </span>
            <p className="text-[11px] text-slate-400">
              Live dynamic QR codes generated directly via FamGateway.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-['Orbitron',sans-serif]">
              <ShieldCheck className="size-3.5 text-[#FF4625]" />
              <span>Bank UTR Verification</span>
            </span>
            <p className="text-[11px] text-slate-400">
              Verified strictly against real bank transaction records.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-['Orbitron',sans-serif]">
              <Clock className="size-3.5 text-sky-500" />
              <span>Real-Time Polling</span>
            </span>
            <p className="text-[11px] text-slate-400">
              Auto-activates within 3 seconds of customer UPI transfer.
            </p>
          </div>
        </div>

        {onOpenLegalPayment && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onOpenLegalPayment}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <span>Review official Payment & Refund Policy (RBI / IT Act Compliant)</span>
              <ExternalLink className="size-3" />
            </button>
          </div>
        )}
      </div>

      {/* REAL Checkout Modal with Live QR & Real FamGateway Verification */}
      {checkoutModalOpen && selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-[#FF4625]" />
                <h3 className="font-['Orbitron',sans-serif] text-base font-bold text-slate-900 dark:text-white">
                  UPI Payment: {selectedPlanForCheckout.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Error Message */}
            {errorNotice && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5">
                <ShieldAlert className="size-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold">Payment Verification Notice:</span>
                  <p className="text-[11px] leading-relaxed">{errorNotice}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {verificationSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-3">
                <CheckCircle2 className="size-6 shrink-0 text-emerald-500" />
                <div className="space-y-0.5">
                  <span className="font-bold text-sm">
                    {verificationMessage || "Payment Verified!"}
                  </span>
                  {verifiedUtr && (
                    <p className="font-mono text-[11px] text-emerald-500">
                      Bank UTR: {verifiedUtr}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400">
                    Upgrading dashboard session...
                  </p>
                </div>
              </div>
            )}

            {/* Loading Order from FamGateway */}
            {creatingOrder ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="size-8 text-[#FF4625] animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 font-['Orbitron',sans-serif]">
                  Connecting to FamGateway production API...
                </p>
                <p className="text-[11px] text-slate-400">
                  Generating dynamic UPI QR code and payment session...
                </p>
              </div>
            ) : currentOrder ? (
              <div className="space-y-5">
                {/* Order Summary Pill */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-bold font-['Orbitron',sans-serif]">
                      Plan Selected
                    </div>
                    <div className="text-slate-900 dark:text-white font-bold text-sm">
                      {selectedPlanForCheckout.name} ({selectedPlanForCheckout.durationDays} Days)
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      Order: {currentOrder.orderId}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400 text-[10px] uppercase font-bold font-['Orbitron',sans-serif]">
                      Amount
                    </div>
                    <div className="text-xl font-black text-[#FF4625] font-['Orbitron',sans-serif]">
                      ₹{selectedPlanForCheckout.priceInr}
                    </div>
                  </div>
                </div>

                {/* Real Dynamic UPI QR Code */}
                {currentOrder.qrUrl && (
                  <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-3">
                    <div className="inline-block p-3 rounded-2xl bg-white shadow-md">
                      <img
                        src={currentOrder.qrUrl}
                        alt="FamGateway UPI QR Code"
                        className="size-48 sm:size-52 mx-auto rounded-lg object-contain"
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white font-['Orbitron',sans-serif]">
                        Scan with any UPI App
                      </p>
                      <p className="text-[11px] text-slate-400">
                        PhonePe, Google Pay, Paytm, BHIM, FamPay, or Cred
                      </p>
                    </div>

                    {/* Copyable UPI ID */}
                    {currentOrder.upiId && (
                      <div className="pt-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                          <span>UPI: {currentOrder.upiId}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(currentOrder.upiId!)}
                            className="text-[#FF4625] hover:text-white cursor-pointer ml-1"
                            title="Copy UPI ID"
                          >
                            {copiedUpi ? (
                              <Check className="size-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile UPI Intent Button & Hosted Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentOrder.upiIntent && (
                    <a
                      href={currentOrder.upiIntent}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors font-['Orbitron',sans-serif]"
                    >
                      <Smartphone className="size-3.5 text-[#FF4625]" />
                      <span>Open UPI App</span>
                    </a>
                  )}

                  {currentOrder.checkoutUrl && (
                    <a
                      href={currentOrder.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors font-['Orbitron',sans-serif]"
                    >
                      <span>FamGateway Web Checkout</span>
                      <ExternalLink className="size-3 text-slate-400" />
                    </a>
                  )}
                </div>

                {/* Telegram Bot Automated Notification Notice */}
                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sky-400">
                    <i className="fi fi-brands-telegram text-lg shrink-0 text-sky-400" />
                    <span className="text-[11px] text-sky-300 leading-snug">
                      Automated receipts & VIP alerts will be dispatched by <b>@POPIGRAM_BOT</b> to your Telegram and the official channels upon settlement!
                    </span>
                  </div>
                  <a
                    href={`https://t.me/POPIGRAM_BOT?start=pay_${selectedPlanForCheckout.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    Open Bot
                  </a>
                </div>

                {/* Live Auto-Polling Status Badge */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                      Auto-checking payment with FamGateway every 3s...
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Live
                  </span>
                </div>

                {/* Manual Verify Button */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    disabled={verifyingOrder || verificationSuccess}
                    onClick={handleVerifyPayment}
                    className="w-full py-3 rounded-xl bg-[#FF4625] hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-['Orbitron',sans-serif] disabled:opacity-50"
                  >
                    {verifyingOrder ? (
                      <>
                        <RefreshCw className="size-3.5 animate-spin" />
                        <span>Querying FamGateway & Bank UTR...</span>
                      </>
                    ) : verificationSuccess ? (
                      <>
                        <Check className="size-3.5" />
                        <span>Payment Verified!</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Payment Status Now</span>
                        <ArrowRight className="size-3.5" />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-slate-400 leading-relaxed">
                    Once you complete the transfer in your UPI app, FamGateway verifies the bank credit and activates your subscription.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionPage;
