
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function useShopLogout() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function logout() {
    if (isPending) return;

    setIsPending(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Logout failed.");
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }

  return {
    logout,
    isPending,
  };
}
