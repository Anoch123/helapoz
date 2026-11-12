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

export type ShopPermissionMap = Record<string, boolean>;

type PermissionDetails = {
  available: boolean;
  granted: boolean;
};

type PermissionCheckResult = {
  context: Awaited<ReturnType<typeof requireShopContext>>;
  permissions: Record<string, PermissionDetails>;
};

const INVALID_PERMISSION_MESSAGE =
  "Access could not be verified. Please contact support.";

const PERMISSION_DENIED_MESSAGE =
  "You don't have access to this feature. Please contact your Shop Admin to request permission.";

const PERMISSION_UNAVAILABLE_MESSAGE =
  "This feature is currently unavailable. Please contact your Shop Admin.";

const PERMISSION_CHECK_FAILED_MESSAGE =
  "We couldn't verify your access right now. Please try again later.";

function normalizePermissionKeys(
  permissionKeys: readonly string[]
): string[] {
  if (!Array.isArray(permissionKeys) || permissionKeys.length === 0) {
    throw new ShopPermissionError(
      INVALID_PERMISSION_MESSAGE,
      500,
      "INVALID_PERMISSION_KEY"
    );
  }

  const keys = permissionKeys.map((key) => {
    if (
      typeof key !== "string" ||
      !key.trim() ||
      key !== key.trim()
    ) {
      throw new ShopPermissionError(
        INVALID_PERMISSION_MESSAGE,
        500,
        "INVALID_PERMISSION_KEY"
      );
    }

    return key;
  });

  return [...new Set(keys)];
}

/**
 * Checks multiple permissions using a single shop context lookup
 * and at most two database queries.
 */
async function checkShopPermissions(
  permissionKeys: readonly string[]
): Promise<PermissionCheckResult> {
  const keys = normalizePermissionKeys(permissionKeys);

  const context = await requireShopContext();

  // Shop Admin automatically has every permission.
  if (context.membership.role === "SHOP_ADMIN") {
    return {
      context,
      permissions: Object.fromEntries(
        keys.map((key) => [
          key,
          { available: true, granted: true },
        ])
      ),
    };
  }

  const admin = createAdminClient();

  // Query 1: Get all requested active permissions.
  const {
    data: availablePermissions,
    error: permissionError,
  } = await admin
    .from("permissions")
    .select("permission_key")
    .in("permission_key", keys)
    .eq("active", true)
    .eq("is_active", true);

  if (permissionError) {
    console.error("Permission catalogue lookup failed:", {
      message: permissionError.message,
      code: permissionError.code,
    });

    throw new ShopPermissionError(
      PERMISSION_CHECK_FAILED_MESSAGE,
      503,
      "PERMISSION_CHECK_FAILED"
    );
  }

  const availableKeys = new Set(
    (availablePermissions ?? []).map(
      (permission) => permission.permission_key
    )
  );

  const activeKeys = keys.filter((key) => availableKeys.has(key));

  // No need to query grants if none of the permissions are active.
  if (activeKeys.length === 0) {
    return {
      context,
      permissions: Object.fromEntries(
        keys.map((key) => [
          key,
          { available: false, granted: false },
        ])
      ),
    };
  }

  // Query 2: Get all grants belonging to this Shop User.
  const {
    data: grantedPermissions,
    error: grantError,
  } = await admin
    .from("shop_user_permissions")
    .select("permission_key")
    .eq("shop_id", context.shopId)
    .eq("user_id", context.userId)
    .in("permission_key", activeKeys);

  if (grantError) {
    console.error("Shop user permission lookup failed:", {
      message: grantError.message,
      code: grantError.code,
    });

    throw new ShopPermissionError(
      PERMISSION_CHECK_FAILED_MESSAGE,
      503,
      "PERMISSION_CHECK_FAILED"
    );
  }

  const grantedKeys = new Set(
    (grantedPermissions ?? []).map(
      (permission) => permission.permission_key
    )
  );

  return {
    context,
    permissions: Object.fromEntries(
      keys.map((key) => [
        key,
        {
          available: availableKeys.has(key),
          granted: grantedKeys.has(key),
        },
      ])
    ),
  };
}

/**
 * Returns boolean values for multiple permissions.
 *
 * Missing or inactive permissions return false.
 */
export async function getShopPermissions(
  permissionKeys: readonly string[]
): Promise<ShopPermissionMap> {
  const result = await checkShopPermissions(permissionKeys);

  return Object.fromEntries(
    Object.entries(result.permissions).map(([key, value]) => [
      key,
      value.granted,
    ])
  );
}

/**
 * Checks one permission without throwing for normal denial.
 */
export async function hasShopPermission(
  permissionKey: string
): Promise<boolean> {
  const permissions = await getShopPermissions([permissionKey]);

  return permissions[permissionKey] ?? false;
}

/**
 * Enforces one permission.
 *
 * Use for protected pages and API routes.
 */
export async function requireShopPermission(
  permissionKey: string
) {
  const result = await checkShopPermissions([permissionKey]);
  const permission = result.permissions[permissionKey];

  if (!permission?.available) {
    throw new ShopPermissionError(
      PERMISSION_UNAVAILABLE_MESSAGE,
      403,
      "PERMISSION_UNAVAILABLE"
    );
  }

  if (!permission.granted) {
    throw new ShopPermissionError(
      PERMISSION_DENIED_MESSAGE,
      403,
      "PERMISSION_DENIED"
    );
  }

  return result.context;
}