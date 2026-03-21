"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/shell/LoginForm";
import { authApi } from "@/lib/api";
import { clearSignedOutMark, getToken, isSignedOutMarked, saveAccessCookie, saveToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const bootstrapSession = async () => {
      if (isSignedOutMarked()) return;
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
        // No active refresh cookie/session; stay on login page.
      }
    };

    void bootstrapSession();
    return () => {
      mounted = false;
    };
  }, [router]);

  return <LoginForm />;
}
