"use client";

import { Suspense, use, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ApiError } from "@/lib/axios";
import { fetchNetworkOverview } from "@/api/network";
import { EmptyState, RefreshDataButton, TabBar } from "@/components";
import { NetworkOverviewPanel } from "@/components/network/NetworkOverviewPanel";
import { NetworkOverviewSkeleton } from "@/components/network/NetworkOverviewSkeleton";
import { NetworkRouteShellSkeleton } from "@/components/network/NetworkRouteShellSkeleton";
import { NetworkTabListingSkeleton } from "@/components/network/NetworkTabListingSkeleton";
import { NetworkTable } from "@/components/network/NetworkTable";
import {
  formatCapturedAtLabel,
  getMostRecentNetworkCaptureAt,
} from "@/lib/network/networkDates";
import type { NetworkTableTab } from "@/types/network";
import type { NetworkOverviewData } from "@/types/network";

type MainTab = "overview" | NetworkTableTab;

function parseTabParam(raw: string | null): MainTab {
  if (
    raw === "connections" ||
    raw === "followers" ||
    raw === "following" ||
    raw === "overview"
  ) {
    return raw;
  }
  return "overview";
}

function NetworkPageInner({ clientId }: { clientId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tab = parseTabParam(searchParams.get("tab"));
  const overlapsOnly = searchParams.get("overlaps") === "1";

  const [overviewStatus, setOverviewStatus] = useState<
    "loading" | "error" | "success"
  >("loading");
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [overviewData, setOverviewData] = useState<NetworkOverviewData | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [refreshBusy, setRefreshBusy] = useState(false);

  useEffect(() => {
    let ignore = false;

    fetchNetworkOverview(clientId)
      .then((data) => {
        if (ignore) return;
        setOverviewData(data);
        setOverviewStatus("success");
        setOverviewError(null);
      })
      .catch((e) => {
        if (ignore) return;
        const msg = e instanceof ApiError ? e.message : "Something went wrong";
        setOverviewError(msg);
        setOverviewStatus("error");
        setOverviewData(null);
      })
      .finally(() => {
        if (!ignore) setRefreshBusy(false);
      });

    return () => {
      ignore = true;
    };
  }, [clientId, refreshNonce]);

  const setQuery = (updates: Record<string, string | null | undefined>) => {
    const p = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined) continue;
      if (v === null || v === "") p.delete(k);
      else p.set(k, v);
    }
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const lastCaptured = useMemo(() => {
    if (!overviewData) return null;
    return getMostRecentNetworkCaptureAt(overviewData);
  }, [overviewData]);

  const counts = overviewData?.counts;

  const tabs = useMemo(
    () => [
      { id: "overview", label: "Overview" },
      {
        id: "connections",
        label: "Connections",
        badge: counts?.connections,
      },
      { id: "followers", label: "Followers", badge: counts?.followers },
      { id: "following", label: "Following", badge: counts?.following },
    ],
    [counts],
  );

  const handleTabChange = (id: string) => {
    const next = id as MainTab;
    if (next === "overview") {
      setQuery({ tab: "overview", overlaps: null });
      return;
    }
    if (next === "followers") {
      setQuery({ tab: "followers" });
      return;
    }
    setQuery({ tab: next, overlaps: null });
  };

  const goToFollowersOverlaps = () => {
    setQuery({ tab: "followers", overlaps: "1" });
  };

  const goToFollowingOneSided = () => {
    setQuery({ tab: "following", overlaps: null });
  };

  const onOverlapsOnlyChange = (next: boolean) => {
    if (next) setQuery({ overlaps: "1" });
    else setQuery({ overlaps: null });
  };

  if (overviewStatus === "loading") {
    return <NetworkRouteShellSkeleton activeTab={tab} />;
  }

  if (overviewStatus === "error") {
    return (
      <EmptyState
        variant="error"
        title="Failed to load"
        body={overviewError ?? "Something went wrong."}
        action={{
          label: "Retry",
          onClick: () => {
            setOverviewStatus("loading");
            setRefreshNonce((n) => n + 1);
          },
        }}
      />
    );
  }

  if (!overviewData) {
    return (
      <EmptyState
        variant="filtered-empty"
        title="No network data"
        body="Capture network data for this client to see insights."
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display-outfit)",
            fontWeight: 600,
            fontSize: "var(--text-lg-size)",
            lineHeight: "var(--text-lg-line)",
            margin: 0,
            color: "var(--text-primary)",
          }}
        >
          Network
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
            variant="surface"
            align="flex-end"
            loading={refreshBusy}
            onClick={() => {
              setRefreshBusy(true);
              setRefreshNonce((n) => n + 1);
              router.refresh();
            }}
          />
          <div
            style={{
              fontFamily: "var(--font-data)",
              fontSize: "var(--text-sm-size)",
              color: "var(--text-muted)",
            }}
          >
            {lastCaptured ? `Last captured ${formatCapturedAtLabel(lastCaptured)}` : "—"}
          </div>
        </div>
      </div>

      <div style={{ borderBottom: "1px dashed var(--border-subtle)", marginBottom: 4 }}>
        <TabBar tabs={tabs} activeId={tab} onChange={handleTabChange} variant="underline" />
      </div>

      {refreshBusy ? (
        tab === "overview" ? (
          <NetworkOverviewSkeleton />
        ) : (
          <NetworkTabListingSkeleton />
        )
      ) : (
        <>
          {tab === "overview" && (
            <NetworkOverviewPanel
              data={overviewData}
              onGoToFollowersOverlaps={goToFollowersOverlaps}
              onGoToFollowingOneSided={goToFollowingOneSided}
            />
          )}

          {tab !== "overview" && (
            <NetworkTable
              tab={tab}
              clientId={clientId}
              overviewData={overviewData}
              overlapsOnly={tab === "followers" && overlapsOnly}
              onOverlapsOnlyChange={onOverlapsOnlyChange}
              refreshEpoch={refreshNonce}
            />
          )}
        </>
      )}
    </div>
  );
}

function ResolvedParams({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = use(params);
  return <NetworkPageInner key={clientId} clientId={clientId} />;
}

export default function ClientNetworkPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  return (
    <Suspense fallback={<NetworkRouteShellSkeleton activeTab="overview" />}>
      <ResolvedParams params={params} />
    </Suspense>
  );
}
