
"use client";

import { useCallback, useEffect, useState } from "react";

export type ShopPermission = {
  permission_key: string;
  name: string;
  description: string | null;
  category: string;
};

type PermissionApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export function useShopUserPermissions(membershipId: string) {
  const [availablePermissions, setAvailablePermissions] =
    useState<ShopPermission[]>([]);

  const [selectedPermissions, setSelectedPermissions] =
    useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const loadPermissions = useCallback(
    async (signal: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const [catalogueResponse, assignedResponse] =
          await Promise.all([
            fetch("/api/shop/permissions", {
              method: "GET",
              cache: "no-store",
              signal,
            }),

            fetch(
              `/api/shop/users/${membershipId}/permissions`,
              {
                method: "GET",
                cache: "no-store",
                signal,
              },
            ),
          ]);

        const catalogueResult =
          (await catalogueResponse.json()) as
            PermissionApiResponse<ShopPermission[]>;

        const assignedResult =
          (await assignedResponse.json()) as
            PermissionApiResponse<string[]>;

        if (
          !catalogueResponse.ok ||
          !catalogueResult.success ||
          !catalogueResult.data
        ) {
          throw new Error(
            catalogueResult.message ??
              "Unable to load available permissions.",
          );
        }

        if (
          !assignedResponse.ok ||
          !assignedResult.success ||
          !assignedResult.data
        ) {
          throw new Error(
            assignedResult.message ??
              "Unable to load assigned permissions.",
          );
        }

        setAvailablePermissions(catalogueResult.data);
        setSelectedPermissions(assignedResult.data);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load permissions.",
        );
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [membershipId],
  );

  useEffect(() => {
    const controller = new AbortController();

    void loadPermissions(controller.signal);

    return () => controller.abort();
  }, [loadPermissions]);

  const togglePermission = useCallback((permissionKey: string) => {
    setSelectedPermissions((current) =>
      current.includes(permissionKey)
        ? current.filter((key) => key !== permissionKey)
        : [...current, permissionKey],
    );

    setSuccessMessage(null);
  }, []);

  const toggleCategory = useCallback(
    (permissionKeys: string[]) => {
      setSelectedPermissions((current) => {
        const allSelected = permissionKeys.every((key) =>
          current.includes(key),
        );

        if (allSelected) {
          return current.filter(
            (key) => !permissionKeys.includes(key),
          );
        }

        return Array.from(
          new Set([...current, ...permissionKeys]),
        );
      });

      setSuccessMessage(null);
    },
    [],
  );

  const savePermissions = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        `/api/shop/users/${membershipId}/permissions`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            permissions: selectedPermissions,
          }),
        },
      );

      const result =
        (await response.json()) as PermissionApiResponse<unknown>;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "Unable to save permissions.",
        );
      }

      setSuccessMessage("Permissions updated successfully.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save permissions.",
      );
    } finally {
      setIsSaving(false);
    }
  }, [membershipId, selectedPermissions]);

  return {
    availablePermissions,
    selectedPermissions,
    isLoading,
    isSaving,
    error,
    successMessage,
    togglePermission,
    toggleCategory,
    savePermissions,
  };
}
