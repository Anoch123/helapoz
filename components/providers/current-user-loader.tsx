
import { Suspense, type ReactNode } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import UserProvider from "@/components/providers/user-provider";
import PosLayout from "@/components/widgets/layouts/pos-layout";

import { getCurrentUser } from "@/lib/services/current-user.service";
import { ShopContextError } from "@/lib/services/require-shop-context.service";
import ShopAccessScreen from "../widgets/subscription/shop-access-screen";
import PageLoader from "../widgets/layouts/page-loading";
import LoginRequiredScreen from "../widgets/auth/login-required-screen";

const LOGIN_REQUIRED_CODES = [
  "UNAUTHENTICATED",
  "SHOP_SESSION_MISSING",
  "INVALID_SHOP_SESSION",
  "SESSION_USER_MISMATCH",
];

const ACCESS_RESTRICTED_CODES = [
  "SHOP_SESSION_CHECK_FAILED",
  "SHOP_UNAVAILABLE",
  "SHOP_LOOKUP_FAILED",
  "MEMBERSHIP_INACTIVE",
  "MEMBERSHIP_LOOKUP_FAILED",
  "INVALID_MEMBERSHIP_ROLE",
  "EXPIRED",
  "PAYMENT_REQUIRED",
  "SUSPENDED",
  "CANCELLED",
  "NO_SUBSCRIPTION",
  "SUBSCRIPTION_CHECK_FAILED",
];

async function CurrentUserContent({
  children,
}: {
  children: ReactNode;
}) {
  await connection();

  try {
    const currentUser = await getCurrentUser();

    return (
      <UserProvider initialUser={currentUser}>
        <PosLayout>{children}</PosLayout>
      </UserProvider>
    );
  } catch (error) {
    if (error instanceof ShopContextError) {
      // Authentication or session problems.
      if (LOGIN_REQUIRED_CODES.includes(error.code)) {
        return <LoginRequiredScreen code={error.code} />;
      }

      // Shop, membership, and subscription restrictions.
      if (ACCESS_RESTRICTED_CODES.includes(error.code)) {
        return <ShopAccessScreen code={error.code} />;
      }
    }

    // Unexpected errors should reach the Next.js error boundary.
    throw error;
  }
}

export default async function CurrentUserLoader({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted/30">
          <PageLoader />
        </div>
      }
    >
      <CurrentUserContent>{children}</CurrentUserContent>
    </Suspense>
  );
}
