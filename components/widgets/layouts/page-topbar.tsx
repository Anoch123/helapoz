"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Hash,
  Loader2,
  LogOut,
  Maximize2,
  Minimize2,
  Power,
  Receipt,
  Sparkles,
  Store,
  Timer,
  Users,
  Wifi,
  WifiOff,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { useShopLogout } from "@/hooks/useShopLogout";
import { accountActions, iconBtn, navigationItems, notifications, shiftActions } from "@/lib/constants/helper-constants";
import { MenuAction } from "@/lib/types/menu.action.type";
import { useCurrentUser } from "@/hooks/use-current-user";
import { formatDate, nameInitialLetters, replaceUnderscoresWithSpaces } from "@/lib/utils/helper-functions";

type Panel = "notifications" | "subscription" | "user" | null;

/* ------------------------------------------------------------------ */
/* Subscription state                                                  */
/* ------------------------------------------------------------------ */

const CURRENCY = "USD"; // change to match your billing currency
const BILLING_CYCLE_DAYS = 30; // used for the cycle progress bar
const WARN_DAYS = 10; // amber at or below this many days left
const CRITICAL_DAYS = 3; // red at or below this many days left
const DAY_MS = 1000 * 60 * 60 * 24;

type SubTone = "ok" | "warn" | "danger" | "neutral";

const subStyles: Record<
  SubTone,
  { chip: string; dot: string; banner: string; bar: string; icon: LucideIcon }
> = {
  ok: {
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    dot: "bg-emerald-500",
    banner: "border-emerald-200 bg-emerald-50 text-emerald-800",
    bar: "bg-emerald-500",
    icon: CheckCircle2,
  },
  warn: {
    chip: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
    dot: "bg-amber-500",
    banner: "border-amber-200 bg-amber-50 text-amber-800",
    bar: "bg-amber-500",
    icon: AlertTriangle,
  },
  danger: {
    chip: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    dot: "bg-red-500",
    banner: "border-red-200 bg-red-50 text-red-800",
    bar: "bg-red-500",
    icon: XCircle,
  },
  neutral: {
    chip: "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100",
    dot: "bg-slate-400",
    banner: "border-slate-200 bg-slate-50 text-slate-700",
    bar: "bg-slate-400",
    icon: CreditCard,
  },
};

type Subscription = ReturnType<typeof useCurrentUser>["subscription"];

type SubState = {
  tone: SubTone;
  label: string; // short text for the topbar chip
  message: string; // sentence for the panel banner
  daysLeft: number | null;
  progress: number; // 0-100
};

function getSubscriptionState(sub: Subscription, now: Date | null): SubState {
  if (!sub) {
    return {
      tone: "neutral",
      label: "No plan",
      message: "No active subscription found for this shop.",
      daysLeft: null,
      progress: 0,
    };
  }

  const status = (sub.status ?? "").toLowerCase();
  const inactive = ["canceled", "cancelled", "expired", "suspended", "inactive"].includes(status);

  if (inactive) {
    return {
      tone: "danger",
      label: replaceUnderscoresWithSpaces(status),
      message: `Your subscription is ${replaceUnderscoresWithSpaces(status)}. Renew to restore full access.`,
      daysLeft: null,
      progress: 100,
    };
  }

  const endRaw = sub.currentPeriodEnd ?? sub.nextBillingDate;
  const end = endRaw ? new Date(endRaw) : null;

  // Before mount (no clock yet) or no date at all
  if (!now || !end) {
    return {
      tone: status === "past_due" ? "danger" : "neutral",
      label: replaceUnderscoresWithSpaces(status) || "Plan",
      message: "Billing dates are not available.",
      daysLeft: null,
      progress: 0,
    };
  }

  const diffDays = Math.ceil((end.getTime() - now.getTime()) / DAY_MS);
  const progress = Math.min(
    100,
    Math.max(0, ((BILLING_CYCLE_DAYS - Math.max(diffDays, 0)) / BILLING_CYCLE_DAYS) * 100),
  );

  // Overdue / past due -> grace period logic
  if (diffDays < 0 || status === "past_due") {
    const overdue = Math.max(0, -diffDays);
    const graceLeft = Math.max(0, (sub.gracePeriodDays ?? 0) - overdue);

    if (graceLeft > 0) {
      return {
        tone: "danger",
        label: `Grace · ${graceLeft}d`,
        message: `Payment is overdue. Access continues for ${graceLeft} more ${graceLeft === 1 ? "day" : "days"}.`,
        daysLeft: 0,
        progress: 100,
      };
    }

    return {
      tone: "danger",
      label: "Expired",
      message: "Your subscription has expired. Renew to restore full access.",
      daysLeft: 0,
      progress: 100,
    };
  }

  if (diffDays <= CRITICAL_DAYS) {
    return {
      tone: "danger",
      label: diffDays === 0 ? "Due today" : `${diffDays}d left`,
      message:
        diffDays === 0
          ? "Your plan renews today. Make sure billing is up to date."
          : `Your plan renews in ${diffDays} ${diffDays === 1 ? "day" : "days"}. Make sure billing is up to date.`,
      daysLeft: diffDays,
      progress,
    };
  }

  if (diffDays <= WARN_DAYS) {
    return {
      tone: "warn",
      label: `${diffDays}d left`,
      message: `Your plan renews in ${diffDays} days.`,
      daysLeft: diffDays,
      progress,
    };
  }

  return {
    tone: "ok",
    label: `${diffDays}d left`,
    message: `Your subscription is in good standing. Renews in ${diffDays} days.`,
    daysLeft: diffDays,
    progress,
  };
}

