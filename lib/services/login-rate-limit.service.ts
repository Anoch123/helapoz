
import "server-only";

import { createHmac } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";

const RATE_LIMIT_CONFIG = {
  account: {
    maxAttempts: 10,
    windowSeconds: 15 * 60,
    blockSeconds: 15 * 60,
  },
  ip: {
    maxAttempts: 30,
    windowSeconds: 15 * 60,
    blockSeconds: 15 * 60,
  },
};

type LoginRateLimitInput = {
  email: string;
  shopCode: string;
  ipAddress?: string | null;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
  reason?: "ACCOUNT_LIMIT" | "IP_LIMIT";
};

function hashIdentifier(value: string): string {
  const secret = process.env.LOGIN_RATE_LIMIT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("LOGIN_RATE_LIMIT_SECRET is missing or invalid.");
  }

  return createHmac("sha256", secret)
    .update(value)
    .digest("hex");
}

async function consumeRateLimit({
  key,
  maxAttempts,
  windowSeconds,
  blockSeconds,
}: {
  key: string;
  maxAttempts: number;
  windowSeconds: number;
  blockSeconds: number;
}): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const admin = createAdminClient();

  const { data, error } = await admin.rpc(
    "consume_login_rate_limit",
    {
      p_key_hash: key,
      p_max_attempts: maxAttempts,
      p_window_seconds: windowSeconds,
      p_block_seconds: blockSeconds,
    }
  );

  if (error) {
    console.error("Login rate-limit database error:", error);
    throw new Error("Unable to verify login rate limit.");
  }

  const rows = data as
    | Array<{
        allowed: boolean;
        retry_after_seconds: number;
      }>
    | null;

  const result = rows?.[0];

  if (!result) {
    throw new Error("Invalid login rate-limit response.");
  }

  return {
    allowed: result.allowed,
    retryAfterSeconds: result.retry_after_seconds,
  };
}

export async function checkLoginRateLimit({
  email,
  shopCode,
  ipAddress,
}: LoginRateLimitInput): Promise<RateLimitResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedShopCode = shopCode.trim().toUpperCase();

  // 1. Check the email + shop code limit.
  const accountKey = hashIdentifier(
    `account:${normalizedShopCode}:${normalizedEmail}`
  );

  const accountResult = await consumeRateLimit({
    key: accountKey,
    ...RATE_LIMIT_CONFIG.account,
  });

  if (!accountResult.allowed) {
    return {
      ...accountResult,
      reason: "ACCOUNT_LIMIT",
    };
  }

  // 2. Check the IP limit when a client IP is available.
  if (ipAddress) {
    const normalizedIp = ipAddress.trim().toLowerCase();

    const ipKey = hashIdentifier(`ip:${normalizedIp}`);

    const ipResult = await consumeRateLimit({
      key: ipKey,
      ...RATE_LIMIT_CONFIG.ip,
    });

    if (!ipResult.allowed) {
      return {
        ...ipResult,
        reason: "IP_LIMIT",
      };
    }
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}
