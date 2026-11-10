
import { NextResponse } from "next/server";

import { authorizeShopRequest } from "@/lib/utils/api-auth";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET() {
  try {
    const auth = await authorizeShopRequest();

    if (!auth.authorized) {
      const response = auth.response;

      response.headers.set(
        "Cache-Control",
        NO_STORE_HEADERS["Cache-Control"]
      );
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");

      return response;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Shop session is valid.",
        data: {
          user: {
            id: auth.context.userId,
          },
          shop: auth.context.shop,
          membership: auth.context.membership,
          subscription: auth.context.subscription,
        },
      },
      {
        status: 200,
        headers: NO_STORE_HEADERS,
      }
    );
  } catch (error) {
    console.error("Shop session API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to verify your shop session.",
      },
      {
        status: 500,
        headers: NO_STORE_HEADERS,
      }
    );
  }
}
