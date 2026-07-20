import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGallery, galleries } from "@/lib/data";

export function generateStaticParams() {
  return galleries.map((g) => ({ id: g.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const g = getGallery(id);
  if (!g) return {};
  const description = `ภาพบรรยากาศ ${g.title} — งานพิธีจริงของทางร้าน ${g.images.length} รูป`;
  return {
    title: g.title,
    description,
    alternates: { canonical: `/gallery/${g.id}` },
    openGraph: g.images[0] ? { title: g.title, description, images: [g.images[0]] } : undefined,
  };
}

export default async function GalleryAlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const g = getGallery(id);
  if (!g) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-xs text-smoke/80">
        <Link href="/" className="hover:text-gold-light">หน้าแรก</Link>
        {" › "}
        <Link href="/gallery" className="hover:text-gold-light">ภาพงานพิธี</Link>
        {" › "}
        <span className="text-smoke">{g.title}</span>
      </nav>

      <h1 className="font-heading mt-4 text-2xl font-bold leading-snug text-gold">{g.title}</h1>
      <p className="mt-1 text-sm text-smoke">{g.images.length} รูป</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {g.images.map((src, i) => (
          <div
            key={i}
            className="relative aspect-square overflow-hidden rounded-xl border border-gold/20 bg-night-soft"
          >
            <Image
              src={src}
              alt={`${g.title} รูปที่ ${i + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
