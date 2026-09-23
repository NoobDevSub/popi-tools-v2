import {
  ref,
  set,
  get,
  update,
  remove,
  push,
  onValue,
  type Unsubscribe,
} from "firebase/database";
import { database, POPI_PLANS, type PopiPlanType } from "./config";
import { encryptDatabaseString, decryptDatabaseString } from "../crypto";

export interface UserProfileData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
  plan: PopiPlanType;
  role: "user" | "admin";
  status: "active" | "suspended";
}

export interface UserPlanData {
  plan: PopiPlanType;
  status: "active" | "expired" | "cancelled";
  startedAt: string;
  expiresAt: string;
}

export interface UserUsageData {
  uploadCount: number;
  remainingUploads: number;
  lastUploadReset: string;
}

export interface UserSettingsData {
  notifications: boolean;
  soundEnabled: boolean;
  theme: "dark" | "light";
}

export interface FullUserData {
  profile: UserProfileData;
  plan: UserPlanData;
  usage: UserUsageData;
  settings?: UserSettingsData;
}

export interface ApiKeyRecord {
  id: string;
  uid: string;
  name: string;
  maskedKey: string; // e.g. pk_live_••••••••••••1234
  createdAt: string;
  lastUsedAt: string;
  status: "active" | "revoked";
}

export interface UploadRecord {
  uploadId: string;
  uid: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadUrl: string;
  createdAt: string;
  status: "ready" | "processing" | "verified";
}

export interface SubscriptionRecord {
  subscriptionId: string;
  uid: string;
  plan: PopiPlanType;
  status: "active" | "pending" | "expired";
  startedAt: string;
  expiresAt: string;
  provider: "razorpay" | "stripe" | "admin" | "free";
  updatedAt: string;
}

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  timestamp: string;
  read: boolean;
}

// -------------------------------------------------------------
// User Profile & Initial Setup (Realtime Database)
// -------------------------------------------------------------

/**
 * Initializes or updates user profile in Realtime Database.
 * Protects role, plan, and status from being overwritten client-side.
 */
export async function createUserProfile(user: {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}): Promise<FullUserData> {
  const userRef = ref(database, `users/${user.uid}`);
  const snapshot = await get(userRef);

  const now = new Date().toISOString();

  if (snapshot.exists()) {
    const existing = snapshot.val();
    // Update non-sensitive profile info (displayName, photoURL, updatedAt)
    const updatedProfile: UserProfileData = {
      uid: user.uid,
      email: user.email || existing.profile?.email || "",
      displayName: user.displayName || existing.profile?.displayName || "POPI Gamer",
      photoURL: user.photoURL || existing.profile?.photoURL || "",
      createdAt: existing.profile?.createdAt || now,
      updatedAt: now,
      plan: existing.profile?.plan || existing.plan?.plan || "free",
      role: existing.profile?.role || "user",
      status: existing.profile?.status || "active",
    };

    await update(ref(database, `users/${user.uid}/profile`), updatedProfile);

    return {
      profile: updatedProfile,
      plan: existing.plan || {
        plan: "free",
        status: "active",
        startedAt: now,
        expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
      },
      usage: existing.usage || {
        uploadCount: 0,
        remainingUploads: POPI_PLANS.free.uploadsPerWeek,
        lastUploadReset: now,
      },
      settings: existing.settings,
    };
  }

  // First time login - initialize full schema with both root-level fields and sub-nodes
  const newProfile: UserProfileData = {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "POPI Gamer",
    photoURL: user.photoURL || "",
    createdAt: now,
    updatedAt: now,
    plan: "free",
    role: "user",
    status: "active",
  };

  const newPlan: UserPlanData = {
    plan: "free",
    status: "active",
    startedAt: now,
    expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
  };

  const newUsage: UserUsageData = {
    uploadCount: 0,
    remainingUploads: POPI_PLANS.free.uploadsPerWeek,
    lastUploadReset: now,
  };

  const newSettings: UserSettingsData = {
    notifications: true,
    soundEnabled: true,
    theme: "dark",
  };

  const fullData = {
    // Root-level fields for direct lookup
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "POPI Gamer",
    photoURL: user.photoURL || "",
    createdAt: now,
    updatedAt: now,
    plan: "free",
    role: "user",
    status: "active",
    uploadCount: 0,
    lastUploadReset: now,
    // Sub-objects for structured sub-tree listeners
    profile: newProfile,
    planDetails: newPlan,
    usage: newUsage,
    settings: newSettings,
  };

  await set(userRef, fullData);
  return {
    profile: newProfile,
    plan: newPlan,
    usage: newUsage,
    settings: newSettings,
  };
}

/**
 * Fetch full user data from Realtime Database
 */
export async function getUserProfile(uid: string): Promise<FullUserData | null> {
  try {
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);
    if (!snapshot.exists()) return null;
    return snapshot.val() as FullUserData;
  } catch (err) {
    console.warn("[RTDB] Failed to get user profile:", err);
    return null;
  }
}

