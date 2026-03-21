"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { clearSignedOutMark, getToken, isSignedOutMarked, saveAccessCookie, saveToken } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const routeBySession = async () => {
      if (isSignedOutMarked()) {
        router.replace("/login");
        return;
      }
      const accessToken = getToken();
      if (accessToken) {
        router.replace("/dashboard");
        return;
      }

      try {
        const data = await authApi.refresh();
        if (!mounted || !data?.accessToken) return;
        saveToken(data.accessToken);
        saveAccessCookie(data.accessToken);
        clearSignedOutMark();
        router.replace("/dashboard");
      } catch {
        // Keep root idle when explicitly signed out.
      }
    };

    void routeBySession();
    return () => {
      mounted = false;
    };
  }, [router]);

  return null;
}
