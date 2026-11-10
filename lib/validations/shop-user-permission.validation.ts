import { z } from "zod";

export const updateShopUserPermissionsSchema = z.object({
  permissions: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(100)
    )
    .max(100)
    .refine(
      (permissions) =>
        new Set(permissions).size === permissions.length,
      "Duplicate permissions are not allowed."
    ),
});

export type UpdateShopUserPermissionsInput = z.infer<
  typeof updateShopUserPermissionsSchema
>;