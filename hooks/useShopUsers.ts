
"use client";

import { useCallback, useEffect, useState } from "react";

export type ShopUser = {
  membershipId: string;
  userId: string;
  displayName: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
};

type ShopUserListResult = {
  users: ShopUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: ShopUserListResult;
};

export function useShopUsers(initialPage = 1, pageSize = 10) {
  const [users, setUsers] = useState<ShopUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadUsers = useCallback(
    async (signal: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/shop/users?page=${page}&pageSize=${pageSize}`,
          {
            method: "GET",
            cache: "no-store",
            signal,
          },
        );

        const result = (await response.json()) as ApiResponse;

        if (!response.ok || !result.success || !result.data) {
          throw new Error(
            result.message ?? "Unable to retrieve staff members.",
          );
        }

        setUsers(result.data.users);
        setTotal(result.data.total);
        setTotalPages(result.data.totalPages);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading staff.",
        );
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [page, pageSize],
  );

  useEffect(() => {
    const controller = new AbortController();

    void loadUsers(controller.signal);

    return () => controller.abort();
  }, [loadUsers, refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  return {
    users,
    total,
    page,
    pageSize,
    totalPages,
    isLoading,
    error,
    setPage,
    refresh,
  };
}
