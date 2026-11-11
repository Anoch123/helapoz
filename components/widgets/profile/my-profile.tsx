"use client";

import { useMemo, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  Store,
  ShieldCheck,
  CalendarDays,
  CheckCircle2,
  LockKeyhole,
  MapPin,
  Briefcase,
  Hash,
  CreditCard,
  Users,
  Receipt,
  Sparkles,
  Clock,
  Search,
  KeyRound,
  BadgeCheck,
  Timer,
  LayoutGrid,
  Crown,
} from "lucide-react";

import { useCurrentUser } from "@/hooks/use-current-user";
import { daysUntil, formatDate, formatLabel, formatMoney, getInitials, nameInitialLetters } from "@/lib/utils/helper-functions";
import { TabKey } from "@/lib/types/helper.type";
import { BILLING_CYCLE_DAYS, statusTone } from "@/lib/constants/helper-constants";
import { InfoItem, Panel, StatTile, GlassPill, BreakdownRow, EmptyState, Pill } from "../helper-components/helper-components";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <LayoutGrid className="size-4" /> },
    { key: "subscription", label: "Subscription", icon: <CreditCard className="size-4" /> },
    { key: "permissions", label: "Permissions", icon: <KeyRound className="size-4" /> },
  ];

export default function MyProfile() {
  const user = useCurrentUser();

  const [tab, setTab] = useState<TabKey>("overview");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const isAdmin = user.isShopAdmin;
  const subscription = user.subscription;
  const plan = subscription?.plan;

  const renewalDate =
    subscription?.nextBillingDate ?? subscription?.currentPeriodEnd;
  const daysLeft = daysUntil(renewalDate);
  const cycleProgress =
    daysLeft === null
      ? 0
      : Math.min(
          100,
          Math.max(0, ((BILLING_CYCLE_DAYS - daysLeft) / BILLING_CYCLE_DAYS) * 100),
        );

  const permissionCount = isAdmin
    ? "All"
    : String(user.permissionDetails.length);

  const categories = useMemo(
    () => Array.from(new Set(user.permissionDetails.map((p) => p.category))),
    [user.permissionDetails],
  );

  const groupedPermissions = useMemo(() => {
    const q = query.trim().toLowerCase();

    return user.permissionDetails
      .filter((p) => category === "all" || p.category === category)
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q),
      )
      .reduce<Record<string, typeof user.permissionDetails>>((groups, p) => {
        (groups[p.category] ??= []).push(p);
        return groups;
      }, {});
  }, [user.permissionDetails, query, category]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      {/* ---------------------------------------------------------- */}
      {/* Hero                                                        */}
      {/* ---------------------------------------------------------- */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-6 text-white shadow-xl shadow-indigo-900/20 sm:p-8">
        {/* decoration */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 size-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <div className="flex size-24 items-center justify-center rounded-3xl bg-white/15 text-3xl font-bold tracking-tight ring-1 ring-white/30 backdrop-blur">
                {nameInitialLetters(user.displayName)}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 flex size-8 items-center justify-center rounded-xl bg-emerald-500 ring-4 ring-indigo-700">
                <BadgeCheck className="size-4 text-white" />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                  {user.displayName}
                </h1>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-1 text-[11px] font-semibold text-amber-200 ring-1 ring-amber-300/30">
                    <Crown className="size-3" />
                    Shop Admin
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-indigo-100">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-3.5 opacity-80" />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="size-3.5 opacity-80" />
                    {user.phone}
                  </span>
                )}
                {user.shop?.city && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5 opacity-80" />
                    {user.shop.city}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <GlassPill icon={<ShieldCheck className="size-3.5" />}>
                  {formatLabel(user.role)}
                </GlassPill>
                <GlassPill
                  dotClass={
                    statusTone(user.membershipStatus) === "success"
                      ? "bg-emerald-400"
                      : "bg-amber-400"
                  }
                >
                  {formatLabel(user.membershipStatus)}
                </GlassPill>
                {user.shop?.name && (
                  <GlassPill icon={<Store className="size-3.5" />}>
                    {user.shop.name}
                  </GlassPill>
                )}
              </div>
            </div>
          </div>

          {/* Plan badge */}
          {plan && (
            <div className="shrink-0 rounded-2xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur lg:min-w-[220px]">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-200">
                <Sparkles className="size-3.5" />
                Current plan
              </p>
              <p className="mt-1.5 text-xl font-semibold">{plan.name}</p>
              <p className="mt-0.5 text-sm text-indigo-100">
                {formatMoney(plan.monthlyPrice)}
                <span className="text-indigo-200"> / month</span>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Stat strip                                                  */}
      {/* ---------------------------------------------------------- */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          icon={<CreditCard />}
          label="Subscription"
          value={subscription ? formatLabel(subscription.status) : "None"}
          tone={subscription ? statusTone(subscription.status) : "neutral"}
        />
        <StatTile
          icon={<Clock />}
          label="Next billing"
          value={
            renewalDate
              ? daysLeft === 0
                ? "Today"
                : `${daysLeft} ${daysLeft === 1 ? "day" : "days"}`
              : "—"
          }
          hint={renewalDate ? formatDate(renewalDate) : undefined}
        />
        <StatTile
          icon={<Users />}
          label="Included users"
          value={
            plan?.includedShopUsers != null ? String(plan.includedShopUsers) : "—"
          }
          hint={
            plan?.additionalUserPrice != null
              ? `+${formatMoney(plan.additionalUserPrice)} per extra user`
              : undefined
          }
        />
        <StatTile
          icon={<KeyRound />}
          label="Permissions"
          value={permissionCount}
          hint={isAdmin ? "Full shop access" : "Assigned by admin"}
        />
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Tabs                                                        */}
      {/* ---------------------------------------------------------- */}
      <div
        role="tablist"
        className="flex w-full gap-1 overflow-x-auto rounded-2xl border bg-muted/50 p-1 sm:w-fit"
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition sm:flex-none ${
                active
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Overview                                                    */}
      {/* ---------------------------------------------------------- */}
      {tab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            title="Personal Information"
            description="Your registered account details."
            icon={<UserRound />}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoItem icon={<UserRound />} label="Full Name" value={user.displayName} />
              <InfoItem icon={<Mail />} label="Email Address" value={user.email} />
              <InfoItem icon={<Phone />} label="Phone Number" value={user.phone} />
              <InfoItem
                icon={<ShieldCheck />}
                label="Role"
                value={formatLabel(user.role)}
              />
              <InfoItem
                icon={<BadgeCheck />}
                label="Membership Status"
                value={formatLabel(user.membershipStatus)}
              />
              <InfoItem
                icon={<CalendarDays />}
                label="Member Since"
                value={formatDate(user.membershipCreatedAt)}
              />
            </div>
          </Panel>

          <Panel
            title="Shop Information"
            description="Business details for your current shop."
            icon={<Store />}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoItem icon={<Store />} label="Shop Name" value={user.shop.name} />
              <InfoItem icon={<Hash />} label="Shop Code" value={user.shop.shopCode} mono />
              <InfoItem
                icon={<Briefcase />}
                label="Business Type"
                value={formatLabel(user.shop.businessType)}
              />
              <InfoItem icon={<MapPin />} label="City" value={user.shop.city} />
              <InfoItem icon={<Mail />} label="Contact Email" value={user.shop.contactEmail} />
              <InfoItem icon={<Phone />} label="Contact Phone" value={user.shop.contactPhone} />
              <InfoItem
                icon={<CalendarDays />}
                label="Shop Created"
                value={formatDate(user.shop.createdAt)}
              />
            </div>
          </Panel>
        </div>
      )}

      {/* ---------------------------------------------------------- */}
      {/* Subscription                                                */}
      {/* ---------------------------------------------------------- */}
      {tab === "subscription" &&
        (subscription ? (
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Plan card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-indigo-700 p-6 text-white shadow-xl shadow-indigo-900/20 lg:col-span-2">
              <div className="pointer-events-none absolute -right-12 -top-12 size-52 rounded-full bg-white/10 blur-2xl" />

              <div className="relative flex items-start justify-between gap-3">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-200">
                  <Sparkles className="size-3.5" />
                  Your plan
                </p>
                <Pill tone={statusTone(subscription.status)} dot>
                  {formatLabel(subscription.status)}
                </Pill>
              </div>

              <h2 className="relative mt-4 text-3xl font-semibold tracking-tight">
                {plan?.name ?? "No active plan"}
              </h2>

              {plan && (
                <p className="relative mt-2 flex items-baseline gap-1.5">
                  <span className="text-5xl font-semibold tracking-tight">
                    {formatMoney(plan.monthlyPrice)}
                  </span>
                  <span className="text-sm text-indigo-200">/ month</span>
                </p>
              )}

              <div className="relative mt-8">
                <div className="flex items-center justify-between text-xs text-indigo-200">
                  <span>Billing cycle</span>
                  <span>
                    {daysLeft === null
                      ? "—"
                      : daysLeft === 0
                        ? "Renews today"
                        : `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-300 to-white transition-all"
                    style={{ width: `${cycleProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-indigo-200">
                  {renewalDate ? `Renews on ${formatDate(renewalDate)}` : "No renewal date"}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6 lg:col-span-3">
              <Panel
                title="Billing Details"
                description="Dates and access for your subscription."
                icon={<Receipt />}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <InfoItem
                    icon={<BadgeCheck />}
                    label="Status"
                    value={formatLabel(subscription.status)}
                  />
                  <InfoItem
                    icon={<CreditCard />}
                    label="Access Type"
                    value={formatLabel(subscription.accessType)}
                  />
                  <InfoItem
                    icon={<CalendarDays />}
                    label="Current Period Ends"
                    value={
                      subscription.currentPeriodEnd
                        ? formatDate(subscription.currentPeriodEnd)
                        : null
                    }
                  />
                  <InfoItem
                    icon={<Clock />}
                    label="Next Billing Date"
                    value={
                      subscription.nextBillingDate
                        ? formatDate(subscription.nextBillingDate)
                        : null
                    }
                  />
                  <InfoItem
                    icon={<Timer />}
                    label="Grace Period"
                    value={`${subscription.gracePeriodDays} days`}
                  />
                </div>
              </Panel>

              <Panel
                title="Pricing Breakdown"
                description="What your plan includes and what extra users cost."
                icon={<Users />}
              >
                <dl className="divide-y rounded-xl border">
                  <BreakdownRow label="Base plan" value={`${formatMoney(plan?.monthlyPrice)} / month`} />
                  <BreakdownRow
                    label="Users included"
                    value={
                      plan?.includedShopUsers != null
                        ? `${plan.includedShopUsers} users`
                        : "—"
                    }
                  />
                  <BreakdownRow
                    label="Each additional user"
                    value={
                      plan?.additionalUserPrice != null
                        ? `${formatMoney(plan.additionalUserPrice)} / One-Time Payment`
                        : "—"
                    }
                  />
                </dl>

                <p className="mt-4 flex items-start gap-2 rounded-xl bg-indigo-500/5 p-3 text-xs text-muted-foreground ring-1 ring-inset ring-indigo-500/10">
                  <Timer className="mt-0.5 size-3.5 shrink-0 text-indigo-600" />
                  If a payment fails, your shop keeps access for{" "}
                  {subscription.gracePeriodDays} days before it is restricted.
                </p>
              </Panel>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<CreditCard />}
            title="No subscription found"
            body="Contact your Shop Admin for billing details."
          />
        ))}

      {/* ---------------------------------------------------------- */}
      {/* Permissions                                                 */}
      {/* ---------------------------------------------------------- */}
      {tab === "permissions" &&
        (isAdmin ? (
          <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                <ShieldCheck className="size-7" />
              </span>
              <div>
                <h3 className="text-lg font-semibold">Full Shop Access</h3>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                  As the Shop Admin, you have access to all active shop
                  features. Your permissions are managed by your role.
                </p>
              </div>
            </div>
          </div>
        ) : user.permissionDetails.length === 0 ? (
          <EmptyState
            icon={<LockKeyhole />}
            title="No permissions assigned"
            body="Contact your Shop Admin to request access."
          />
        ) : (
          <div className="space-y-5">
            {/* Search + filters */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search permissions"
                  className="h-11 w-full appearance-none rounded-xl border bg-background pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {["all", ...categories].map((c) => {
                  const active = category === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                        active
                          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                          : "border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {c === "all" ? "All" : formatLabel(c)}
                    </button>
                  );
                })}
              </div>
            </div>

            {Object.keys(groupedPermissions).length === 0 ? (
              <EmptyState
                icon={<Search />}
                title="No matching permissions"
                body="Try a different search or category."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(groupedPermissions).map(([cat, permissions]) => (
                  <div key={cat} className="rounded-2xl border bg-card p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-sm font-semibold">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                          <KeyRound className="size-4" />
                        </span>
                        {formatLabel(cat)}
                      </h3>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {permissions.length}
                      </span>
                    </div>

                    <ul className="space-y-3">
                      {permissions.map((permission) => (
                        <li
                          key={permission.permissionKey}
                          className="flex items-start gap-3 rounded-xl p-2 transition hover:bg-muted/60"
                        >
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-tight">
                              {permission.name}
                            </p>
                            {permission.description && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

      {!isAdmin && (
        <p className="text-center text-xs text-muted-foreground">
          Your profile and permissions are managed by your shop administration.
        </p>
      )}
    </div>
  );
}