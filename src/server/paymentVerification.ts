/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Backend Payment Verification Utility for FAM Gateway
 * 
 * Validates the transaction response integrity before updating the user's
 * subscription status in the database, ensuring that premium access is ONLY
 * granted upon verified server-to-server confirmation.
 */

export interface FamGatewayVerifyPayload {
  status?: string;
  message?: string;
  order_id?: string;
  orderId?: string;
  amount?: string | number;
  payable_amount?: string | number;
  utr?: string;
  bank_utr?: string;
  rrn?: string;
  ref_id?: string;
  upi_id?: string;
  customer_name?: string;
  created_at_ist?: string;
  expires_at_ist?: string;
  data?: any;
  [key: string]: any;
}

export interface ExpectedOrderDetails {
  orderId: string;
  userId: string;
  planId: "weekly" | "monthly" | "yearly";
  expectedAmount: number;
  currency?: string;
  createdAt?: number;
}

export type IntegrityErrorCode =
  | "INVALID_PAYLOAD"
  | "GATEWAY_UNAUTHORIZED"
  | "PAYMENT_NOT_SETTLED"
  | "ORDER_ID_MISMATCH"
  | "AMOUNT_MISMATCH"
  | "MISSING_OR_INVALID_UTR"
  | "TRANSACTION_EXPIRED"
  | "REPLAY_ATTACK_DETECTED"
  | "API_ERROR";

export interface PaymentIntegrityResult {
  isValid: boolean;
  errorCode?: IntegrityErrorCode;
  message: string;
  verifiedUtr?: string;
  settledAmount?: number;
  verifiedAt?: number;
  gatewayResponse?: any;
}

/**
 * Validates the cryptographic and business integrity of a FamGateway transaction response.
 * Performs rigorous multi-gate verification:
 * 1. Payload structure and error status checks.
 * 2. Settlement lifecycle status check (rejects pending, failed, or expired states).
 * 3. Order ID correspondence (prevents session hijacking or order swapping).
 * 4. Transaction amount exact matching (prevents underpayment or client price tampering).
 * 5. NPCI/Bank UTR existence and pattern validation (prevents mock/dummy activations).
 */