/**
 * Real-time listener for full user tree (profile, plan, and usage)
 */
export function subscribeToFullUserData(
  uid: string,
  callback: (data: FullUserData | null) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const userRef = ref(database, `users/${uid}`);
  return onValue(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as FullUserData);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.warn("[RTDB] User full data subscribe error:", error);
      if (onError) onError(error);
    },
  );
}

/**
 * Update non-sensitive profile fields (displayName, photoURL)
 */
export async function updateUserProfileData(
  uid: string,
  data: Partial<Pick<UserProfileData, "displayName" | "photoURL">>,
): Promise<void> {
  const profileRef = ref(database, `users/${uid}/profile`);
  await update(profileRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

// -------------------------------------------------------------
// Upload Usage Tracking with Weekly Reset
// -------------------------------------------------------------

/**
 * Fetch current user usage and check if weekly upload counter needs resetting
 */
export async function getUserUsage(uid: string): Promise<UserUsageData> {
  const userRef = ref(database, `users/${uid}`);
  const snapshot = await get(userRef);
  const now = new Date();
  const defaultUsage: UserUsageData = {
    uploadCount: 0,
    remainingUploads: POPI_PLANS.free.uploadsPerWeek,
    lastUploadReset: now.toISOString(),
  };

  if (!snapshot.exists()) return defaultUsage;

  const data = snapshot.val();
  const currentPlan: PopiPlanType = data.plan?.plan || "free";
  const planLimit = POPI_PLANS[currentPlan]?.uploadsPerWeek || POPI_PLANS.free.uploadsPerWeek;

  const usage: UserUsageData = data.usage || defaultUsage;

  // Check 7-day weekly reset
  const lastReset = new Date(usage.lastUploadReset || 0).getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  if (now.getTime() - lastReset > sevenDaysMs) {
    // Reset counter for the new week
    const resetUsage: UserUsageData = {
      uploadCount: 0,
      remainingUploads: planLimit,
      lastUploadReset: now.toISOString(),
    };
    await update(ref(database, `users/${uid}/usage`), resetUsage);
    return resetUsage;
  }

  // Calculate actual remaining
  const remaining = Math.max(0, planLimit - (usage.uploadCount || 0));
  return {
    uploadCount: usage.uploadCount || 0,
    remainingUploads: remaining,
    lastUploadReset: usage.lastUploadReset || now.toISOString(),
  };
}

/**
 * Subscribe to real-time user usage updates
 */
export function subscribeToUserUsage(
  uid: string,
  callback: (usage: UserUsageData) => void,
): Unsubscribe {
  const usageRef = ref(database, `users/${uid}/usage`);
  return onValue(usageRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as UserUsageData);
    } else {
      callback({
        uploadCount: 0,
        remainingUploads: POPI_PLANS.free.uploadsPerWeek,
        lastUploadReset: new Date().toISOString(),
      });
    }
  });
}

// -------------------------------------------------------------
// API Key Management (Realtime Database)
// -------------------------------------------------------------

/**
 * Generates a new secure API Key.
 * Returns the FULL key ONCE to show the user, while storing masked key in RTDB.
 */
