
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type ShopPermission = {
  permission_key: string;
  name: string;
  description: string | null;
  category: string;
};

export async function getActivePermissions(): Promise<ShopPermission[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("permissions")
    .select("permission_key, name, description, category")
    .eq("active", true)
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Permission catalogue retrieval failed.");

    throw new Error("Unable to retrieve permissions.");
  }

  return data ?? [];
}
