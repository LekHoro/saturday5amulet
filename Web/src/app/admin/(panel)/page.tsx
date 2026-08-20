import { Suspense } from "react";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { coverImage } from "@/lib/media";
import type { Category, EnContent } from "@/lib/data";
import QuickSoldOut, { type QuickProduct } from "./QuickSoldOut";
import StorageCard from "./StorageCard";

// อ่านตรงจาก Supabase เสมอ — หน้าหลักต้องเห็นสถานะล่าสุดเหมือนหน้าลิสต์
export const dynamic = "force-dynamic";

/** เวลาแบบพูดง่าย ๆ สำหรับรายการแก้ไขล่าสุด */
function timeAgo(iso: string, now: number): string {
  const diff = now - Date.parse(iso);
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "เมื่อสักครู่";
  if (min < 60) return `${min} นาทีที่แล้ว`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ชม.ที่แล้ว`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "เมื่อวาน";
  if (day < 30) return `${day} วันก่อน`;
  return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
}

export default async function AdminHome() {
  // หน้านี้ force-dynamic — render ใหม่ทุกคำขอ ใช้เวลา ณ ตอนโหลดหน้าได้
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const sb = await createSupabaseServer();
  const [{ data: productRows }, { data: articleRows }, { data: masterRows }, { data: ceremonyRow }] =
    await Promise.all([
      sb
        .from("products")
        .select("id,title,sku,sold_out,visible,images,categories,en,updated_at")
        .order("updated_at", { ascending: false })
        .limit(5000),
      sb
        .from("articles")
        .select("id,title,views,updated_at")
        .order("updated_at", { ascending: false })
        .limit(5000),
      sb.from("masters").select("slug,name,updated_at"),
      sb.from("settings").select("value").eq("key", "next_ceremony").maybeSingle(),
    ]);

  const products = productRows ?? [];
  const articles = articleRows ?? [];
  const masters = masterRows ?? [];

  // ชื่อหมวดมาจากสินค้าจริงทั้งชุด — เกณฑ์ "ยังไม่จัดหมวด" เดียวกับหน้าวัตถุมงคล
  const catNames: Record<string, string> = {};
  for (const r of products)
    for (const c of (r.categories ?? []) as Category[]) catNames[c.id] = c.name;

  let soldOut = 0;
  let hidden = 0;
  let untagged = 0;
  let noEn = 0;
  for (const r of products) {
    if (r.sold_out) soldOut++;
    if (r.visible === false) hidden++;
    const known = ((r.categories ?? []) as Category[]).filter((c) => catNames[c.id]);
    if (known.length === 0) untagged++;
    const en = r.en as EnContent | null;
    if (!(en?.title?.trim() || en?.html?.trim())) noEn++;
  }
  const available = products.length - soldOut;

  // งานที่ระบบรู้อยู่แล้วว่าค้าง — ยกขึ้นมาบอก ไม่ต้องเข้าไปไล่หาเองในลิสต์
  const chores = [
    { label: "ซ่อนอยู่", count: hidden, filter: "hidden", tone: "text-ember ring-ember/40" },
    { label: "ยังไม่จัดหมวด", count: untagged, filter: "untagged", tone: "text-gold-light ring-gold/40" },
    { label: "ยังไม่มีคำแปล EN", count: noEn, filter: "no-en", tone: "text-gold-light ring-gold/40" },
  ].filter((c) => c.count > 0);

  // นับถอยหลังวันพิธี — เทียบวันที่แบบเวลาไทย (เซิร์ฟเวอร์เป็น UTC)
  const ceremony = (ceremonyRow?.value ?? null) as { label: string; date: string } | null;
  let ceremonyDays: number | null = null;
  if (ceremony?.date) {
    const todayBkk = new Date(now + 7 * 3600_000).toISOString().slice(0, 10);
    ceremonyDays = Math.round((Date.parse(ceremony.date) - Date.parse(todayBkk)) / 86_400_000);
  }

  const quickProducts: QuickProduct[] = products
    .filter((r) => r.visible !== false)
    .map((r) => ({
      id: r.id,
      title: r.title,
      sku: r.sku,
      thumb: coverImage(r.images as string[] | null) ?? null,
      soldOut: !!r.sold_out,
    }));

  const topArticles = [...articles]
    .filter((a) => (a.views ?? 0) > 0)
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 3);

  const recent = [
    ...products.slice(0, 5).map((r) => ({
      href: `/admin/products/${r.id}`,
      title: r.title,
      what: "วัตถุมงคล",
      at: r.updated_at as string,
    })),
    ...articles.slice(0, 5).map((r) => ({
      href: `/admin/articles/${r.id}`,
      title: r.title,
      what: "บทความ",
      at: r.updated_at as string,
    })),
    ...masters.map((r) => ({
      href: `/admin/masters/${r.slug}`,
      title: r.name,
      what: "อาจารย์",
      at: r.updated_at as string,
    })),
  ]
    .filter((r) => r.at)
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, 5);

  const stats = [
    { label: "พร้อมบูชา", value: available, tone: "text-gold", href: "/admin/products" },
    { label: "หมดแล้ว", value: soldOut, tone: "text-smoke", href: "/admin/products?filter=sold-out" },
    { label: "บทความ/ข่าว", value: articles.length, tone: "text-ivory", href: "/admin/articles" },
  ];

  const shortcuts = [
    { href: "/admin/articles/new", label: "＋ เขียนบทความใหม่" },
    { href: "/admin/products", label: "จัดการวัตถุมงคล" },
    { href: "/admin/articles", label: "จัดการบทความ / ข่าว" },
    { href: "/admin/masters", label: "จัดการอาจารย์" },
    { href: "/admin/settings/home", label: "จัดบล็อกหน้าแรก" },
  ];

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-gold">ภาพรวมร้าน</h1>

      {/* วันพิธีคือจังหวะของทั้งร้าน — ปักไว้บนสุด พร้อมเตือนถ้าตั้งค้างจนเลยวัน */}
      {ceremony && ceremonyDays !== null && (
        <Link
          href="/admin/settings"
          className={`mt-4 flex items-center justify-between gap-3 rounded-2xl border p-4 transition ${
            ceremonyDays < 0
              ? "border-ember/50 bg-ember/10 hover:border-ember"
              : "border-gold/30 bg-night-soft hover:border-gold"
          }`}
        >
          <span className="min-w-0">
            <span className="font-heading block truncate font-semibold text-gold-light">
              {ceremony.label}
            </span>
            <span className={`mt-0.5 block text-sm ${ceremonyDays < 0 ? "text-ember" : "text-smoke"}`}>
              {ceremonyDays > 0
                ? `อีก ${ceremonyDays} วัน`
                : ceremonyDays === 0
                  ? "วันนี้ 🙏"
                  : `ผ่านมาแล้ว ${-ceremonyDays} วัน — แตะเพื่ออัปเดตหรือลบบล็อกนับถอยหลัง`}
            </span>
          </span>
          <span className="shrink-0 text-smoke">›</span>
        </Link>
      )}

      {/* งานที่ค้างอยู่ — ระบบนับให้แล้ว แตะแล้วเปิดลิสต์ที่กรองให้เสร็จ */}
      <div className="mt-4">
        {chores.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-smoke">งานที่ค้างอยู่:</span>
            {chores.map((c) => (
              <Link
                key={c.filter}
                href={`/admin/products?filter=${c.filter}`}
                className={`rounded-full bg-night-soft px-3 py-1.5 text-xs font-semibold ring-1 transition hover:brightness-125 ${c.tone}`}
              >
                {c.label} {c.count}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-smoke">งานค้างเรียบร้อยหมดแล้ว 🙏</p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 lg:gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-gold/25 bg-night-soft p-4 text-center transition hover:border-gold"
          >
            <div className={`text-2xl font-bold ${s.tone}`}>{s.value}</div>
            <div className="mt-1 text-xs text-smoke">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <QuickSoldOut products={quickProducts} />

        <div className="grid content-start gap-3">
          <Link
            href="/admin/products/new"
            className="block rounded-2xl bg-gold p-4 text-center font-bold text-night shadow transition hover:brightness-110"
          >
            ＋ เพิ่มวัตถุมงคลใหม่
          </Link>
          <div className="grid grid-cols-2 gap-3">
            {shortcuts.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="block rounded-2xl border border-gold/30 bg-night-soft p-3.5 text-center text-sm font-semibold text-gold-light transition hover:border-gold"
              >
                {s.label}
              </Link>
            ))}
            <a
              href="https://manager.line.biz"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border border-gold/20 p-3.5 text-center text-sm text-smoke transition hover:border-gold/50 hover:text-gold-light"
            >
              LINE OA (@sat589) ↗
            </a>
          </div>
          <Link
            href="/"
            target="_blank"
            className="block rounded-2xl border border-gold/20 p-3.5 text-center text-sm text-smoke transition hover:border-gold/50 hover:text-gold-light"
          >
            เปิดดูหน้าเว็บจริง ↗
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-gold/20 bg-night-soft p-4">
          <h2 className="font-heading text-sm font-semibold text-gold-light">บทความยอดนิยม</h2>
          {topArticles.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {topArticles.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/admin/articles/${a.id}`}
                    className="flex items-baseline justify-between gap-3 rounded-xl bg-night px-3 py-2 transition hover:bg-gold/10"
                  >
                    <span className="line-clamp-1 min-w-0 text-sm">{a.title}</span>
                    <span className="shrink-0 text-xs text-smoke">
                      {(a.views ?? 0).toLocaleString("th-TH")} วิว
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-smoke">ยังไม่มียอดอ่าน — ลองแชร์บทความลง LINE/เฟซดู</p>
          )}
        </section>

        <section className="rounded-2xl border border-gold/20 bg-night-soft p-4">
          <h2 className="font-heading text-sm font-semibold text-gold-light">แก้ไขล่าสุด</h2>
          {recent.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {recent.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="flex items-baseline justify-between gap-3 rounded-xl bg-night px-3 py-2 transition hover:bg-gold/10"
                  >
                    <span className="line-clamp-1 min-w-0 text-sm">
                      <span className="text-xs text-smoke">{r.what} · </span>
                      {r.title}
                    </span>
                    <span className="shrink-0 text-xs text-smoke">{timeAgo(r.at, now)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-smoke">ยังไม่มีประวัติการแก้ไข</p>
          )}
        </section>
      </div>

      {/* อ่านรายชื่อไฟล์ทั้งคลัง — สตรีมมาทีหลัง หน้าไม่ต้องรอ */}
      <div className="mt-4">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-gold/20 bg-night-soft p-4">
              <p className="text-xs text-smoke">กำลังนับพื้นที่รูปในคลัง...</p>
            </div>
          }
        >
          <StorageCard />
        </Suspense>
      </div>
    </div>
  );
}
