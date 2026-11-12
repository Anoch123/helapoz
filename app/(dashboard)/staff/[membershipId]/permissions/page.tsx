import { Suspense } from "react";
import StaffPermissions from "@/components/widgets/staff/staff-permissions";
import {
  LoadingState,
  PageContainer,
  Panel,
} from "@/components/widgets/layouts/page-kit";

export const instant = false;

type PageProps = {
  params: Promise<{
    membershipId: string;
  }>;
};

async function StaffPermissionsContent({ params }: PageProps) {
  const { membershipId } = await params;

  return <StaffPermissions membershipId={membershipId} />;
}

export default function StaffPermissionsPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <Panel>
            <LoadingState label="Loading permissions..." />
          </Panel>
        </PageContainer>
      }
    >
      <StaffPermissionsContent params={params} />
    </Suspense>
  );
}