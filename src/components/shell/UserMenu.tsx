"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components";

export interface UserMenuUser {
  name: string;
  email: string;
  plan: string;
  avatarSrc?: string;
}

export interface UserMenuProps {
  user: UserMenuUser;
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/profile")}
      aria-label="Go to profile"
      title={user.email}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 8px",
        border: "1px dashed transparent",
        borderRadius: "var(--r-md)",
        background: "transparent",
        cursor: "pointer",
        color: "inherit",
        transition: "all 150ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-subtle)";
        e.currentTarget.style.background = "var(--bg-elevated)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "transparent";
        e.currentTarget.style.background = "transparent";
      }}
    >
      <Avatar name={user.name} src={user.avatarSrc} size="sm" />
    </button>
  );
}
