import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import {
  getDatabase,
  ref as rtdbRef,
  set as rtdbSet,
  push as rtdbPush,
  onValue as rtdbOnValue,
  remove as rtdbRemove,
  type DatabaseReference,
} from "firebase/database";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as updateAuthProfile,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import firebaseConfigData from "../../firebase-applet-config.json";
import {
  encryptDatabaseString,
  decryptDatabaseString,
  encryptDatabasePayload,
  decryptDatabasePayload,
} from "./crypto";

// User's custom Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyC9-eTa8eT2y2dLSQLUFRzBScx2xk80jU0",
  authDomain: "popitools-ffaf4.firebaseapp.com",
  databaseURL: "https://popitools-ffaf4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "popitools-ffaf4",
  storageBucket: "popitools-ffaf4.firebasestorage.app",
  messagingSenderId: "1054415108068",
  appId: "1:1054415108068:web:4ca826f21ef4237f8f79f1",
  measurementId: "G-6SEVYQ12WY",
};

// Initialize Firebase App with user's project
export const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// Cloud Firestore instance
export const db = getFirestore(app);

// Realtime Database instance (RTDB)
export const rtdb = getDatabase(app);

// Initialize Firebase Analytics
export let analytics: any = null;
if (typeof window !== "undefined") {
  isAnalyticsSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log("[Firebase] Analytics connected to popitools-ffaf4");
      }
    })
    .catch(() => {
      // Non-blocking in iframe / unsupported environments
    });
}

export { rtdbRef, rtdbSet, rtdbPush, rtdbOnValue, rtdbRemove };

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Structured Error Handling per Firebase Integration Skill
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial Connection Test per skill requirements
export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("the client is offline")
    ) {
      console.warn("Firebase client is currently offline.");
    }
  }
}

// Data Model Interfaces
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  telegramHandle?: string;
  preferredGames?: string;
  selectedEmotion?: string;
  isBanned?: boolean;
  banReason?: string;
  bannedAt?: string;
  role?: "admin" | "user";
  plan?: string;
  status?: string;
  premiumStatus?: "free" | "active" | "expired";
  subscriptionExpiry?: number;
  expiry?: number;
  tier?: "FREE" | "PREMIUM";
  orderId?: string;
  utr?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export const AUTHORIZED_ADMIN_UIDS = [
  "AvYPl0R4CGZfc0zZQGrrKIiRhuI2",
  "aT1NvMLjfsNi9DgYp4wuJxrGnoQ2",
  "Kcctay6qczLlEwBZNcpk98cuN5u2",
  "TtzyhcKW0NMOCITp4DEsbfrk4h73",
];

export const AUTHORIZED_ADMIN_EMAILS = [
  "subhojitbhandari2021@gmail.com",
  "titnesgamer@gmail.com",
  "mrtitnes@gmail.com",
];

export function checkIsAdmin(user: { uid?: string; email?: string | null } | null): boolean {
  if (!user) return false;
  const uidMatch = user.uid ? AUTHORIZED_ADMIN_UIDS.includes(user.uid) : false;
  const userEmail = (user.email || "").toLowerCase().trim();
  const emailMatch = userEmail ? AUTHORIZED_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === userEmail) : false;
  return uidMatch || emailMatch;
}

