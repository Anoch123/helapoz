
"use client";

import { useMemo } from "react";
import {
  UserRound,
  Mail,
  Phone,
  Store,
  ShieldCheck,
  CalendarDays,
  CheckCircle2,
  LockKeyhole,
  RefreshCw,
  Loader2,
} from "lucide-react";

import { useShopProfile } from "@/hooks/useShopProfile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-LK", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export default function MyProfile() {
  const {
    profile,
    access,
    isLoading,
    error,
    refresh,
  } = useShopProfile();

  const groupedPermissions = useMemo(() => {
    if (!access) return {};

    return access.permissions.reduce<
      Record<string, typeof access.permissions>
    >((groups, permission) => {
      if (!groups[permission.category]) {
        groups[permission.category] = [];
      }

      groups[permission.category].push(permission);

      return groups;
    }, {});
  }, [access]);

  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !profile || !access) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-destructive">
              {error || "Unable to load your profile."}
            </p>

            <Button variant="outline" onClick={refresh}>
              <RefreshCw />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdmin = profile.role === "SHOP_ADMIN";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          View your account information and access permissions.
        </p>
      </div>

      {/* Profile overview */}
      <Card>
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <UserRound className="size-8 text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold">
              {profile.displayName}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {profile.email}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {formatLabel(profile.role)}
              </span>

              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
                {formatLabel(profile.status)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Your registered account information.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5 sm:grid-cols-2">
          <InfoItem
            icon={<UserRound />}
            label="Full Name"
            value={profile.displayName}
          />

          <InfoItem
            icon={<Mail />}
            label="Email Address"
            value={profile.email}
          />

          <InfoItem
            icon={<Phone />}
            label="Phone Number"
            value={profile.phone || "Not provided"}
          />

          <InfoItem
            icon={<CalendarDays />}
            label="Account Created"
            value={formatDate(profile.createdAt)}
          />
        </CardContent>
      </Card>

      {/* Shop information */}
      <Card>
        <CardHeader>
          <CardTitle>Shop Information</CardTitle>
          <CardDescription>
            Your current shop membership.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5 sm:grid-cols-2">
          <InfoItem
            icon={<Store />}
            label="Shop Name"
            value={profile.shop.name}
          />

          <InfoItem
            icon={<ShieldCheck />}
            label="Shop Code"
            value={profile.shop.shopCode}
          />

          <InfoItem
            icon={<UserRound />}
            label="Your Role"
            value={formatLabel(profile.role)}
          />

          <InfoItem
            icon={<LockKeyhole />}
            label="Membership Status"
            value={formatLabel(profile.status)}
          />
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>My Permissions</CardTitle>
              <CardDescription className="mt-1">
                {isAdmin
                  ? "You have full access to your shop."
                  : "These permissions have been assigned by your Shop Admin."}
              </CardDescription>
            </div>

            <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {isAdmin
                ? "Full Access"
                : `${access.permissions.length} Permissions`}
            </span>
          </div>
        </CardHeader>

        <CardContent>
          {isAdmin ? (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />

              <div>
                <p className="text-sm font-semibold">
                  Full Shop Access
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  As the Shop Admin, you have access to all active shop features.
                  Your permissions are managed by your role.
                </p>
              </div>
            </div>
          ) : access.permissions.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <LockKeyhole className="mx-auto size-8 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium">
                No permissions assigned
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Contact your Shop Admin to request access.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(
                ([category, permissions]) => (
                  <div key={category}>
                    <h3 className="mb-3 text-sm font-semibold">
                      {formatLabel(category)}
                    </h3>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {permissions.map((permission) => (
                        <div
                          key={permission.permission_key}
                          className="flex items-start gap-3 rounded-lg border p-3"
                        >
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />

                          <div className="min-w-0">
                            <p className="text-sm font-medium">
                              {permission.name}
                            </p>

                            {permission.description && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Your profile and permissions are managed by your shop administration.
      </p>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 break-words text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
