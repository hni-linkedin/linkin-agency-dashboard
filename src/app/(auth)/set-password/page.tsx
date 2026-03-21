"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { getAuthUser, saveAuthUser } from "@/lib/auth";
import { ApiError } from "@/lib/axios";

type MessageState = { type: "success" | "error"; text: string } | null;

export default function SetPasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "All fields are required." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New password and confirm password must match." });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }

    setSubmitting(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      const user = getAuthUser();
      if (user) {
        saveAuthUser({ ...user, forcePasswordChange: false });
      }
      setMessage({ type: "success", text: "Password updated successfully. Redirecting…" });
      setTimeout(() => {
        router.replace("/dashboard");
      }, 700);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : "Failed to update password.";
      setMessage({ type: "error", text });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          background: "var(--bg-card)",
          border: "1px dashed var(--border-subtle)",
          borderRadius: "var(--r-md)",
          padding: 24,
        }}
      >
        <h1
          style={{
            margin: "0 0 8px",
            fontFamily: "var(--font-display-outfit)",
            fontWeight: 700,
            fontSize: "var(--text-2xl-size)",
            color: "var(--text-primary)",
          }}
        >
          Set new password
        </h1>
        <p
          style={{
            margin: "0 0 16px",
            fontFamily: "var(--font-data)",
            fontSize: "var(--text-sm-size)",
            color: "var(--text-muted)",
          }}
        >
          You must change your password before continuing.
        </p>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={submitting}
            autoComplete="current-password"
            style={{
              width: "100%",
              height: 40,
              padding: "0 12px",
              background: "var(--bg-elevated)",
              border: "1px dashed var(--border-subtle)",
              borderRadius: "var(--r-md)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-data)",
            }}
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={submitting}
            autoComplete="new-password"
            style={{
              width: "100%",
              height: 40,
              padding: "0 12px",
              background: "var(--bg-elevated)",
              border: "1px dashed var(--border-subtle)",
              borderRadius: "var(--r-md)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-data)",
            }}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={submitting}
            autoComplete="new-password"
            style={{
              width: "100%",
              height: 40,
              padding: "0 12px",
              background: "var(--bg-elevated)",
              border: "1px dashed var(--border-subtle)",
              borderRadius: "var(--r-md)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-data)",
            }}
          />

          {message && (
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-xs-size)",
                color: message.type === "error" ? "var(--red)" : "var(--green)",
              }}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 4,
              height: 40,
              borderRadius: "var(--r-md)",
              border: "1px solid var(--accent)",
              background: "var(--accent)",
              color: "#fff",
              fontFamily: "var(--font-display-outfit)",
              fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}

