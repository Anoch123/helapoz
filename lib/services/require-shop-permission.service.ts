
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireShopContext } from "@/lib/services/require-shop-context.service";

export class ShopPermissionError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string
  ) {
    super(message);
    this.name = "ShopPermissionError";
  }
}

export async function requireShopPermission(permissionKey: string) {
  // 1. Validate the permission key.
  if (
    typeof permissionKey !== "string" ||
    !permissionKey.trim() ||
    permissionKey !== permissionKey.trim()
  ) {
    throw new ShopPermissionError(
      "Access could not be verified. Please contact support.",
      500,
      "INVALID_PERMISSION_KEY"
    );
  }

  // 2. Verify the authenticated shop context.
  const context = await requireShopContext();

  // 3. Shop Admin automatically has full access.
  if (context.membership.role === "SHOP_ADMIN") {
    return context;
  }

  const admin = createAdminClient();

  // 4. Verify that the permission exists and is active.
  const { data: permission, error: permissionError } = await admin
    .from("permissions")
    .select("permission_key")
    .eq("permission_key", permissionKey)
    .eq("active", true)
    .eq("is_active", true)
    .maybeSingle();

  if (permissionError) {
    console.error("Permission catalogue lookup failed:", {
      message: permissionError.message,
      code: permissionError.code,
    });

    throw new ShopPermissionError(
      "We couldn't verify your access right now. Please try again later.",
      503,
      "PERMISSION_CHECK_FAILED"
    );
  }

  if (!permission) {
    throw new ShopPermissionError(
      "This feature is currently unavailable. Please contact your Shop Admin.",
      403,
      "PERMISSION_UNAVAILABLE"
    );
  }

  // 5. Verify that this Shop User has been granted the permission.
  const { data: grantedPermission, error: grantError } = await admin
    .from("shop_user_permissions")
    .select("permission_key")
    .eq("shop_id", context.shopId)
    .eq("user_id", context.userId)
    .eq("permission_key", permissionKey)
    .maybeSingle();

  if (grantError) {
    console.error("Shop user permission lookup failed:", {
      message: grantError.message,
      code: grantError.code,
    });

    throw new ShopPermissionError(
      "We couldn't verify your access right now. Please try again later.",
      503,
      "PERMISSION_CHECK_FAILED"
    );
  }

  if (!grantedPermission) {
    throw new ShopPermissionError(
      "You don't have access to this feature. Please contact your Shop Admin to request permission.",
      403,
      "PERMISSION_DENIED"
    );
  }

  return context;
}
