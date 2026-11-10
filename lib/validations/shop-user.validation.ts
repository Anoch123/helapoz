
import { z } from "zod";

export const createShopUserSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters.")
    .max(100, "Name cannot exceed 100 characters."),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(255, "Email cannot exceed 255 characters.")
    .transform((value) => value.toLowerCase()),

  phone: z
    .string()
    .trim()
    .max(20, "Phone number cannot exceed 20 characters.")
    .optional(),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(72, "Password cannot exceed 72 characters."),
});

export type CreateShopUserInput = z.infer<
  typeof createShopUserSchema
>;
