
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useShopUser } from "@/hooks/useShopUser";

type StaffDetailsProps = {
  membershipId: string;
};

export default function StaffDetails({
  membershipId,
}: StaffDetailsProps) {
  const router = useRouter();

  const {
    user,
    isLoading,
    isRemoving,
    error,
    removeUser,
  } = useShopUser(membershipId);

  const [showConfirmation, setShowConfirmation] = useState(false);

  async function handleRemove() {
    const result = await removeUser();

    if (result) {
      router.push("/staff");
      router.refresh();
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Loading staff details...
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
          <UserRound className="size-8 text-muted-foreground" />

          <p className="text-sm text-destructive">
            {error ?? "Staff member not found."}
          </p>

          <Button
            variant="outline"
            onClick={() => router.push("/staff")}
          >
            Back to Staff
          </Button>
        </CardContent>
      </Card>
    );
  }

  const createdDate = new Intl.DateTimeFormat("en-LK", {
    dateStyle: "long",
  }).format(new Date(user.createdAt));

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/staff")}
        >
          <ArrowLeft />
          Back to Staff
        </Button>
      </div>

      {/* Staff profile */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <UserRound className="size-6 text-primary" />
              </div>

              <div>
                <CardTitle>{user.displayName}</CardTitle>

                <CardDescription>
                  Shop User
                </CardDescription>
              </div>
            </div>

            <span className="w-fit rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400">
              {user.status}
            </span>
          </div>
        </CardHeader>

        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-4 text-muted-foreground" />

            <div>
              <p className="text-xs text-muted-foreground">
                Email
              </p>

              <p className="break-all text-sm font-medium">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 size-4 text-muted-foreground" />

            <div>
              <p className="text-xs text-muted-foreground">
                Phone
              </p>

              <p className="text-sm font-medium">
                {user.phone || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 size-4 text-muted-foreground" />

            <div>
              <p className="text-xs text-muted-foreground">
                Joined
              </p>

              <p className="text-sm font-medium">
                {createdDate}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="mt-0.5 size-4 text-muted-foreground" />

            <div>
              <p className="text-xs text-muted-foreground">
                Membership ID
              </p>

              <p className="break-all text-sm font-medium">
                {user.membershipId}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seat information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Seat Information
          </CardTitle>

          <CardDescription>
            Additional Shop User seat assigned to this account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Seat status
            </span>

            <span className="font-medium">
              {user.seatId
                ? "Assigned"
                : "No additional seat"}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Seat amount
            </span>

            <span className="font-medium">
              {user.seatAmount !== null
                ? `Rs. ${user.seatAmount.toLocaleString("en-LK")}`
                : "—"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Staff Permissions
          </CardTitle>

          <CardDescription>
            Control which POS features this staff member can access.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            onClick={() =>
              router.push(
                `/staff/${membershipId}/permissions`,
              )
            }
          >
            <ShieldCheck />
            Manage Permissions
          </Button>
        </CardContent>
      </Card>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* Remove staff */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Remove Staff Member
          </CardTitle>

          <CardDescription>
            Removing this account revokes its shop membership
            and releases its assigned additional seat, if applicable.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!showConfirmation ? (
            <Button
              variant="destructive"
              onClick={() => setShowConfirmation(true)}
            >
              <Trash2 />
              Remove Staff
            </Button>
          ) : (
            <div className="space-y-3 rounded-lg border border-destructive/30 p-4">
              <p className="text-sm font-medium">
                Are you sure you want to remove {user.displayName}?
              </p>

              <p className="text-xs text-muted-foreground">
                This removes their access to this shop. Their
                authentication account will not be deleted.
              </p>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Trash2 />
                  )}

                  {isRemoving
                    ? "Removing..."
                    : "Confirm Removal"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  disabled={isRemoving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
