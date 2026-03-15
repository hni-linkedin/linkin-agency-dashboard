"use client";

const MUTED_COLORS = [
  "var(--accent-dim)",
  "var(--green-dim)",
  "var(--amber-dim)",
  "var(--red-dim)",
  "var(--chart-saves)",
  "var(--chart-sends)",
].map((c) => ({ bg: c, text: "var(--text-primary)" }));

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h << 5) - h + name.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export type AvatarStatus = "online" | "away" | "offline";

const STATUS_COLOR: Record<AvatarStatus, string> = {
  online: "var(--green)",
  away: "var(--amber)",
  offline: "var(--text-disabled)",
};

const SIZES = { sm: 24, md: 32, lg: 40 } as const;

export interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  status?: AvatarStatus;
}

export function Avatar({
  name,
  src,
  size = "md",
  status,
}: AvatarProps) {
  const px = SIZES[size];
  const initials = getInitials(name);
  const colorIndex = hashName(name) % MUTED_COLORS.length;
  const { bg } = MUTED_COLORS[colorIndex];
  const fontSize = size === "sm" ? "var(--text-xs-size)" : size === "md" ? "var(--text-sm-size)" : "var(--text-md-size)";

  return (
    <div
      style={{
        position: "relative",
        width: px,
        height: px,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: px,
          height: px,
          borderRadius: "var(--r-full)",
          overflow: "hidden",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-data)",
          fontSize,
          color: "var(--text-primary)",
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- Avatar supports arbitrary URLs; next/image requires config
          <img
            src={src}
            alt={name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          initials
        )}
      </div>
      {status && (
        <span
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "8px",
            height: "8px",
            borderRadius: "var(--r-full)",
            background: STATUS_COLOR[status],
            border: "2px solid var(--bg-card)",
            boxSizing: "content-box",
          }}
        />
      )}
    </div>
  );
}
