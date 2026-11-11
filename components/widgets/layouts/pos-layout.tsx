import { Suspense, type ReactNode } from "react";
import PosSidebar from "./pos-sidebar";
import PosTopbar from "./page-topbar";

type PosLayoutProps = {
  children: ReactNode;
};

export default function PosLayout({ children }: PosLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <Suspense
        fallback={
          <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white lg:block" />
        }
      >
        <PosSidebar />
      </Suspense>

      <div className="min-w-0 lg:pl-64">
        <Suspense fallback={<div className="hidden h-16 border-b bg-background lg:block" />}>
          <PosTopbar />
        </Suspense>

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}