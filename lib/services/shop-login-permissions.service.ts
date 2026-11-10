
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type ShopRole = "SHOP_ADMIN" | "SHOP_USER";

interface GetShopLoginPermissionsInput {
  shopId: string;
  userId: string;
  role: ShopRole;
}

export async function getShopLoginPermissions({
  shopId,
  userId,
  role,
}: GetShopLoginPermissionsInput): Promise<string[]> {
  const supabase = createAdminClient();

  // Load permissions that are enabled in both existing columns.
  const { data: activePermissions, error: permissionsError } =
    await supabase
      .from("permissions")
      .select("permission_key")
      .eq("active", true)
      .eq("is_active", true)
      .order("permission_key");

  if (permissionsError) {
    console.error("Permission catalogue error:", permissionsError);
    throw new Error("FAILED_TO_LOAD_PERMISSION_CATALOGUE");
  }

  const activeKeys = (activePermissions ?? []).map(
    (permission) => permission.permission_key
  );

  // Shop Admin receives all active permissions.
  if (role === "SHOP_ADMIN") {
    return activeKeys;
  }

  // Shop User receives only explicitly assigned permissions.
  const { data: assignedPermissions, error: assignedError } =
    await supabase
      .from("shop_user_permissions")
      .select("permission_key")
      .eq("shop_id", shopId)
      .eq("user_id", userId);

  if (assignedError) {
    console.error("Assigned permissions error:", assignedError);
    throw new Error("FAILED_TO_LOAD_ASSIGNED_PERMISSIONS");
  }

  const activePermissionSet = new Set(activeKeys);

  return [
    ...new Set(
      (assignedPermissions ?? [])
        .map((permission) => permission.permission_key)
        .filter((key) => activePermissionSet.has(key))
    ),
  ].sort();
}
