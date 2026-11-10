
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
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useShopLogout } from "@/hooks/useShopLogout";
import { BASICSYSTEMDATA, navigationItems } from "@/lib/constants/helper-constants";

export default function PosSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const { logout, isPending } = useShopLogout();

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === href;
    }

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
      {/* Mobile top navigation */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 lg:hidden">
        <Link
          href="/dashboard"
          onClick={closeMobileSidebar}
          className="flex items-center gap-2 font-semibold"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="size-5" />
          </div>
          <span>{BASICSYSTEMDATA.appName}</span>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen((current) => !current)}
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
        >
          {isMobileOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </Button>
      </header>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b px-5">
          <Link
            href="/dashboard"
            onClick={closeMobileSidebar}
            className="flex items-center gap-3"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store className="size-5" />
            </div>

            <div>
              <p className="text-sm font-bold tracking-tight">
                {BASICSYSTEMDATA.appName}
              </p>
              <p className="text-xs text-muted-foreground">
                Shop workspace
              </p>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={closeMobileSidebar}
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Workspace information */}
        <div className="px-4 py-5">
          <div className="rounded-xl border bg-muted/40 p-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-background">
                <Store className="size-4 text-muted-foreground" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold">
                  Shop Workspace
                </p>
                <p className="text-xs text-muted-foreground">
                  POS Management
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace
          </p>

          {navigationItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileSidebar}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="size-[18px]" />
                  {item.title}
                </span>

                {active && (
                  <ChevronRight className="size-4" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t p-4">
          {logoutError && (
            <p
              role="alert"
              className="mb-3 text-xs text-destructive"
            >
              {logoutError}
            </p>
          )}

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <LogOut />
            )}

            {isPending ? "Logging out..." : "Logout"}
          </Button>

          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            {BASICSYSTEMDATA.appName}
          </p>
        </div>
      </aside>
    </>
  );
}
