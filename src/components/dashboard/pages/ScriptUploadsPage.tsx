"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  uploadScriptFile,
  deleteScriptFile,
  subscribeToUserUploads,
  getUserUsage,
  type UploadRecord,
  type UserUsageData,
  POPI_PLANS,
  type PopiPlanType,
} from "../../../lib/firebase";
import {
  UploadCloud,
  FileCode,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  HardDrive,
} from "lucide-react";

interface ScriptUploadsPageProps {
  userId: string;
  userPlan?: string;
  isAdmin?: boolean;
}

export function ScriptUploadsPage({
  userId,
  userPlan = "free",
  isAdmin = false,
}: ScriptUploadsPageProps) {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [usage, setUsage] = useState<UserUsageData>({
    uploadCount: 0,
    remainingUploads: 4,
    lastUploadReset: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const planKey = (userPlan.toLowerCase() as PopiPlanType) || "free";
  const planInfo = POPI_PLANS[planKey] || POPI_PLANS.free;
  const weeklyQuota = isAdmin ? 9999 : planInfo.uploadsPerWeek;

  // Subscribe to uploaded scripts
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsub = subscribeToUserUploads(userId, (records: UploadRecord[]) => {
      setUploads(records);
      setLoading(false);
    });

    return () => unsub();
  }, [userId]);

  // Load and sync weekly usage
  const refreshUsage = async () => {
    if (!userId) return;
    try {
      const u = await getUserUsage(userId);
      setUsage(u);
    } catch (err) {
      console.warn("Usage fetch error:", err);
    }
  };

  useEffect(() => {
    refreshUsage();
  }, [userId, uploads.length]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check weekly limit
    if (!isAdmin && usage.remainingUploads <= 0) {
      setErrorMessage(
        `Weekly upload quota reached (${usage.uploadCount}/${weeklyQuota} used). Upgrade your plan or wait for the weekly reset.`,
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await uploadScriptFile(userId, file, (prog: any) => {
        setUploadProgress(prog.percentage);
      });
      setSuccessMessage(`"${file.name}" uploaded and registered successfully!`);
      await refreshUsage();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setErrorMessage(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (uploadId: string, fileName: string) => {
    try {
      await deleteScriptFile(userId, uploadId, fileName);
      setSuccessMessage(`File "${fileName}" deleted.`);
      await refreshUsage();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete file.");
    }
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6 font-['Rajdhani',sans-serif]">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-full bg-linear-to-l from-emerald-500/15 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <UploadCloud className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black font-['Orbitron',sans-serif] tracking-wider text-white">
                  Script & Algorithm Uploads
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono">
                  FIREBASE STORAGE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Upload custom gaming scripts, telemetry models, and prediction rules for sandboxed execution.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".js,.ts,.json,.py,.lua,.txt,.zip,.cpp"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || (!isAdmin && usage.remainingUploads <= 0)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white font-black text-xs font-['Orbitron',sans-serif] tracking-wide transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className="size-4" />
              <span>{uploading ? `Uploading ${uploadProgress}%` : "Select Script File"}</span>
            </button>
          </div>
        </div>

        {/* Weekly Quota Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-slate-400">Weekly Quota:</span>
              <span className="font-bold text-white font-mono">
                {usage.uploadCount} / {isAdmin ? "Unlimited" : weeklyQuota} Used
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-bold">
                {isAdmin ? "God Mode" : `${usage.remainingUploads} Remaining this week`}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Resets every 7 days automatically
            </div>
          </div>

          {/* Progress bar for weekly usage */}
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usage.remainingUploads <= 0
                  ? "bg-rose-500"
                  : usage.remainingUploads <= 1
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
              style={{
                width: `${Math.min(
                  100,
                  isAdmin ? 10 : (usage.uploadCount / Math.max(1, weeklyQuota)) * 100,
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
          <AlertTriangle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Uploading progress indicator */}
      {uploading && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Uploading to Firebase Storage...</span>
            <span className="text-emerald-400 font-bold">{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Uploads List */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <HardDrive className="size-4 text-emerald-500" />
            <h3 className="font-['Orbitron',sans-serif] font-bold text-sm text-slate-900 dark:text-white">
              My Script Vault
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {uploads.length} uploaded files
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono">
            Loading uploaded scripts from Firebase Storage...
          </div>
        ) : uploads.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <FileCode className="size-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-medium">
              No custom scripts uploaded yet. Supported formats: .js, .ts, .json, .py, .lua, .txt (Max 10MB).
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {uploads.map((file) => (
              <div
                key={file.uploadId}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-slate-200 dark:bg-slate-700/60 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                    <FileCode className="size-5 text-[#FF4625]" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white font-['Orbitron',sans-serif]">
                        {file.fileName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-500 font-['Orbitron',sans-serif]">
                        {file.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                      <span>{formatSize(file.fileSize)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(file.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {file.downloadUrl && (
                    <a
                      href={file.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                      title="Download script"
                    >
                      <Download className="size-3.5" />
                      <span>Download</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(file.uploadId, file.fileName)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-rose-500/20 hover:text-rose-500 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                    title="Delete script from storage"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