const formatMoney = (value?: number | null) =>
  typeof value === "number"
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: CURRENCY,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value)
    : "—";

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function PosTopbar() {
  const pathname = usePathname();
  const { logout, isPending } = useShopLogout();
  const user = useCurrentUser();

  const [panel, setPanel] = useState<Panel>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [online, setOnline] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);

  const subscription = user.subscription;
  const plan = subscription?.plan;
  const sub = getSubscriptionState(subscription, now);
  const subStyle = subStyles[sub.tone];
  const SubIcon = subStyle.icon;
  const needsAttention = sub.tone === "warn" || sub.tone === "danger";

  // Longest matching nav item wins, so nested routes resolve to their section.
  const current = [...navigationItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );

  // Live clock (set after mount to avoid hydration mismatch)
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Connectivity
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // Fullscreen state
  useEffect(() => {
    const sync = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  // Close panels on outside click / Escape
  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setPanel(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPanel(null);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  }

  async function handleLogout() {
    setLogoutError(null);
    try {
      await logout();
    } catch {
      setLogoutError("Unable to log out. Please try again.");
    }
  }

  function togglePanel(next: Exclude<Panel, null>) {
    setPanel((p) => (p === next ? null : next));
  }

  function renderAction(a: MenuAction) {
    const Icon = a.icon;
    const cls =
      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900";
    const body = (
      <>
        <Icon className="size-4 text-slate-500" />
        {a.label}
      </>
    );

    if (a.href) {
      return (
        <Link key={a.label} href={a.href} onClick={() => setPanel(null)} className={cls}>
          {body}
        </Link>
      );
    }

    return (
      <button
        key={a.label}
        type="button"
        className={cls}
        onClick={() => {
          a.onSelect?.();
          setPanel(null);
        }}
      >
        {body}
      </button>
    );
  }

  // Surface subscription problems in the notifications list too
  const allNotifications = needsAttention
    ? [
        {
          id: "subscription-alert",
          title: sub.tone === "danger" ? "Subscription needs attention" : "Subscription renewing soon",
          meta: sub.message,
          tone: subStyle.dot,
        },
        ...notifications,
      ]
    : notifications;

  return (
    <div
      ref={rootRef}
      className="sticky top-0 z-30 hidden h-16 items-center justify-between gap-6 border-b bg-background/80 px-8 backdrop-blur lg:flex"
    >
      {/* Left: title + date/time + shop */}
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold leading-tight tracking-tight">
          {current?.title ?? "Dashboard"}
        </h1>
        <p className="flex items-center gap-2 truncate text-xs text-muted-foreground">
          {now && (
            <span>
              {now.toLocaleDateString(undefined, {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
              {" · "}
              {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          {user.shop?.name && (
            <>
              <span className="size-1 rounded-full bg-border" />
              <span className="truncate">{user.shop.name}</span>
            </>
          )}
        </p>
      </div>

      {/* Right: status + actions */}
      <div className="flex items-center gap-2.5">
        {/* Subscription */}
        <div className="relative">
          <button
            type="button"
            aria-label="Subscription details"
            aria-expanded={panel === "subscription"}
            aria-haspopup="dialog"
            onClick={() => togglePanel("subscription")}
            className={`flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition ${subStyle.chip}`}
          >
            <span className="relative flex size-2">
              {sub.tone === "danger" && (
                <span className={`absolute inline-flex size-full animate-ping rounded-full opacity-60 ${subStyle.dot}`} />
              )}
              <span className={`relative inline-flex size-2 rounded-full ${subStyle.dot}`} />
            </span>
            <span className="max-w-[110px] truncate">{plan?.name ?? "No plan"}</span>
            <span className="h-3.5 w-px bg-current opacity-20" />
            <span>{sub.label}</span>
          </button>

          {panel === "subscription" && (
            <div
              role="dialog"
              className="absolute right-0 top-full mt-3 w-[22rem] overflow-hidden rounded-2xl border bg-white shadow-xl shadow-slate-900/10"
            >
              {/* Plan header */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-indigo-700 p-4 text-white">
                <div className="flex items-start justify-between gap-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-200">
                    <Sparkles className="size-3.5" />
                    Subscription
                  </p>
                  {subscription?.status && (
                    <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-white/20">
                      {replaceUnderscoresWithSpaces(subscription.status)}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xl font-semibold tracking-tight">
                  {plan?.name ?? "No active plan"}
                </p>
                {plan && (
                  <p className="mt-0.5 text-sm text-indigo-100">
                    {formatMoney(plan.monthlyPrice)}
                    <span className="text-indigo-300"> / month</span>
                  </p>
                )}
              </div>

              {/* Status banner + progress */}
              <div className="space-y-3 p-4">
                <div className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs font-medium ${subStyle.banner}`}>
                  <SubIcon className="mt-0.5 size-4 shrink-0" />
                  <p>{sub.message}</p>
                </div>

                {subscription && sub.daysLeft !== null && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                      <span>Billing cycle</span>
                      <span>
                        {sub.daysLeft} {sub.daysLeft === 1 ? "day" : "days"} left
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all ${subStyle.bar}`}
                        style={{ width: `${sub.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Details */}
              {subscription && (
                <dl className="space-y-0.5 border-t p-2">
                  <SubRow
                    icon={CreditCard}
                    label="Access type"
                    value={replaceUnderscoresWithSpaces(subscription.accessType ?? "—")}
                  />
                  <SubRow
                    icon={CalendarClock}
                    label="Period ends"
                    value={subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : "—"}
                  />
                  <SubRow
                    icon={Receipt}
                    label="Next billing"
                    value={subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : "—"}
                  />
                  <SubRow
                    icon={Users}
                    label="Included users"
                    value={plan?.includedShopUsers != null ? `${plan.includedShopUsers} users` : "—"}
                  />
                  <SubRow
                    icon={Users}
                    label="Extra user"
                    value={plan?.additionalUserPrice != null ? `${formatMoney(plan.additionalUserPrice)} / mo` : "—"}
                  />
                  <SubRow
                    icon={Timer}
                    label="Grace period"
                    value={`${subscription.gracePeriodDays ?? 0} days`}
                  />
                </dl>
              )}
            </div>
          )}
        </div>

        {/* Connection */}
        <div
          className={`flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-semibold ${
            online
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {online ? <Wifi className="size-4" /> : <WifiOff className="size-4" />}
          {online ? "Online" : "Offline"}
        </div>

        <span className="mx-1 h-8 w-px bg-border" />

        {/* Fullscreen */}
        <button
          type="button"
          aria-label={fullscreen ? "Exit full screen" : "Enter full screen"}
          onClick={toggleFullscreen}
          className={iconBtn}
        >
          {fullscreen ? (
            <Minimize2 className="size-[18px]" />
          ) : (
            <Maximize2 className="size-[18px]" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={panel === "notifications"}
            onClick={() => togglePanel("notifications")}
            className={`${iconBtn} ${panel === "notifications" ? "bg-muted text-foreground" : ""}`}
          >
            <Bell className="size-[18px]" />
            <span
              className={`absolute right-2.5 top-2.5 size-2 rounded-full ring-2 ring-background ${
                needsAttention ? subStyle.dot : "bg-indigo-600"
              }`}
            />
          </button>

          {panel === "notifications" && (
            <div className="absolute right-0 top-full mt-3 w-80 overflow-hidden rounded-2xl border bg-white shadow-xl shadow-slate-900/10">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <p className="text-sm font-semibold">Notifications</p>
                <button type="button" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                  Mark all read
                </button>
              </div>
              <ul className="divide-y">
                {allNotifications.map((n) => (
                  <li key={n.id} className="flex gap-3 px-4 py-3 transition hover:bg-slate-50">
                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.tone}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.meta}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Cashier menu */}
        <div className="relative">
          <button
            type="button"
            aria-expanded={panel === "user"}
            aria-haspopup="menu"
            onClick={() => togglePanel("user")}
            className={`flex items-center gap-2.5 rounded-xl border bg-background py-1 pl-1 pr-2.5 transition hover:bg-muted ${
              panel === "user" ? "bg-muted" : ""
            }`}
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 text-xs font-bold text-white">
              {nameInitialLetters(user.displayName)}
            </span>
            <div className="text-left leading-tight">
              <p className="text-xs font-semibold">{user.displayName}</p>
              <p className="text-[11px] text-muted-foreground">{replaceUnderscoresWithSpaces(user.role)}</p>
            </div>
            <ChevronDown
              className={`size-4 text-muted-foreground transition-transform ${
                panel === "user" ? "rotate-180" : ""
              }`}
            />
          </button>

          {panel === "user" && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-3 w-72 overflow-hidden rounded-2xl border bg-white shadow-xl shadow-slate-900/10"
            >
              {/* Identity */}
              <div className="bg-gradient-to-b from-indigo-50 to-white p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-sm font-bold text-white shadow-md shadow-indigo-600/30">
                    {nameInitialLetters(user.displayName)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-indigo-600/10 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-indigo-700">
                    {replaceUnderscoresWithSpaces(user.role)}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-emerald-700">
                    {replaceUnderscoresWithSpaces(user.membershipStatus)}
                  </span>
                </div>

                {/* Shop */}
                <div className="mt-3 space-y-1.5 rounded-xl border bg-white/80 p-2.5 text-xs">
                  <p className="flex items-center gap-2 font-medium text-slate-700">
                    <Store className="size-3.5 text-slate-400" />
                    <span className="truncate">
                      {user.shop?.name}
                      {user.shop?.city ? ` · ${user.shop.city}` : ""}
                    </span>
                  </p>
                  {user.shop?.shopCode && (
                    <p className="flex items-center gap-2 text-slate-500">
                      <Hash className="size-3.5 text-slate-400" />
                      <span className="font-mono">{user.shop.shopCode}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Shift */}
              <div className="border-t p-2">
                <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Shift
                </p>
                {shiftActions.map(renderAction)}
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-50"
                  onClick={() => setPanel(null)}
                >
                  <Power className="size-4" />
                  Close register
                </button>
              </div>

              {/* Account */}
              <div className="border-t p-2">
                <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Account
                </p>
                {accountActions.map(renderAction)}
              </div>

              {/* Logout */}
              <div className="border-t p-2">
                {logoutError && (
                  <p role="alert" className="px-3 py-1 text-xs text-red-600">
                    {logoutError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isPending}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogOut className="size-4" />
                  )}
                  {isPending ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */

function SubRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-slate-50">
      <dt className="flex items-center gap-2.5 text-slate-500">
        <Icon className="size-4 text-slate-400" />
        {label}
      </dt>
      <dd className="font-medium capitalize text-slate-800">{value}</dd>
    </div>
  );
}