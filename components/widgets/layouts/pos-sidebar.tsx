
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Store,
  Menu,
  X,
  LogOut,
  Loader2,
  Plus,
} from "lucide-react";

import { useShopLogout } from "@/hooks/useShopLogout";
import { useCurrentUser } from "@/hooks/use-current-user";

import {
  BASICSYSTEMDATA,
  navigationItems,
} from "@/lib/constants/helper-constants";

const NEW_SALE_HREF = "/pos";

// Map existing navigation routes to database permission keys.
const navigationPermissions: Record<string, string> = {
  "/dashboard": "dashboard.view",
  "/staff": "staff.view",
  "/sales": "sales.view"
};

export default function PosSidebar() {
  const pathname = usePathname();
  const user = useCurrentUser();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const { logout, isPending } = useShopLogout();

  // Shop Admin has full access.
  // Shop Users must have the required permission.
  function hasPermission(permissionKey: string) {
    if (user.isShopAdmin) return true;

    return user.permissions.includes(permissionKey);
  }

  // Only show navigation items the current user can access.
  const visibleNavigationItems = navigationItems.filter((item) => {
    const requiredPermission = navigationPermissions[item.href];

    // Unknown routes should not automatically become accessible.
    if (!requiredPermission) return false;

    return hasPermission(requiredPermission);
  });

  // New Sale requires sales.create.
  const canCreateSale = hasPermission("sales.create");

  // The brand link should never send a user to a page
  // they are not authorized to access.
  const homeHref =
    visibleNavigationItems[0]?.href ??
    (canCreateSale ? NEW_SALE_HREF : null);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === href;

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    setLogoutError(null);

    try {
      await logout();
    } catch {
      setLogoutError("Unable to log out. Please try again.");
    }
  }

  function closeMobileSidebar() {
    setIsMobileOpen(false);
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur lg:hidden">
        {homeHref ? (
          <Link
            href={homeHref}
            onClick={closeMobileSidebar}
            className="flex items-center gap-2.5 font-semibold"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-600/30">
              <Store className="size-[18px]" />
            </span>

            <span className="tracking-wide">
              {BASICSYSTEMDATA.appName}
            </span>
          </Link>
        ) : (
          <div className="flex items-center gap-2.5 font-semibold">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white">
              <Store className="size-[18px]" />
            </span>

            <span>{BASICSYSTEMDATA.appName}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsMobileOpen((current) => !current)}
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          className="flex size-10 items-center justify-center rounded-xl border bg-background text-foreground transition hover:bg-muted"
        >
          {isMobileOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>
      </header>

      {/* Backdrop */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white text-slate-600 transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-indigo-50 to-transparent" />

        {/* Brand */}
        <div className="relative flex h-16 items-center justify-between px-5">
          {homeHref ? (
            <Link
              href={homeHref}
              onClick={closeMobileSidebar}
              className="flex items-center gap-3"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-600/30">
                <Store className="size-5" />
              </span>

              <div className="leading-tight">
                <p className="text-sm font-bold tracking-widest text-slate-900">
                  {BASICSYSTEMDATA.appName}
                </p>

                <p className="text-[11px] text-slate-500">
                  Point of Sale
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white">
                <Store className="size-5" />
              </span>

              <div className="leading-tight">
                <p className="text-sm font-bold tracking-widest text-slate-900">
                  {BASICSYSTEMDATA.appName}
                </p>

                <p className="text-[11px] text-slate-500">
                  Point of Sale
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={closeMobileSidebar}
            aria-label="Close sidebar"
            className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* New Sale CTA */}
        {canCreateSale && (
          <div className="relative px-4 pb-2 pt-4">
            <Link
              href={NEW_SALE_HREF}
              onClick={closeMobileSidebar}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 active:scale-[0.98]"
            >
              <Plus className="size-4" />
              New sale
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="relative flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Menu
          </p>

          {visibleNavigationItems.length > 0 ? (
            visibleNavigationItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileSidebar}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {active && (
                    <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600" />
                  )}

                  <span
                    className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
                      active
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                    }`}
                  >
                    <Icon className="size-[17px]" />
                  </span>

                  {item.title}
                </Link>
              );
            })
          ) : (
            <div className="px-3 py-6 text-center">
              <p className="text-sm font-medium text-slate-600">
                No available modules
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Contact your Shop Admin to request access.
              </p>
            </div>
          )}
        </nav>

        {/* Logout */}
        <div className="relative border-t p-4">
          {logoutError && (
            <p role="alert" className="mb-3 text-xs text-red-600">
              {logoutError}
            </p>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}

            {isPending ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}
