import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireShopContext } from "@/lib/services/require-shop-context.service";

import type {
  CurrentUser,
  ShopPermissionDetails,
  ShopRole,
} from "@/lib/types/current-user";

export async function getCurrentUser(): Promise<CurrentUser> {
  // 1. Get the trusted authenticated shop context.
  const context = await requireShopContext();

  const admin = createAdminClient();

  // 2. Retrieve the required records concurrently.
  const [
    membershipResult,
    authResult,
    permissionsResult,
    shopResult,
    subscriptionResult,
  ] = await Promise.all([
    admin
      .from("shop_memberships")
      .select(
        `
          id,
          display_name,
          phone,
          role,
          status,
          created_at,
          updated_at
        `
      )
      .eq("id", context.membership.id)
      .eq("shop_id", context.shopId)
      .eq("user_id", context.userId)
      .single(),

    admin.auth.admin.getUserById(context.userId),

    admin
      .from("permissions")
      .select("permission_key, name, description, category")
      .eq("active", true)
      .eq("is_active", true)
      .order("category")
      .order("name"),

    admin
      .from("shops")
      .select(
        `
          id,
          shop_code,
          name,
          legal_name,
          business_registration_no,
          contact_email,
          contact_phone,
          address_line_1,
          address_line_2,
          city,
          district,
          province,
          postal_code,
          country,
          status,
          business_type,
          created_at,
          updated_at
        `
      )
      .eq("id", context.shopId)
      .single(),

    // Keep the same latest-subscription selection used
    // by checkShopSubscriptionAccess().
    admin
      .from("shop_subscriptions")
      .select(
        `
          id,
          shop_id,
          plan_id,
          status,
          current_period_start,
          current_period_end,
          next_billing_date,
          grace_period_days,
          cancelled_at,
          suspended_at,
          created_at,
          updated_at
        `
      )
      .eq("shop_id", context.shopId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  // 3. Validate the returned records.
  if (membershipResult.error || !membershipResult.data) {
    throw new Error("CURRENT_USER_MEMBERSHIP_LOOKUP_FAILED");
  }

  if (authResult.error || !authResult.data.user) {
    throw new Error("CURRENT_USER_ACCOUNT_LOOKUP_FAILED");
  }

  if (permissionsResult.error) {
    throw new Error("CURRENT_USER_PERMISSION_CATALOGUE_FAILED");
  }

  if (shopResult.error || !shopResult.data) {
    throw new Error("CURRENT_USER_SHOP_LOOKUP_FAILED");
  }

  if (subscriptionResult.error || !subscriptionResult.data) {
    throw new Error("CURRENT_USER_SUBSCRIPTION_LOOKUP_FAILED");
  }

  const membership = membershipResult.data;
  const shop = shopResult.data;
  const subscription = subscriptionResult.data;
  const activePermissions = permissionsResult.data ?? [];

  // 4. Retrieve the subscription plan.
  const { data: plan, error: planError } = await admin
    .from("subscription_plans")
    .select(
      `
        id,
        plan_code,
        name,
        description,
        monthly_price,
        additional_user_price,
        included_admin_users,
        included_shop_users,
        currency
      `
    )
    .eq("id", subscription.plan_id)
    .single();

  if (planError || !plan) {
    throw new Error("CURRENT_USER_SUBSCRIPTION_PLAN_LOOKUP_FAILED");
  }

  // 5. Validate the membership role.
  if (
    membership.role !== "SHOP_ADMIN" &&
    membership.role !== "SHOP_USER"
  ) {
    throw new Error("CURRENT_USER_INVALID_ROLE");
  }

  const role: ShopRole = membership.role;

  // 6. Resolve the user's permissions.
  let permissionDetails: ShopPermissionDetails[];

  if (role === "SHOP_ADMIN") {
    // Shop Admin receives all active permissions.
    permissionDetails = activePermissions.map((permission) => ({
      permissionKey: permission.permission_key,
      name: permission.name,
      description: permission.description,
      category: permission.category,
    }));
  } else {
    // Shop User receives only explicitly assigned active permissions.
    const { data: grants, error: grantsError } = await admin
      .from("shop_user_permissions")
      .select("permission_key")
      .eq("shop_id", context.shopId)
      .eq("user_id", context.userId);

    if (grantsError) {
      throw new Error("CURRENT_USER_PERMISSION_LOOKUP_FAILED");
    }

    const grantedKeys = new Set(
      (grants ?? []).map((grant) => grant.permission_key)
    );

    permissionDetails = activePermissions
      .filter((permission) =>
        grantedKeys.has(permission.permission_key)
      )
      .map((permission) => ({
        permissionKey: permission.permission_key,
        name: permission.name,
        description: permission.description,
        category: permission.category,
      }));
  }

  // 7. Return the centralized current-user data.
  return {
    id: context.userId,
    email: authResult.data.user.email ?? "",
    displayName: membership.display_name,
    phone: membership.phone,

    role,
    membershipId: membership.id,
    membershipStatus: membership.status,
    membershipCreatedAt: membership.created_at,
    membershipUpdatedAt: membership.updated_at,

    isShopAdmin: role === "SHOP_ADMIN",
    isShopUser: role === "SHOP_USER",

    shop: {
      id: shop.id,
      shopCode: shop.shop_code,
      name: shop.name,
      legalName: shop.legal_name,
      businessRegistrationNo: shop.business_registration_no,
      contactEmail: shop.contact_email,
      contactPhone: shop.contact_phone,
      addressLine1: shop.address_line_1,
      addressLine2: shop.address_line_2,
      city: shop.city,
      district: shop.district,
      province: shop.province,
      postalCode: shop.postal_code,
      country: shop.country,
      status: shop.status,
      businessType: shop.business_type,
      createdAt: shop.created_at,
      updatedAt: shop.updated_at,
    },

    permissions: permissionDetails.map(
      (permission) => permission.permissionKey
    ),

    permissionDetails,

    subscription: {
      id: subscription.id,
      status: subscription.status,
      accessType: context.subscription.accessType,

      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      nextBillingDate: subscription.next_billing_date,
      gracePeriodDays: subscription.grace_period_days,

      cancelledAt: subscription.cancelled_at,
      suspendedAt: subscription.suspended_at,
      createdAt: subscription.created_at,
      updatedAt: subscription.updated_at,

      plan: {
        id: plan.id,
        code: plan.plan_code,
        name: plan.name,
        description: plan.description,
        monthlyPrice: Number(plan.monthly_price),
        additionalUserPrice: Number(plan.additional_user_price),
        includedAdminUsers: plan.included_admin_users,
        includedShopUsers: plan.included_shop_users,
        currency: plan.currency,
      },
    },
  };
}