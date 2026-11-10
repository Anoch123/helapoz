
import { NextResponse } from "next/server";

import {
  requireShopContext,
  ShopContextError,
} from "@/lib/services/require-shop-context.service";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  Pragma: "no-cache",
  Expires: "0",
};

export async function authorizeShopRequest() {
  try {
    const context = await requireShopContext();

    return {
      authorized: true as const,
      context,
    };
  } catch (error) {
    if (error instanceof ShopContextError) {
      return {
        authorized: false as const,
        response: NextResponse.json(
          {
            success: false,
            message: error.message,
            code: error.code,
          },
          {
            status: error.status,
            headers: NO_STORE_HEADERS,
          }
        ),
      };
    }

    // Unexpected errors must never result in authorization.
    console.error("Unexpected shop authorization failure.");

    return {
      authorized: false as const,
      response: NextResponse.json(
        {
          success: false,
          message: "Unable to verify your shop access.",
          code: "SHOP_AUTHORIZATION_FAILED",
        },
        {
          status: 500,
          headers: NO_STORE_HEADERS,
        }
      ),
    };
  }
}
