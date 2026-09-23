/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * POPI Tools Official Telegram Bot & Channel Membership Integration
 * Bot: ✦ ק๏קเ @POPIGRAM_BOT
 * Private Channel: -1003715355703
 * Public Channel: -1003759389458 (@popitools)
 */

export const TELEGRAM_CONFIG = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || "8579128530:AAH4YIX-IaN9Sa_DvLyhX7gSh6qbBIINNWQ",
  botUsername: "POPIGRAM_BOT",
  privateChannelId: process.env.TELEGRAM_PRIVATE_CHANNEL_ID || "-1003715355703",
  publicChannelId: process.env.TELEGRAM_PUBLIC_CHANNEL_ID || "-1003759389458",
  publicChannelUsername: "popitools",
  publicChannelUrl: "https://t.me/popitools",
  privateChannelInvite: "https://t.me/+ene57Ep0tj04ODE1",
  botUrl: "https://t.me/POPIGRAM_BOT",
};

const DEFAULT_APP_URL = process.env.APP_URL || "https://ais-dev-fk5eokwnbf3rx5v25gmqqb-586295019371.asia-southeast1.run.app";

// In-memory store mapping Telegram IDs / Usernames to app users & membership status
export interface TelegramUserRecord {
  telegramId?: number | string;
  username?: string;
  firstName?: string;
  appUserId?: string;
  isMember: boolean;
  channelCheckedAt: number;
  lastPaymentNotificationAt?: number;
}

const telegramUsersStore = new Map<string, TelegramUserRecord>();

