import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { shopLoginSchema } from "@/lib/validations/auth.validation";
import { checkShopSubscriptionAccess } from "@/lib/services/subscription-access.service";

export async function POST(request: NextRequest) {
  try {
    // 1. Validate request body
    const body = await request.json();

    const validation = shopLoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check your login details.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { shopCode, email, password } = validation.data;

    // 2. Initialize Supabase clients
    const supabase = await createClient();
    const admin = createAdminClient();

    // 3. Find shop using shop code
    const { data: shop, error: shopError } = await admin
      .from("shops")
      .select("id, shop_code, name, status, business_type")
      .eq("shop_code", shopCode.trim().toUpperCase())
      .maybeSingle();

    if (shopError || !shop || shop.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid login details or shop access is unavailable.",
        },
        { status: 401 }
      );
    }

    // Check shop subscription access
    const subscriptionAccess = await checkShopSubscriptionAccess(shop.id);

    if (!subscriptionAccess.allowed) {
        return NextResponse.json(
            {
            success: false,
            message:
                subscriptionAccess.reason === "PAYMENT_REQUIRED"
                ? "Your shop subscription payment is pending."
                : subscriptionAccess.reason === "EXPIRED"
                    ? "Your shop subscription has expired. Please contact Helpaz."
                    : subscriptionAccess.reason === "CHECK_FAILED"
                    ? "Unable to verify your subscription. Please try again."
                    : "Your shop subscription does not currently allow access.",
            },
            { status: 403 }
        );
    }

    // 4. Authenticate with Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

    if (authError || !authData.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid login details or shop access is unavailable.",
        },
        { status: 401 }
      );
    }

    // 5. Verify membership in the selected shop
    const { data: membership, error: membershipError } = await admin
      .from("shop_memberships")
      .select("id, role, status")
      .eq("shop_id", shop.id)
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (
      membershipError ||
      !membership ||
      membership.status !== "ACTIVE"
    ) {
      await supabase.auth.signOut();

      return NextResponse.json(
        {
          success: false,
          message: "Invalid login details or shop access is unavailable.",
        },
        { status: 401 }
      );
    }

    // 6. Return safe shop and membership information
    return NextResponse.json({
      success: true,
      message: "Login successful.",
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        shop: {
          id: shop.id,
          shopCode: shop.shop_code,
          name: shop.name,
          businessType: shop.business_type,
        },
        membership: {
          id: membership.id,
          role: membership.role,
        },
      },
    });
  } catch (error) {
    console.error("Shop login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}