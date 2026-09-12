import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import GalleryForm from "../GalleryForm";

export const dynamic = "force-dynamic";

export default async function EditGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createSupabaseServer();
  const { data: g } = await sb.from("galleries").select("*").eq("id", id).maybeSingle();
  if (!g) notFound();

  const en = (g.en ?? null) as { title?: string | null } | null;

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/admin/gallery"
          className="inline-flex items-center gap-1 text-sm text-smoke transition hover:text-gold-light"
        >
          ← กลับไปรายการอัลบั้ม
        </Link>
        <Link
          href={`/gallery/${g.id}`}
          target="_blank"
          className="text-sm text-smoke transition hover:text-gold-light"
        >
          เปิดดูบนเว็บ ↗
        </Link>
      </div>
      <h1 className="mt-2 font-heading text-xl font-bold leading-snug text-gold">{g.title}</h1>
      <div className="mt-4">
        <GalleryForm
          key={g.id}
          initial={{
            id: g.id,
            title: g.title,
            images: (g.images ?? []) as string[],
            enTitle: en?.title ?? "",
          }}
        />
      </div>
    </div>
  );
}
