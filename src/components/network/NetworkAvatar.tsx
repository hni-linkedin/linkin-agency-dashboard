"use client";

const BG = [
  { bg: "rgba(45, 127, 232, 0.18)", fg: "var(--accent)" },
  { bg: "rgba(34, 199, 135, 0.14)", fg: "var(--green)" },
  { bg: "rgba(245, 166, 35, 0.14)", fg: "var(--amber)" },
  { bg: "rgba(77, 93, 115, 0.35)", fg: "var(--text-secondary)" },
];

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export type NetworkAvatarProps = {
  name: string;
  image: string | null | undefined;
  sizePx?: number;
};

export function NetworkAvatar({ name, image, sizePx = 30 }: NetworkAvatarProps) {
  const idx = name.trim().length ? name.charCodeAt(0) % 4 : 0;
  const palette = BG[idx] ?? BG[0];
  const initials = initialsFromName(name);

  return (
    <div
      style={{
        width: sizePx,
        height: sizePx,
        borderRadius: "var(--r-full)",
        overflow: "hidden",
        flexShrink: 0,
        background: palette.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-data)",
        fontSize: "var(--text-xs-size)",
        color: palette.fg,
      }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote LinkedIn URLs
        <img
          src={image}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        initials
      )}
    </div>
  );
}
