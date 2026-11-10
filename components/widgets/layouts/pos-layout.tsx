
import { Suspense, type ReactNode } from "react";
import PosSidebar from "./pos-sidebar";

type PosLayoutProps = {
  children: ReactNode;
};

export default function PosLayout({
  children,
}: PosLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/20">
      <Suspense
        fallback={
          <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background lg:block" />
        }
      >
        <PosSidebar />
      </Suspense>

      <main className="min-w-0 lg:pl-64">
        {children}
      </main>
    </div>
  );
}
