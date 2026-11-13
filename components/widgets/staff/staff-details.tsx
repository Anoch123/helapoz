"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  CalendarDays,
  KeyRound,
  Loader2,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import PasswordResetModal from "@/components/models/password-reset";
import {
  ConfirmDanger,
  DetailGrid,
  DetailItem,
  DetailLayout,
  EmptyState,
  InfoRow,
  InlineAlert,
  LoadingState,
  PageContainer,
  PageHeader,
  Panel,
  StatusBadge,
} from "@/components/widgets/layouts/page-kit";
import { useShopUser } from "@/hooks/useShopUser";
import { Can } from "../auth/access-control";

type StaffDetailsProps = {
  membershipId: string;
};

export default function StaffDetails({ membershipId }: StaffDetailsProps) {
  const router = useRouter();

  const {
    user,
    isLoading,
    isRemoving,
    error,
    removeUser,
    updateStatus,
    isUpdatingStatus,
    resetPassword,
    isResettingPassword,
  } = useShopUser(membershipId);

  const [resetOpen, setResetOpen] = useState(false);

  async function handleRemove() {
    const result = await removeUser();

    if (result) {
      router.push("/staff");
      router.refresh();
    }
  }

  async function handleStatusChange(next: "ACTIVE" | "SUSPENDED") {
    const result = await updateStatus(next);

    if (result) {
      router.refresh();
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <Panel>
          <LoadingState label="Loading staff details..." />
        </Panel>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <Panel>
          <EmptyState
            icon={UserRound}
            title="Staff member not found"
            description={error ?? "This staff member may have been removed."}
            action={
              <Button variant="outline" onClick={() => router.push("/staff")}>
                Back to Staff
              </Button>
            }
          />
        </Panel>
      </PageContainer>
    );
  }

  const isSuspended = user.status === "SUSPENDED";

  const createdDate = new Intl.DateTimeFormat("en-LK", {
    dateStyle: "long",
  }).format(new Date(user.createdAt));

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <PageHeader
            backHref="/staff"
            backLabel="Back to Staff"
            icon={UserRound}
            title={user.displayName}
            description="Shop User"
          />
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/staff/${membershipId}/edit`)}
          >
            <Pencil />
            Edit Profile
          </Button>
          <Button variant="outline" onClick={() => setResetOpen(true)}>
            <KeyRound />
            Reset Password
          </Button>
        </div>
      </div>

      <DetailLayout
        main={
          <>
            <Panel
              title="Profile"
              description="Account and contact details."
              toolbar={<StatusBadge status={user.status} />}
              padded
            >
              <DetailGrid>
                <DetailItem
                  icon={Mail}
                  label="Email"
                  value={user.email}
                  breakAll
                />
                <DetailItem
                  icon={Phone}
                  label="Phone"
                  value={user.phone || "Not provided"}
                />
                <DetailItem
                  icon={CalendarDays}
                  label="Joined"
                  value={createdDate}
                />
                <DetailItem
                  icon={Users}
                  label="Membership ID"
                  value={user.membershipId}
                  breakAll
                />
              </DetailGrid>
            </Panel>

            <Panel
              title="Seat Information"
              description="Additional Shop User seat on this account."
              padded
            >
              <div className="space-y-3">
                <InfoRow
                  label="Seat status"
                  value={user.seatId ? "Assigned" : "No additional seat"}
                />
                <InfoRow
                  label="Seat amount"
                  value={
                    user.seatAmount !== null
                      ? `Rs. ${user.seatAmount.toLocaleString("en-LK")}`
                      : "—"
                  }
                />
              </div>
            </Panel>

            <Can permissions="staff.permissions.view">
              <Panel
                title="Staff Permissions"
                description="Control which POS features this staff member can access."
                padded
              >
                <Button
                  className="w-full sm:w-auto"
                  onClick={() =>
                    router.push(`/staff/${membershipId}/permissions`)
                  }
                >
                  <ShieldCheck />
                  Manage Permissions
                </Button>
              </Panel>
            </Can>

            <Can permissions="staff.status.manage">
              {isSuspended ? (
                <Panel
                  title="Account Suspended"
                  description="This staff member can't access the shop until you reactivate their account."
                  padded
                >
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => handleStatusChange("ACTIVE")}
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <UserCheck />
                    )}
                    {isUpdatingStatus ? "Reactivating..." : "Reactivate Staff"}
                  </Button>
                </Panel>
              ) : (
                <ConfirmDanger
                  title="Suspend Staff Member"
                  description="Suspending this account blocks the staff member from signing in to this shop. Nothing is deleted."
                  triggerLabel="Suspend Staff"
                  question={`Suspend ${user.displayName}?`}
                  note="They lose access to this shop until you reactivate them."
                  confirmLabel="Confirm Suspension"
                  pendingLabel="Suspending..."
                  loading={isUpdatingStatus}
                  onConfirm={() => handleStatusChange("SUSPENDED")}
                  icon={Ban}
                />
              )}
            </Can>

            {error && <InlineAlert>{error}</InlineAlert>}

            <Can permissions="staff.remove">
              <ConfirmDanger
                title="Remove Staff Member"
                description="Removing this account revokes its shop membership and releases its assigned additional seat, if applicable."
                triggerLabel="Remove Staff"
                question={`Are you sure you want to remove ${user.displayName}?`}
                note="This removes their access to this shop. Their authentication account will not be deleted."
                confirmLabel="Confirm Removal"
                pendingLabel="Removing..."
                loading={isRemoving}
                onConfirm={handleRemove}
                icon={Trash2}
              />
            </Can>
          </>
        }
      />

      <PasswordResetModal
        open={resetOpen}
        onOpenChange={setResetOpen}
        targetName={user.displayName}
        isSubmitting={isResettingPassword}
        onSubmit={async (password) => {
          const result = await resetPassword(password);
          if (result) router.refresh();
          return result;
        }}
      />
    </PageContainer>
  );
}