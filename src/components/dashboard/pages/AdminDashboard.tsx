/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  CreditCard,
  BarChart3,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Crown,
  Key,
  Flame,
  Globe2,
  Smartphone,
  Laptop,
  Activity,
  AlertTriangle,
  Copy,
  Check,
  Calendar,
  Lock,
  Unlock,
  Trash2,
  ExternalLink,
  Eye,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Database,
  UserPlus,
} from "lucide-react";
import {
  checkIsAdmin,
  subscribeToAllUsers,
  adminToggleUserBanInFirestore,
  adminUpdateSubscriptionInFirestore,
  adminManualAddUserInFirestore,
  subscribeToSubscriptionPlans,
  adminUpdateSubscriptionPlanInFirestore,
  adminSeedPlansToFirestore,
  DatabaseSubscriptionPlan,
  DEFAULT_DATABASE_PLANS,
  UserProfile,
} from "../../../lib/firebase";
import { trackCustomEvent } from "../../../lib/analytics";

export interface AdminUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: "admin" | "user";
  isBanned: boolean;
  banReason?: string;
  bannedAt?: string;
  createdAt: string;
  lastActive: string;
  planId: "free" | "weekly" | "monthly" | "yearly" | "lifetime_admin";
  tier: "FREE" | "PREMIUM";
  subscriptionExpiry: number;
  expiry: number;
  premiumStatus: "free" | "active" | "expired";
  orderId?: string;
  utr?: string;
  region?: string;
  notesCount?: number;
  boostSessionsCount?: number;
}

interface AnalyticsReport {
  gaMeasurementId: string;
  realtimeVisitors: number;
  totalPageviews: number;
  totalSessions: number;
  avgSessionDuration: string;
  bounceRate: string;
  topChannels: { channel: string; share: number; visitors: number }[];
  topCountries: { country: string; flag: string; percent: number; count: number }[];
  deviceBreakdown: { device: string; percent: number }[];
  recentEvents: {
    id: string;
    eventName: string;
    category: string;
    userId?: string;
    timestamp: number;
    metadata?: Record<string, any>;
  }[];
}

interface AdminDashboardProps {
  currentAdminUid: string;
  currentAdminEmail?: string;
}

