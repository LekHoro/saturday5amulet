import type { MetadataRoute } from "next";
import { products, articles, news, masters, galleries } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/masters`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/gallery`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/articles`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/how-to-order`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/products/${p.id}`,
    changeFrequency: "weekly",
    priority: p.soldOut ? 0.4 : 0.8,
  }));

  const articlePages: MetadataRoute.Sitemap = [...articles, ...news].map((a) => ({
    url: `${SITE_URL}/articles/${a.id}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const masterPages: MetadataRoute.Sitemap = masters.map((m) => ({
    url: `${SITE_URL}/masters/${m.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const galleryPages: MetadataRoute.Sitemap = galleries.map((g) => ({
    url: `${SITE_URL}/gallery/${g.id}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticPages, ...productPages, ...masterPages, ...galleryPages, ...articlePages];
}
