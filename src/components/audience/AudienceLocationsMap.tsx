"use client";

import { useEffect, useMemo, useRef } from "react";
import type { AudiencePercentageItem } from "@/types/audience";
import { normalizeAudiencePercentage, sortByAudiencePercentageDesc } from "@/lib/audience/percent";

declare global {
  interface Window {
    L?: unknown;
  }
}

let leafletLoadPromise: Promise<void> | null = null;

type LeafletMapLike = {
  fitBounds: (
    bounds: unknown,
    opts?: {
      padding?: [number, number];
    },
  ) => void;
};

type LeafletTileLayerLike = {
  addTo: (map: LeafletMapLike) => LeafletTileLayerLike;
};

type LeafletMarkerLike = {
  addTo: (map: LeafletMapLike) => LeafletMarkerLike;
  remove: () => void;
  bindTooltip: (content: string, opts: Record<string, unknown>) => void;
  on: (eventName: string, handler: () => void) => void;
  openTooltip: () => void;
  closeTooltip: () => void;
};

type LeafletGlobalLike = {
  map: (el: HTMLElement, opts: Record<string, unknown>) => LeafletMapLike;
  tileLayer: (url: string, opts: Record<string, unknown>) => LeafletTileLayerLike;
  circleMarker: (latlng: [number, number], opts: Record<string, unknown>) => LeafletMarkerLike;
  latLng: (lat: number, lng: number) => [number, number];
  latLngBounds: (latlngs: Array<[number, number]>) => unknown;
};

