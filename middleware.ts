import { NextRequest, NextResponse } from "next/server";

const PUBLIC_AUTH_ROUTES = new Set(["/", "/login"]);

function hasSessionCookie(req: NextRequest): boolean {
  const access = req.cookies.get("la_access_token")?.value;

  // Keep multiple refresh cookie names for backend compatibility.
  const refresh =
    req.cookies.get("la_refresh_token")?.value ||
    req.cookies.get("refreshToken")?.value ||
    req.cookies.get("refresh_token")?.value;

  return Boolean(access || refresh);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!PUBLIC_AUTH_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  if (hasSessionCookie(req)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login"],
};

