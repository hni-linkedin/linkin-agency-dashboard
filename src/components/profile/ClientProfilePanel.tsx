"use client";

import type { CSSProperties } from "react";
import { MapPin, Sparkles, Briefcase } from "lucide-react";
import type { ProfileCaptureData, ProfileExperienceItem } from "@/types/profileCapture";
import { NetworkAvatar } from "@/components/network/NetworkAvatar";
/** 88px avatar + 3px ring each side — half for overlap onto banner */
const AVATAR_RING_PX = 3;
const AVATAR_SIZE_PX = 88;
const AVATAR_OVERLAP_PX = Math.ceil((AVATAR_SIZE_PX + AVATAR_RING_PX * 2) / 2);

const CARD: CSSProperties = {
  background: "var(--bg-card)",
  border: "1px dashed var(--border-card)",
  borderRadius: "var(--r-md)",
  transition: "border-color 150ms ease, box-shadow 150ms ease",
};

const HOVER_CARD = {
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = "var(--border-default)";
    e.currentTarget.style.boxShadow = "0 0 0 1px var(--border-card)";
  },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = "var(--border-card)";
    e.currentTarget.style.boxShadow = "none";
  },
} as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-data)",
        fontSize: "var(--text-2xs-size)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function parseSkills(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,•\n;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function ExperienceRow({ item, isLast }: { item: ProfileExperienceItem; isLast: boolean }) {
  return (
    <div style={{ display: "flex", gap: 14, minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "var(--r-full)",
            background: "var(--accent-muted)",
            border: "1px solid var(--accent-border)",
            marginTop: 4,
          }}
        />
        {!isLast && (
          <div
            style={{
              width: 1,
              flex: 1,
              minHeight: 12,
              background: "linear-gradient(var(--border-subtle), transparent)",
            }}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 0 : 18 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-sm-size)",
            fontWeight: 600,
            color: "var(--text-primary)",
            lineHeight: 1.35,
          }}
        >
          {item.heading?.trim() || "—"}
        </div>
        {item.subheading?.trim() ? (
          <div
            style={{
              marginTop: 4,
              fontFamily: "var(--font-data)",
              fontSize: "var(--text-xs-size)",
              color: "var(--text-secondary)",
              lineHeight: 1.45,
            }}
          >
            {item.subheading.trim()}
          </div>
        ) : null}
        {item.date?.trim() ? (
          <div
            style={{
              marginTop: 6,
              fontFamily: "var(--font-data)",
              fontSize: "var(--text-2xs-size)",
              color: "var(--text-muted)",
              letterSpacing: "0.02em",
            }}
          >
            {item.date.trim()}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export type ClientProfilePanelProps = {
  data: ProfileCaptureData;
};

export function ClientProfilePanel({ data }: ClientProfilePanelProps) {
  const skills = parseSkills(data.topSkills);
  const experience = data.experience ?? [];
  const displayName = data.profileName?.trim() || "Unnamed profile";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Banner + identity — overflow only on banner so avatar can overlap */}
      <div
        style={{
          ...CARD,
          padding: 0,
          overflow: "visible",
        }}
        {...HOVER_CARD}
      >
        <div
          style={{
            height: 132,
            position: "relative",
            borderRadius: "var(--r-md) var(--r-md) 0 0",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, var(--bg-elevated) 0%, rgba(45, 127, 232, 0.12) 45%, var(--bg-elevated) 100%)",
          }}
        >
          {data.bannerImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote capture URL
            <img
              src={data.bannerImage}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : null}
        </div>

        <div
          style={{
            padding: "0 1.35rem 1.35rem",
            display: "flex",
            gap: 18,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              marginTop: -AVATAR_OVERLAP_PX,
              flexShrink: 0,
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                borderRadius: "var(--r-full)",
                padding: AVATAR_RING_PX,
                background: "var(--bg-card)",
                boxShadow: "0 0 0 1px var(--border-card)",
              }}
            >
              <NetworkAvatar
                name={displayName}
                image={data.profileImage}
                sizePx={AVATAR_SIZE_PX}
              />
            </div>
          </div>

          <div style={{ flex: "1 1 220px", minWidth: 0, paddingTop: 14 }}>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-xl-size)",
                lineHeight: 1.2,
                fontWeight: 600,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              {displayName}
            </h3>
            {data.headline?.trim() ? (
              <p
                style={{
                  margin: "10px 0 0",
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-sm-size)",
                  color: "var(--text-secondary)",
                  lineHeight: 1.55,
                }}
              >
                {data.headline.trim()}
              </p>
            ) : null}
            {data.location?.trim() ? (
              <div
                style={{
                  marginTop: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-xs-size)",
                  color: "var(--text-muted)",
                }}
              >
                <MapPin size={14} strokeWidth={2} aria-hidden />
                <span>{data.location.trim()}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 10,
          alignItems: "stretch",
        }}
      >
        <div style={{ ...CARD, padding: "1rem 1.2rem", display: "flex", flexDirection: "column" }} {...HOVER_CARD}>
          <SectionLabel>About</SectionLabel>
          {data.about?.trim() ? (
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-sm-size)",
                color: "var(--text-secondary)",
                lineHeight: 1.65,
                whiteSpace: "pre-wrap",
              }}
            >
              {data.about.trim()}
            </p>
          ) : (
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-sm-size)",
                color: "var(--text-muted)",
                fontStyle: "italic",
              }}
            >
              No about section in this capture.
            </p>
          )}
        </div>

        <div style={{ ...CARD, padding: "1rem 1.2rem", display: "flex", flexDirection: "column" }} {...HOVER_CARD}>
          <SectionLabel>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={12} strokeWidth={2} aria-hidden />
              Top skills
            </span>
          </SectionLabel>
          {skills.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {skills.map((s) => (
                <span
                  key={s}
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: "var(--text-xs-size)",
                    color: "var(--text-secondary)",
                    padding: "6px 10px",
                    borderRadius: "var(--r-md)",
                    background: "var(--bg-elevated)",
                    border: "1px dashed var(--border-card)",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-sm-size)",
                color: "var(--text-muted)",
                fontStyle: "italic",
              }}
            >
              No skills listed in this capture.
            </p>
          )}
        </div>
      </div>

      <div style={{ ...CARD, padding: "1rem 1.2rem" }} {...HOVER_CARD}>
        <SectionLabel>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Briefcase size={12} strokeWidth={2} aria-hidden />
            Experience
          </span>
        </SectionLabel>
        {experience.length > 0 ? (
          <div>
            {experience.map((item, i) => (
              <ExperienceRow
                key={`${item.heading ?? "row"}-${i}`}
                item={item}
                isLast={i === experience.length - 1}
              />
            ))}
          </div>
        ) : (
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-data)",
              fontSize: "var(--text-sm-size)",
              color: "var(--text-muted)",
              fontStyle: "italic",
            }}
          >
            No experience entries in this capture.
          </p>
        )}
      </div>

    </div>
  );
}
