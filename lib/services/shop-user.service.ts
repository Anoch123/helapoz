
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { CreateShopUserInput } from "@/lib/validations/shop-user.validation";

export class ShopUserServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ShopUserServiceError";
  }
}

export type ShopUserRecord = {
  membershipId: string;
  userId: string;
  displayName: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
};

export type ShopUserListResult = {
  users: ShopUserRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CreateShopUserResult = {
  membershipId: string;
  seatId: string;
  seatAmount: number;
};

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

export async function getShopUsers(
  shopId: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<ShopUserListResult> {
  const admin = createAdminClient();

  const safePage = Math.max(1, Math.floor(page));
  const safePageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(pageSize)),
  );

  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  const { data, error, count } = await admin
    .from("shop_memberships")
    .select(
      "id, user_id, display_name, phone, status, created_at",
      { count: "exact" },
    )
    .eq("shop_id", shopId)
    .eq("role", "SHOP_USER")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Shop user retrieval failed.");
    throw new ShopUserServiceError(
      "Unable to retrieve shop users.",
      503,
      "STAFF_RETRIEVAL_FAILED",
    );
  }

  const memberships = data ?? [];

  const users = await Promise.all(
    memberships.map(async (membership) => {
      const {
        data: authData,
        error: authError,
      } = await admin.auth.admin.getUserById(membership.user_id);

      if (authError || !authData.user) {
        console.error("Shop user account lookup failed.");
        throw new ShopUserServiceError(
          "Unable to retrieve staff account information.",
          503,
          "STAFF_ACCOUNT_LOOKUP_FAILED",
        );
      }

      return {
        membershipId: membership.id,
        userId: membership.user_id,
        displayName: membership.display_name,
        email: authData.user.email ?? "",
        phone: membership.phone,
        status: membership.status,
        createdAt: membership.created_at,
      };
    }),
  );

  const total = count ?? 0;

  return {
    users,
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.ceil(total / safePageSize),
  };
}

export async function createShopUser(
  shopId: string,
  createdBy: string,
  input: CreateShopUserInput,
): Promise<CreateShopUserResult> {
  const admin = createAdminClient();

  // Create a confirmed Supabase Auth account.
  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        display_name: input.displayName,
      },
    });

  if (authError || !authData.user) {
    console.error("Shop user Auth account creation failed.");

    const isDuplicateEmail =
      authError?.message.toLowerCase().includes("already") ||
      authError?.message.toLowerCase().includes("registered");

    throw new ShopUserServiceError(
      isDuplicateEmail
        ? "An account with this email address already exists."
        : "Unable to create the staff account.",
      isDuplicateEmail ? 409 : 400,
      isDuplicateEmail ? "EMAIL_ALREADY_EXISTS" : "AUTH_USER_CREATION_FAILED",
    );
  }

  const newUserId = authData.user.id;

  // Assign one available, paid seat and create the membership.
  const { data: membershipData, error: membershipError } =
    await admin.rpc("create_shop_user_with_seat", {
      p_shop_id: shopId,
      p_user_id: newUserId,
      p_display_name: input.displayName,
      p_phone: input.phone || null,
      p_created_by: createdBy,
    });

  if (membershipError || !membershipData?.length) {
    // Compensate for Auth account creation if membership creation fails.
    const { error: rollbackError } =
      await admin.auth.admin.deleteUser(newUserId);

    if (rollbackError) {
      console.error(
        "Shop user Auth account rollback failed. Manual review may be required.",
      );
    }

    const rpcMessage = membershipError?.message.toLowerCase() ?? "";

    if (
      rpcMessage.includes("no available") ||
      rpcMessage.includes("available seat") ||
      rpcMessage.includes("seat")
    ) {
      throw new ShopUserServiceError(
        "No available purchased Shop User seats. Purchase an additional seat before creating another Shop User.",
        409,
        "NO_AVAILABLE_SEAT",
      );
    }

    if (rpcMessage.includes("already a member")) {
      throw new ShopUserServiceError(
        "This user is already a member of this shop.",
        409,
        "ALREADY_SHOP_MEMBER",
      );
    }

    console.error("Shop user membership creation failed.");

    throw new ShopUserServiceError(
      "Unable to complete staff creation.",
      500,
      "MEMBERSHIP_CREATION_FAILED",
    );
  }

  const createdMembership = membershipData[0];

  return {
    membershipId: createdMembership.membership_id,
    seatId: createdMembership.seat_id,
    seatAmount: Number(createdMembership.seat_amount),
  };
}


