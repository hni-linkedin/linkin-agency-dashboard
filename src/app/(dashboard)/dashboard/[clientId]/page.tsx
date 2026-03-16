"use client";

import { use, useState } from "react";
import { useHomeData } from "@/hooks/useHomeData";
import { EmptyState } from "@/components";
import { OverviewTab } from "@/components/dashboard/tabs/OverviewTab";
import { OverviewSkeleton } from "@/components/dashboard/tabs/OverviewSkeleton";

export default function DashboardClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = use(params);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isLoading, isError, isEmpty, data, error, refetch } =
    useHomeData(clientId);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) return <OverviewSkeleton />;
  if (isError)
    return (
      <EmptyState
        variant="error"
        title="Failed to load"
        body={error ?? "Something went wrong."}
        action={{ label: "Retry", onClick: () => refetch() }}
      />
    );
  if (isEmpty)
    return (
      <EmptyState
        variant="zero-capture"
        title="No data yet"
        body="Capture this profile to start tracking."
        action={{ label: "Open extension", onClick: () => {} }}
      />
    );
  if (!data) return null;

  return (
    <OverviewTab data={data} clientId={clientId} onRefresh={handleRefresh} />
  );
}
