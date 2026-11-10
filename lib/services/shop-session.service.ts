import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";

const SESSION_DURATION_SECONDS = 12 * 60 * 60;

export const shopSessionConfig = {
  cookieName: "helapoz_shop_session",
  maxAge: SESSION_DURATION_SECONDS,
};

type CreateShopSessionInput = {
  userId: string;
  shopId: string;
};

export type ShopSession = {
  userId: string;
  shopId: string;
  expiresAt: string;
};

function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function isValidSessionToken(token: unknown): token is string {
  return (
    typeof token === "string" &&
    /^[A-Za-z0-9_-]{43}$/.test(token)
  );
}

/**
 * Creates a new opaque shop session.
 * Only the SHA-256 hash is stored in the database.
 */
export async function createShopSession({
  userId,
  shopId,
}: CreateShopSessionInput): Promise<string> {
  if (
    typeof userId !== "string" ||
    !userId.trim() ||
    typeof shopId !== "string" ||
    !shopId.trim()
  ) {
    throw new Error("Invalid shop session input.");
  }

  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_SECONDS * 1000
  ).toISOString();

  try {
    const supabase = createAdminClient();

    const { error } = await supabase.from("shop_sessions").insert({
      token_hash: tokenHash,
      user_id: userId,
      shop_id: shopId,
      expires_at: expiresAt,
    });

    if (error) {
      console.error("Failed to create shop session:", error);
      throw new Error("Unable to create shop session.");
    }

    return token;
  } catch (error) {
    console.error("Shop session creation failed.");

    if (
      error instanceof Error &&
      error.message === "Unable to create shop session."
    ) {
      throw error;
    }

    throw new Error("Unable to create shop session.");
  }
}

/**
 * Validates an opaque session token.
 * Returns the session context only when it is active and unexpired.
 */
export async function getShopSession(
  token: string
): Promise<ShopSession | null> {
  if (!isValidSessionToken(token)) {
    return null;
  }

  try {
    const supabase = createAdminClient();
    const tokenHash = hashSessionToken(token);

    const { data, error } = await supabase
      .from("shop_sessions")
      .select("user_id, shop_id, expires_at")
      .eq("token_hash", tokenHash)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error("Failed to validate shop session:", error);
      throw new Error("Unable to validate shop session.");
    }

    if (!data) {
      return null;
    }

    return {
      userId: data.user_id,
      shopId: data.shop_id,
      expiresAt: data.expires_at,
    };
  } catch {
    console.error("Shop session validation failed.");
    throw new Error("Unable to validate shop session.");
  }
}

/**
 * Revokes an existing shop session.
 * Repeated revocation is safe and does not cause an error.
 */
export async function revokeShopSession(
  token: string
): Promise<void> {
  if (!isValidSessionToken(token)) {
    return;
  }

  try {
    const supabase = createAdminClient();
    const tokenHash = hashSessionToken(token);

    const { error } = await supabase
      .from("shop_sessions")
      .update({
        revoked_at: new Date().toISOString(),
      })
      .eq("token_hash", tokenHash)
      .is("revoked_at", null);

    if (error) {
      console.error("Failed to revoke shop session:", error);
      throw new Error("Unable to revoke shop session.");
    }
  } catch {
    console.error("Shop session revocation failed.");
    throw new Error("Unable to revoke shop session.");
  }
}