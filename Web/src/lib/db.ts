// แหล่งข้อมูลกลางของเว็บ: อ่านจาก Supabase (ถ้าตั้งค่า env แล้ว) หรือ JSON fallback
// ทุกหน้าเรียก getData() แล้วใช้ตัวช่วย pure จาก "@/lib/data" (re-export ให้ครบจากไฟล์นี้)
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import {
  jsonSnapshot,
  jsonProduct,
  jsonArticle,
  computeMasters,
  buildCategoryNames,
  lightenProduct,
  lightenArticle,
  type SiteData,
  type Product,
  type Article,
  type Gallery,
  type Category,
  type EnContent,
  type Master,
  type Ceremony,
} from "./data";
import { normalizeHomeBlocks } from "./home-blocks";
import { localizeSnapshot, localizeProduct, localizeArticle } from "./localize";
import type { Lang } from "./i18n";

export * from "./data";

/** tag สำหรับ revalidateTag() เมื่อแอดมินแก้ข้อมูล */
export const DATA_TAG = "site-data";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type Json = Record<string, unknown>;

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToProduct(r: any): Product {
  return {
    id: r.id,
    url: r.url ?? "",
    slug: r.slug ?? null,
    tags: r.tags ?? [],
    title: r.title,
    // ราคาที่ scrape มาจาก igetweb มี newline+ช่องว่างค้าง ("1,800.00\n  บาท") — เก็บกวาดที่นี่ที่เดียว
    priceText: (r.price_text ?? "").replace(/\s+/g, " ").trim(),
    price: r.price === null ? null : Number(r.price),
    sku: r.sku,
    updatedAt: r.updated_text,
    soldOut: !!r.sold_out,
    visible: r.visible !== false,
    categories: r.categories ?? [],
    descriptionHtml: r.description_html,
    descriptionText: r.description_text,
    images: r.images ?? [],
    meta: r.meta ?? { title: r.title, description: null, keywords: null },
    en: r.en ?? null,
  };
}

function rowToArticle(r: any): Article {
  return {
    id: r.id,
    url: r.url ?? "",
    kind: r.kind,
    title: r.title,
    dateText: r.date_text,
    views: r.views,
    categories: r.categories ?? [],
    contentHtml: r.content_html,
    contentText: r.content_text,
    images: r.images ?? [],
    meta: r.meta ?? { title: r.title, description: null, keywords: null },
    en: r.en ?? null,
  };
}

function rowToMaster(r: any): Master {
  return {
    slug: r.slug,
    catId: r.cat_id,
    name: r.name,
    photo: r.photo ?? undefined,
    bio: r.bio ?? undefined,
    videos: r.videos ?? [],
    banner: r.banner ?? undefined,
  };
}

// คอลัมน์สำหรับ snapshot ฉบับเบา — EN หยิบเฉพาะ title/priceText/text ออกจาก jsonb (html ไม่เอา)
const PRODUCT_LIGHT_COLS =
  "id,url,slug,tags,title,price_text,price,sku,updated_text,sold_out,visible,categories," +
  "description_text,images,meta,en_title:en->title,en_price:en->priceText,en_text:en->text";
const ARTICLE_LIGHT_COLS =
  "id,url,kind,title,date_text,views,categories,content_text,images,meta," +
  "en_title:en->title,en_text:en->text";

/** ประกอบ en กลับเป็น object จากคอลัมน์ที่แตกออกมา (ไม่มีคำแปลเลย = null เหมือน select("*")) */
function lightEn(r: any): EnContent | null {
  if (r.en_title == null && r.en_price == null && r.en_text == null) return null;
  return { title: r.en_title ?? null, priceText: r.en_price ?? null, html: null, text: r.en_text ?? null };
}
function lightRowToProduct(r: any): Product {
  return rowToProduct({ ...r, description_html: null, en: lightEn(r) });
}
function lightRowToArticle(r: any): Article {
  return rowToArticle({ ...r, content_html: null, en: lightEn(r) });
}
/* eslint-enable @typescript-eslint/no-explicit-any */

