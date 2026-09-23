"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldAlert,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: "signin" | "signup";
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "signin",
}: AuthModalProps) {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signInWithAdminPin,
    signInFallbackUser,
  } = useAuth();

  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot">(initialMode);
  const [activeTab, setActiveTab] = useState<"email" | "google" | "admin-pin">("email");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [adminPin, setAdminPin] = useState("");

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [domainNotice, setDomainNotice] = useState<boolean>(false);
  const [operationNotAllowedNotice, setOperationNotAllowedNotice] = useState<{
    provider: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setDomainNotice(false);
    setOperationNotAllowedNotice(null);

    try {
      const user = await signInWithGoogle();
      if (user) {
        setSuccessMessage("Signed in successfully with Google!");
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 300);
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      const code = err?.code || "";
      const msg = err?.message || "";

      if (code === "auth/operation-not-allowed" || msg.includes("operation-not-allowed")) {
        setOperationNotAllowedNotice({ provider: "Google" });
        setErrorMessage(
          "Google Sign-In is not enabled yet in your Firebase Console (popitools-ffaf4). Please enable it or use the Admin Passkey / Demo login below."
        );
      } else if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        setErrorMessage("Google Sign-In was cancelled.");
      } else if (
        code === "auth/unauthorized-domain" ||
        msg.includes("unauthorized-domain") ||
        msg.includes("auth/unauthorized-domain")
      ) {
        setDomainNotice(true);
        setErrorMessage(
          "Google OAuth requires this preview domain in Firebase Console. Sign in below using Email & Password or use the Admin Passkey for instant unrestricted access."
        );
      } else {
        setErrorMessage(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (authMode === "forgot") {
      setLoading(true);
      try {
        await resetPassword(cleanEmail);
        setSuccessMessage(`Password reset link sent to ${cleanEmail}. Check your inbox!`);
        setTimeout(() => setAuthMode("signin"), 3000);
      } catch (err: any) {
        console.error("Reset error:", err);
        setErrorMessage(err.message || "Failed to send reset link.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (authMode === "signup") {
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      if (authMode === "signin") {
        await signInWithEmail(cleanEmail, password);
        setSuccessMessage("Welcome back! Access granted.");
      } else {
        await signUpWithEmail(cleanEmail, password, name.trim() || undefined);
        setSuccessMessage("Account created successfully! Welcome to POPI Tools.");
      }

      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 400);
    } catch (err: any) {
      console.error("Auth error:", err);
      const code = err?.code || "";
      const msg = err?.message || "";
      if (code === "auth/operation-not-allowed" || msg.includes("operation-not-allowed")) {
        setOperationNotAllowedNotice({ provider: "Email/Password" });
        setErrorMessage(
          "Email/Password Authentication is not enabled yet in your Firebase Console (popitools-ffaf4). Please follow the setup steps below or sign in using the Admin Passkey / Demo Player."
        );
      } else if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        setErrorMessage(
          "Invalid email or password. If this is your first time, choose 'Create Account' above."
        );
      } else if (code === "auth/email-already-in-use") {
        setErrorMessage("This email is already registered. Please sign in below.");
        setAuthMode("signin");
      } else if (code === "auth/weak-password") {
        setErrorMessage("Password is too weak. Please use at least 6 characters.");
      } else {
        setErrorMessage(err.message || "Authentication failed. Please verify credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminPinAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!adminPin.trim()) {
      setErrorMessage("Please enter your Admin Passkey PIN.");
      return;
    }

    setLoading(true);
    try {
      await signInWithAdminPin(adminPin.trim());
      setSuccessMessage("👑 God Mode Unlocked! Welcome Admin.");
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 400);
    } catch (err: any) {
      console.error("Admin PIN error:", err);
      setErrorMessage(err.message || "Invalid Admin Passkey. Please verify your PIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden font-['Rajdhani',sans-serif]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-linear-to-r from-[#FF4625] via-amber-500 to-[#FF4625]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-2xl bg-slate-950 dark:bg-slate-800 flex items-center justify-center text-white shadow-sm shrink-0">
              <Sparkles className="size-4.5 text-[#FF4625]" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-slate-900 dark:text-white font-['Orbitron',sans-serif]">
                {activeTab === "admin-pin"
                  ? "Admin Command Key"
                  : authMode === "signin"
                    ? "POPI Account Access"
                    : authMode === "signup"
                      ? "Create Gamer Account"
                      : "Reset Password"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {activeTab === "admin-pin"
                  ? "Enter secure passkey for unrestricted admin access"
                  : authMode === "signin"
                    ? "Sign in with Email or Google to unlock dashboard"
                    : authMode === "signup"
                      ? "Join POPI Tools for real-time live gaming telemetry"
                      : "Enter your email to receive recovery instructions"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Feedback Messages */}
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div className="leading-snug">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Operation Not Allowed Provider Guidance Notice */}
          {operationNotAllowedNotice && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-600 dark:text-amber-400 space-y-3">
              <div className="flex items-center gap-2 font-bold font-['Orbitron',sans-serif]">
                <ShieldAlert className="size-4 text-amber-500 shrink-0" />
                <span>Firebase Authentication Setup Required</span>
              </div>
              <div className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 space-y-1.5">
                <p>
                  Firebase returned <code className="px-1 py-0.5 rounded bg-slate-900 text-amber-400 font-mono">auth/operation-not-allowed</code> because <strong>{operationNotAllowedNotice.provider}</strong> is not enabled in your project (<code className="font-mono text-emerald-400">popitools-ffaf4</code>).
                </p>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[10px] space-y-1 font-mono text-slate-300">
                  <div>1. Open <a href="https://console.firebase.google.com/project/popitools-ffaf4/authentication/providers" target="_blank" rel="noopener noreferrer" className="text-[#FF4625] underline">Firebase Console → Authentication → Sign-in method</a></div>
                  <div>2. Click <strong>{operationNotAllowedNotice.provider}</strong> and toggle <strong>Enable</strong></div>
                  <div>3. Click <strong>Save</strong></div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={async () => {
                    await signInWithAdminPin("2026");
                    onClose();
                    if (onSuccess) onSuccess();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs font-['Orbitron',sans-serif] hover:bg-amber-400 transition-all cursor-pointer shadow-xs"
                >
                  👑 Instant Admin Mode (PIN: 2026)
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await signInFallbackUser("player@popitools.ai", "POPI Pro Gamer");
                    onClose();
                    if (onSuccess) onSuccess();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs font-['Orbitron',sans-serif] hover:opacity-90 transition-all cursor-pointer shadow-xs"
                >
                  🚀 Sign In as Demo Player
                </button>
              </div>
            </div>
          )}

          {/* Domain Authorization Notice (Friendly fallback guide) */}
          {domainNotice && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-600 dark:text-amber-400 space-y-2.5">
              <div className="flex items-center gap-1.5 font-bold font-['Orbitron',sans-serif]">
                <ShieldAlert className="size-4 text-amber-500 shrink-0" />
                <span>Google OAuth Domain Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                This preview domain is not yet whitelisted in Firebase Console. You can sign in immediately using <strong>Email & Password</strong> or use your <strong>Admin Passkey</strong> without any domain restrictions.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("email");
                    setDomainNotice(false);
                    setErrorMessage(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs font-['Orbitron',sans-serif] hover:opacity-90 transition-all cursor-pointer shadow-xs"
                >
                  Email & Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("admin-pin");
                    setDomainNotice(false);
                    setErrorMessage(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs font-['Orbitron',sans-serif] hover:bg-amber-400 transition-all cursor-pointer shadow-xs"
                >
                  Admin Passkey
                </button>
              </div>
            </div>
          )}

          {/* Method Selector Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab("email");
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-['Orbitron',sans-serif] ${
                activeTab === "email"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Mail className="size-3.5 text-[#FF4625]" />
              <span className="truncate">Email</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("google");
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-['Orbitron',sans-serif] ${
                activeTab === "google"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="truncate">Google</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("admin-pin");
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-['Orbitron',sans-serif] ${
                activeTab === "admin-pin"
                  ? "bg-amber-500/20 text-amber-500 border border-amber-500/30 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <KeyRound className="size-3.5 text-amber-500" />
              <span className="truncate">Passkey</span>
            </button>
          </div>

          {/* TAB 1: EMAIL & PASSWORD FORM */}
          {activeTab === "email" && (
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {/* Sign In vs Sign Up Mode Switcher */}
              {authMode !== "forgot" && (
                <div className="flex items-center justify-between text-xs pb-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {authMode === "signin" ? "Returning Gamer" : "New Player"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode("signin")}
                      className={`font-semibold cursor-pointer transition-colors ${
                        authMode === "signin"
                          ? "text-[#FF4625] underline underline-offset-4"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Sign In
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setAuthMode("signup")}
                      className={`font-semibold cursor-pointer transition-colors ${
                        authMode === "signup"
                          ? "text-[#FF4625] underline underline-offset-4"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Register
                    </button>
                  </div>
                </div>
              )}

              {/* Full Name field for registration */}
              {authMode === "signup" && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 font-['Orbitron',sans-serif]">
                    Gamer Name / Alias
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Commander Alpha"
                      className="w-full h-11 pl-10 pr-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF4625]/30 focus:border-[#FF4625] transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 font-['Orbitron',sans-serif]">
                    Email Address
                  </label>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full h-11 pl-10 pr-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF4625]/30 focus:border-[#FF4625] transition-all"
                  />
                </div>
              </div>

              {/* Password field */}
              {authMode !== "forgot" && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 font-['Orbitron',sans-serif]">
                      Password
                    </label>
                    {authMode === "signin" && (
                      <button
                        type="button"
                        onClick={() => setAuthMode("forgot")}
                        className="text-[10px] text-[#FF4625] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Minimum 6 characters"
                      className="w-full h-11 pl-10 pr-10 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF4625]/30 focus:border-[#FF4625] transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password for signup */}
              {authMode === "signup" && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 font-['Orbitron',sans-serif]">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Repeat password"
                      className="w-full h-11 pl-10 pr-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF4625]/30 focus:border-[#FF4625] transition-all font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-2xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md cursor-pointer disabled:opacity-50 font-['Orbitron',sans-serif] tracking-wider"
              >
                {loading ? (
                  <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : authMode === "signin" ? (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="size-4 text-[#FF4625]" />
                  </>
                ) : authMode === "signup" ? (
                  <>
                    <span>Create Account & Launch</span>
                    <Sparkles className="size-4 text-[#FF4625]" />
                  </>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <KeyRound className="size-4 text-[#FF4625]" />
                  </>
                )}
              </button>

              {authMode === "forgot" && (
                <button
                  type="button"
                  onClick={() => setAuthMode("signin")}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              )}
            </form>
          )}

          {/* TAB 2: GOOGLE 1-CLICK OAUTH */}
          {activeTab === "google" && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-2">
                <div className="size-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm mx-auto flex items-center justify-center">
                  <svg className="size-6" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white font-['Orbitron',sans-serif] text-sm">
                    Direct Google OAuth 2.0
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Sign in with your Google account in one tap. Official Firebase authentication with encrypted session tokens.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full h-12 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-sm cursor-pointer disabled:opacity-50 font-['Orbitron',sans-serif]"
              >
                {loading ? (
                  <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 3: ADMIN PASSKEY / PIN */}
          {activeTab === "admin-pin" && (
            <form onSubmit={handleAdminPinAuth} className="space-y-3.5 py-1">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1 text-center">
                <div className="size-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-1">
                  <Shield className="size-5" />
                </div>
                <h4 className="font-black text-xs uppercase tracking-wider text-amber-500 font-['Orbitron',sans-serif]">
                  Admin Direct Passkey
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Instant God Mode access without OAuth or domain restrictions.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 font-['Orbitron',sans-serif]">
                  Admin Passkey PIN
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="password"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    required
                    placeholder="Enter Secret Passkey PIN"
                    className="w-full h-11 pl-10 pr-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-2xl bg-linear-to-r from-amber-500 to-[#FF4625] text-white font-black text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md cursor-pointer disabled:opacity-50 font-['Orbitron',sans-serif] tracking-wider"
              >
                {loading ? (
                  <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Unlock Admin God Mode</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Secure Guarantee Footer */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
            <Shield className="size-3 text-emerald-500" />
            <span>256-bit Encrypted Session • POPI Tools 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
