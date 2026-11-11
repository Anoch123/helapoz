import type { ReactNode } from "react";
import CurrentUserLoader from "@/components/providers/current-user-loader";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <CurrentUserLoader>
      {children}
    </CurrentUserLoader>
  );
}