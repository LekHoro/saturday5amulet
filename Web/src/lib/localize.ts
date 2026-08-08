// overlay เนื้อหาภาษาอังกฤษ (scrape จากหน้า /en ของเว็บ igetweb เดิม) ทับข้อมูลไทยตาม id
// ข้อมูลไทยเป็นแหล่งจริง (Supabase/JSON) — รายการใหม่ที่ยังไม่มีคำแปลจะแสดงไทยไปก่อน
import productsEnRaw from "@/data/products-en.json";
import articlesEnRaw from "@/data/articles-en.json";
import newsEnRaw from "@/data/news-en.json";
import galleriesEnRaw from "@/data/galleries-en.json";
import { MASTER_NAMES_EN, localizeDateText, type Lang } from "./i18n";
import type { Product, Article, Gallery, MasterWithMeta, SiteData } from "./data";

interface ProductEn {
  id: string;
  title: string;
  priceText: string | null;
  price: number | null;
  descriptionHtml: string | null;
  descriptionText: string | null;
  meta?: { title?: string; description?: string | null; keywords?: string | null };
  categories?: { id: string; name: string }[];
  translated?: boolean;
}

interface ArticleEn {
  id: string;
  title: string;
  contentHtml: string | null;
  contentText: string | null;
  meta?: { title?: string; description?: string | null; keywords?: string | null };
  categories?: { id: string; name: string }[];
  translated?: boolean;
}

const productsEn = new Map(
  (productsEnRaw as ProductEn[]).filter((p) => p.translated && p.title).map((p) => [p.id, p])
);
const articlesEn = new Map(
  [...(articlesEnRaw as ArticleEn[]), ...(newsEnRaw as ArticleEn[])]
    .filter((a) => a.translated && a.title)
    .map((a) => [a.id, a])
);
const galleriesEn = new Map(
  (galleriesEnRaw as { id: string; title: string; translated?: boolean }[])
    .filter((g) => g.translated && g.title)
    .map((g) => [g.id, g.title])
);

// ชื่อหมวดอังกฤษ — รวมจาก categories ของสินค้า/บทความ EN ทุกชิ้น
const categoryNamesEn: Record<string, string> = {};
for (const p of productsEnRaw as ProductEn[])
  for (const c of p.categories ?? []) categoryNamesEn[c.id] = c.name;
for (const a of [...(articlesEnRaw as ArticleEn[]), ...(newsEnRaw as ArticleEn[])])
  for (const c of a.categories ?? []) categoryNamesEn[c.id] = c.name;
// หมวดที่เว็บเดิมไม่เคยแปล
categoryNamesEn["129198"] = "Sold Out — AJ Subin Amulets";

const EXCERPT = 300;

// meta ของหน้า /en เว็บเดิมมักติดข้อความไทยมาด้วย (igetweb ไม่แปล meta) — มีไทยเมื่อไหร่ทิ้งเลย
const THAI_RE = /[฀-๿]/;
function enOnly(text: string | null | undefined): string | null {
  return text && !THAI_RE.test(text) ? text : null;
}

function enMeta(
  e: { title: string; meta?: { title?: string; description?: string | null; keywords?: string | null } },
): { title: string; description: string | null; keywords: string | null } {
  return {
    title: enOnly(e.meta?.title) ?? e.title,
    description: enOnly(e.meta?.description),
    keywords: enOnly(e.meta?.keywords),
  };
}

function localizeCategories(cats: { id: string; name: string }[]) {
  return cats.map((c) => ({ ...c, name: categoryNamesEn[c.id] ?? c.name }));
}

/** สินค้า → ฉบับอังกฤษ (คงรูป/ราคา/สถานะจากข้อมูลไทยซึ่งเป็นแหล่งจริง) */
export function localizeProduct(p: Product, lang: Lang): Product {
  if (lang !== "en") return p;
  const e = productsEn.get(p.id);
  return {
    ...p,
    title: e?.title ?? p.title,
    // priceText ไทยเป็นตัวเลข/"Sold Out" อยู่แล้ว — ใช้ของ EN เฉพาะเมื่อมี
    priceText: e?.priceText ?? p.priceText,
    updatedAt: localizeDateText(p.updatedAt, lang),
    categories: localizeCategories(p.categories),
    // แสดง description EN เฉพาะเมื่อฝั่งไทยมีฟิลด์นั้นอยู่ (snapshot กลางตัด html ทิ้ง — อย่าใส่กลับ)
    descriptionHtml: p.descriptionHtml !== null ? (e?.descriptionHtml ?? p.descriptionHtml) : null,
    descriptionText:
      p.descriptionText !== null
        ? (e?.descriptionText?.slice(0, p.descriptionHtml === null ? EXCERPT : undefined) ??
          p.descriptionText)
        : null,
    meta: e ? enMeta(e) : { title: p.title, description: null, keywords: null },
  };
}

/** บทความ/ข่าว → ฉบับอังกฤษ */
export function localizeArticle(a: Article, lang: Lang): Article {
  if (lang !== "en") return a;
  const e = articlesEn.get(a.id);
  return {
    ...a,
    title: e?.title ?? a.title,
    dateText: localizeDateText(a.dateText, lang),
    categories: localizeCategories(a.categories),
    contentHtml: a.contentHtml !== null ? (e?.contentHtml ?? a.contentHtml) : null,
    contentText:
      a.contentText !== null
        ? (e?.contentText?.slice(0, a.contentHtml === null ? EXCERPT : undefined) ?? a.contentText)
        : null,
    meta: e ? enMeta(e) : { title: a.title, description: null, keywords: null },
  };
}

function localizeGallery(g: Gallery, lang: Lang): Gallery {
  if (lang !== "en") return g;
  return { ...g, title: galleriesEn.get(g.id) ?? g.title };
}

function localizeMaster(m: MasterWithMeta, lang: Lang): MasterWithMeta {
  if (lang !== "en") return m;
  return { ...m, name: MASTER_NAMES_EN[m.slug] ?? m.name };
}

/** SiteData ทั้งชุด → ฉบับภาษาที่ขอ (ไทยคืนค่าเดิมไม่เสีย allocation) */
export function localizeSnapshot(data: SiteData, lang: Lang): SiteData {
  if (lang !== "en") return data;
  const products = data.products.map((p) => localizeProduct(p, lang));
  return {
    ...data,
    products,
    availableProducts: products.filter((p) => !p.soldOut),
    articles: data.articles.map((a) => localizeArticle(a, lang)),
    news: data.news.map((a) => localizeArticle(a, lang)),
    galleries: data.galleries.map((g) => localizeGallery(g, lang)),
    masters: data.masters.map((m) => localizeMaster(m, lang)),
    categoryNames: { ...data.categoryNames, ...categoryNamesEn },
  };
}
