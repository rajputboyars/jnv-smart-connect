"use client";

import { createContext } from "react";
import type { AuthUser } from "@/services/auth.service";

export interface AuthContextValue {
  user: AuthUser | null | undefined;
  isLoading: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
