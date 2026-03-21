/** Static segments under `/dashboard/*` that are not a client workspace id */
const RESERVED_DASHBOARD_SEGMENTS = new Set(["managers", "clients"]);

/**
 * When pathname is `/dashboard/:id/...` and `:id` is not a reserved segment, returns that id (e.g. `nishb`, `cli_abc`).
 * Otherwise `null` (e.g. `/dashboard`, `/dashboard/clients`, `/dashboard/managers`).
 */
export function getClientWorkspaceIdFromPath(pathname: string): string | null {
  if (!pathname.startsWith("/dashboard/")) return null;
  const segment = pathname.split("/")[2];
  if (!segment || RESERVED_DASHBOARD_SEGMENTS.has(segment)) return null;
  return segment;
}

/**
 * Active state for sidebar links: client overview `/dashboard/:clientId` must not stay active on `/captures` etc.
 */
export function isSidebarPathActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/dashboard") return false;

  const oneSegment = /^\/dashboard\/([^/]+)$/.exec(href);
  if (oneSegment) {
    const seg = oneSegment[1];
    if (seg && !RESERVED_DASHBOARD_SEGMENTS.has(seg)) {
      return false;
    }
  }

  return pathname.startsWith(`${href}/`) || (href !== "/dashboard" && pathname.startsWith(href));
}
