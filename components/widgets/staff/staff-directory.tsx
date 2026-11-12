"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserRound, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DataState,
  ListItemLink,
  PageContainer,
  PageHeader,
  Pagination,
  Panel,
  RefreshButton,
  SearchField,
  StatCard,
  StatGrid,
  StatusBadge,
} from "@/components/widgets/layouts/page-kit";
import { Can } from "../auth/access-control";
import { useShopUsers } from "@/hooks/useShopUsers";
import { formatDate } from "@/lib/utils/helper-functions";

export default function StaffDirectory() {
  const router = useRouter();

  const { users, total, page, totalPages, isLoading, error, setPage, refresh } =
    useShopUsers();

  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();

  // Filters the currently loaded page only.
  const filteredUsers = useMemo(() => {
    if (!query) return users;

    return users.filter(
      (user) =>
        user.displayName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.phone ?? "").toLowerCase().includes(query),
    );
  }, [users, query]);

  // SHOP_ADMIN passes automatically; other roles need the "staff.create" key.
  const addButton = (
    <Can permissions="staff.create">
      <Button onClick={() => router.push("/staff/new")}>
        <Plus />
        Add Staff
      </Button>
    </Can>
  );

  return (
    <PageContainer>
      <PageHeader
        icon={Users}
        title="Staff Management"
        description="Manage your shop staff and their accounts."
        actions={addButton}
      />

      <StatGrid>
        <StatCard
          label="Total Shop Users"
          value={total}
          icon={Users}
          loading={isLoading}
        />
        <StatCard
          label="Displaying"
          value={filteredUsers.length}
          icon={UserRound}
          loading={isLoading}
          tone="muted"
        />
      </StatGrid>

      <Panel
        title="Shop Users"
        description="View and manage staff accounts."
        toolbar={
          <>
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search this page..."
              ariaLabel="Search current staff page"
            />
            <RefreshButton
              onClick={refresh}
              loading={isLoading}
              label="Refresh staff list"
            />
          </>
        }
        footer={
          !isLoading && !error && total > 0 ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              itemLabel="staff members"
              loading={isLoading}
              onPrev={() => setPage((current) => current - 1)}
              onNext={() => setPage((current) => current + 1)}
            />
          ) : undefined
        }
      >
        <DataState
          isLoading={isLoading}
          error={error}
          isEmpty={filteredUsers.length === 0}
          onRetry={refresh}
          loadingLabel="Loading staff members..."
          empty={{
            icon: Users,
            title: query ? "No matching staff members" : "No Shop Users yet",
            description: query
              ? "Try another search term."
              : "Create your first Shop User to get started.",
            action: !query ? (
              <Can permissions="staff.create">
                <Button size="sm" onClick={() => router.push("/staff/new")}>
                  <Plus />
                  Add Staff
                </Button>
              </Can>
            ) : undefined,
          }}
        >
          <div className="divide-y">
            {filteredUsers.map((user) => (
              <ListItemLink
                key={user.membershipId}
                href={`/staff/${user.membershipId}`}
                icon={UserRound}
                title={user.displayName}
                subtitle={user.email}
                caption={user.phone ?? undefined}
                badge={<StatusBadge status={user.status} />}
                meta={`Joined ${formatDate(user.createdAt)}`}
              />
            ))}
          </div>
        </DataState>
      </Panel>
    </PageContainer>
  );
}