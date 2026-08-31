import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { coverImage } from "@/lib/media";
import {
  bkkDate,
  gaReport,
  gscQuery,
  reportsConfigured,
  GSC_SITE,
  type GscRow,
} from "@/lib/google-report";

// หน้ารายงานต้องเป็นตัวเลขล่าสุดเสมอ (ตัว fetch ไป Google มี cache 1 ชม. ของมันเอง)
export const dynamic = "force-dynamic";

const nf = (n: number) => n.toLocaleString("th-TH");

/** ป้ายเทียบสัปดาห์ก่อน — บอกทั้งทิศทางและขนาด */
function Delta({ now, prev }: { now: number; prev: number }) {
  if (prev === 0) return null;
  const pct = Math.round(((now - prev) / prev) * 100);
  if (pct === 0) return <span className="text-xs text-smoke">เท่าสัปดาห์ก่อน</span>;
  return (
    <span className={`text-xs ${pct > 0 ? "text-gold-light" : "text-ember"}`}>
      {pct > 0 ? "▲" : "▼"} {Math.abs(pct)}% จากสัปดาห์ก่อน
    </span>
  );
}

/** ดึงเลขสินค้าจาก pagePath เช่น /products/546154-xxx หรือ /en/products/546154 */
function productIdFromPath(path: string): string | null {
  const m = path.match(/^(?:\/en)?\/products\/(\d+)/);
  return m ? m[1] : null;
}

type WeekTotals = { users: number; sessions: number; pageViews: number; lineClicks: number };

