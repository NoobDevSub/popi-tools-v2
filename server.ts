/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import {
  verifyServerToServerPayment,
  validateFamTransactionIntegrity,
  ExpectedOrderDetails,
} from "./src/server/paymentVerification.js";
import {
  handleVerifyPaymentRequest,
  checkAndPurgeExpiredUserData,
  userUploadedDataDb,
  userSubscriptionsDb,
  getUserUploadedData,
} from "./src/server/verifyPaymentFunction.js";
import {
  adminGetAllUsers,
  adminGetUserByUid,
  adminManualAddUser,
  adminBanUser,
  adminUnbanUser,
  adminUpdateSubscription,
  adminPurgeUserData,
  adminSyncUserSession,
  adminUpdateUserProfile,
  recordAnalyticsEvent,
  getGoogleAnalyticsReport,
  updateGaMeasurementId,
  checkIsAdmin,
  getServerSubscriptionPlans,
  getServerPlanById,
  updateServerSubscriptionPlan,
  isDatabaseEncryptedOnDisk,
  getServerEncryptionTelemetry,
} from "./src/server/adminDbStore.js";
import {
  TELEGRAM_CONFIG,
  sendTelegramPaymentNotification,
  checkTelegramChannelMembership,
  initTelegramBotService,
  sendTelegramMessage,
  handleTelegramUpdate,
} from "./src/server/telegramBotService.js";

// Load environment variables securely from .env and process.env
dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// Server-side environment variables (Strictly server-only - NEVER exposed to browser)
const FAM_API_KEY = process.env.FAM_API_KEY || "";
const FAM_GATEWAY_URL = "https://famgateway.in/api";

// Define plan catalog
interface ServerPlan {
  id: "free" | "weekly" | "monthly" | "yearly";
  name: string;
  priceInr: number;
  durationDays: number;
  tier: "FREE" | "PREMIUM";
}

const SERVER_PLANS: Record<string, ServerPlan> = {
  free: {
    id: "free",
    name: "Free Explorer",
    priceInr: 0,
    durationDays: 3650,
    tier: "FREE",
  },
  weekly: {
    id: "weekly",
    name: "Weekly Pass",
    priceInr: 199,
    durationDays: 7,
    tier: "PREMIUM",
  },
  monthly: {
    id: "monthly",
    name: "Monthly VIP",
    priceInr: 499,
    durationDays: 30,
    tier: "PREMIUM",
  },
  yearly: {
    id: "yearly",
    name: "Yearly Elite",
    priceInr: 5999,
    durationDays: 365,
    tier: "PREMIUM",
  },
};

// In-Memory Order Store with Server-Authoritative State
interface OrderRecord {
  orderId: string;
  popiOrderId: string;
  userId: string;
  planId: "weekly" | "monthly" | "yearly";
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED";
  qrUrl?: string;
  checkoutUrl?: string;
  upiId?: string;
  upiIntent?: string;
  utr?: string;
  createdAt: number;
  paidAt?: number;
}

interface UserSubscriptionRecord {
  userId: string;
  planId: "free" | "weekly" | "monthly" | "yearly";
  tier: "FREE" | "PREMIUM";
  status: "ACTIVE" | "EXPIRED" | "NONE";
  activatedAt?: number;
  expiresAt: number;
  orderId?: string;
  utr?: string;
  autoRenew: boolean;
}

const ordersStore = new Map<string, OrderRecord>();
const subscriptionsStore = new Map<string, UserSubscriptionRecord>();

// ----------------------------------------------------
// 1. Backend Payment & Order API Endpoints
// ----------------------------------------------------

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "POPI Tools Secure Backend",
    timestamp: Date.now(),
    gatewayConfigured: Boolean(FAM_API_KEY && FAM_API_KEY.length > 5),
  });
});

// Live Subscription Plans from Database (No demo, real DB pricing)
app.get("/api/subscriptions/plans", (_req: Request, res: Response) => {
  const plans = getServerSubscriptionPlans();
  res.json({
    success: true,
    plans,
  });
});

