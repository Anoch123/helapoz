import { z } from "zod";

export const shopLoginSchema = z.object({
  shopCode: z
    .string()
    .trim()
    .min(1, "Shop code is required")
    .max(50, "Invalid shop code"),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email address is too long"),

  password: z
    .string()
    .min(1, "Password is required")
    .max(72, "Invalid password"),
});

export type ShopLoginInput = z.infer<typeof shopLoginSchema>;