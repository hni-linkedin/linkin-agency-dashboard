"use client";

import { SkeletonBlock } from "@/components";

export function AudienceSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <SkeletonBlock height={28} width={280} radius="var(--r-sm)" />
          <SkeletonBlock height={12} width={160} radius="var(--r-sm)" />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            alignItems: "flex-end",
          }}
        >
          <SkeletonBlock height={32} width={160} radius="var(--r-md)" />
          <SkeletonBlock height={12} width={140} radius="var(--r-sm)" />
        </div>
      </div>

      {/* Persona card */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px dashed var(--border-card)",
          borderRadius: "var(--r-md)",
          padding: "1.4rem 1.6rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.2rem",
          alignItems: "center",
        }}
      >
        <div>
          <SkeletonBlock height={10} width="62%" radius="var(--r-sm)" />
          <div style={{ height: 10 }} />
          <SkeletonBlock height={26} width="92%" radius="var(--r-md)" />
          <SkeletonBlock height={14} width="96%" radius="var(--r-sm)" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: "var(--bg-elevated)",
                border: "1px dashed var(--border-card)",
                borderRadius: "var(--r-md)",
                padding: "9px 13px",
                fontSize: 12,
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "flex-start",
                gap: 9,
                lineHeight: 1.5,
              }}
            >
              <SkeletonBlock width={7} height={7} radius="50%" />
              <SkeletonBlock
                height={12}
                width={i === 1 ? "92%" : i === 2 ? "80%" : "68%"}
                radius="var(--r-sm)"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Seniority | Map */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
        {/* Seniority donut card */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px dashed var(--border-card)",
            borderRadius: "var(--r-md)",
            padding: "1rem 1.2rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <SkeletonBlock height={10} width={90} radius="var(--r-sm)" />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 12,
              justifyContent: "space-between",
            }}
          >
            <SkeletonBlock width={128} height={128} radius="var(--r-full)" />

            <div style={{ width: 160 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 6,
                    marginBottom: 2,
                    width: "100%",
                  }}
                >
                  <SkeletonBlock width={7} height={7} radius="2px" />
                  <SkeletonBlock
                    height={10}
                    width={i === 4 ? "70%" : "88%"}
                    radius="var(--r-sm)"
                  />
                  <SkeletonBlock height={10} width={48} radius="var(--r-sm)" />
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: "auto",
              paddingTop: 8,
              borderTop: "1px dashed var(--border-subtle)",
            }}
          >
            <SkeletonBlock height={10} width="80%" radius="var(--r-sm)" />
          </div>
        </div>

        {/* Locations map card */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px dashed var(--border-card)",
            borderRadius: "var(--r-md)",
            padding: 0,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "1rem 1.2rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <SkeletonBlock height={10} width={80} radius="var(--r-sm)" />
            <div style={{ height: 12 }} />
            <SkeletonBlock height={22} width="78%" radius="var(--r-md)" />
            <SkeletonBlock height={12} width="62%" radius="var(--r-sm)" />

            <div
              style={{
                height: 1,
                background: "var(--border-subtle)",
                margin: "8px 0",
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 7,
                flex: 1,
              }}
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <SkeletonBlock
                    height={10}
                    width={i === 3 ? "52%" : "60%"}
                    radius="var(--r-sm)"
                  />
                  <SkeletonBlock height={10} width="38%" radius="2px" />
                  <SkeletonBlock height={10} width={44} radius="var(--r-sm)" />
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "auto",
                paddingTop: 8,
                borderTop: "1px dashed var(--border-subtle)",
              }}
            >
              <SkeletonBlock height={10} width="92%" radius="var(--r-sm)" />
            </div>
          </div>

          <div
            style={{
              background: "#0a0e14",
              minHeight: 260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SkeletonBlock height={20} width="70%" radius="var(--r-md)" />
          </div>
        </div>
      </div>

      {/* Row 3: Industries | Job titles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 10,
          marginTop: 10,
        }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              background: "var(--bg-card)",
              border: "1px dashed var(--border-card)",
              borderRadius: "var(--r-md)",
              padding: "1rem 1.2rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <SkeletonBlock height={10} width={70} radius="var(--r-sm)" />
            <div style={{ height: 10 }} />
            <SkeletonBlock height={22} width="86%" radius="var(--r-md)" />
            <SkeletonBlock height={12} width="56%" radius="var(--r-sm)" />
            <div
              style={{
                height: 1,
                background: "var(--border-subtle)",
                margin: "8px 0",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[0, 1, 2, 3].map((j) => (
                <div
                  key={j}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <SkeletonBlock height={10} width="62%" radius="var(--r-sm)" />
                  <SkeletonBlock height={10} width="38%" radius="2px" />
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: "auto",
                paddingTop: 8,
                borderTop: "1px dashed var(--border-subtle)",
              }}
            >
              <SkeletonBlock height={10} width="90%" radius="var(--r-sm)" />
            </div>
          </div>
        ))}
      </div>

      {/* Row 4: Top companies | Company size */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 10,
          marginTop: 10,
        }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              background: "var(--bg-card)",
              border: "1px dashed var(--border-card)",
              borderRadius: "var(--r-md)",
              padding: "1rem 1.2rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <SkeletonBlock height={10} width={90} radius="var(--r-sm)" />
            <div style={{ height: 10 }} />
            <SkeletonBlock height={22} width="78%" radius="var(--r-md)" />
            <SkeletonBlock height={12} width="56%" radius="var(--r-sm)" />
            <div
              style={{
                height: 1,
                background: "var(--border-subtle)",
                margin: "8px 0",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[0, 1, 2, 3].map((j) => (
                <div
                  key={j}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <SkeletonBlock height={10} width="60%" radius="var(--r-sm)" />
                  <SkeletonBlock height={10} width="40%" radius="2px" />
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: "auto",
                paddingTop: 8,
                borderTop: "1px dashed var(--border-subtle)",
              }}
            >
              <SkeletonBlock height={10} width="92%" radius="var(--r-sm)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
