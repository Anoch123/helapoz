
import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

import {
  requireShopContext,
  ShopContextError,
} from "@/lib/services/require-shop-context.service";

import {
  getShopUserPermissions,
  ShopUserPermissionServiceError,
} from "@/lib/services/shop-user-permission.service";

import { validateCsrfRequest } from "@/lib/services/csrf.service";

import {
  updateShopUserPermissionsSchema,
} from "@/lib/validations/shop-user-permission.validation";

// export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
};

type RouteContext = {
  params: Promise<{
    membershipId: string;
  }>;
};

function errorResponse(
  message: string,
  code: string,
  status: number
) {
  return NextResponse.json(
    {
      success: false,
      message,
      code,
    },
    {
      status,
      headers: NO_STORE_HEADERS,
    }
  );
}

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

function handleRouteError(error: unknown) {
  if (
    error instanceof ShopContextError ||
    error instanceof ShopUserPermissionServiceError
  ) {
    return errorResponse(error.message, error.code, error.status);
  }

  console.error("Shop user permission API failed.");

  return errorResponse(
    "Unable to process Shop User permissions.",
    "PERMISSION_API_FAILED",
    500
  );
}

// GET: Retrieve currently assigned active permissions.
export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const context = await requireShopContext();

    // if (context.membership.role !== "SHOP_ADMIN") {
    //   return errorResponse(
    //     "You are not authorized to manage permissions.",
    //     "FORBIDDEN",
    //     403
    //   );
    // }

    const { membershipId } = await params;

    if (!isValidUuid(membershipId)) {
      return errorResponse(
        "Invalid membership ID.",
        "INVALID_MEMBERSHIP_ID",
        400
      );
    }

    const permissions = await getShopUserPermissions(
      context.shopId,
      membershipId
    );

    return NextResponse.json(
      {
        success: true,
        data: permissions,
      },
      {
        status: 200,
        headers: NO_STORE_HEADERS,
      }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

// PUT: Replace all assigned permissions.
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  const csrfError = validateCsrfRequest(request);

  if (csrfError) {
    csrfError.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    csrfError.headers.set("Pragma", "no-cache");
    return csrfError;
  }

  try {
    const context = await requireShopContext();

    // if (context.membership.role !== "SHOP_ADMIN") {
    //   return errorResponse(
    //     "You are not authorized to manage permissions.",
    //     "FORBIDDEN",
    //     403
    //   );
    // }

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

    const validation =
      updateShopUserPermissionsSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues[0]?.message ??
          "Invalid permission data.",
        "VALIDATION_ERROR",
        400
      );
    }

    const requestedPermissions = validation.data.permissions;

    const admin = createAdminClient();

    // Verify target membership belongs to this shop.
    const { data: targetMembership, error: membershipError } =
      await admin
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
      targetMembership.status !== "ACTIVE"
    ) {
      return errorResponse(
        "Active Shop User membership not found.",
        "SHOP_USER_NOT_FOUND",
        404
      );
    }

    // Validate permission keys against the active database catalogue.
    if (requestedPermissions.length > 0) {
      const { data: activePermissions, error: permissionError } =
        await admin
          .from("permissions")
          .select("permission_key")
          .in("permission_key", requestedPermissions)
          .eq("active", true)
          .eq("is_active", true);

      if (permissionError) {
        return errorResponse(
          "Unable to validate requested permissions.",
          "PERMISSION_VALIDATION_FAILED",
          503
        );
      }

      const validKeys = new Set(
        (activePermissions ?? []).map(
          (permission) => permission.permission_key
        )
      );

      const hasInvalidPermission = requestedPermissions.some(
        (permissionKey) => !validKeys.has(permissionKey)
      );

      if (hasInvalidPermission) {
        return errorResponse(
          "One or more requested permissions are invalid or inactive.",
          "INVALID_PERMISSIONS",
          400
        );
      }
    }

    // The actor ID comes from the verified session, never the request body.
    const { error: updateError } = await admin.rpc(
      "set_shop_user_permissions",
      {
        p_shop_id: context.shopId,
        p_user_id: targetMembership.user_id,
        p_permission_keys: requestedPermissions,
        p_granted_by: context.userId,
      }
    );

    if (updateError) {
      console.error("Shop user permission update failed.");

      return errorResponse(
        "Unable to update Shop User permissions.",
        "PERMISSION_UPDATE_FAILED",
        500
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Shop User permissions updated successfully.",
        data: requestedPermissions,
      },
      {
        status: 200,
        headers: NO_STORE_HEADERS,
      }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