async function loadGaData() {
  const ranges = [
    { startDate: bkkDate(7), endDate: bkkDate(1) }, // 7 วันล่าสุด (ไม่นับวันนี้ — GA ยังนับไม่ครบ)
    { startDate: bkkDate(14), endDate: bkkDate(8) }, // 7 วันก่อนหน้า
  ];
  const lineFilter = {
    filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "line_click" } },
  };

  const [core, line, daily, prodViews, prodLines, channels] = await Promise.all([
    // ยอดรวมรายสัปดาห์ เทียบสองช่วง — GA แถม dimension dateRange มาให้เอง
    gaReport({
      dateRanges: ranges,
      metrics: [{ name: "totalUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
    }),
    gaReport({ dateRanges: ranges, metrics: [{ name: "eventCount" }], dimensionFilter: lineFilter }),
    // กราฟรายวัน 14 วัน
    gaReport({
      dateRanges: [{ startDate: bkkDate(14), endDate: bkkDate(1) }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    // top สินค้า 28 วัน: ยอดเปิดดูต่อหน้า + ยอดกด LINE ต่อหน้า
    gaReport({
      dateRanges: [{ startDate: bkkDate(28), endDate: bkkDate(1) }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: {
        filter: { fieldName: "pagePath", stringFilter: { matchType: "CONTAINS", value: "/products/" } },
      },
      limit: 250,
    }),
    gaReport({
      dateRanges: [{ startDate: bkkDate(28), endDate: bkkDate(1) }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: lineFilter,
      limit: 250,
    }),
    // คนมาจากช่องทางไหน — ไว้ตัดสินใจว่าจะลงแรงโปรโมทตรงไหน
    gaReport({
      dateRanges: [{ startDate: bkkDate(7), endDate: bkkDate(1) }],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 6,
    }),
  ]);

  // core/line: หลายช่วงเวลา → คอลัมน์แรกเป็น date_range_0/1
  const week: Record<string, WeekTotals> = {};
  for (const key of ["date_range_0", "date_range_1"]) {
    const c = core.find((r) => r[0] === key);
    const l = line.find((r) => r[0] === key);
    week[key] = {
      users: Number(c?.[1] ?? 0),
      sessions: Number(c?.[2] ?? 0),
      pageViews: Number(c?.[3] ?? 0),
      lineClicks: Number(l?.[1] ?? 0),
    };
  }

  // รวมเลขต่อสินค้า (ไทย+EN นับเป็นตัวเดียวกัน)
  const perProduct = new Map<string, { views: number; lineClicks: number }>();
  for (const [path, views] of prodViews) {
    const id = productIdFromPath(path);
    if (!id) continue;
    const p = perProduct.get(id) ?? { views: 0, lineClicks: 0 };
    p.views += Number(views);
    perProduct.set(id, p);
  }
  for (const [path, clicks] of prodLines) {
    const id = productIdFromPath(path);
    if (!id) continue;
    const p = perProduct.get(id) ?? { views: 0, lineClicks: 0 };
    p.lineClicks += Number(clicks);
    perProduct.set(id, p);
  }

  return {
    thisWeek: week.date_range_0,
    prevWeek: week.date_range_1,
    daily: daily.map(([date, sessions]) => ({ date, sessions: Number(sessions) })),
    perProduct,
    channels: channels.map(([name, sessions]) => ({ name, sessions: Number(sessions) })),
  };
}

async function loadGscData() {
  const range = { startDate: bkkDate(28), endDate: bkkDate(2) }; // GSC ข้อมูลช้า ~2 วัน
  const queries = await gscQuery({ ...range, dimensions: ["query"], rowLimit: 300 });
  return { queries };
}

/** ชื่อช่องทาง GA เป็นคำที่เจ้าของร้านอ่านรู้เรื่อง */
const CHANNEL_TH: Record<string, string> = {
  "Organic Search": "ค้นจาก Google",
  Direct: "พิมพ์เข้าตรง/บุ๊กมาร์ก",
  "Organic Social": "โซเชียล (เฟซ/ไลน์)",
  Referral: "ลิงก์จากเว็บอื่น",
  "Organic Video": "YouTube",
  Unassigned: "ไม่ทราบที่มา",
};

export default async function ReportsPage() {
  if (!reportsConfigured()) return <SetupGuide />;

  let ga: Awaited<ReturnType<typeof loadGaData>> | null = null;
  let gsc: Awaited<ReturnType<typeof loadGscData>> | null = null;
  let gaError: string | null = null;
  let gscError: string | null = null;
  const sb = await createSupabaseServer();

  await Promise.all([
    loadGaData().then(
      (d) => (ga = d),
      (e: unknown) => (gaError = e instanceof Error ? e.message : String(e))
    ),
    loadGscData().then(
      (d) => (gsc = d),
      (e: unknown) => (gscError = e instanceof Error ? e.message : String(e))
    ),
  ]);
  // TS มองไม่ออกว่า callback ข้างบนวิ่งก่อนบรรทัดนี้เสมอ
  ga = ga as Awaited<ReturnType<typeof loadGaData>> | null;
  gsc = gsc as Awaited<ReturnType<typeof loadGscData>> | null;

  // เติมชื่อ+รูปสินค้าจริงให้ top สินค้า
  let topProducts: {
    id: string;
    title: string;
    thumb: string | null;
    views: number;
    lineClicks: number;
  }[] = [];
  if (ga && ga.perProduct.size > 0) {
    const ids = [...ga.perProduct.keys()];
    const { data: rows } = await sb.from("products").select("id,title,images").in("id", ids);
    const byId = new Map((rows ?? []).map((r) => [String(r.id), r]));
    topProducts = ids
      .map((id) => {
        const stat = ga!.perProduct.get(id)!;
        const row = byId.get(id);
        return {
          id,
          title: row?.title ?? `สินค้า #${id}`,
          thumb: row ? (coverImage(row.images as string[] | null) ?? null) : null,
          ...stat,
        };
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }

  // คำค้น: top ตามยอดคลิก + "โอกาส" = อันดับ 4-20 คนเห็นเยอะแต่ยังไม่ติดบนสุด
  const topQueries: GscRow[] = (gsc?.queries ?? []).slice(0, 12);
  const opportunities: GscRow[] = (gsc?.queries ?? [])
    .filter((q) => q.position >= 4 && q.position <= 20 && q.impressions >= 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 8);

  const maxDaily = Math.max(1, ...(ga?.daily.map((d) => d.sessions) ?? [1]));

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-gold">รายงานเว็บ</h1>
      <p className="mt-1 text-xs text-smoke">
        ตัวเลขจาก Google Analytics + Search Console — ไม่นับวันนี้เพราะ Google ยังนับไม่ครบ
      </p>

      {gaError && (
        <p className="mt-4 rounded-2xl border border-ember/50 bg-ember/10 p-4 text-sm text-ember">
          ดึงข้อมูล Analytics ไม่สำเร็จ: {gaError}
        </p>
      )}

      {ga && (
        <>
          {/* สรุปสัปดาห์ (7 วันล่าสุด เทียบ 7 วันก่อนหน้า) */}
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {(
              [
                ["คนเข้าเว็บ", ga.thisWeek.users, ga.prevWeek.users, "text-ivory"],
                ["ครั้งที่เข้าชม", ga.thisWeek.sessions, ga.prevWeek.sessions, "text-ivory"],
                ["เปิดดูหน้า", ga.thisWeek.pageViews, ga.prevWeek.pageViews, "text-ivory"],
                ["กดปุ่ม LINE 💬", ga.thisWeek.lineClicks, ga.prevWeek.lineClicks, "text-gold"],
              ] as const
            ).map(([label, now, prev, tone]) => (
              <div key={label} className="rounded-2xl border border-gold/25 bg-night-soft p-4">
                <div className="text-xs text-smoke">{label} (7 วัน)</div>
                <div className={`mt-1 text-2xl font-bold ${tone}`}>{nf(now)}</div>
                <Delta now={now} prev={prev} />
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {/* กราฟแท่งรายวัน 14 วัน */}
            <section className="rounded-2xl border border-gold/20 bg-night-soft p-4">
              <h2 className="font-heading text-sm font-semibold text-gold-light">
                คนเข้าเว็บรายวัน (14 วัน)
              </h2>
              <div className="mt-3 flex h-28 items-end gap-1">
                {ga.daily.map((d) => (
                  <div key={d.date} className="group relative flex-1">
                    <div
                      className="rounded-t bg-gold/60 transition group-hover:bg-gold"
                      style={{ height: `${Math.max(4, (d.sessions / maxDaily) * 112)}px` }}
                    />
                    <div className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-night px-1.5 py-0.5 text-[10px] text-ivory ring-1 ring-gold/40 group-hover:block">
                      {d.date.slice(6)}/{d.date.slice(4, 6)}: {nf(d.sessions)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-smoke">
                <span>14 วันก่อน</span>
                <span>เมื่อวาน</span>
              </div>
            </section>

            {/* ช่องทางที่คนเข้ามา */}
            <section className="rounded-2xl border border-gold/20 bg-night-soft p-4">
              <h2 className="font-heading text-sm font-semibold text-gold-light">
                คนมาจากไหน (7 วัน)
              </h2>
              <ul className="mt-2 space-y-1.5">
                {ga.channels.map((c) => (
                  <li key={c.name} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0">{CHANNEL_TH[c.name] ?? c.name}</span>
                    <span className="shrink-0 text-xs text-smoke">{nf(c.sessions)} ครั้ง</span>
                  </li>
                ))}
                {ga.channels.length === 0 && (
                  <li className="text-sm text-smoke">ยังไม่มีข้อมูลช่วงนี้</li>
                )}
              </ul>
            </section>
          </div>

          {/* top สินค้า — วิว + กด LINE + อัตราปิดการทัก */}
          <section className="mt-4 rounded-2xl border border-gold/20 bg-night-soft p-4">
            <h2 className="font-heading text-sm font-semibold text-gold-light">
              วัตถุมงคลที่คนดูเยอะสุด (28 วัน)
            </h2>
            <p className="mt-1 text-xs text-smoke">
              ตัวไหน &ldquo;ดูเยอะแต่ทักน้อย&rdquo; ลองปรับรูปแรก/ราคา/คำอธิบายดู
            </p>
            {topProducts.length > 0 ? (
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead>
                    <tr className="text-left text-xs text-smoke">
                      <th className="py-1.5 font-normal">สินค้า</th>
                      <th className="py-1.5 text-right font-normal">เปิดดู</th>
                      <th className="py-1.5 text-right font-normal">กด LINE</th>
                      <th className="py-1.5 text-right font-normal">% ทัก</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p) => (
                      <tr key={p.id} className="border-t border-gold/10">
                        <td className="py-2 pr-3">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="flex min-w-0 items-center gap-2.5 transition hover:text-gold-light"
                          >
                            {p.thumb && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.thumb}
                                alt=""
                                className="h-9 w-9 shrink-0 rounded-lg object-cover"
                              />
                            )}
                            <span className="line-clamp-2 min-w-0">{p.title}</span>
                          </Link>
                        </td>
                        <td className="py-2 text-right tabular-nums">{nf(p.views)}</td>
                        <td className="py-2 text-right tabular-nums text-gold">
                          {nf(p.lineClicks)}
                        </td>
                        <td className="py-2 text-right tabular-nums text-xs text-smoke">
                          {p.views > 0 ? `${Math.round((p.lineClicks / p.views) * 100)}%` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-2 text-sm text-smoke">ยังไม่มีข้อมูลหน้าสินค้าในช่วงนี้</p>
            )}
          </section>
        </>
      )}

      {gscError && (
        <p className="mt-4 rounded-2xl border border-ember/50 bg-ember/10 p-4 text-sm text-ember">
          ดึงข้อมูล Search Console ไม่สำเร็จ: {gscError}
        </p>
      )}

      {gsc && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {/* คำค้นที่พาคนเข้ามา */}
          <section className="rounded-2xl border border-gold/20 bg-night-soft p-4">
            <h2 className="font-heading text-sm font-semibold text-gold-light">
              คำค้นใน Google ที่พาคนเข้าเว็บ (28 วัน)
            </h2>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[360px] text-sm">
                <thead>
                  <tr className="text-left text-xs text-smoke">
                    <th className="py-1.5 font-normal">คำค้น</th>
                    <th className="py-1.5 text-right font-normal">คลิก</th>
                    <th className="py-1.5 text-right font-normal">คนเห็น</th>
                    <th className="py-1.5 text-right font-normal">อันดับ</th>
                  </tr>
                </thead>
                <tbody>
                  {topQueries.map((q) => (
                    <tr key={q.keys[0]} className="border-t border-gold/10">
                      <td className="py-1.5 pr-3">{q.keys[0]}</td>
                      <td className="py-1.5 text-right tabular-nums">{nf(q.clicks)}</td>
                      <td className="py-1.5 text-right tabular-nums text-smoke">
                        {nf(q.impressions)}
                      </td>
                      <td className="py-1.5 text-right tabular-nums text-smoke">
                        {q.position.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                  {topQueries.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-2 text-smoke">
                        ยังไม่มีข้อมูลช่วงนี้
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* โอกาส SEO — เกือบติดหน้าแรกแล้ว */}
          <section className="rounded-2xl border border-gold/20 bg-night-soft p-4">
            <h2 className="font-heading text-sm font-semibold text-gold-light">
              โอกาสทำอันดับ 🎯 (อันดับ 4–20 แต่คนเห็นเยอะ)
            </h2>
            <p className="mt-1 text-xs text-smoke">
              เขียน/เสริมบทความด้วยคำพวกนี้ ดันขึ้นหน้าแรก Google ได้ไม่ยาก
            </p>
            <ul className="mt-2 space-y-1.5">
              {opportunities.map((q) => (
                <li
                  key={q.keys[0]}
                  className="flex items-baseline justify-between gap-3 rounded-xl bg-night px-3 py-2 text-sm"
                >
                  <span className="line-clamp-1 min-w-0">{q.keys[0]}</span>
                  <span className="shrink-0 text-xs text-smoke">
                    เห็น {nf(q.impressions)} · อันดับ {q.position.toFixed(0)}
                  </span>
                </li>
              ))}
              {opportunities.length === 0 && (
                <li className="text-sm text-smoke">ยังไม่มีคำที่เข้าเกณฑ์ในช่วงนี้</li>
              )}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}

/** ยังไม่ได้ตั้งค่า — บอกขั้นตอนให้ครบจบในหน้าเดียว */
function SetupGuide() {
  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-gold">รายงานเว็บ</h1>
      <div className="mt-4 rounded-2xl border border-gold/25 bg-night-soft p-5 text-sm leading-relaxed">
        <p className="font-semibold text-gold-light">ยังไม่ได้เชื่อมกับ Google — ตั้งค่าครั้งเดียวใช้ได้ตลอด</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-ivory">
          <li>
            เข้า{" "}
            <a
              href="https://console.cloud.google.com/iam-admin/serviceaccounts"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold underline"
            >
              Google Cloud Console
            </a>{" "}
            (ล็อกอินด้วย saturday5amulet@gmail.com) → สร้างโปรเจกต์ → สร้าง Service Account →
            สร้าง Key แบบ JSON แล้วดาวน์โหลดไฟล์
          </li>
          <li>
            เปิดใช้ API สองตัวในโปรเจกต์นั้น: <b>Google Analytics Data API</b> กับ{" "}
            <b>Google Search Console API</b>
          </li>
          <li>
            เอาอีเมลของ service account (ลงท้าย .iam.gserviceaccount.com) ไปเพิ่มเป็น{" "}
            <b>Viewer ใน GA4</b> (Admin → Property access management) และ{" "}
            <b>ผู้ใช้ใน Search Console</b> (Settings → Users and permissions)
          </li>
          <li>
            ใน Vercel → Settings → Environment Variables เพิ่ม:
            <ul className="mt-1 list-disc pl-5 text-smoke">
              <li>
                <code className="text-ivory">GOOGLE_SERVICE_ACCOUNT_JSON</code> = เนื้อไฟล์ JSON
                ทั้งไฟล์
              </li>
              <li>
                <code className="text-ivory">GA4_PROPERTY_ID</code> = เลข property (GA4 → Admin →
                Property details ตัวเลขล้วน)
              </li>
            </ul>
          </li>
          <li>Redeploy หนึ่งรอบ แล้วกลับมาหน้านี้อีกครั้ง</li>
        </ol>
        <p className="mt-3 text-xs text-smoke">
          Search Console ใช้ property {GSC_SITE} — ถ้าเปลี่ยนให้ตั้ง env <code>GSC_SITE</code>
        </p>
      </div>
    </div>
  );
}
