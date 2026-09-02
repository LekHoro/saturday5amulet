// ความรู้ของแชทบอท "ผู้ช่วยเสาร์ห้า" — สร้างจากข้อมูลจริงในเว็บเท่านั้น (ห้ามแต่งเนื้อหาเอง)
// ดัชนีย่อ (สินค้า/บทความ/อาจารย์/หมวด/หน้า/ขั้นตอนสั่งบูชา) ใส่ใน system prompt ที่แคชไว้
// รายละเอียดเต็มของแต่ละชิ้นให้โมเดลดึงผ่านเครื่องมือใน engine.ts

import {
  getSiteData,
  getProductFullLang,
  getArticleFullLang,
  productPath,
  thumb,
  type SiteData,
  type Product,
  type Article,
  type MasterWithMeta,
} from "@/lib/db";
import { coverImage } from "@/lib/media";
import { lineChatUrl, LINE_ID } from "@/lib/line";
import { getDict, href, MASTER_NAMES_EN, type Lang } from "@/lib/i18n";
import { LIVE_KATHA } from "@/lib/katha";
import { SITE_URL } from "@/lib/seo";
import type { ChatCard } from "./types";

export const ADMIN_HOURS = { start: 10, end: 22 } as const;
export const LAGNARA_URL = "https://lagnara.com";

/** เวลาไทยตอนนี้ + แอดมินอยู่ในเวลาทำการไหม (10:00–22:00 ทุกวัน) */
export function bangkokNow(now: Date = new Date()): { hhmm: string; onDuty: boolean } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  return {
    hhmm: `${String(hour).padStart(2, "0")}:${minute}`,
    onDuty: hour >= ADMIN_HOURS.start && hour < ADMIN_HOURS.end,
  };
}

function clip(s: string | null | undefined, n: number): string {
  if (!s) return "";
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n) + "…" : t;
}

function priceLine(p: Product, lang: Lang): string {
  if (p.soldOut) return lang === "en" ? "sold out" : "หมดแล้ว";
  return p.priceText || (lang === "en" ? "ask for price" : "สอบถามราคา");
}

