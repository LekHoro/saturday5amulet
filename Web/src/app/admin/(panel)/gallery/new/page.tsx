import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import GalleryForm from "../GalleryForm";
import { buildGalleryCatOptions } from "../catOptions";

export const dynamic = "force-dynamic";

export default async function NewGalleryPage() {
  const sb = await createSupabaseServer();
  const { data } = await sb.from("galleries").select("categories");
  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/gallery"
        className="inline-flex items-center gap-1 text-sm text-smoke transition hover:text-gold-light"
      >
        ← กลับไปรายการอัลบั้ม
      </Link>
      <h1 className="mt-2 font-heading text-xl font-bold text-gold">เพิ่มอัลบั้มใหม่</h1>
      <p className="mt-1 text-sm text-smoke">
        อัลบั้มใหม่จะขึ้นบนสุดและโชว์ในบล็อก “ภาพงานพิธีจริง” บนหน้าแรกทันทีที่บันทึก
      </p>
      <div className="mt-4">
        <GalleryForm catOptions={buildGalleryCatOptions(data ?? [])} />
      </div>
    </div>
  );
}
