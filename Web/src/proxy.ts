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

// ลิงก์เว็บเดิม (igetweb) มีทั้ง /th/... และไม่มี locale, id อาจมี -ชื่อเรื่อง ต่อท้าย
// เช่น /th/articles/300517-วิธีสื่อสารหรือสัมผัสกุมารทองด้วยตัวเอง
function legacyTarget(decoded: string): string | null {
  const noLocale = decoded.replace(/^\/(?:th|en)(?=\/)/, "");
  if (noLocale !== decoded) {
    const hit = redirectMap.get(noLocale);
    if (hit) return hit;
  }
  const m = noLocale.match(/^\/(articles|news|products|galleries|pages)\/(\d+)(?:-.*)?$/);
  if (!m) return null;
  const [, kind, id] = m;
  const exact = redirectMap.get(`/${kind}/${id}`);
  if (exact) return exact;
  switch (kind) {
    case "articles":
    case "news": // หน้า /articles/[id] เสิร์ฟทั้งบทความและข่าว
      return `/articles/${id}`;
    case "products":
      return `/products/${id}`;
    case "galleries":
      return `/gallery/${id}`;
    default:
      return null; // pages ที่ไม่อยู่ใน map — ไม่รู้ปลายทาง ปล่อย 404
  }
}

export async function proxy(request: NextRequest) {
  const decoded = decodePath(request.nextUrl.pathname);
  const to = redirectMap.get(decoded) ?? legacyTarget(decoded);
  if (to && to !== decoded) {
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
