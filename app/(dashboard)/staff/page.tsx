import { connection } from "next/server";

import StaffDirectory from "@/components/widgets/staff/staff-directory";

export const instant = false;

export default async function StaffPage() {
  await connection();

  return (
    <StaffDirectory/>
  );
}