export interface GameNote {
  id: string;
  userId: string;
  title: string;
  game: string;
  content: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

// User Profile Sync Helper with Automatic Admin Privileges
export async function syncUserProfileDocument(user: User, fallbackName?: string): Promise<void> {
  const userRef = doc(db, "users", user.uid);
  const isAdmin = checkIsAdmin(user);
  try {
    const snap = await getDoc(userRef);
    const resolvedName = user.displayName || fallbackName || (isAdmin ? "Admin Commander" : "POPI Gamer");
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: resolvedName,
        email: user.email || "",
        photoURL: user.photoURL || "",
        telegramHandle: "",
        preferredGames: "Free Fire, BGMI",
        selectedEmotion: "idle",
        role: isAdmin ? "admin" : "user",
        tier: isAdmin ? "PREMIUM" : "FREE",
        premiumStatus: isAdmin ? "active" : "free",
        subscriptionExpiry: isAdmin ? 4102444800000 : 0,
        expiry: isAdmin ? 4102444800000 : 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const updateData: Record<string, any> = {
        displayName: user.displayName || snap.data().displayName || resolvedName,
        photoURL: user.photoURL || snap.data().photoURL || "",
        updatedAt: serverTimestamp(),
      };
      if (isAdmin) {
        updateData.role = "admin";
        updateData.tier = "PREMIUM";
        updateData.premiumStatus = "active";
        updateData.subscriptionExpiry = 4102444800000;
        updateData.expiry = 4102444800000;
      }
      await updateDoc(userRef, updateData);
    }
  } catch (dbErr) {
    console.warn("Firestore sync note (fallback to memory/server):", dbErr);
  }
}

import {
  signInWithGoogle as rtdbSignInWithGoogle,
  signInWithEmail as rtdbSignInWithEmail,
  signUpWithEmail as rtdbSignUpWithEmail,
  resetPassword as rtdbResetPassword,
  signOutUser as rtdbSignOutUser,
  initializeUserProfile,
} from "./firebase/auth";

// Auth Helpers
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const user = await rtdbSignInWithGoogle();
    await syncUserProfileDocument(user);
    return user;
  } catch (err: unknown) {
    const errorCode = (err as { code?: string })?.code;
    if (
      errorCode === "auth/popup-closed-by-user" ||
      errorCode === "auth/cancelled-popup-request"
    ) {
      console.log("Google Sign-In popup closed by user.");
      return null;
    }
    console.error("Failed to sign in with Google:", err);
    throw err;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const user = await rtdbSignInWithEmail(email, password);
  await syncUserProfileDocument(user);
  return user;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<User> {
  const user = await rtdbSignUpWithEmail(email, password, displayName);
  await syncUserProfileDocument(user, displayName);
  return user;
}

export async function resetPassword(email: string): Promise<void> {
  await rtdbResetPassword(email);
}

export async function signOutUser(): Promise<void> {
  await rtdbSignOutUser();
}

// Firestore operations
export function subscribeToUserProfile(
  userId: string,
  onUpdate: (profile: UserProfile | null) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const userRef = doc(db, "users", userId);
  return onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as UserProfile);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, `users/${userId}`);
      } catch (e) {
        if (onError) onError(e as Error);
      }
    },
  );
}

