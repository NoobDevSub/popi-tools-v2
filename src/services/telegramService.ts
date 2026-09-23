/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Telegram Service (Frontend client)
 * Handles Channel Membership verification, Bot direct links, and payment notifications
 */

export interface TelegramConfig {
  botUsername: string;
  botUrl: string;
  publicChannelId: string;
  publicChannelUsername: string;
  publicChannelUrl: string;
  privateChannelId: string;
  privateChannelInvite: string;
}

export const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  botUsername: "POPIGRAM_BOT",
  botUrl: "https://t.me/POPIGRAM_BOT",
  publicChannelId: "-1003759389458",
  publicChannelUsername: "popitools",
  publicChannelUrl: "https://t.me/popitools",
  privateChannelId: "-1003715355703",
  privateChannelInvite: "https://t.me/+ene57Ep0tj04ODE1",
};

export interface MembershipVerificationResult {
  success: boolean;
  isMember: boolean;
  status?: string;
  message?: string;
  channelId?: string;
  numericId?: number;
}

/**
 * Fetch official Telegram bot and channel configuration
 */
export async function getTelegramConfig(): Promise<TelegramConfig> {
  try {
    const res = await fetch("/api/telegram/config");
    if (!res.ok) return DEFAULT_TELEGRAM_CONFIG;
    const data = await res.json();
    return {
      botUsername: data.botUsername || DEFAULT_TELEGRAM_CONFIG.botUsername,
      botUrl: data.botUrl || DEFAULT_TELEGRAM_CONFIG.botUrl,
      publicChannelId: data.publicChannelId || DEFAULT_TELEGRAM_CONFIG.publicChannelId,
      publicChannelUsername: data.publicChannelUsername || DEFAULT_TELEGRAM_CONFIG.publicChannelUsername,
      publicChannelUrl: data.publicChannelUrl || DEFAULT_TELEGRAM_CONFIG.publicChannelUrl,
      privateChannelId: data.privateChannelId || DEFAULT_TELEGRAM_CONFIG.privateChannelId,
      privateChannelInvite: data.privateChannelInvite || DEFAULT_TELEGRAM_CONFIG.privateChannelInvite,
    };
  } catch (_e) {
    return DEFAULT_TELEGRAM_CONFIG;
  }
}

/**
 * Verifies if user has joined the official POPI channel(s)
 */
export async function verifyChannelMembership(
  userIdentifier: string,
  userId?: string,
  targetChannelId?: string
): Promise<MembershipVerificationResult> {
  try {
    const cleanHandle = userIdentifier.trim();
    if (!cleanHandle) {
      return {
        success: false,
        isMember: false,
        message: "Please enter your Telegram handle or ID.",
      };
    }

    const res = await fetch("/api/telegram/check-membership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userIdentifier: cleanHandle,
        userId: userId || "current_user",
        targetChannelId,
      }),
    });

    const data = await res.json();
    return {
      success: Boolean(data.success),
      isMember: Boolean(data.isMember),
      status: data.status,
      message: data.message || (data.isMember ? "Membership verified!" : "Not found in channel."),
      channelId: data.channelId,
      numericId: data.numericId,
    };
  } catch (error: any) {
    console.error("[Telegram Client] Membership verification error:", error);
    return {
      success: false,
      isMember: false,
      message: "Network error connecting to verification server: " + error.message,
    };
  }
}

/**
 * Dispatches a payment notification via Telegram bot to channels & user DM
 */
export async function triggerTelegramPaymentNotification(params: {
  userId?: string;
  userEmail?: string;
  telegramHandle?: string;
  planName: string;
  amount: number;
  orderId: string;
  utr?: string;
  source?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch("/api/telegram/notify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    return {
      success: Boolean(data.success),
      message: data.message || "Notification sent.",
    };
  } catch (error: any) {
    console.error("[Telegram Client] Payment notification trigger error:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}