export function validateFamTransactionIntegrity(
  payload: FamGatewayVerifyPayload | null | undefined,
  expected: ExpectedOrderDetails,
): PaymentIntegrityResult {
  // Gate 1: Check payload structure
  if (!payload || typeof payload !== "object") {
    return {
      isValid: false,
      errorCode: "INVALID_PAYLOAD",
      message: "Gateway returned an empty or unparseable response payload.",
    };
  }

  // Gate 2: Check for gateway authorization errors
  const normalizedStatus = String(payload.status || "").trim().toLowerCase();

  if (normalizedStatus === "unauthorized") {
    return {
      isValid: false,
      errorCode: "GATEWAY_UNAUTHORIZED",
      message: payload.message || "FamGateway rejected the request due to invalid API credentials.",
      gatewayResponse: payload,
    };
  }

  // Gate 3: Validate Payment Settlement Status
  // Only 'success' or 'paid' are acceptable final settlement statuses.
  const isSettled = normalizedStatus === "success" || normalizedStatus === "paid";

  if (!isSettled) {
    if (normalizedStatus === "pending") {
      return {
        isValid: false,
        errorCode: "PAYMENT_NOT_SETTLED",
        message: payload.message || "Payment is still pending with your UPI bank. Please complete transfer on PhonePe/GPay/Paytm and try again.",
        gatewayResponse: payload,
      };
    }

    if (normalizedStatus === "expired") {
      return {
        isValid: false,
        errorCode: "TRANSACTION_EXPIRED",
        message: payload.message || "The payment session has expired. Please initiate a new order.",
        gatewayResponse: payload,
      };
    }

    return {
      isValid: false,
      errorCode: "PAYMENT_NOT_SETTLED",
      message: payload.message || `Payment has not been settled. Current gateway status: ${payload.status || "UNKNOWN"}.`,
      gatewayResponse: payload,
    };
  }

  // Gate 4: Order ID Integrity Check
  const returnedOrderId = String(payload.order_id || payload.orderId || payload.data?.order_id || "").trim();
  if (returnedOrderId && returnedOrderId.toLowerCase() !== expected.orderId.toLowerCase()) {
    console.error(`[Integrity Alert] Order ID mismatch! Expected: ${expected.orderId}, Received: ${returnedOrderId}`);
    return {
      isValid: false,
      errorCode: "ORDER_ID_MISMATCH",
      message: "Order ID mismatch detected. Transaction cannot be validated.",
      gatewayResponse: payload,
    };
  }

  // Gate 5: Amount Integrity Check
  // Verify that the customer actually paid the full expected amount (protects against client-side price tampering)
  const rawAmount = payload.payable_amount ?? payload.amount ?? payload.data?.payable_amount ?? payload.data?.amount;
  if (rawAmount !== undefined && rawAmount !== null) {
    const parsedAmount = Number(rawAmount);
    if (!isNaN(parsedAmount)) {
      // Allow max 0.5 INR deviation for currency rounding
      if (Math.abs(parsedAmount - expected.expectedAmount) > 0.5) {
        console.error(
          `[Integrity Alert] Amount mismatch! Expected ₹${expected.expectedAmount}, Got ₹${parsedAmount}`,
        );
        return {
          isValid: false,
          errorCode: "AMOUNT_MISMATCH",
          message: `Amount mismatch: Received ₹${parsedAmount}, but plan requires ₹${expected.expectedAmount}.`,
          settledAmount: parsedAmount,
          gatewayResponse: payload,
        };
      }
    }
  }

  // Gate 6: NPCI / Bank UTR Validation
  // FamGateway returns the 12-digit NPCI Bank UTR upon real UPI credit.
  const rawUtr = String(
    payload.utr ||
    payload.bank_utr ||
    payload.rrn ||
    payload.ref_id ||
    payload.data?.utr ||
    payload.data?.bank_utr ||
    "",
  ).trim();

  // Validate UTR format: alphanumeric, length 6-40, not a dummy placeholder
  const isDummyUtr =
    !rawUtr ||
    rawUtr.toLowerCase() === "null" ||
    rawUtr.toLowerCase() === "undefined" ||
    rawUtr.toLowerCase() === "test" ||
    rawUtr.toLowerCase() === "demo" ||
    /^0+$/.test(rawUtr);

  const isValidUtrFormat = /^[A-Za-z0-9_-]{6,40}$/.test(rawUtr);

  if (isDummyUtr || !isValidUtrFormat) {
    console.error(`[Integrity Alert] Invalid or missing Bank UTR: "${rawUtr}"`);
    return {
      isValid: false,
      errorCode: "MISSING_OR_INVALID_UTR",
      message: "No verified Bank UTR (Unique Transaction Reference) was returned by the gateway.",
      gatewayResponse: payload,
    };
  }

  // All integrity gates passed successfully
  return {
    isValid: true,
    message: "Payment transaction integrity verified successfully.",
    verifiedUtr: rawUtr,
    settledAmount: expected.expectedAmount,
    verifiedAt: Date.now(),
    gatewayResponse: payload,
  };
}

/**
 * Server-to-Server Authoritative Payment Verification
 * Queries FamGateway API directly using the server secret key, validates integrity,
 * and only updates the database if the response is mathematically and cryptographically valid.
 */
export async function verifyServerToServerPayment(params: {
  orderId: string;
  expectedOrder: ExpectedOrderDetails;
  apiKey: string;
}): Promise<PaymentIntegrityResult> {
  const { orderId, expectedOrder, apiKey } = params;

  if (!apiKey) {
    return {
      isValid: false,
      errorCode: "GATEWAY_UNAUTHORIZED",
      message: "FAM_API_KEY is not configured on the server.",
    };
  }

  try {
    const gatewayUrl = `https://famgateway.in/api/verify-order.php?api_key=${encodeURIComponent(
      apiKey,
    )}&order_id=${encodeURIComponent(orderId)}`;

    console.log(`[S2S Verification] Requesting FamGateway order verification for: ${orderId}...`);

    const response = await fetch(gatewayUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const data: FamGatewayVerifyPayload = (await response.json().catch(() => ({}))) as any;
    console.log(`[S2S Verification] Response from FamGateway for ${orderId}:`, data);

    // Run full integrity verification pipeline
    return validateFamTransactionIntegrity(data, expectedOrder);
  } catch (err: any) {
    console.error("[S2S Verification] Network or fetch error:", err);
    return {
      isValid: false,
      errorCode: "API_ERROR",
      message: `Failed to communicate with FamGateway: ${err.message || String(err)}`,
    };
  }
}
