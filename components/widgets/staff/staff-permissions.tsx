"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Loader2,
  Lock,
  RotateCcw,
  Save,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DetailLayout,
  EmptyState,
  ErrorState,
  InfoRow,
  InlineAlert,
  LoadingState,
  PageContainer,
  PageHeader,
  Panel,
  ProgressRing,
  SearchField,
  ToggleSwitch,
} from "@/components/widgets/layouts/page-kit";
import { cn } from "@/lib/utils";
import { useShopUserPermissions } from "@/hooks/useShopUserPermissions";
import { Can } from "../auth/access-control";

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

  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  /* ---- dirty tracking: baseline = last loaded / last saved selection ---- */
  const baseline = useRef<string[] | null>(null);

  useEffect(() => {
    if (!isLoading && baseline.current === null) {
      baseline.current = [...selectedPermissions];
    }
  }, [isLoading, selectedPermissions]);

  useEffect(() => {
    if (successMessage) baseline.current = [...selectedPermissions];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successMessage]);

  const isDirty = useMemo(() => {
    if (!baseline.current) return false;
    const a = new Set(baseline.current);
    const b = new Set(selectedPermissions);
    if (a.size !== b.size) return true;
    for (const k of a) if (!b.has(k)) return true;
    return false;
  }, [selectedPermissions]);

  const resetChanges = () => {
    if (!baseline.current) return;
    const target = new Set(baseline.current);
    const current = new Set(selectedPermissions);
    availablePermissions.forEach((p) => {
      if (target.has(p.permission_key) !== current.has(p.permission_key)) {
        togglePermission(p.permission_key);
      }
    });
  };

  /* ---- grouping + filtering ---- */
  const q = query.trim().toLowerCase();

  const groupedPermissions = useMemo(() => {
    const filtered = q
      ? availablePermissions.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.permission_key.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q),
        )
      : availablePermissions;

    return filtered.reduce<Record<string, typeof availablePermissions>>(
      (groups, permission) => {
        (groups[permission.category] ??= []).push(permission);
        return groups;
      },
      {},
    );
  }, [availablePermissions, q]);

  const categories = Object.entries(groupedPermissions);
  const selectedCount = selectedPermissions.length;
  const total = availablePermissions.length;

  const toggleCollapsed = (category: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });

  /* ---- states ---- */
  if (isLoading) {
    return (
      <PageContainer>
        <Panel>
          <LoadingState label="Loading permissions..." />
        </Panel>
      </PageContainer>
    );
  }

  if (error && total === 0) {
    return (
      <PageContainer>
        <Panel>
          <ErrorState message={error} />
        </Panel>
      </PageContainer>
    );
  }

  const description = staffName
    ? `Manage what ${staffName} can access in your shop.`
    : "Manage which features this Shop User can access.";

  return (
    <PageContainer>
      <PageHeader
        backHref={`/staff/${membershipId}`}
        backLabel="Back to Staff"
        icon={ShieldCheck}
        title="Permission Management"
        description={description}
      />

      <DetailLayout
        asideFirstOnMobile
        aside={
          <Panel
            className="lg:sticky lg:top-6"
            title="Summary"
            description={staffName ?? "Shop User"}
            padded
          >
            <div className="space-y-5">
              <div className="flex justify-center">
                <ProgressRing value={selectedCount} total={total} />
              </div>

              <div className="space-y-2">
                <InfoRow label="Selected" value={selectedCount} />
                <InfoRow label="Available" value={total} />
                <InfoRow
                  label="Status"
                  value={
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        isDirty
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {isDirty ? "Unsaved changes" : "Up to date"}
                    </span>
                  }
                />
              </div>

              <Can
                permissions="staff.permissions.manage"
                fallback={
                  <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                    <Lock className="size-3.5" />
                    You have view-only access.
                  </div>
                }
              >
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={savePermissions}
                    disabled={isSaving || isLoading || !isDirty}
                  >
                    {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                    {isSaving ? "Saving..." : "Save Permissions"}
                  </Button>

                  {isDirty && (
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={resetChanges}
                      disabled={isSaving}
                    >
                      <RotateCcw />
                      Discard changes
                    </Button>
                  )}
                </div>
              </Can>
            </div>
          </Panel>
        }
        main={
          <>
            <div className="flex sm:[&>div]:w-full sm:[&>div]:max-w-md">
              <SearchField
                value={query}
                onChange={setQuery}
                placeholder="Search permissions..."
                ariaLabel="Search permissions"
              />
            </div>

            {error && <InlineAlert>{error}</InlineAlert>}
            {successMessage && (
              <InlineAlert tone="success">{successMessage}</InlineAlert>
            )}

            {categories.length === 0 ? (
              <Panel>
                <EmptyState
                  icon={ShieldCheck}
                  title={
                    q ? "No matching permissions" : "No permissions available"
                  }
                  description={
                    q
                      ? "Try another search term."
                      : "No active permissions are currently available."
                  }
                />
              </Panel>
            ) : (
              categories.map(([category, permissions]) => {
                const keys = permissions.map((p) => p.permission_key);
                const count = keys.filter((k) =>
                  selectedPermissions.includes(k),
                ).length;
                const all = count === keys.length;
                const some = count > 0 && !all;
                const isOpen = !collapsed.has(category) || q.length > 0;

                return (
                  <section
                    key={category}
                    className="overflow-hidden rounded-2xl border bg-card"
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleCollapsed(category)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleCollapsed(category);
                        }
                      }}
                      className="flex cursor-pointer items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/40 sm:gap-4 sm:px-5"
                    >
                      <ChevronDown
                        className={cn(
                          "size-4 shrink-0 text-muted-foreground transition-transform",
                          !isOpen && "-rotate-90",
                        )}
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold">
                          {formatCategory(category)}
                        </h3>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted sm:w-32">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{
                                width: `${(count / keys.length) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {count}/{keys.length}
                          </span>
                        </div>
                      </div>

                      <Can
                        permissions="staff.permissions.manage"
                        mode="disable"
                      >
                        <ToggleSwitch
                          checked={all}
                          indeterminate={some}
                          disabled={isSaving}
                          onChange={() => toggleCategory(keys)}
                          label={`Toggle all ${formatCategory(category)} permissions`}
                        />
                      </Can>
                    </div>

                    {isOpen && (
                      <ul className="divide-y border-t">
                        {permissions.map((permission) => {
                          const checked = selectedPermissions.includes(
                            permission.permission_key,
                          );

                          return (
                            <li
                              key={permission.permission_key}
                              className={cn(
                                "flex items-center gap-3 px-4 py-3.5 transition-colors sm:gap-4 sm:px-5",
                                checked && "bg-primary/[0.03]",
                              )}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">
                                  {permission.name}
                                </p>

                                {permission.description && (
                                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                    {permission.description}
                                  </p>
                                )}

                                <code className="mt-1.5 inline-block max-w-full break-all rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                                  {permission.permission_key}
                                </code>
                              </div>

                              <Can
                                permissions="staff.permissions.manage"
                                mode="disable"
                              >
                                <ToggleSwitch
                                  checked={checked}
                                  disabled={isSaving}
                                  onChange={() =>
                                    togglePermission(permission.permission_key)
                                  }
                                  label={permission.name}
                                />
                              </Can>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </section>
                );
              })
            )}
          </>
        }
      />
    </PageContainer>
  );
}