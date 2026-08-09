import type { Article, Category } from "@/lib/data";

/** หมวดหมู่ที่ใช้อยู่จริงในบทความ/ข่าวทั้งหมด — unique ตามชื่อ (ตัดช่องว่างหัวท้าย) */
export function buildArticleCatOptions(articles: Article[]): Category[] {
  const seen = new Map<string, Category>();
  for (const a of articles) {
    for (const c of a.categories ?? []) {
      const name = c.name.trim();
      if (name && !seen.has(name)) seen.set(name, { id: c.id, name });
    }
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name, "th"));
}
