import { Suspense } from "react";
import StaffPermissions from "@/components/widgets/staff/staff-permissions";

export const instant = false;

type PageProps = {
  params: Promise<{
    membershipId: string;
  }>;
};

function PageSkeleton() {
  return (
    <main className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="h-80 animate-pulse rounded-2xl bg-muted" />
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    </main>
  );
}

async function StaffPermissionsContent({ params }: PageProps) {
  const { membershipId } = await params;

  return (
    <main className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <StaffPermissions membershipId={membershipId} />
    </main>
  );
}

export default function StaffPermissionsPage({ params }: PageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <StaffPermissionsContent params={params} />
    </Suspense>
  );
}