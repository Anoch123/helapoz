
import { NextResponse } from "next/server";

import {
  requireShopContext,
  ShopContextError,
} from "@/lib/services/require-shop-context.service";

import { getActivePermissions } from "@/lib/services/permission.service";

// export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
};

export async function GET() {
  try {
    const context = await requireShopContext();

    if (context.membership.role !== "SHOP_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to manage permissions.",
          code: "FORBIDDEN",
        },
        { status: 403, headers: NO_STORE_HEADERS }
      );
    }

    const permissions = await getActivePermissions();

    return NextResponse.json(
      {
        success: true,
        data: permissions,
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    if (error instanceof ShopContextError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          code: error.code,
        },
        { status: error.status, headers: NO_STORE_HEADERS }
      );
    }

    console.error("Permission catalogue API failed.");

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve permissions.",
        code: "PERMISSION_CATALOGUE_FAILED",
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
