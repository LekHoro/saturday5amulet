import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminMastersPage() {
  const sb = await createSupabaseServer();
  const { data, error } = await sb
    .from("masters")
    .select("slug,name,photo,bio,videos")
    .order("position");

  if (error) {
    return <p className="text-sm text-ember">อ่านข้อมูลไม่สำเร็จ: {error.message}</p>;
  }

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-gold">ครูบาอาจารย์</h1>
      <p className="mt-1 text-sm text-smoke">
        แตะเพื่อใส่รูป ประวัติ และวิดีโอของแต่ละท่าน (เว้นว่างได้ เว็บจะซ่อนให้เอง)
      </p>
      <ul className="mt-4 space-y-2">
        {(data ?? []).map((m) => (
          <li key={m.slug}>
            <Link
              href={`/admin/masters/${m.slug}`}
              className="flex items-center gap-3 rounded-2xl border border-gold/20 bg-night-soft p-3 transition hover:border-gold"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gold/40 bg-night">
                {m.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">🙏</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{m.name}</div>
                <div className="mt-0.5 text-xs text-smoke">
                  {[
                    m.photo ? "มีรูป" : "ยังไม่มีรูป",
                    m.bio ? "มีประวัติ" : "ยังไม่มีประวัติ",
                    `วิดีโอ ${(m.videos as unknown[])?.length ?? 0}`,
                  ].join(" · ")}
                </div>
              </div>
              <span className="text-smoke">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
