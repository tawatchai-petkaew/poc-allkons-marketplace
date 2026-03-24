"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/user.store";
import { getSessionCookie, removeSessionCookie } from "@/libs/auth-cookies";
import type { AuthContextType, AuthSession } from "@/types/auth.types";
import { routes } from "@/constants/routing.constants";
import Cookies from "js-cookie";
import { IAuthResponseUserProfile } from "@/interfaces/auth/auth.response.interface";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userSession, setUserSession] = useState<AuthSession["user"] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setUser: setStoreUser, setOrganization, clearStore } = useUserStore();

  const getSession = useCallback(async () => {
    try {
      const sessionData = getSessionCookie();
      if (sessionData) {
        setUserSession(sessionData);
      } else {
        setUserSession(null);
      }
    } catch (error) {
      console.error("Failed to get session:", error);
      setUserSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getSession();
  }, [getSession]);

  const setSession = useCallback(
    async (
      authData: {
        accessToken: string;
        authCenter: {
          accessToken: string;
          expiresIn: string;
          refreshExpiresIn: number;
          refreshToken: string;
        };
      },
      userProfileData: IAuthResponseUserProfile,
    ) => {
      try {
        // Set user profile data to store
        if (userProfileData) {
          setStoreUser(userProfileData);
        }

        const sessionData = {
          accessToken: authData.accessToken,
          authCenter: authData.authCenter,
        };

        Cookies.set("accessToken", authData.accessToken);
        setUserSession(sessionData);

        // Call API route to set HTTP-only cookie
        await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sessionData),
        });
      } catch (error) {
        console.error("Set session failed:", error);
        throw error;
      }
    },
    [setStoreUser],
  );

  const logout = async () => {
    try {
      removeSessionCookie();
      Cookies.remove("accessToken");
      setUserSession(null);
      clearStore();

      // Clear all React Query cache to prevent stale data from previous user
      queryClient.clear();

      // Call the API route to clear HTTP-only cookie
      await fetch("/api/auth/logout", { method: "POST" });

      router.push(routes.login());
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ userSession, loading, setSession, logout, getSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