export async function createApiKey(
  uid: string,
  name: string,
): Promise<{ keyRecord: ApiKeyRecord; fullSecretKey: string }> {
  const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(18)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const fullSecretKey = `pk_live_${randomPart}`;
  const last4 = fullSecretKey.slice(-4);
  const maskedKey = `pk_live_••••••••••••${last4}`;

  const keyId = `key_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const keyRef = ref(database, `apiKeys/${uid}/${keyId}`);

  // Encrypt masked key and name
  const encMaskedKey = await encryptDatabaseString(maskedKey);

  const keyRecord: ApiKeyRecord = {
    id: keyId,
    uid,
    name: name.trim() || "Default API Key",
    maskedKey: encMaskedKey,
    createdAt: new Date().toISOString(),
    lastUsedAt: "Never used",
    status: "active",
  };

  await set(keyRef, keyRecord);
  return { keyRecord: { ...keyRecord, maskedKey }, fullSecretKey };
}

/**
 * Revokes an existing API key
 */
export async function revokeApiKey(uid: string, keyId: string): Promise<void> {
  const keyRef = ref(database, `apiKeys/${uid}/${keyId}`);
  await update(keyRef, {
    status: "revoked",
  });
}

/**
 * Deletes an API key record
 */
export async function deleteApiKey(uid: string, keyId: string): Promise<void> {
  const keyRef = ref(database, `apiKeys/${uid}/${keyId}`);
  await remove(keyRef);
}

/**
 * Subscribes to the user's API keys in real time (Decrypted on read)
 */
export function subscribeToApiKeys(
  uid: string,
  callback: (keys: ApiKeyRecord[]) => void,
): Unsubscribe {
  const keysRef = ref(database, `apiKeys/${uid}`);
  return onValue(keysRef, async (snapshot) => {
    const list: ApiKeyRecord[] = [];
    if (snapshot.exists()) {
      const promises: Promise<void>[] = [];
      snapshot.forEach((child) => {
        const item = child.val() as ApiKeyRecord;
        promises.push(
          (async () => {
            const decKey = await decryptDatabaseString(item.maskedKey);
            list.push({ ...item, maskedKey: decKey });
          })(),
        );
      });
      await Promise.all(promises);
    }
    callback(list.reverse()); // most recent first
  });
}

// -------------------------------------------------------------
// Script Upload Records (Realtime Database)
// -------------------------------------------------------------

/**
 * Record a successful script upload metadata in Realtime Database and increment weekly usage
 * Encrypts downloadUrl before saving to database
 */
export async function recordUpload(
  uid: string,
  uploadData: Omit<UploadRecord, "uploadId" | "createdAt" | "status">,
): Promise<UploadRecord> {
  const uploadId = `up_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const uploadRef = ref(database, `uploads/${uid}/${uploadId}`);

  // Encrypt download URL
  const encryptedUrl = await encryptDatabaseString(uploadData.downloadUrl);

  const record: UploadRecord = {
    uploadId,
    uid,
    fileName: uploadData.fileName,
    fileSize: uploadData.fileSize,
    fileType: uploadData.fileType,
    downloadUrl: encryptedUrl,
    createdAt: new Date().toISOString(),
    status: "ready",
  };

  await set(uploadRef, record);

  // Increment user's upload counter
  try {
    const usage = await getUserUsage(uid);
    const newCount = (usage.uploadCount || 0) + 1;
    const planRef = ref(database, `users/${uid}/plan/plan`);
    const planSnap = await get(planRef);
    const plan: PopiPlanType = (planSnap.exists() && planSnap.val()) || "free";
    const limit = POPI_PLANS[plan]?.uploadsPerWeek || POPI_PLANS.free.uploadsPerWeek;

    await update(ref(database, `users/${uid}/usage`), {
      uploadCount: newCount,
      remainingUploads: Math.max(0, limit - newCount),
      lastUploadReset: usage.lastUploadReset,
    });
  } catch (err) {
    console.warn("[RTDB] Failed to increment usage counter:", err);
  }

  return { ...record, downloadUrl: uploadData.downloadUrl };
}

/**
 * Subscribe to user's uploaded scripts list in real time (Decrypted on read)
 */
export function subscribeToUserUploads(
  uid: string,
  callback: (uploads: UploadRecord[]) => void,
): Unsubscribe {
  const uploadsRef = ref(database, `uploads/${uid}`);
  return onValue(uploadsRef, async (snapshot) => {
    const list: UploadRecord[] = [];
    if (snapshot.exists()) {
      const promises: Promise<void>[] = [];
      snapshot.forEach((child) => {
        const item = child.val() as UploadRecord;
        promises.push(
          (async () => {
            const decUrl = await decryptDatabaseString(item.downloadUrl);
            list.push({ ...item, downloadUrl: decUrl });
          })(),
        );
      });
      await Promise.all(promises);
    }
    callback(list.reverse());
  });
}

/**
 * Delete an upload record from Realtime Database
 */
export async function deleteUploadRecord(uid: string, uploadId: string): Promise<void> {
  const uploadRef = ref(database, `uploads/${uid}/${uploadId}`);
  await remove(uploadRef);
}

// -------------------------------------------------------------
// Subscriptions (Realtime Database)
// -------------------------------------------------------------

/**
 * Subscribe to the user's authoritative subscription record
 */
export function subscribeToSubscription(
  uid: string,
  callback: (sub: SubscriptionRecord | null) => void,
): Unsubscribe {
  const subRef = ref(database, `subscriptions/${uid}`);
  return onValue(subRef, (snapshot) => {
    if (snapshot.exists()) {
      // Get most active subscription
      let activeSub: SubscriptionRecord | null = null;
      snapshot.forEach((child) => {
        const val = child.val() as SubscriptionRecord;
        if (val.status === "active") {
          activeSub = val;
        }
      });
      callback(activeSub);
    } else {
      callback(null);
    }
  });
}

// -------------------------------------------------------------
// Feedback & Community Submissions
// -------------------------------------------------------------

export async function submitFeedback(
  uid: string,
  userEmail: string,
  message: string,
  rating = 5,
): Promise<void> {
  const feedbackColRef = ref(database, "feedback");
  const newRef = push(feedbackColRef);

  // Encrypt feedback message before sending to database
  const encMessage = await encryptDatabaseString(message);

  await set(newRef, {
    id: newRef.key,
    uid,
    userEmail,
    message: encMessage,
    rating,
    createdAt: new Date().toISOString(),
  });
}
