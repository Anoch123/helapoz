
"use client";

import { useCallback, useEffect, useState } from "react";

export type ShopUserDetails = {
  membershipId: string;
  userId: string;
  displayName: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  seatId: string | null;
  seatAmount: number | null;
};

export type RemoveShopUserResult = {
  membershipId: string;
  userId: string;
  displayName: string;
  seatId: string | null;
  seatAmount: number | null;
  seatReleased: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export function useShopUser(membershipId: string) {
  const [user, setUser] = useState<ShopUserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async (signal: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/shop/users/${membershipId}`,
        {
          method: "GET",
          cache: "no-store",
          signal,
        },
      );

      const result =
        (await response.json()) as ApiResponse<ShopUserDetails>;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(
          result.message ?? "Unable to load staff details.",
        );
      }

      setUser(result.data);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load staff details.",
      );
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [membershipId]);

  useEffect(() => {
    const controller = new AbortController();

    void loadUser(controller.signal);

    return () => controller.abort();
  }, [loadUser]);

  const removeUser = useCallback(async () => {
    setIsRemoving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/shop/users/${membershipId}`,
        {
          method: "DELETE",
          credentials: "same-origin",
        },
      );

      const result =
        (await response.json()) as ApiResponse<RemoveShopUserResult>;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "Unable to remove this staff member.",
        );
      }

      return result.data ?? null;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to remove staff member.",
      );

      return null;
    } finally {
      setIsRemoving(false);
    }
  }, [membershipId]);

  return {
    user,
    isLoading,
    isRemoving,
    error,
    removeUser,
  };
}
