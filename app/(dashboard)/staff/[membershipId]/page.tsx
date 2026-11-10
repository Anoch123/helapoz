
import { Suspense } from "react";
import StaffDetails from "@/components/widgets/staff/staff-details";

type PageProps = {
  params: Promise<{
    membershipId: string;
  }>;
};

async function StaffDetailsContent({ params }: PageProps) {
  const { membershipId } = await params;

  return <StaffDetails membershipId={membershipId} />;
}

export default function StaffDetailsPage({ params }: PageProps) {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">
      <Suspense
        fallback={
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded-md bg-muted" />
            <div className="h-40 rounded-xl bg-muted" />
          </div>
        }
      >
        <StaffDetailsContent params={params} />
      </Suspense>
    </main>
  );
}
