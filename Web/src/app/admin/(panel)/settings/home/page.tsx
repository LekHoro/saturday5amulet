import Link from "next/link";
import { getData, categoryGroups, categoryCount } from "@/lib/db";
import { normalizeHomeBlocks } from "@/lib/home-blocks";
import { createSupabaseServer } from "@/lib/supabase/server";
import HomeBlocksForm, { type CatOption } from "./HomeBlocksForm";

export const dynamic = "force-dynamic";

export default async function AdminHomeBlocksPage() {
  const sb = await createSupabaseServer();
  const [{ data: row }, site] = await Promise.all([
    sb.from("settings").select("value").eq("key", "home_blocks").maybeSingle(),
    getData(),
  ]);
  const blocks = normalizeHomeBlocks(row?.value);

  // หมวดให้เลือกตอนเพิ่ม "แถวสินค้า" — เอาเฉพาะหมวดที่ยังมีสินค้าอยู่จริง
  const cats: CatOption[] = categoryGroups.flatMap((g) =>
    g.ids
      .filter((id) => categoryCount(site, id) > 0)
      .map((id) => ({ id, name: site.categoryNames[id] ?? id, group: g.label }))
  );

  return (
    <div>
      <Link href="/admin/settings" className="text-sm text-smoke transition hover:text-gold-light">
        ‹ ตั้งค่า
      </Link>
      <h1 className="font-heading mt-2 text-xl font-bold text-gold">จัดบล็อกหน้าแรก</h1>
      <p className="mt-2 text-xs leading-relaxed text-smoke">
        ลำดับในลิสต์นี้คือลำดับที่ลูกค้าเห็นบนหน้าแรก จากบนลงล่าง — กด ▲▼ เพื่อสลับที่
        กด &ldquo;แสดงอยู่/ซ่อนอยู่&rdquo; เพื่อเอาบล็อกออกจากหน้าเว็บโดยไม่ต้องลบทิ้ง
        แล้วกดบันทึกลำดับ หน้าเว็บจะเปลี่ยนทันที
      </p>
      <p className="mt-2 text-xs leading-relaxed text-smoke">
        เนื้อหาในแต่ละบล็อกแก้จากที่เดิม (สินค้า/บทความ/อาจารย์/รูปประจำหมวด) หน้านี้จัดแค่ลำดับกับซ่อน-แสดง
      </p>

      <div className="mt-4">
        <HomeBlocksForm initial={blocks} cats={cats} />
      </div>
    </div>
  );
}
