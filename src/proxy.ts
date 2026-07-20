import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import legacyRedirects from "@/data/legacy-redirects.json";

// Exact-match lookup (decoded) rather than next.config.js `redirects()` — many old
// Igetweb paths contain characters (+, (, ), Thai UTF-8) that would need fragile
// path-to-regexp escaping if matched as patterns.
function decodePath(pathname: string): string {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

const redirectMap = new Map(
  legacyRedirects.map((r) => [decodePath(r.from), r.to])
);

export function proxy(request: NextRequest) {
  const to = redirectMap.get(decodePath(request.nextUrl.pathname));
  if (to) {
    return NextResponse.redirect(new URL(to, request.url), 308);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
