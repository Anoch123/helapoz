
import { NextResponse } from "next/server";

import { getMyShopProfile } from "@/lib/services/shop-profile.service";
import { ShopContextError } from "@/lib/services/require-shop-context.service";

// export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getMyShopProfile();

return NextResponse.json(
      {
        success: true,
        data: result,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    if (error instanceof ShopContextError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          code: error.code,
        },
        {
          status: error.status,
          headers: {
            "Cache-Control": "private, no-store, max-age=0",
          },
        }
      );
    }

    console.error("My profile API failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve your profile.",
        code: "PROFILE_RETRIEVAL_FAILED",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  }
}
