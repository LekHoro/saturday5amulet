import productsRaw from "@/data/products.json";
import articlesRaw from "@/data/articles.json";
import newsRaw from "@/data/news.json";
import galleriesRaw from "@/data/galleries.json";

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  url: string;
  title: string;
  priceText: string;
  price: number | null;
  sku: string | null;
  updatedAt: string | null;
  soldOut: boolean;
  categories: Category[];
  descriptionHtml: string | null;
  descriptionText: string | null;
  images: string[];
  meta: { title: string; description: string | null; keywords: string | null };
}

export interface Article {
  id: string;
  url: string;
  kind: string;
  title: string;
  dateText: string | null;
  views: number | null;
  categories: Category[];
  contentHtml: string | null;
  contentText: string | null;
  images: string[];
  meta: { title: string; description: string | null; keywords: string | null };
}

// keep only images hosted by the shop/igetweb (drops emoji/tracker images picked up in scraped content)
const OWN_IMAGE = /cache-igetweb-v2\.mt108\.info|cdn\.igetweb\.com|saturday5amulet\.com/;
function ownImages<T extends { images: string[] }>(item: T): T {
  return { ...item, images: (item.images ?? []).filter((u) => OWN_IMAGE.test(u)) };
}

export const products = (productsRaw as Product[]).filter((p) => p.title).map(ownImages);
export const articles = (articlesRaw as Article[]).filter((a) => a.title).map(ownImages);
export const news = (newsRaw as Article[]).filter((a) => a.title && !("error" in a)).map(ownImages);

// Curated category groups for navigation
export const categoryGroups: { label: string; slug: string; ids: string[] }[] = [
  {
    label: "ตามประเภท",
    slug: "type",
    ids: ["121326", "121327", "102534", "8647", "102388"],
  },
  {
    label: "ตามพุทธคุณ",
    slug: "power",
    ids: ["91638", "41976", "102273"],
  },
  {
    label: "ตามพระเกจิ / อาจารย์",
    slug: "master",
    ids: ["8672", "8650", "8681", "8670", "8652", "8657", "8667", "43623", "8665", "115230", "88394", "88396", "102281", "8687"],
  },
];

export const categoryNames: Record<string, string> = {};
for (const p of products) for (const c of p.categories) categoryNames[c.id] = c.name;

export function productsInCategory(catId: string): Product[] {
  return products.filter((p) => p.categories.some((c) => c.id === catId));
}

export function categoryCount(catId: string): number {
  return productsInCategory(catId).length;
}

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getArticle(id: string): Article | undefined {
  return articles.find((a) => a.id === id) ?? news.find((a) => a.id === id);
}

export const availableProducts = products.filter((p) => !p.soldOut);

// --- ครูบาอาจารย์ / สำนัก (แกน "master") --------------------------------
// จุดขายหลักของร้าน: รวมวัตถุมงคลตามอาจารย์ผู้ปลุกเสก
// photo/bio/youtube เว้นไว้ให้เจ้าของกรอกภายหลังผ่าน /admin ได้
export interface Master {
  slug: string;
  catId: string;
  name: string;
  /** รูปอาจารย์ (ถ้ามี) — ถ้าเว้นว่างจะใช้รูปวัตถุมงคลตัวแทน */
  photo?: string;
  /** ประวัติย่อ — เจ้าของกรอกเพิ่มภายหลัง (ห้ามแต่งเอง เป็นบุคคล/พระจริง) */
  bio?: string;
  /** วิดีโอ YouTube ที่เกี่ยวข้อง (พิธี/คาถา) — ใส่ id 11 ตัว หรือ url */
  videos?: { id: string; title: string }[];
}

// เรียงตามจำนวนรุ่น (มากไปน้อย) จะจัดใน getMasters()
export const mastersConfig: Master[] = [
  { slug: "amnard", catId: "8650", name: "พระอาจารย์อำนาจ มหาวีโร" },
  {
    slug: "subin",
    catId: "8672",
    name: "อาจารย์สุบิน นะหน้าทอง",
    // วิดีโอจริงจากช่องของร้าน (ดึงจากบทความคาถาเดิม)
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

export interface MasterWithMeta extends Master {
  count: number;
  available: number;
  /** รูปตัวแทนจากวัตถุมงคล ใช้เมื่อยังไม่มีรูปอาจารย์ */
  cover: string | null;
}

function withMeta(m: Master): MasterWithMeta {
  const items = productsInCategory(m.catId);
  const firstWithImage = items.find((p) => p.images[0]);
  return {
    ...m,
    count: items.length,
    available: items.filter((p) => !p.soldOut).length,
    cover: m.photo ?? firstWithImage?.images[0] ?? null,
  };
}

// อาจารย์ที่มีวัตถุมงคลจริง เรียงตามจำนวนรุ่น
export const masters: MasterWithMeta[] = mastersConfig
  .map(withMeta)
  .filter((m) => m.count > 0)
  .sort((a, b) => b.count - a.count);

export function getMaster(slug: string): MasterWithMeta | undefined {
  return masters.find((m) => m.slug === slug);
}

/** youtube id หรือ url → embed url */
export function youtubeEmbed(v: string | undefined): string | null {
  if (!v) return null;
  const m = v.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/) ?? v.match(/^([\w-]{11})$/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

// ช่อง YouTube ของร้าน
export const YOUTUBE_CHANNEL = "https://www.youtube.com/c/saturday5amulet";

// --- ภาพงานพิธีจริง (galleries) ------------------------------------------
// ใช้สร้างความน่าเชื่อถือ: รูปพิธีปลุกเสก/ไหว้ครู/เททอง ที่เกิดขึ้นจริง
export interface Gallery {
  id: string;
  title: string;
  images: string[];
}

export const galleries = (galleriesRaw as Gallery[]).filter(
  (g) => g.title && g.images.length > 0
);

export function getGallery(id: string): Gallery | undefined {
  return galleries.find((g) => g.id === id);
}

// --- นับถอยหลังวันมงคล "เสาร์ ๕" -----------------------------------------
// เจ้าของกรอกวันพิธี/วันเสาร์ห้าถัดไปที่นี่ (รูปแบบ YYYY-MM-DD, เวลาไทย)
// เว้น null ไว้ = ไม่แสดงบล็อกนับถอยหลัง (จะได้ไม่ขึ้นวันที่มั่ว)
export const nextCeremony: { label: string; date: string } | null = null;
// ตัวอย่างเมื่อเจ้าของยืนยันวันแล้ว:
// export const nextCeremony = { label: "พิธีเสาร์ ๕ มหามงคล", date: "2027-04-03" };

// strip igetweb wrapper header ("รายละเอียดสินค้า") from scraped html
export function cleanHtml(html: string | null): string {
  if (!html) return "";
  return html
    .replace(/<div class="page-header">[\s\S]*?<\/div>\s*<\/div>|<div class="page-header">[\s\S]*?<\/div>/, "")
    .replace(/style="[^"]*"/g, "")
    .replace(/class="[^"]*"/g, "");
}

export function thumb(p: Product): string | null {
  return p.images[0] ?? null;
}
