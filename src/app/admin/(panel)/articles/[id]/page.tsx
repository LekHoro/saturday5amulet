import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import ArticleForm, { type ArticleFormValues } from "../ArticleForm";

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
  };

  return (
    <div>
      <h1 className="font-heading line-clamp-2 text-xl font-bold text-gold">แก้ไข: {r.title}</h1>
      <div className="mt-4">
        <ArticleForm initial={initial} />
      </div>
    </div>
  );
}
