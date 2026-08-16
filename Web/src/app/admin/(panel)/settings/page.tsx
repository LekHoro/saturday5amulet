import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getData, productsInCategory, categoryGroups } from "@/lib/db";
import { coverImage } from "@/lib/media";
import CeremonyForm from "./CeremonyForm";
import CategoryImagesForm, { type CategoryImageRow } from "./CategoryImagesForm";
import ShrinkImagesTool from "./ShrinkImagesTool";

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

      <Link
        href="/admin/settings/home"
        className="mt-4 flex items-center gap-3 rounded-2xl border border-gold/25 bg-night-soft p-5 transition hover:border-gold"
      >
        <span aria-hidden className="text-2xl">🧱</span>
        <span className="min-w-0 flex-1">
          <span className="font-heading block font-semibold text-gold-light">จัดบล็อกหน้าแรก</span>
          <span className="mt-1 block text-xs leading-relaxed text-smoke">
            สลับลำดับบล็อกบนหน้าแรก ซ่อนบล็อกที่ไม่อยากโชว์ หรือเพิ่มแถวสินค้าตามหมวดเอง
          </span>
        </span>
        <span className="text-smoke">›</span>
      </Link>

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

      <section className="mt-4 rounded-2xl border border-gold/25 bg-night-soft p-5">
        <h2 className="font-heading font-semibold text-gold-light">ย่อรูปเก่าให้เว็บโหลดไว</h2>
        <p className="mt-1 text-xs leading-relaxed text-smoke">
          รูปที่ย้ายมาจากเว็บเดิม (igetweb) หลายรูปเป็นไฟล์เต็มความละเอียด บางรูป 5 MB
          ทำให้ลูกค้าโหลดหน้าเว็บช้าโดยเปล่าประโยชน์ ปุ่มนี้จะย่อให้ด้านยาวสุดไม่เกิน 1600px
          เท่ามาตรฐานรูปที่อัปใหม่ แล้วเขียนทับรูปเดิม — ลิงก์รูปทุกที่ในเว็บไม่เปลี่ยน
          ไม่ต้องแก้สินค้าหรือบทความใด ๆ
        </p>
        <p className="mt-2 text-xs leading-relaxed text-smoke">
          ทำงานบนเครื่องคุณผ่านหน้านี้ ต้องเปิดหน้านี้ค้างไว้จนเสร็จ (ปิดแท็บแล้วหยุดกลางคัน
          เปิดมากดใหม่ได้ ระบบจะข้ามรูปที่ย่อไปแล้ว) · <strong className="text-ivory/90">ย่อแล้วย้อนกลับไม่ได้</strong>{" "}
          รูปต้นฉบับสำรองไว้ในเครื่องที่โฟลเดอร์ Images/_storage-backup-2026-08-14 แล้ว
        </p>
        <div className="mt-4">
          <ShrinkImagesTool />
        </div>
      </section>
    </div>
  );
}
