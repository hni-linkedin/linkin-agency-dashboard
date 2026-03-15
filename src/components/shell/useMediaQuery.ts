"use client";

import { useState, useEffect } from "react";

function getMatches(query: string): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(query).matches;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => getMatches(query));

  useEffect(() => {
    const m = window.matchMedia(query);
    const handler = () => setMatches(m.matches);
    const id = setTimeout(() => setMatches(m.matches), 0);
    m.addEventListener("change", handler);
    return () => {
      clearTimeout(id);
      m.removeEventListener("change", handler);
    };
  }, [query]);

  return matches;
}
