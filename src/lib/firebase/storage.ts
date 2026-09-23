import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTaskSnapshot,
} from "firebase/storage";
import { storage } from "./config";
import { recordUpload, deleteUploadRecord, type UploadRecord } from "./database";

// Allowed extensions for gaming scripts and algorithms
const ALLOWED_EXTENSIONS = [
  "js",
  "ts",
  "json",
  "py",
  "lua",
  "txt",
  "zip",
  "cpp",
  "md",
  "csv",
  "html",
  "xml",
];

// Maximum allowed upload size: 10MB
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  state: "running" | "paused" | "success" | "error";
}

/**
 * Validates a script file before upload
 */
export function validateScriptFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File exceeds maximum size of 10MB (Selected: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  const parts = file.name.split(".");
  const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `File type .${ext} is not supported. Supported script formats: ${ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Uploads a user's script to Firebase Cloud Storage under users/{uid}/uploads/{uploadId}/{fileName}.
 * Automatically records metadata in Realtime Database and counts against weekly limit.
 */
export async function uploadScriptFile(
  uid: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadRecord> {
  const validation = validateScriptFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const uploadId = `up_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  // Clean file name to prevent directory traversal
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileStoragePath = `users/${uid}/uploads/${uploadId}/${safeName}`;
  const fileRef = storageRef(storage, fileStoragePath);

  return new Promise<UploadRecord>((resolve, reject) => {
    const uploadTask = uploadBytesResumable(fileRef, file, {
      contentType: file.type || "text/plain",
      customMetadata: {
        originalName: file.name,
        uploadedBy: uid,
        timestamp: new Date().toISOString(),
      },
    });

    uploadTask.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        const percentage = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        );
        if (onProgress) {
          onProgress({
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            percentage,
            state: snapshot.state as any,
          });
        }
      },
      (error) => {
        console.error("[Firebase Storage] Upload failed:", error);
        reject(new Error(error.message || "Script upload failed. Check network or storage permissions."));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const record = await recordUpload(uid, {
            uid,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type || "script",
            downloadUrl,
          });
          resolve(record);
        } catch (err: any) {
          reject(new Error("Upload finished but failed to save database record: " + err.message));
        }
      },
    );
  });
}

/**
 * Deletes a file from Firebase Storage and removes its Realtime Database record
 */
export async function deleteScriptFile(
  uid: string,
  uploadId: string,
  fileName: string,
): Promise<void> {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileStoragePath = `users/${uid}/uploads/${uploadId}/${safeName}`;
  const fileRef = storageRef(storage, fileStoragePath);

  try {
    await deleteObject(fileRef);
  } catch (err) {
    // If already missing from storage, proceed to delete record
    console.warn("[Firebase Storage] Notice deleting file:", err);
  }

  await deleteUploadRecord(uid, uploadId);
}
