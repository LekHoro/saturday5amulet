import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getData } from "@/lib/db";
import type { Article } from "@/lib/data";

export const metadata: Metadata = {
  title: "บทความ วิธีบูชา คาถา และข่าวพิธีปลุกเสก",
  description:
    "รวมบทความสายมู วิธีบูชากุมารทอง คาถาวัตถุมงคล ดูดวง พิธีกรรมโบราณ และข่าวงานพิธีปลุกเสกวัตถุมงคล",
};

// จัดกลุ่มหมวดย่อยจากเว็บเดิมเป็น section ใหญ่ — บทความที่มีหลายหมวดจะเข้ากลุ่มแรกที่ match ตามลำดับนี้
const articleSections: { slug: string; title: string; catIds: string[] }[] = [
  {
    slug: "kumanthong",
    title: "ประวัติและวิธีบูชากุมารทอง",
    catIds: ["35199", "35201", "35200", "35203"],
  },
  {
    slug: "katha",
    title: "คาถาบูชาวัตถุมงคลและกุมารทอง",
    catIds: ["4078", "35205", "35207", "35206"],
  },
  {
    slug: "fortune",
    title: "ไหว้พระทำบุญ เสริมดวง ดูดวง",
    catIds: ["13816", "35210", "35204", "12582"],
  },
  {
    slug: "ceremony",
    title: "ข่าวงานพิธีและวัตถุมงคลรุ่นใหม่",
    catIds: ["13680", "4077", "6080", "35209"],
  },
];

const PREVIEW_COUNT = 3;

function byNewest(a: Article, b: Article) {
  return (Number(b.id) || 0) - (Number(a.id) || 0);
}

function ArticleCard({ a }: { a: Article }) {
  return (
    <Link
      href={`/articles/${a.id}`}
      className="group overflow-hidden rounded-xl border border-gold/25 bg-night-soft shadow-sm transition hover:-translate-y-1 hover:border-gold/50 hover:shadow-md"
    >
      {a.images[0] && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-night">
          <Image
            src={a.images[0]}
            alt={a.title}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-3">
        <div className="text-[11px] text-smoke/80">
          {a.dateText ?? ""}
          {a.views ? ` · อ่าน ${a.views.toLocaleString()}` : ""}
        </div>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-gold-light">
          {a.title}
        </h3>
      </div>
    </Link>
  );
}

function buildSections(all: Article[]) {
  const assigned = new Set<string>();
  const sections = articleSections.map((s) => {
    const items = all.filter((a) => {
      if (assigned.has(a.id)) return false;
      if (!a.categories.some((c) => s.catIds.includes(c.id))) return false;
      assigned.add(a.id);
      return true;
    });
    return { slug: s.slug, title: s.title, items };
  });
  const rest = all.filter((a) => !assigned.has(a.id));
  if (rest.length) sections.push({ slug: "other", title: "บทความอื่น ๆ", items: rest });
  return sections.filter((s) => s.items.length > 0);
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ sec?: string }>;
}) {
  const { sec } = await searchParams;
  const { articles, news } = await getData();
  const all = [...articles, ...news].sort(byNewest);
  const sections = buildSections(all);
  const current = sec ? sections.find((s) => s.slug === sec) : undefined;

  // มุมมองหมวดเดียว — จาก "ดูเพิ่มเติม"
  if (current) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link href="/articles" className="text-sm font-semibold text-gold hover:underline">
          ← บทความทุกหมวด
        </Link>
        <h1 className="font-heading mt-2 text-2xl font-bold text-gold">{current.title}</h1>
        <p className="mt-1 text-sm text-smoke">{current.items.length} เรื่อง</p>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {current.items.map((a) => (
            <ArticleCard key={`${a.kind}-${a.id}`} a={a} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-gold">บทความและข่าวสาร</h1>
      <p className="mt-1 text-sm text-smoke">
        วิธีบูชา คาถา ดูดวง พิธีกรรมโบราณ และข่าวงานพิธีปลุกเสก — {all.length} เรื่อง
      </p>

      {sections.map((s) => (
        <section key={s.slug} className="mt-10">
          <div className="flex items-baseline justify-between border-b border-gold/25 pb-2">
            <h2 className="font-heading text-xl font-semibold text-gold">
              {s.title} <span className="text-sm font-normal text-smoke">({s.items.length})</span>
            </h2>
            {s.items.length > PREVIEW_COUNT && (
              <Link
                href={`/articles?sec=${s.slug}`}
                className="shrink-0 text-sm font-semibold text-gold hover:underline"
              >
                ดูเพิ่มเติม →
              </Link>
            )}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3">
            {s.items.slice(0, PREVIEW_COUNT).map((a) => (
              <ArticleCard key={`${a.kind}-${a.id}`} a={a} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