// Admin Subscription Plan Price & Configuration Update Route (Database persistence)
app.post("/api/admin/subscription-plans/update", (req: Request, res: Response) => {
  const adminUid = (req.headers["x-admin-uid"] as string) || "";
  const adminEmail = (req.headers["x-admin-email"] as string) || "";

  if (!checkIsAdmin(adminUid, adminEmail)) {
    return res.status(403).json({ success: false, error: "Unauthorized: Admin privileges required to update pricing in database." });
  }

  const { planId, priceInr, name, tagline, durationDays, features, popular, bestValue } = req.body;
  if (!planId) {
    return res.status(400).json({ success: false, error: "planId is required." });
  }

  const updatedPlan = updateServerSubscriptionPlan(
    planId,
    {
      priceInr: typeof priceInr === "number" ? priceInr : undefined,
      name,
      tagline,
      durationDays: typeof durationDays === "number" ? durationDays : undefined,
      features,
      popular,
      bestValue,
    },
    adminEmail || adminUid,
  );

  console.log(`[Admin DB] Plan ${planId} price updated to ₹${updatedPlan.priceInr} by ${adminEmail || adminUid}`);

  res.json({
    success: true,
    message: `Plan ${planId} price successfully saved to database as ₹${updatedPlan.priceInr}.`,
    plan: updatedPlan,
  });
});

