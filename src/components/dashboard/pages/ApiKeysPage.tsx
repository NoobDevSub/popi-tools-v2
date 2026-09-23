"use client";

import React, { useState, useEffect } from "react";
import {
  subscribeToApiKeys,
  createApiKey,
  revokeApiKey,
  deleteApiKey,
  type ApiKeyRecord,
  POPI_PLANS,
  type PopiPlanType,
} from "../../../lib/firebase";
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Ban,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  Lock,
} from "lucide-react";

interface ApiKeysPageProps {
  userId: string;
  userPlan?: string;
  isAdmin?: boolean;
}

export function ApiKeysPage({
  userId,
  userPlan = "free",
  isAdmin = false,
}: ApiKeysPageProps) {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newGeneratedKey, setNewGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planKey = (userPlan.toLowerCase() as PopiPlanType) || "free";
  const planInfo = POPI_PLANS[planKey] || POPI_PLANS.free;

  // Maximum allowed active keys per plan
  const maxKeys = isAdmin
    ? 999
    : planKey === "yearly"
      ? 999
      : planKey === "monthly"
        ? 10
        : planKey === "weekly"
          ? 3
          : 1;

  const activeKeysCount = keys.filter((k) => k.status === "active").length;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsub = subscribeToApiKeys(userId, (records: ApiKeyRecord[]) => {
      setKeys(records);
      setLoading(false);
    });

    return () => unsub();
  }, [userId]);

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    if (activeKeysCount >= maxKeys && !isAdmin) {
      setError(
        `Your ${planInfo.name} plan allows a maximum of ${maxKeys} active API key(s). Please upgrade your plan or revoke an existing key.`,
      );
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const { fullSecretKey } = await createApiKey(userId, keyName.trim());
      setNewGeneratedKey(fullSecretKey);
      setKeyName("");
    } catch (err: any) {
      setError(err.message || "Failed to create API key.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyKey = () => {
    if (!newGeneratedKey) return;
    navigator.clipboard.writeText(newGeneratedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleRevoke = async (keyId: string) => {
    try {
      await revokeApiKey(userId, keyId);
    } catch (err: any) {
      setError(err.message || "Failed to revoke key.");
    }
  };

  const handleDelete = async (keyId: string) => {
    try {
      await deleteApiKey(userId, keyId);
    } catch (err: any) {
      setError(err.message || "Failed to delete key.");
    }
  };

  return (
    <div className="space-y-6 font-['Rajdhani',sans-serif]">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-full bg-linear-to-l from-[#FF4625]/15 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-2xl bg-[#FF4625]/20 border border-[#FF4625]/40 flex items-center justify-center text-[#FF4625] shrink-0">
              <Key className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black font-['Orbitron',sans-serif] tracking-wider text-white">
                  Developer API Keys
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono">
                  REALTIME DB
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Connect external bots, companion overlays, and prediction engines securely to POPI Tools.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowModal(true);
              setNewGeneratedKey(null);
              setError(null);
            }}
            disabled={activeKeysCount >= maxKeys && !isAdmin}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-[#FF4625] to-amber-500 hover:opacity-90 text-white font-black text-xs font-['Orbitron',sans-serif] tracking-wide transition-all shadow-md cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            <Plus className="size-4" />
            <span>Generate New Key</span>
          </button>
        </div>

        {/* Quota Strip */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-400">Current Plan:</span>
            <span className="font-bold text-white uppercase font-['Orbitron',sans-serif]">
              {isAdmin ? "GOD MODE" : planInfo.name}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Active Keys:</span>
            <span className="font-bold text-[#FF4625] font-mono">
              {activeKeysCount} / {isAdmin ? "Unlimited" : maxKeys}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Lock className="size-3 text-emerald-400" />
            <span>Encrypted with SHA-256 mask. Full keys are never stored in plaintext.</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
          <AlertTriangle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Modal: Create Key & Reveal Secret Once */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-white space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Key className="size-5 text-[#FF4625]" />
                <h3 className="font-['Orbitron',sans-serif] font-black text-sm text-white">
                  {newGeneratedKey ? "Key Created Successfully" : "Generate Live API Key"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setNewGeneratedKey(null);
                }}
                className="text-slate-400 hover:text-white text-xs font-bold font-['Orbitron',sans-serif] cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {newGeneratedKey ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Important:</strong> Copy and store this secret key now. For your security, this full key will <strong>never be displayed again</strong>.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-['Orbitron',sans-serif]">
                    Your Secret Live Key
                  </label>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-emerald-400 break-all select-all font-bold">
                      {newGeneratedKey}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white shrink-0 cursor-pointer transition-colors"
                      title="Copy Key"
                    >
                      {copiedKey ? (
                        <Check className="size-4 text-emerald-400" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setNewGeneratedKey(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-white text-slate-950 font-black text-xs font-['Orbitron',sans-serif] hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  I have copied my key securely
                </button>
              </div>
            ) : (
              <form onSubmit={handleGenerateKey} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 font-['Orbitron',sans-serif]">
                    Key Name / Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="e.g. My Discord Prediction Bot, Overlays..."
                    className="w-full h-11 px-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FF4625]/40 focus:border-[#FF4625]"
                  />
                  <p className="text-[10px] text-slate-400">
                    A friendly label to identify where this key is being used.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !keyName.trim()}
                    className="px-4 py-2 rounded-xl bg-linear-to-r from-[#FF4625] to-amber-500 text-white text-xs font-black font-['Orbitron',sans-serif] hover:opacity-90 cursor-pointer disabled:opacity-50"
                  >
                    {isCreating ? "Generating..." : "Generate Key"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Keys List Table */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-500" />
            <h3 className="font-['Orbitron',sans-serif] font-bold text-sm text-slate-900 dark:text-white">
              Active & Revoked API Keys
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {keys.length} total
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono">
            Loading API keys from Firebase Realtime Database...
          </div>
        ) : keys.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <Key className="size-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-medium">
              No API keys generated yet. Click "Generate New Key" above to create your first secret key.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((k) => (
              <div
                key={k.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white font-['Orbitron',sans-serif]">
                      {k.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-['Orbitron',sans-serif] ${
                        k.status === "active"
                          ? "bg-emerald-500/20 text-emerald-500"
                          : "bg-rose-500/20 text-rose-500"
                      }`}
                    >
                      {k.status}
                    </span>
                  </div>

                  <div className="font-mono text-xs text-slate-600 dark:text-slate-300 select-all">
                    {k.maskedKey}
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" /> Created:{" "}
                      {new Date(k.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>Last used: {k.lastUsedAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {k.status === "active" ? (
                    <button
                      type="button"
                      onClick={() => handleRevoke(k.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-rose-500/20 hover:text-rose-500 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                      title="Revoke key access immediately"
                    >
                      <Ban className="size-3.5" />
                      <span>Revoke</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDelete(k.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-rose-500/20 hover:text-rose-500 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                      title="Delete revoked key record"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
