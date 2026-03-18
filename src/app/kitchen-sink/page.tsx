"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  PageShell,
  Sidebar,
  Header,
  TabBar,
  StatCard,
  DeltaBadge,
  DataCard,
  SkeletonBlock,
  EmptyState,
  Badge,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  MetricRow,
  TrendChart,
  SparkLine,
  DonutChart,
  BarChart,
  TopPostsTable,
  InsightCallout,
  ViewerRow,
  FreshnessIndicator,
  CaptureBadge,
  SessionBadge,
  CaptureHealthGrid,
  SessionTimeline,
  FreshnessStrip,
  ClientSwitcher,
  SortButton,
  DropdownSelect,
} from "@/components";
import type { ClientInfo } from "@/components";
import type { PostRow } from "@/components";
import type { TrendDataPoint, MetricConfig } from "@/components";
import type { DonutSegment } from "@/components";
import type { BarDataPoint } from "@/components";
import type { TimelineSession } from "@/components";
import {
  Settings,
  RefreshCw,
  Bell,
  Search,
} from "lucide-react";

const SECTIONS = [
  { id: "tokens", label: "Tokens" },
  { id: "primitives", label: "Primitives" },
  { id: "data", label: "Data" },
  { id: "status", label: "Status" },
  { id: "layout", label: "Layout" },
  { id: "forms", label: "Forms" },
  { id: "motion", label: "Motion" },
] as const;

const MOCK_CLIENT: ClientInfo = {
  id: "1",
  name: "Acme Corp",
  sector: "Technology",
};
const MOCK_CLIENTS: ClientInfo[] = [
  MOCK_CLIENT,
  { id: "2", name: "Beta Inc", sector: "Finance" },
  { id: "3", name: "Gamma LLC", sector: "Healthcare" },
];

