import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getData } from "@/lib/db";
import ArticleForm, { type ArticleFormValues } from "../ArticleForm";
import { buildArticleCatOptions } from "../catOptions";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = await createSupabaseServer();
  const { data: r } = await sb.from("articles").select("*").eq("id", id).maybeSingle();
  if (!r) notFound();

  const initial: ArticleFormValues = {
    id: r.id,
    kind: r.kind === "news" ? "news" : "article",
    title: r.title,
    dateText: r.date_text,
    categories: r.categories ?? [],
    contentHtml: r.content_html,
    images: r.images ?? [],
    en: r.en ?? null,
  };

  const { articles } = await getData();

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/articles"
        className="inline-flex items-center gap-1 text-sm text-smoke transition hover:text-gold-light"
      >
        ← กลับไปรายการบทความ
      </Link>
      <h1 className="mt-2 font-heading line-clamp-2 text-xl font-bold text-gold">
        แก้ไข: {r.title}
      </h1>
      <div className="mt-4">
        {/* key=id — บังคับให้ฟอร์มโหลดค่าใหม่เมื่อสลับไปบทความชิ้นอื่น
            ไม่งั้น React ใช้ state ของชิ้นเดิมต่อ (route เดียวกัน) */}
        <ArticleForm key={r.id} initial={initial} catOptions={buildArticleCatOptions(articles)} />
      </div>
    </div>
  );
}
