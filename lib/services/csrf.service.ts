
import "server-only";

import { NextRequest, NextResponse } from "next/server";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

function getTrustedOrigin(): string | null {
  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    console.error("APP_URL environment variable is missing.");
    return null;
  }

  try {
    const url = new URL(appUrl);

    if (
      process.env.NODE_ENV === "production" &&
      url.protocol !== "https:"
    ) {
      console.error("APP_URL must use HTTPS in production.");
      return null;
    }

    return url.origin;
  } catch {
    console.error("APP_URL is not a valid URL.");
    return null;
  }
}

function getRequestOrigin(request: NextRequest): string | null {
  // Prefer the Origin header.
  const originHeader = request.headers.get("origin");

  if (originHeader) {
    try {
      return new URL(originHeader).origin;
    } catch {
      return null;
    }
  }

  // Use Referer only when Origin is unavailable.
  const refererHeader = request.headers.get("referer");

  if (refererHeader) {
    try {
      return new URL(refererHeader).origin;
    } catch {
      return null;
    }
  }

  return null;
}

export function validateCsrfRequest(
  request: NextRequest
): NextResponse | null {
  // Safe HTTP methods do not change application state.
  if (SAFE_METHODS.includes(request.method.toUpperCase())) {
    return null;
  }

  console.log("crsf");

  const trustedOrigin = getTrustedOrigin();

  if (!trustedOrigin) {
    return NextResponse.json(
      {
        success: false,
        message: "Request security configuration is unavailable.",
      },
      { status: 500 }
    );
  }

  // Reject cross-origin and cross-site requests.
  const fetchSite = request.headers.get("sec-fetch-site");

  if (fetchSite && fetchSite !== "same-origin") {
    return NextResponse.json(
      {
        success: false,
        message: "Cross-origin requests are not allowed.",
      },
      { status: 403 }
    );
  }

  // Verify the request's actual origin.
  const requestOrigin = getRequestOrigin(request);

  if (!requestOrigin || requestOrigin !== trustedOrigin) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request origin.",
      },
      { status: 403 }
    );
  }

  return null;
}
