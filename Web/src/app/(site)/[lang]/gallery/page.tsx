import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteData } from "@/lib/db";
import { getDict, isLang, href, type Lang } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  return {
    title: t.gallery.metaTitle,
    description: t.gallery.metaDescription,
    alternates: {
      canonical: href(lang, "/gallery"),
      languages: { th: "/gallery", en: "/en/gallery" },
    },
  };
}

export default async function GalleryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  const { galleries } = await getSiteData(lang);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-gold sm:text-3xl">{t.gallery.title}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-smoke">
          {t.gallery.lead}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {galleries.map((g) => (
          <Link
            key={g.id}
            href={href(lang, `/gallery/${g.id}`)}
            className="group overflow-hidden rounded-2xl border border-gold/25 bg-night-soft shadow-sm transition hover:-translate-y-1 hover:border-gold hover:shadow-md"
          >
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={g.images[0]}
                alt={g.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition group-hover:scale-105"
              />
              <span className="absolute bottom-2 right-2 rounded-full bg-night/80 px-2 py-0.5 text-xs text-ivory ring-1 ring-gold/30">
                {t.gallery.photos(g.images.length)}
              </span>
            </div>
            <p className="line-clamp-2 p-3 text-sm font-medium leading-snug text-ivory/90 group-hover:text-gold-light">
              {g.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
