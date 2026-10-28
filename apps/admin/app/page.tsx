"use client";

import LoginComponent from "@/components/ui-widgets/log-in/log-in";

export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-[360px]">
        <LoginComponent />
      </div>
    </main>
  );
}
