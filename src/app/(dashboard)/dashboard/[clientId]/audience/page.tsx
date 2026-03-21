"use client";

import { use, useEffect, useState } from "react";
import { ApiError } from "@/lib/axios";
import { fetchAudienceDemographics } from "@/api/audience";
import type { AudienceDemographicsData } from "@/types/audience";
import { EmptyState } from "@/components";
import { AudiencePersonaCard } from "@/components/audience/AudiencePersonaCard";
import { AudienceBarDimensionCard } from "@/components/audience/AudienceBarDimensionCard";
import { AudienceLocationsDimensionCard } from "@/components/audience/AudienceLocationsDimensionCard";
import { AudienceSeniorityDonutCard } from "@/components/audience/AudienceSeniorityDonutCard";
import { AudienceSkeleton } from "@/components/audience/AudienceSkeleton";
import { RefreshDataButton } from "@/components";

function formatCapturedAt(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AudienceClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = use(params);

  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<AudienceDemographicsData | null>(null);
  const [capturedAt, setCapturedAt] = useState<string | null>(null);

  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    let ignore = false;
    const id = setTimeout(() => {
      setStatus("loading");
      setError(null);

      fetchAudienceDemographics(clientId)
        .then((res) => {
          if (ignore) return;
          setData(res.data);
          setCapturedAt(res.capturedAt);
          setStatus("success");
        })
        .catch((e) => {
          if (ignore) return;
          const msg =
            e instanceof ApiError ? e.message : "Something went wrong";
          setError(msg);
          setData(null);
          setCapturedAt(null);
          setStatus("error");
        });
    }, 0);

    return () => {
      ignore = true;
      clearTimeout(id);
    };
  }, [clientId, refreshNonce]);

  const lastCapturedStr = capturedAt ? formatCapturedAt(capturedAt) : null;

  if (status === "loading") {
    return <AudienceSkeleton />;
  }

  if (status === "error") {
    return (
      <EmptyState
        variant="error"
        title="Failed to load"
        body={error ?? "Something went wrong."}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        variant="filtered-empty"
        title="No audience data found"
        body="Capture audience demographics for this client."
      />
    );
  }

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
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-lg-size)",
            lineHeight: "var(--text-lg-line)",
            color: "var(--text-primary)",
            margin: 0,
            fontWeight: 600,
          }}
        >
          Audience demographics
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            alignItems: "flex-end",
          }}
        >
          <RefreshDataButton
            onClick={() => setRefreshNonce((n) => n + 1)}
            align="flex-end"
          />

          <div
            style={{
              fontFamily: "var(--font-data)",
              fontSize: "var(--text-sm-size)",
              color: "var(--text-muted)",
            }}
          >
            {lastCapturedStr ? `Last captured ${lastCapturedStr}` : "—"}
          </div>
        </div>
      </div>

      {/* Persona */}
      <AudiencePersonaCard data={data} />

      {/* Row 2: Seniority | Map (Locations) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
        <AudienceSeniorityDonutCard items={data.seniority} />
        <AudienceLocationsDimensionCard
          label="Locations"
          items={data.location}
        />
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
        <AudienceBarDimensionCard label="Industries" items={data.industry} />
        <AudienceBarDimensionCard label="Job titles" items={data.job_title} />
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
        <AudienceBarDimensionCard label="Top companies" items={data.company} />
        <AudienceBarDimensionCard
          label="Company size"
          items={data.company_size}
        />
      </div>
    </div>
  );
}
