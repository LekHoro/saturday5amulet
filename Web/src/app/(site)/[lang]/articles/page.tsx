import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getSiteData, timeBoundArticleRe } from "@/lib/db";
import { ImageFallback } from "@/components/icons";
import KumanthongGuideCard from "@/components/KumanthongGuideCard";
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

// คนเข้ามาอ่านบทความเยอะ — หน้ารวมจึงสลับ layout ไปเรื่อย ๆ ไม่ให้เป็นตารางเดียวซ้ำทั้งหน้า
// (feature = เด่นหนึ่ง + ลิสต์, grid = การ์ดสามใบ, rows = แถวนอนมีเกริ่น, mosaic = ไทล์ทับรูป)
const LAYOUTS = ["feature", "grid", "rows", "mosaic"] as const;
type Layout = (typeof LAYOUTS)[number];
const PREVIEW_COUNT: Record<Layout, number> = { feature: 5, grid: 3, rows: 4, mosaic: 5 };
/** จำนวนเรื่องขั้นต่ำที่ layout นั้นถึงจะเต็มกริด — น้อยกว่านี้ถอยไปใช้ grid จะได้ไม่มีช่องโหว่ */
const LAYOUT_MIN: Record<Layout, number> = { feature: 4, grid: 1, rows: 2, mosaic: 5 };

const HERO_SIDE = 4;
const MOST_READ = 6;

function byNewest(a: Article, b: Article) {
  return (Number(b.id) || 0) - (Number(a.id) || 0);
}

/** id ซ้ำกันได้ระหว่างบทความกับข่าว — ใช้ kind นำหน้าเป็นคีย์ */
function uid(a: Article) {
  return `${a.kind}-${a.id}`;
}

function excerpt(a: Article, n = 160) {
  const text = (a.contentText ?? a.meta.description ?? "").replace(/\s+/g, " ").trim();
  return text.length > n ? `${text.slice(0, n)}…` : text;
}

function Cover({ a, sizes }: { a: Article; sizes: string }) {
  return a.images[0] ? (
    <Image
      src={a.images[0]}
      alt=""
      fill
      sizes={sizes}
      className="object-cover transition duration-500 group-hover:scale-[1.04]"
    />
  ) : (
    <ImageFallback className="text-4xl" />
  );
}

function Meta({ a, t, cat = false }: { a: Article; t: Dict; cat?: boolean }) {
  const parts = [
    cat ? a.categories[0]?.name : null,
    a.dateText,
    a.views ? t.articles.read(a.views.toLocaleString()) : null,
  ].filter(Boolean);
  if (!parts.length) return null;
  return <div className="text-[11px] text-smoke/80">{parts.join(" · ")}</div>;
}

function CatChip({ a }: { a: Article }) {
  const name = a.categories[0]?.name;
  if (!name) return null;
  return (
    <span className="inline-block rounded-full border border-gold/40 bg-night/70 px-2.5 py-0.5 text-[11px] text-gold-light backdrop-blur-sm">
      {name}
    </span>
  );
}

/** การ์ดใหญ่ทับรูป — ใช้เป็นเรื่องเด่นบนสุด */
function HeroCard({ a, lang, t }: { a: Article; lang: Lang; t: Dict }) {
  return (
    <Link
      href={href(lang, `/articles/${a.id}`)}
      className="group relative block overflow-hidden rounded-2xl border border-gold/25 bg-night-soft"
    >
      <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
        <Cover a={a} sizes="(max-width: 1024px) 100vw, 60vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/70 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
        <CatChip a={a} />
        <h2 className="font-heading mt-2 line-clamp-2 text-lg font-bold leading-snug text-ivory transition group-hover:text-gold-light sm:text-2xl">
          {a.title}
        </h2>
        <p className="mt-2 hidden line-clamp-2 text-sm text-ivory/75 sm:block">{excerpt(a)}</p>
        <div className="mt-2">
          <Meta a={a} t={t} />
        </div>
      </div>
    </Link>
  );
}

