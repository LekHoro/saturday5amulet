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
  type Master,
  type Ceremony,
} from "./data";

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
    title: r.title,
    priceText: r.price_text ?? "",
    price: r.price === null ? null : Number(r.price),
    sku: r.sku,
    updatedAt: r.updated_text,
    soldOut: !!r.sold_out,
    categories: r.categories ?? [],
    descriptionHtml: r.description_html,
    descriptionText: r.description_text,
    images: r.images ?? [],
    meta: r.meta ?? { title: r.title, description: null, keywords: null },
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
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

async function loadFromSupabase(): Promise<SiteData> {
  const sb = createClient(SUPABASE_URL!, SUPABASE_ANON!, {
    auth: { persistSession: false },
  });
  const [productsQ, articlesQ, galleriesQ, mastersQ, settingsQ] = await Promise.all([
    sb.from("products").select("*").order("position").limit(5000),
    sb.from("articles").select("*").order("position").limit(5000),
    sb.from("galleries").select("*").order("position").limit(1000),
    sb.from("masters").select("*").order("position").limit(1000),
    sb.from("settings").select("*"),
  ]);
  for (const q of [productsQ, articlesQ, galleriesQ, mastersQ, settingsQ]) {
    if (q.error) throw q.error;
  }

  // snapshot กลางเก็บฉบับเบา (unstable_cache จำกัด 2MB) — html เต็มดึงรายชิ้น
  const products = (productsQ.data ?? []).map(rowToProduct).map(lightenProduct);
  const allArticles = (articlesQ.data ?? []).map(rowToArticle).map(lightenArticle);
  const galleries: Gallery[] = (galleriesQ.data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    images: (r.images ?? []) as string[],
  }));
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
    nextCeremony: (settings.get("next_ceremony") as Ceremony | null) ?? null,
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

/** ข้อมูลทั้งเว็บฉบับเบา (cache 5 นาที + revalidateTag(DATA_TAG) จาก /admin) */
export const getData = unstable_cache(loadSnapshot, [DATA_TAG], {
  tags: [DATA_TAG],
  revalidate: 300,
});

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
      return data ? rowToProduct(data) : null;
    } catch (err) {
      console.error("[db] product read failed, falling back to JSON:", err);
      return jsonProduct(id);
    }
  },
  ["product-full"],
  { tags: [DATA_TAG], revalidate: 300 }
);

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
  { tags: [DATA_TAG], revalidate: 300 }
);
