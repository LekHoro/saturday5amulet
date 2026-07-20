// ย้ายข้อมูล JSON (products/articles/news/galleries + คำแปล EN) → ตาราง Supabase
// พร้อมแปลง URL รูปจาก igetweb CDN → Supabase Storage (ต้องรัน upload-images.mjs ก่อน/พร้อมกันได้)
// รันซ้ำได้: products/articles/galleries เขียนทับ (migration คือแหล่งความจริง ณ ตอนย้าย),
// masters/settings ไม่ทับของเดิม (กันลบข้อมูลที่เจ้าของแก้ผ่าน /admin ไปแล้ว)
import path from "node:path";
import { supabase, MIGRATION_DIR, loadImageMap, publicImageUrl, readJson } from "./lib.mjs";

const DATA = path.join(MIGRATION_DIR, "data");
const imageMap = loadImageMap(); // old URL → bucket path

// ── URL rewriting ─────────────────────────────────────────────────────────
// แทนที่ URL เก่าทุกที่ในไอเทม (ทั้ง images[] และในเนื้อหา html) ผ่าน stringify→replace→parse
const OLD_URL_RE =
  /https?:\/\/(?:cache-igetweb-v2\.mt108\.info|cdn\.igetweb\.com|www\.saturday5amulet\.com)[^"'\\\s<>)]+/g;

function rewriteItem(item) {
  const json = JSON.stringify(item).replace(OLD_URL_RE, (url) => {
    const bucketPath = imageMap.get(url);
    return bucketPath ? publicImageUrl(bucketPath) : url;
  });
  return JSON.parse(json);
}

// ── กรองเหมือน web/src/lib/data.ts ───────────────────────────────────────
const OWN_IMAGE = /cache-igetweb-v2\.mt108\.info|cdn\.igetweb\.com|saturday5amulet\.com/;
const ownImages = (item) => ({
  ...item,
  images: (item.images ?? []).filter((u) => OWN_IMAGE.test(u)),
});

function enOf(list, id) {
  const e = list.find((x) => x.id === id);
  if (!e) return null;
  return rewriteItem({
    title: e.title ?? null,
    descriptionHtml: e.descriptionHtml ?? null,
    descriptionText: e.descriptionText ?? null,
    contentHtml: e.contentHtml ?? null,
    contentText: e.contentText ?? null,
    meta: e.meta ?? null,
    translated: e.translated ?? false,
  });
}

async function upsert(table, rows, opts = {}) {
  for (let i = 0; i < rows.length; i += 50) {
    const chunk = rows.slice(i, i + 50);
    const { error } = await supabase.from(table).upsert(chunk, opts);
    if (error) throw new Error(`${table}: ${error.message}`);
  }
  console.log(`${table}: ${rows.length} แถว`);
}

// ── products ──────────────────────────────────────────────────────────────
const productsEn = readJson(DATA, "products-en.json");
const products = readJson(DATA, "products.json")
  .filter((p) => p.title)
  .map(ownImages)
  .map((p, i) => {
    const r = rewriteItem(p);
    return {
      id: r.id,
      url: r.url ?? null,
      title: r.title,
      price_text: r.priceText ?? null,
      price: r.price ?? null,
      sku: r.sku ?? null,
      updated_text: r.updatedAt ?? null,
      sold_out: !!r.soldOut,
      categories: r.categories ?? [],
      description_html: r.descriptionHtml ?? null,
      description_text: r.descriptionText ?? null,
      images: r.images ?? [],
      meta: r.meta ?? {},
      en: enOf(productsEn, r.id),
      position: i,
    };
  });
await upsert("products", products);

// ── articles + news → ตารางเดียว (แยกด้วย kind) ──────────────────────────
const articlesEn = readJson(DATA, "articles-en.json");
const newsEn = readJson(DATA, "news-en.json");
const mapArticle = (kindDefault, enList) => (a, i) => {
  const r = rewriteItem(a);
  return {
    id: r.id,
    url: r.url ?? null,
    kind: r.kind ?? kindDefault,
    title: r.title,
    date_text: r.dateText ?? null,
    views: r.views ?? null,
    categories: r.categories ?? [],
    content_html: r.contentHtml ?? null,
    content_text: r.contentText ?? null,
    images: r.images ?? [],
    meta: r.meta ?? {},
    en: enOf(enList, r.id),
    position: i,
  };
};
const articleRows = readJson(DATA, "articles.json")
  .filter((a) => a.title)
  .map(ownImages)
  .map(mapArticle("article", articlesEn));
const newsRows = readJson(DATA, "news.json")
  .filter((a) => a.title && !("error" in a))
  .map(ownImages)
  .map(mapArticle("news", newsEn));
await upsert("articles", [...articleRows, ...newsRows]);

// ── galleries: ใช้ไฟล์คัดแล้วของเว็บ (13 อัลบั้ม ไม่รวมอัลบั้มบัตรรับรอง) ──
const galleriesEn = readJson(DATA, "galleries-en.json");
const galleries = readJson(process.cwd(), "src", "data", "galleries.json")
  .filter((g) => g.title && g.images?.length)
  .map((g, i) => {
    const r = rewriteItem(g);
    return {
      id: r.id,
      title: r.title,
      images: r.images,
      en: enOf(galleriesEn, r.id),
      position: i,
    };
  });
await upsert("galleries", galleries);

// ── masters: seed จาก config เดิม (ไม่ทับข้อมูลที่เจ้าของแก้แล้ว) ─────────
// คัดลอกจาก mastersConfig ใน web/src/lib/data.ts ณ วันย้าย
const mastersConfig = [
  { slug: "amnard", catId: "8650", name: "พระอาจารย์อำนาจ มหาวีโร" },
  {
    slug: "subin",
    catId: "8672",
    name: "อาจารย์สุบิน นะหน้าทอง",
    videos: [
      { id: "HF5yjfpxuyw", title: "คาถากุมารนะหน้าทอง อาจารย์สุบิน นะหน้าทอง" },
      { id: "nsrlp9ssRlg", title: "คาถาพรายแม่ทองคำ อาจารย์สุบิน นะหน้าทอง" },
    ],
  },
  { slug: "yaem", catId: "8681", name: "หลวงปู่แย้ม วัดสามง่าม" },
  { slug: "ram", catId: "8670", name: "อาจารย์ราม สำนักโหราราม" },
  { slug: "surasak", catId: "8667", name: "หลวงพ่อพระมหาสุรศักดิ์ วัดประดู่" },
  { slug: "kalong", catId: "8657", name: "หลวงปู่กาหลง เขี้ยวแก้ว" },
  { slug: "nenkaew", catId: "43623", name: "หลวงปู่เณรแก้ว คัมภีโร" },
  { slug: "chuan", catId: "8652", name: "หลวงปู่ชวน วัดเขาแก้ว" },
  { slug: "puen", catId: "8665", name: "พระครูปืน วัดลาดชะโด" },
  { slug: "boy", catId: "88394", name: "อาจารย์บอย บารมีเทพบันดาล" },
  { slug: "kraidech", catId: "88396", name: "อาจารย์ไกรเดช เศรษฐีลูกพ่อเวส" },
  { slug: "koi", catId: "115230", name: "หลวงพ่อกอย วัดเขาดินใต้" },
  { slug: "thongthaeng", catId: "102281", name: "อาจารย์ทองแท่ง จ.ชัยภูมิ" },
  { slug: "watsuthat", catId: "8687", name: "วัดสุทัศน์" },
];
await upsert(
  "masters",
  mastersConfig.map((m, i) => ({
    slug: m.slug,
    cat_id: m.catId,
    name: m.name,
    videos: m.videos ?? [],
    position: i,
  })),
  { onConflict: "slug", ignoreDuplicates: true }
);

// ── settings ──────────────────────────────────────────────────────────────
await upsert("settings", [{ key: "next_ceremony", value: null }], {
  onConflict: "key",
  ignoreDuplicates: true,
});

console.log("เสร็จสมบูรณ์ ✅");
