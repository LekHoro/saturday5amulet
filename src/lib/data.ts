// ชนิดข้อมูล + ตัวช่วย pure + JSON fallback ของทั้งเว็บ
// การอ่านข้อมูลจริงทำผ่าน getData() ใน "@/lib/db" (Supabase ถ้าตั้งค่าแล้ว, ไม่งั้นใช้ JSON ในไฟล์นี้)
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

export interface Gallery {
  id: string;
  title: string;
  images: string[];
}

// --- ครูบาอาจารย์ / สำนัก (แกน "master") --------------------------------
// จุดขายหลักของร้าน: รวมวัตถุมงคลตามอาจารย์ผู้ปลุกเสก
// photo/bio/videos เจ้าของกรอกภายหลังผ่าน /admin (ห้ามแต่ง bio เอง เป็นบุคคล/พระจริง)
export interface Master {
  slug: string;
  catId: string;
  name: string;
  photo?: string;
  bio?: string;
  videos?: { id: string; title: string }[];
}

export interface MasterWithMeta extends Master {
  count: number;
  available: number;
  /** รูปตัวแทนจากวัตถุมงคล ใช้เมื่อยังไม่มีรูปอาจารย์ */
  cover: string | null;
}

export interface Ceremony {
  label: string;
  date: string;
}

/** ข้อมูลทั้งเว็บหนึ่งชุด — โหลดครั้งเดียวต่อ cache ผ่าน getData() */
export interface SiteData {
  products: Product[];
  availableProducts: Product[];
  articles: Article[];
  news: Article[];
  galleries: Gallery[];
  masters: MasterWithMeta[];
  categoryNames: Record<string, string>;
  nextCeremony: Ceremony | null;
}

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

// fallback masters config เมื่อยังไม่ต่อ Supabase (ใน Supabase อยู่ตาราง masters)
export const mastersConfig: Master[] = [
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

// --- ตัวช่วย pure (ทำงานกับ SiteData ที่ได้จาก getData()) -----------------

export function productsInCategory(data: SiteData, catId: string): Product[] {
  return data.products.filter((p) => p.categories.some((c) => c.id === catId));
}

export function categoryCount(data: SiteData, catId: string): number {
  return productsInCategory(data, catId).length;
}

export function getProduct(data: SiteData, id: string): Product | undefined {
  return data.products.find((p) => p.id === id);
}

export function getArticle(data: SiteData, id: string): Article | undefined {
  return data.articles.find((a) => a.id === id) ?? data.news.find((a) => a.id === id);
}

export function getGallery(data: SiteData, id: string): Gallery | undefined {
  return data.galleries.find((g) => g.id === id);
}

export function getMaster(data: SiteData, slug: string): MasterWithMeta | undefined {
  return data.masters.find((m) => m.slug === slug);
}

/** คำนวณ count/available/cover ให้อาจารย์ทุกท่าน + เรียงตามจำนวนรุ่น */
export function computeMasters(configs: Master[], products: Product[]): MasterWithMeta[] {
  return configs
    .map((m) => {
      const items = products.filter((p) => p.categories.some((c) => c.id === m.catId));
      const firstWithImage = items.find((p) => p.images[0]);
      return {
        ...m,
        count: items.length,
        available: items.filter((p) => !p.soldOut).length,
        cover: m.photo ?? firstWithImage?.images[0] ?? null,
      };
    })
    .filter((m) => m.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function buildCategoryNames(products: Product[]): Record<string, string> {
  const names: Record<string, string> = {};
  for (const p of products) for (const c of p.categories) names[c.id] = c.name;
  return names;
}

// --- ฉบับเบา (light) สำหรับ snapshot กลาง ---------------------------------
// unstable_cache จำกัด payload 2MB — snapshot กลางจึงตัด html ยาว ๆ ออก
// (หน้า detail ดึงเนื้อหาเต็มเป็นรายชิ้นผ่าน getProductFull/getArticleFull)
const EXCERPT = 300;

export function lightenProduct(p: Product): Product {
  return {
    ...p,
    descriptionHtml: null,
    descriptionText: p.descriptionText ? p.descriptionText.slice(0, EXCERPT) : null,
  };
}

export function lightenArticle(a: Article): Article {
  return {
    ...a,
    contentHtml: null,
    contentText: a.contentText ? a.contentText.slice(0, EXCERPT) : null,
  };
}

// --- JSON fallback (ใช้เมื่อยังไม่ตั้งค่า Supabase หรือ Supabase ล่ม) ------

// keep only images hosted by the shop/igetweb (drops emoji/tracker images picked up in scraped content)
const OWN_IMAGE = /cache-igetweb-v2\.mt108\.info|cdn\.igetweb\.com|saturday5amulet\.com/;
function ownImages<T extends { images: string[] }>(item: T): T {
  return { ...item, images: (item.images ?? []).filter((u) => OWN_IMAGE.test(u)) };
}

function jsonProducts(): Product[] {
  return (productsRaw as Product[]).filter((p) => p.title).map(ownImages);
}
function jsonArticles(): Article[] {
  return (articlesRaw as Article[]).filter((a) => a.title).map(ownImages);
}
function jsonNews(): Article[] {
  return (newsRaw as Article[]).filter((a) => a.title && !("error" in a)).map(ownImages);
}

export function jsonSnapshot(): SiteData {
  const products = jsonProducts().map(lightenProduct);
  const galleries = (galleriesRaw as Gallery[]).filter((g) => g.title && g.images.length > 0);
  return {
    products,
    availableProducts: products.filter((p) => !p.soldOut),
    articles: jsonArticles().map(lightenArticle),
    news: jsonNews().map(lightenArticle),
    galleries,
    masters: computeMasters(mastersConfig, products),
    categoryNames: buildCategoryNames(products),
    nextCeremony: null,
  };
}

/** สินค้าฉบับเต็ม (มี html) จาก JSON */
export function jsonProduct(id: string): Product | null {
  return jsonProducts().find((p) => p.id === id) ?? null;
}

/** บทความ/ข่าวฉบับเต็ม (มี html) จาก JSON */
export function jsonArticle(id: string): Article | null {
  return jsonArticles().find((a) => a.id === id) ?? jsonNews().find((a) => a.id === id) ?? null;
}

/** youtube id หรือ url → embed url */
export function youtubeEmbed(v: string | undefined): string | null {
  if (!v) return null;
  const m = v.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/) ?? v.match(/^([\w-]{11})$/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

// ช่อง YouTube ของร้าน
export const YOUTUBE_CHANNEL = "https://www.youtube.com/c/saturday5amulet";

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
