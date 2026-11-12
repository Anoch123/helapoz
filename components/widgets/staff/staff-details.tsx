"use client";

import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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

  const { user, isLoading, isRemoving, error, removeUser } =
    useShopUser(membershipId);

  async function handleRemove() {
    const result = await removeUser();

    if (result) {
      router.push("/staff");
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

  const createdDate = new Intl.DateTimeFormat("en-LK", {
    dateStyle: "long",
  }).format(new Date(user.createdAt));

  return (
    <PageContainer>
      <PageHeader
        backHref="/staff"
        backLabel="Back to Staff"
        icon={UserRound}
        title={user.displayName}
        description="Shop User"
      />

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
    </PageContainer>
  );
}