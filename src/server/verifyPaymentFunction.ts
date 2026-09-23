/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from "express";
import {
  verifyServerToServerPayment,
  validateFamTransactionIntegrity,
  ExpectedOrderDetails,
  FamGatewayVerifyPayload,
} from "./paymentVerification.js";
import { getServerPlanById } from "./adminDbStore.js";
import { encryptPayload, decryptPayload } from "./crypto.js";
import { sendTelegramPaymentNotification } from "./telegramBotService.js";

/**
 * Plan specifications for calculating duration and access expiry.
 */
export interface SubscriptionPlanDef {
  id: "free" | "weekly" | "monthly" | "yearly";
  name: string;
  priceInr: number;
  durationDays: number;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlanDef> = {
  weekly: {
    id: "weekly",
    name: "Weekly Pro",
    priceInr: 149,
    durationDays: 7,
  },
  monthly: {
    id: "monthly",
    name: "Monthly Elite",
    priceInr: 499,
    durationDays: 30,
  },
  yearly: {
    id: "yearly",
    name: "Annual Legend",
    priceInr: 2999,
    durationDays: 365,
  },
};

/**
 * In-memory persistence stores for subscriptions and user uploaded data.
 * In a production Firebase Cloud Function, this maps directly to Firestore.
 */
export interface UserSubscriptionDoc {
  userId: string;
  premiumStatus: "active" | "expired" | "free";
  tier: "FREE" | "PREMIUM";
  planId: "free" | "weekly" | "monthly" | "yearly";
  subscriptionExpiry: number; // Expiry timestamp in ms
  expiry: number; // Unix timestamp for expiry
  orderId: string;
  utr: string;
  verifiedAt: number;
  uploadedData?: any;
}

// User-specific stores
export const userSubscriptionsDb = new Map<string, UserSubscriptionDoc>();
export const userUploadedDataDb = new Map<string, any[]>();

/**
 * Server-Side Expiry & Data Purge Utility:
 * Checks if a user's subscription has expired.
 * If expired, automatically deletes their uploaded data from the database.
 */
export function checkAndPurgeExpiredUserData(userId: string): {
  isExpired: boolean;
  purged: boolean;
  subscription: UserSubscriptionDoc | null;
} {
  const sub = userSubscriptionsDb.get(userId);

  if (!sub) {
    return { isExpired: true, purged: false, subscription: null };
  }

  const now = Date.now();
  if (now > sub.subscriptionExpiry) {
    console.warn(`[Security Alert] Subscription expired for user ${userId}. Purging user data...`);

    // Purge user's uploaded data from database upon expiration
    userUploadedDataDb.delete(userId);

    // Update status to expired
    sub.premiumStatus = "expired";
    sub.tier = "FREE";
    userSubscriptionsDb.set(userId, sub);

    return { isExpired: true, purged: true, subscription: sub };
  }

  return { isExpired: false, purged: false, subscription: sub };
}

/**
 * Node.js / Firebase Function Backend Utility:
 * Performs server-to-server verification with FAM Gateway API using server-side FAM_API_KEY.
 * Only if verification is strictly successful:
 * 1. Updates Firestore document / database for the specific user with premiumStatus and subscriptionExpiry.
 * 2. Uploads user data to the database upon successful payment.
 * 3. Enforces backend security (locks client-side users from tampering with payment fields).
 */
export async function handleVerifyPaymentRequest(
  req: Request,
  res: Response,
  apiKey: string,
): Promise<Response> {
  try {
    // Receive transaction/order ID and user credentials from client
    const { transactionId, orderId, userId, planId, userData } = req.body;
    const effectiveOrderId = String(transactionId || orderId || "").trim();
    const effectiveUserId = String(userId || "current_user").trim();

    if (!effectiveOrderId) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "transactionId (or orderId) is required from client.",
      });
    }

    if (!effectiveUserId) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "userId is required to associate verified subscription.",
      });
    }

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        verified: false,
        error: "FAM_API_KEY is not configured on server.",
      });
    }

    // Resolve plan configuration dynamically from database
    const resolvedPlanId = (planId as "weekly" | "monthly" | "yearly") || "monthly";
    const livePlan = getServerPlanById(resolvedPlanId);
    const plan = livePlan || SUBSCRIPTION_PLANS[resolvedPlanId] || SUBSCRIPTION_PLANS.monthly;

    const expectedOrder: ExpectedOrderDetails = {
      orderId: effectiveOrderId,
      userId: effectiveUserId,
      planId: plan.id as "weekly" | "monthly" | "yearly",
      expectedAmount: plan.priceInr,
      currency: "INR",
    };

    console.log(
      `[S2S Verification Utility] Initiating server-to-server verification for order: ${effectiveOrderId}, user: ${effectiveUserId}...`,
    );

    // Perform server-to-server verification directly with FAM Gateway API
    const integrityResult = await verifyServerToServerPayment({
      orderId: effectiveOrderId,
      expectedOrder,
      apiKey,
    });

    if (!integrityResult.isValid) {
      console.warn(
        `[S2S Verification Utility] Verification rejected: [${integrityResult.errorCode}] ${integrityResult.message}`,
      );
      return res.status(200).json({
        success: false,
        verified: false,
        premiumStatus: "free",
        orderId: effectiveOrderId,
        errorCode: integrityResult.errorCode,
        status: integrityResult.gatewayResponse?.status || "REJECTED",
        message: integrityResult.message,
      });
    }

    // VERIFICATION SUCCESSFUL!
    const verifiedUtr = integrityResult.verifiedUtr || "CONFIRMED";
    const durationMs = plan.durationDays * 24 * 60 * 60 * 1000;
    const activatedAt = Date.now();
    const subscriptionExpiry = activatedAt + durationMs;

    // 1. Update user document with new premiumStatus and subscriptionExpiry
    const subscriptionDoc: UserSubscriptionDoc = {
      userId: effectiveUserId,
      premiumStatus: "active",
      tier: "PREMIUM",
      planId: plan.id,
      subscriptionExpiry,
      expiry: subscriptionExpiry,
      orderId: effectiveOrderId,
      utr: verifiedUtr,
      verifiedAt: activatedAt,
    };

    // 2. Upload and persist user data in database upon successful payment (Encrypted with AES-256-GCM)
    if (userData) {
      const storedEncrypted = userUploadedDataDb.get(effectiveUserId);
      const existingData = storedEncrypted ? decryptPayload<any[]>(storedEncrypted) : [];
      const updatedData = Array.isArray(userData)
        ? [...existingData, ...userData]
        : [...existingData, userData];
      // Encrypt before saving to database store
      userUploadedDataDb.set(effectiveUserId, encryptPayload(updatedData) as any);
      subscriptionDoc.uploadedData = updatedData;
      console.log(`[Database Upload] User data securely encrypted and stored for user: ${effectiveUserId}`);
    }

    userSubscriptionsDb.set(effectiveUserId, subscriptionDoc);

    // Dispatch Telegram Bot Payment Notification to user & official channels
    sendTelegramPaymentNotification({
      userId: effectiveUserId,
      userEmail: req.body?.email || req.body?.userEmail || effectiveUserId,
      telegramHandle: req.body?.telegramHandle,
      planName: plan.name,
      amount: plan.priceInr,
      orderId: effectiveOrderId,
      utr: verifiedUtr,
      source: "POPI Gateway Verification",
      expiresAtIst: new Date(subscriptionExpiry).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    }).catch((err) => {
      console.error("[Telegram Bot] Notification trigger failed:", err);
    });

    console.log(
      `[S2S Verification Utility] SUCCESS: Premium access granted to user ${effectiveUserId}. Valid until ${new Date(
        subscriptionExpiry,
      ).toISOString()}. Bank UTR: ${verifiedUtr}.`,
    );

    return res.status(200).json({
      success: true,
      verified: true,
      premiumStatus: "active",
      subscriptionExpiry,
      expiry: subscriptionExpiry,
      planId: plan.id,
      planName: plan.name,
      orderId: effectiveOrderId,
      utr: verifiedUtr,
      userDocument: {
        userId: effectiveUserId,
        premiumStatus: "active",
        subscriptionExpiry,
        expiry: subscriptionExpiry,
        tier: "PREMIUM",
        orderId: effectiveOrderId,
        utr: verifiedUtr,
      },
      message: `Server verification successful. Premium status activated with Bank UTR: ${verifiedUtr}.`,
    });
  } catch (error: any) {
    console.error("[S2S Verification Utility] Fatal error during verification:", error);
    return res.status(500).json({
      success: false,
      verified: false,
      error: "Internal server error during verification: " + (error.message || String(error)),
    });
  }
}

/**
 * Safely reads and decrypts user uploaded data from database
 */
export function getUserUploadedData(userId: string): any[] {
  const encrypted = userUploadedDataDb.get(userId);
  if (!encrypted) return [];
  return decryptPayload<any[]>(encrypted);
}

/**
 * Standard Firebase Cloud Function HTTP export signature.
 * Compatible with `exports.verifyPayment = onRequest(...)`
 */
export const verifyPaymentCloudFunction = async (req: any, res: any) => {
  const apiKey = process.env.FAM_API_KEY || "";
  return handleVerifyPaymentRequest(req, res, apiKey);
};
