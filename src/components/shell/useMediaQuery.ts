"use client";

import { useLayoutEffect, useState } from "react";

/**
 * Hydration-safe: always `false` on server and on the first client render, then syncs from `matchMedia`.
 * Do not use `useState(() => matchMedia...)` — on the client that initializer sees `window` and can
 * disagree with SSR, causing layout mismatches (e.g. `DashboardShell` grid with/without sidebar).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useLayoutEffect(() => {
    const m = window.matchMedia(query);
    const apply = () => setMatches(m.matches);
    apply();
    m.addEventListener("change", apply);
    return () => m.removeEventListener("change", apply);
  }, [query]);

  return matches;
}
