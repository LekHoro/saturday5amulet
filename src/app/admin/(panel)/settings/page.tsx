import { createSupabaseServer } from "@/lib/supabase/server";
import CeremonyForm from "./CeremonyForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const sb = await createSupabaseServer();
  const { data } = await sb
    .from("settings")
    .select("value")
    .eq("key", "next_ceremony")
    .maybeSingle();
  const ceremony = (data?.value ?? null) as { label: string; date: string } | null;

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
    </div>
  );
}
