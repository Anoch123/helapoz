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

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function getValidTimestamp(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp) ? timestamp : null;
}

function denied(
  reason: SubscriptionAccessResult["reason"]
): SubscriptionAccessResult {
  return {
    allowed: false,
    reason,
  };
}

export async function checkShopSubscriptionAccess(
  shopId: string
): Promise<SubscriptionAccessResult> {
  if (typeof shopId !== "string" || !shopId.trim()) {
    return denied("INVALID_SUBSCRIPTION");
  }

  try {
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
      return denied("CHECK_FAILED");
    }

    if (!subscription) {
      return denied("NO_SUBSCRIPTION");
    }

    const now = Date.now();

    switch (subscription.status) {
      case "ACTIVE": {
        const periodEnd = getValidTimestamp(
          subscription.current_period_end
        );

        if (periodEnd === null) {
          return denied("INVALID_SUBSCRIPTION");
        }

        if (now < periodEnd) {
          return {
            allowed: true,
            reason: "ACTIVE",
          };
        }

        return denied("EXPIRED");
      }

      case "PAST_DUE": {
        const periodEnd = getValidTimestamp(
          subscription.current_period_end
        );

        const gracePeriodDays = subscription.grace_period_days;

        if (
          periodEnd === null ||
          typeof gracePeriodDays !== "number" ||
          !Number.isSafeInteger(gracePeriodDays) ||
          gracePeriodDays < 0
        ) {
          return denied("INVALID_SUBSCRIPTION");
        }

        const graceDeadline =
          periodEnd + gracePeriodDays * MILLISECONDS_PER_DAY;

        if (!Number.isFinite(graceDeadline)) {
          return denied("INVALID_SUBSCRIPTION");
        }

        if (now < graceDeadline) {
          return {
            allowed: true,
            reason: "GRACE_PERIOD",
          };
        }

        return denied("EXPIRED");
      }

      case "PENDING_PAYMENT":
        return denied("PAYMENT_REQUIRED");

      case "SUSPENDED":
        return denied("SUSPENDED");

      case "CANCELLED":
        return denied("CANCELLED");

      default:
        return denied("INVALID_SUBSCRIPTION");
    }
  } catch (error) {
    console.error("Subscription access check failed:", error);
    return denied("CHECK_FAILED");
  }
}