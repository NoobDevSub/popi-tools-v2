/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Telegram Channel Gate Context
 * Enforces Telegram Channel Membership before granting full app access
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  getTelegramConfig,
  verifyChannelMembership,
  TelegramConfig,
  DEFAULT_TELEGRAM_CONFIG,
} from "../services/telegramService";

interface TelegramGateContextType {
  isChannelJoined: boolean;
  telegramHandle: string;
  setTelegramHandle: (handle: string) => void;
  isChecking: boolean;
  checkStatusMessage: string | null;
  config: TelegramConfig;
  showGateModal: boolean;
  openGateModal: () => void;
  closeGateModal: () => void;
  verifyMembership: (overrideHandle?: string) => Promise<boolean>;
  bypassGateForAdmin: () => void;
  resetGateVerification: () => void;
}

const TelegramGateContext = createContext<TelegramGateContextType | undefined>(undefined);

const STORAGE_KEY_JOINED = "popi_telegram_channel_joined";
const STORAGE_KEY_HANDLE = "popi_telegram_handle";

export function TelegramGateProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, isAdmin } = useAuth();
  const [config, setConfig] = useState<TelegramConfig>(DEFAULT_TELEGRAM_CONFIG);
  const [isChannelJoined, setIsChannelJoined] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_JOINED) === "true";
    } catch {
      return false;
    }
  });
  const [telegramHandle, setTelegramHandleState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_HANDLE) || "";
    } catch {
      return "";
    }
  });
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [checkStatusMessage, setCheckStatusMessage] = useState<string | null>(null);
  const [showGateModal, setShowGateModal] = useState<boolean>(false);

  // Load Telegram configuration from server
  useEffect(() => {
    getTelegramConfig().then(setConfig);
  }, []);

  // Sync profile telegram handle if available
  useEffect(() => {
    if (profile?.telegramHandle && !telegramHandle) {
      setTelegramHandleState(profile.telegramHandle);
    }
  }, [profile, telegramHandle]);

  // If user is verified in profile, mark as joined
  useEffect(() => {
    if ((profile as any)?.telegramVerified) {
      setIsChannelJoined(true);
      try {
        localStorage.setItem(STORAGE_KEY_JOINED, "true");
      } catch {}
    }
  }, [profile]);

  const setTelegramHandle = (handle: string) => {
    setTelegramHandleState(handle);
    try {
      localStorage.setItem(STORAGE_KEY_HANDLE, handle);
    } catch {}
  };

  const verifyMembership = async (overrideHandle?: string): Promise<boolean> => {
    const handleToUse = (overrideHandle !== undefined ? overrideHandle : telegramHandle).trim();
    if (!handleToUse) {
      setCheckStatusMessage("Please enter your Telegram username (e.g. @yourname) or user ID.");
      return false;
    }

    setIsChecking(true);
    setCheckStatusMessage("Connecting to Telegram Bot API...");

    try {
      const result = await verifyChannelMembership(handleToUse, user?.uid);
      setCheckStatusMessage(result.message || (result.isMember ? "Membership confirmed!" : "Not found in channel"));

      if (result.isMember) {
        setIsChannelJoined(true);
        setTelegramHandle(handleToUse);
        try {
          localStorage.setItem(STORAGE_KEY_JOINED, "true");
        } catch {}
        setShowGateModal(false);
        return true;
      }
      return false;
    } catch (err: any) {
      setCheckStatusMessage("Verification error: " + err.message);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const bypassGateForAdmin = () => {
    setIsChannelJoined(true);
    try {
      localStorage.setItem(STORAGE_KEY_JOINED, "true");
    } catch {}
    setShowGateModal(false);
  };

  const resetGateVerification = () => {
    setIsChannelJoined(false);
    try {
      localStorage.removeItem(STORAGE_KEY_JOINED);
    } catch {}
  };

  return (
    <TelegramGateContext.Provider
      value={{
        isChannelJoined,
        telegramHandle,
        setTelegramHandle,
        isChecking,
        checkStatusMessage,
        config,
        showGateModal,
        openGateModal: () => setShowGateModal(true),
        closeGateModal: () => setShowGateModal(false),
        verifyMembership,
        bypassGateForAdmin,
        resetGateVerification,
      }}
    >
      {children}
    </TelegramGateContext.Provider>
  );
}

export function useTelegramGate(): TelegramGateContextType {
  const context = useContext(TelegramGateContext);
  if (!context) {
    throw new Error("useTelegramGate must be used within a TelegramGateProvider");
  }
  return context;
}
