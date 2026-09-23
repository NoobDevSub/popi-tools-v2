import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile as updateAuthProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { ref, get, set, update, onValue } from "firebase/database";
import { auth, database } from "./config";
import { createUserProfile } from "./database";

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Authorized Admin Emails
export const AUTHORIZED_ADMIN_EMAILS = [
  "titnesgamer@gmail.com",
  "admin@popitools.com",
  "popitools-admin@firebase.local",
];

export function checkIsAdmin(email?: string | null): boolean {
  if (!email) return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

/**
 * User Profile data stored at `users/{uid}/profile` in Realtime Database
 */
export interface UserProfileRecord {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
  plan: "free" | "weekly" | "monthly" | "yearly" | string;
  role: "user" | "admin";
  status: "active" | "suspended";
}

/**
 * Friendly error messages translating raw Firebase codes into actionable UI feedback.
 * Specifically handles auth/operation-not-allowed with console setup guidance.
 */
export function formatAuthError(error: any): { title: string; message: string; isConfigError?: boolean } {
  const code = error?.code || "";
  const rawMsg = error?.message || "";

  if (code === "auth/operation-not-allowed") {
    return {
      title: "Firebase Authentication Provider Disabled",
      message:
        "The selected sign-in provider is disabled in your Firebase Console (popitools-ffaf4). Please open Firebase Console → Build → Authentication → 'Sign-in method' tab, and enable 'Email/Password' or 'Google'.",
      isConfigError: true,
    };
  }

  if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
    return {
      title: "Invalid Credentials",
      message: "The email or password entered is incorrect. If you do not have an account yet, please click 'Create Account'.",
    };
  }

  if (code === "auth/email-already-in-use") {
    return {
      title: "Email Already In Use",
      message: "An account with this email address already exists. Please sign in instead.",
    };
  }

  if (code === "auth/weak-password") {
    return {
      title: "Weak Password",
      message: "Password must be at least 6 characters long.",
    };
  }

  if (code === "auth/popup-closed-by-user") {
    return {
      title: "Sign-In Cancelled",
      message: "The Google sign-in window was closed before completion. Please try again.",
    };
  }

  if (code === "auth/popup-blocked") {
    return {
      title: "Popup Blocked",
      message: "The sign-in popup was blocked by your browser. Please allow popups for this site and try again.",
    };
  }

  if (code === "auth/unauthorized-domain") {
    return {
      title: "Domain Not Authorized",
      message:
        "This domain is not in the Firebase Authorized Domains list. Please add this domain in Firebase Console → Authentication → Settings → Authorized domains.",
      isConfigError: true,
    };
  }

  return {
    title: "Authentication Notice",
    message: rawMsg || "An error occurred during authentication. Please try again.",
  };
}

/**
 * Initializes the user profile in the Realtime Database at `users/{uid}/profile`
 * with default fields (plan: 'free', role: 'user', status: 'active') upon first login.
 */
export async function initializeUserProfile(user: {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}): Promise<UserProfileRecord> {
  const profileRef = ref(database, `users/${user.uid}/profile`);
  const snapshot = await get(profileRef);

  const now = new Date().toISOString();

  if (!snapshot.exists()) {
    // First login: create new user profile in Realtime Database at 'users/{uid}/profile'
    // with required default fields: plan: 'free', role: 'user', status: 'active'
    const newProfile: UserProfileRecord = {
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

    await set(profileRef, newProfile);

    // Initialize quotas and settings tree
    try {
      await createUserProfile(user);
    } catch (quotaErr) {
      console.warn("[Firebase Auth] Quota tree initialization note:", quotaErr);
    }

    return newProfile;
  }

  // Profile already exists: update timestamp and non-destructive attributes if needed
  const existing = snapshot.val() as Partial<UserProfileRecord>;
  const resolvedProfile: UserProfileRecord = {
    uid: user.uid,
    email: user.email || existing.email || "",
    displayName: user.displayName || existing.displayName || "POPI Gamer",
    photoURL: user.photoURL || existing.photoURL || "",
    createdAt: existing.createdAt || now,
    updatedAt: now,
    plan: existing.plan || "free",
    role: existing.role || "user",
    status: existing.status || "active",
  };

  try {
    await update(profileRef, {
      displayName: resolvedProfile.displayName,
      photoURL: resolvedProfile.photoURL,
      updatedAt: now,
    });
  } catch (upErr) {
    console.warn("[Firebase Auth] Profile touch note:", upErr);
  }

  return resolvedProfile;
}

/**
 * Sign in with Google Popup and initialize user profile in Realtime Database at `users/{uid}/profile`
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    await initializeUserProfile({
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || "POPI Gamer",
      photoURL: cred.user.photoURL,
    });
    return cred.user;
  } catch (err: any) {
    console.error("[Firebase Auth] Google sign-in error:", err);
    throw err;
  }
}

/**
 * Sign in with Email and Password and ensure Realtime Database user profile exists
 */
export async function signInWithEmail(email: string, pass: string): Promise<User> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    await initializeUserProfile({
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName,
      photoURL: cred.user.photoURL,
    });
    return cred.user;
  } catch (err: any) {
    console.error("[Firebase Auth] Email sign-in error:", err);
    throw err;
  }
}

/**
 * Sign up with Email and Password and set up initial profile with plan: 'free', role: 'user', status: 'active'
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName?: string,
): Promise<User> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (displayName && auth.currentUser) {
      try {
        await updateAuthProfile(auth.currentUser, { displayName: displayName.trim() });
      } catch {
        // Non-blocking
      }
    }
    await initializeUserProfile({
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: displayName || "POPI Gamer",
      photoURL: cred.user.photoURL,
    });
    return cred.user;
  } catch (err: any) {
    console.error("[Firebase Auth] Email signup error:", err);
    throw err;
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Sign out user
 */
export async function signOutUser(): Promise<void> {
  try {
    localStorage.removeItem("popi_auth_session");
  } catch {}
  await signOut(auth);
}

/**
 * Real-time listener for user profile at `users/{uid}/profile` in Realtime Database
 */
export function subscribeToUserProfile(
  uid: string,
  callback: (profile: UserProfileRecord | null) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const profileRef = ref(database, `users/${uid}/profile`);
  return onValue(
    profileRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as UserProfileRecord);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn("[RTDB] subscribeToUserProfile error:", err);
      if (onError) onError(err);
    },
  );
}

/**
 * Update user profile at `users/{uid}/profile` in Realtime Database
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfileRecord, "displayName" | "photoURL">>,
): Promise<void> {
  const profileRef = ref(database, `users/${uid}/profile`);
  await update(profileRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Auth state listener with automatic Realtime Database profile assurance
 */
export function subscribeToAuth(
  callback: (user: User | null) => void,
): Unsubscribe {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        await initializeUserProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      } catch (err) {
        console.warn("[Firebase Auth] Auto-sync profile on auth change warning:", err);
      }
    }
    callback(user);
  });
}

export { auth, onAuthStateChanged, type User, type Unsubscribe };
