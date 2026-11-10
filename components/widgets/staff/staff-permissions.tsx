
"use client";

import { useMemo } from "react";
import { Loader2, Save, ShieldCheck, Shield, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useShopUserPermissions } from "@/hooks/useShopUserPermissions";

type StaffPermissionsProps = {
  membershipId: string;
  staffName?: string;
};

function formatCategory(category: string) {
  return category
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function StaffPermissions({
  membershipId,
  staffName,
}: StaffPermissionsProps) {
  const {
    availablePermissions,
    selectedPermissions,
    isLoading,
    isSaving,
    error,
    successMessage,
    togglePermission,
    toggleCategory,
    savePermissions,
  } = useShopUserPermissions(membershipId);

  const groupedPermissions = useMemo(() => {
    return availablePermissions.reduce<
      Record<string, typeof availablePermissions>
    >((groups, permission) => {
      if (!groups[permission.category]) {
        groups[permission.category] = [];
      }

      groups[permission.category].push(permission);

      return groups;
    }, {});
  }, [availablePermissions]);

  const selectedCount = selectedPermissions.length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Loading permissions...
        </CardContent>
      </Card>
    );
  }

  if (error && availablePermissions.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
          <Shield className="size-8 text-muted-foreground" />
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const categories = Object.entries(groupedPermissions);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Permission Management
            </CardTitle>

            <CardDescription>
              {staffName
                ? `Manage what ${staffName} can access in your shop.`
                : "Manage which features this Shop User can access."}
            </CardDescription>
          </div>

          <div className="shrink-0 rounded-lg bg-primary/10 px-3 py-2 text-center">
            <p className="text-xl font-semibold tabular-nums text-primary">
              {selectedCount}
            </p>
            <p className="text-xs text-muted-foreground">
              Selected
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Available permissions
            </span>
            <span className="font-medium">
              {availablePermissions.length}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${
                  availablePermissions.length > 0
                    ? Math.min(
                        100,
                        (selectedCount / availablePermissions.length) * 100,
                      )
                    : 0
                }%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 p-3 text-sm text-green-700 dark:text-green-400"
        >
          <CheckCircle2 className="size-4 shrink-0" />
          {successMessage}
        </div>
      )}

      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No active permissions are currently available.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map(([category, permissions]) => {
            const permissionKeys = permissions.map(
              (permission) => permission.permission_key,
            );

            const categorySelectedCount = permissionKeys.filter(
              (key) => selectedPermissions.includes(key),
            ).length;

            const allSelected =
              categorySelectedCount === permissionKeys.length;

            return (
              <Card key={category}>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="text-base">
                      {formatCategory(category)}
                    </CardTitle>

                    <CardDescription>
                      {categorySelectedCount} of {permissions.length}{" "}
                      permissions selected
                    </CardDescription>
                  </div>

                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={() => toggleCategory(permissionKeys)}
                    disabled={isSaving}
                    aria-label={`Select all ${formatCategory(category)} permissions`}
                  />
                </CardHeader>

                <CardContent className="space-y-4">
                  {permissions.map((permission) => {
                    const checked = selectedPermissions.includes(
                      permission.permission_key,
                    );

                    return (
                      <label
                        key={permission.permission_key}
                        className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() =>
                            togglePermission(permission.permission_key)
                          }
                          disabled={isSaving}
                          className="mt-0.5"
                        />

                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">
                            {permission.name}
                          </span>

                          {permission.description && (
                            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                              {permission.description}
                            </span>
                          )}

                          <span className="mt-1 block break-all font-mono text-[11px] text-muted-foreground/80">
                            {permission.permission_key}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Changes take effect when saved.
        </p>

        <Button
          onClick={savePermissions}
          disabled={isSaving || isLoading}
        >
          {isSaving ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Save />
          )}

          {isSaving ? "Saving permissions..." : "Save Permissions"}
        </Button>
      </div>
    </div>
  );
}
