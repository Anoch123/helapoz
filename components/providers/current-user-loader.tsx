import { Suspense, type ReactNode } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import UserProvider from "@/components/providers/user-provider";
import PosLayout from "@/components/widgets/layouts/pos-layout";

import { getCurrentUser } from "@/lib/services/current-user.service";
import { ShopContextError } from "@/lib/services/require-shop-context.service";
import ShopAccessScreen from "../widgets/subscription/shop-access-screen";
import PageLoader from "../widgets/layouts/page-loading";
import { toAccessRole } from "@/lib/constants/access-roles";
import { AccessProvider } from "../widgets/auth/access-control";
import LoginRequiredScreen from "../widgets/auth/login-required-screen";
import { ACCESS_RESTRICTED_CODES, LOGIN_REQUIRED_CODES } from "@/lib/constants/helper-constants";

async function CurrentUserContent({ children }: { children: ReactNode }) {
  await connection();

  try {
    const currentUser = await getCurrentUser();

    // NOTE: adjust these two fields to match your current user shape.
    const role = toAccessRole(currentUser.role);
    const permissions: string[] = currentUser.permissions ?? [];

    return (
      <UserProvider initialUser={currentUser}>
        <AccessProvider role={role} permissions={permissions}>
          <PosLayout>{children}</PosLayout>
        </AccessProvider>
      </UserProvider>
    );
  } catch (error) {
    if (error instanceof ShopContextError) {
      // redirect() throws by design. It is safe here because we are in the
      // catch block, not inside the try block above.
      if (LOGIN_REQUIRED_CODES.includes(error.code)) {
        return <LoginRequiredScreen code={error.code} />;
      }

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