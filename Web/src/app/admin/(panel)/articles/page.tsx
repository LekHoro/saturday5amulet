import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import ArticleAdminList, { type AdminArticle } from "./ArticleAdminList";

// อ่านตรงจาก Supabase เสมอ (ไม่ใช้ cache ของหน้าเว็บ) เพื่อให้เห็นสถานะล่าสุด
export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const sb = await createSupabaseServer();
  const { data, error } = await sb
    .from("articles")
    .select("id,kind,title,date_text,views,categories,images")
    .order("position")
    .limit(5000);

  if (error) {
    return (
      <p className="text-sm text-ember">
        อ่านข้อมูลไม่สำเร็จ: {error.message} — ตรวจว่ารัน schema.sql และ seed แล้ว
      </p>
    );
  }

  const articles: AdminArticle[] = (data ?? []).map((r) => ({
    id: r.id,
    kind: r.kind === "news" ? "news" : "article",
    title: r.title,
    dateText: r.date_text ?? null,
    views: r.views ?? null,
    category: (r.categories as { name: string }[] | null)?.[0]?.name ?? null,
    thumb: (r.images as string[] | null)?.[0] ?? null,
  }));

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
      <ArticleAdminList articles={articles} />
    </div>
  );
}
