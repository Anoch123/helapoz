
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
  // 1. Validate the requested permission key.
  if (
    typeof permissionKey !== "string" ||
    !permissionKey.trim() ||
    permissionKey !== permissionKey.trim()
  ) {
    throw new ShopPermissionError(
      "Invalid permission key.",
      500,
      "INVALID_PERMISSION_KEY"
    );
  }

  // 2. Verify the authenticated shop context.
  const context = await requireShopContext();

  // 3. Shop Admin has full access within their shop.
  if (context.membership.role === "SHOP_ADMIN") {
    return context;
  }

  // 4. Use the database as the permission catalogue.
  const admin = createAdminClient();

  const { data: permission, error: permissionError } = await admin
    .from("permissions")
    .select("permission_key")
    .eq("permission_key", permissionKey)
    .eq("active", true)
    .eq("is_active", true)
    .maybeSingle();

  if (permissionError) {
    console.error("Permission catalogue lookup failed.");

    throw new ShopPermissionError(
      "Unable to verify your permissions.",
      503,
      "PERMISSION_CHECK_FAILED"
    );
  }

  if (!permission) {
    throw new ShopPermissionError(
      "This permission is unavailable.",
      403,
      "PERMISSION_UNAVAILABLE"
    );
  }

  // 5. Check the Shop User's grant in this specific shop.
  const { data: grantedPermission, error: grantError } = await admin
    .from("shop_user_permissions")
    .select("permission_key")
    .eq("shop_id", context.shopId)
    .eq("user_id", context.userId)
    .eq("permission_key", permissionKey)
    .maybeSingle();

  if (grantError) {
    console.error("Shop user permission lookup failed.");

    throw new ShopPermissionError(
      "Unable to verify your permissions.",
      503,
      "PERMISSION_CHECK_FAILED"
    );
  }

  if (!grantedPermission) {
    throw new ShopPermissionError(
      "You do not have permission to perform this operation.",
      403,
      "PERMISSION_DENIED"
    );
  }

  return context;
}
