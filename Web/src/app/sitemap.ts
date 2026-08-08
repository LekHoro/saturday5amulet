import type { MetadataRoute } from "next";
import { getData } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";

// ทุกหน้ามีสองภาษา: ไทยที่ path เดิม, อังกฤษใต้ /en — ใส่ alternates ให้ Google จับคู่ hreflang
function entry(
  path: string,
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>,
  priority: number
): MetadataRoute.Sitemap {
  const th = `${SITE_URL}${path === "/" ? "/" : path}`;
  const en = `${SITE_URL}/en${path === "/" ? "" : path}`;
  const languages = { th, en };
  return [
    { url: th, changeFrequency, priority, alternates: { languages } },
    { url: en, changeFrequency, priority: priority * 0.9, alternates: { languages } },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, articles, news, masters, galleries } = await getData();
  return [
    ...entry("/", "daily", 1),
    ...entry("/products", "daily", 0.9),
    ...entry("/masters", "weekly", 0.8),
    ...entry("/gallery", "weekly", 0.6),
    ...entry("/articles", "daily", 0.7),
    ...entry("/how-to-order", "monthly", 0.6),
    ...products.flatMap((p) => entry(`/products/${p.id}`, "weekly", p.soldOut ? 0.4 : 0.8)),
    ...masters.flatMap((m) => entry(`/masters/${m.slug}`, "weekly", 0.7)),
    ...galleries.flatMap((g) => entry(`/gallery/${g.id}`, "monthly", 0.5)),
    ...[...articles, ...news].flatMap((a) => entry(`/articles/${a.id}`, "monthly", 0.6)),
  ];
}
