"use client";

import { use } from "react";
import { EmptyState } from "@/components";

export default function ClientNetworkPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = use(params);

  return (
    <div key={clientId} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h2
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-lg-size)",
            color: "var(--text-primary)",
          }}
        >
          Network
        </h2>
        <p
          style={{
            margin: "6px 0 0",
            fontFamily: "var(--font-data)",
            fontSize: "var(--text-sm-size)",
            color: "var(--text-muted)",
          }}
        >
          Connections and network insights for this client will appear here.
        </p>
      </div>

      <EmptyState
        variant="filtered-empty"
        title="Nothing here yet"
        body="This section is ready for network data when your backend exposes it."
      />
    </div>
  );
}
