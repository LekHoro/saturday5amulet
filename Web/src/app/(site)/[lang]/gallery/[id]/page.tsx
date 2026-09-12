import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AlbumGrid from "@/components/AlbumGrid";
import JsonLd from "@/components/JsonLd";
import { getSiteData, getGallery } from "@/lib/db";
import { getDict, isLang, href, type Lang } from "@/lib/i18n";
import { breadcrumbJsonLd } from "@/lib/seo";

export async function generateStaticParams() {
  const { galleries } = await getSiteData();
  return galleries.map((g) => ({ id: g.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang: langParam, id } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  const g = getGallery(await getSiteData(lang), id);
  if (!g) return {};
  const description = t.gallery.albumDescription(g.title, g.images.length);
  return {
    title: g.title,
    description,
    alternates: {
      canonical: href(lang, `/gallery/${g.id}`),
      languages: { th: `/gallery/${g.id}`, en: `/en/gallery/${g.id}` },
    },
    openGraph: g.images[0] ? { title: g.title, description, images: [g.images[0]] } : undefined,
  };
}

export default async function GalleryAlbumPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang: langParam, id } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  const l = (path: string) => href(lang, path);
  const g = getGallery(await getSiteData(lang), id);
  if (!g) notFound();

  const breadcrumb = breadcrumbJsonLd([
    { name: t.nav.home, path: l("/") },
    { name: t.gallery.breadcrumb, path: l("/gallery") },
    { name: g.title },
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <JsonLd data={breadcrumb} />
      <nav className="text-xs text-smoke/80">
        <Link href={l("/")} className="hover:text-gold-light">{t.nav.home}</Link>
        {" › "}
        <Link href={l("/gallery")} className="hover:text-gold-light">{t.gallery.breadcrumb}</Link>
        {" › "}
        <span className="text-smoke">{g.title}</span>
      </nav>

      <h1 className="font-heading mt-4 text-2xl font-bold leading-snug text-gold">{g.title}</h1>
      <p className="mt-1 text-sm text-smoke">{t.gallery.photos(g.images.length)}</p>

      {/* กดรูปแล้วขยายเต็มจอ เลื่อนดูทั้งอัลบั้มได้ */}
      <AlbumGrid images={g.images} title={g.title} lang={lang} />
    </div>
  );
}
