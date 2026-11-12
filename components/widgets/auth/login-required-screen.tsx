"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Lightbulb,
  Loader2,
  LogIn,
  LogOut,
  Phone,
  ShieldCheck,
  Store,
} from "lucide-react";

import { ShopAccessScreenProps } from "@/lib/types/helper.type";
import {
  accessMessages,
  BASICSYSTEMDATA,
  fallbackMessage,
  VARIANTS,
} from "@/lib/constants/helper-constants";
import { useShopLogout } from "@/hooks/useShopLogout";
import { useState } from "react";

export default function LoginRequiredScreen({ code }: ShopAccessScreenProps) {
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const message = accessMessages[code] ?? fallbackMessage;
  const Icon = message.icon;

  const { logout, isPending } = useShopLogout();

  const isLogin = code;
  const v = isLogin ? VARIANTS.login : VARIANTS.restricted;

  const phone = BASICSYSTEMDATA.phone
    ? String(BASICSYSTEMDATA.phone)
    : null;

  async function handleLogout() {
    setLogoutError(null);
    try {
      await logout();
    } catch {
      setLogoutError("Unable to log out. Please try again.");
    }
  }

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* ------------------------------ Brand panel ------------------------------ */}
      <aside
        className={`relative hidden overflow-hidden bg-gradient-to-br ${v.panel} p-12 text-white lg:flex lg:flex-col lg:justify-between`}
      >
        {/* decorative rings */}
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-8 -top-8 size-56 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Store className="size-5" />
          </span>
          <span className="text-xl font-semibold tracking-widest">
            {BASICSYSTEMDATA.appNameCapitalize}
          </span>
        </div>

        <div className="relative max-w-md">
          <span className="flex size-20 items-center justify-center rounded-3xl bg-white/15 backdrop-blur">
            <Icon className="size-10" />
          </span>
          <h2 className="mt-8 text-4xl font-semibold leading-tight tracking-tight">
            {v.panelTitle}
          </h2>
          <p className="mt-4 text-base leading-7 text-white/75">
            {v.panelText}
          </p>
        </div>

        <div className="relative flex items-center gap-2 text-sm text-white/70">
          <ShieldCheck className="size-4" />
          Your shop data remains protected.
        </div>
      </aside>

      {/* ------------------------------ Content ------------------------------ */}
      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          {/* mobile branding */}
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-600/30">
              <Building2 className="size-5" />
            </span>
            <span className="text-xl font-semibold tracking-tight">
              {BASICSYSTEMDATA.appNameCapitalize}
            </span>
          </div>

          <span
            className={`flex size-14 items-center justify-center rounded-2xl ${v.iconWrap} lg:hidden`}
          >
            <Icon className="size-7" />
          </span>

          <span
            className={`mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold lg:mt-0 ${v.badgeStyle}`}
          >
            <span className={`size-1.5 rounded-full ${v.dot}`} />
            {v.badge}
          </span>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            {message.title}
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {message.description}
          </p>

          {/* What to do */}
          <div className="mt-8 flex gap-3 rounded-2xl border bg-muted/40 p-4">
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${v.tip}`}
            >
              <Lightbulb className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">What should you do?</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {message.action}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            {isLogin && (
              <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isPending}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogOut className="size-4" />
                  )}
                  {isPending ? "Logging out..." : "Sign in again"}
                </button>
            )}

            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3 rounded-xl border bg-card p-3.5 transition hover:bg-muted/60"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
                  <Phone className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Call support</p>
                  <p className="text-sm font-semibold tracking-tight">
                    {phone}
                  </p>
                </div>
              </a>
            )}
          </div>

          <p className="mt-8 border-t pt-5 text-xs leading-5 text-muted-foreground">
            If you believe this is a mistake, please contact{" "}
            {BASICSYSTEMDATA.appNameCapitalize} support.
          </p>
        </div>
      </section>
    </main>
  );
}