import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
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

export async function proxy(request: NextRequest) {
  const to = redirectMap.get(decodePath(request.nextUrl.pathname));
  if (to) {
    return NextResponse.redirect(new URL(to, request.url), 308);
  }
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return adminAuth(request);
  }
}

// ต่ออายุ Supabase session + กันคนไม่ได้ล็อกอินเข้า /admin
async function adminAuth(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return; // ยังไม่ตั้งค่า Supabase — หน้า login จะแจ้งเอง

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLogin = request.nextUrl.pathname === "/admin/login";
  if (!user && !isLogin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (user && isLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
