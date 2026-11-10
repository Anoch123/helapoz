
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireShopContext } from "@/lib/services/require-shop-context.service";

export async function getMyShopProfile() {
  const context = await requireShopContext();
  const admin = createAdminClient();

  const [shopResult, membershipResult, authResult] =
    await Promise.all([
      admin
        .from("shops")
        .select("id, shop_code, name")
        .eq("id", context.shopId)
        .single(),

      admin
        .from("shop_memberships")
        .select(
          "id, display_name, phone, role, status, created_at"
        )
        .eq("id", context.membership.id)
        .eq("shop_id", context.shopId)
        .eq("user_id", context.userId)
        .single(),

      admin.auth.admin.getUserById(context.userId),
    ]);

  if (shopResult.error || !shopResult.data) {
    throw new Error("Unable to retrieve shop information.");
  }

  if (membershipResult.error || !membershipResult.data) {
    throw new Error("Unable to retrieve your profile.");
  }

  if (authResult.error || !authResult.data.user) {
    throw new Error("Unable to retrieve your account information.");
  }

  const membership = membershipResult.data;

  let permissions: {
    permission_key: string;
    name: string;
    description: string | null;
    category: string;
  }[] = [];

  if (membership.role === "SHOP_USER") {
    const { data, error } = await admin
      .from("shop_user_permissions")
      .select(`
        permission_key,
        permissions!inner (
          permission_key,
          name,
          description,
          category
        )
      `)
      .eq("shop_id", context.shopId)
      .eq("user_id", context.userId)
      .eq("permissions.active", true)
      .eq("permissions.is_active", true);

    if (error) {
      throw new Error("Unable to retrieve your permissions.");
    }

    permissions = (data ?? []).map((item) => {
      const permission = Array.isArray(item.permissions)
        ? item.permissions[0]
        : item.permissions;

      return {
        permission_key: permission.permission_key,
        name: permission.name,
        description: permission.description,
        category: permission.category,
      };
    });
  }

  return {
    profile: {
      membershipId: membership.id,
      displayName: membership.display_name,
      email: authResult.data.user.email ?? "",
      phone: membership.phone,
      role: membership.role,
      status: membership.status,
      createdAt: membership.created_at,
      shop: {
        id: shopResult.data.id,
        shopCode: shopResult.data.shop_code,
        name: shopResult.data.name,
      },
    },
    access: {
      type:
        membership.role === "SHOP_ADMIN"
          ? "FULL_ACCESS"
          : "ASSIGNED_PERMISSIONS",
      permissions,
    },
  };
}