export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfile>,
): Promise<void> {
  const userRef = doc(db, "users", userId);
  const cleanData: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (data.displayName !== undefined) cleanData.displayName = data.displayName;
  if (data.photoURL !== undefined) cleanData.photoURL = data.photoURL;
  if (data.telegramHandle !== undefined)
    cleanData.telegramHandle = data.telegramHandle;
  if (data.preferredGames !== undefined)
    cleanData.preferredGames = data.preferredGames;
  if (data.selectedEmotion !== undefined)
    cleanData.selectedEmotion = data.selectedEmotion;

  try {
    await updateDoc(userRef, cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}

export function subscribeToGameNotes(
  userId: string,
  onUpdate: (notes: GameNote[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const notesCol = collection(db, "users", userId, "notes");
  return onSnapshot(
    notesCol,
    async (snapshot) => {
      const items: GameNote[] = [];
      for (const d of snapshot.docs) {
        const raw = d.data();
        const decryptedTitle = await decryptDatabaseString(raw.title || "");
        const decryptedContent = await decryptDatabaseString(raw.content || "");
        items.push({
          ...raw,
          title: decryptedTitle,
          content: decryptedContent,
        } as GameNote);
      }
      onUpdate(items);
    },
    (error) => {
      try {
        handleFirestoreError(
          error,
          OperationType.LIST,
          `users/${userId}/notes`,
        );
      } catch (e) {
        if (onError) onError(e as Error);
      }
    },
  );
}

export async function addGameNote(
  userId: string,
  title: string,
  game: string,
  content: string,
): Promise<void> {
  const noteId = "note_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const noteRef = doc(db, "users", userId, "notes", noteId);
  try {
    // Encrypt sensitive note fields before storing in database
    const encryptedTitle = await encryptDatabaseString(title);
    const encryptedContent = await encryptDatabaseString(content);

    await setDoc(noteRef, {
      id: noteId,
      userId,
      title: encryptedTitle,
      game,
      content: encryptedContent,
      isEncrypted: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.CREATE,
      `users/${userId}/notes/${noteId}`,
    );
  }
}

export async function deleteGameNote(
  userId: string,
  noteId: string,
): Promise<void> {
  const noteRef = doc(db, "users", userId, "notes", noteId);
  try {
    await deleteDoc(noteRef);
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.DELETE,
      `users/${userId}/notes/${noteId}`,
    );
  }
}

/**
 * Client wrapper to invoke server-side payment verification utility.
 * Performs server-to-server confirmation with FAM Gateway API using server FAM_API_KEY.
 * On success, updates user's premiumStatus and subscriptionExpiry, and uploads user data.
 */
export async function verifyPaymentWithBackendServer(
  transactionId: string,
  userId: string,
  planId: "weekly" | "monthly" | "yearly" = "monthly",
  userData?: any,
): Promise<{
  success: boolean;
  verified: boolean;
  premiumStatus?: string;
  subscriptionExpiry?: number;
  utr?: string;
  message?: string;
  error?: string;
}> {
  const res = await fetch("/api/payments/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transactionId,
      userId,
      planId,
      userData,
    }),
  });
  return res.json();
}

/**
 * Checks and purges user data if subscription has expired.
 */
export async function checkAndPurgeExpiredUserDataFromBackend(userId: string): Promise<any> {
  const res = await fetch("/api/user/purge-expired", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  return res.json();
}

/**
 * Subscribes to the live Firestore users collection (Admin-protected).
 */
export function subscribeToAllUsers(
  adminUser: { uid: string; email?: string | null },
  onUpdate: (users: UserProfile[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  if (!checkIsAdmin(adminUser)) {
    throw new Error("Access Denied: Administrator clearance required to list user directory.");
  }

  const usersCol = collection(db, "users");
  return onSnapshot(
    usersCol,
    (snapshot) => {
      const usersList: UserProfile[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        usersList.push({
          uid: d.id,
          displayName: data.displayName || "POPI Gamer",
          email: data.email || "",
          photoURL: data.photoURL,
          telegramHandle: data.telegramHandle,
          preferredGames: data.preferredGames,
          selectedEmotion: data.selectedEmotion,
          isBanned: Boolean(data.isBanned),
          banReason: data.banReason || "",
          bannedAt: data.bannedAt || "",
          role: data.role || (AUTHORIZED_ADMIN_UIDS.includes(d.id) ? "admin" : "user"),
          premiumStatus: data.premiumStatus || "free",
          subscriptionExpiry: Number(data.subscriptionExpiry || data.expiry || 0),
          expiry: Number(data.expiry || data.subscriptionExpiry || 0),
          tier: data.tier || (data.premiumStatus === "active" ? "PREMIUM" : "FREE"),
          orderId: data.orderId,
          utr: data.utr,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      onUpdate(usersList);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, "users");
      } catch (e) {
        if (onError) onError(e as Error);
      }
    },
  );
}

/**
 * Admin action: Manually toggle a user's isBanned boolean in Firestore.
 * Strictly protected by client & rule-side isAdmin checks.
 */
export async function adminToggleUserBanInFirestore(
  adminUser: { uid: string; email?: string | null },
  targetUserId: string,
  isBanned: boolean,
  banReason?: string,
): Promise<void> {
  if (!checkIsAdmin(adminUser)) {
    throw new Error("Unauthorized: Action requires confirmed administrator privileges.");
  }

  const userRef = doc(db, "users", targetUserId);
  try {
    await updateDoc(userRef, {
      isBanned,
      banReason: isBanned ? (banReason || "Administrative suspension") : "",
      bannedAt: isBanned ? new Date().toISOString() : "",
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${targetUserId}`);
  }
}

/**
 * Admin action: Manually update user's subscription status & expiry dates in Firestore.
 * Strictly protected by client & rule-side isAdmin checks.
 */
export async function adminUpdateSubscriptionInFirestore(
  adminUser: { uid: string; email?: string | null },
  targetUserId: string,
  params: {
    premiumStatus: "free" | "active" | "expired";
    tier: "FREE" | "PREMIUM";
    subscriptionExpiry: number;
    expiry?: number;
  },
): Promise<void> {
  if (!checkIsAdmin(adminUser)) {
    throw new Error("Unauthorized: Action requires confirmed administrator privileges.");
  }

  const userRef = doc(db, "users", targetUserId);
  try {
    await updateDoc(userRef, {
      premiumStatus: params.premiumStatus,
      tier: params.tier,
      subscriptionExpiry: params.subscriptionExpiry,
      expiry: params.expiry || params.subscriptionExpiry,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${targetUserId}`);
  }
}

/**
 * Admin action: Manually create / provision a new user in Firestore & Realtime Database,
 * and synchronize with the encrypted server-side store.
 * Strictly protected by client & rule-side isAdmin checks.
 */
export async function adminManualAddUserInFirestore(
  adminUser: { uid: string; email?: string | null },
  userData: {
    uid?: string;
    displayName: string;
    email: string;
    photoURL?: string;
    role?: "admin" | "user";
    planId?: "free" | "weekly" | "monthly" | "yearly" | "lifetime_admin";
    tier?: "FREE" | "PREMIUM";
    durationDays?: number;
    isBanned?: boolean;
    banReason?: string;
    region?: string;
    notes?: string;
  },
): Promise<UserProfile> {
  if (!checkIsAdmin(adminUser)) {
    throw new Error("Unauthorized: Action requires confirmed administrator privileges.");
  }

  const cleanUid =
    userData.uid?.trim() ||
    `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  const role = userData.role || "user";
  const planId = userData.planId || "free";
  const isBanned = Boolean(userData.isBanned);

  let tier: "FREE" | "PREMIUM" = userData.tier || (planId === "free" ? "FREE" : "PREMIUM");
  let premiumStatus: "free" | "active" | "expired" =
    planId === "free" ? "free" : "active";

  let subscriptionExpiry = 0;
  if (planId === "lifetime_admin" || role === "admin") {
    tier = "PREMIUM";
    premiumStatus = "active";
    subscriptionExpiry = 4102444800000;
  } else if (planId !== "free") {
    tier = "PREMIUM";
    premiumStatus = "active";
    const days = userData.durationDays || (planId === "weekly" ? 7 : planId === "yearly" ? 365 : 30);
    subscriptionExpiry = Date.now() + days * 86400000;
  }

  const nowIso = new Date().toISOString();
  const userDocData = {
    uid: cleanUid,
    displayName: userData.displayName.trim() || `Player ${cleanUid.substring(0, 6)}`,
    email: userData.email.trim().toLowerCase(),
    photoURL: userData.photoURL || "",
    role,
    plan: planId === "lifetime_admin" ? "yearly" : planId,
    planId,
    tier,
    premiumStatus,
    subscriptionExpiry,
    expiry: subscriptionExpiry,
    isBanned,
    banReason: isBanned ? (userData.banReason || "Administrative suspension") : "",
    bannedAt: isBanned ? nowIso : "",
    region: userData.region || "India",
    notes: userData.notes || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const userRef = doc(db, "users", cleanUid);
  try {
    await setDoc(userRef, userDocData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${cleanUid}`);
  }

  // Also mirror to Realtime Database
  try {
    if (rtdb) {
      const rtdbUserRef = rtdbRef(rtdb, `users/${cleanUid}/profile`);
      await rtdbSet(rtdbUserRef, {
        uid: cleanUid,
        displayName: userDocData.displayName,
        email: userDocData.email,
        photoURL: userDocData.photoURL,
        role: userDocData.role,
        plan: userDocData.plan,
        tier: userDocData.tier,
        premiumStatus: userDocData.premiumStatus,
        subscriptionExpiry: userDocData.subscriptionExpiry,
        isBanned: userDocData.isBanned,
        createdAt: nowIso,
        updatedAt: nowIso,
      });
    }
  } catch (rtdbErr) {
    console.warn("[Admin] RTDB user mirror note:", rtdbErr);
  }

  // Synchronize with server-side database
  try {
    await fetch("/api/admin/user/manual-add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-uid": adminUser.uid,
        "x-admin-email": adminUser.email || "",
      },
      body: JSON.stringify({
        uid: cleanUid,
        displayName: userDocData.displayName,
        email: userDocData.email,
        photoURL: userDocData.photoURL,
        role: userDocData.role,
        planId: userDocData.planId,
        tier: userDocData.tier,
        durationDays: userData.durationDays,
        isBanned: userDocData.isBanned,
        banReason: userDocData.banReason,
        region: userDocData.region,
        notes: userDocData.notes,
      }),
    });
  } catch (serverErr) {
    console.warn("[Admin] Server store sync note:", serverErr);
  }

  return {
    uid: cleanUid,
    displayName: userDocData.displayName,
    email: userDocData.email,
    photoURL: userDocData.photoURL,
    role: userDocData.role as "admin" | "user",
    plan: userDocData.plan,
    planId: userDocData.planId as any,
    tier: userDocData.tier as any,
    status: userDocData.isBanned ? "suspended" : "active",
    premiumStatus: userDocData.premiumStatus as any,
    subscriptionExpiry: userDocData.subscriptionExpiry,
    expiry: userDocData.expiry,
    isBanned: userDocData.isBanned,
    banReason: userDocData.banReason,
    bannedAt: userDocData.bannedAt,
    createdAt: nowIso,
    updatedAt: nowIso,
  } as unknown as UserProfile;
}

export interface DatabaseSubscriptionPlan {
  id: "free" | "weekly" | "monthly" | "yearly";
  name: string;
  tagline: string;
  priceInr: number;
  durationDays: number;
  tier: "FREE" | "PREMIUM";
  popular?: boolean;
  bestValue?: boolean;
  features: string[];
  updatedAt?: unknown;
  updatedBy?: string;
}

export const DEFAULT_DATABASE_PLANS: DatabaseSubscriptionPlan[] = [
  {
    id: "free",
    name: "Free Explorer",
    tagline: "Essential results viewing for casual exploration",
    priceInr: 0,
    durationDays: 3650,
    tier: "FREE",
    features: [
      "Live 30s & 1m result channels",
      "Basic Big/Small historical classification",
      "Last 25 results rolling window",
      "Standard telemetry tracking",
    ],
  },
  {
    id: "weekly",
    name: "Weekly Pass",
    tagline: "Flexible short-term tactical gaming analytical pass",
    priceInr: 149,
    durationDays: 7,
    tier: "PREMIUM",
    features: [
      "7 Days full analytical access",
      "100-round historical rolling window",
      "Complete 0–9 number frequency bars",
      "Streak & parity distribution charts",
      "CSV audit log export",
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
      "30 Days VIP gaming suite clearance",
      "Full 100+ rounds rolling sample analysis",
      "Streak & sequence telemetry alerts",
      "Interactive POPI companion VIP moods",
      "One-click CSV historical data export",
      "Priority Indian support desk assistance",
    ],
  },
  {
    id: "yearly",
    name: "Yearly Elite",
    tagline: "Maximum value for serious analytical gamers",
    priceInr: 4999,
    durationDays: 365,
    tier: "PREMIUM",
    bestValue: true,
    features: [
      "365 Days complete VIP clearance",
      "All future tool releases & analytical upgrades",
      "Priority API queue for instant settlements",
      "Dedicated VIP support desk access",
      "Exclusive gamer badge in community",
    ],
  },
];

/**
 * Subscribes to the live Firestore subscription_plans collection in real-time.
 * Anyone can read the plans. If the collection is empty, returns defaults and optionally seeds.
 */
export function subscribeToSubscriptionPlans(
  onUpdate: (plans: DatabaseSubscriptionPlan[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const plansCol = collection(db, "subscription_plans");

  return onSnapshot(
    plansCol,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(DEFAULT_DATABASE_PLANS);
        return;
      }

      const planMap = new Map<string, DatabaseSubscriptionPlan>();
      snapshot.forEach((d) => {
        const data = d.data();
        const id = (data.id || d.id) as "free" | "weekly" | "monthly" | "yearly";
        planMap.set(id, {
          id,
          name: data.name || id.toUpperCase(),
          tagline: data.tagline || "",
          priceInr: typeof data.priceInr === "number" ? data.priceInr : 0,
          durationDays: typeof data.durationDays === "number" ? data.durationDays : 30,
          tier: data.tier === "FREE" ? "FREE" : "PREMIUM",
          popular: Boolean(data.popular),
          bestValue: Boolean(data.bestValue),
          features: Array.isArray(data.features) ? data.features : [],
          updatedAt: data.updatedAt,
          updatedBy: data.updatedBy,
        });
      });

      // Preserve canonical plan sequence
      const order = ["free", "weekly", "monthly", "yearly"];
      const orderedPlans: DatabaseSubscriptionPlan[] = [];

      for (const key of order) {
        if (planMap.has(key)) {
          orderedPlans.push(planMap.get(key)!);
        } else {
          // Fill fallback if missing
          const def = DEFAULT_DATABASE_PLANS.find((p) => p.id === key);
          if (def) orderedPlans.push(def);
        }
      }

      // Add any additional custom plans
      planMap.forEach((v, k) => {
        if (!order.includes(k)) {
          orderedPlans.push(v);
        }
      });

      onUpdate(orderedPlans);
    },
    (error) => {
      console.warn("[Firestore] Error reading subscription plans, falling back to defaults:", error);
      onUpdate(DEFAULT_DATABASE_PLANS);
      if (onError) onError(error);
    },
  );
}

/**
 * Admin action: Manually update or save a subscription plan's price & details in Firestore database.
 * Strictly protected by client & rule-side isAdmin checks.
 */
export async function adminUpdateSubscriptionPlanInFirestore(
  adminUser: { uid: string; email?: string | null },
  planId: string,
  updates: Partial<DatabaseSubscriptionPlan>,
): Promise<void> {
  if (!checkIsAdmin(adminUser)) {
    throw new Error("Unauthorized: Only authorized administrators can update subscription prices in the database.");
  }

  const planRef = doc(db, "subscription_plans", planId);
  try {
    await setDoc(
      planRef,
      {
        ...updates,
        id: planId,
        updatedAt: serverTimestamp(),
        updatedBy: adminUser.email || adminUser.uid,
      },
      { merge: true },
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `subscription_plans/${planId}`);
  }
}

/**
 * Admin action: Seeds the initial plans into the Firestore database.
 */
export async function adminSeedPlansToFirestore(
  adminUser: { uid: string; email?: string | null },
): Promise<void> {
  if (!checkIsAdmin(adminUser)) {
    throw new Error("Unauthorized: Administrator permissions required to seed plans.");
  }

  for (const plan of DEFAULT_DATABASE_PLANS) {
    const planRef = doc(db, "subscription_plans", plan.id);
    await setDoc(
      planRef,
      {
        ...plan,
        updatedAt: serverTimestamp(),
        updatedBy: adminUser.email || adminUser.uid,
      },
      { merge: true },
    );
  }
}

// -------------------------------------------------------------
// Realtime Game Feed & Telemetry (Cloud Firestore Realtime DB)
// -------------------------------------------------------------

export interface RealtimeRound {
  mode: string;
  roundNumber: string;
  winningNumber: number;
  winningColor: "red" | "green" | "violet";
  size: "Big" | "Small";
  timestamp: number;
  updatedAt?: any;
}

export interface RealtimeChatMessage {
  id: string;
  userId: string;
  userName: string;
  avatar?: string;
  message: string;
  badge?: string;
  timestamp: string;
}

export interface RealtimePresence {
  userId: string;
  userName: string;
  activeGame?: string;
  lastSeen: string;
}

/**
 * Subscribes to real-time round results for a given game mode (30s, 1m, 3m, 5m).
 * Updates instantly across all connected devices via Firestore onSnapshot.
 */
export function subscribeToRealtimeRound(
  mode: string,
  onUpdate: (round: RealtimeRound | null) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const roundDocRef = doc(db, "realtime_rounds", mode);
  return onSnapshot(
    roundDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as RealtimeRound);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.warn(`[Firestore Realtime] Error on round ${mode}:`, err);
      if (onError) onError(err);
    },
  );
}

