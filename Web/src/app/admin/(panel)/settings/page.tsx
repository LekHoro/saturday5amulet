import { createSupabaseServer } from "@/lib/supabase/server";
import { getData, productsInCategory, categoryGroups } from "@/lib/db";
import { coverImage } from "@/lib/media";
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
          coverImage(items.find((p) => !p.soldOut && coverImage(p.images))?.images) ??
          coverImage(items.find((p) => coverImage(p.images))?.images) ??
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
        <h2 className="font-heading font-semibold text-gold-light">รูปประจำหมวด (หน้าแรก + หน้ารวมสินค้า)</h2>
        <p className="mt-1 text-xs leading-relaxed text-smoke">
          ใช้ทั้งการ์ดหมวดบนหน้าแรก (กุมารทอง / น้องกุมารี / เครื่องราง 3 หมวด — ยังไม่ตั้งรูปจะขึ้นเป็นไอคอน)
          และรูปเล็กหน้าหัวข้อหมวดบนหน้ารวมวัตถุมงคล ซึ่งปกติหยิบรูปสินค้าในหมวดให้อัตโนมัติ
          แนะนำหมวดกุมารทองใช้รูปแนวตั้ง 3:4 (900×1200) หมวดอื่นใช้จตุรัส (800×800)
          องค์อยู่กลางภาพ ไม่มีตัวหนังสือ — กดลบเมื่อไรก็กลับไปใช้รูปอัตโนมัติ
        </p>
        <div className="mt-3">
          <CategoryImagesForm cats={showcaseCats} initial={categoryImages} />
        </div>
      </section>
    </div>
  );
}
