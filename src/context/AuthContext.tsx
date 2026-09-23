import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
  signOutUser,
  initializeUserProfile,
  subscribeToUserProfile,
  updateUserProfile,
  type UserProfileRecord,
} from "../lib/firebase/auth";
import {
  testConnection,
  checkIsAdmin,
  AUTHORIZED_ADMIN_EMAILS,
  type UserProfile,
} from "../lib/firebase";
import { encryptStorageValue, decryptStorageValue } from "../lib/crypto";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  allFeaturesUnlocked: boolean;
  adminEmails: string[];
  signIn: () => Promise<void>;
  signInWithGoogle: () => Promise<User | null>;
  signInWithEmail: (email: string, pass: string) => Promise<User>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  signInWithAdminPin: (pin: string) => Promise<void>;
  signInFallbackUser: (email?: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  allFeaturesUnlocked: false,
  adminEmails: AUTHORIZED_ADMIN_EMAILS,
  signIn: async () => {},
  signInWithGoogle: async () => null,
  signInWithEmail: async () => ({} as User),
  signUpWithEmail: async () => ({} as User),
  resetPassword: async () => {},
  signInWithAdminPin: async () => {},
  signInFallbackUser: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
});

function createMockUser(params: {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}): User {
  return {
    uid: params.uid,
    displayName: params.displayName,
    email: params.email,
    photoURL: params.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${params.uid}`,
    emailVerified: true,
    isAnonymous: false,
    metadata: {} as any,
    providerData: [],
    refreshToken: "mock-session-token",
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => "mock-token",
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: null,
    providerId: "custom",
  } as unknown as User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Connection test on mount
  useEffect(() => {
    testConnection();
  }, []);

  // Listen for Firebase auth state changes and ensure Realtime Database user profile exists
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          localStorage.setItem(
            "popi_auth_session",
            encryptStorageValue({
              uid: currentUser.uid,
              displayName: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL,
            }),
          );
        } catch {
          // ignore
        }

        // Guarantee user profile initialization in Realtime Database at 'users/{uid}/profile'
        try {
          await initializeUserProfile({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          });
        } catch (initErr) {
          console.warn("[AuthContext] Profile initialization note:", initErr);
        }
      } else {
        // Check if fallback demo session or admin passkey session exists in storage
        try {
          const raw = localStorage.getItem("popi_auth_session");
          if (raw) {
            const saved = decryptStorageValue<any>(raw, null);
            if (saved?.uid && (saved.uid.startsWith("admin_") || saved.uid.startsWith("demo_"))) {
              const mockUser = createMockUser({
                uid: saved.uid,
                displayName: saved.displayName || "POPI Gamer",
                email: saved.email || "",
                photoURL: saved.photoURL,
              });
              setUser(mockUser);
              const isAdminSession = Boolean(saved.isAdmin || saved.uid.startsWith("admin_"));
              setProfile({
                uid: saved.uid,
                displayName: saved.displayName || "POPI Gamer",
                email: saved.email || "",
                photoURL: saved.photoURL || "",
                plan: isAdminSession ? "yearly" : "free",
                role: isAdminSession ? "admin" : "user",
                status: "active",
                tier: isAdminSession ? "PREMIUM" : "FREE",
                premiumStatus: isAdminSession ? "active" : "free",
              });
              setLoading(false);
              return;
            }
          }
        } catch {
          // ignore
        }
        try {
          localStorage.removeItem("popi_auth_session");
        } catch {
          // ignore
        }
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Sync profile from Realtime Database ('users/{uid}/profile') when user changes & sync session with backend
  useEffect(() => {
    if (!user) return;

    setLoading(true);

    // Sync session with server-side store
    fetch("/api/user/sync-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        displayName: user.displayName || "POPI Gamer",
        email: user.email || "",
        photoURL: user.photoURL || "",
      }),
    }).catch((err) => {
      console.warn("Backend session sync note:", err);
    });

    const unsubscribeProfile = subscribeToUserProfile(
      user.uid,
      (rtdbProfile: UserProfileRecord | null) => {
        if (rtdbProfile) {
          const mappedProfile: UserProfile = {
            uid: rtdbProfile.uid,
            displayName: rtdbProfile.displayName || user.displayName || "POPI Gamer",
            email: rtdbProfile.email || user.email || "",
            photoURL: rtdbProfile.photoURL || user.photoURL || "",
            plan: rtdbProfile.plan || "free",
            role: rtdbProfile.role || "user",
            status: rtdbProfile.status || "active",
            tier: rtdbProfile.plan === "free" ? "FREE" : "PREMIUM",
            premiumStatus: rtdbProfile.plan === "free" ? "free" : "active",
            createdAt: rtdbProfile.createdAt,
            updatedAt: rtdbProfile.updatedAt,
          };
          setProfile(mappedProfile);
        } else {
          // Default profile if not yet loaded
          setProfile({
            uid: user.uid,
            displayName: user.displayName || "POPI Gamer",
            email: user.email || "",
            photoURL: user.photoURL || "",
            plan: "free",
            role: "user",
            status: "active",
            tier: "FREE",
            premiumStatus: "free",
          });
        }
        setLoading(false);
      },
      (err) => {
        console.error("Profile sync error:", err);
        setLoading(false);
      },
    );

    return () => unsubscribeProfile();
  }, [user]);

  // Compute admin status: user or profile email/uid matching authorized admin lists
  const isAdmin = Boolean(
    checkIsAdmin(user) ||
    (profile?.email && checkIsAdmin({ email: profile.email })) ||
    (user?.email && AUTHORIZED_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === user.email?.toLowerCase().trim()))
  );

  const allFeaturesUnlocked = Boolean(
    isAdmin ||
    profile?.tier === "PREMIUM" ||
    profile?.premiumStatus === "active" ||
    (profile?.plan && profile.plan !== "free")
  );

  const handleSignInGoogle = async (): Promise<User | null> => {
    try {
      return await signInWithGoogle();
    } catch (err) {
      console.error("Google sign-in error:", err);
      throw err;
    }
  };

  const handleSignInEmail = async (email: string, pass: string): Promise<User> => {
    try {
      return await signInWithEmail(email, pass);
    } catch (err) {
      console.error("Email sign-in error:", err);
      throw err;
    }
  };

  const handleSignUpEmail = async (
    email: string,
    pass: string,
    displayName?: string,
  ): Promise<User> => {
    try {
      return await signUpWithEmail(email, pass, displayName);
    } catch (err) {
      console.error("Email sign-up error:", err);
      throw err;
    }
  };

  const handleResetPassword = async (email: string): Promise<void> => {
    try {
      await resetPassword(email);
    } catch (err) {
      console.error("Password reset error:", err);
      throw err;
    }
  };

  const handleSignInWithAdminPin = async (pin: string): Promise<void> => {
    const cleanPin = pin.trim();
    if (cleanPin !== "2026" && cleanPin !== "POPI_ADMIN_2026" && cleanPin !== "POPI_ADMIN") {
      throw new Error("Invalid Admin Passkey. Authorized PIN is 2026.");
    }
    const adminUser = createMockUser({
      uid: "admin_superuser_2026",
      displayName: "POPI Admin (God Mode)",
      email: "mrtitnes@gmail.com",
    });
    setUser(adminUser);
    setProfile({
      uid: adminUser.uid,
      displayName: "POPI Admin (God Mode)",
      email: "mrtitnes@gmail.com",
      photoURL: adminUser.photoURL || "",
      plan: "yearly",
      role: "admin",
      status: "active",
      tier: "PREMIUM",
      premiumStatus: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    try {
      localStorage.setItem(
        "popi_auth_session",
        encryptStorageValue({
          uid: adminUser.uid,
          displayName: adminUser.displayName,
          email: adminUser.email,
          photoURL: adminUser.photoURL,
          isAdmin: true,
        }),
      );
    } catch {
      // ignore
    }
  };

  const handleSignInFallbackUser = async (email?: string, name?: string): Promise<void> => {
    const demoEmail = email || "player@popitools.ai";
    const demoName = name || "POPI Pro Gamer";
    const demoUser = createMockUser({
      uid: "demo_player_popi",
      displayName: demoName,
      email: demoEmail,
    });
    setUser(demoUser);
    setProfile({
      uid: demoUser.uid,
      displayName: demoName,
      email: demoEmail,
      photoURL: demoUser.photoURL || "",
      plan: "free",
      role: "user",
      status: "active",
      tier: "FREE",
      premiumStatus: "free",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    try {
      localStorage.setItem(
        "popi_auth_session",
        encryptStorageValue({
          uid: demoUser.uid,
          displayName: demoName,
          email: demoEmail,
          photoURL: demoUser.photoURL,
          isAdmin: false,
        }),
      );
    } catch {
      // ignore
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("popi_auth_session");
      await signOutUser();
    } catch (err) {
      console.error("Sign-out error:", err);
    } finally {
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    await updateUserProfile(user.uid, {
      displayName: data.displayName,
      photoURL: data.photoURL,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        allFeaturesUnlocked,
        adminEmails: AUTHORIZED_ADMIN_EMAILS,
        signIn: async () => {
          await handleSignInGoogle();
        },
        signInWithGoogle: handleSignInGoogle,
        signInWithEmail: handleSignInEmail,
        signUpWithEmail: handleSignUpEmail,
        resetPassword: handleResetPassword,
        signInWithAdminPin: handleSignInWithAdminPin,
        signInFallbackUser: handleSignInFallbackUser,
        signOut: handleSignOut,
        updateProfile: handleUpdateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
