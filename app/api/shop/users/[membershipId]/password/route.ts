// app/api/shop/users/[membershipId]/password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";

import {
  requireShopContext,
  ShopContextError,
} from "@/lib/services/require-shop-context.service";

import { validateCsrfRequest } from "@/lib/services/csrf.service";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
};

// Keep this >= the minimum set in Supabase (Auth -> Providers -> Email).
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer."),
});

type RouteContext = {
  params: Promise<{
    membershipId: string;
  }>;
};

function errorResponse(message: string, code: string, status: number) {
  return NextResponse.json(
    { success: false, message, code },
    { status, headers: NO_STORE_HEADERS }
  );
}

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

function handleRouteError(error: unknown) {
  if (error instanceof ShopContextError) {
    return errorResponse(error.message, error.code, error.status);
  }

  // Never log the request body: it contains the new password.
  console.error("Shop user password reset API failed.");

  return errorResponse(
    "Unable to reset the password.",
    "PASSWORD_RESET_API_FAILED",
    500
  );
}

// POST: Set a new password for a Shop User in the caller's shop.
export async function POST(request: NextRequest, { params }: RouteContext) {
  const csrfError = validateCsrfRequest(request);

  if (csrfError) {
    csrfError.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    csrfError.headers.set("Pragma", "no-cache");
    return csrfError;
  }

  try {
    const context = await requireShopContext();

    const { membershipId } = await params;

    if (!isValidUuid(membershipId)) {
      return errorResponse(
        "Invalid membership ID.",
        "INVALID_MEMBERSHIP_ID",
        400
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return errorResponse(
        "Invalid JSON request body.",
        "INVALID_REQUEST_BODY",
        400
      );
    }

    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues[0]?.message ?? "Invalid password.",
        "VALIDATION_ERROR",
        400
      );
    }

    const admin = createAdminClient();

    // Verify the target membership belongs to this shop and is a Shop User
    // (so an admin can't reset another admin or the owner through this route).
    const { data: targetMembership, error: membershipError } = await admin
      .from("shop_memberships")
      .select("id, user_id, role, status")
      .eq("id", membershipId)
      .eq("shop_id", context.shopId)
      .maybeSingle();

    if (membershipError) {
      return errorResponse(
        "Unable to verify Shop User membership.",
        "MEMBERSHIP_LOOKUP_FAILED",
        503
      );
    }

    if (
      !targetMembership ||
      targetMembership.role !== "SHOP_USER" ||
      !["ACTIVE", "SUSPENDED"].includes(targetMembership.status)
    ) {
      return errorResponse(
        "Shop User membership not found.",
        "SHOP_USER_NOT_FOUND",
        404
      );
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(
      targetMembership.user_id,
      { password: validation.data.password }
    );

    if (updateError) {
      console.error("Shop user password update failed.");

      return errorResponse(
        updateError.message || "Unable to reset the password.",
        "PASSWORD_RESET_FAILED",
        updateError.status && updateError.status < 500
          ? updateError.status
          : 500
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Password reset successfully.",
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}