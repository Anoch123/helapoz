"use client";

import { useState } from "react";

import type { ShopLoginInput } from "@/lib/validations/auth.validation";

interface LoginResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
  data?: {
    user: {
      id: string;
      email: string | undefined;
    };
    shop: {
      id: string;
      shopCode: string;
      name: string;
      businessType: string;
    };
    membership: {
      id: string;
      role: string;
    };
  };
}

export function useShopLogin() {
  const [isPending, setIsPending] = useState(false);

  async function login(
    input: ShopLoginInput
  ): Promise<LoginResponse> {
    setIsPending(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const result: LoginResponse = await response.json();

      return result;
    } catch {
      return {
        success: false,
        message: "Something went wrong. Please try again.",
      };
    } finally {
      setIsPending(false);
    }
  }

  return {
    login,
    isPending,
  };
}