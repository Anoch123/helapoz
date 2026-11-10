
import { NextResponse } from "next/server";

import {
  ShopContextError,
} from "@/lib/services/require-shop-context.service";

import {
  ShopPermissionError,
} from "@/lib/services/require-shop-permission.service";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
};

export function handleAuthorizationError(error: unknown) {
  if (
    error instanceof ShopContextError ||
    error instanceof ShopPermissionError
  ) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        code: error.code,
      },
      {
        status: error.status,
        headers: NO_STORE_HEADERS,
      }
    );
  }

  console.error("API authorization failed.");

  return NextResponse.json(
    {
      success: false,
      message: "Unable to authorize this operation.",
      code: "AUTHORIZATION_FAILED",
    },
    {
      status: 500,
      headers: NO_STORE_HEADERS,
    }
  );
}
