import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import GalleryAdminList, { type AdminGallery } from "./GalleryAdminList";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage({
  searchParams,
}: {
  // saved=1 / deleted=1 มาจากฟอร์ม — เด้งกลับมาหน้านี้แล้วยืนยันผลด้วย toast
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const sp = await searchParams;
  const flash = sp.saved === "1" ? "saved" : sp.deleted === "1" ? "deleted" : undefined;
  const sb = await createSupabaseServer();
  const { data, error } = await sb
    .from("galleries")
    .select("id,title,images,position,updated_at")
    .order("position");

  if (error) {
    return <p className="text-sm text-ember">อ่านข้อมูลไม่สำเร็จ: {error.message}</p>;
  }

  const galleries: AdminGallery[] = (data ?? []).map((g) => {
    const images = (g.images ?? []) as string[];
    return {
      id: g.id,
      title: g.title,
      cover: images[0] ?? null,
      count: images.length,
      position: g.position ?? 0,
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-xl font-bold text-gold">ภาพงานพิธี</h1>
        <Link
          href="/admin/gallery/new"
          className="rounded-xl bg-gold px-4 py-2 text-sm font-bold text-night transition hover:brightness-110"
        >
          ＋ เพิ่มอัลบั้มใหม่
        </Link>
      </div>
      <p className="mt-1 text-sm text-smoke">
        อัลบั้มรูปพิธีปลุกเสก ไหว้ครู เททอง — 5 อัลบั้มบนสุดขึ้นบล็อก “ภาพงานพิธีจริง” บนหน้าแรก ·
        ใช้ลูกศร ▲▼ จัดลำดับ แตะอัลบั้มเพื่อเพิ่ม/ลบรูปหรือแก้ชื่อ
      </p>
      <GalleryAdminList galleries={galleries} flash={flash} />
    </div>
  );
}