/** ดัชนีย่อทั้งเว็บ — ประมาณ 8–10k token, เปลี่ยนเฉพาะเมื่อข้อมูลเปลี่ยน จึงแคชได้ดี */
export async function buildKnowledge(lang: Lang): Promise<string> {
  const data = await getSiteData(lang);
  const t = getDict(lang);
  const th = lang === "th";

  const products = data.products
    .map(
      (p) =>
        `${p.id} | ${p.title} | ${priceLine(p, lang)} | ${p.categories.map((c) => c.name).join(", ")}${
          p.tags.length ? ` | ${p.tags.slice(0, 6).join(", ")}` : ""
        }`
    )
    .join("\n");

  const articles = data.articles.map((a) => `${a.id} | ${a.title} | ${a.categories.map((c) => c.name).join(", ")}`).join("\n");
  const news = data.news.map((a) => `${a.id} | ${a.title}`).join("\n");

  const masters = data.masters
    .map((m) => {
      const en = MASTER_NAMES_EN[m.slug];
      const name = lang === "en" && en ? `${en} (${m.name})` : m.name;
      const bio = clip(m.bio, 160);
      return `${m.slug} | ${name} | ${th ? `${m.count} รุ่น (พร้อมส่ง ${m.available})` : `${m.count} editions (${m.available} available)`}${bio ? ` | ${bio}` : ""}`;
    })
    .join("\n");

  const categories = Object.entries(data.categoryNames)
    .map(([id, name]) => `${id} | ${name}`)
    .join("\n");

  const katha = LIVE_KATHA.map((k) => `${k.slug} | ${k.name} | ${k.nameEn}`).join("\n");

  const o = t.order;
  const steps = o.steps.map((s, i) => `${i + 1}. ${s.title} — ${s.text}`).join("\n");
  const faqs = o.faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n");
  const assurances = o.assurances.map((a) => `- ${a.title}: ${a.text}`).join("\n");

  const pages = th
    ? [
        "products | หน้ารวมวัตถุมงคลทั้งหมด ค้นหา/กรองตามหมวดได้",
        "cat:<id> | หน้าหมวดสินค้า (ใช้ id จากรายการหมวด)",
        "search:<คำค้น> | หน้าค้นหาสินค้าด้วยคำค้น",
        "masters | หน้ารวมครูบาอาจารย์ทุกท่าน",
        "articles | หน้ารวมบทความวิธีบูชา/ความรู้",
        "gallery | ภาพงานพิธีปลุกเสกจริง",
        "katha | หน้าคาถาบูชา รวมคาถาตามสำนัก/คาถาประจำวัน",
        "how-to-order | วิธีสั่งบูชาและชำระเงิน (ขั้นตอน + คำถามพบบ่อย)",
        "lagnara | เว็บดูดวง lagnara.com ในเครือเดียวกัน (ลิงก์ภายนอก)",
      ].join("\n")
    : [
        "products | All amulets, with search and category filters",
        "cat:<id> | A product category page (use an id from the category list)",
        "search:<keywords> | Product search results",
        "masters | All masters",
        "articles | Articles on how to worship / knowledge",
        "gallery | Photos of real consecration ceremonies",
        "katha | Katha (prayers) page by master and daily katha",
        "how-to-order | How to order and pay (steps + FAQ)",
        "lagnara | Sister fortune-telling site lagnara.com (external link)",
      ].join("\n");

  return [
    th ? "# ข้อมูลร้าน" : "# Shop facts",
    th
      ? `ร้านเสาร์๕มหานิยม (Saturday5Amulet) เว็บ ${SITE_URL} วัตถุมงคล เครื่องราง กุมารทอง ของแท้จากวัดและสำนักโดยตรง เปิดร้านตั้งแต่ปี 2012\nช่องทางเดียวในการสั่งบูชาและชำระเงินคือแชท LINE ทางการ ${LINE_ID}\nแอดมินตอบแชท LINE เวลา ${ADMIN_HOURS.start}:00–${ADMIN_HOURS.end}:00 น. (เวลาไทย) ทุกวัน\nจัดส่งในประเทศแบบด่วน (EMS) แจ้งเลขพัสดุในแชท / ต่างประเทศส่งผ่าน EMS World ค่าส่งขึ้นกับประเทศปลายทาง ต้องเช็คในแชท\nทุกองค์แนบวิธีบูชาและคาถากำกับไปพร้อมพัสดุ`
      : `Saturday5Amulet (เสาร์๕มหานิยม), ${SITE_URL}: genuine Thai amulets, charms and Kumanthong direct from temples and masters, since 2012.\nThe only channel for ordering and payment is the official LINE chat ${LINE_ID}.\nAdmin replies on LINE ${ADMIN_HOURS.start}:00–${ADMIN_HOURS.end}:00 Thailand time, every day.\nDomestic shipping by EMS with tracking number sent in chat / worldwide shipping via EMS World, cost depends on destination and is confirmed in chat.\nEvery piece ships with worship instructions and its katha.`,
    "",
    th ? "## ขั้นตอนสั่งบูชา" : "## How to order",
    steps,
    "",
    th ? "## เหตุผลที่วางใจ" : "## Assurances",
    assurances,
    "",
    th ? "## คำถามพบบ่อย (จากหน้าวิธีสั่งบูชา)" : "## FAQ (from the how-to-order page)",
    faqs,
    "",
    th ? "## หน้าในเว็บ (id | คำอธิบาย) — ใช้กับ show_cards kind=page" : "## Site pages (id | description) — for show_cards kind=page",
    pages,
    "",
    th ? "## หมวดสินค้า (id | ชื่อ)" : "## Product categories (id | name)",
    categories,
    "",
    th
      ? "## ครูบาอาจารย์ (slug | ชื่อ | จำนวนรุ่น | ประวัติย่อ) — รายละเอียดเต็มใช้ get_master"
      : "## Masters (slug | name | editions | short bio) — full bio via get_master",
    masters,
    "",
    th
      ? `## สินค้าทั้งหมด ${data.products.length} รุ่น (id | ชื่อ | ราคาบูชา/สถานะ | หมวด | แท็ก) — รายละเอียด/พุทธคุณ/พิธี ใช้ get_product`
      : `## All ${data.products.length} products (id | name | price/status | categories | tags) — details via get_product`,
    products,
    "",
    th ? "## บทความ (id | ชื่อ | หมวด) — เนื้อหาใช้ get_article" : "## Articles (id | title | categories) — content via get_article",
    articles,
    "",
    th ? "## ข่าว/กิจกรรมของร้าน (id | ชื่อ)" : "## Shop news (id | title)",
    news,
    "",
    th ? "## คาถาในหน้าคาถา (slug | ชื่อ | ชื่ออังกฤษ)" : "## Katha on the katha page (slug | Thai name | English name)",
    katha,
  ].join("\n");
}

