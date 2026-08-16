import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import MastersAdminList, { type AdminMaster } from "./MastersAdminList";

export const dynamic = "force-dynamic";

export default async function AdminMastersPage() {
  const sb = await createSupabaseServer();
  const { data, error } = await sb
    .from("masters")
    .select("slug,name,photo,bio,videos,position")
    .order("position");

  if (error) {
    return <p className="text-sm text-ember">อ่านข้อมูลไม่สำเร็จ: {error.message}</p>;
  }

  const masters: AdminMaster[] = (data ?? []).map((m) => ({
    slug: m.slug,
    name: m.name,
    photo: m.photo,
    bio: m.bio,
    videosCount: (m.videos as unknown[] | null)?.length ?? 0,
    position: m.position ?? 0,
  }));

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-xl font-bold text-gold">ครูบาอาจารย์</h1>
        <Link
          href="/admin/masters/new"
          className="rounded-xl bg-gold px-4 py-2 text-sm font-bold text-night transition hover:brightness-110"
        >
          ＋ เพิ่มอาจารย์ใหม่
        </Link>
      </div>
      <p className="mt-1 text-sm text-smoke">
        แตะเพื่อใส่รูป ประวัติ และวิดีโอของแต่ละท่าน (เว้นว่างได้ เว็บจะซ่อนให้เอง) ·
        ใช้ลูกศร ▲▼ จัดลำดับการแสดงผลที่หน้าเว็บ
      </p>
      <MastersAdminList masters={masters} />
    </div>
  );
}
