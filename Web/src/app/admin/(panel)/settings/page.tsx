import { createSupabaseServer } from "@/lib/supabase/server";
import { getData, productsInCategory, categoryGroups } from "@/lib/db";
import CeremonyForm from "./CeremonyForm";
import CategoryImagesForm, { type CategoryImageRow } from "./CategoryImagesForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const sb = await createSupabaseServer();
  const [{ data }, { data: catImagesRow }, site] = await Promise.all([
    sb.from("settings").select("value").eq("key", "next_ceremony").maybeSingle(),
    sb.from("settings").select("value").eq("key", "category_images").maybeSingle(),
    getData(),
  ]);
  const ceremony = (data?.value ?? null) as { label: string; date: string } | null;
  const categoryImages = (catImagesRow?.value ?? {}) as Record<string, string>;

  // หมวดบนแถบ showcase หน้ารวมสินค้า (ประเภท+พุทธคุณ — ไม่รวมพระเกจิ)
  const showcaseCats: CategoryImageRow[] = categoryGroups
    .filter((g) => g.slug !== "master")
    .flatMap((g) =>
      g.ids.map((id) => {
        const items = productsInCategory(site, id);
        const auto =
          items.find((p) => !p.soldOut && p.images[0])?.images[0] ??
          items.find((p) => p.images[0])?.images[0] ??
          null;
        return { id, name: site.categoryNames[id] ?? id, group: g.label, auto };
      })
    );

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-gold">ตั้งค่า</h1>

      <section className="mt-4 rounded-2xl border border-gold/25 bg-night-soft p-5">
        <h2 className="font-heading font-semibold text-gold-light">นับถอยหลังวันพิธี เสาร์ ๕</h2>
        <p className="mt-1 text-xs leading-relaxed text-smoke">
          ใส่ชื่องานกับวันที่ หน้าแรกจะขึ้นบล็อกนับถอยหลังอัตโนมัติ — ลบออก (เว้นว่างแล้วบันทึก)
          เว็บจะซ่อนบล็อกนี้
        </p>
        <div className="mt-4">
          <CeremonyForm initial={ceremony} />
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-gold/25 bg-night-soft p-5">
        <h2 className="font-heading font-semibold text-gold-light">รูปประจำหมวด (หน้ารวมสินค้า)</h2>
        <p className="mt-1 text-xs leading-relaxed text-smoke">
          รูปการ์ดหมวดบนหน้ารวมวัตถุมงคล — ปกติระบบหยิบรูปสินค้าในหมวดให้อัตโนมัติ
          ตั้งรูปเองได้ถ้าอยากได้รูปสวยประจำหมวด (แนะนำรูปแนวนอน เห็นองค์ชัดกลางภาพ
          ไม่มีตัวหนังสือในรูป) — กดลบเมื่อไรก็กลับไปใช้รูปอัตโนมัติ
        </p>
        <div className="mt-3">
          <CategoryImagesForm cats={showcaseCats} initial={categoryImages} />
        </div>
      </section>
    </div>
  );
}