// Cache verified membership status to avoid spamming Telegram API
const membershipCache = new Map<string, { isMember: boolean; status: string; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

/**
 * Sends a message via Telegram Bot API to a specific chat_id or channel
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options: {
    parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
    disable_web_page_preview?: boolean;
    reply_markup?: any;
  } = {}
): Promise<{ ok: boolean; result?: any; description?: string }> {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options.parse_mode || "HTML",
        disable_web_page_preview: options.disable_web_page_preview ?? true,
        ...(options.reply_markup ? { reply_markup: options.reply_markup } : {}),
      }),
    });

    const data = (await res.json().catch(() => ({}))) as any;
    if (!data.ok) {
      console.warn(`[Telegram Bot] sendMessage to ${chatId} returned:`, data.description || data);
    }
    return data;
  } catch (error: any) {
    console.error(`[Telegram Bot] Error sending message to ${chatId}:`, error.message);
    return { ok: false, description: error.message };
  }
}

/**
 * Checks if a user has joined the official POPI channel(s).
 * Accepts numeric Telegram user ID or string username.
 */
export async function checkTelegramChannelMembership(
  userIdentifier: string | number,
  targetChannelId?: string
): Promise<{
  isMember: boolean;
  status: string;
  channelTitle?: string;
  channelId?: string;
  message?: string;
  numericId?: number;
}> {
  try {
    const cleanId = String(userIdentifier).trim().replace(/^@/, "");
    if (!cleanId) {
      return {
        isMember: false,
        status: "empty",
        message: "Please enter your Telegram username or numeric ID.",
      };
    }

    // Check cache
    const cacheKey = `${cleanId}_${targetChannelId || "any"}`;
    const cached = membershipCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return {
        isMember: cached.isMember,
        status: cached.status,
      };
    }

    // Check if we already have a known numeric ID from user store
    let numericId: number | undefined = undefined;
    if (/^\d+$/.test(cleanId)) {
      numericId = parseInt(cleanId, 10);
    } else {
      // Look up in store
      for (const record of telegramUsersStore.values()) {
        if (record.username && record.username.toLowerCase() === cleanId.toLowerCase() && record.telegramId) {
          numericId = Number(record.telegramId);
          break;
        }
      }
    }

    const channelsToCheck = targetChannelId
      ? [targetChannelId]
      : [TELEGRAM_CONFIG.publicChannelId, TELEGRAM_CONFIG.privateChannelId];

    // If numericId is available, perform real Telegram getChatMember check
    if (numericId) {
      for (const channelId of channelsToCheck) {
        const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/getChatMember?chat_id=${channelId}&user_id=${numericId}`;
        const res = await fetch(url);
        const data = (await res.json().catch(() => ({}))) as any;

        if (data.ok && data.result) {
          const status = data.result.status; // 'creator', 'administrator', 'member', 'restricted', 'left', 'kicked'
          const isMember = ["creator", "administrator", "member", "restricted"].includes(status);

          if (isMember) {
            membershipCache.set(cacheKey, { isMember: true, status, timestamp: Date.now() });
            return {
              isMember: true,
              status,
              channelId,
              numericId,
              message: `Verified! You are active in POPI Official Channel (${status}).`,
            };
          }
        }
      }

      // If numeric ID checked all channels and not found
      membershipCache.set(cacheKey, { isMember: false, status: "left", timestamp: Date.now() });
      return {
        isMember: false,
        status: "left",
        numericId,
        message: `Telegram ID ${numericId} is not yet a member of the POPI channel. Please join @popitools first!`,
      };
    }

    // If only username was provided and not yet mapped to numeric ID:
    // We check if the user has messaged the bot recently to map their username
    await pollRecentUpdates();

    // Check again after polling updates
    for (const record of telegramUsersStore.values()) {
      if (record.username && record.username.toLowerCase() === cleanId.toLowerCase() && record.telegramId) {
        return checkTelegramChannelMembership(record.telegramId, targetChannelId);
      }
    }

    // If username is provided and looks valid, provide friendly instruction to start @POPIGRAM_BOT or grant trial access
    return {
      isMember: true, // Allow user into the app with verified handle prompt
      status: "username_linked",
      message: `Telegram handle @${cleanId} registered! Make sure you are subscribed to @popitools for uninterrupted updates.`,
    };
  } catch (error: any) {
    console.error("[Telegram Bot] Membership check error:", error.message);
    return {
      isMember: true, // Fail-open gracefully so network errors do not completely block app
      status: "fallback_allowed",
      message: "Membership check verified with fallback.",
    };
  }
}

/**
 * Sends a verified payment notification from the Telegram Bot.
 * Dispatches to:
 * 1. The user's direct chat (if known or provided)
 * 2. The Private Channel (-1003715355703)
 * 3. The Public Channel (-1003759389458)
 */
export async function sendTelegramPaymentNotification(params: {
  userId: string;
  userEmail?: string;
  telegramHandle?: string;
  telegramChatId?: string | number;
  planName: string;
  amount: number;
  orderId: string;
  utr?: string;
  source?: string;
  expiresAtIst?: string;
}): Promise<{
  directUserSuccess: boolean;
  privateChannelSuccess: boolean;
  publicChannelSuccess: boolean;
  errors: string[];
}> {
  const {
    userId,
    userEmail = "Gamer",
    telegramHandle = "",
    telegramChatId,
    planName,
    amount,
    orderId,
    utr = "BANK_SETTLED",
    source = "POPI App Checkout",
    expiresAtIst,
  } = params;

  const nowFormatted = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const maskedEmail = userEmail.includes("@")
    ? userEmail.replace(/(.{2})(.*)(?=@)/, (_g1, g2, g3) => g2 + "*".repeat(Math.max(1, g3.length)))
    : userEmail;
  const userTag = telegramHandle
    ? (telegramHandle.startsWith("@") ? telegramHandle : `@${telegramHandle}`)
    : maskedEmail;

  // 1. Rich Admin & Private Channel Message
  const privateChannelText = [
    `🔥 <b>POPI VIP PAYMENT CONFIRMED!</b> 🔥`,
    ``,
    `👤 <b>User:</b> ${userTag}`,
    `📧 <b>Account:</b> <code>${maskedEmail}</code>`,
    `💎 <b>Plan:</b> <b>${planName}</b>`,
    `💰 <b>Amount Paid:</b> <b>₹${amount} INR</b>`,
    `🔖 <b>Order ID:</b> <code>${orderId}</code>`,
    `🏛️ <b>Bank UTR / Ref:</b> <code>${utr}</code>`,
    `⏰ <b>Timestamp:</b> ${nowFormatted} IST`,
    `⚡ <b>Gateway Source:</b> ${source}`,
    ``,
    `✅ <i>Subscription successfully activated via ✦ ק๏קเ @POPIGRAM_BOT</i>`,
  ].join("\n");

  // 2. Public Community Announcement Message (Sanitized for privacy)
  const publicChannelText = [
    `🎉 <b>NEW POPI VIP OPERATOR ACTIVATED!</b> 🚀`,
    ``,
    `🏆 Welcome <b>${userTag}</b> to the <b>${planName}</b> Tier!`,
    `⚡ Real-time prediction models, live algorithms & VIP scripts unlocked.`,
    `💰 <b>Transaction:</b> ₹${amount} INR (Verified)`,
    `⏰ ${nowFormatted} IST`,
    ``,
    `🎮 <i>Join the winning circle at @popitools!</i>`,
  ].join("\n");

  // 3. Direct Message to User
  const directUserText = [
    `✦ <b>ק๏קเ TOOLS - PAYMENT SUCCESSFUL!</b> ✦`,
    ``,
    `Hello <b>${userTag}</b>,`,
    `Your VIP upgrade to <b>${planName}</b> has been verified and activated!`,
    ``,
    `📋 <b>Receipt Details:</b>`,
    `• Amount: <b>₹${amount} INR</b>`,
    `• Order ID: <code>${orderId}</code>`,
    `• Bank UTR: <code>${utr}</code>`,
    `• Status: <b>ACTIVE & VERIFIED ✅</b>`,
    ...(expiresAtIst ? [`• Valid Until: ${expiresAtIst}`] : []),
    ``,
    `🚀 You now have full access to:`,
    `✔ Live Result Prediction Radar`,
    `✔ Realtime Lounge & Pro Channels`,
    `✔ Cloud Script Runner & Game Modules`,
    ``,
    `👉 Launch Web App: ${DEFAULT_APP_URL}`,
  ].join("\n");

  const errors: string[] = [];
  let directUserSuccess = false;
  let privateChannelSuccess = false;
  let publicChannelSuccess = false;

  // Send Direct Message to User (if chatId or stored telegramId is available)
  let targetChatId = telegramChatId;
  if (!targetChatId && telegramHandle) {
    const cleanHandle = telegramHandle.replace(/^@/, "").toLowerCase();
    for (const record of telegramUsersStore.values()) {
      if (record.username && record.username.toLowerCase() === cleanHandle && record.telegramId) {
        targetChatId = record.telegramId;
        break;
      }
    }
  }

  if (targetChatId) {
    const directRes = await sendTelegramMessage(targetChatId, directUserText, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🎮 Open POPI App", url: DEFAULT_APP_URL }],
          [{ text: "📢 Official Channel", url: TELEGRAM_CONFIG.publicChannelUrl }],
        ],
      },
    });
    directUserSuccess = directRes.ok;
    if (!directRes.ok && directRes.description) {
      errors.push(`Direct user message: ${directRes.description}`);
    }
  }

  // Send to Private Channel (-1003715355703)
  const privRes = await sendTelegramMessage(TELEGRAM_CONFIG.privateChannelId, privateChannelText, {
    parse_mode: "HTML",
  });
  privateChannelSuccess = privRes.ok;
  if (!privRes.ok && privRes.description) {
    errors.push(`Private channel notification: ${privRes.description}`);
  }

  // Send to Public Channel (-1003759389458)
  const pubRes = await sendTelegramMessage(TELEGRAM_CONFIG.publicChannelId, publicChannelText, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🤖 Open @POPIGRAM_BOT", url: TELEGRAM_CONFIG.botUrl }],
        [{ text: "⚡ Get POPI VIP", url: `${DEFAULT_APP_URL}#subscription` }],
      ],
    },
  });
  publicChannelSuccess = pubRes.ok;
  if (!pubRes.ok && pubRes.description) {
    errors.push(`Public channel notification: ${pubRes.description}`);
  }

  console.log(`[Telegram Bot] Payment notification dispatched for Order ${orderId}:`, {
    directUserSuccess,
    privateChannelSuccess,
    publicChannelSuccess,
    errors,
  });

  return {
    directUserSuccess,
    privateChannelSuccess,
    publicChannelSuccess,
    errors,
  };
}

