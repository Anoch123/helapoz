
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export class ShopUserPermissionServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string
  ) {
    super(message);
    this.name = "ShopUserPermissionServiceError";
  }
}

export async function getShopUserPermissions(
  shopId: string,
  membershipId: string
): Promise<string[]> {
  const admin = createAdminClient();

  const { data: membership, error: membershipError } = await admin
    .from("shop_memberships")
    .select("id, user_id, role, status")
    .eq("id", membershipId)
    .eq("shop_id", shopId)
    .maybeSingle();

  if (membershipError) {
    throw new ShopUserPermissionServiceError(
      "Unable to verify Shop User membership.",
      503,
      "MEMBERSHIP_LOOKUP_FAILED"
    );
  }

  if (
    !membership ||
    membership.role !== "SHOP_USER" ||
    membership.status !== "ACTIVE"
  ) {
    throw new ShopUserPermissionServiceError(
      "Active Shop User membership not found.",
      404,
      "SHOP_USER_NOT_FOUND"
    );
  }

  const [
    { data: grants, error: grantsError },
    { data: activePermissions, error: permissionsError },
  ] = await Promise.all([
    admin
      .from("shop_user_permissions")
      .select("permission_key")
      .eq("shop_id", shopId)
      .eq("user_id", membership.user_id),

    admin
      .from("permissions")
      .select("permission_key")
      .eq("active", true)
      .eq("is_active", true),
  ]);

  if (grantsError || permissionsError) {
    throw new ShopUserPermissionServiceError(
      "Unable to retrieve Shop User permissions.",
      503,
      "PERMISSION_RETRIEVAL_FAILED"
    );
  }

  const activeKeys = new Set(
    (activePermissions ?? []).map((permission) => permission.permission_key)
  );

  return (grants ?? [])
    .map((grant) => grant.permission_key)
    .filter((permissionKey) => activeKeys.has(permissionKey))
    .sort();
}
