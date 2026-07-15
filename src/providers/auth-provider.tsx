"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "@/context/auth-context";
import { getCurrentUserRequest, logoutRequest } from "@/services/auth.service";
import { ApiClientError } from "@/lib/api-client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUserRequest,
    retry: false,
    staleTime: 60 * 1000,
    // Treat a 401 as "no session" instead of a query error.
    throwOnError: (error) => !(error instanceof ApiClientError && error.status === 401),
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "me"], null);
      router.push("/login");
    },
  });

  const value = React.useMemo(
    () => ({
      user,
      isLoading,
      logout: async () => {
        await logoutMutation.mutateAsync();
      },
    }),
    [user, isLoading, logoutMutation]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