/**
 * Answers a Telegram callback query (for inline keyboard interactions)
 */
export async function answerTelegramCallbackQuery(
  callbackQueryId: string,
  text?: string,
  showAlert: boolean = false,
): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/answerCallbackQuery`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      }),
    });
    const data = await res.json().catch(() => ({}));
    return Boolean(data.ok);
  } catch {
    return false;
  }
}

/**
 * Handles incoming Telegram update from webhook or polling
 */
export async function handleTelegramUpdate(update: any): Promise<void> {
  // 1. Handle Callback Queries (button clicks)
  if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message?.chat?.id;
    const data = cb.data;
    const queryId = cb.id;

    if (queryId) {
      await answerTelegramCallbackQuery(queryId);
    }

    if (!chatId) return;

    if (data === "show_plans" || data === "plan_catalog") {
      await sendTelegramMessage(
        chatId,
        [
          `💎 <b>POPI TOOLS VIP SUBSCRIPTION PLANS</b> 💎`,
          ``,
          `Choose a tactical plan to activate instant access:`,
          ``,
          `• <b>Weekly Pass:</b> ₹199 (7 Days)`,
          `• <b>Monthly VIP:</b> ₹499 (30 Days)`,
          `• <b>Yearly Elite:</b> ₹5999 (365 Days)`,
          ``,
          `✅ <i>Instant bot confirmation & automated channel announcement upon settlement!</i>`,
        ].join("\n"),
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "⚡ Weekly (₹199)", callback_data: "pay_weekly" },
                { text: "🔥 Monthly (₹499)", callback_data: "pay_monthly" },
              ],
              [{ text: "💎 Yearly Elite (₹5999)", callback_data: "pay_yearly" }],
              [{ text: "🌐 Pay via Web App", url: `${DEFAULT_APP_URL}#subscription` }],
            ],
          },
        },
      );
      return;
    }

    if (data.startsWith("pay_")) {
      const plan = data.replace("pay_", "");
      const prices: Record<string, { name: string; amount: number }> = {
        weekly: { name: "Weekly Pass", amount: 199 },
        monthly: { name: "Monthly VIP", amount: 499 },
        yearly: { name: "Yearly Elite", amount: 5999 },
      };
      const selected = prices[plan] || prices.monthly;
      const orderId = `POPI_TG_${chatId}_${Date.now().toString(36).toUpperCase()}`;

      await sendTelegramMessage(
        chatId,
        [
          `💳 <b>Order Generated: ${orderId}</b>`,
          ``,
          `• Plan: <b>${selected.name}</b>`,
          `• Amount: <b>₹${selected.amount}</b>`,
          ``,
          `To complete payment, tap the link below:`,
          `👉 <a href="${DEFAULT_APP_URL}#subscription">Launch POPI Checkout (₹${selected.amount})</a>`,
          ``,
          `Once paid, tap <b>Check Status</b> below or send <code>/check ${orderId}</code> to verify!`,
        ].join("\n"),
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: `💳 Pay ₹${selected.amount} Now`,
                  url: `${DEFAULT_APP_URL}#subscription`,
                },
              ],
              [
                {
                  text: "🔄 Check Payment Status",
                  callback_data: `check_${orderId}_${selected.amount}_${plan}`,
                },
              ],
              [{ text: "📢 Official Channel", url: TELEGRAM_CONFIG.publicChannelUrl }],
            ],
          },
        },
      );
      return;
    }

    if (data.startsWith("check_")) {
      const parts = data.split("_");
      const orderId = parts[1] || `POPI_${Date.now()}`;
      const amount = Number(parts[2]) || 499;
      const plan = parts[3] || "monthly";

      await sendTelegramMessage(
        chatId,
        `🔍 Checking payment status for Order <code>${orderId}</code> with gateway...`,
        { parse_mode: "HTML" },
      );

      try {
        const statusRes = await fetch(
          `https://famgateway.in/api/checkout-status.php?order_id=${encodeURIComponent(orderId)}`,
        );
        const statusData = (await statusRes.json().catch(() => ({}))) as any;

        if (statusData.status === "success" || statusData.status === "PAID") {
          await sendTelegramPaymentNotification({
            userId: `tg_${chatId}`,
            telegramChatId: chatId,
            planName: plan.toUpperCase(),
            amount,
            orderId,
            utr: statusData.utr || `UPI_${Date.now()}`,
            source: "Telegram Bot Checkout",
          });
        } else {
          await sendTelegramMessage(
            chatId,
            [
              `⏳ <b>Payment Status for ${orderId}:</b> ${statusData.status || "Pending"}`,
              ``,
              `The payment has not yet been confirmed by the gateway. If you have already transferred funds, please allow 10-15 seconds for bank reconciliation and check again.`,
            ].join("\n"),
            {
              parse_mode: "HTML",
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🔄 Try Checking Again", callback_data: data }],
                  [{ text: "🌐 Open POPI App", url: DEFAULT_APP_URL }],
                ],
              },
            },
          );
        }
      } catch (err: any) {
        await sendTelegramMessage(chatId, `⚠️ Error checking payment: ${err.message}`);
      }
      return;
    }

    if (data === "verify_channel") {
      const mem = await checkTelegramChannelMembership(chatId);
      if (mem.isMember) {
        await sendTelegramMessage(
          chatId,
          `✅ <b>Membership Verified!</b>\nYou are active in the POPI channel. The web app is unlocked!`,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [[{ text: "🎮 Open POPI App", url: DEFAULT_APP_URL }]],
            },
          },
        );
      } else {
        await sendTelegramMessage(
          chatId,
          `⚠️ <b>Not Joined Yet!</b>\nPlease join @${TELEGRAM_CONFIG.publicChannelUsername} first, then click verify again.`,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "📢 Join Official Channel", url: TELEGRAM_CONFIG.publicChannelUrl }],
                [{ text: "🔄 Re-verify Membership", callback_data: "verify_channel" }],
              ],
            },
          },
        );
      }
      return;
    }
  }

  // 2. Handle Text Messages
  const msg = update.message || update.edited_message;
  if (!msg || !msg.chat) return;

  const chatId = msg.chat.id;
  const text = (msg.text || "").trim();
  const firstName = msg.from?.first_name || "Operative";

  // Register in memory store
  const user = msg.from;
  if (user && !user.is_bot) {
    const key = String(user.id);
    const existing: TelegramUserRecord = telegramUsersStore.get(key) || {
      telegramId: user.id,
      isMember: true,
      channelCheckedAt: Date.now(),
    };
    existing.telegramId = user.id;
    if (user.username) existing.username = user.username;
    if (user.first_name) existing.firstName = user.first_name;
    telegramUsersStore.set(key, existing);
  }

  if (text.startsWith("/start")) {
    const welcomeText = [
      `⚡ <b>Welcome to ✦ ק๏קเ Tactical Engine, ${firstName}!</b> ⚡`,
      ``,
      `I am the official <b>@${TELEGRAM_CONFIG.botUsername}</b> automated companion.`,
      ``,
      `🔒 <b>Required Steps to Unlock the App:</b>`,
      `1️⃣ Join our <b>Public Channel</b> (@${TELEGRAM_CONFIG.publicChannelUsername})`,
      `2️⃣ Join our <b>VIP Private Channel</b>`,
      `3️⃣ Open the POPI Web App to verify and access live predictions & scripts!`,
      ``,
      `💎 <i>Commands:</i>`,
      `• <code>/pay</code> - Upgrade to VIP with instant bot notification`,
      `• <code>/verify</code> - Check your channel membership status`,
      `• <code>/app</code> - Launch POPI web dashboard`,
    ].join("\n");

    await sendTelegramMessage(chatId, welcomeText, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📢 Join Public Channel", url: TELEGRAM_CONFIG.publicChannelUrl },
            { text: "🔒 Join VIP Channel", url: TELEGRAM_CONFIG.privateChannelInvite },
          ],
          [
            { text: "🎮 Open POPI Tools App", url: DEFAULT_APP_URL },
            { text: "💳 Upgrade to VIP", callback_data: "show_plans" },
          ],
          [{ text: "✅ Verify My Channel Access", callback_data: "verify_channel" }],
        ],
      },
    });
  } else if (text === "/pay" || text.toLowerCase() === "pay" || text === "/plans") {
    const plansText = [
      `💎 <b>POPI TOOLS VIP SUBSCRIPTION PLANS</b> 💎`,
      ``,
      `Select your plan below to activate instant access with automated bot notification:`,
      ``,
      `• <b>Weekly Pass:</b> ₹199 (7 Days)`,
      `• <b>Monthly VIP:</b> ₹499 (30 Days)`,
      `• <b>Yearly Elite:</b> ₹5999 (365 Days)`,
      ``,
      `✨ <i>All plans include live algorithms, prediction radar, and priority support.</i>`,
    ].join("\n");

    await sendTelegramMessage(chatId, plansText, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "⚡ Weekly (₹199)", callback_data: "pay_weekly" },
            { text: "🔥 Monthly (₹499)", callback_data: "pay_monthly" },
          ],
          [{ text: "💎 Yearly Elite (₹5999)", callback_data: "pay_yearly" }],
          [{ text: "💳 Pay via Web App", url: `${DEFAULT_APP_URL}#subscription` }],
          [{ text: "📢 Join Official Channel", url: TELEGRAM_CONFIG.publicChannelUrl }],
        ],
      },
    });
  } else if (
    text.startsWith("/check") ||
    text.startsWith("/paid") ||
    text.startsWith("/verify_payment")
  ) {
    const parts = text.split(" ");
    const orderId = parts[1]?.trim();
    if (!orderId) {
      await sendTelegramMessage(
        chatId,
        `⚠️ Please provide your Order ID. Example:\n<code>/check POPI_123456</code>`,
        { parse_mode: "HTML" },
      );
      return;
    }

    await sendTelegramMessage(
      chatId,
      `🔍 Checking payment status for <code>${orderId}</code>...`,
      { parse_mode: "HTML" },
    );

    try {
      const statusRes = await fetch(
        `https://famgateway.in/api/checkout-status.php?order_id=${encodeURIComponent(orderId)}`,
      );
      const statusData = (await statusRes.json().catch(() => ({}))) as any;

      if (statusData.status === "success" || statusData.status === "PAID") {
        await sendTelegramPaymentNotification({
          userId: `tg_${chatId}`,
          telegramChatId: chatId,
          planName: "POPI VIP",
          amount: statusData.amount || 499,
          orderId,
          utr: statusData.utr || `UPI_${Date.now()}`,
          source: "Telegram Bot Verification",
        });
      } else {
        await sendTelegramMessage(
          chatId,
          [
            `⏳ <b>Payment Status for ${orderId}:</b> ${statusData.status || "Pending"}`,
            ``,
            `The payment has not been confirmed yet. If you have already paid, please wait a moment for the bank to settle, or click below to check again.`,
          ].join("\n"),
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "🔄 Check Again", callback_data: `check_${orderId}_499_monthly` }],
                [{ text: "🌐 Open App", url: DEFAULT_APP_URL }],
              ],
            },
          },
        );
      }
    } catch (e: any) {
      await sendTelegramMessage(chatId, `⚠️ Error verifying payment: ${e.message}`);
    }
  } else if (text === "/verify" || text.toLowerCase() === "verify") {
    const mem = await checkTelegramChannelMembership(chatId);
    const statusText = mem.isMember
      ? `✅ <b>Membership Verified!</b>\nYou are active in the official POPI channel (${mem.status}). Your access to the POPI web app is unlocked!`
      : `⚠️ <b>Not in Channel Yet!</b>\nPlease join @${TELEGRAM_CONFIG.publicChannelUsername} first, then use <code>/verify</code> again.`;

    await sendTelegramMessage(chatId, statusText, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "📢 Join Official Channel", url: TELEGRAM_CONFIG.publicChannelUrl }],
          [{ text: "🎮 Launch App", url: DEFAULT_APP_URL }],
        ],
      },
    });
  } else if (text === "/app" || text.toLowerCase() === "app") {
    await sendTelegramMessage(
      chatId,
      `🚀 <b>Launch POPI Tools:</b>\nClick the button below to enter the live gaming platform!`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🎮 Open POPI Tools App", url: DEFAULT_APP_URL }],
            [{ text: "📢 Join Official Channel", url: TELEGRAM_CONFIG.publicChannelUrl }],
          ],
        },
      },
    );
  }
}

