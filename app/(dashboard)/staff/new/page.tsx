
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const instant = false;

export default function AddStaffPage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Add Staff Member
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create an additional Shop User for your shop.
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        The staff creation form is coming next.
      </p>

      {/* <Button variant="outline" onClick={() => window.location.href = "/staff"}>
        Back to Staff
      </Button> */}
    </main>
  );
}
