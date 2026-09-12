import type { Category } from "@/lib/data";

/** หมวดที่ใช้อยู่จริงในอัลบั้มทั้งหมด — unique ตามชื่อ ให้ฟอร์มโชว์เป็นชิปเลือก กันสะกดต่างกันแล้วหมวดแตก */
export function buildGalleryCatOptions(rows: { categories: unknown }[]): Category[] {
  const seen = new Map<string, Category>();
  for (const r of rows) {
    for (const c of (r.categories ?? []) as Category[]) {
      const name = c.name?.trim();
      if (name && !seen.has(name)) seen.set(name, { id: c.id, name });
    }
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name, "th"));
}
