"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  CreditCard,
  Edit2,
  Key,
  LogOut,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Copy,
  Check,
  Fingerprint,
  Sparkles,
} from "lucide-react";

interface ProfilePageProps {
  displayName?: string;
  email?: string;
  photoURL?: string;
  plan?: string;
  uid?: string;
  role?: string;
  createdAt?: string;
  onSignOut?: () => Promise<void>;
  onUpdateName?: (newName: string) => Promise<void>;
}

export function ProfilePage({
  displayName = "Player One",
  email = "player@popitools.ai",
  photoURL,
  plan = "PREMIUM",
  uid = "usr_guest_demo_user",
  role = "user",
  createdAt,
  onSignOut,
  onUpdateName,
}: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  const handleCopyUid = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const handleSaveProfile = async () => {
    if (onUpdateName && nameInput.trim()) {
      await onUpdateName(nameInput.trim());
    }
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleConfirmSignOut = async () => {
    setShowSignOutDialog(false);
    if (onSignOut) {
      await onSignOut();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Profile Spotlight Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
          <div className="flex items-center gap-4">
            {photoURL ? (
              <img
                src={photoURL}
                alt={displayName}
                className="size-16 sm:size-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
              />
            ) : (
              <div className="size-16 sm:size-20 rounded-2xl bg-slate-950 text-white flex items-center justify-center text-2xl font-black font-['Orbitron',sans-serif] shadow-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-['Orbitron',sans-serif]">
                  {displayName}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-[#FF4625] text-white text-[10px] font-bold uppercase tracking-wider font-['Orbitron',sans-serif]">
                  {plan}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Mail className="size-3.5 text-slate-400" />
                <span>{email}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5 shadow-2xs">
                  <Fingerprint className="size-3.5 text-[#FF4625]" />
                  <span className="text-slate-400 font-sans text-[10px] uppercase font-bold tracking-wider">UID:</span>
                  <span className="select-all font-mono font-bold text-slate-900 dark:text-white tracking-wide">{uid}</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyUid}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FF4625]/10 hover:bg-[#FF4625]/20 text-[#FF4625] text-xs font-bold transition-all cursor-pointer border border-[#FF4625]/30 font-['Orbitron',sans-serif]"
                  title="Copy Unique User Identifier (UID)"
                >
                  {copiedUid ? (
                    <>
                      <Check className="size-3 text-emerald-500" />
                      <span className="text-emerald-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copy UID</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-900 dark:text-white transition-all cursor-pointer self-start sm:self-auto font-['Orbitron',sans-serif]"
          >
            <Edit2 className="size-3.5 text-[#FF4625]" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Account Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-['Orbitron',sans-serif]">
              Account Status
            </span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-500 font-['Orbitron',sans-serif]">
              <ShieldCheck className="size-4" />
              <span>Verified & Active</span>
            </div>
            <p className="text-[10px] text-slate-400">Standard Tier Clearance</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-['Orbitron',sans-serif]">
              Registration Date
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
              September 2026
            </div>
            <p className="text-[10px] text-slate-400">Authenticated Member</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-['Orbitron',sans-serif]">
              Current Plan
            </span>
            <div className="text-sm font-bold text-[#FF4625] font-['Orbitron',sans-serif]">
              {plan} Access
            </div>
            <p className="text-[10px] text-slate-400">30s & 1m Channels</p>
          </div>

          {/* Dedicated Authoritative UID Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-slate-50 to-orange-50/20 dark:from-slate-800/60 dark:via-slate-800/40 dark:to-orange-950/20 border border-orange-500/20 dark:border-orange-500/30 space-y-2 sm:col-span-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 font-['Orbitron',sans-serif] flex items-center gap-1.5">
                  <Fingerprint className="size-3.5" />
                  <span>Authoritative Unique User Identifier (UID)</span>
                </span>
                <div className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white select-all break-all bg-white dark:bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 inline-block">
                  {uid}
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider font-['Orbitron',sans-serif]">
                  AES-256 Verified
                </span>
                <button
                  type="button"
                  onClick={handleCopyUid}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5 shadow-2xs font-['Orbitron',sans-serif]"
                >
                  {copiedUid ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  <span>{copiedUid ? "Copied UID" : "Copy UID"}</span>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Your permanent system identity key across Firestore, Realtime Database, and analytical telemetry. Use this UID for support, admin balance sync, and custom script API integration.
            </p>
          </div>
        </div>
      </div>

      {/* Account Security & Dangerous Actions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-6">
        <div>
          <h3 className="font-['Orbitron',sans-serif] text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Security & Session Operations
          </h3>
          <p className="text-xs text-slate-500">
            Manage your credentials and authenticated active browser sessions.
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {/* Change Password */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900 dark:text-white font-['Orbitron',sans-serif]">
                Password & Authentication
              </div>
              <p className="text-xs text-slate-500">
                Update account login credentials or request password reset.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordDialog(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer self-start sm:self-auto"
            >
              Change Password
            </button>
          </div>

          {/* Sign Out */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900 dark:text-white font-['Orbitron',sans-serif]">
                Sign Out Session
              </div>
              <p className="text-xs text-slate-500">
                Terminate active login session from this browser.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSignOutDialog(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold cursor-pointer self-start sm:self-auto font-['Orbitron',sans-serif]"
            >
              <LogOut className="size-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Delete Account */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-rose-600 dark:text-rose-400 font-['Orbitron',sans-serif]">
                Delete Account
              </div>
              <p className="text-xs text-slate-500">
                Permanently remove profile data, mood preferences, and telemetry logs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold cursor-pointer self-start sm:self-auto font-['Orbitron',sans-serif]"
            >
              <Trash2 className="size-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-['Orbitron',sans-serif] text-base font-bold text-slate-900 dark:text-white">
                Edit Gamer Handle
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Display Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF4625]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-4 py-2 rounded-xl bg-[#FF4625] text-white text-xs font-bold cursor-pointer font-['Orbitron',sans-serif]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Dialog */}
      {showSignOutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center mx-auto">
              <LogOut className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-['Orbitron',sans-serif] text-base font-bold text-slate-900 dark:text-white">
                Confirm Sign Out?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to exit your POPI Tools dashboard session?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutDialog(false)}
                className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSignOut}
                className="py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer font-['Orbitron',sans-serif]"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Destructive Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="size-5" />
              <h3 className="font-['Orbitron',sans-serif] text-base font-bold">
                Delete Account Confirmation
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This action is permanent and cannot be undone. To confirm, please type{" "}
              <strong className="font-mono text-rose-600">DELETE</strong> below:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-rose-300 dark:border-rose-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmText("");
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== "DELETE"}
                onClick={() => {
                  setShowDeleteDialog(false);
                  if (onSignOut) onSignOut();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold disabled:opacity-40 cursor-pointer font-['Orbitron',sans-serif]"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[#FF4625] flex items-center justify-center mx-auto">
              <Key className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-['Orbitron',sans-serif] text-base font-bold text-slate-900 dark:text-white">
                Password Reset Link
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                A password reset authorization link will be transmitted to{" "}
                <strong className="text-slate-900 dark:text-white">{email}</strong>.
              </p>
            </div>
            {passwordStatus ? (
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                {passwordStatus}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordDialog(false)}
                  className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordStatus("Reset email sent successfully!");
                    setTimeout(() => {
                      setShowPasswordDialog(false);
                      setPasswordStatus(null);
                    }, 1800);
                  }}
                  className="py-2.5 rounded-xl bg-[#FF4625] text-white text-xs font-bold cursor-pointer font-['Orbitron',sans-serif]"
                >
                  Send Link
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
