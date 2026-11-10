
import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import {
  shopSessionConfig,
  revokeShopSession,
} from "@/lib/services/shop-session.service";

import { validateCsrfRequest } from "@/lib/services/csrf.service";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  Pragma: "no-cache",
  Expires: "0",
};

function jsonResponse(
  body: Record<string, unknown>,
  status: number
) {
  return NextResponse.json(body, {
    status,
    headers: NO_STORE_HEADERS,
  });
}

function clearShopSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: shopSessionConfig.cookieName,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}

export async function POST(request: NextRequest) {
  // 1. Validate request origin.
  const csrfError = validateCsrfRequest(request);

  if (csrfError) {
    csrfError.headers.set(
      "Cache-Control",
      NO_STORE_HEADERS["Cache-Control"]
    );
    csrfError.headers.set("Pragma", "no-cache");
    csrfError.headers.set("Expires", "0");

    return csrfError;
  }

  let revocationFailed = false;
  let supabaseLogoutFailed = false;

  try {
    // 2. Read the opaque session token from the HTTP-only cookie.
    const sessionToken = request.cookies.get(
      shopSessionConfig.cookieName
    )?.value;

    // 3. Revoke the server-side shop session.
    if (sessionToken) {
      try {
        await revokeShopSession(sessionToken);
      } catch (error) {
        revocationFailed = true;

        console.error(
          "Shop session revocation error:",
          error
        );
      }
    }

    // 4. Sign out from Supabase Auth.
    try {
      const supabase = await createClient();

      const { error: signOutError } =
        await supabase.auth.signOut({
          scope: "local",
        });

      if (signOutError) {
        supabaseLogoutFailed = true;

        console.error(
          "Supabase logout error:",
          signOutError
        );
      }
    } catch (error) {
      supabaseLogoutFailed = true;

      console.error(
        "Supabase logout exception:",
        error
      );
    }

    // 5. Return the result and clear the custom session cookie.
    if (revocationFailed || supabaseLogoutFailed) {
      const response = jsonResponse(
        {
          success: false,
          message:
            "Logout was attempted, but some session cleanup failed. Please try again.",
        },
        500
      );

      return clearShopSessionCookie(response);
    }

    const response = jsonResponse(
      {
        success: true,
        message: "Logged out successfully.",
      },
      200
    );

    return clearShopSessionCookie(response);
  } catch (error) {
    console.error("Logout error:", error);

    const response = jsonResponse(
      {
        success: false,
        message: "Unable to complete logout.",
      },
      500
    );

    return clearShopSessionCookie(response);
  }
}
