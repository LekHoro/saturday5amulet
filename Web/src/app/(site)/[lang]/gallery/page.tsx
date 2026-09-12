import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteData } from "@/lib/db";
import type { Category } from "@/lib/data";
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
      // แท็บกรอง ?cat= เป็นหน้าเดียวกัน — canonical ชี้ /gallery เสมอ
      canonical: href(lang, "/gallery"),
      languages: { th: "/gallery", en: "/en/gallery" },
    },
  };
}

export default async function GalleryPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ cat?: string }>;
}) {
  const [{ lang: langParam }, { cat }] = await Promise.all([params, searchParams]);
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  const { galleries } = await getSiteData(lang);

  // แท็บหมวด = หมวดที่เจ้าของตั้งไว้ในแอดมิน เรียงตามจำนวนอัลบั้ม — ไม่มีใครตั้งหมวดเลยก็ไม่ต้องโชว์แถบ
  const catCount = new Map<string, { cat: Category; n: number }>();
  for (const g of galleries) {
    for (const c of g.categories ?? []) {
      const cur = catCount.get(c.id);
      if (cur) cur.n++;
      else catCount.set(c.id, { cat: c, n: 1 });
    }
  }
  const cats = [...catCount.values()].sort((a, b) => b.n - a.n).map((x) => x.cat);
  const active = cat && catCount.has(cat) ? cat : null;
  const shown = active ? galleries.filter((g) => g.categories?.some((c) => c.id === active)) : galleries;

  const tabCls = (on: boolean) =>
    `whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition ${
      on ? "border-gold bg-gold font-semibold text-night" : "border-gold/40 text-ivory/90 hover:border-gold hover:text-gold-light"
    }`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-gold sm:text-3xl">{t.gallery.title}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-smoke">
          {t.gallery.lead}
        </p>
      </div>

      {cats.length > 0 && (
        <nav
          aria-label={t.gallery.filterAria}
          className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center"
        >
          <Link href={href(lang, "/gallery")} aria-current={!active ? "page" : undefined} className={tabCls(!active)}>
            {t.gallery.all}
          </Link>
          {cats.map((c) => (
            <Link
              key={c.id}
              href={`${href(lang, "/gallery")}?cat=${encodeURIComponent(c.id)}`}
              aria-current={active === c.id ? "page" : undefined}
              className={tabCls(active === c.id)}
            >
              {c.name}
            </Link>
          ))}
        </nav>
      )}

      <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ${cats.length > 0 ? "mt-6" : "mt-10"}`}>
        {shown.map((g) => (
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
              {g.categories?.[0] && (
                <span className="absolute left-2 top-2 rounded-full border border-gold/40 bg-night/70 px-2.5 py-0.5 text-[11px] text-gold-light backdrop-blur-sm">
                  {g.categories[0].name}
                </span>
              )}
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
