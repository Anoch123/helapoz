
import "server-only";

import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

import {
  getShopSession,
  shopSessionConfig,
} from "@/lib/services/shop-session.service";

import { checkShopSubscriptionAccess } from "@/lib/services/subscription-access.service";

export class ShopContextError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string
  ) {
    super(message);
    this.name = "ShopContextError";
  }
}

export type ShopContext = {
  userId: string;
  shopId: string;

  shop: {
    id: string;
    shopCode: string;
    name: string;
    businessType: string | null;
  };

  membership: {
    id: string;
    role: "SHOP_ADMIN" | "SHOP_USER";
  };

  subscription: {
    accessType: "ACTIVE" | "GRACE_PERIOD";
  };
};

export async function requireShopContext(): Promise<ShopContext> {
  try {
    // 1. Verify the authenticated Supabase user.
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new ShopContextError(
        "Authentication required.",
        401,
        "UNAUTHENTICATED"
      );
    }

    // 2. Read the opaque shop session cookie.
    const cookieStore = await cookies();

    const sessionToken = cookieStore.get(
      shopSessionConfig.cookieName
    )?.value;

    if (!sessionToken) {
      throw new ShopContextError(
        "Shop session not found.",
        401,
        "SHOP_SESSION_MISSING"
      );
    }

    // 3. Validate the session against the database.
    let session;

    try {
      session = await getShopSession(sessionToken);
    } catch {
      throw new ShopContextError(
        "Unable to verify your shop session.",
        503,
        "SHOP_SESSION_CHECK_FAILED"
      );
    }

    if (!session) {
      throw new ShopContextError(
        "Shop session is invalid or expired.",
        401,
        "INVALID_SHOP_SESSION"
      );
    }

    // 4. Ensure the session belongs to the authenticated user.
    if (session.userId !== user.id) {
      throw new ShopContextError(
        "Shop session does not match the authenticated user.",
        401,
        "SESSION_USER_MISMATCH"
      );
    }

    // 5. Create the trusted server-side database client.
    const admin = createAdminClient();

    // 6. Verify that the shop is still active.
    const { data: shop, error: shopError } = await admin
      .from("shops")
      .select("id, shop_code, name, business_type, status")
      .eq("id", session.shopId)
      .maybeSingle();

    if (shopError) {
      console.error("Shop context lookup failed.");

      throw new ShopContextError(
        "Unable to verify shop status.",
        503,
        "SHOP_LOOKUP_FAILED"
      );
    }

    if (!shop || shop.status !== "ACTIVE") {
      throw new ShopContextError(
        "This shop is unavailable.",
        403,
        "SHOP_UNAVAILABLE"
      );
    }

    // 7. Verify that the user's membership is still active.
    const { data: membership, error: membershipError } = await admin
      .from("shop_memberships")
      .select("id, role, status")
      .eq("shop_id", shop.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipError) {
      console.error("Shop membership validation failed.");

      throw new ShopContextError(
        "Unable to verify shop membership.",
        503,
        "MEMBERSHIP_LOOKUP_FAILED"
      );
    }

    if (!membership || membership.status !== "ACTIVE") {
      throw new ShopContextError(
        "Your shop membership is unavailable.",
        403,
        "MEMBERSHIP_INACTIVE"
      );
    }

    // 8. Validate the membership role.
    if (
      membership.role !== "SHOP_ADMIN" &&
      membership.role !== "SHOP_USER"
    ) {
      throw new ShopContextError(
        "Your shop membership role is invalid.",
        403,
        "INVALID_MEMBERSHIP_ROLE"
      );
    }

    // 9. Recheck subscription access.
    const subscriptionAccess = await checkShopSubscriptionAccess(
      shop.id
    );

    if (!subscriptionAccess.allowed) {
      if (
        subscriptionAccess.reason === "CHECK_FAILED" ||
        subscriptionAccess.reason === "INVALID_SUBSCRIPTION"
      ) {
        throw new ShopContextError(
          "Unable to verify shop subscription.",
          503,
          "SUBSCRIPTION_CHECK_FAILED"
        );
      }

      throw new ShopContextError(
        "Your shop subscription does not currently allow POS access.",
        403,
        subscriptionAccess.reason
      );
    }

    // 10. Return only server-verified context.
    return {
      userId: user.id,
      shopId: shop.id,

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

      subscription: {
        accessType:
          subscriptionAccess.reason === "GRACE_PERIOD"
            ? "GRACE_PERIOD"
            : "ACTIVE",
      },
    };
  } catch (error) {
    // Preserve expected authorization errors.
    if (error instanceof ShopContextError) {
      throw error;
    }

    // Do not expose unexpected internal errors to API consumers.
    console.error("Unexpected shop context authorization failure.");

    throw new ShopContextError(
      "Unable to authorize your shop session.",
      500,
      "SHOP_AUTHORIZATION_FAILED"
    );
  }
}
