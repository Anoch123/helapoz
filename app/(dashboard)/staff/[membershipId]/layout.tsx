
import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import AccessError from "@/components/widgets/shared/access-error";

import {
  requireShopPermission,
  ShopPermissionError,
} from "@/lib/services/require-shop-permission.service";
import { ShopContextError } from "@/lib/services/require-shop-context.service";
import { connection } from "next/server";

export const instant = false;

type StaffLayoutProps = {
  children: ReactNode;
};

export default async function StaffLayout({
  children,
}: StaffLayoutProps) {
  try {
    await connection();
    await requireShopPermission("staff.view");
  } catch (error) {
    if (error instanceof ShopPermissionError) {
      return (
        <AccessError
          title={
            error.status === 403
              ? "Access Restricted"
              : "Unable to Verify Access"
          }
          message={error.message}
        />
      );
    }

    if (error instanceof ShopContextError) {
      // No valid shop session: send the user to log in again.
      if (error.status === 401) {
        redirect("/");
      }

      return (
        <AccessError
          title="Access Restricted"
          message={error.message}
        />
      );
    }

    throw error;
  }

  return children;
}
