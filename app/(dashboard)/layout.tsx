
import PosLayout from "@/components/widgets/layouts/pos-layout";
import type { ReactNode } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return <PosLayout>{children}</PosLayout>;
}
