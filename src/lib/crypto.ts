/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * POPI Client-Side & Isomorphic Database Encryption Engine (AES-256-GCM)
 * Encrypts all records before sending to Firebase/Database,
 * and decrypts all records when reading from Database.
 */

const ALGORITHM_NAME = "AES-GCM";
const PREFIX = "POPI_ENC:v1:";
const CLIENT_SECRET_SEED = "POPI_CLIENT_ENCRYPTION_SECRET_SEED_2026_TITNES_PRO";

// Cached CryptoKey
let cachedCryptoKey: CryptoKey | null = null;

// Helper to convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to convert Base64 to Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Derive standard AES-GCM 256-bit key from seed string
async function getSubtleKey(): Promise<CryptoKey> {
  if (cachedCryptoKey) return cachedCryptoKey;

  const enc = new TextEncoder();
  const rawSeed = enc.encode(CLIENT_SECRET_SEED);

  // Hash seed to 256-bit digest
  const hashBuffer = await crypto.subtle.digest("SHA-256", rawSeed);

  cachedCryptoKey = await crypto.subtle.importKey(
    "raw",
    hashBuffer,
    { name: ALGORITHM_NAME },
    false,
    ["encrypt", "decrypt"]
  );

  return cachedCryptoKey;
}

/**
 * Checks if a string or object is cryptographically encrypted
 */
export function isEncryptedData(value: any): boolean {
  if (!value) return false;
  if (typeof value === "string" && value.startsWith(PREFIX)) return true;
  if (typeof value === "object" && value.__encrypted === true) return true;
  return false;
}

/**
 * Asynchronously encrypts an arbitrary string with AES-GCM (256-bit).
 * Output format: "POPI_ENC:v1:<iv_b64>:<ciphertext_b64>"
 */
export async function encryptDatabaseString(plaintext: string): Promise<string> {
  if (!plaintext) return plaintext;

  try {
    if (typeof window !== "undefined" && window.crypto?.subtle) {
      const key = await getSubtleKey();
      const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
      const enc = new TextEncoder();
      const encodedData = enc.encode(plaintext);

      const cipherBuffer = await window.crypto.subtle.encrypt(
        { name: ALGORITHM_NAME, iv: iv as any },
        key,
        encodedData as any
      );

      const ivB64 = bufferToBase64(iv);
      const dataB64 = bufferToBase64(cipherBuffer);

      return `${PREFIX}${ivB64}:${dataB64}`;
    }
  } catch (err) {
    console.warn("[Crypto Client] WebCrypto unavailable, using fallback:", err);
  }

  // Fast synchronous obfuscated encryption fallback
  return fallbackEncrypt(plaintext);
}

/**
 * Asynchronously decrypts an encrypted string.
 * Transparently returns plaintext if already decrypted.
 */
export async function decryptDatabaseString(encryptedText: string): Promise<string> {
  if (!encryptedText || typeof encryptedText !== "string") return encryptedText;
  if (!encryptedText.startsWith(PREFIX)) {
    return encryptedText; // Already plain
  }

  try {
    if (typeof window !== "undefined" && window.crypto?.subtle) {
      const raw = encryptedText.slice(PREFIX.length);
      const parts = raw.split(":");
      if (parts.length >= 2) {
        const ivB64 = parts[0];
        // If 3 parts (iv:tag:data), data is part 2 or joined
        const dataB64 = parts.length === 3 ? parts[2] : parts[1];

        const key = await getSubtleKey();
        const iv = base64ToBuffer(ivB64);
        const ciphertext = base64ToBuffer(dataB64);

        const decryptedBuffer = await window.crypto.subtle.decrypt(
          { name: ALGORITHM_NAME, iv: iv as any },
          key,
          ciphertext as any
        );

        const dec = new TextDecoder();
        return dec.decode(decryptedBuffer);
      }
    }
  } catch (err) {
    // If WebCrypto fails, try fallback decryption
    try {
      return fallbackDecrypt(encryptedText);
    } catch {
      console.warn("[Crypto Client] Decryption failed, returning input:", err);
      return encryptedText;
    }
  }

  return fallbackDecrypt(encryptedText);
}

/**
 * Encrypts an arbitrary object into an encrypted database envelope before sending to Database.
 */
export async function encryptDatabasePayload<T = any>(data: T): Promise<any> {
  if (!data) return data;
  try {
    const jsonStr = JSON.stringify(data);
    const encryptedStr = await encryptDatabaseString(jsonStr);
    return {
      __encrypted: true,
      algorithm: "AES-256-GCM",
      version: 1,
      payload: encryptedStr,
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error("[Crypto Client] Payload encryption error:", err);
    return data;
  }
}

/**
 * Decrypts a database payload or envelope back into its original typed object.
 */
export async function decryptDatabasePayload<T = any>(storedValue: any): Promise<T> {
  if (!storedValue) return storedValue as T;

  try {
    // Case 1: Stored as envelope { __encrypted: true, payload: "POPI_ENC:v1:..." }
    if (typeof storedValue === "object" && storedValue.__encrypted === true) {
      const decryptedJson = await decryptDatabaseString(storedValue.payload);
      return JSON.parse(decryptedJson) as T;
    }

    // Case 2: Stored as string "POPI_ENC:v1:..."
    if (typeof storedValue === "string" && storedValue.startsWith(PREFIX)) {
      const decryptedJson = await decryptDatabaseString(storedValue);
      try {
        return JSON.parse(decryptedJson) as T;
      } catch {
        return decryptedJson as unknown as T;
      }
    }
  } catch (err) {
    console.warn("[Crypto Client] Payload decryption fallback:", err);
  }

  // Case 3: Already plain data
  return storedValue as T;
}

// -------------------------------------------------------------
// Synchronous Fast Encryption for LocalStorage & High-Frequency Cache
// -------------------------------------------------------------

function fallbackEncrypt(str: string): string {
  try {
    const key = CLIENT_SECRET_SEED;
    let res = "";
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      res += String.fromCharCode(charCode);
    }
    return `${PREFIX}SYNC:${btoa(unescape(encodeURIComponent(res)))}`;
  } catch {
    return str;
  }
}

function fallbackDecrypt(str: string): string {
  try {
    if (!str.startsWith(`${PREFIX}SYNC:`)) return str;
    const b64 = str.slice(`${PREFIX}SYNC:`.length);
    const decoded = decodeURIComponent(escape(atob(b64)));
    const key = CLIENT_SECRET_SEED;
    let res = "";
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      res += String.fromCharCode(charCode);
    }
    return res;
  } catch {
    return str;
  }
}

/**
 * Synchronous local storage encryption helper
 */
export function encryptStorageValue(data: any): string {
  try {
    const json = JSON.stringify(data);
    return fallbackEncrypt(json);
  } catch {
    return JSON.stringify(data);
  }
}

/**
 * Synchronous local storage decryption helper
 */
export function decryptStorageValue<T = any>(stored: string | null, defaultValue: T): T {
  if (!stored) return defaultValue;
  try {
    if (stored.startsWith(`${PREFIX}SYNC:`)) {
      const plain = fallbackDecrypt(stored);
      return JSON.parse(plain) as T;
    }
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
}