async function ensureLeafletLoaded() {
  if (typeof window === "undefined") return;
  if (window.L) return;
  if (leafletLoadPromise) return leafletLoadPromise;

  leafletLoadPromise = new Promise<void>((resolve, reject) => {
    const cssId = "leaflet-css";
    const jsId = "leaflet-js";

    // Inject CSS once.
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Inject JS once.
    if (document.getElementById(jsId)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = jsId;
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Leaflet"));
    document.body.appendChild(script);
  });

  return leafletLoadPromise;
}

function buildCities(items: AudiencePercentageItem[]): Array<{ name: string; pct: number; lat: number; lng: number }> {
  // Plain JS array at the top of the script: swap city coordinates/presets here if needed.
  // Percentages (`pct`) get filled from the API items.
  const base = [
    { name: "Greater Bengaluru Area", pct: 0, lat: 12.97, lng: 77.59 },
    { name: "Greater Delhi Area", pct: 0, lat: 28.61, lng: 77.21 },
    { name: "Greater Jaipur Area", pct: 0, lat: 26.91, lng: 75.79 },
    { name: "Noida", pct: 0, lat: 28.54, lng: 77.39 },
    { name: "Mumbai Metropolitan Region", pct: 0, lat: 19.08, lng: 72.88 },
  ] as Array<{ name: string; pct: number; lat: number; lng: number }>;

  const sorted = sortByAudiencePercentageDesc(items);
  const top = sorted.slice(0, 6); // only top points matter for markers

  // Map API titles to the fixed city presets above.
  const findPct = (title: string): number => {
    const found = top.find((t) => t.title === title);
    if (found) return normalizeAudiencePercentage(found.percentage);
    // Heuristics to match backend titles like `Greater Bengaluru Area` variations.
    const byIncludes = top.find((t) => t.title.includes(title.split(" ")[0]));
    return byIncludes ? normalizeAudiencePercentage(byIncludes.percentage) : 0;
  };

  for (const c of base) {
    c.pct = findPct(c.name);
  }

  // Filter out empty points so fitBounds isn't zoomed out.
  return base.filter((c) => c.pct > 0);
}

function tooltipHtml(name: string, pct: number) {
  const pctText = `${pct.toFixed(1)}%`;
  return `
    <div style="
      background:#1C2333;
      border:1px solid rgba(255,255,255,0.13);
      padding:6px 10px;
      border-radius:6px;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--text-primary);
      white-space: nowrap;
    ">${name} : ${pctText}</div>
  `;
}

function getCssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function AudienceLocationsMap({ items }: { items: AudiencePercentageItem[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMapLike | null>(null);
  const tileLayerRef = useRef<LeafletTileLayerLike | null>(null);
  const markerLayersRef = useRef<LeafletMarkerLike[]>([]);

  const cities = useMemo(() => buildCities(items), [items]);

  useEffect(() => {
    let cancelled = false;

    ensureLeafletLoaded()
      .then(() => {
        if (cancelled) return;
        const L = window.L as LeafletGlobalLike | undefined;
        const el = containerRef.current;
        if (!L || !el) return;

        // Create map once.
        if (!mapRef.current) {
          // Ensure leaflet container bg matches our dark base.
          const styleId = "leaflet-audience-bg";
          if (!document.getElementById(styleId)) {
            const style = document.createElement("style");
            style.id = styleId;
            style.textContent = `.leaflet-container { background: #0a0e14 !important; }`;
            document.head.appendChild(style);
          }

          mapRef.current = L.map(el, {
            zoomControl: false,
            attributionControl: false,
            boxZoom: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            keyboard: false,
          });

          tileLayerRef.current = L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
            {
              subdomains: ["a", "b", "c", "d"],
              attribution: "",
            },
          ).addTo(mapRef.current);
        }

        // Override Leaflet tooltip wrapper styling so only our custom HTML shows.
        const tooltipStyleId = "leaflet-audience-tooltip";
        if (!document.getElementById(tooltipStyleId)) {
          const style = document.createElement("style");
          style.id = tooltipStyleId;
          style.textContent = `
            .leaflet-tooltip.audience-tooltip {
              background: transparent !important;
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              color: inherit !important;
            }
            .leaflet-tooltip.audience-tooltip::before {
              display: none !important;
            }
            .leaflet-tooltip.audience-tooltip .leaflet-tooltip-content {
              margin: 0 !important;
              padding: 0 !important;
            }
          `;
          document.head.appendChild(style);
        }

        const brandAccent = getCssVar("--accent", "#2D7FE8");
        const brandTeal = getCssVar("--teal", "#1D9E75");
        const brandAmber = getCssVar("--amber", "#BA7517");
        const brandRed = getCssVar("--red", "#E84040");

        // Remove previous markers.
        markerLayersRef.current.forEach((m) => {
          try {
            m.remove();
          } catch {
            // ignore
          }
        });
        markerLayersRef.current = [];

        if (cities.length === 0) {
          return;
        }

        const map = mapRef.current;
        if (!map) return;

        const bounds: Array<[number, number]> = [];

        const maxPct = Math.max(1, ...cities.map((c) => c.pct));

        cities.forEach((c) => {
          const radius = Math.max(3, Math.sqrt(c.pct) * 4);

          // Heatmap buckets based on share relative to max city in this card.
          const t = c.pct / maxPct; // 0..1
          let stroke = brandAccent;
          let fill = brandAccent;
          if (t >= 0.75) {
            // Highest shares
            stroke = brandRed;
            fill = brandRed;
          } else if (t >= 0.5) {
            stroke = brandAmber;
            fill = brandAmber;
          } else if (t >= 0.25) {
            stroke = brandTeal;
            fill = brandTeal;
          }

          const marker = L.circleMarker([c.lat, c.lng], {
            radius,
            color: stroke,
            weight: 1,
            fillColor: fill,
            fillOpacity: 0.65,
            opacity: 1,
          }).addTo(map);

          marker.bindTooltip(tooltipHtml(c.name, c.pct), {
            sticky: false,
            direction: "top",
            opacity: 1,
            permanent: false,
            className: "audience-tooltip",
          });

          marker.on("mouseover", () => marker.openTooltip());
          marker.on("mouseout", () => marker.closeTooltip());

          markerLayersRef.current.push(marker);
          bounds.push([c.lat, c.lng]);
        });

        const latLngs = bounds.map((b) => L.latLng(b[0], b[1]));
        const groupBounds = L.latLngBounds(latLngs);
        mapRef.current.fitBounds(groupBounds, { padding: [16, 16] });
      })
      .catch(() => {
        // ignore: map will stay empty
      });

    return () => {
      cancelled = true;
    };
  }, [cities]);

  return (
    <div
      style={{
        borderLeft: "1px dashed var(--border-card)",
        overflow: "hidden",
        borderRadius: "0 var(--r-md) var(--r-md) 0",
        minHeight: 260,
        background: "#0a0e14",
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0e14",
        }}
      />
    </div>
  );
}