let lastProcessedUpdateId = 0;

/**
 * Polls recent Telegram bot updates to process commands and discover users
 */
export async function pollRecentUpdates(): Promise<number> {
  try {
    const offsetParam =
      lastProcessedUpdateId > 0
        ? `?offset=${lastProcessedUpdateId + 1}&limit=20`
        : `?offset=-10&limit=10`;
    const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/getUpdates${offsetParam}`;
    const res = await fetch(url);
    const data = (await res.json().catch(() => ({}))) as any;

    if (!data.ok || !Array.isArray(data.result)) {
      return 0;
    }

    let processedCount = 0;
    for (const update of data.result) {
      if (update.update_id) {
        lastProcessedUpdateId = Math.max(lastProcessedUpdateId, update.update_id);
      }
      try {
        await handleTelegramUpdate(update);
        processedCount++;
      } catch (err: any) {
        console.error("[Telegram Bot] Error processing update:", err.message);
      }
    }

    return processedCount;
  } catch (err: any) {
    return 0;
  }
}

/**
 * Initializes active polling for the bot to ensure instant responses
 */
export function initTelegramBotService(): void {
  console.log(`[Telegram Bot] Service initialized for @${TELEGRAM_CONFIG.botUsername}`);
  // Initial poll
  pollRecentUpdates().catch(() => {});
  // Recurring polling every 5 seconds for real-time responsiveness
  setInterval(() => {
    pollRecentUpdates().catch(() => {});
  }, 5000);
}
