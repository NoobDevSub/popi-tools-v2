/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { encryptStorageValue, decryptStorageValue } from "../lib/crypto";

export type SubscriptionPlanId = "free" | "weekly" | "monthly" | "yearly";
export type SubscriptionTier = "FREE" | "PREMIUM";

export interface PricingPlan {
  id: SubscriptionPlanId;
  name: string;
  tagline: string;
  priceInr: number;
  durationDays: number;
  tier: SubscriptionTier;
  popular?: boolean;
  bestValue?: boolean;
  features: string[];
}

export interface SubscriptionStatus {
  userId: string;
  planId: SubscriptionPlanId;
  tier: SubscriptionTier;
  status: "ACTIVE" | "EXPIRED" | "NONE";
  activatedAt?: number;
  expiresAt: number;
  daysRemaining: number;
  orderId?: string;
  utr?: string;
  autoRenew: boolean;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  planId: SubscriptionPlanId;
  amount: number;
  currency: string;
  qrUrl?: string;
  checkoutUrl?: string;
  upiId?: string;
  upiIntent?: string;
  expiresAtIst?: string;
  status: string;
  message?: string;
}

export interface VerifyOrderResponse {
  success: boolean;
  verified: boolean;
  orderId: string;
  status: string;
  utr?: string;
  subscription?: SubscriptionStatus;
  message?: string;
}

export interface CheckStatusResponse {
  isPaid: boolean;
  status: string;
  utr?: string;
  subscription?: SubscriptionStatus;
  message?: string;
}

export const SUBSCRIPTION_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free Explorer",
    tagline: "Essential companion access with weekly script quota",
    priceInr: 0,
    durationDays: 3650,
    tier: "FREE",
    features: [
      "Maximum script uploads: 4 per week",
      "Live 30s & 1m result channels",
      "Standard POPI AI companion moods",
      "Realtime Lounge community access",
      "1 Developer API Key",
    ],
  },
  {
    id: "weekly",
    name: "Weekly Pass",
    tagline: "Flexible short-term tactical gaming analytical pass",
    priceInr: 199,
    durationDays: 7,
    tier: "PREMIUM",
    features: [
      "50 script uploads per week",
      "7 Days full analytical access",
      "100-round historical rolling window",
      "Streak & parity distribution charts",
      "Up to 3 Active API Keys",
    ],
  },
  {
    id: "monthly",
    name: "Monthly VIP",
    tagline: "Uncapped access to 100-round windows & streak metrics",
    priceInr: 499,
    durationDays: 30,
    tier: "PREMIUM",
    popular: true,
    features: [
      "300 script uploads per week",
      "30 Days VIP gaming suite clearance",
      "Full 100+ rounds rolling sample analysis",
      "All 38+ interactive POPI companion moods",
      "Up to 10 Active API Keys",
      "Priority Indian support desk assistance",
    ],
  },
  {
    id: "yearly",
    name: "Yearly Elite",
    tagline: "Maximum value for serious analytical gamers",
    priceInr: 5999,
    durationDays: 365,
    tier: "PREMIUM",
    bestValue: true,
    features: [
      "Unlimited script uploads (9999/wk)",
      "365 Days complete VIP clearance",
      "All future tool releases & analytical upgrades",
      "Unlimited Production API Keys",
      "Dedicated VIP support desk access",
      "Exclusive gamer badge in community",
    ],
  },
];

/**
 * Fetches real subscription plans and prices from the server / database.
 */
export async function fetchLiveDatabasePlans(): Promise<PricingPlan[]> {
  try {
    const res = await fetch("/api/subscriptions/plans");
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.plans) && data.plans.length > 0) {
        return data.plans;
      }
    }
  } catch (err) {
    console.warn("Could not fetch server plans, using fallback defaults:", err);
  }
  return SUBSCRIPTION_PLANS;
}

/**
 * Fetch current user subscription status from the secure backend
 */
export async function fetchUserSubscription(
  userId: string,
): Promise<SubscriptionStatus> {
  try {
    const res = await fetch(
      `/api/subscriptions/status?userId=${encodeURIComponent(userId)}`,
    );
    if (!res.ok) {
      throw new Error(`Failed to load subscription: ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("Falling back to local subscription state:", err);
    const saved = localStorage.getItem(`popi_sub_${userId}`);
    if (saved) {
      try {
        const parsed = decryptStorageValue<any>(saved, null);
        if (parsed && parsed.expiresAt > Date.now()) {
          return parsed;
        }
      } catch {}
    }

    return {
      userId,
      planId: "free",
      tier: "FREE",
      status: "NONE",
      expiresAt: 0,
      daysRemaining: 0,
      autoRenew: false,
    };
  }
}

/**
 * Initiates an order via the secure backend API route
 * Calls FAM Gateway server-side (never exposes FAM key to client)
 */
export async function createCheckoutOrder(params: {
  planId: SubscriptionPlanId;
  userId: string;
  email?: string;
  name?: string;
}): Promise<CreateOrderResponse> {
  const res = await fetch("/api/payments/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(
      errBody.error || errBody.message || "Failed to initialize payment gateway order",
    );
  }

  return await res.json();
}

/**
 * Verifies payment via the secure backend by checking real FamGateway status
 */
export async function verifyPaymentOrder(params: {
  orderId: string;
  userId: string;
}): Promise<VerifyOrderResponse> {
  const res = await fetch("/api/payments/verify-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data: VerifyOrderResponse = await res.json().catch(() => ({
    success: false,
    verified: false,
    orderId: params.orderId,
    status: "ERROR",
    message: "Failed to parse verification response from server",
  }));

  if (data.verified && data.subscription && params.userId) {
    localStorage.setItem(
      `popi_sub_${params.userId}`,
      encryptStorageValue(data.subscription),
    );
  }

  return data;
}

/**
 * Polls real-time checkout status from FamGateway via our backend
 */
export async function pollOrderStatus(
  orderId: string,
  userId: string,
): Promise<CheckStatusResponse> {
  try {
    const res = await fetch(
      `/api/payments/check-status?orderId=${encodeURIComponent(orderId)}&userId=${encodeURIComponent(userId)}`,
    );
    if (!res.ok) {
      return { isPaid: false, status: "pending" };
    }
    const data: CheckStatusResponse = await res.json();
    if (data.isPaid && data.subscription && userId) {
      localStorage.setItem(
        `popi_sub_${userId}`,
        encryptStorageValue(data.subscription),
      );
    }
    return data;
  } catch (err) {
    return { isPaid: false, status: "pending" };
  }
}
