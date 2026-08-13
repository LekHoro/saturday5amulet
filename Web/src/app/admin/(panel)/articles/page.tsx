import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import ArticleAdminList, { type AdminArticle } from "./ArticleAdminList";
import type { Category, EnContent } from "@/lib/data";

// อ่านตรงจาก Supabase เสมอ (ไม่ใช้ cache ของหน้าเว็บ) เพื่อให้เห็นสถานะล่าสุด
export const dynamic = "force-dynamic";

export default async function AdminArticlesPage({
  searchParams,
}: {
  // saved=1 มาจากปุ่ม "บันทึก" ในฟอร์ม — เด้งกลับมาหน้านี้แล้วยืนยันผลด้วย toast
  searchParams: Promise<{ saved?: string }>;
}) {
  const sp = await searchParams;
  const sb = await createSupabaseServer();
  const { data, error } = await sb
    .from("articles")
    .select("id,kind,title,date_text,views,categories,images,en")
    .order("position")
    .limit(5000);

  if (error) {
    return (
      <p className="text-sm text-ember">
        อ่านข้อมูลไม่สำเร็จ: {error.message} — ตรวจว่ารัน schema.sql และ seed แล้ว
      </p>
    );
  }

  // หมวดของบทความเป็นชื่ออิสระ (ไม่มีชุด id ตายตัวแบบสินค้า) — ใช้ชื่อที่ตัดช่องว่างแล้วเป็นตัวจับกลุ่ม
  const articles: AdminArticle[] = (data ?? []).map((r) => {
    const en = r.en as EnContent | null;
    const cats = [
      ...new Set(
        ((r.categories ?? []) as Category[]).map((c) => c.name.trim()).filter(Boolean)
      ),
    ];
    return {
      id: r.id,
      kind: r.kind === "news" ? "news" : "article",
      title: r.title,
      dateText: r.date_text ?? null,
      views: r.views ?? null,
      cats,
      thumb: (r.images as string[] | null)?.[0] ?? null,
      hasEn: !!(en?.title?.trim() || en?.html?.trim()),
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-gold">
          บทความ / ข่าว ({articles.length})
        </h1>
        <Link
          href="/admin/articles/new"
          className="rounded-xl bg-gold px-4 py-2 text-sm font-bold text-night transition hover:brightness-110"
        >
          ＋ เขียนใหม่
        </Link>
      </div>
      <ArticleAdminList articles={articles} justSaved={sp.saved === "1"} />
    </div>
  );
}
