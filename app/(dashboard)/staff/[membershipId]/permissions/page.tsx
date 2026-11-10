
import { Suspense } from "react";
import StaffPermissions from "@/components/widgets/staff/staff-permissions";

type PageProps = {
  params: Promise<{
    membershipId: string;
  }>;
};

async function StaffPermissionsContent({ params }: PageProps) {
  const { membershipId } = await params;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <StaffPermissions membershipId={membershipId} />
    </main>
  );
}

export default function StaffPermissionsPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StaffPermissionsContent params={params} />
    </Suspense>
  );
}
