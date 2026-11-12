"use client";

import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useMemo,
  type ReactElement,
  type ReactNode,
} from "react";

import {
  ALL_ACCESS_ROLES,
  ROLE_ORDER,
  type Role,
} from "@/lib/constants/access-roles";

/* -------------------------------------------------------------------------- */
/*  Roles                                                                      */
/* -------------------------------------------------------------------------- */

// Role constants live in a plain module so server components can use them too.
export type { Role };

const rank = (role: Role | null) => (role ? ROLE_ORDER.indexOf(role) : -1);

/* -------------------------------------------------------------------------- */
/*  Context                                                                    */
/* -------------------------------------------------------------------------- */

type AccessState = {
  role: Role | null;
  /** Fine-grained keys, e.g. "orders.refund" */
  permissions: string[];
};

const AccessContext = createContext<AccessState>({ role: null, permissions: [] });

export function AccessProvider({
  role,
  permissions = [],
  children,
}: {
  role: Role | null;
  permissions?: string[];
  children: ReactNode;
}) {
  const value = useMemo(() => ({ role, permissions }), [role, permissions]);
  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

/* -------------------------------------------------------------------------- */
/*  Rule + hook                                                                */
/* -------------------------------------------------------------------------- */

export type AccessRule = {
  /** Exact roles allowed */
  roles?: Role | Role[];
  /** Minimum role in ROLE_ORDER (e.g. "manager" allows manager, admin, owner) */
  minRole?: Role;
  /** Permission key(s) required */
  permissions?: string | string[];
  /** "any" (default) or "all" for the permissions list */
  permissionMatch?: "any" | "all";
  /** How role rules and permission rules combine. Default "all" (both must pass) */
  require?: "all" | "any";
};

const toArray = <T,>(v?: T | T[]) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

export function useAccess() {
  const { role, permissions } = useContext(AccessContext);

  return useMemo(() => {
    const hasRole = (roles: Role | Role[]) =>
      role !== null && toArray(roles).includes(role);

    const hasMinRole = (min: Role) => rank(role) >= rank(min) && role !== null;

    const hasPermission = (keys: string | string[], match: "any" | "all" = "any") => {
      // SHOP_ADMIN (see ALL_ACCESS_ROLES) passes every permission check.
      if (role !== null && ALL_ACCESS_ROLES.includes(role)) return true;

      const list = toArray(keys);
      if (list.length === 0) return true;
      return match === "all"
        ? list.every((k) => permissions.includes(k))
        : list.some((k) => permissions.includes(k));
    };

    const can = (rule: AccessRule) => {
      const checks: boolean[] = [];

      if (rule.roles !== undefined) checks.push(hasRole(rule.roles));
      if (rule.minRole !== undefined) checks.push(hasMinRole(rule.minRole));
      if (rule.permissions !== undefined)
        checks.push(hasPermission(rule.permissions, rule.permissionMatch));

      if (checks.length === 0) return true;
      return rule.require === "any" ? checks.some(Boolean) : checks.every(Boolean);
    };

    return { role, permissions, hasRole, hasMinRole, hasPermission, can };
  }, [role, permissions]);
}

/* -------------------------------------------------------------------------- */
/*  <Can />                                                                    */
/* -------------------------------------------------------------------------- */

type CanProps = AccessRule & {
  children: ReactNode;
  /** Rendered when access is denied (mode="hide" only) */
  fallback?: ReactNode;
  /**
   * "hide"    -> render nothing / fallback (default)
   * "disable" -> render the single child element, but disabled
   */
  mode?: "hide" | "disable";
  /** Invert the rule: show only when the user does NOT match */
  not?: boolean;
  /** Tooltip shown on disabled elements */
  disabledReason?: string;
};

/**
 * Role / permission gate.
 *
 *   <Can roles="admin"><Button>Delete shop</Button></Can>
 *   <Can minRole="manager" permissions="orders.refund" mode="disable"><Checkbox /></Can>
 *   <Can not roles="user"><AdminBanner /></Can>
 */
export function Can({
  children,
  fallback = null,
  mode = "hide",
  not = false,
  disabledReason = "You don't have access to this",
  ...rule
}: CanProps) {
  const { can } = useAccess();
  const allowed = not ? !can(rule) : can(rule);

  if (allowed) return <>{children}</>;

  if (mode === "disable" && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    return cloneElement(child, {
      disabled: true,
      "aria-disabled": true,
      title: disabledReason,
      onClick: undefined,
      onCheckedChange: undefined,
    });
  }

  return <>{fallback}</>;
}

/* -------------------------------------------------------------------------- */
/*  withAccess HOC (optional, for whole components)                            */
/* -------------------------------------------------------------------------- */

export function withAccess<P extends object>(
  Component: React.ComponentType<P>,
  rule: AccessRule,
  fallback: ReactNode = null,
) {
  return function Guarded(props: P) {
    return (
      <Can {...rule} fallback={fallback}>
        <Component {...props} />
      </Can>
    );
  };
}