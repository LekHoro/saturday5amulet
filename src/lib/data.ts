import productsRaw from "@/data/products.json";
import articlesRaw from "@/data/articles.json";
import newsRaw from "@/data/news.json";

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
