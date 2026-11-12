// No "use client" here on purpose: these are plain values that both server
// components (e.g. the user loader) and client components need to import.
// Values exported from a "use client" file reach server code as references,
// not real arrays, which is why ROLE_ORDER.includes was not a function.

// Lowest -> highest. Edit to match your project.
export const ROLE_ORDER = ["SHOP_USER", "SHOP_ADMIN"] as const;
export type Role = (typeof ROLE_ORDER)[number];

/** Roles that automatically have every permission. */
export const ALL_ACCESS_ROLES: readonly Role[] = ["SHOP_ADMIN"];

/** Narrow any string (e.g. from the database) to a known Role, otherwise null. */
export function toAccessRole(role: unknown): Role | null {
  const value = String(role ?? "").toUpperCase();
  return (ROLE_ORDER as readonly string[]).includes(value)
    ? (value as Role)
    : null;
}