export type ShopUserDetails = ShopUserRecord & {
  seatId: string | null;
  seatAmount: number | null;
};

export async function getShopUserByMembershipId(
  shopId: string,
  membershipId: string,
): Promise<ShopUserDetails> {
  const admin = createAdminClient();

  const { data: membership, error } = await admin
    .from("shop_memberships")
    .select("id, user_id, display_name, phone, status, created_at")
    .eq("id", membershipId)
    .eq("shop_id", shopId)
    .eq("role", "SHOP_USER")
    .maybeSingle();

  if (error) {
    console.error("Shop user membership lookup failed.");
    throw new ShopUserServiceError(
      "Unable to retrieve staff details.",
      503,
      "STAFF_RETRIEVAL_FAILED",
    );
  }

  if (!membership) {
    throw new ShopUserServiceError(
      "Shop User not found.",
      404,
      "STAFF_NOT_FOUND",
    );
  }

  const { data: authData, error: authError } =
    await admin.auth.admin.getUserById(membership.user_id);

  if (authError || !authData.user) {
    console.error("Shop user Auth lookup failed.");
    throw new ShopUserServiceError(
      "Unable to retrieve staff account information.",
      503,
      "STAFF_ACCOUNT_LOOKUP_FAILED",
    );
  }

  const { data: seat, error: seatError } = await admin
    .from("shop_user_seats")
    .select("id, amount")
    .eq("membership_id", membershipId)
    .eq("shop_id", shopId)
    .maybeSingle();

  if (seatError) {
    console.error("Shop user seat lookup failed.");
    throw new ShopUserServiceError(
      "Unable to retrieve staff seat information.",
      503,
      "SEAT_LOOKUP_FAILED",
    );
  }

  return {
    membershipId: membership.id,
    userId: membership.user_id,
    displayName: membership.display_name,
    email: authData.user.email ?? "",
    phone: membership.phone,
    status: membership.status,
    createdAt: membership.created_at,
    seatId: seat?.id ?? null,
    seatAmount: seat ? Number(seat.amount) : null,
  };
}

export type RemoveShopUserResult = {
  membershipId: string;
  userId: string;
  displayName: string;
  seatId: string | null;
  seatAmount: number | null;
  seatReleased: boolean;
};

export async function removeShopUser(
  shopId: string,
  membershipId: string,
): Promise<RemoveShopUserResult> {
  const admin = createAdminClient();

  const { data, error } = await admin.rpc(
    "remove_shop_user_and_release_seat",
    {
      p_shop_id: shopId,
      p_membership_id: membershipId,
    },
  );

  if (error) {
    console.error("Shop user removal failed.");

    const message = error.message.toLowerCase();

    if (
      message.includes("not found") ||
      message.includes("does not exist")
    ) {
      throw new ShopUserServiceError(
        "Shop User not found.",
        404,
        "STAFF_NOT_FOUND",
      );
    }

    throw new ShopUserServiceError(
      "Unable to remove this Shop User.",
      500,
      "STAFF_REMOVAL_FAILED",
    );
  }

  if (!data?.length) {
    throw new ShopUserServiceError(
      "Shop User not found.",
      404,
      "STAFF_NOT_FOUND",
    );
  }

  const result = data[0];

  return {
    membershipId: result.membership_id,
    userId: result.user_id,
    displayName: result.display_name,
    seatId: result.seat_id,
    seatAmount: result.seat_amount === null
      ? null
      : Number(result.seat_amount),
    seatReleased: result.seat_released,
  };
}

