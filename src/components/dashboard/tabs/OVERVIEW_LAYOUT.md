# Overview Tab — Layout Replan

Based on the home endpoint response shape and mapped data (`MappedHomeData`), this layout optimizes for scanability and logical grouping while using only the existing component library and API wrapper.

## Data available (from mapper)

- **Identity:** `profile` (name, headline, location, company), `clientId` fallback
- **Capture health:** `lastCapturedAt`, `freshnessMap`, `captureCount`
- **Performance:** `impressions7d/28d/90d`, `engagements7d/28d/90d`, `membersReached*`, `linkClicks28d/90d`, `engagementsSplit*`
- **Audience:** `followers`, `audienceInsights` (experience, location, industry)
- **Discovery:** `search` (totalAppearances, topTitles, topCompanies, foundFor)
- **Content:** `topPosts` (from impressions 28d)
- **Optional:** `profileViews`, `viewers`

## Layout structure

1. **Header strip (one row)**  
   Left: Client name + optional headline + “Last captured …” (with stale styling).  
   Right: Freshness summary (Overdue / Fresh / Not captured pills + ghost “View all” → modal).  
   Keeps capture health visible without extra vertical space.

2. **Key metrics row (hero numbers)**  
   Four `StatCard`s in one row: **Impressions 28d**, **Engagements 28d**, **Followers**, **Link clicks** (with “X over 90 days” subline).  
   Responsive: 2 cols on small screens, 4 on larger.  
   Gives the main story at a glance; 7d/90d stay in the next section.

3. **Two-column main (lg+)**  
   - **Left column (~2/5):**  
     - **Members reached** — 7d vs 28d vs 90d bars + members reached.  
     - **Engagement breakdown** — Donut + 7d/28d/90d toggle + link clicks line.  
   - **Right column (~3/5):**  
     - **Top posts** — Table, sortable.  
   Groups “performance” (impressions + engagement) on the left and “content” (top posts) on the right.

4. **Audience & discovery row**  
   Two `DataCard`s side by side (1:1 on lg):  
   - **Audience** — Followers + experience/location/industry rows + InsightCallout.  
   - **Who’s finding you** — Search stats + ranked lists + InsightCallout.

5. **Optional**  
   Profile views / Viewers can be added later as a small card or row when that data is prioritized.

## Component usage (unchanged)

- **StatCard**, **DeltaBadge**, **DataCard**, **MetricRow**, **DonutChart**, **FreshnessTable** (modal), **EmptyState**, **CaptureBadge**, **InsightCallout**, **SkeletonBlock**, **Tooltip**, **SortButton**
- All motion from `lib/animations.ts`
- All data from `MappedHomeData`; no new API calls or mapper changes.

## Rationale

- **Hero row:** One row of four numbers answers “how is this profile doing?” before charts.
- **Two-column main:** Window comparison + engagement donut are both performance; top posts is dense and gets the wider column.
- **Audience + search last:** “Who is the audience?” and “Who’s finding you?” are discovery; same row keeps the tab from growing too long and groups by theme.
