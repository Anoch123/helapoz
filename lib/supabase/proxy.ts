import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // API routes handle their own authentication and JSON responses.
  // Do not perform proxy authentication or redirect API requests.
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return NextResponse.next({
      request,
    });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Verify the Supabase authentication session.
  const {
    data,
    error,
  } = await supabase.auth.getClaims();

  const isAuthenticated =
    !error && Boolean(data?.claims?.sub);

  // Root is the public login page.
  if (pathname === "/") {
    if (isAuthenticated) {
      const redirectUrl = request.nextUrl.clone();

      redirectUrl.pathname = "/dashboard";
      redirectUrl.search = "";

      const response = NextResponse.redirect(redirectUrl);

      // Preserve refreshed Supabase cookies.
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie);
      });

      return response;
    }

    return supabaseResponse;
  }

  // Protect all other application pages.
  if (!isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();

    redirectUrl.pathname = "/";
    redirectUrl.search = "";

    const response = NextResponse.redirect(redirectUrl);

    // Preserve refreshed Supabase cookies.
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });

    return response;
  }

  return supabaseResponse;
}