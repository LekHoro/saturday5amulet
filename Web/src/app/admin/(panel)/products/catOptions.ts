import { categoryGroups, buildCategoryNames, type Product } from "@/lib/data";
import type { CatOption } from "./ProductForm";

/** ตัวเลือกหมวดหมู่สำหรับฟอร์มสินค้า — ชื่อหมวดดึงจากสินค้าที่มีอยู่จริง */
export function buildCatOptions(products: Product[]): CatOption[] {
  const names = buildCategoryNames(products);
  return categoryGroups.flatMap((g) =>
    g.ids
      .filter((id) => names[id])
      .map((id) => ({ id, name: names[id], group: g.label }))
  );
}
