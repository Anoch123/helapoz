
import { NextRequest, NextResponse } from "next/server";

import {
  requireShopContext,
  ShopContextError,
} from "@/lib/services/require-shop-context.service";

import {
  getShopUserByMembershipId,
  removeShopUser,
  ShopUserServiceError,
} from "@/lib/services/shop-user.service";

import { validateCsrfRequest } from "@/lib/services/csrf.service";

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
  status: number,
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
    },
  );
}

function handleRouteError(error: unknown) {
  if (error instanceof ShopContextError) {
    return errorResponse(
      error.message,
      error.code,
      error.status,
    );
  }

  if (error instanceof ShopUserServiceError) {
    return errorResponse(
      error.message,
      error.code,
      error.status,
    );
  }

  console.error("Individual shop user API request failed.");

  return errorResponse(
    "An unexpected error occurred.",
    "INTERNAL_SERVER_ERROR",
    500,
  );
}

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

/**
 * GET /api/shop/users/[membershipId]
 *
 * Retrieves one Shop User belonging to the authenticated shop.
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const context = await requireShopContext();

    // if (context.membership.role !== "SHOP_ADMIN") {
    //   return errorResponse(
    //     "Only Shop Admins can view staff details.",
    //     "SHOP_ADMIN_REQUIRED",
    //     403,
    //   );
    // }

    const { membershipId } = await params;

    if (!isValidUuid(membershipId)) {
      return errorResponse(
        "Invalid staff membership ID.",
        "INVALID_MEMBERSHIP_ID",
        400,
      );
    }

    const staff = await getShopUserByMembershipId(
      context.shopId,
      membershipId,
    );

    return NextResponse.json(
      {
        success: true,
        data: staff,
      },
      {
        status: 200,
        headers: NO_STORE_HEADERS,
      },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

/**
 * DELETE /api/shop/users/[membershipId]
 *
 * Removes a Shop User and releases their purchased seat.
 * Does not delete the Supabase Auth account.
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const csrfError = validateCsrfRequest(request);

    if (csrfError) {
      csrfError.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate",
      );
      csrfError.headers.set("Pragma", "no-cache");

      return csrfError;
    }

    const context = await requireShopContext();

    if (context.membership.role !== "SHOP_ADMIN") {
      return errorResponse(
        "Only Shop Admins can remove staff members.",
        "SHOP_ADMIN_REQUIRED",
        403,
      );
    }

    const { membershipId } = await params;

    if (!isValidUuid(membershipId)) {
      return errorResponse(
        "Invalid staff membership ID.",
        "INVALID_MEMBERSHIP_ID",
        400,
      );
    }

    const result = await removeShopUser(
      context.shopId,
      membershipId,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Shop User removed successfully.",
        data: result,
      },
      {
        status: 200,
        headers: NO_STORE_HEADERS,
      },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
