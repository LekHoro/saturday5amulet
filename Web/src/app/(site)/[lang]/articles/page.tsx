import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getSiteData } from "@/lib/db";
import { ImageFallback } from "@/components/icons";
import type { Article } from "@/lib/data";
import { getDict, isLang, href, type Lang, type Dict } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  return {
    title: t.articles.metaTitle,
    description: t.articles.metaDescription,
    alternates: {
      canonical: href(lang, "/articles"),
      languages: { th: "/articles", en: "/en/articles" },
    },
  };
}

// จัดกลุ่มหมวดย่อยจากเว็บเดิมเป็น section ใหญ่ — บทความที่มีหลายหมวดจะเข้ากลุ่มแรกที่ match ตามลำดับนี้
// ชื่อ section อยู่ใน dict (articles.sections) ตาม slug
const articleSections: { slug: string; catIds: string[] }[] = [
  { slug: "kumanthong", catIds: ["35199", "35201", "35200"] },
  { slug: "katha", catIds: ["4078", "35205", "35207", "35206"] },
  { slug: "merit", catIds: ["13816", "35204", "12582"] },
  { slug: "horoscope", catIds: ["35210"] },
  { slug: "ritual", catIds: ["4077", "35203", "35209"] },
  { slug: "ceremony", catIds: ["13680", "6080"] },
];

const PREVIEW_COUNT = 3;

function byNewest(a: Article, b: Article) {
  return (Number(b.id) || 0) - (Number(a.id) || 0);
}

function ArticleCard({ a, lang, t }: { a: Article; lang: Lang; t: Dict }) {
  return (
    <Link
      href={href(lang, `/articles/${a.id}`)}
      className="group overflow-hidden rounded-xl border border-gold/25 bg-night-soft shadow-sm transition hover:-translate-y-1 hover:border-gold/50 hover:shadow-md"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-night">
        {a.images[0] ? (
          <Image
            src={a.images[0]}
            alt={a.title}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <ImageFallback className="text-4xl" />
        )}
      </div>
      <div className="p-3">
        <div className="text-[11px] text-smoke/80">
          {a.dateText ?? ""}
          {a.views ? ` · ${t.articles.read(a.views.toLocaleString())}` : ""}
        </div>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-gold-light">
          {a.title}
        </h3>
      </div>
    </Link>
  );
}

function buildSections(all: Article[], t: Dict) {
  const assigned = new Set<string>();
  const sections = articleSections.map((s) => {
    const items = all.filter((a) => {
      if (assigned.has(a.id)) return false;
      if (!a.categories.some((c) => s.catIds.includes(c.id))) return false;
      assigned.add(a.id);
      return true;
    });
    return { slug: s.slug, title: t.articles.sections[s.slug], items };
  });
  const rest = all.filter((a) => !assigned.has(a.id));
  if (rest.length) sections.push({ slug: "other", title: t.articles.sections.other, items: rest });
  return sections.filter((s) => s.items.length > 0);
}

export default async function ArticlesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ sec?: string }>;
}) {
  const [{ lang: langParam }, { sec }] = await Promise.all([params, searchParams]);
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  const l = (path: string) => href(lang, path);
  const { articles, news } = await getSiteData(lang);
  const all = [...articles, ...news].filter((a) => a.title).sort(byNewest);
  const sections = buildSections(all, t);
  const current = sec ? sections.find((s) => s.slug === sec) : undefined;

  // มุมมองหมวดเดียว — จาก "ดูเพิ่มเติม"
  if (current) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link href={l("/articles")} className="text-sm font-semibold text-gold hover:underline">
          {t.articles.allSections}
        </Link>
        <h1 className="font-heading mt-2 text-2xl font-bold text-gold">{current.title}</h1>
        <p className="mt-1 text-sm text-smoke">{t.articles.stories(current.items.length)}</p>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {current.items.map((a) => (
            <ArticleCard key={`${a.kind}-${a.id}`} a={a} lang={lang} t={t} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-gold">{t.articles.pageTitle}</h1>
      <p className="mt-1 text-sm text-smoke">
        {t.articles.lead(all.length)}
      </p>

      {sections.map((s) => (
        <section key={s.slug} className="mt-10">
          <div className="flex items-baseline justify-between border-b border-gold/25 pb-2">
            <h2 className="font-heading text-xl font-semibold text-gold">
              {s.title} <span className="text-sm font-normal text-smoke">({s.items.length})</span>
            </h2>
            {s.items.length > PREVIEW_COUNT && (
              <Link
                href={l(`/articles?sec=${s.slug}`)}
                className="shrink-0 text-sm font-semibold text-gold hover:underline"
              >
                {t.articles.more}
              </Link>
            )}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3">
            {s.items.slice(0, PREVIEW_COUNT).map((a) => (
              <ArticleCard key={`${a.kind}-${a.id}`} a={a} lang={lang} t={t} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