// --- ค้นหา ----------------------------------------------------------------

export interface SearchHit {
  kind: "product" | "article" | "master";
  id: string;
  title: string;
  extra: string;
  score: number;
}

function terms(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[\s,/|]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2);
}

function scoreText(haystack: string, ts: string[], weight: number): number {
  const h = haystack.toLowerCase();
  let s = 0;
  for (const term of ts) if (h.includes(term)) s += weight;
  return s;
}

/** ค้นชื่อ/แท็ก/คำโปรย/หมวด แบบง่าย ๆ — ข้อมูลเล็กพอที่ไม่ต้องใช้ vector search */
export async function searchSite(
  query: string,
  lang: Lang,
  kind?: "product" | "article" | "master" | "all"
): Promise<SearchHit[]> {
  const data = await getSiteData(lang);
  const ts = terms(query);
  if (ts.length === 0) return [];
  const hits: SearchHit[] = [];
  const want = kind ?? "all";

  if (want === "all" || want === "product") {
    for (const p of data.products) {
      const s =
        scoreText(p.title, ts, 5) +
        scoreText(p.tags.join(" "), ts, 3) +
        scoreText(p.categories.map((c) => c.name).join(" "), ts, 3) +
        scoreText(p.meta.keywords ?? "", ts, 2) +
        scoreText(p.descriptionText ?? "", ts, 1);
      if (s > 0) hits.push({ kind: "product", id: p.id, title: p.title, extra: priceLine(p, lang), score: s + (p.soldOut ? 0 : 0.5) });
    }
  }
  if (want === "all" || want === "article") {
    for (const a of [...data.articles, ...data.news]) {
      const s =
        scoreText(a.title, ts, 5) +
        scoreText(a.categories.map((c) => c.name).join(" "), ts, 3) +
        scoreText(a.meta.keywords ?? "", ts, 2) +
        scoreText(a.contentText ?? "", ts, 1);
      if (s > 0) hits.push({ kind: "article", id: a.id, title: a.title, extra: a.kind, score: s });
    }
  }
  if (want === "all" || want === "master") {
    for (const m of data.masters) {
      const s = scoreText(m.name, ts, 5) + scoreText(MASTER_NAMES_EN[m.slug] ?? "", ts, 5) + scoreText(m.bio ?? "", ts, 1);
      if (s > 0) hits.push({ kind: "master", id: m.slug, title: m.name, extra: `${m.available}/${m.count}`, score: s });
    }
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 8);
}

// --- รายละเอียดรายชิ้น (ผลลัพธ์เครื่องมือ) ----------------------------------

