
import { NextRequest, NextResponse } from "next/server";

import {
  requireShopContext,
  ShopContextError,
} from "@/lib/services/require-shop-context.service";

import {
  createShopUser,
  getShopUsers,
  ShopUserServiceError,
} from "@/lib/services/shop-user.service";

import { validateCsrfRequest } from "@/lib/services/csrf.service";
import { createShopUserSchema } from "@/lib/validations/shop-user.validation";

import {
  requireShopPermission,
  ShopPermissionError,
} from "@/lib/services/require-shop-permission.service";

// export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
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

  if (error instanceof ShopPermissionError) {
    return errorResponse(
      error.message,
      error.code,
      error.status,
    );
  }

  console.error("Shop users API request failed.");

  return errorResponse(
    "An unexpected error occurred.",
    "INTERNAL_SERVER_ERROR",
    500,
  );
}

function isShopAdmin(role: string) {
  return role === "SHOP_ADMIN";
}

function parsePositiveInteger(
  value: string | null,
  fallback: number,
): number | null {
  if (value === null) {
    return fallback;
  }

  if (!/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

/**
 * GET /api/shop/users
 *
 * Retrieves Shop Users belonging to the authenticated shop.
 * Supports pagination through page and pageSize query parameters.
 */
export async function GET(request: NextRequest) {
  try {
    const context = await requireShopContext();

    // if (!isShopAdmin(context.membership.role)) {
    //   return errorResponse(
    //     "Only Shop Admins can view staff members.",
    //     "SHOP_ADMIN_REQUIRED",
    //     403,
    //   );
    // }

    const searchParams = request.nextUrl.searchParams;

    const page = parsePositiveInteger(
      searchParams.get("page"),
      1,
    );

    const pageSize = parsePositiveInteger(
      searchParams.get("pageSize"),
      10,
    );

    if (page === null || pageSize === null) {
      return errorResponse(
        "Invalid pagination parameters.",
        "INVALID_PAGINATION",
        400,
      );
    }

    if (pageSize > 50) {
      return errorResponse(
        "Page size cannot exceed 50.",
        "INVALID_PAGE_SIZE",
        400,
      );
    }

    const result = await getShopUsers(
      context.shopId,
      page,
      pageSize,
    );

    return NextResponse.json(
      {
        success: true,
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


/**
 * POST /api/shop/users
 *
 * Creates a new Shop User and assigns an available purchased seat.
 */
export async function POST(request: NextRequest) {
  try {
    // Validate CSRF before processing the request.
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

    if (!isShopAdmin(context.membership.role)) {
      return errorResponse(
        "Only Shop Admins can create staff accounts.",
        "SHOP_ADMIN_REQUIRED",
        403,
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return errorResponse(
        "Invalid JSON request body.",
        "INVALID_REQUEST_BODY",
        400,
      );
    }

    const validation = createShopUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check the submitted staff information.",
          code: "VALIDATION_ERROR",
          errors: validation.error.flatten().fieldErrors,
        },
        {
          status: 422,
          headers: NO_STORE_HEADERS,
        },
      );
    }

    const result = await createShopUser(
      context.shopId,
      context.userId,
      validation.data,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Shop User created successfully.",
        data: result,
      },
      {
        status: 201,
        headers: NO_STORE_HEADERS,
      },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
