
"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CurrentUser } from "@/lib/types/current-user";

type UserContextType = {
  user: CurrentUser;
  updateUser: (user: CurrentUser) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

type UserProviderProps = {
  children: ReactNode;
  initialUser: CurrentUser;
};

export default function UserProvider({
  children,
  initialUser,
}: UserProviderProps) {
  const [user, setUser] = useState<CurrentUser>(initialUser);

  const value = useMemo(
    () => ({
      user,
      updateUser: setUser,
    }),
    [user]
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error(
      "useUserContext must be used within a UserProvider"
    );
  }

  return context;
}