export async function describeProduct(id: string, lang: Lang): Promise<string | null> {
  const p = await getProductFullLang(id, lang);
  if (!p) return null;
  const data = await getSiteData(lang);
  const master = data.masters.find((m) => p.categories.some((c) => c.id === m.catId));
  return [
    `id: ${p.id}`,
    `${lang === "en" ? "name" : "ชื่อ"}: ${p.title}`,
    `${lang === "en" ? "price/status" : "ราคาบูชา/สถานะ"}: ${priceLine(p, lang)}`,
    master ? `${lang === "en" ? "master" : "อาจารย์"}: ${master.name} (slug ${master.slug})` : null,
    `${lang === "en" ? "categories" : "หมวด"}: ${p.categories.map((c) => c.name).join(", ")}`,
    p.tags.length ? `${lang === "en" ? "tags" : "แท็ก"}: ${p.tags.join(", ")}` : null,
    p.updatedAt ? `${lang === "en" ? "updated" : "อัปเดต"}: ${p.updatedAt}` : null,
    "",
    lang === "en" ? "description (from the product page):" : "รายละเอียดจากหน้าสินค้า:",
    clip(p.descriptionText, 3500) || (lang === "en" ? "(no description on the site)" : "(ไม่มีคำอธิบายในเว็บ)"),
  ]
    .filter((x) => x !== null)
    .join("\n");
}

export async function describeArticle(id: string, lang: Lang): Promise<string | null> {
  const a = await getArticleFullLang(id, lang);
  if (!a) return null;
  return [
    `id: ${a.id}`,
    `${lang === "en" ? "title" : "ชื่อ"}: ${a.title}`,
    a.dateText ? `${lang === "en" ? "date" : "วันที่"}: ${a.dateText}` : null,
    `${lang === "en" ? "categories" : "หมวด"}: ${a.categories.map((c) => c.name).join(", ")}`,
    "",
    lang === "en" ? "content (from the article):" : "เนื้อหาจากบทความ:",
    clip(a.contentText, 5000) || (lang === "en" ? "(no text content)" : "(ไม่มีเนื้อหาข้อความ)"),
  ]
    .filter((x) => x !== null)
    .join("\n");
}

export async function describeMaster(slug: string, lang: Lang): Promise<string | null> {
  const data = await getSiteData(lang);
  const m = data.masters.find((x) => x.slug === slug);
  if (!m) return null;
  const items = data.products.filter((p) => p.categories.some((c) => c.id === m.catId));
  return [
    `slug: ${m.slug}`,
    `${lang === "en" ? "name" : "ชื่อ"}: ${m.name}${MASTER_NAMES_EN[m.slug] ? ` / ${MASTER_NAMES_EN[m.slug]}` : ""}`,
    `${lang === "en" ? "editions" : "จำนวนรุ่น"}: ${m.count} (${lang === "en" ? "available" : "พร้อมส่ง"} ${m.available})`,
    m.videos?.length ? `${lang === "en" ? "videos" : "คลิป"}: ${m.videos.map((v) => v.title).join("; ")}` : null,
    "",
    lang === "en" ? "bio (from the master page):" : "ประวัติจากหน้าอาจารย์:",
    clip(m.bio, 4000) || (lang === "en" ? "(no bio on the site)" : "(ยังไม่มีประวัติในเว็บ)"),
    "",
    lang === "en" ? "editions (id | name | price/status):" : "รุ่นทั้งหมด (id | ชื่อ | ราคา/สถานะ):",
    items.map((p) => `${p.id} | ${p.title} | ${priceLine(p, lang)}`).join("\n") || "-",
  ]
    .filter((x) => x !== null)
    .join("\n");
}

// --- การ์ด -----------------------------------------------------------------

function productCard(p: Product, lang: Lang, data: SiteData): ChatCard {
  const t = getDict(lang);
  const master = data.masters.find((m) => p.categories.some((c) => c.id === m.catId));
  return {
    kind: "product",
    id: p.id,
    title: p.title,
    subtitle: p.soldOut ? null : p.priceText || null,
    status: p.soldOut ? "soldout" : "available",
    image: coverImage(p.images) ?? thumb(p) ?? null,
    href: href(lang, productPath(p)),
    lineUrl: lineChatUrl(p.soldOut ? t.line.notify(p.title) : t.line.inquiry(p.title)),
    lineAction: p.soldOut ? "notify" : "order",
    ...(master ? { subtitle: p.soldOut ? master.name : `${p.priceText || ""} · ${master.name}`.replace(/^ · /, "") } : {}),
  };
}

