"use client";

import { use, useEffect, useState } from "react";
import { ApiError } from "@/lib/axios";
import { fetchProfileCapture } from "@/api/profileCapture";
import type { ProfileCaptureData } from "@/types/profileCapture";
import { EmptyState, RefreshDataButton } from "@/components";
import { ClientProfilePanel } from "@/components/profile/ClientProfilePanel";
import { ClientProfileSkeleton } from "@/components/profile/ClientProfileSkeleton";
import { PROFILE_PAGE_SHELL } from "@/lib/profile/profileLayout";

function formatCapturedAt(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ClientProfilePage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = use(params);

  const [status, setStatus] = useState<"idle" | "loading" | "error" | "empty" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProfileCaptureData | null>(null);
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [captureId, setCaptureId] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [refreshBusy, setRefreshBusy] = useState(false);

  useEffect(() => {
    let ignore = false;
    const id = setTimeout(() => {
      setStatus("loading");
      setError(null);

      fetchProfileCapture(clientId)
        .then((res) => {
          if (ignore) return;
          setData(res.data);
          setCapturedAt(res.capturedAt);
          setCaptureId(res.captureId);
          setStatus("success");
        })
        .catch((e) => {
          if (ignore) return;
          if (e instanceof ApiError && e.statusCode === 404) {
            setError(null);
            setData(null);
            setCapturedAt(null);
            setCaptureId(null);
            setStatus("empty");
            return;
          }
          const msg = e instanceof ApiError ? e.message : "Something went wrong";
          setError(msg);
          setData(null);
          setCapturedAt(null);
          setCaptureId(null);
          setStatus("error");
        })
        .finally(() => {
          if (!ignore) setRefreshBusy(false);
        });
    }, 0);

    return () => {
      ignore = true;
      clearTimeout(id);
    };
  }, [clientId, refreshNonce]);

  const lastCapturedStr = capturedAt ? formatCapturedAt(capturedAt) : null;

  if (status === "loading") {
    return (
      <div style={{ ...PROFILE_PAGE_SHELL, display: "flex", flexDirection: "column", gap: 16 }}>
        <ClientProfileSkeleton />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{ ...PROFILE_PAGE_SHELL }}>
        <EmptyState
          variant="error"
          title="Failed to load"
          body={error ?? "Something went wrong."}
          action={{
            label: "Try again",
            onClick: () => {
              setRefreshBusy(true);
              setRefreshNonce((n) => n + 1);
            },
          }}
        />
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div style={{ ...PROFILE_PAGE_SHELL, display: "flex", flexDirection: "column", gap: 16 }}>
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
            LinkedIn profile
          </h2>
          <RefreshDataButton
            loading={refreshBusy}
            onClick={() => {
              setRefreshBusy(true);
              setRefreshNonce((n) => n + 1);
            }}
          />
        </div>
        <EmptyState
          variant="zero-capture"
          title="No profile capture"
          body="We could not find a profile_main capture for this client yet. Capture the profile page to see it here."
          action={{
            label: "Check again",
            onClick: () => {
              setRefreshBusy(true);
              setRefreshNonce((n) => n + 1);
            },
          }}
        />
      </div>
    );
  }

  if (!data || !captureId || !capturedAt) {
    return (
      <div style={{ ...PROFILE_PAGE_SHELL }}>
        <EmptyState
          variant="filtered-empty"
          title="No profile data"
          body="The profile response was incomplete."
        />
      </div>
    );
  }

  return (
    <div style={{ ...PROFILE_PAGE_SHELL, display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
            LinkedIn profile
          </h2>
          {lastCapturedStr ? (
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-xs-size)",
                color: "var(--text-muted)",
              }}
            >
              Last captured {lastCapturedStr}
            </p>
          ) : null}
        </div>
        <RefreshDataButton
          loading={refreshBusy}
          onClick={() => {
            setRefreshBusy(true);
            setRefreshNonce((n) => n + 1);
          }}
        />
      </div>

      <ClientProfilePanel data={data} />

      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-data)",
          fontSize: "var(--text-2xs-size)",
          color: "var(--text-muted)",
        }}
      >
        Capture ID{" "}
        <span data-tabular style={{ color: "var(--text-secondary)" }}>
          {captureId}
        </span>
      </p>
    </div>
  );
}
