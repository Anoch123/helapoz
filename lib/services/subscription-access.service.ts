import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

interface SubscriptionAccessResult {
  allowed: boolean;
  reason:
    | "ACTIVE"
    | "GRACE_PERIOD"
    | "NO_SUBSCRIPTION"
    | "PAYMENT_REQUIRED"
    | "EXPIRED"
    | "SUSPENDED"
    | "CANCELLED"
    | "INVALID_SUBSCRIPTION"
    | "CHECK_FAILED";
}

export async function checkShopSubscriptionAccess(
  shopId: string
): Promise<SubscriptionAccessResult> {
  const admin = createAdminClient();

  const { data: subscription, error } = await admin
    .from("shop_subscriptions")
    .select(
      "id, status, current_period_end, grace_period_days, created_at"
    )
    .eq("shop_id", shopId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Subscription lookup failed:", error);

    return {
      allowed: false,
      reason: "CHECK_FAILED",
    };
  }

  if (!subscription) {
    return {
      allowed: false,
      reason: "NO_SUBSCRIPTION",
    };
  }

  const now = Date.now();

  switch (subscription.status) {
    case "ACTIVE": {
      if (!subscription.current_period_end) {
        return {
          allowed: false,
          reason: "INVALID_SUBSCRIPTION",
        };
      }

      const periodEnd = new Date(
        subscription.current_period_end
      ).getTime();

      if (!Number.isFinite(periodEnd)) {
        return {
          allowed: false,
          reason: "INVALID_SUBSCRIPTION",
        };
      }

      if (now < periodEnd) {
        return {
          allowed: true,
          reason: "ACTIVE",
        };
      }

      return {
        allowed: false,
        reason: "EXPIRED",
      };
    }

    case "PAST_DUE": {
      if (!subscription.current_period_end) {
        return {
          allowed: false,
          reason: "INVALID_SUBSCRIPTION",
        };
      }

      const periodEnd = new Date(
        subscription.current_period_end
      ).getTime();

      if (!Number.isFinite(periodEnd)) {
        return {
          allowed: false,
          reason: "INVALID_SUBSCRIPTION",
        };
      }

      const graceDeadline =
        periodEnd +
        subscription.grace_period_days * 24 * 60 * 60 * 1000;

      if (now <= graceDeadline) {
        return {
          allowed: true,
          reason: "GRACE_PERIOD",
        };
      }

      return {
        allowed: false,
        reason: "EXPIRED",
      };
    }

    case "PENDING_PAYMENT":
      return {
        allowed: false,
        reason: "PAYMENT_REQUIRED",
      };

    case "SUSPENDED":
      return {
        allowed: false,
        reason: "SUSPENDED",
      };

    case "CANCELLED":
      return {
        allowed: false,
        reason: "CANCELLED",
      };

    default:
      return {
        allowed: false,
        reason: "INVALID_SUBSCRIPTION",
      };
  }
}