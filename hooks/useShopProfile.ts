
"use client";

import { useCallback, useEffect, useState } from "react";

export type ShopProfile = {
  membershipId: string;
  displayName: string;
  email: string;
  phone: string | null;
  role: "SHOP_ADMIN" | "SHOP_USER";
  status: string;
  createdAt: string;
  shop: {
    id: string;
    shopCode: string;
    name: string;
  };
};

export type ProfilePermission = {
  permission_key: string;
  name: string;
  description: string | null;
  category: string;
};

type ShopProfileResponse = {
  profile: ShopProfile;
  access: {
    type: "FULL_ACCESS" | "ASSIGNED_PERMISSIONS";
    permissions: ProfilePermission[];
  };
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: ShopProfileResponse;
};

export function useShopProfile() {
  const [profile, setProfile] = useState<ShopProfile | null>(null);
  const [access, setAccess] =
    useState<ShopProfileResponse["access"] | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (signal: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/shop/profile", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
        signal,
      });

      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(
          result.message || "Unable to load your profile."
        );
      }

      setProfile(result.data.profile);
      setAccess(result.data.access);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load your profile."
      );
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  const refresh = useCallback(() => {
    const controller = new AbortController();
    void loadProfile(controller.signal);
    return () => controller.abort();
  }, [loadProfile]);

  useEffect(() => {
    const controller = new AbortController();

    void loadProfile(controller.signal);

    return () => controller.abort();
  }, [loadProfile]);

  return {
    profile,
    access,
    isLoading,
    error,
    refresh,
  };
}
