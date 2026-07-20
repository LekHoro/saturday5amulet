import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import MasterForm from "./MasterForm";

export const dynamic = "force-dynamic";

export default async function EditMasterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sb = await createSupabaseServer();
  const { data: m } = await sb.from("masters").select("*").eq("slug", slug).maybeSingle();
  if (!m) notFound();

  const videos = (m.videos ?? []) as { id: string; title: string }[];

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-gold">{m.name}</h1>
      <div className="mt-4">
        <MasterForm
          slug={m.slug}
          photo={m.photo}
          bio={m.bio}
          videosText={videos.map((v) => `${v.id} | ${v.title}`).join("\n")}
        />
      </div>
    </div>
  );
}
