import { createSupabaseServer } from "@/lib/supabase/server";
import NewMasterForm, { type CatCountOption } from "./NewMasterForm";
import type { Category } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NewMasterPage() {
  const sb = await createSupabaseServer();
  const [{ data: productRows }, { data: masterRows }] = await Promise.all([
    sb.from("products").select("categories"),
    sb.from("masters").select("cat_id"),
  ]);

  // เลือกได้เฉพาะหมวดหมู่ที่มีสินค้าอยู่แล้วแต่ยังไม่มีอาจารย์ผูกไว้ — กันสร้างการ์ดอาจารย์ที่ไม่มีวัตถุมงคลให้แสดง
  const claimed = new Set((masterRows ?? []).map((m) => m.cat_id as string));
  const counts = new Map<string, { name: string; count: number }>();
  for (const r of productRows ?? []) {
    for (const c of (r.categories ?? []) as Category[]) {
      if (claimed.has(c.id)) continue;
      const cur = counts.get(c.id);
      counts.set(c.id, { name: c.name, count: (cur?.count ?? 0) + 1 });
    }
  }
  const options: CatCountOption[] = [...counts.entries()]
    .map(([id, v]) => ({ id, name: v.name, count: v.count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-gold">เพิ่มอาจารย์ใหม่</h1>
      <p className="mt-1 text-sm text-smoke">
        เลือกหมวดหมู่สินค้าที่มีอยู่แล้วแต่ยังไม่มีการ์ดอาจารย์ ระบบจะดึงวัตถุมงคลในหมวดนั้นมาแสดงในหน้าประวัติให้อัตโนมัติ
      </p>
      <div className="mt-4">
        <NewMasterForm options={options} />
      </div>
    </div>
  );
}