async function loadFromSupabase(): Promise<SiteData> {
  const sb = createClient(SUPABASE_URL!, SUPABASE_ANON!, {
    auth: { persistSession: false },
  });
  // ดึงเฉพาะคอลัมน์ที่ snapshot ฉบับเบาใช้จริง — html เต็ม/คำแปล EN เต็มไม่เอา (ตัดทิ้งอยู่แล้วใน lighten*)
  // เพราะ snapshot นี้ถูกดึงใหม่ทุกครั้งที่ cache หมดอายุ: select("*") ≈ 3.4 MB/ครั้ง กิน egress
  // ของ Supabase ฟรี (5 GB/เดือน) จนเกินโควตา — เลือกคอลัมน์แล้วเหลือ ≈ 0.9 MB
  const [productsQ, articlesQ, galleriesQ, mastersQ, settingsQ] = await Promise.all([
    sb.from("products").select(PRODUCT_LIGHT_COLS).order("position").limit(5000),
    sb.from("articles").select(ARTICLE_LIGHT_COLS).order("position").limit(5000),
    sb.from("galleries").select("*").order("position").limit(1000),
    sb.from("masters").select("*").order("position").limit(1000),
    sb.from("settings").select("*"),
  ]);
  for (const q of [productsQ, articlesQ, galleriesQ, mastersQ, settingsQ]) {
    if (q.error) throw q.error;
  }

  // snapshot กลางเก็บฉบับเบา (unstable_cache จำกัด 2MB) — html เต็มดึงรายชิ้น
  // สินค้าที่ปิด "แสดงผล" ไว้ในแอดมิน ไม่ให้หลุดออกหน้าเว็บสาธารณะเลย
  const products = (productsQ.data ?? [])
    .map(lightRowToProduct)
    .map(lightenProduct)
    .filter((p) => p.visible);
  const allArticles = (articlesQ.data ?? []).map(lightRowToArticle).map(lightenArticle);
  // อัลบั้มไม่มีรูปไม่ให้หลุดออกหน้าเว็บ — หน้าแรก/หน้ารวมใช้รูปแรกเป็นปกเสมอ
  const galleries: Gallery[] = (galleriesQ.data ?? [])
    .map((r) => ({
      id: r.id,
      title: r.title,
      images: (r.images ?? []) as string[],
      categories: (r.categories ?? []) as Category[],
      en: (r.en ?? null) as Gallery["en"],
    }))
    .filter((g) => g.title && g.images.length > 0);
  const settings = new Map<string, Json | null>(
    (settingsQ.data ?? []).map((r) => [r.key as string, r.value as Json | null])
  );

  return {
    products,
    availableProducts: products.filter((p) => !p.soldOut),
    articles: allArticles.filter((a) => a.kind !== "news"),
    news: allArticles.filter((a) => a.kind === "news"),
    galleries,
    masters: computeMasters((mastersQ.data ?? []).map(rowToMaster), products),
    categoryNames: buildCategoryNames(products),
    categoryImages: (settings.get("category_images") as Record<string, string> | null) ?? {},
    nextCeremony: (settings.get("next_ceremony") as Ceremony | null) ?? null,
    homeBlocks: normalizeHomeBlocks(settings.get("home_blocks")),
  };
}

async function loadSnapshot(): Promise<SiteData> {
  if (!SUPABASE_URL || !SUPABASE_ANON) return jsonSnapshot();
  try {
    return await loadFromSupabase();
  } catch (err) {
    // Supabase ล่ม/ตารางยังไม่พร้อม — เว็บต้องไม่ล่มตาม จึงถอยไปใช้ JSON ที่ scrape ไว้
    console.error("[db] Supabase read failed, falling back to JSON:", err);
    return jsonSnapshot();
  }
}

// cache นานขึ้นได้เพราะแอดมินกดบันทึกแล้ว revalidateTag ทันทีอยู่แล้ว — สิ่งเดียวที่ช้าตามคือ
// ยอดอ่านบทความบนหน้า list (อัปเดตทุก 1 ชม.) แลกกับ egress ที่ลดลงราว 12 เท่า
const SNAPSHOT_REVALIDATE = 3600;

/** ข้อมูลทั้งเว็บฉบับเบา (cache 1 ชั่วโมง + revalidateTag(DATA_TAG) จาก /admin) */
export const getData = unstable_cache(loadSnapshot, [DATA_TAG], {
  tags: [DATA_TAG],
  revalidate: SNAPSHOT_REVALIDATE,
});

/** เหมือน getData แต่ overlay เนื้อหาอังกฤษเมื่อ lang="en" (cache ร่วมกัน — overlay ถูกและ pure) */
export async function getSiteData(lang: Lang = "th"): Promise<SiteData> {
  return localizeSnapshot(await getData(), lang);
}

function anonClient() {
  return createClient(SUPABASE_URL!, SUPABASE_ANON!, { auth: { persistSession: false } });
}

/** สินค้าฉบับเต็ม (มี descriptionHtml) — cache รายชิ้น */
export const getProductFull = unstable_cache(
  async (id: string): Promise<Product | null> => {
    if (!SUPABASE_URL || !SUPABASE_ANON) return jsonProduct(id);
    try {
      const { data, error } = await anonClient()
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const p = rowToProduct(data);
      return p.visible ? p : null;
    } catch (err) {
      console.error("[db] product read failed, falling back to JSON:", err);
      return jsonProduct(id);
    }
  },
  ["product-full"],
  { tags: [DATA_TAG], revalidate: SNAPSHOT_REVALIDATE }
);

/** สินค้าฉบับเต็มตามภาษา — overlay EN นอก cache (cache เก็บฉบับไทยชุดเดียว) */
export async function getProductFullLang(id: string, lang: Lang): Promise<Product | null> {
  const p = await getProductFull(id);
  return p ? localizeProduct(p, lang) : null;
}

/** บทความ/ข่าวฉบับเต็ม (มี contentHtml) — cache รายชิ้น */
export const getArticleFull = unstable_cache(
  async (id: string): Promise<Article | null> => {
    if (!SUPABASE_URL || !SUPABASE_ANON) return jsonArticle(id);
    try {
      const { data, error } = await anonClient()
        .from("articles")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? rowToArticle(data) : null;
    } catch (err) {
      console.error("[db] article read failed, falling back to JSON:", err);
      return jsonArticle(id);
    }
  },
  ["article-full"],
  { tags: [DATA_TAG], revalidate: SNAPSHOT_REVALIDATE }
);

/** บทความฉบับเต็มตามภาษา — overlay EN นอก cache */
export async function getArticleFullLang(id: string, lang: Lang): Promise<Article | null> {
  const a = await getArticleFull(id);
  return a ? localizeArticle(a, lang) : null;
}
