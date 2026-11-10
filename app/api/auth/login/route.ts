
import { NextRequest, NextResponse } from "next/server";
import { isIP } from "node:net";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

import { shopLoginSchema } from "@/lib/validations/auth.validation";

import { checkLoginRateLimit } from "@/lib/services/login-rate-limit.service";
import { validateCsrfRequest } from "@/lib/services/csrf.service";

import {
  createShopSession,
  getShopSession,
  revokeShopSession,
  shopSessionConfig,
} from "@/lib/services/shop-session.service";

import { checkShopSubscriptionAccess } from "@/lib/services/subscription-access.service";
import { getShopLoginPermissions } from "@/lib/services/shop-login-permissions.service";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  Pragma: "no-cache",
  Expires: "0",
};

function jsonResponse(
  body: Record<string, unknown>,
  status: number
) {
  return NextResponse.json(body, {
    status,
    headers: NO_STORE_HEADERS,
  });
}

function clearShopSession(response: NextResponse) {
  response.cookies.set({
    name: shopSessionConfig.cookieName,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}

function getSubscriptionMessage(reason: string): string {
  switch (reason) {
    case "NO_SUBSCRIPTION":
    case "PAYMENT_REQUIRED":
      return "Your shop subscription payment is pending. Please contact Helpaz.";

    case "EXPIRED":
      return "Your shop subscription has expired. Please renew your subscription.";

    case "SUSPENDED":
      return "Your shop subscription is suspended. Please contact Helpaz.";

    case "CANCELLED":
      return "Your shop subscription has been cancelled. Please contact Helpaz.";

    case "CHECK_FAILED":
    case "INVALID_SUBSCRIPTION":
      return "We couldn't verify your shop subscription. Please try again later.";

    default:
      return "Your shop subscription does not currently allow POS access.";
  }
}

function getClientIp(request: NextRequest): string | null {
  // Only trust the Vercel-provided forwarded client IP.
  const ip = request.headers
    .get("x-vercel-forwarded-for")
    ?.trim();

  if (!ip || isIP(ip) === 0) {
    return null;
  }

  return ip;
}

export async function POST(request: NextRequest) {
  // 1. Validate request origin before processing credentials.
  const csrfError = validateCsrfRequest(request);

  if (csrfError) {
    csrfError.headers.set(
      "Cache-Control",
      NO_STORE_HEADERS["Cache-Control"]
    );
    csrfError.headers.set("Pragma", "no-cache");
    csrfError.headers.set("Expires", "0");

    return csrfError;
  }

  let supabaseClient: Awaited<ReturnType<typeof createClient>> | null =
    null;

  let authenticated = false;
  let newShopSessionToken: string | null = null;

  // Revoke the previous browser session if its token is available.
  async function revokePreviousShopSession() {
    const previousToken = request.cookies.get(
      shopSessionConfig.cookieName
    )?.value;

    if (!previousToken) return;

    try {
      const previousSession = await getShopSession(previousToken);

      if (previousSession) {
        await revokeShopSession(previousToken);
      }
    } catch (error) {
      console.error(
        "Previous shop session revocation failed:",
        error
      );

      throw new Error("SESSION_REVOCATION_FAILED");
    }
  }

  async function signOutSupabase() {
    if (!supabaseClient || !authenticated) return;

    try {
      const { error } = await supabaseClient.auth.signOut({
        scope: "local",
      });

      if (error) {
        console.error("Supabase sign-out failed:", error);
      }
    } catch (error) {
      console.error("Supabase sign-out exception:", error);
    } finally {
      authenticated = false;
    }
  }

  async function rejectAuthenticated(
    message: string,
    status: number,
    reason?: string
  ) {
    try {
      await revokePreviousShopSession();
    } catch (error) {
      console.error("Session cleanup failed:", error);

      // Do not silently report an ordinary authentication rejection
      // when previous session cleanup has failed.
      await signOutSupabase();

      return clearShopSession(
        jsonResponse(
          {
            success: false,
            message: "Unable to complete login. Please try again.",
          },
          500
        )
      );
    }

    await signOutSupabase();

    return clearShopSession(
      jsonResponse(
        {
          success: false,
          message,
          ...(reason ? { reason } : {}),
        },
        status
      )
    );
  }

  try {
    // 2. Initialize Supabase client inside the error-handling block.
    supabaseClient = await createClient();

    // 3. Parse request body.
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonResponse(
        {
          success: false,
          message: "Invalid request body.",
        },
        400
      );
    }

    // 4. Validate credentials.
    const validation = shopLoginSchema.safeParse(body);

    if (!validation.success) {
      return jsonResponse(
        {
          success: false,
          message: "Please check your login details.",
          errors: validation.error.flatten().fieldErrors,
        },
        400
      );
    }

    const { shopCode, email, password } = validation.data;

    // 5. Apply account and IP rate limits.
    let rateLimit;

    try {
      rateLimit = await checkLoginRateLimit({
        email,
        shopCode,
        ipAddress: getClientIp(request),
      });
    } catch (error) {
      console.error("Login rate-limit check failed:", error);

      return jsonResponse(
        {
          success: false,
          message:
            "Login is temporarily unavailable. Please try again later.",
        },
        503
      );
    }

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many login attempts. Please try again later.",
        },
        {
          status: 429,
          headers: {
            ...NO_STORE_HEADERS,
            "Retry-After": String(
              Math.max(1, rateLimit.retryAfterSeconds)
            ),
          },
        }
      );
    }

    // 6. Authenticate using Supabase Auth.
    const { data: authData, error: authError } =
      await supabaseClient.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

    if (authError || !authData.user) {
      try {
        await revokePreviousShopSession();
      } catch (error) {
        console.error(
          "Previous session revocation failed:",
          error
        );

        return clearShopSession(
          jsonResponse(
            {
              success: false,
              message:
                "Unable to complete login. Please try again.",
            },
            500
          )
        );
      }

      await signOutSupabase();

      return clearShopSession(
        jsonResponse(
          {
            success: false,
            message: "Invalid shop code, email, or password.",
          },
          401
        )
      );
    }

    authenticated = true;

    const userId = authData.user.id;

    // 7. Revoke the previous custom session before creating a new one.
    await revokePreviousShopSession();

    // 8. Create server-side admin client.
    const admin = createAdminClient();

    // 9. Find the requested shop.
    const { data: shop, error: shopError } = await admin
      .from("shops")
      .select("id, shop_code, name, business_type, status")
      .eq("shop_code", shopCode.trim().toUpperCase())
      .maybeSingle();

    if (shopError) {
      throw new Error("SHOP_LOOKUP_FAILED");
    }

    if (!shop) {
      return await rejectAuthenticated(
        "Invalid shop code, email, or password.",
        401
      );
    }

    // 10. Verify shop status.
    if (shop.status !== "ACTIVE") {
      return await rejectAuthenticated(
        "This shop is currently unavailable. Please contact Helpaz.",
        403
      );
    }

    // 11. Verify membership for this exact shop and user.
    const { data: membership, error: membershipError } =
      await admin
        .from("shop_memberships")
        .select("id, role, status")
        .eq("shop_id", shop.id)
        .eq("user_id", userId)
        .maybeSingle();

    if (membershipError) {
      throw new Error("MEMBERSHIP_LOOKUP_FAILED");
    }

    if (
      !membership ||
      membership.status !== "ACTIVE" ||
      !["SHOP_ADMIN", "SHOP_USER"].includes(membership.role)
    ) {
      return await rejectAuthenticated(
        "Invalid shop code, email, or password.",
        401
      );
    }

    // 12. Verify subscription access.
    const subscriptionAccess =
      await checkShopSubscriptionAccess(shop.id);

    if (!subscriptionAccess.allowed) {
      const isVerificationFailure = [
        "CHECK_FAILED",
        "INVALID_SUBSCRIPTION",
      ].includes(subscriptionAccess.reason);

      return await rejectAuthenticated(
        getSubscriptionMessage(subscriptionAccess.reason),
        isVerificationFailure ? 503 : 403,
        subscriptionAccess.reason
      );
    }

    // 13. Load account permissions.
    const permissions = await getShopLoginPermissions({
      shopId: shop.id,
      userId,
      role: membership.role as "SHOP_ADMIN" | "SHOP_USER",
    });

    // 14. Create new opaque server-side session.
    newShopSessionToken = await createShopSession({
      userId,
      shopId: shop.id,
    });

    // 15. Build login response.
    const response = jsonResponse(
      {
        success: true,
        message: "Login successful.",
        data: {
          user: {
            id: authData.user.id,
            email: authData.user.email,
          },
          shop: {
            id: shop.id,
            shopCode: shop.shop_code,
            name: shop.name,
            businessType: shop.business_type,
          },
          membership: {
            id: membership.id,
            role: membership.role,
          },
          permissions,
          subscription: {
            accessType:
              subscriptionAccess.reason === "GRACE_PERIOD"
                ? "GRACE_PERIOD"
                : "ACTIVE",
          },
        },
      },
      200
    );

    // 16. Issue secure HTTP-only cookie.
    response.cookies.set({
      name: shopSessionConfig.cookieName,
      value: newShopSessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: shopSessionConfig.maxAge,
    });

    return response;
  } catch (error) {
    console.error("Shop login error:", error);

    // Revoke a newly created session if login completion fails.
    if (newShopSessionToken) {
      try {
        await revokeShopSession(newShopSessionToken);
      } catch (revokeError) {
        console.error(
          "New shop session cleanup failed:",
          revokeError
        );
      }
    }

    // Clear Supabase Auth session.
    await signOutSupabase();

    const response = jsonResponse(
      {
        success: false,
        message: "Unable to complete login. Please try again.",
      },
      500
    );

    return clearShopSession(response);
  }
}