const MOCK_TREND_DATA: TrendDataPoint[] = Array.from({ length: 8 }, (_, i) => ({
  session: `S${i + 1}`,
  date: new Date(Date.now() - (7 - i) * 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  impressions: 18000 + i * 1200 + Math.random() * 800,
  engagements: 2200 + i * 180 + Math.random() * 100,
  followers: 12500 + i * 200,
}));

const MOCK_METRICS: MetricConfig[] = [
  { key: "impressions", label: "Impressions", color: "var(--chart-impressions)", type: "area" },
  { key: "engagements", label: "Engagements", color: "var(--chart-engagements)", type: "line" },
  { key: "followers", label: "Followers", color: "var(--chart-sends)", type: "line" },
];

const MOCK_POSTS: PostRow[] = [
  {
    rank: 1,
    content: "Excited to share our Q4 results — growth across all segments.",
    date: "12 Mar 2026",
    type: "text",
    impressions: 12400,
    engagements: 892,
    comments: 34,
    er: 0.042,
  },
  {
    rank: 2,
    content: "Join us for a live webinar on data intelligence next week.",
    date: "11 Mar 2026",
    type: "image",
    impressions: 9800,
    engagements: 612,
    comments: 28,
    er: 0.038,
  },
  {
    rank: 3,
    content: "New product launch: introducing the next generation platform.",
    date: "10 Mar 2026",
    type: "video",
    impressions: 15200,
    engagements: 1204,
    comments: 56,
    er: 0.048,
  },
  {
    rank: 4,
    content: "Industry report: key trends in B2B marketing for 2026.",
    date: "9 Mar 2026",
    type: "document",
    impressions: 6100,
    engagements: 289,
    comments: 12,
    er: 0.031,
  },
  {
    rank: 5,
    content: "Poll: What feature would you like to see next? Vote now.",
    date: "8 Mar 2026",
    type: "poll",
    impressions: 4200,
    engagements: 380,
    comments: 89,
    er: 0.062,
  },
];

const MOCK_DONUT_DATA: DonutSegment[] = [
  { label: "Reactions", value: 45, color: "var(--chart-impressions)" },
  { label: "Comments", value: 20, color: "var(--chart-engagements)" },
  { label: "Reposts", value: 18, color: "var(--chart-reposts)" },
  { label: "Saves", value: 12, color: "var(--chart-saves)" },
  { label: "Sends", value: 5, color: "var(--chart-sends)" },
];

const MOCK_BAR_DATA: BarDataPoint[] = [
  { label: "Text", value: 42, color: "var(--chart-impressions)" },
  { label: "Image", value: 31, color: "var(--chart-engagements)" },
  { label: "Document", value: 18, color: "var(--chart-reposts)" },
  { label: "Video", value: 9, color: "var(--chart-saves)" },
];

const MOCK_SESSIONS = [
  { id: "1", number: 1, date: "2026-01-15", captureCount: 6 },
  { id: "2", number: 2, date: "2026-02-01", captureCount: 5 },
  { id: "3", number: 3, date: "2026-02-14", captureCount: 5 },
  { id: "4", number: 4, date: "2026-02-28", captureCount: 5 },
  { id: "5", number: 5, date: "2026-03-14", captureCount: 6 },
];

const MOCK_MATRIX: Record<string, Record<string, "captured" | "missing" | "stale">> = {
  Posts: { "1": "captured", "2": "captured", "3": "stale", "4": "missing", "5": "captured" },
  About: { "1": "captured", "2": "captured", "3": "captured", "4": "captured", "5": "captured" },
  Network: { "1": "captured", "2": "missing", "3": "missing", "4": "captured", "5": "captured" },
  Viewers: { "1": "stale", "2": "stale", "3": "missing", "4": "missing", "5": "captured" },
  Experience: { "1": "captured", "2": "captured", "3": "captured", "4": "stale", "5": "captured" },
};

const MOCK_TIMELINE: TimelineSession[] = [
  { id: "1", number: 1, date: "2025-12-15", captureCount: 6, status: "complete" },
  { id: "2", number: 2, date: "2026-01-01", captureCount: 5, status: "complete" },
  { id: "3", number: 3, date: "2026-01-14", captureCount: 4, status: "partial", notes: "Network failed" },
  { id: "4", number: 4, date: "2026-01-28", captureCount: 0, status: "failed", notes: "Connection timeout" },
  { id: "5", number: 5, date: "2026-02-14", captureCount: 6, status: "complete" },
  { id: "6", number: 6, date: "2026-03-14", captureCount: 6, status: "complete" },
];

export default function KitchenSinkPage() {
  const [activeSection, setActiveSection] = useState("tokens");
  const [statKey, setStatKey] = useState(0);
  const [chartKey, setChartKey] = useState(0);
  const [staggerKey, setStaggerKey] = useState(0);
  const [lastTrigger, setLastTrigger] = useState(0);
  const [dropdownSelectValue, setDropdownSelectValue] = useState("any");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const debouncedTrigger = useCallback((fn: () => void) => {
    const now = Date.now();
    if (now - lastTrigger < 200) return;
    setLastTrigger(now);
    fn();
  }, [lastTrigger]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const id = e.target.getAttribute("data-section");
            if (id) setActiveSection(id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <PageShell
      sidebar={
        <Sidebar
          client={MOCK_CLIENT}
          clients={MOCK_CLIENTS}
          onClientChange={() => {}}
          activeRoute="/kitchen-sink"
          captureHealth={[
            { label: "Profile", status: "fresh", lastCapture: "2026-03-14" },
            { label: "Posts", status: "due" },
            { label: "Network", status: "overdue", lastCapture: "2026-02-28" },
          ]}
        />
      }
      header={
        <Header
          clientName="Acme Corp"
          lastCapture="2026-03-14"
          freshness={[
            { label: "Profile", status: "fresh" },
            { label: "Posts", status: "fresh" },
            { label: "Network", status: "fresh" },
          ]}
          actions={
            <>
              <IconButton icon={<Search size={16} />} onClick={() => {}} tooltip="Search" />
              <IconButton icon={<Bell size={16} />} onClick={() => {}} tooltip="Notifications" />
              <IconButton icon={<Settings size={16} />} onClick={() => {}} tooltip="Settings" />
            </>
          }
        />
      }
    >
      <div style={{ paddingBottom: "48px" }}>
        {/* Section nav */}
        <div
          style={{
            position: "sticky",
            top: 52,
            zIndex: 20,
            background: "var(--bg-base)",
            borderBottom: "1px dashed var(--border-subtle)",
            padding: "8px 0",
            marginBottom: "24px",
          }}
        >
          <TabBar
            tabs={SECTIONS.map((s) => ({ id: s.id, label: s.label }))}
            activeId={activeSection}
            onChange={scrollTo}
            variant="pill"
          />
        </div>

        {/* Section 0: Page header */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "var(--text-2xl-size)",
              lineHeight: "var(--text-2xl-line)",
              letterSpacing: "var(--text-2xl-tracking)",
              color: "var(--text-primary)",
              marginBottom: "8px",
            }}
          >
            Component Kitchen Sink
          </h1>
          <p
            style={{
              fontFamily: "var(--font-data)",
              fontSize: "var(--text-sm-size)",
              color: "var(--text-muted)",
              marginBottom: "8px",
            }}
          >
            All 30 components · All states · Design token reference
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Badge label="v1.0" variant="accent" size="md" />
            <span
              style={{
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-xs-size)",
                color: "var(--text-muted)",
              }}
            >
              Last updated: {new Date().toLocaleString()}
            </span>
          </div>
        </div>

        {/* Section 1: Design Tokens */}
        <div
          ref={(el) => { sectionRefs.current["tokens"] = el; }}
          data-section="tokens"
          style={{ marginBottom: "48px" }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "var(--text-xl-size)",
              color: "var(--text-primary)",
              marginBottom: "16px",
            }}
          >
            Design Tokens
          </h2>
          <Divider spacing={8} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "16px", marginBottom: "32px" }}>
            {[
              ["--bg-base", "#07090F"],
              ["--bg-surface", "#0C1018"],
              ["--bg-card", "#111622"],
              ["--bg-elevated", "#161D2E"],
              ["--accent", "#2D7FE8"],
              ["--green", "#22C787"],
              ["--amber", "#F5A623"],
              ["--red", "#E84040"],
              ["--text-primary", "#EEF2FF"],
              ["--text-muted", "#3D4B5E"],
            ].map(([token, hex]) => (
              <div key={token}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "var(--r-md)",
                    background: `var(${token})`,
                    border: "1px dashed var(--border-subtle)",
                  }}
                />
                <div style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-2xs-size)", color: "var(--text-muted)", marginTop: "4px" }}>{token}</div>
                <div style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs-size)", color: "var(--text-primary)" }}>{hex}</div>
              </div>
            ))}
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-md-size)", marginBottom: "12px" }}>Typography scale</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
            {(["--text-2xs", "--text-xs", "--text-sm", "--text-base", "--text-md", "--text-lg", "--text-xl", "--text-2xl"] as const).map((size) => (
              <div key={size} style={{ display: "flex", gap: "24px", alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-2xs-size)", color: "var(--text-muted)", width: 80 }}>{size}</span>
                <span style={{ fontFamily: "var(--font-data)", fontSize: `${size === "--text-2xs" ? "10" : size === "--text-xs" ? "11" : size === "--text-sm" ? "12" : size === "--text-base" ? "13" : size === "--text-md" ? "14" : size === "--text-lg" ? "16" : size === "--text-xl" ? "18" : "22"}px` }}>The quick brown fox</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: `${size === "--text-2xs" ? "10" : size === "--text-xs" ? "11" : size === "--text-sm" ? "12" : size === "--text-base" ? "13" : size === "--text-md" ? "14" : size === "--text-lg" ? "16" : size === "--text-xl" ? "18" : "22"}px` }}>The quick brown fox</span>
              </div>
            ))}
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-md-size)", marginBottom: "12px" }}>Spacing</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "flex-end" }}>
            {[4, 8, 12, 16, 24, 32, 48, 64].map((px) => (
              <div key={px} style={{ textAlign: "center" }}>
                <div style={{ width: px, height: 24, background: "var(--accent)", borderRadius: "var(--r-sm)", marginBottom: "4px" }} />
                <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-2xs-size)", color: "var(--text-muted)" }}>{px}px</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Primitives */}
        <div
          ref={(el) => { sectionRefs.current["primitives"] = el; }}
          data-section="primitives"
          style={{ marginBottom: "48px" }}
        >
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl-size)", color: "var(--text-primary)", marginBottom: "8px" }}>01 – 10 · Primitives</h2>
          <Divider spacing={16} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
            <StatCard key={statKey} label="Impressions" value="24,819" delta={18.3} deltaLabel="vs last month" trend={[12, 14, 18, 22, 20, 24]} />
            <StatCard label="Engagements" value="3,241" delta={-4.2} deltaLabel="vs last month" />
            <StatCard label="Followers" value="12.5K" loading />
            <StatCard label="Reach" value="18,200" />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
            <DeltaBadge value={18.3} size="md" />
            <DeltaBadge value={-4.2} size="md" />
            <DeltaBadge value={0} size="md" />
            <DeltaBadge value={12.1} size="sm" />
            <DeltaBadge value={-2} size="sm" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
            <DataCard title="Card with badge" badge={<Badge label="Active" variant="green" size="sm" />} action={<IconButton icon={<Settings size={14} />} onClick={() => {}} size="sm" />} description="Optional description text.">Body content</DataCard>
            <DataCard title="No padding" noPadding hover><div style={{ padding: "16px", fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", color: "var(--text-muted)" }}>Table or chart goes here</div></DataCard>
            <DataCard title="Loading" loading>Hidden</DataCard>
          </div>
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-md-size)", marginBottom: "12px" }}>SkeletonBlock</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: 400 }}>
              <SkeletonBlock height={16} />
              <SkeletonBlock height={8} width="80%" />
              <SkeletonBlock height={32} width="60%" />
              <SkeletonBlock height={48} />
              <SkeletonBlock lines={3} lineSpacing={10} height={14} />
              <SkeletonBlock height={120} width="100%" radius="var(--r-md)" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 320px)", gap: "16px", marginBottom: "24px" }}>
            <div style={{ height: 200, border: "1px dashed var(--border-subtle)", borderRadius: "var(--r-md)", overflow: "hidden" }}><EmptyState variant="zero-capture" /></div>
            <div style={{ height: 200, border: "1px dashed var(--border-subtle)", borderRadius: "var(--r-md)", overflow: "hidden" }}><EmptyState variant="one-capture" /></div>
            <div style={{ height: 200, border: "1px dashed var(--border-subtle)", borderRadius: "var(--r-md)", overflow: "hidden" }}><EmptyState variant="filtered-empty" /></div>
            <div style={{ height: 200, border: "1px dashed var(--border-subtle)", borderRadius: "var(--r-md)", overflow: "hidden" }}><EmptyState variant="error" action={{ label: "Retry", onClick: () => {} }} /></div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
            <Badge label="accent" variant="accent" />
            <Badge label="green" variant="green" dot />
            <Badge label="amber" variant="amber" dot pulse />
            <Badge label="red" variant="red" />
            <Badge label="neutral" variant="neutral" />
            <Badge label="outline" variant="outline" />
            <Badge label="sm" variant="accent" size="sm" />
            <Badge label="with dot" variant="green" size="md" dot />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <Divider spacing={12} />
            <Divider label="OR" spacing={12} />
            <Divider label="SECTION BREAK" spacing={12} strength="strong" />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
            <Avatar name="Alice Smith" size="sm" />
            <Avatar name="Bob Jones" size="md" />
            <Avatar name="Carol White" size="lg" />
            <Avatar name="David Brown" size="md" status="online" />
            <Avatar name="Eve Davis" size="md" status="away" />
            <Avatar name="Frank Wilson" size="md" status="offline" />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
            <IconButton icon={<Settings size={16} />} onClick={() => {}} variant="ghost" />
            <IconButton icon={<RefreshCw size={16} />} onClick={() => {}} variant="outline" />
            <IconButton icon={<Bell size={16} />} onClick={() => {}} variant="filled" />
            <IconButton icon={<Settings size={14} />} onClick={() => {}} size="sm" />
            <IconButton icon={<Settings size={16} />} onClick={() => {}} disabled />
            <Tooltip content="Short tooltip" side="top"><button type="button" style={{ padding: "8px 12px", background: "var(--bg-card)", border: "1px dashed var(--border-subtle)", borderRadius: "var(--r-md)", color: "var(--text-primary)", cursor: "pointer" }}>Hover top</button></Tooltip>
            <Tooltip content="Longer tooltip text that might wrap onto two lines for demonstration." side="bottom"><button type="button" style={{ padding: "8px 12px", background: "var(--bg-card)", border: "1px dashed var(--border-subtle)", borderRadius: "var(--r-md)", color: "var(--text-primary)", cursor: "pointer" }}>Hover bottom</button></Tooltip>
          </div>
        </div>

        {/* Section 3: Data Display */}
        <div
          ref={(el) => { sectionRefs.current["data"] = el; }}
          data-section="data"
          style={{ marginBottom: "48px" }}
        >
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl-size)", color: "var(--text-primary)", marginBottom: "8px" }}>11 – 18 · Data Display</h2>
          <Divider spacing={16} />
          <div style={{ marginBottom: "24px" }}>
          <DataCard title="MetricRow">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { label: "Impressions", value: 24819, displayValue: "24,819", max: 30000, pct: 68, color: "var(--chart-impressions)" },
                { label: "Engagements", value: 3241, displayValue: "3,241", max: 30000, pct: 23, color: "var(--chart-engagements)" },
                { label: "Reposts", value: 847, displayValue: "847", max: 30000, pct: 8, color: "var(--chart-reposts)" },
                { label: "Comments", value: 612, displayValue: "612", max: 30000, pct: 6, color: "var(--chart-saves)" },
                { label: "Reactions", value: 1782, displayValue: "1,782", max: 30000, pct: 15, color: "var(--accent)" },
              ].map((row, i) => (
                <MetricRow key={`${staggerKey}-${i}`} index={i} label={row.label} value={row.value} displayValue={row.displayValue} maxValue={row.max} percentage={row.pct} color={row.color} rank={i + 1} />
              ))}
            </div>
          </DataCard>
          </div>
          <div style={{ marginBottom: "24px" }}>
          <DataCard title="TrendChart">
            <TrendChart key={chartKey} data={MOCK_TREND_DATA} metrics={MOCK_METRICS} height={240} showLegend />
          </DataCard>
          </div>
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-md-size)", marginBottom: "12px" }}>SparkLine</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
              {[[12, 14, 18, 22, 26, 30], [30, 26, 22, 18, 14, 10], [10, 25, 8, 28, 5, 22], [15, 15, 15, 15, 15, 15], [20, 8, 12, 6, 18, 24], [5, 8, 12, 18, 28, 42]].map((data, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <SparkLine data={data} />
                  <div style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-2xs-size)", color: "var(--text-muted)", marginTop: "4px" }}>Shape {i + 1}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: "24px" }}>
            <DonutChart data={MOCK_DONUT_DATA} centerLabel="Total" centerValue="100%" size={160} />
          </div>
          <DataCard title="BarChart">
            <BarChart data={MOCK_BAR_DATA} height={120} showValues showPercent />
          </DataCard>
          </div>
          <div style={{ marginBottom: "24px" }}>
          <DataCard title="TopPostsTable">
            <TopPostsTable posts={MOCK_POSTS} sortBy="impressions" limit={5} />
          </DataCard>
          </div>
          <div style={{ marginBottom: "24px" }}>
          <DataCard title="Loading table">
            <TopPostsTable posts={[]} loading limit={5} />
          </DataCard>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            <InsightCallout type="growth" text="Impressions grew 34% this session — driven by 2 high-reach text posts." />
            <InsightCallout type="warning" text="Engagement rate dropped to 3.1% — below your 30-day average of 4.8%." />
            <InsightCallout type="info" text="Network growth is stable. 47 new followers added in this session." />
            <InsightCallout type="achievement" text="Your best-ever session for reposts — 47% above previous peak." />
          </div>
          <div style={{ marginBottom: "24px" }}>
          <DataCard title="ViewerRow">
            <ViewerRow name="Sarah Chen" headline="Head of Product at Acme" date="2 days ago" isNew />
            <ViewerRow name="Mike Johnson" headline="CTO · Beta Inc" date="5 days ago" />
            <ViewerRow name="Emma Wilson" company="Gamma LLC" date="1 week ago" />
            <ViewerRow name="James Lee" headline="Data Engineer" date="1 week ago" isNew />
            <ViewerRow name="Anna Brown" headline="Marketing Director" date="2 weeks ago" />
          </DataCard>
          </div>
        </div>

        {/* Section 4: Status & Operational */}
        <div
          ref={(el) => { sectionRefs.current["status"] = el; }}
          data-section="status"
          style={{ marginBottom: "48px" }}
        >
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl-size)", color: "var(--text-primary)", marginBottom: "8px" }}>19 – 23 · Status & Operational</h2>
          <Divider spacing={16} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
            <FreshnessIndicator status="fresh" label="Profile" lastCapture="2026-03-12" />
            <FreshnessIndicator status="due" label="Posts" />
            <FreshnessIndicator status="overdue" label="Network" daysUntilDue={3} />
            <FreshnessIndicator status="fresh" label="Profile" lastCapture="2026-03-12" compact />
            <FreshnessIndicator status="due" label="Posts" compact />
            <FreshnessIndicator status="overdue" label="Network" compact />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
            <CaptureBadge pageType="Posts" status="captured" captureDate="2026-03-14" />
            <CaptureBadge pageType="About" status="pending" />
            <CaptureBadge pageType="Network" status="stale" captureDate="2026-02-28" />
            <CaptureBadge pageType="Experience" status="missing" />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
            <SessionBadge sessionNumber={5} date="2026-03-14" captureCount={6} isLatest />
            <SessionBadge sessionNumber={4} date="2026-02-28" captureCount={5} />
            <SessionBadge sessionNumber={3} date="2026-02-14" captureCount={4} />
          </div>
          <div style={{ marginBottom: "24px" }}>
          <DataCard title="CaptureHealthGrid">
            <CaptureHealthGrid sessions={MOCK_SESSIONS} pageTypes={["Posts", "About", "Network", "Viewers", "Experience"]} data={MOCK_MATRIX} />
          </DataCard>
          </div>
          <div style={{ marginBottom: "24px" }}>
          <DataCard title="CaptureHealthGrid loading">
            <CaptureHealthGrid sessions={MOCK_SESSIONS} pageTypes={["Posts", "About", "Network"]} data={{}} loading />
          </DataCard>
          </div>
          <div style={{ marginBottom: "24px" }}>
          <DataCard title="SessionTimeline">
            <SessionTimeline sessions={MOCK_TIMELINE} activeId="6" />
          </DataCard>
          </div>
        </div>

        {/* Section 5: Navigation & Layout */}
        <div
          ref={(el) => { sectionRefs.current["layout"] = el; }}
          data-section="layout"
          style={{ marginBottom: "48px" }}
        >
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl-size)", color: "var(--text-primary)", marginBottom: "8px" }}>24 – 28 · Navigation & Layout</h2>
          <Divider spacing={16} />
          <div style={{ marginBottom: "24px" }}>
            <TabBar tabs={[{ id: "overview", label: "Overview" }, { id: "posts", label: "Posts" }, { id: "network", label: "Network" }, { id: "viewers", label: "Viewers" }]} activeId="posts" onChange={() => {}} variant="underline" />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <TabBar tabs={[{ id: "7d", label: "7D" }, { id: "30d", label: "30D" }, { id: "90d", label: "90D" }]} activeId="30d" onChange={() => {}} variant="pill" />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <TabBar tabs={[{ id: "c", label: "Captures", badge: "3" }]} activeId="c" onChange={() => {}} variant="pill" />
          </div>
          <div style={{ width: 220, height: 500, border: "1px dashed var(--border-subtle)", borderRadius: "var(--r-md)", overflow: "hidden", marginBottom: "24px" }}>
            <Sidebar client={MOCK_CLIENT} clients={MOCK_CLIENTS} onClientChange={() => {}} activeRoute="/posts" captureHealth={[{ label: "Profile", status: "fresh" }, { label: "Posts", status: "due" }, { label: "Network", status: "overdue" }]} />
          </div>
          <div style={{ background: "var(--bg-surface)", border: "1px dashed var(--border-subtle)", borderRadius: "var(--r-md)", overflow: "hidden", marginBottom: "24px" }}>
            <Header clientName="Acme Corp" lastCapture="2026-03-14" freshness={[{ label: "Profile", status: "fresh" }, { label: "Posts", status: "fresh" }, { label: "Network", status: "fresh" }]} />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs-size)", color: "var(--text-muted)", marginBottom: "8px" }}>FreshnessStrip — all fresh</p>
            <FreshnessStrip items={[{ label: "Profile", status: "fresh" }, { label: "Posts", status: "fresh" }, { label: "Network", status: "fresh" }]} />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs-size)", color: "var(--text-muted)", marginBottom: "8px" }}>FreshnessStrip — mixed</p>
            <FreshnessStrip items={[{ label: "Profile", status: "fresh", lastCapture: "2026-03-14" }, { label: "Posts", status: "due" }, { label: "Network", status: "overdue" }]} />
          </div>
        </div>

        {/* Section 6: Forms & Interaction */}
        <div
          ref={(el) => { sectionRefs.current["forms"] = el; }}
          data-section="forms"
          style={{ marginBottom: "48px" }}
        >
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl-size)", color: "var(--text-primary)", marginBottom: "8px" }}>29 – 30 · Forms & Interaction</h2>
          <Divider spacing={16} />
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs-size)", color: "var(--text-muted)", marginBottom: "8px" }}>ClientSwitcher</p>
            <div style={{ maxWidth: 260 }}>
              <ClientSwitcher current={MOCK_CLIENT} clients={MOCK_CLIENTS} onChange={() => {}} />
            </div>
          </div>
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs-size)", color: "var(--text-muted)", marginBottom: "8px" }}>DropdownSelect</p>
            <div style={{ maxWidth: 260 }}>
              <DropdownSelect
                ariaLabel="DropdownSelect demo"
                value={dropdownSelectValue}
                onChange={(v) => setDropdownSelectValue(v)}
                options={[
                  { value: "any", label: "Any" },
                  { value: "success", label: "Success" },
                  { value: "failed", label: "Failed" },
                ]}
              />
            </div>
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs-size)", color: "var(--text-muted)", marginBottom: "8px" }}>SortButton</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              <SortButton active direction="asc" onClick={() => {}}>Impressions</SortButton>
              <SortButton active direction="desc" onClick={() => {}}>Engagements</SortButton>
              <SortButton active={false} direction="desc" onClick={() => {}}>Comments</SortButton>
              <SortButton active={false} direction="asc" onClick={() => {}}>ER</SortButton>
              <SortButton active={false} direction="desc" onClick={() => {}}>Date</SortButton>
            </div>
          </div>
        </div>

        {/* Section 7: Motion */}
        <div
          ref={(el) => { sectionRefs.current["motion"] = el; }}
          data-section="motion"
          style={{ marginBottom: "48px" }}
        >
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl-size)", color: "var(--text-primary)", marginBottom: "8px" }}>Motion & Animation</h2>
          <Divider spacing={16} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            <DataCard title="StatCard animation">
              <div>
              <StatCard key={statKey} label="Impressions" value="24,819" delta={18.3} trend={[12, 14, 18, 22, 20, 24]} />
              <button type="button" onClick={() => debouncedTrigger(() => setStatKey((k) => k + 1))} style={{ marginTop: "12px", padding: "8px 12px", background: "var(--accent-dim)", border: "1px dashed var(--accent)", borderRadius: "var(--r-md)", color: "var(--accent)", fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", cursor: "pointer" }}>Trigger StatCard animation</button>
              </div>
            </DataCard>
            <DataCard title="Chart redraw">
              <div>
              <TrendChart key={chartKey} data={MOCK_TREND_DATA} metrics={MOCK_METRICS} height={160} showLegend={false} />
              <button type="button" onClick={() => debouncedTrigger(() => setChartKey((k) => k + 1))} style={{ marginTop: "12px", padding: "8px 12px", background: "var(--accent-dim)", border: "1px dashed var(--accent)", borderRadius: "var(--r-md)", color: "var(--accent)", fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", cursor: "pointer" }}>Trigger chart redraw</button>
              </div>
            </DataCard>
            <DataCard title="Stagger">
              <div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[1, 2, 3].map((i) => (
                  <MetricRow key={`${staggerKey}-${i}`} index={i - 1} label={`Row ${i}`} value={i * 10} displayValue={String(i * 10)} maxValue={30} percentage={i * 33} />
                ))}
              </div>
              <button type="button" onClick={() => debouncedTrigger(() => setStaggerKey((k) => k + 1))} style={{ marginTop: "12px", padding: "8px 12px", background: "var(--accent-dim)", border: "1px dashed var(--accent)", borderRadius: "var(--r-md)", color: "var(--accent)", fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", cursor: "pointer" }}>Trigger stagger</button>
              </div>
            </DataCard>
          </div>
        </div>
    </PageShell>
  );
}
