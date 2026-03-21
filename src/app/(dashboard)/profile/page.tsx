"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import {
  clearAccessCookie,
  decodeToken,
  getAuthUser,
  markSignedOut,
  getProfileName,
  getToken,
  removeAuthUser,
  removeProfileName,
  removeToken,
  saveAuthUser,
  saveProfileName,
} from "@/lib/auth";
import { ApiError } from "@/lib/axios";

type MessageState = { type: "success" | "error"; text: string } | null;

export default function ProfilePage() {
  const router = useRouter();
  const [role, setRole] = useState("UNKNOWN");
  const [email, setEmail] = useState("Not available");
  const [name, setName] = useState("User");
  const [nameMessage, setNameMessage] = useState<MessageState>(null);
  const [passwordMessage, setPasswordMessage] = useState<MessageState>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      const authUser = getAuthUser();
      const token = getToken();
      const decoded = token ? decodeToken(token) : null;

      setRole((authUser?.role || decoded?.role)?.toUpperCase() ?? "UNKNOWN");
      setEmail(authUser?.email || decoded?.email || "Not available");
      setName(
        getProfileName() ||
          authUser?.name ||
          decoded?.name ||
          decoded?.email?.split("@")[0] ||
          "User",
      );
    }, 0);

    return () => clearTimeout(id);
  }, []);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameMessage(null);
    if (!name.trim()) {
      setNameMessage({ type: "error", text: "Name cannot be empty." });
      return;
    }

    setSavingName(true);
    try {
      const data = await authApi.updateProfile(name.trim());
      saveProfileName(data.user.name);
      const existingUser = getAuthUser();
      if (existingUser) {
        saveAuthUser({ ...existingUser, name: data.user.name });
      }
      setName(data.user.name);
      setNameMessage({ type: "success", text: "Name updated successfully." });
    } catch (error) {
      if (error instanceof ApiError) {
        setNameMessage({ type: "error", text: error.message || "Failed to update name." });
      } else {
        setNameMessage({ type: "error", text: "Failed to update name." });
      }
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: "error", text: "All password fields are required." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New password and confirm password must match." });
      return;
    }

    setChangingPassword(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
      setPasswordMessage({ type: "success", text: "Password updated successfully." });
    } catch (error) {
      if (error instanceof ApiError) {
        setPasswordMessage({ type: "error", text: error.message || "Failed to change password." });
      } else {
        setPasswordMessage({ type: "error", text: "Failed to change password." });
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authApi.logout();
    } catch {
      // Proceed with local cleanup even if API logout fails.
    } finally {
      removeToken();
      removeAuthUser();
      removeProfileName();
      clearAccessCookie();
      markSignedOut();
      router.push("/login");
      setSigningOut(false);
    }
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px dashed var(--border-subtle)",
          borderRadius: "var(--r-md)",
          padding: 20,
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            margin: "0 0 12px",
            fontFamily: "var(--font-display-outfit)",
            fontWeight: 700,
            fontSize: "var(--text-xl-size)",
            color: "var(--text-primary)",
          }}
        >
          Profile
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "120px 1fr",
            gap: 8,
            fontFamily: "var(--font-data)",
            fontSize: "var(--text-sm-size)",
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>Role</span>
          <span style={{ color: "var(--text-primary)" }}>{role}</span>
          <span style={{ color: "var(--text-muted)" }}>Email</span>
          <span style={{ color: "var(--text-primary)" }}>{email}</span>
        </div>
      </div>

      <form
        onSubmit={handleSaveName}
        style={{
          background: "var(--bg-card)",
          border: "1px dashed var(--border-subtle)",
          borderRadius: "var(--r-md)",
          padding: 20,
          marginBottom: 16,
        }}
      >
        <label
          htmlFor="profile-name"
          style={{
            display: "block",
            marginBottom: 6,
            color: "var(--text-muted)",
            fontFamily: "var(--font-data)",
            fontSize: "var(--text-xs-size)",
          }}
        >
          Name
        </label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          style={{
            width: "100%",
            height: 40,
            padding: "0 12px",
            background: "var(--bg-elevated)",
            border: "1px dashed var(--border-subtle)",
            borderRadius: "var(--r-md)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-data)",
            marginBottom: 10,
          }}
        />
        {nameMessage ? (
          <p
            style={{
              margin: "0 0 10px",
              fontFamily: "var(--font-data)",
              fontSize: "var(--text-xs-size)",
              color: nameMessage.type === "error" ? "var(--red)" : "var(--green)",
            }}
          >
            {nameMessage.text}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={savingName}
          style={{
            height: 38,
            padding: "0 14px",
            borderRadius: "var(--r-md)",
            border: "1px solid var(--accent)",
            background: "var(--accent)",
            color: "#fff",
            cursor: savingName ? "not-allowed" : "pointer",
            opacity: savingName ? 0.6 : 1,
            fontFamily: "var(--font-display-outfit)",
            fontWeight: 600,
          }}
        >
          {savingName ? "Saving..." : "Update name"}
        </button>
      </form>

      <div
        style={{
          background: "var(--bg-card)",
          border: "1px dashed var(--border-subtle)",
          borderRadius: "var(--r-md)",
          padding: 20,
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: showPasswordForm || passwordMessage ? 12 : 0 }}>
          <button
            type="button"
            onClick={() => setShowPasswordForm((v) => !v)}
            style={{
              height: 38,
              padding: "0 14px",
              borderRadius: "var(--r-md)",
              border: "1px dashed var(--border-default)",
              background: "var(--bg-elevated)",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontFamily: "var(--font-data)",
            }}
          >
            {showPasswordForm ? "Cancel password change" : "Change password"}
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              height: 38,
              padding: "0 14px",
              borderRadius: "var(--r-md)",
              border: "1px dashed var(--red-border)",
              background: "var(--red-dim)",
              color: "var(--red)",
              cursor: signingOut ? "not-allowed" : "pointer",
              opacity: signingOut ? 0.7 : 1,
              fontFamily: "var(--font-data)",
            }}
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>

        {showPasswordForm ? (
          <form onSubmit={handleChangePassword}>
            <div style={{ display: "grid", gap: 10 }}>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                autoComplete="current-password"
                style={{
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
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                autoComplete="new-password"
                style={{
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                style={{
                  height: 40,
                  padding: "0 12px",
                  background: "var(--bg-elevated)",
                  border: "1px dashed var(--border-subtle)",
                  borderRadius: "var(--r-md)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-data)",
                }}
              />
              <button
                type="submit"
                disabled={changingPassword}
                style={{
                  height: 38,
                  padding: "0 14px",
                  width: "fit-content",
                  borderRadius: "var(--r-md)",
                  border: "1px solid var(--accent)",
                  background: "var(--accent)",
                  color: "#fff",
                  cursor: changingPassword ? "not-allowed" : "pointer",
                  opacity: changingPassword ? 0.6 : 1,
                  fontFamily: "var(--font-display-outfit)",
                  fontWeight: 600,
                }}
              >
                {changingPassword ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        ) : null}

        {passwordMessage ? (
          <p
            style={{
              margin: "10px 0 0",
              fontFamily: "var(--font-data)",
              fontSize: "var(--text-xs-size)",
              color: passwordMessage.type === "error" ? "var(--red)" : "var(--green)",
            }}
          >
            {passwordMessage.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}
