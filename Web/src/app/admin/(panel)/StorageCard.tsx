import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";

/** โฟลเดอร์ทั้งหมดใน bucket images — ชุดเดียวกับเครื่องมือย่อรูปในหน้าตั้งค่า */
const FOLDERS = ["legacy", "products", "articles", "content", "masters", "categories", "banners"];

/** เพดาน storage แผนฟรีของ Supabase — เต็มเมื่อไรรูปใหม่อัปไม่ขึ้น */
const BUDGET_BYTES = 1024 * 1024 * 1024;

/** รูปที่ใหญ่พอให้เครื่องมือย่อรูปสนใจ (เกณฑ์เดียวกับ ShrinkImagesTool) */
const BIG_SIZE = 350_000;

function mb(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}

/**
 * สรุปพื้นที่รูปในคลัง — เตือนก่อนเต็ม ไม่ใช่รู้ตัวตอนเว็บพังแบบคราว quota รูปเต็ม
 * อ่านรายชื่อไฟล์ทุกโฟลเดอร์ เลยแยกเป็นคอมโพเนนต์ให้สตรีมมาทีหลัง หน้าไม่ต้องรอ
 */
export default async function StorageCard() {
  const sb = await createSupabaseServer();
  let totalBytes = 0;
  let fileCount = 0;
  let bigCount = 0;

  try {
    for (const folder of FOLDERS) {
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await sb.storage.from("images").list(folder, { limit: 1000, offset });
        if (error) throw new Error(error.message);
        if (!data?.length) break;
        for (const o of data) {
          const size = (o.metadata?.size as number | undefined) ?? 0;
          if (size > 0) {
            totalBytes += size;
            fileCount++;
            if (size >= BIG_SIZE) bigCount++;
          }
        }
        if (data.length < 1000) break;
      }
    }
  } catch {
    // อ่านไม่ได้ก็ไม่ต้องโชว์ — การ์ดนี้เป็นสัญญาณเสริม ไม่ใช่ของหลัก
    return null;
  }

  const pct = Math.min(100, Math.round((totalBytes / BUDGET_BYTES) * 100));
  const tight = pct >= 70;

  return (
    <section className="rounded-2xl border border-gold/20 bg-night-soft p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="font-heading text-sm font-semibold text-gold-light">พื้นที่รูปในคลัง</h2>
        <p className="text-xs text-smoke">
          {fileCount.toLocaleString("th-TH")} รูป · {mb(totalBytes)} จาก {mb(BUDGET_BYTES)} ({pct}%)
        </p>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="พื้นที่รูปที่ใช้ไป"
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-night"
      >
        <div
          className={`h-full rounded-full ${tight ? "bg-ember" : "bg-gold/70"}`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-smoke">
        {tight
          ? "พื้นที่เริ่มตึงแล้ว — ย่อรูปเก่าก่อนอัปรูปใหม่ไม่ขึ้น"
          : bigCount > 0
            ? `มีรูปไฟล์ใหญ่ (เกิน 0.35 MB) อยู่ ${bigCount.toLocaleString("th-TH")} รูป ย่อได้เมื่อว่าง`
            : "รูปทุกไฟล์ขนาดมาตรฐานแล้ว"}
        {" · "}
        <Link href="/admin/settings" className="text-gold-light underline-offset-2 hover:underline">
          เครื่องมือย่อรูปอยู่ในตั้งค่า ›
        </Link>
      </p>
    </section>
  );
}
