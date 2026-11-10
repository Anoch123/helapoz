
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Plus,
  Search,
  Users,
  UserRound,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useShopUsers } from "@/hooks/useShopUsers";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default function StaffDirectory() {
  const router = useRouter();

  const {
    users,
    total,
    page,
    pageSize,
    totalPages,
    isLoading,
    error,
    setPage,
    refresh,
  } = useShopUsers();

  const [search, setSearch] = useState("");

  // This filters the currently loaded page.
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return users;

    return users.filter((user) => {
      return (
        user.displayName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.phone ?? "").toLowerCase().includes(query)
      );
    });
  }, [users, search]);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="size-6 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Staff Management
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your shop staff and their accounts.
          </p>
        </div>

        <Button onClick={() => router.push("/staff/new")}>
          <Plus />
          Add Staff
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="size-5 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Total Shop Users
              </p>
              <p className="text-2xl font-semibold tabular-nums">
                {isLoading ? "—" : total}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <UserRound className="size-5 text-muted-foreground" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Displaying
              </p>
              <p className="text-2xl font-semibold tabular-nums">
                {isLoading ? "—" : filteredUsers.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Shop Users</h2>
            <p className="text-sm text-muted-foreground">
              View and manage staff accounts.
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search this page..."
                className="pl-9"
                aria-label="Search current staff page"
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={refresh}
              disabled={isLoading}
              aria-label="Refresh staff list"
            >
              <RefreshCw
                className={isLoading ? "animate-spin" : ""}
              />
            </Button>
          </div>
        </div>

        <CardContent>
          {isLoading ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              Loading staff members...
            </div>
          ) : error ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={refresh}>
                Try again
              </Button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Users className="size-6 text-muted-foreground" />
              </div>

              <div>
                <p className="font-medium">
                  {search.trim()
                    ? "No matching staff members"
                    : "No Shop Users yet"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search.trim()
                    ? "Try another search term."
                    : "Create your first Shop User to get started."}
                </p>
              </div>

              {!search.trim() && (
                <Button
                  size="sm"
                  onClick={() => router.push("/staff/new")}
                >
                  <Plus />
                  Add Staff
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredUsers.map((user) => (
                <Link
                  key={user.membershipId}
                  href={`/staff/${user.membershipId}`}
                  className="flex flex-col gap-3 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:px-2"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <UserRound className="size-5 text-muted-foreground" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {user.displayName}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                      {user.phone && (
                        <p className="text-xs text-muted-foreground">
                          {user.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-left sm:text-right">
                      <span
                        className={
                          user.status === "ACTIVE"
                            ? "inline-flex rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-400"
                            : "inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                        }
                      >
                        {user.status}
                      </span>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Joined {formatDate(user.createdAt)}
                      </p>
                    </div>

                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && !error && total > 0 && (
            <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing page {page} of {Math.max(totalPages, 1)}
                {" · "}
                {total} staff members
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => current - 1)}
                  disabled={page <= 1 || isLoading}
                >
                  <ArrowLeft />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={
                    page >= totalPages ||
                    isLoading ||
                    totalPages === 0
                  }
                >
                  Next
                  <ArrowRight />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
