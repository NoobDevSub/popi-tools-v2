import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics, isSupported as isAnalyticsSupported, type Analytics } from "firebase/analytics";

/**
 * Firebase Configuration using VITE environment variables
 * with direct fallbacks to the provided project configuration.
 *
 * For Firebase JS SDK v7.20.0 and later, measurementId is optional.
 */
export const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyC9-eTa8eT2y2dLSQLUFRzBScx2xk80jU0",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "popitools-ffaf4.firebaseapp.com",
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    "https://popitools-ffaf4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    "popitools-ffaf4",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "popitools-ffaf4.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "1054415108068",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:1054415108068:web:4ca826f21ef4237f8f79f1",
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ||
    "G-6SEVYQ12WY",
};

// Initialize Firebase App (reuse existing instance if already initialized)
export const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// Firebase Authentication Instance
export const auth: Auth = getAuth(app);

// Firebase Realtime Database Instance
export const database: Database = getDatabase(app);

// Firebase Cloud Storage Instance
export const storage: FirebaseStorage = getStorage(app);

// Firebase Firestore Instance
export const firestore: Firestore = getFirestore(app);

// Optional Firebase Analytics (initialized safely in supported browser environments)
export let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isAnalyticsSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Non-blocking in sandboxed or preview environments
    });
}

/**
 * Centrally defined POPI subscription tiers and weekly upload quotas
 */
export const POPI_PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    currency: "INR",
    durationDays: 365,
    uploadsPerWeek: 4,
    badge: "FREE",
    features: [
      "Maximum 4 script uploads per week",
      "Standard POPI AI facial tracking",
      "Live 30s & 1m round feeds",
      "Community Lounge access",
      "1 Active API Key",
    ],
  },
  weekly: {
    id: "weekly",
    name: "Weekly",
    price: 199,
    currency: "INR",
    durationDays: 7,
    uploadsPerWeek: 50,
    badge: "PRO WEEKLY",
    features: [
      "50 script uploads per week",
      "38+ expressive AI companion moods",
      "Low-latency predictive analytics",
      "Priority WebSockets streaming",
      "Up to 3 Active API Keys",
      "Community Lounge VIP Badge",
    ],
  },
  monthly: {
    id: "monthly",
    name: "Monthly",
    price: 499,
    currency: "INR",
    durationDays: 30,
    uploadsPerWeek: 300,
    badge: "PREMIUM",
    features: [
      "300 script uploads per week",
      "Full Unlocked AI Suite & Voice Moods",
      "Rolling 100+ deep parity analysis",
      "Up to 10 Active API Keys",
      "Automated script validation & sandbox",
      "Priority 24/7 dedicated support",
    ],
  },
  yearly: {
    id: "yearly",
    name: "Yearly",
    price: 5999,
    currency: "INR",
    durationDays: 365,
    uploadsPerWeek: 9999,
    badge: "ULTIMATE",
    features: [
      "Unlimited script uploads (9999/wk)",
      "Full Admin & God-Mode features",
      "Dedicated private WebSocket channels",
      "Unlimited Production API Keys",
      "Early access to next-gen POPI algorithms",
      "1-on-1 strategy onboarding & custom tools",
    ],
  },
} as const;

export type PopiPlanType = keyof typeof POPI_PLANS;