/** แถวรูปเล็กซ้าย–หัวข้อขวา — ใช้ในคอลัมน์ข้างเรื่องเด่นและใน layout feature */
function SideRow({ a, lang, t }: { a: Article; lang: Lang; t: Dict }) {
  return (
    <Link
      href={href(lang, `/articles/${a.id}`)}
      className="group flex gap-3 p-3 transition hover:bg-gold/5"
    >
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-night">
        <Cover a={a} sizes="96px" />
      </div>
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition group-hover:text-gold-light">
          {a.title}
        </h3>
        <div className="mt-1">
          <Meta a={a} t={t} />
        </div>
      </div>
    </Link>
  );
}

/** การ์ดแนวตั้ง รูปบน–ข้อความล่าง พร้อมเกริ่นนำ */
function StoryCard({ a, lang, t }: { a: Article; lang: Lang; t: Dict }) {
  return (
    <Link
      href={href(lang, `/articles/${a.id}`)}
      className="group flex flex-col overflow-hidden rounded-xl border border-gold/25 bg-night-soft shadow-sm transition hover:-translate-y-1 hover:border-gold/50 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-night">
        <Cover a={a} sizes="(max-width: 640px) 100vw, 33vw" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <Meta a={a} t={t} cat />
        <h3 className="font-heading mt-1.5 line-clamp-2 font-semibold leading-snug transition group-hover:text-gold-light">
          {a.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-smoke">{excerpt(a)}</p>
        <span className="mt-3 text-xs font-semibold text-gold transition group-hover:text-gold-light">
          {t.articles.readMore}
        </span>
      </div>
    </Link>
  );
}

/** การ์ดเด่นประจำหมวด — รูปบนเต็มกว้าง ข้อความยาวกว่า StoryCard */
function LeadCard({ a, lang, t }: { a: Article; lang: Lang; t: Dict }) {
  return (
    <Link
      href={href(lang, `/articles/${a.id}`)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gold/25 bg-night-soft transition hover:border-gold/50"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-night">
        <Cover a={a} sizes="(max-width: 1024px) 100vw, 55vw" />
      </div>
      <div className="p-5">
        <Meta a={a} t={t} cat />
        <h3 className="font-heading mt-1.5 line-clamp-2 text-lg font-bold leading-snug transition group-hover:text-gold-light sm:text-xl">
          {a.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-smoke">{excerpt(a, 220)}</p>
      </div>
    </Link>
  );
}

/** แถวนอน รูปซ้าย–ข้อความขวา สองคอลัมน์ */
function WideRow({ a, lang, t }: { a: Article; lang: Lang; t: Dict }) {
  return (
    <Link
      href={href(lang, `/articles/${a.id}`)}
      className="group flex gap-4 overflow-hidden rounded-xl border border-gold/20 bg-night-soft/60 p-3 transition hover:border-gold/45 hover:bg-night-soft"
    >
      <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-lg bg-night sm:w-40">
        <Cover a={a} sizes="(max-width: 640px) 112px, 160px" />
      </div>
      <div className="min-w-0 py-0.5">
        <Meta a={a} t={t} cat />
        <h3 className="font-heading mt-1 line-clamp-2 font-semibold leading-snug transition group-hover:text-gold-light">
          {a.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 hidden text-sm text-smoke sm:block">{excerpt(a)}</p>
      </div>
    </Link>
  );
}

/** ไทล์ตัวอักษรทับรูป — ใช้กับ layout mosaic */
function TileCard({ a, lang, big = false }: { a: Article; lang: Lang; big?: boolean }) {
  return (
    <Link
      href={href(lang, `/articles/${a.id}`)}
      className={`group relative block overflow-hidden rounded-xl border border-gold/20 bg-night-soft ${
        big ? "aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[240px]" : "aspect-[4/3]"
      }`}
    >
      <Cover a={a} sizes={big ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 640px) 100vw, 25vw"} />
      <div className="absolute inset-0 bg-gradient-to-t from-night via-night/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
        {big && <CatChip a={a} />}
        <h3
          className={`font-heading line-clamp-2 font-semibold leading-snug text-ivory transition group-hover:text-gold-light ${
            big ? "mt-2 text-base sm:text-xl" : "text-sm"
          }`}
        >
          {a.title}
        </h3>
      </div>
    </Link>
  );
}

function SectionBody({
  layout,
  items,
  lang,
  t,
}: {
  layout: Layout;
  items: Article[];
  lang: Lang;
  t: Dict;
}) {
  if (layout === "feature") {
    const [first, ...rest] = items;
    return (
      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <LeadCard a={first} lang={lang} t={t} />
        {rest.length > 0 && (
          <div className="divide-y divide-gold/15 self-start rounded-2xl border border-gold/20 bg-night-soft/40">
            {rest.map((a) => (
              <SideRow key={uid(a)} a={a} lang={lang} t={t} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (layout === "rows") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((a) => (
          <WideRow key={uid(a)} a={a} lang={lang} t={t} />
        ))}
      </div>
    );
  }

  if (layout === "mosaic") {
    const [first, ...rest] = items;
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:row-span-2">
          <TileCard a={first} lang={lang} big />
        </div>
        {rest.map((a) => (
          <TileCard key={uid(a)} a={a} lang={lang} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((a) => (
        <StoryCard key={uid(a)} a={a} lang={lang} t={t} />
      ))}
    </div>
  );
}

function SectionHead({
  title,
  count,
  moreHref,
  t,
}: {
  title: string;
  count: number;
  moreHref?: string;
  t: Dict;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-gold/15 pb-3">
      <div>
        <h2 className="font-heading text-xl font-bold text-gold sm:text-2xl">{title}</h2>
        <div className="mt-2 h-px w-16 bg-gradient-to-r from-gold via-gold-light to-transparent" />
      </div>
      <div className="flex shrink-0 items-baseline gap-3 text-sm">
        <span className="hidden text-smoke sm:inline">{t.articles.stories(count)}</span>
        {moreHref && (
          <Link href={moreHref} className="font-semibold text-gold hover:underline">
            {t.articles.more}
          </Link>
        )}
      </div>
    </div>
  );
}

function buildSections(all: Article[], t: Dict) {
  const assigned = new Set<string>();
  const sections = articleSections.map((s) => {
    const items = all.filter((a) => {
      if (assigned.has(uid(a))) return false;
      if (!a.categories.some((c) => s.catIds.includes(c.id))) return false;
      assigned.add(uid(a));
      return true;
    });
    return { slug: s.slug, title: t.articles.sections[s.slug], items };
  });
  const rest = all.filter((a) => !assigned.has(uid(a)));
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

  // มุมมองหมวดเดียว — จาก "ดูเพิ่มเติม": เรื่องแรกเป็นการ์ดเด่น ที่เหลือเป็นตาราง
  if (current) {
    const [first, ...rest] = current.items;
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link href={l("/articles")} className="text-sm font-semibold text-gold hover:underline">
          {t.articles.allSections}
        </Link>
        <h1 className="font-heading mt-2 text-2xl font-bold text-gold sm:text-3xl">{current.title}</h1>
        <p className="mt-1 text-sm text-smoke">{t.articles.stories(current.items.length)}</p>

        {current.slug === "kumanthong" && (
          <div className="mt-6">
            <KumanthongGuideCard lang={lang} t={t} className="mb-5" />
          </div>
        )}

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <LeadCard a={first} lang={lang} t={t} />
          {rest.length > 0 && (
            <div className="divide-y divide-gold/15 self-start rounded-2xl border border-gold/20 bg-night-soft/40">
              {rest.slice(0, HERO_SIDE).map((a) => (
                <SideRow key={uid(a)} a={a} lang={lang} t={t} />
              ))}
            </div>
          )}
        </div>

        {rest.length > HERO_SIDE && (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.slice(HERO_SIDE).map((a) => (
              <StoryCard key={uid(a)} a={a} lang={lang} t={t} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // เรื่องเด่นบนสุดเลือกจากเรื่องที่มีรูปก่อน — บล็อกนี้อยู่กับรูปใหญ่
  // บทความดวงหมดอายุไม่ขึ้นแท่นโปรโมท (เรื่องเด่น/อ่านมากที่สุด) — ตัวกรองเดียวกับหน้าแรก
  // แต่ยังอยู่ในรายการหมวดข้างล่างตามปกติ ลิงก์เก่าเปิดอ่านได้เหมือนเดิม
  const fresh = all.filter((a) => !timeBoundArticleRe.test(a.title));
  const withImage = fresh.filter((a) => a.images[0]);
  const featurePool = withImage.length >= HERO_SIDE + 1 ? withImage : fresh;
  const [lead, ...restHero] = featurePool;
  const heroSide = restHero.slice(0, HERO_SIDE);
  const heroIds = new Set([lead, ...heroSide].filter(Boolean).map(uid));
  const mostRead = fresh
    .filter((a) => a.views)
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, MOST_READ);

  return (
    <div>
      <header className="border-b border-gold/15 bg-gradient-to-b from-night-soft to-night">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold/70">
            {t.articles.eyebrow}
          </p>
          <h1 className="font-heading mt-2 text-3xl font-bold text-gold sm:text-4xl">
            {t.articles.pageTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-smoke">{t.articles.lead(all.length)}</p>
          <nav
            aria-label={t.articles.topics}
            className="mt-5 flex flex-wrap gap-2"
          >
            {sections.map((s) => (
              <a
                key={s.slug}
                href={`#${s.slug}`}
                className="shrink-0 rounded-full border border-gold/30 px-3.5 py-1.5 text-xs text-ivory/85 transition hover:border-gold hover:bg-gold/10 hover:text-gold-light"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {lead && (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
            <HeroCard a={lead} lang={lang} t={t} />
            {heroSide.length > 0 && (
              <div className="divide-y divide-gold/15 self-start rounded-2xl border border-gold/20 bg-night-soft/40">
                <p className="px-4 pt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/70">
                  {t.articles.featured}
                </p>
                {heroSide.map((a) => (
                  <SideRow key={uid(a)} a={a} lang={lang} t={t} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {mostRead.length > 0 && (
        <section className="border-y border-gold/15 bg-night-soft/40">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <h2 className="font-heading text-xl font-bold text-gold sm:text-2xl">
              {t.articles.mostRead}
            </h2>
            <ol className="mt-4 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {mostRead.map((a, i) => (
                <li key={uid(a)} className="border-b border-gold/10">
                  <Link
                    href={l(`/articles/${a.id}`)}
                    className="group flex items-start gap-3 py-3"
                  >
                    <span className="font-heading text-lg font-bold tabular-nums text-gold/45 transition group-hover:text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 block text-sm font-semibold leading-snug transition group-hover:text-gold-light">
                        {a.title}
                      </span>
                      <span className="mt-1 block text-[11px] text-smoke/80">
                        {t.articles.read((a.views ?? 0).toLocaleString())}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-6xl px-4">
        {sections.map((s, i) => {
          // เรื่องที่ขึ้นบล็อกเด่นด้านบนแล้ว ไม่เอามาโชว์ซ้ำในพรีวิวหมวด (แต่ยังนับรวมในจำนวนเรื่อง)
          const pool = s.items.filter((a) => !heroIds.has(uid(a)));
          if (!pool.length) return null;
          const wanted = LAYOUTS[i % LAYOUTS.length];
          const layout: Layout = pool.length >= LAYOUT_MIN[wanted] ? wanted : "grid";
          const preview = pool.slice(0, PREVIEW_COUNT[layout]);
          return (
            <section key={s.slug} id={s.slug} className="scroll-mt-24 py-8">
              <SectionHead
                title={s.title}
                count={s.items.length}
                moreHref={s.items.length > preview.length ? l(`/articles?sec=${s.slug}`) : undefined}
                t={t}
              />
              <div className="mt-5">
                {s.slug === "kumanthong" && (
                  <KumanthongGuideCard lang={lang} t={t} className="mb-5" />
                )}
                <SectionBody layout={layout} items={preview} lang={lang} t={t} />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
