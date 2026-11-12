import { connection } from "next/server";

import StaffDirectory from "@/components/widgets/staff/staff-directory";

import {
  getShopPermissions,
} from "@/lib/services/require-shop-permission.service";

export const instant = false;

const STAFF_PERMISSIONS = [
  "staff.view",
  "staff.create",
  "staff.update",
  "staff.status.manage",
  "staff.permissions.view",
  "staff.permissions.manage",
  "staff.remove",
] as const;

export default async function StaffPage() {
  await connection();

  const permissions = await getShopPermissions(STAFF_PERMISSIONS);

  return (
    <StaffDirectory
      permissions={
        permissions as unknown as Parameters<typeof StaffDirectory>[0]["permissions"]
      }
    />
  );
}