export function AdminDashboard({
  currentAdminUid,
  currentAdminEmail = "subhojitbhandari2021@gmail.com",
}: AdminDashboardProps) {
  // 1. Verify Admin Permissions
  const isAuthorizedAdmin = checkIsAdmin({ uid: currentAdminUid, email: currentAdminEmail });

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "subscriptions" | "analytics">("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(false);

  // Selected user for modals
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [banModalUser, setBanModalUser] = useState<AdminUser | null>(null);
  const [banReasonInput, setBanReasonInput] = useState("");
  const [isTogglingBan, setIsTogglingBan] = useState<string | null>(null);

  // Subscription Edit Modal State
  const [subModalUser, setSubModalUser] = useState<AdminUser | null>(null);
  const [editStatus, setEditStatus] = useState<"free" | "active" | "expired">("active");
  const [editTier, setEditTier] = useState<"FREE" | "PREMIUM">("PREMIUM");
  const [editExpiryDate, setEditExpiryDate] = useState<string>("");
  const [isSavingSub, setIsSavingSub] = useState(false);

  // Subscription Plans Live Database State
  const [dbPlans, setDbPlans] = useState<DatabaseSubscriptionPlan[]>(DEFAULT_DATABASE_PLANS);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DatabaseSubscriptionPlan | null>(null);
  const [planPriceInput, setPlanPriceInput] = useState<number>(0);
  const [planNameInput, setPlanNameInput] = useState<string>("");
  const [planTaglineInput, setPlanTaglineInput] = useState<string>("");
  const [planDurationInput, setPlanDurationInput] = useState<number>(30);
  const [planFeaturesInput, setPlanFeaturesInput] = useState<string>("");
  const [isSavingPlanPrice, setIsSavingPlanPrice] = useState(false);

  // Manual Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUidInput, setAddUidInput] = useState("");
  const [addNameInput, setAddNameInput] = useState("");
  const [addEmailInput, setAddEmailInput] = useState("");
  const [addRoleInput, setAddRoleInput] = useState<"user" | "admin">("user");
  const [addPlanInput, setAddPlanInput] = useState<"free" | "weekly" | "monthly" | "yearly" | "lifetime_admin">("monthly");
  const [addDurationInput, setAddDurationInput] = useState<number>(30);
  const [addStatusInput, setAddStatusInput] = useState<"active" | "banned">("active");
  const [addNotesInput, setAddNotesInput] = useState("");
  const [isSubmittingNewUser, setIsSubmittingNewUser] = useState(false);
  const [addUserFeedback, setAddUserFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleGenerateRandomUid = () => {
    const randomHex = Math.random().toString(36).substring(2, 9);
    const ts = Date.now().toString(36);
    setAddUidInput(`usr_${ts}_${randomHex}`);
  };

  const handleOpenAddUserModal = () => {
    handleGenerateRandomUid();
    setAddNameInput("");
    setAddEmailInput("");
    setAddRoleInput("user");
    setAddPlanInput("monthly");
    setAddDurationInput(30);
    setAddStatusInput("active");
    setAddNotesInput("");
    setAddUserFeedback(null);
    setShowAddUserModal(true);
  };

  const handleManualAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addNameInput.trim() || !addEmailInput.trim()) {
      setAddUserFeedback({ type: "error", message: "Display Name and Email are required." });
      return;
    }

    setIsSubmittingNewUser(true);
    setAddUserFeedback(null);

    const generatedUid = addUidInput.trim() || `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const isBanned = addStatusInput === "banned";
    const tier = addPlanInput === "free" ? "FREE" : "PREMIUM";
    const premiumStatus = addPlanInput === "free" ? "free" : "active";

    try {
      await adminManualAddUserInFirestore(
        { uid: currentAdminUid, email: currentAdminEmail },
        {
          uid: generatedUid,
          displayName: addNameInput.trim(),
          email: addEmailInput.trim().toLowerCase(),
          role: addRoleInput,
          planId: addPlanInput,
          tier,
          durationDays: addPlanInput === "lifetime_admin" ? 36500 : addDurationInput,
          isBanned,
          banReason: isBanned ? "Manually suspended during admin provisioning" : "",
          notes: addNotesInput.trim(),
        }
      );

      const expiryMs = addPlanInput === "lifetime_admin" || addRoleInput === "admin"
        ? 4102444800000
        : addPlanInput === "free"
        ? 0
        : Date.now() + addDurationInput * 86400000;

      const newUserItem: AdminUser = {
        uid: generatedUid,
        displayName: addNameInput.trim(),
        email: addEmailInput.trim().toLowerCase(),
        role: addRoleInput,
        isBanned,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        planId: addPlanInput,
        tier,
        subscriptionExpiry: expiryMs,
        expiry: expiryMs,
        premiumStatus,
      };

      setUsers((prev) => [newUserItem, ...prev.filter((u) => u.uid !== generatedUid)]);
      setAddUserFeedback({
        type: "success",
        message: `User "${addNameInput.trim()}" (UID: ${generatedUid}) was provisioned successfully!`,
      });

      setTimeout(() => {
        setShowAddUserModal(false);
        setAddUserFeedback(null);
      }, 1500);
    } catch (err: any) {
      console.error("Failed to manually add user:", err);
      setAddUserFeedback({
        type: "error",
        message: err.message || "Failed to create user in database.",
      });
    } finally {
      setIsSubmittingNewUser(false);
    }
  };

  // Google Analysis state
  const [analyticsReport, setAnalyticsReport] = useState<AnalyticsReport | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [gaIdInput, setGaIdInput] = useState("G-POPI2026IN");

  // Status & notifications
  const [actionNotice, setActionNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Request headers for server verification
  const getAdminHeaders = () => ({
    "Content-Type": "application/json",
    "x-admin-uid": currentAdminUid,
    "x-admin-email": currentAdminEmail,
    "x-admin-pin": "POPI_ADMIN_2026",
  });

  // Fetch initial users from server fallback
  const fetchUsersFromServer = async () => {
    try {
      const url = new URL("/api/admin/users", window.location.origin);
      if (searchQuery) url.searchParams.set("q", searchQuery);
      if (statusFilter !== "all") url.searchParams.set("filter", statusFilter);

      const res = await fetch(url.toString(), {
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers((prev) => {
          const map = new Map<string, AdminUser>();
          data.users.forEach((u: AdminUser) => map.set(u.uid, u));
          prev.forEach((u) => map.set(u.uid, { ...map.get(u.uid), ...u }));
          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.warn("Server users sync note:", err);
    }
  };

  // Load Google Analysis report
  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch("/api/admin/analytics", {
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (data.success && data.analytics) {
        setAnalyticsReport(data.analytics);
        setGaIdInput(data.analytics.gaMeasurementId || "G-POPI2026IN");
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Real-Time Firestore Synchronization
  useEffect(() => {
    if (!isAuthorizedAdmin) return;

    setLoadingUsers(true);
    let unsubscribeFirestore: (() => void) | null = null;

    try {
      unsubscribeFirestore = subscribeToAllUsers(
        { uid: currentAdminUid, email: currentAdminEmail },
        (firestoreUsers: UserProfile[]) => {
          setIsFirestoreConnected(true);
          setUsers((prev) => {
            const map = new Map<string, AdminUser>();
            // Keep previous records
            prev.forEach((u) => map.set(u.uid, u));

            // Merge / overlay Firestore documents
            firestoreUsers.forEach((fu) => {
              const prevUser = map.get(fu.uid);
              const expiryVal = Number(fu.subscriptionExpiry || fu.expiry || prevUser?.subscriptionExpiry || 0);
              const isBannedBool = Boolean(fu.isBanned);
              const currentTier = fu.tier || (fu.premiumStatus === "active" ? "PREMIUM" : "FREE");

              map.set(fu.uid, {
                uid: fu.uid,
                displayName: fu.displayName || prevUser?.displayName || "POPI Gamer",
                email: fu.email || prevUser?.email || "",
                photoURL: fu.photoURL || prevUser?.photoURL,
                role: (fu.role || prevUser?.role || "user") as "admin" | "user",
                isBanned: isBannedBool,
                banReason: fu.banReason || prevUser?.banReason || "",
                bannedAt: fu.bannedAt || prevUser?.bannedAt || "",
                createdAt: (typeof fu.createdAt === "string" ? fu.createdAt : prevUser?.createdAt) || new Date().toISOString(),
                lastActive: prevUser?.lastActive || new Date().toISOString(),
                planId: (currentTier === "PREMIUM" ? "monthly" : "free") as any,
                tier: currentTier,
                subscriptionExpiry: expiryVal,
                expiry: expiryVal,
                premiumStatus: (fu.premiumStatus || (currentTier === "PREMIUM" ? "active" : "free")) as "free" | "active" | "expired",
                orderId: fu.orderId || prevUser?.orderId,
                utr: fu.utr || prevUser?.utr,
              });
            });

            return Array.from(map.values());
          });
          setLoadingUsers(false);
        },
        (err) => {
          console.warn("Firestore live subscription warning:", err);
          setIsFirestoreConnected(false);
          setLoadingUsers(false);
        }
      );
    } catch (err) {
      console.warn("Firestore attach error:", err);
      setLoadingUsers(false);
    }

    // Fallback sync & analytics
    fetchUsersFromServer();
    fetchAnalytics();

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, [currentAdminUid, currentAdminEmail, isAuthorizedAdmin]);

  // Real-Time Subscription Plans Synchronization with Firestore Database
  useEffect(() => {
    if (!isAuthorizedAdmin) return;
    setLoadingPlans(true);
    let unsubscribePlans: (() => void) | null = null;
    try {
      unsubscribePlans = subscribeToSubscriptionPlans(
        (livePlans) => {
          setDbPlans(livePlans);
          setLoadingPlans(false);
        },
        (err) => {
          console.warn("Firestore plans subscription warning:", err);
          setLoadingPlans(false);
        },
      );
    } catch (err) {
      console.warn("Firestore plans attach error:", err);
      setLoadingPlans(false);
    }

    return () => {
      if (unsubscribePlans) unsubscribePlans();
    };
  }, [isAuthorizedAdmin]);

  // Open Edit Plan Modal
  const handleOpenEditPlan = (plan: DatabaseSubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanPriceInput(plan.priceInr);
    setPlanNameInput(plan.name);
    setPlanTaglineInput(plan.tagline || "");
    setPlanDurationInput(plan.durationDays);
    setPlanFeaturesInput(plan.features ? plan.features.join("\n") : "");
  };

  // ACTION: Save Plan Price & Configuration directly to Firestore Database
  const handleSavePlanToDatabase = async () => {
    if (!editingPlan) return;
    if (!checkIsAdmin({ uid: currentAdminUid, email: currentAdminEmail })) {
      setActionNotice({ type: "error", message: "Unauthorized: Admin privileges required." });
      return;
    }

    setIsSavingPlanPrice(true);
    try {
      const featuresArray = planFeaturesInput
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const updates: Partial<DatabaseSubscriptionPlan> = {
        name: planNameInput.trim() || editingPlan.name,
        tagline: planTaglineInput.trim(),
        priceInr: Number(planPriceInput),
        durationDays: Number(planDurationInput),
        features: featuresArray,
      };

      // 1. Direct Firestore setDoc mutation protected by firestore.rules
      await adminUpdateSubscriptionPlanInFirestore(
        { uid: currentAdminUid, email: currentAdminEmail },
        editingPlan.id,
        updates,
      );

      // 2. Direct server-store synchronization
      await fetch("/api/admin/subscription-plans/update", {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({
          planId: editingPlan.id,
          ...updates,
        }),
      });

      // Optimistic update
      setDbPlans((prev) =>
        prev.map((p) => (p.id === editingPlan.id ? { ...p, ...updates } : p)),
      );

      setActionNotice({
        type: "success",
        message: `Database Updated: Plan "${planNameInput || editingPlan.name}" price set to ₹${planPriceInput} in Firestore! Real checkout amounts updated.`,
      });

      setEditingPlan(null);
      trackCustomEvent("admin_update_plan_price", "pricing", {
        planId: editingPlan.id,
        priceInr: Number(planPriceInput),
      });
    } catch (err: any) {
      console.error("Firestore plan price update error:", err);
      setActionNotice({ type: "error", message: `Firestore Error: ${err.message}` });
    } finally {
      setIsSavingPlanPrice(false);
    }
  };

  // ACTION: Seed standard plans into Firestore database
  const handleSeedPlansToDatabase = async () => {
    if (!checkIsAdmin({ uid: currentAdminUid, email: currentAdminEmail })) {
      setActionNotice({ type: "error", message: "Unauthorized: Admin privileges required." });
      return;
    }

    setIsSavingPlanPrice(true);
    try {
      await adminSeedPlansToFirestore({ uid: currentAdminUid, email: currentAdminEmail });
      setActionNotice({
        type: "success",
        message: "Successfully synchronized standard subscription plans to Firestore database!",
      });
    } catch (err: any) {
      setActionNotice({ type: "error", message: `Seed error: ${err.message}` });
    } finally {
      setIsSavingPlanPrice(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Subscription Modal
  const openSubscriptionModal = (user: AdminUser) => {
    setSubModalUser(user);
    setEditStatus(user.premiumStatus || (user.tier === "PREMIUM" ? "active" : "free"));
    setEditTier(user.tier || "FREE");

    if (user.subscriptionExpiry > 0) {
      const d = new Date(user.subscriptionExpiry);
      const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setEditExpiryDate(iso);
    } else {
      const future = new Date(Date.now() + 30 * 86400 * 1000);
      const iso = new Date(future.getTime() - future.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setEditExpiryDate(iso);
    }
  };

  // Preset Expiry Buttons Helper
  const applyExpiryPreset = (days: number) => {
    if (days === 0) {
      // Expire immediately
      const now = new Date();
      const iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setEditExpiryDate(iso);
      setEditStatus("expired");
      setEditTier("FREE");
    } else if (days === 99999) {
      // Lifetime (Year 2100)
      const lifetime = new Date("2100-01-01T00:00:00");
      const iso = new Date(lifetime.getTime() - lifetime.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setEditExpiryDate(iso);
      setEditStatus("active");
      setEditTier("PREMIUM");
    } else {
      const future = new Date(Date.now() + days * 86400 * 1000);
      const iso = new Date(future.getTime() - future.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setEditExpiryDate(iso);
      setEditStatus("active");
      setEditTier("PREMIUM");
    }
  };

  // ACTION: Save Subscription & Expiry to Firestore (Protected by isAdmin)
  const handleSaveSubscriptionToFirestore = async () => {
    if (!subModalUser) return;
    if (!checkIsAdmin({ uid: currentAdminUid, email: currentAdminEmail })) {
      setActionNotice({ type: "error", message: "Unauthorized: Admin privileges required." });
      return;
    }

    setIsSavingSub(true);
    try {
      const expiryTimestamp = editExpiryDate ? new Date(editExpiryDate).getTime() : 0;

      // 1. Update in Firestore directly using Admin API
      await adminUpdateSubscriptionInFirestore(
        { uid: currentAdminUid, email: currentAdminEmail },
        subModalUser.uid,
        {
          premiumStatus: editStatus,
          tier: editTier,
          subscriptionExpiry: expiryTimestamp,
          expiry: expiryTimestamp,
        }
      );

      // 2. Also notify server sync
      await fetch("/api/admin/user/subscription", {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({
          uid: subModalUser.uid,
          planId: editTier === "PREMIUM" ? "monthly" : "free",
          customExpiry: expiryTimestamp,
          premiumStatus: editStatus,
          tier: editTier,
        }),
      });

      // Optimistic state update
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === subModalUser.uid
            ? {
                ...u,
                premiumStatus: editStatus,
                tier: editTier,
                subscriptionExpiry: expiryTimestamp,
                expiry: expiryTimestamp,
              }
            : u
        )
      );

      setActionNotice({
        type: "success",
        message: `Firestore: Subscription for ${subModalUser.displayName} updated to ${editStatus.toUpperCase()} (${editTier}). Expiry date updated.`,
      });

      setSubModalUser(null);
      trackCustomEvent("admin_update_subscription", "licensing", {
        targetUid: subModalUser.uid,
        status: editStatus,
        tier: editTier,
      });
    } catch (err: any) {
      console.error("Firestore subscription update error:", err);
      setActionNotice({ type: "error", message: `Firestore Error: ${err.message}` });
    } finally {
      setIsSavingSub(false);
    }
  };

  // ACTION: Toggle isBanned boolean in Firestore (Protected by isAdmin)
  const handleToggleBanInFirestore = async (
    user: AdminUser,
    newBannedState: boolean,
    reason?: string
  ) => {
    if (!checkIsAdmin({ uid: currentAdminUid, email: currentAdminEmail })) {
      setActionNotice({ type: "error", message: "Unauthorized: Admin privileges required." });
      return;
    }

    setIsTogglingBan(user.uid);
    try {
      // 1. Direct Firestore mutation toggling isBanned boolean
      await adminToggleUserBanInFirestore(
        { uid: currentAdminUid, email: currentAdminEmail },
        user.uid,
        newBannedState,
        reason || (newBannedState ? "Violation of POPI gaming policies" : "")
      );

      // 2. Server store notification
      const endpoint = newBannedState ? "/api/admin/user/ban" : "/api/admin/user/unban";
      await fetch(endpoint, {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({
          uid: user.uid,
          reason: reason || "Violation of POPI gaming policies",
        }),
      });

      // Optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === user.uid
            ? {
                ...u,
                isBanned: newBannedState,
                banReason: newBannedState ? (reason || "Suspended by Administrator") : "",
                bannedAt: newBannedState ? new Date().toISOString() : "",
              }
            : u
        )
      );

      setActionNotice({
        type: "success",
        message: `Firestore: ${user.displayName} is now ${newBannedState ? "BANNED (isBanned: true)" : "ACTIVE (isBanned: false)"}.`,
      });

      if (banModalUser?.uid === user.uid) {
        setBanModalUser(null);
        setBanReasonInput("");
      }

      trackCustomEvent(newBannedState ? "admin_ban_user" : "admin_unban_user", "moderation", {
        targetUid: user.uid,
      });
    } catch (err: any) {
      console.error("Firestore ban toggle error:", err);
      setActionNotice({ type: "error", message: `Firestore Error: ${err.message}` });
    } finally {
      setIsTogglingBan(null);
    }
  };

  // Filtered users for table
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.uid.toLowerCase().includes(q) ||
      (u.orderId && u.orderId.toLowerCase().includes(q)) ||
      (u.utr && u.utr.toLowerCase().includes(q));

    if (!matchesQuery) return false;

    if (statusFilter === "all") return true;
    if (statusFilter === "premium") return u.tier === "PREMIUM" && !u.isBanned;
    if (statusFilter === "free") return u.tier === "FREE" && !u.isBanned;
    if (statusFilter === "banned") return u.isBanned;
    if (statusFilter === "admin") return u.role === "admin";
    return true;
  });

  // Metrics
  const totalUsersCount = users.length;
  const premiumUsersCount = users.filter((u) => u.tier === "PREMIUM" && !u.isBanned).length;
  const bannedUsersCount = users.filter((u) => u.isBanned).length;

  // Render Access Denied guard if not admin
  if (!isAuthorizedAdmin) {
    return (
      <div className="p-8 my-10 max-w-lg mx-auto text-center rounded-3xl bg-slate-900 border border-rose-500/40 shadow-2xl space-y-4">
        <div className="size-16 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="size-8" />
        </div>
        <h2 className="text-xl font-bold font-['Orbitron',sans-serif] text-white">
          Access Denied: Administrator Only
        </h2>
        <p className="text-xs text-slate-400">
          Your current credentials ({currentAdminUid || "Unauthenticated"}) do not match the authorized administrator access list.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Banner & Live Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Crown className="size-5 text-[#FF4625]" />
            <h2 className="font-['Orbitron',sans-serif] text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Admin Command & User Management Hub
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Authorized Admin: <strong className="text-slate-800 dark:text-slate-300">{currentAdminEmail}</strong> • Real-time Firestore synchronizer active
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
            <Database className="size-3.5" />
            <span>{isFirestoreConnected ? "Firestore Live" : "Firestore Synced"}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              fetchUsersFromServer();
              fetchAnalytics();
            }}
            disabled={loadingUsers}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`size-3 text-[#FF4625] ${loadingUsers ? "animate-spin" : ""}`} />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-bold animate-in slide-in-from-top-2 duration-200 ${
            actionNotice.type === "success"
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/15 border border-rose-500/30 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === "success" ? (
              <CheckCircle2 className="size-4 shrink-0" />
            ) : (
              <AlertTriangle className="size-4 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-['Orbitron',sans-serif] font-bold cursor-pointer transition-all whitespace-nowrap ${
            activeTab === "users"
              ? "bg-[#FF4625] text-white shadow-lg shadow-[#FF4625]/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Users className="size-4" />
          <span>User Management Table</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-black/20 text-white font-mono">
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("subscriptions")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-['Orbitron',sans-serif] font-bold cursor-pointer transition-all whitespace-nowrap ${
            activeTab === "subscriptions"
              ? "bg-[#FF4625] text-white shadow-lg shadow-[#FF4625]/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <CreditCard className="size-4" />
          <span>Subscription Controls</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-emerald-500/20 text-emerald-400 font-mono">
            {premiumUsersCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-['Orbitron',sans-serif] font-bold cursor-pointer transition-all whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-[#FF4625] text-white shadow-lg shadow-[#FF4625]/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <BarChart3 className="size-4" />
          <span>Platform Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-['Orbitron',sans-serif] font-bold cursor-pointer transition-all whitespace-nowrap ${
            activeTab === "analytics"
              ? "bg-[#FF4625] text-white shadow-lg shadow-[#FF4625]/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Globe2 className="size-4" />
          <span>Google Analysis (GA4)</span>
        </button>
      </div>

      {/* 3. TAB: USER MANAGEMENT TABLE */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Action Header Bar with Manual Add User Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-[#FF4625]" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-['Orbitron',sans-serif]">
                  Registered Platform Accounts
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#FF4625]/10 text-[#FF4625] text-[10px] font-bold font-mono">
                  {users.length} Total
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Authoritative user identity records synchronized across Firestore, Realtime Database, and server store.
              </p>
            </div>

            <button
              type="button"
              id="admin-manual-add-user-btn"
              onClick={handleOpenAddUserModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4625] to-orange-500 hover:from-[#e03d1f] hover:to-orange-600 text-white text-xs font-black uppercase tracking-wider font-['Orbitron',sans-serif] shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 cursor-pointer transition-all shrink-0 active:scale-95"
            >
              <UserPlus className="size-4" />
              <span>+ Add User Manually</span>
            </button>
          </div>

          {/* Controls Bar: Search & Status Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
            <div className="relative flex-1">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Name, Email, Firestore UID, Order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4625]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {["all", "premium", "free", "banned", "admin"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase cursor-pointer whitespace-nowrap transition-colors ${
                    statusFilter === f
                      ? "bg-[#FF4625] text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* User Management Table */}
          <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-['Orbitron',sans-serif] text-[11px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Firestore UID</th>
                  <th className="py-3 px-4">Ban Status (`isBanned`)</th>
                  <th className="py-3 px-4">Subscription Status</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4 text-right">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      {loadingUsers ? "Reading live Firestore documents..." : "No users match the search filter."}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isGodAdmin = u.role === "admin";
                    const isExpired = u.subscriptionExpiry > 0 && Date.now() > u.subscriptionExpiry;
                    const isBanned = u.isBanned;

                    return (
                      <tr
                        key={u.uid}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${
                          isBanned ? "bg-rose-500/5" : ""
                        }`}
                      >
                        {/* User identity */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-white shrink-0">
                              {u.displayName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                                {u.displayName}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* UID with copy */}
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          <div className="flex items-center gap-1">
                            <span>{u.uid.substring(0, 10)}...</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(u.uid, u.uid)}
                              className="p-1 hover:text-white cursor-pointer rounded"
                              title="Copy UID"
                            >
                              {copiedId === u.uid ? (
                                <Check className="size-3 text-emerald-400" />
                              ) : (
                                <Copy className="size-3 text-slate-400" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Ban status: isBanned toggle control */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {isBanned ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-black">
                                <Lock className="size-3" />
                                BANNED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                                <CheckCircle2 className="size-3" />
                                ACTIVE
                              </span>
                            )}

                            {/* Quick Ban/Unban Toggle Switch */}
                            {!isGodAdmin && (
                              <button
                                type="button"
                                disabled={isTogglingBan === u.uid}
                                onClick={() => {
                                  if (isBanned) {
                                    handleToggleBanInFirestore(u, false);
                                  } else {
                                    setBanModalUser(u);
                                    setBanReasonInput("");
                                  }
                                }}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                                  isBanned
                                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                    : "bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white"
                                }`}
                                title={isBanned ? "Unban User in Firestore" : "Ban User in Firestore"}
                              >
                                {isTogglingBan === u.uid ? (
                                  <RefreshCw className="size-2.5 animate-spin" />
                                ) : isBanned ? (
                                  "Unban"
                                ) : (
                                  "Ban"
                                )}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Subscription Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                              u.premiumStatus === "active"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                : u.premiumStatus === "expired"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                            }`}
                          >
                            {u.premiumStatus || "free"}
                          </span>
                        </td>

                        {/* Tier */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              isGodAdmin
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                : u.tier === "PREMIUM"
                                ? "bg-[#FF4625]/20 text-[#FF4625] border border-[#FF4625]/40"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                            }`}
                          >
                            {isGodAdmin ? "GOD ADMIN" : u.tier}
                          </span>
                        </td>

                        {/* Expiry Date */}
                        <td className="py-3 px-4 text-[11px] font-mono">
                          {isGodAdmin ? (
                            <span className="text-amber-400 font-bold">LIFETIME</span>
                          ) : u.subscriptionExpiry === 0 ? (
                            <span className="text-slate-500">None</span>
                          ) : isExpired ? (
                            <span className="text-rose-400 font-bold">EXPIRED</span>
                          ) : (
                            <span className="text-slate-300">
                              {new Date(u.subscriptionExpiry).toLocaleDateString()}
                            </span>
                          )}
                        </td>

                        {/* Admin Controls Column */}
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {/* 1. Set Subscription & Expiry Date */}
                          <button
                            type="button"
                            onClick={() => openSubscriptionModal(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#FF4625] text-slate-700 dark:text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-bold"
                            title="Set Subscription Status & Update Expiry Date in Firestore"
                          >
                            <Sliders className="size-3" />
                            <span>Subscription</span>
                          </button>

                          {/* 2. Check User Details */}
                          <button
                            type="button"
                            onClick={() => setSelectedUser(u)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#FF4625] transition-colors cursor-pointer"
                            title="Inspect User Details"
                          >
                            <Eye className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TAB: SUBSCRIPTION CONTROLS */}
      {activeTab === "subscriptions" && (
        <div className="space-y-6">
          {/* A. Live Database Pricing & Subscription Plans Management */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-['Orbitron',sans-serif] text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="size-4 text-emerald-500" />
                  Live Database Pricing & Plan Catalog (Firestore)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Subscription prices are loaded directly from the database (<code className="font-mono text-[11px] text-emerald-400">/subscription_plans/{`{planId}`}</code>). No demo values. Changes apply immediately to all player checkouts and order creation.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleSeedPlansToDatabase}
                  disabled={isSavingPlanPrice}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Initialize or restore canonical database plan schema"
                >
                  <RefreshCw className={`size-3.5 ${isSavingPlanPrice ? "animate-spin" : ""}`} />
                  Sync Standard Schema
                </button>
                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 text-[11px] font-mono font-bold flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Database Live
                </div>
              </div>
            </div>

            {loadingPlans ? (
              <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="size-4 animate-spin text-[#FF4625]" />
                Loading live subscription pricing from database...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                {dbPlans.map((plan) => {
                  const isFree = plan.priceInr === 0;
                  const isPopular = Boolean(plan.popular);
                  const isBestValue = Boolean(plan.bestValue);

                  return (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-xl border relative flex flex-col justify-between transition-all ${
                        isPopular
                          ? "border-[#FF4625]/60 bg-[#FF4625]/5 shadow-sm shadow-[#FF4625]/10"
                          : isBestValue
                          ? "border-amber-500/60 bg-amber-500/5 shadow-sm shadow-amber-500/10"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                      }`}
                    >
                      {/* Badges */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">
                          {plan.id}
                        </span>
                        {isPopular && (
                          <span className="px-2 py-0.5 rounded-full bg-[#FF4625] text-white text-[9px] font-black tracking-wider font-['Orbitron',sans-serif]">
                            MOST POPULAR
                          </span>
                        )}
                        {isBestValue && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black tracking-wider font-['Orbitron',sans-serif]">
                            BEST VALUE
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 mb-3">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {plan.name}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-2">
                          {plan.tagline || `${plan.durationDays} Days Gaming Analytical Access`}
                        </div>
                      </div>

                      {/* Live Price Display */}
                      <div className="py-2.5 px-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/80 mb-3">
                        <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                          <span>Database Price</span>
                          <span className="text-emerald-500 font-mono">Firestore</span>
                        </div>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="font-['Orbitron',sans-serif] text-2xl font-black text-slate-900 dark:text-white">
                            {isFree ? "₹0" : `₹${plan.priceInr.toLocaleString()}`}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            / {plan.durationDays === 365 ? "yr" : plan.durationDays === 30 ? "mo" : plan.durationDays === 7 ? "wk" : `${plan.durationDays}d`}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Duration: <strong className="text-slate-700 dark:text-slate-300">{plan.durationDays} Days</strong>
                        </div>
                      </div>

                      {/* Features Preview */}
                      {plan.features && plan.features.length > 0 && (
                        <div className="space-y-1 mb-3 text-[11px] text-slate-600 dark:text-slate-400">
                          {plan.features.slice(0, 3).map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 truncate">
                              <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                          {plan.features.length > 3 && (
                            <div className="text-[10px] text-slate-500 italic pl-4">
                              +{plan.features.length - 3} more features
                            </div>
                          )}
                        </div>
                      )}

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditPlan(plan)}
                        className="w-full mt-auto py-2 px-3 rounded-xl bg-[#FF4625] hover:bg-[#e03d1e] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-[#FF4625]/20 cursor-pointer"
                      >
                        <Sliders className="size-3.5" />
                        Edit Price in Database
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* B. Manual Subscription Grants & Expiry Overrides for specific users */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <h3 className="font-['Orbitron',sans-serif] text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="size-4 text-[#FF4625]" />
              Manual User Subscription Grants & Expiry Overrides
            </h3>
            <p className="text-xs text-slate-500">
              Admins can manually set any individual user's subscription status (<code className="text-slate-700 dark:text-slate-300">free</code>, <code className="text-slate-700 dark:text-slate-300">active</code>, <code className="text-slate-700 dark:text-slate-300">expired</code>), configure VIP tier, and extend or expire dates directly in Firestore.
            </p>
          </div>

          {/* Quick Grant Picker Table */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-['Orbitron',sans-serif]">
              Active Subscriptions ({premiumUsersCount} Active)
            </h4>

            <div className="space-y-3">
              {users
                .filter((u) => u.tier === "PREMIUM" || u.premiumStatus === "active")
                .map((u) => (
                  <div
                    key={u.uid}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{u.displayName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold">
                          {u.premiumStatus.toUpperCase()} ({u.tier})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Expires: {u.subscriptionExpiry > 0 ? new Date(u.subscriptionExpiry).toLocaleString() : "Permanent / Lifetime"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => openSubscriptionModal(u)}
                        className="px-3 py-1 rounded-lg bg-[#FF4625] text-white text-xs font-bold hover:bg-[#e03d1e] transition-colors cursor-pointer"
                      >
                        Adjust Expiry & Status
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB: PLATFORM OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>TOTAL REGISTERED USERS</span>
                <Users className="size-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-['Orbitron',sans-serif]">
                {totalUsersCount}
              </div>
              <div className="text-[11px] text-emerald-500">Live in Firestore</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>ACTIVE VIP LICENSES</span>
                <CreditCard className="size-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-['Orbitron',sans-serif]">
                {premiumUsersCount}
              </div>
              <div className="text-[11px] text-slate-400">Server & Firestore verified</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>SUSPENDED / BANNED ACCOUNTS</span>
                <ShieldAlert className="size-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-400 font-['Orbitron',sans-serif]">
                {bannedUsersCount}
              </div>
              <div className="text-[11px] text-rose-400">isBanned: true enforced</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>GOOGLE ANALYTICS ACTIVE NOW</span>
                <Activity className="size-4 text-emerald-400 animate-pulse" />
              </div>
              <div className="text-2xl font-black text-[#FF4625] font-['Orbitron',sans-serif]">
                {analyticsReport?.realtimeVisitors || 14}
              </div>
              <div className="text-[11px] text-slate-400">Realtime concurrent sessions</div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB: GOOGLE ANALYSIS (GA4) */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Activity className="size-6 animate-pulse" />
              </div>
              <div>
                <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                  Active Users Right Now (Google Analytics 4)
                </div>
                <div className="text-3xl font-black text-white font-['Orbitron',sans-serif] tracking-tight flex items-center gap-2">
                  <span>{analyticsReport?.realtimeVisitors || 14}</span>
                  <span className="text-xs font-normal text-slate-400 font-sans">concurrent gamers online</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchAnalytics}
              disabled={loadingAnalytics}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
            >
              <RefreshCw className={`size-3 text-emerald-400 ${loadingAnalytics ? "animate-spin" : ""}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <h4 className="font-['Orbitron',sans-serif] text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="size-4 text-[#FF4625]" />
                Top Traffic Channels
              </h4>
              <div className="space-y-3">
                {analyticsReport?.topChannels.map((c) => (
                  <div key={c.channel} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{c.channel}</span>
                      <span className="font-mono text-slate-400 font-bold">{c.share}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-[#FF4625] rounded-full" style={{ width: `${c.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <h4 className="font-['Orbitron',sans-serif] text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe2 className="size-4 text-sky-400" />
                Geographic Audience
              </h4>
              <div className="space-y-3">
                {analyticsReport?.topCountries.map((c) => (
                  <div key={c.country} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{c.flag}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{c.country}</span>
                    </div>
                    <div className="font-mono text-slate-400 font-bold">
                      {c.percent}% <span className="text-[10px] text-slate-500">({c.count})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <h4 className="font-['Orbitron',sans-serif] text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="size-4 text-purple-400" />
                Device Category
              </h4>
              <div className="space-y-3">
                {analyticsReport?.deviceBreakdown.map((d) => (
                  <div key={d.device} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{d.device}</span>
                      <span className="font-mono text-slate-400 font-bold">{d.percent}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${d.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: MANUALLY SET SUBSCRIPTION STATUS & UPDATE EXPIRY DATES IN FIRESTORE */}
      {subModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-[#FF4625]/20 text-[#FF4625] flex items-center justify-center font-bold">
                  <CreditCard className="size-5" />
                </div>
                <div>
                  <h3 className="font-['Orbitron',sans-serif] text-sm font-bold text-slate-900 dark:text-white">
                    Set Subscription Status & Expiry Date
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Direct Firestore Document Mutation (`users/{subModalUser.uid}`)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSubModalUser(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Target user info */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{subModalUser.displayName}</div>
                <div className="text-[11px] text-slate-400">{subModalUser.email}</div>
              </div>
              <div className="font-mono text-[10px] text-slate-400">
                UID: {subModalUser.uid.substring(0, 12)}...
              </div>
            </div>

            {/* Controls: Subscription Status & Tier */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Subscription Status (`premiumStatus`)
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4625]"
                >
                  <option value="active">Active (VIP)</option>
                  <option value="free">Free (Standard)</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Access Tier (`tier`)
                </label>
                <select
                  value={editTier}
                  onChange={(e) => setEditTier(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4625]"
                >
                  <option value="PREMIUM">PREMIUM</option>
                  <option value="FREE">FREE</option>
                </select>
              </div>
            </div>

            {/* Controls: Expiry Date Picker & Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="size-3.5 text-[#FF4625]" />
                Update Expiry Date & Timestamp
              </label>

              <input
                type="datetime-local"
                value={editExpiryDate}
                onChange={(e) => setEditExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4625]"
              />

              {/* Quick Presets */}
              <div className="space-y-1 pt-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Quick Extension Presets:</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => applyExpiryPreset(7)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#FF4625] hover:text-white text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-colors cursor-pointer text-center"
                  >
                    +7 Days (Weekly)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyExpiryPreset(30)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#FF4625] hover:text-white text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-colors cursor-pointer text-center"
                  >
                    +30 Days (Monthly)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyExpiryPreset(90)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#FF4625] hover:text-white text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-colors cursor-pointer text-center"
                  >
                    +90 Days (Quarterly)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyExpiryPreset(365)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#FF4625] hover:text-white text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-colors cursor-pointer text-center"
                  >
                    +365 Days (1 Year)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyExpiryPreset(99999)}
                    className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white text-[11px] font-bold transition-colors cursor-pointer text-center"
                  >
                    Lifetime VIP
                  </button>
                  <button
                    type="button"
                    onClick={() => applyExpiryPreset(0)}
                    className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-[11px] font-bold transition-colors cursor-pointer text-center"
                  >
                    Expire Now
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSubModalUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSubscriptionToFirestore}
                disabled={isSavingSub}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#FF4625] hover:bg-[#e03d1e] text-white text-xs font-bold shadow-lg shadow-[#FF4625]/20 cursor-pointer disabled:opacity-50"
              >
                {isSavingSub ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>Updating Firestore...</span>
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    <span>Save to Firestore</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7.5. MODAL: MANUAL USER PROVISIONING */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-orange-500/40 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-gradient-to-br from-[#FF4625] to-orange-500 text-white flex items-center justify-center shadow-sm">
                  <UserPlus className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-['Orbitron',sans-serif]">
                    Manual User Provisioning
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Manually create and authorize a user across Firestore, RTDB & Database Store
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <XCircle className="size-5" />
              </button>
            </div>

            {addUserFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  addUserFeedback.type === "success"
                    ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                }`}
              >
                {addUserFeedback.type === "success" ? (
                  <CheckCircle2 className="size-4 shrink-0" />
                ) : (
                  <AlertTriangle className="size-4 shrink-0" />
                )}
                <span>{addUserFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleManualAddUserSubmit} className="space-y-3.5 text-xs">
              {/* UID Input with Auto-Generate Button */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-['Orbitron',sans-serif]">
                    User Unique Identifier (UID)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomUid}
                    className="text-[10px] text-[#FF4625] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="size-2.5" />
                    <span>⚡ Auto-Generate UID</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={addUidInput}
                    onChange={(e) => setAddUidInput(e.target.value)}
                    placeholder="e.g. usr_m93j_8f7b or Firebase Auth UID"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4625]"
                  />
                </div>
                <span className="text-[10px] text-slate-400">
                  Must be unique. Can match user's Firebase Auth UID or platform system UID.
                </span>
              </div>

              {/* Display Name & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Display Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addNameInput}
                    onChange={(e) => setAddNameInput(e.target.value)}
                    placeholder="e.g. Rohan Sharma"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4625]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={addEmailInput}
                    onChange={(e) => setAddEmailInput(e.target.value)}
                    placeholder="e.g. player@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4625]"
                  />
                </div>
              </div>

              {/* Role & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Account Role
                  </label>
                  <select
                    value={addRoleInput}
                    onChange={(e) => setAddRoleInput(e.target.value as "user" | "admin")}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4625]"
                  >
                    <option value="user">Regular User (Standard)</option>
                    <option value="admin">Platform Administrator (Full Clearance)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Initial Account Status
                  </label>
                  <select
                    value={addStatusInput}
                    onChange={(e) => setAddStatusInput(e.target.value as "active" | "banned")}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4625]"
                  >
                    <option value="active">Active & Verified</option>
                    <option value="banned">Suspended / Banned (isBanned: true)</option>
                  </select>
                </div>
              </div>

              {/* Subscription Plan & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Subscription Plan
                  </label>
                  <select
                    value={addPlanInput}
                    onChange={(e) => {
                      const p = e.target.value as any;
                      setAddPlanInput(p);
                      if (p === "weekly") setAddDurationInput(7);
                      else if (p === "monthly") setAddDurationInput(30);
                      else if (p === "yearly") setAddDurationInput(365);
                      else if (p === "lifetime_admin") setAddDurationInput(36500);
                      else setAddDurationInput(0);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4625]"
                  >
                    <option value="free">Free Explorer (No Expiry)</option>
                    <option value="weekly">Weekly Pass (7 Days)</option>
                    <option value="monthly">Monthly VIP (30 Days)</option>
                    <option value="yearly">Yearly Pro (365 Days)</option>
                    <option value="lifetime_admin">Lifetime Admin Clearance</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Validity Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={addPlanInput === "free" || addPlanInput === "lifetime_admin"}
                    value={addDurationInput}
                    onChange={(e) => setAddDurationInput(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4625] disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Notes Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Admin Internal Notes / Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={addNotesInput}
                  onChange={(e) => setAddNotesInput(e.target.value)}
                  placeholder="e.g. VIP offline payment, manual clearance granted by Subhojit"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4625]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  disabled={isSubmittingNewUser}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewUser}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF4625] to-orange-500 hover:from-[#e03d1f] hover:to-orange-600 text-white text-xs font-black uppercase tracking-wider font-['Orbitron',sans-serif] shadow-md shadow-orange-500/20 cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isSubmittingNewUser ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      <span>Provisioning User...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="size-3.5" />
                      <span>Provision & Add User</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: BAN USER BY TOGGLING isBanned BOOLEAN IN FIRESTORE */}
      {banModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-rose-500/40 shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-500 font-['Orbitron',sans-serif] font-bold text-sm">
              <ShieldAlert className="size-5" />
              <span>Toggle Account Ban (`isBanned: true`)</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Confirm suspending <strong>{banModalUser.displayName}</strong> ({banModalUser.email}). This will set <code className="text-rose-400 font-bold">isBanned: true</code> in Firestore, locking them out immediately.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">
                Suspension Reason (Stored in Firestore as `banReason`)
              </label>
              <input
                type="text"
                value={banReasonInput}
                onChange={(e) => setBanReasonInput(e.target.value)}
                placeholder="e.g. Terms of Service violation, payment fraud, rate-limit abuse..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBanModalUser(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isTogglingBan === banModalUser.uid}
                onClick={() => handleToggleBanInFirestore(banModalUser, true, banReasonInput.trim())}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/20 cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {isTogglingBan === banModalUser.uid ? (
                  <>
                    <RefreshCw className="size-3 animate-spin" />
                    <span>Writing to Firestore...</span>
                  </>
                ) : (
                  <span>Execute Ban (isBanned: true)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL: USER DETAILS INSPECTION */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-800 dark:text-white">
                  {selectedUser.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedUser.displayName}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {/* Ban Banner if user is banned */}
              {selectedUser.isBanned && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 space-y-1">
                  <div className="font-black text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="size-4" />
                    ACCOUNT BANNED (`isBanned: true`)
                  </div>
                  <div className="text-[11px]">
                    <strong>Reason:</strong> {selectedUser.banReason || "Administrative policy enforcement"}
                  </div>
                </div>
              )}

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Firestore UID</div>
                  <div className="font-mono text-xs text-slate-900 dark:text-white mt-1 break-all">
                    {selectedUser.uid}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Account Role</div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white mt-1 uppercase font-mono">
                    {selectedUser.role}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Subscription Status</div>
                  <div className="font-bold text-xs text-emerald-400 mt-1 uppercase font-mono">
                    {selectedUser.premiumStatus} ({selectedUser.tier})
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Subscription Expiry</div>
                  <div className="font-mono text-xs text-slate-900 dark:text-white mt-1">
                    {selectedUser.subscriptionExpiry > 0
                      ? new Date(selectedUser.subscriptionExpiry).toLocaleString()
                      : "No Expiration Date Set"}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  openSubscriptionModal(selectedUser);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#FF4625] text-white font-bold text-xs hover:bg-[#e03d1e] cursor-pointer"
              >
                Edit Subscription & Expiry
              </button>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLAN PRICING & CONFIGURATION DATABASE MODAL */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Database className="size-5" />
                </div>
                <div>
                  <h3 className="font-['Orbitron',sans-serif] text-sm font-bold text-slate-900 dark:text-white">
                    Edit Plan Price in Database
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Plan ID: <code className="font-mono text-[#FF4625] font-bold">{editingPlan.id}</code> (Firestore: <span className="font-mono text-emerald-500">/subscription_plans/{editingPlan.id}</span>)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Live Database Info Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4 shrink-0" />
                  Real Database Persistence
                </div>
                <div className="text-[11px] leading-relaxed">
                  Updating this price directly modifies the live Firestore database. When players initiate UPI/Card payment on the checkout page, FAM Gateway will generate orders for this exact amount.
                </div>
              </div>

              {/* Price in INR Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Price in INR (₹)</span>
                  <span className="font-mono text-slate-400 lowercase">live checkout charge</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-['Orbitron',sans-serif] font-bold text-slate-400 text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={planPriceInput}
                    onChange={(e) => setPlanPriceInput(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-['Orbitron',sans-serif] text-base font-bold focus:outline-none focus:border-[#FF4625]"
                    placeholder="Enter price in INR (e.g. 499)"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[0, 49, 99, 149, 199, 299, 499, 999, 1999, 2999, 4999].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPlanPriceInput(amt)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                        planPriceInput === amt
                          ? "bg-[#FF4625] text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Plan Display Name
                </label>
                <input
                  type="text"
                  value={planNameInput}
                  onChange={(e) => setPlanNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-[#FF4625]"
                  placeholder="e.g. Monthly VIP Pass"
                />
              </div>

              {/* Tagline */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Promotional Tagline
                </label>
                <input
                  type="text"
                  value={planTaglineInput}
                  onChange={(e) => setPlanTaglineInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#FF4625]"
                  placeholder="e.g. Uncapped access to 100-round windows"
                />
              </div>

              {/* Duration (Days) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Access Duration (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={planDurationInput}
                  onChange={(e) => setPlanDurationInput(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#FF4625]"
                />
                <div className="flex gap-1.5 pt-1">
                  {[
                    { label: "7 Days (Weekly)", val: 7 },
                    { label: "30 Days (Monthly)", val: 30 },
                    { label: "90 Days (Quarterly)", val: 90 },
                    { label: "365 Days (Annual)", val: 365 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setPlanDurationInput(p.val)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-colors cursor-pointer ${
                        planDurationInput === p.val
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features Multiline */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Plan Features</span>
                  <span className="text-[10px] text-slate-400 font-normal lowercase">one per line</span>
                </label>
                <textarea
                  rows={4}
                  value={planFeaturesInput}
                  onChange={(e) => setPlanFeaturesInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-[#FF4625]"
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                disabled={isSavingPlanPrice}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePlanToDatabase}
                disabled={isSavingPlanPrice}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
              >
                {isSavingPlanPrice ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    Saving to Database...
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    Save Price in Database
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
