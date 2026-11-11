
import type { ReactNode } from "react";

import AccessError from "@/components/widgets/shared/access-error";

import {
  requireShopPermission,
  ShopPermissionError,
} from "@/lib/services/require-shop-permission.service";
import { connection } from "next/server";

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

    throw error;
  }

  return children;
}