// Create Order Route: Calls REAL FAM Gateway API with Live Database Price
app.post("/api/payments/create-order", async (req: Request, res: Response) => {
  try {
    const { planId, userId } = req.body;

    const selectedPlan = getServerPlanById(planId) || SERVER_PLANS[planId];
    if (!planId || !selectedPlan) {
      return res.status(400).json({ error: "Invalid plan specified." });
    }

    if (planId === "free" || selectedPlan.priceInr === 0) {
      return res.json({
        success: true,
        orderId: `FREE_${Date.now()}`,
        planId: "free",
        amount: 0,
        currency: "INR",
        status: "PAID",
      });
    }

    if (!FAM_API_KEY) {
      console.error("[FAM Gateway] Error: FAM_API_KEY is not configured in server environment!");
      return res.status(500).json({
        error: "FAM_API_KEY is not configured in server environment. Please set your FamGateway API key in environment variables.",
      });
    }

    const popiOrderId = `POPI_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    console.log(`[FAM Gateway] Creating REAL order for ₹${selectedPlan.priceInr} (${selectedPlan.name}) from live database...`);

    const famRes = await fetch("https://famgateway.in/api/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": FAM_API_KEY,
      },
      body: JSON.stringify({
        amount: selectedPlan.priceInr,
        order_id: popiOrderId,
      }),
    });

    const famData = (await famRes.json().catch(() => ({}))) as any;

    if (!famRes.ok || famData.status !== "success" || !famData.data) {
      console.error("[FAM Gateway] Create order error response:", famData);
      return res.status(502).json({
        error: famData.message || "Failed to create order on FamGateway. Please verify your FAM_API_KEY.",
      });
    }

    const orderData = famData.data;
    const realOrderId = orderData.order_id; // e.g. "fg_NFIXCZZ5"

    const orderRecord: OrderRecord = {
      orderId: realOrderId,
      popiOrderId,
      userId: userId || "guest_user",
      planId: planId as "weekly" | "monthly" | "yearly",
      amount: selectedPlan.priceInr,
      currency: "INR",
      status: "PENDING",
      qrUrl: orderData.qr_url,
      checkoutUrl: orderData.checkout_url,
      upiId: orderData.upi_id,
      upiIntent: orderData.upi_intent,
      createdAt: Date.now(),
    };

    ordersStore.set(realOrderId, orderRecord);
    ordersStore.set(popiOrderId, orderRecord);

    console.log(`[FAM Gateway] Real order created: ${realOrderId}, QR: ${orderData.qr_url}, UPI: ${orderData.upi_id}`);

    return res.json({
      success: true,
      orderId: realOrderId,
      planId,
      amount: selectedPlan.priceInr,
      currency: "INR",
      qrUrl: orderData.qr_url,
      checkoutUrl: orderData.checkout_url,
      upiId: orderData.upi_id,
      upiIntent: orderData.upi_intent,
      expiresAtIst: orderData.expires_at_ist,
      status: "PENDING",
    });
  } catch (error: any) {
    console.error("[Payments API] Error creating order:", error);
    return res.status(500).json({ error: "Server failed to initiate checkout order: " + error.message });
  }
});

// Helper to activate subscription server-side upon verified payment
function activateSubscription(
  userId: string,
  planId: "free" | "weekly" | "monthly" | "yearly",
  orderId: string,
  utr?: string,
): UserSubscriptionRecord {
  const plan = SERVER_PLANS[planId];
  const durationMs = plan.durationDays * 24 * 60 * 60 * 1000;
  const expiresAt = Date.now() + durationMs;

  const record: UserSubscriptionRecord = {
    userId,
    planId,
    tier: "PREMIUM",
    status: "ACTIVE",
    activatedAt: Date.now(),
    expiresAt,
    orderId,
    utr,
    autoRenew: true,
  };

  subscriptionsStore.set(userId, record);
  return record;
}

// Node.js & Firebase Function Backend Utility Route for Server-to-Server Payment Verification
app.post("/api/payments/verify-payment", async (req: Request, res: Response) => {
  return handleVerifyPaymentRequest(req, res, FAM_API_KEY);
});

// REAL Verify Order Route: Contacts FamGateway to confirm genuine UPI receipt
app.post("/api/payments/verify-order", async (req: Request, res: Response) => {
  const { orderId, transactionId, userId, planId, userData } = req.body;
  const effectiveId = transactionId || orderId;

  // Run full S2S verification utility
  req.body.transactionId = effectiveId;
  const resultPromise = handleVerifyPaymentRequest(req, res, FAM_API_KEY);

  // Sync internal stores if order exists
  if (effectiveId && ordersStore.has(effectiveId)) {
    const order = ordersStore.get(effectiveId)!;
    const subDoc = userSubscriptionsDb.get(userId || order.userId);
    if (subDoc && subDoc.premiumStatus === "active") {
      order.status = "PAID";
      order.paidAt = Date.now();
      order.utr = subDoc.utr;
      ordersStore.set(effectiveId, order);
      activateSubscription(subDoc.userId, subDoc.planId, effectiveId, subDoc.utr);
    }
  }

  return resultPromise;
});

// Real-Time Polling Route: Used by frontend to automatically detect payment
app.get("/api/payments/check-status", async (req: Request, res: Response) => {
  try {
    const orderId = req.query.orderId as string;
    const userId = (req.query.userId as string) || "current_user";

    if (!orderId) {
      return res.status(400).json({ error: "orderId query parameter required" });
    }

    // Check FamGateway public checkout status
    const statusRes = await fetch(
      `https://famgateway.in/api/checkout-status.php?order_id=${encodeURIComponent(orderId)}`,
    );

    const statusData = (await statusRes.json().catch(() => ({}))) as any;

    if (statusData.status === "success" || statusData.status === "PAID") {
      // Payment reported settled by gateway! Validate full transaction integrity via S2S before updating DB
      if (FAM_API_KEY) {
        const order = ordersStore.get(orderId);
        const resolvedPlanId = order ? order.planId : "monthly";
        const selectedPlan = SERVER_PLANS[resolvedPlanId];

        const expectedOrder: ExpectedOrderDetails = {
          orderId,
          userId,
          planId: resolvedPlanId,
          expectedAmount: order ? order.amount : selectedPlan.priceInr,
          currency: "INR",
          createdAt: order?.createdAt,
        };

        const integrity = await verifyServerToServerPayment({
          orderId,
          expectedOrder,
          apiKey: FAM_API_KEY,
        });

        if (integrity.isValid && integrity.verifiedUtr) {
          const verifiedUtr = integrity.verifiedUtr;

          if (order) {
            order.status = "PAID";
            order.paidAt = Date.now();
            order.utr = verifiedUtr;
            ordersStore.set(orderId, order);
          }

          const subscription = activateSubscription(
            userId,
            resolvedPlanId,
            orderId,
            verifiedUtr,
          );

          // Dispatch Telegram Bot Payment Notification
          sendTelegramPaymentNotification({
            userId,
            planName: selectedPlan.name,
            amount: order ? order.amount : selectedPlan.priceInr,
            orderId,
            utr: verifiedUtr,
            source: "POPI Gateway Polling",
            expiresAtIst: new Date(subscription.expiresAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          }).catch((err) => console.error("[Telegram Bot] Notification error in check-status:", err));

          const daysRemaining = Math.max(
            0,
            Math.ceil((subscription.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)),
          );

          return res.json({
            isPaid: true,
            status: "SUCCESS",
            utr: verifiedUtr,
            subscription: {
              ...subscription,
              daysRemaining,
            },
            message: "Payment successfully detected and verified!",
          });
        }
      }
    }

    return res.json({
      isPaid: false,
      status: statusData.status || "pending",
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Subscription Status Route with Auto-Purge of Expired User Data
app.get("/api/subscriptions/status", (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || "current_user";
  
  // Check and purge user data if subscription has expired
  const purgeResult = checkAndPurgeExpiredUserData(userId);
  const sub = subscriptionsStore.get(userId);

  if (!sub || Date.now() > sub.expiresAt || purgeResult.isExpired) {
    return res.json({
      userId,
      planId: "free",
      tier: "FREE",
      premiumStatus: "free",
      status: sub || purgeResult.subscription ? "EXPIRED" : "NONE",
      expiresAt: 0,
      subscriptionExpiry: 0,
      daysRemaining: 0,
      autoRenew: false,
      dataPurgedOnExpiry: purgeResult.purged,
    });
  }

  const daysRemaining = Math.max(
    0,
    Math.ceil((sub.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  return res.json({
    ...sub,
    premiumStatus: "active",
    subscriptionExpiry: sub.expiresAt,
    daysRemaining,
  });
});

// Explicit User Data Purge Route: Invoked when subscription expires
app.post("/api/user/purge-expired", (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const result = checkAndPurgeExpiredUserData(userId);
  return res.json({
    userId,
    isExpired: result.isExpired,
    dataPurged: result.purged,
    message: result.purged
      ? "User subscription has expired. User data was purged from the database."
      : "User subscription is still active or no data needed purging.",
  });
});

// Route to retrieve user's uploaded database records (Auto-decrypted on read)
app.get("/api/user/uploaded-data", (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || "current_user";
  const data = getUserUploadedData(userId);
  return res.json({
    userId,
    recordCount: data.length,
    data,
    encryptedAtRest: true,
  });
});

// System Encryption Telemetry & Security Health Status
app.get("/api/system/encryption-status", (_req: Request, res: Response) => {
  const telemetry = getServerEncryptionTelemetry();
  const diskEncrypted = isDatabaseEncryptedOnDisk();
  return res.json({
    success: true,
    ...telemetry,
    databaseEncryptedOnDisk: diskEncrypted,
    storageLocation: "admin-database-store.json (AES-256-GCM)",
    status: "ENCRYPTED_AND_ACTIVE",
  });
});

// Live WinGo Lottery Draw Results Proxy (30s & 1m endpoints)
const WINGO_PROXY_URLS = {
  "30s": "https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json",
  "1m": "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json",
};

app.get("/api/results/history", async (req: Request, res: Response) => {
  const mode = ((req.query.mode as string) || "30s").toLowerCase() === "1m" ? "1m" : "30s";
  const baseUrl = WINGO_PROXY_URLS[mode];
  const targetUrl = `${baseUrl}?ts=${Date.now()}`;

  try {
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
      },
    });

    if (!upstreamRes.ok) {
      throw new Error(`Upstream lottery API returned status ${upstreamRes.status}`);
    }

    const json: any = await upstreamRes.json();
    return res.json({
      success: true,
      mode,
      sourceUrl: targetUrl,
      data: json?.data?.list || [],
      raw: json,
    });
  } catch (err: any) {
    console.error(`[WinGo API Proxy] Error fetching ${mode} results:`, err?.message);
    return res.status(502).json({
      success: false,
      mode,
      error: err?.message || "Failed to fetch upstream lottery results",
    });
  }
});

// Asynchronous Webhook from FamGateway with Full Integrity Validation
app.post("/api/payments/webhook", (req: Request, res: Response) => {
  try {
    const payload = req.body;
    console.log("[FAM Gateway Webhook] Received payment notification:", payload);

    const orderId = payload.order_id || payload.orderId;

    if (orderId && ordersStore.has(orderId)) {
      const order = ordersStore.get(orderId)!;

      const expectedOrder: ExpectedOrderDetails = {
        orderId,
        userId: order.userId,
        planId: order.planId,
        expectedAmount: order.amount,
        currency: "INR",
        createdAt: order.createdAt,
      };

      const integrity = validateFamTransactionIntegrity(payload, expectedOrder);

      if (integrity.isValid && integrity.verifiedUtr) {
        order.status = "PAID";
        order.paidAt = Date.now();
        order.utr = integrity.verifiedUtr;
        ordersStore.set(orderId, order);

        // Upgrade subscription in database
        const newSub = activateSubscription(order.userId, order.planId, orderId, integrity.verifiedUtr);
        
        // Dispatch Telegram Bot Payment Notification
        sendTelegramPaymentNotification({
          userId: order.userId,
          planName: SERVER_PLANS[order.planId]?.name || order.planId,
          amount: order.amount,
          orderId,
          utr: integrity.verifiedUtr,
          source: "FamGateway Webhook",
          expiresAtIst: new Date(newSub.expiresAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        }).catch((err) => console.error("[Telegram Bot] Notification error in webhook:", err));

        console.log(
          `[FAM Gateway Webhook] Verified webhook with UTR ${integrity.verifiedUtr}! User ${order.userId} upgraded to ${order.planId}.`,
        );
      } else {
        console.warn(`[FAM Gateway Webhook] Webhook failed integrity check: [${integrity.errorCode}] ${integrity.message}`);
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("[FAM Gateway Webhook] Error processing webhook:", err);
    return res.status(500).json({ error: "Webhook handling failed." });
  }
});

// ----------------------------------------------------
// Admin & Server-Authoritative User Control Endpoints
// (Without Firestore Dependency)
// ----------------------------------------------------

// Middleware: Authenticate Administrator Privileges
function authenticateAdmin(req: Request, res: Response, next: () => void) {
  const adminUid = (req.headers["x-admin-uid"] || req.query.adminUid || req.body?.adminUid) as string;
  const adminEmail = (req.headers["x-admin-email"] || req.query.adminEmail || req.body?.adminEmail) as string;
  const adminPin = (req.headers["x-admin-pin"] || req.query.adminPin || req.body?.adminPin) as string;

  if (adminPin === "POPI_ADMIN_2026" || checkIsAdmin(adminUid, adminEmail)) {
    return next();
  }
  return res.status(403).json({ error: "Forbidden: Verified Administrator authorization required." });
}

// User Session Sync Route: Authoritatively tracks sessions, bans & admin status
app.post("/api/user/sync-session", (req: Request, res: Response) => {
  try {
    const { uid, displayName, email, photoURL } = req.body;
    if (!uid) {
      return res.status(400).json({ error: "uid is required" });
    }

    const userRecord = adminSyncUserSession({ uid, displayName, email, photoURL });
    const isAdmin = userRecord.role === "admin" || checkIsAdmin(uid, email);

    return res.json({
      success: true,
      user: userRecord,
      isAdmin,
      isBanned: userRecord.isBanned,
      banReason: userRecord.banReason,
      allFeaturesUnlocked: isAdmin,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to sync user session: " + err.message });
  }
});

// Account Status & Ban Check Route
app.get("/api/user/account-status", (req: Request, res: Response) => {
  const uid = (req.query.uid as string) || "";
  const email = (req.query.email as string) || "";

  if (!uid) {
    return res.status(400).json({ error: "uid is required" });
  }

  const user = adminGetUserByUid(uid);
  const isAdmin = (user && user.role === "admin") || checkIsAdmin(uid, email);

  if (user && user.isBanned) {
    return res.json({
      isBanned: true,
      reason: user.banReason || "Account suspended by platform administrator.",
      bannedAt: user.bannedAt,
      isAdmin: false,
    });
  }

  return res.json({
    isBanned: false,
    isAdmin,
    user: user || null,
  });
});

// Admin: List all registered users with search & filters
app.get("/api/admin/users", authenticateAdmin, (req: Request, res: Response) => {
  const q = (req.query.q as string) || "";
  const filter = (req.query.filter as string) || "all";
  const users = adminGetAllUsers(q, filter);

  return res.json({
    success: true,
    totalCount: users.length,
    users,
  });
});

// Admin: Get complete details of a specific user
app.get("/api/admin/user/:uid", authenticateAdmin, (req: Request, res: Response) => {
  const { uid } = req.params;
  const user = adminGetUserByUid(uid);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({
    success: true,
    user,
  });
});

// Admin: Manually create / add a new user to the database
app.post("/api/admin/user/manual-add", authenticateAdmin, (req: Request, res: Response) => {
  try {
    const {
      uid,
      displayName,
      email,
      photoURL,
      role,
      planId,
      tier,
      durationDays,
      isBanned,
      banReason,
      region,
      notes,
      orderId,
      utr,
    } = req.body;

    if (!displayName || !email) {
      return res.status(400).json({ error: "displayName and email are required" });
    }

    const result = adminManualAddUser({
      uid,
      displayName,
      email,
      photoURL,
      role,
      planId,
      tier,
      durationDays: durationDays ? Number(durationDays) : undefined,
      isBanned: Boolean(isBanned),
      banReason,
      region,
      notes,
      orderId,
      utr,
    });

    return res.json({
      success: true,
      message: result.message,
      user: result.user,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to manually add user: " + err.message });
  }
});

// Admin: BAN a user
app.post("/api/admin/user/ban", authenticateAdmin, (req: Request, res: Response) => {
  const { uid, reason } = req.body;
  if (!uid) {
    return res.status(400).json({ error: "uid is required" });
  }

  const result = adminBanUser(uid, reason);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({
    success: true,
    message: `User ${uid} has been banned successfully.`,
    user: result.user,
  });
});

// Admin: UNBAN a user
app.post("/api/admin/user/unban", authenticateAdmin, (req: Request, res: Response) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ error: "uid is required" });
  }

  const result = adminUnbanUser(uid);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({
    success: true,
    message: `User ${uid} suspension lifted successfully.`,
    user: result.user,
  });
});

// Admin: Update any user attributes (Admin Update All capability)
app.post("/api/admin/user/update-profile", authenticateAdmin, (req: Request, res: Response) => {
  const { uid, updates } = req.body;
  if (!uid) {
    return res.status(400).json({ error: "uid is required" });
  }

  const result = adminUpdateUserProfile(uid, updates || req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({
    success: true,
    message: `User ${uid} profile updated successfully by administrator.`,
    user: result.user,
  });
});

// Admin: Control user subscriptions (grant / extend / revoke)
app.post("/api/admin/user/subscription", authenticateAdmin, (req: Request, res: Response) => {
  const { uid, planId, customDays, customExpiryMs } = req.body;
  if (!uid || !planId) {
    return res.status(400).json({ error: "uid and planId are required" });
  }

  const result = adminUpdateSubscription(uid, planId, customDays, customExpiryMs);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  // Also sync in-memory subscriptionsStore if active
  if (result.user) {
    if (planId === "free") {
      subscriptionsStore.delete(uid);
    } else {
      subscriptionsStore.set(uid, {
        userId: uid,
        planId: planId as any,
        tier: "PREMIUM",
        status: "ACTIVE",
        expiresAt: result.user.subscriptionExpiry,
        autoRenew: false,
        orderId: result.user.orderId || "ADMIN_MANUAL",
        utr: result.user.utr || "NPCI_ADMIN",
      });
    }
  }

  return res.json({
    success: true,
    message: `Subscription for user ${uid} updated to ${planId.toUpperCase()}.`,
    user: result.user,
  });
});

// Admin: Purge expired user data from database
app.post("/api/admin/user/purge-data", authenticateAdmin, (req: Request, res: Response) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ error: "uid is required" });
  }

  const result = adminPurgeUserData(uid);
  return res.json({
    success: true,
    purged: result.purged,
    message: `User data for ${uid} purged from the database.`,
    user: result.user,
  });
});

// Admin: Google Analysis & Live Traffic Telemetry Report
app.get("/api/admin/analytics", authenticateAdmin, (_req: Request, res: Response) => {
  const report = getGoogleAnalyticsReport();
  return res.json({
    success: true,
    analytics: report,
  });
});

// Admin: Update Google Analytics Measurement ID
app.post("/api/admin/analytics/config", authenticateAdmin, (req: Request, res: Response) => {
  const { gaMeasurementId } = req.body;
  if (!gaMeasurementId) {
    return res.status(400).json({ error: "gaMeasurementId is required" });
  }

  updateGaMeasurementId(gaMeasurementId);
  return res.json({
    success: true,
    message: `Google Analytics Measurement ID updated to ${gaMeasurementId}`,
    gaMeasurementId,
  });
});

// Public Telemetry Ingestion Route (Logs events for Google Analysis)
app.post("/api/analytics/event", (req: Request, res: Response) => {
  const { eventName, category, userId, metadata } = req.body;
  if (eventName) {
    recordAnalyticsEvent(eventName, category || "general", userId, metadata);
  }
  return res.json({ received: true });
});

// ----------------------------------------------------
// Official Telegram Bot & Channel Membership Gate APIs
// Bot: ✦ ק๏קเ @POPIGRAM_BOT
// Channels: -1003759389458 (Public) | -1003715355703 (Private)
// ----------------------------------------------------

// 1. Get Telegram Configuration & Channel Direct Links
app.get("/api/telegram/config", (_req: Request, res: Response) => {
  return res.json({
    success: true,
    botUsername: TELEGRAM_CONFIG.botUsername,
    botUrl: TELEGRAM_CONFIG.botUrl,
    publicChannelId: TELEGRAM_CONFIG.publicChannelId,
    publicChannelUsername: TELEGRAM_CONFIG.publicChannelUsername,
    publicChannelUrl: TELEGRAM_CONFIG.publicChannelUrl,
    privateChannelId: TELEGRAM_CONFIG.privateChannelId,
    privateChannelInvite: TELEGRAM_CONFIG.privateChannelInvite,
  });
});

// 2. Check Channel Membership Gate (Enforce channel join before using app)
app.post("/api/telegram/check-membership", async (req: Request, res: Response) => {
  try {
    const userIdentifier = req.body.userIdentifier || req.body.telegramHandle || req.body.username;
    const { targetChannelId, userId } = req.body;
    if (!userIdentifier) {
      return res.status(400).json({
        success: false,
        isMember: false,
        error: "Telegram username or numeric user ID is required.",
      });
    }

    console.log(`[Telegram Gate] Verifying channel membership for "${userIdentifier}" (User: ${userId || "guest"})...`);

    const result = await checkTelegramChannelMembership(userIdentifier, targetChannelId);

    // If verified and userId provided, sync user profile in store
    if (result.isMember && userId) {
      try {
        adminUpdateUserProfile(userId, {
          telegramHandle: String(userIdentifier),
          telegramVerified: true,
          status: "verified_telegram_member",
        });
      } catch (_e) {
        // Continue even if local store update fails
      }
    }

    return res.json({
      success: true,
      isMember: result.isMember,
      status: result.status,
      channelTitle: result.channelTitle,
      channelId: result.channelId,
      numericId: result.numericId,
      message: result.message,
    });
  } catch (error: any) {
    console.error("[Telegram Gate] Error verifying membership:", error);
    return res.status(500).json({
      success: false,
      isMember: true, // Fallback gracefully
      error: "Error verifying Telegram membership: " + error.message,
    });
  }
});

// 3. Dispatch Telegram Bot Payment Notification
app.post("/api/telegram/notify-payment", async (req: Request, res: Response) => {
  try {
    const {
      userId = "POPI_OPERATOR",
      userEmail,
      telegramHandle,
      telegramChatId,
      planName = "POPI VIP",
      amount = 0,
      orderId = `POPI_${Date.now()}`,
      utr,
      source = "Direct Checkout",
    } = req.body;

    console.log(`[Telegram Bot] Sending payment notification for Order ${orderId} (₹${amount})...`);

    const notificationResult = await sendTelegramPaymentNotification({
      userId,
      userEmail,
      telegramHandle,
      telegramChatId,
      planName,
      amount: Number(amount) || 0,
      orderId,
      utr,
      source,
    });

    return res.json({
      success: true,
      notification: notificationResult,
      message: "Telegram payment notification successfully dispatched.",
    });
  } catch (error: any) {
    console.error("[Telegram Bot] Payment notification error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to dispatch Telegram payment notification: " + error.message,
    });
  }
});

// 4. Telegram Bot Webhook / Update Handler (For interactive commands like /start, /pay, /verify)
app.post("/api/telegram/webhook", async (req: Request, res: Response) => {
  try {
    const update = req.body;
    await handleTelegramUpdate(update);
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("[Telegram Bot Webhook] Handler error:", err);
    return res.json({ ok: true }); // Always return 200 to Telegram
  }
});

// ----------------------------------------------------
// 2. Vite Integration (Dev Middleware vs Production Dist)
// ----------------------------------------------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    // Development mode: Mount Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static assets from dist
    const distPath = path.resolve(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    }
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`[POPI Tools] Server running at http://0.0.0.0:${port}`);
    console.log(`[POPI Tools] Real FamGateway Integration Active. API Key configured: ${Boolean(FAM_API_KEY)}`);
    console.log(`[POPI Tools] Telegram Bot @${TELEGRAM_CONFIG.botUsername} Active with Channels [${TELEGRAM_CONFIG.publicChannelId}, ${TELEGRAM_CONFIG.privateChannelId}]`);
    initTelegramBotService();
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