/**
 * Broadcasts a live completed round into both Firestore and Firebase Realtime Database (RTDB).
 */
export async function broadcastRealtimeRound(
  mode: string,
  roundData: Omit<RealtimeRound, "updatedAt">,
): Promise<void> {
  const roundDocRef = doc(db, "realtime_rounds", mode);
  try {
    await setDoc(
      roundDocRef,
      {
        ...roundData,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    // Mirror to Firebase Realtime Database (RTDB)
    rtdbSet(rtdbRef(rtdb, `rounds/${mode}`), {
      ...roundData,
      updatedAt: Date.now(),
    }).catch(() => {});
  } catch (error) {
    console.warn(`[Realtime Broadcast] Broadcast error for ${mode}:`, error);
  }
}

/**
 * Subscribes to live community lounge chat and player predictions in real-time.
 */
export function subscribeToRealtimeChat(
  onUpdate: (messages: RealtimeChatMessage[]) => void,
  limitCount = 40,
  onError?: (err: Error) => void,
): Unsubscribe {
  const chatCol = collection(db, "realtime_chat");
  const q = query(chatCol, orderBy("timestamp", "asc"), limit(limitCount));

  return onSnapshot(
    q,
    async (snapshot) => {
      const msgs: RealtimeChatMessage[] = [];
      for (const d of snapshot.docs) {
        const data = d.data();
        const decryptedMsg = await decryptDatabaseString(data.message || "");
        msgs.push({
          id: d.id,
          userId: data.userId || "anonymous",
          userName: data.userName || "POPI Gamer",
          avatar: data.avatar || "",
          message: decryptedMsg,
          badge: data.badge || "GAMER",
          timestamp: data.timestamp || new Date().toISOString(),
        });
      }
      onUpdate(msgs);
    },
    (err) => {
      console.warn("[Firestore Realtime] Chat error:", err);
      if (onError) onError(err);
    },
  );
}

/**
 * Sends a real-time message or prediction signal to the community lounge (Firestore + RTDB).
 * Message content is encrypted before transmission and database storage.
 */
export async function sendRealtimeChatMessage(
  msg: Omit<RealtimeChatMessage, "id" | "timestamp">,
): Promise<void> {
  const msgId = "msg_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const msgRef = doc(db, "realtime_chat", msgId);
  const nowIso = new Date().toISOString();
  try {
    // Encrypt the chat message payload
    const encryptedMessage = await encryptDatabaseString(msg.message);

    const encryptedPayload = {
      ...msg,
      message: encryptedMessage,
      isEncrypted: true,
      id: msgId,
      timestamp: nowIso,
      createdAt: serverTimestamp(),
    };

    await setDoc(msgRef, encryptedPayload);

    // Mirror to Firebase Realtime Database
    rtdbSet(rtdbRef(rtdb, `chat/${msgId}`), {
      ...encryptedPayload,
      createdAt: Date.now(),
    }).catch(() => {});
  } catch (error) {
    console.warn("[Realtime Chat] Error sending message:", error);
    throw error;
  }
}

/**
 * Deletes a real-time chat message (by author or admin).
 */
export async function deleteRealtimeChatMessage(messageId: string): Promise<void> {
  const msgRef = doc(db, "realtime_chat", messageId);
  await deleteDoc(msgRef);
  try {
    await rtdbRemove(rtdbRef(rtdb, `chat/${messageId}`));
  } catch {}
}

/**
 * Sends a presence heartbeat to maintain active player count in real time (Firestore + RTDB).
 */
export async function sendPresenceHeartbeat(
  userId: string,
  userName: string,
  activeGame = "Overview",
): Promise<void> {
  if (!userId) return;
  const presenceRef = doc(db, "realtime_presence", userId);
  const nowIso = new Date().toISOString();
  try {
    await setDoc(
      presenceRef,
      {
        userId,
        userName,
        activeGame,
        lastSeen: nowIso,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    // Mirror to Firebase Realtime Database
    rtdbSet(rtdbRef(rtdb, `presence/${userId}`), {
      userId,
      userName,
      activeGame,
      lastSeen: nowIso,
    }).catch(() => {});
  } catch {
    // Non-blocking
  }
}

/**
 * Subscribes to active online players count and player presence in real-time.
 */
export function subscribeToActivePresence(
  onUpdate: (activeCount: number, players: RealtimePresence[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const presCol = collection(db, "realtime_presence");
  return onSnapshot(
    presCol,
    (snapshot) => {
      const now = Date.now();
      const cutoff = now - 5 * 60 * 1000; // Active within last 5 minutes
      const activePlayers: RealtimePresence[] = [];

      snapshot.forEach((d) => {
        const data = d.data();
        const seenEpoch = new Date(data.lastSeen || 0).getTime();
        if (seenEpoch > cutoff) {
          activePlayers.push({
            userId: d.id,
            userName: data.userName || "Player",
            activeGame: data.activeGame || "Gaming Room",
            lastSeen: data.lastSeen,
          });
        }
      });

      // Provide realistic minimum + live connected players
      const totalCount = Math.max(12, activePlayers.length + 8);
      onUpdate(totalCount, activePlayers);
    },
    (err) => {
      console.warn("[Firestore Realtime] Presence error:", err);
      onUpdate(24, []);
      if (onError) onError(err);
    },
  );
}

export { onAuthStateChanged };

// Re-export modular Firebase entities from src/lib/firebase/*
export {
  POPI_PLANS,
  type PopiPlanType,
  database,
  storage,
  createUserProfile,
  getUserProfile,
  getUserUsage,
  subscribeToUserUsage,
  createApiKey,
  revokeApiKey,
  deleteApiKey,
  subscribeToApiKeys,
  recordUpload,
  subscribeToUserUploads,
  deleteUploadRecord,
  subscribeToSubscription,
  submitFeedback,
  formatAuthError,
  uploadScriptFile,
  deleteScriptFile,
  validateScriptFile,
  type UserProfileData,
  type UserPlanData,
  type UserUsageData,
  type ApiKeyRecord,
  type UploadRecord,
  type SubscriptionRecord,
  type NotificationRecord,
} from "./firebase/index";