function articleCard(a: Article, lang: Lang): ChatCard {
  return {
    kind: "article",
    id: a.id,
    title: a.title,
    subtitle: a.categories[0]?.name ?? null,
    image: coverImage(a.images) ?? null,
    href: href(lang, `/articles/${a.id}`),
  };
}

function masterCard(m: MasterWithMeta, lang: Lang): ChatCard {
  const en = MASTER_NAMES_EN[m.slug];
  return {
    kind: "master",
    id: m.slug,
    title: lang === "en" && en ? en : m.name,
    subtitle: lang === "en" ? `${m.count} editions` : `${m.count} รุ่น`,
    image: m.photo ?? m.cover ?? null,
    href: href(lang, `/masters/${m.slug}`),
  };
}

function pageCard(id: string, title: string | undefined, lang: Lang, data: SiteData): ChatCard | null {
  const t = getDict(lang);
  const simple: Record<string, { path: string; title: string }> = {
    products: { path: "/products", title: t.nav.products },
    masters: { path: "/masters", title: t.nav.masters },
    articles: { path: "/articles", title: t.nav.articles },
    gallery: { path: "/gallery", title: t.nav.gallery },
    katha: { path: "/katha", title: t.nav.katha },
    "how-to-order": { path: "/how-to-order", title: t.nav.howToOrder },
  };
  if (simple[id]) {
    return { kind: "page", id, title: title || simple[id].title, href: href(lang, simple[id].path) };
  }
  if (id === "lagnara") {
    return { kind: "page", id, title: title || "lagnara.com", href: LAGNARA_URL, external: true };
  }
  const cat = id.match(/^cat:(\d+)$/);
  if (cat) {
    const name = data.categoryNames[cat[1]];
    if (!name) return null;
    return { kind: "page", id, title: title || name, href: href(lang, `/products?cat=${cat[1]}`) };
  }
  const q = id.match(/^search:(.+)$/);
  if (q) {
    return {
      kind: "page",
      id,
      title: title || (lang === "en" ? `Search: ${q[1]}` : `ค้นหา: ${q[1]}`),
      href: href(lang, `/products?q=${encodeURIComponent(q[1])}`),
    };
  }
  return null;
}

/** แปลงรายการที่โมเดลขอโชว์ (kind+id) เป็นการ์ดจริง — id ที่ไม่มีอยู่จะถูกทิ้ง */
export async function resolveCards(
  items: { kind: string; id: string; title?: string }[],
  lang: Lang
): Promise<ChatCard[]> {
  const data = await getSiteData(lang);
  const out: ChatCard[] = [];
  const seen = new Set<string>();
  for (const it of items) {
    const key = `${it.kind}:${it.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    let card: ChatCard | null = null;
    if (it.kind === "product") {
      const p = data.products.find((x) => x.id === String(it.id));
      if (p) card = productCard(p, lang, data);
    } else if (it.kind === "article") {
      const a = [...data.articles, ...data.news].find((x) => x.id === String(it.id));
      if (a) card = articleCard(a, lang);
    } else if (it.kind === "master") {
      const m = data.masters.find((x) => x.slug === String(it.id));
      if (m) card = masterCard(m, lang);
    } else if (it.kind === "page") {
      card = pageCard(String(it.id), it.title, lang, data);
    }
    if (card) out.push(card);
    if (out.length >= 4) break;
  }
  return out;
}

/** ชื่อสินค้าสำหรับใส่บริบทเมื่อลูกค้าเปิดแชทจากหน้าสินค้า */
export async function productContext(id: string, lang: Lang): Promise<string | null> {
  const data = await getSiteData(lang);
  const p = data.products.find((x) => x.id === id);
  return p ? `${p.id} | ${p.title} | ${priceLine(p, lang)}` : null;
}
