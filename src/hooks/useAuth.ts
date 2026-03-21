"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { clearSignedOutMark, saveAccessCookie, saveAuthUser, saveToken } from "@/lib/auth";
import { ApiError } from "@/lib/axios";

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);

    try {
      const data = await authApi.login(email, password);
      saveToken(data.accessToken);
      saveAccessCookie(data.accessToken);
      saveAuthUser(data.user);
      clearSignedOutMark();

      if (data.user.forcePasswordChange) {
        router.push("/set-password");
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Login failed");
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return { login, loading, error };
}
