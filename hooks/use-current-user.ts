
"use client";

import { useUserContext } from "@/components/providers/user-provider";

export function useCurrentUser() {
  const { user } = useUserContext();

  return user;
}

export function useUpdateCurrentUser() {
  const { updateUser } = useUserContext();

  return updateUser;
}
