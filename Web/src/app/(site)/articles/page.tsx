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
const articleSections: { title: string; catIds: string[] }[] = [
  {
    title: "ประวัติและวิธีบูชากุมารทอง",
    catIds: ["35199", "35201", "35200", "35203"],
  },
  {
    title: "คาถาบูชาวัตถุมงคลและกุมารทอง",
    catIds: ["4078", "35205", "35207", "35206"],
  },
  {
    title: "ไหว้พระทำบุญ เสริมดวง ดูดวง",
    catIds: ["13816", "35210", "35204", "12582"],
  },
  {
    title: "ข่าวงานพิธีและวัตถุมงคลรุ่นใหม่",
    catIds: ["13680", "4077", "6080", "35209"],
  },
];

function byNewest(a: Article, b: Article) {
  return (Number(b.id) || 0) - (Number(a.id) || 0);
}

function ArticleCard({ a }: { a: Article }) {
  return (
    <Link
      href={`/articles/${a.id}`}
      className="group overflow-hidden rounded-xl border border-gold/25 bg-night-soft shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      {a.images[0] && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-night">
          <Image
            src={a.images[0]}
            alt={a.title}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-4">
        <div className="text-xs text-smoke/80">
          {a.categories[0]?.name ?? (a.kind === "news" ? "ข่าวสาร" : "บทความ")}
          {a.dateText ? ` · ${a.dateText}` : ""}
          {a.views ? ` · อ่าน ${a.views.toLocaleString()}` : ""}
        </div>
        <h3 className="mt-1 line-clamp-2 font-semibold leading-snug">{a.title}</h3>
        {a.contentText && (
          <p className="mt-2 line-clamp-2 text-sm text-smoke">{a.contentText.slice(0, 140)}</p>
        )}
      </div>
    </Link>
  );
}

export default async function ArticlesPage() {
  const { articles, news } = await getData();
  const all = [...articles, ...news].sort(byNewest);

  // แจกบทความเข้า section แรกที่ match — ที่เหลือรวมไว้ท้ายสุด
  const assigned = new Set<string>();
  const sections = articleSections.map((s) => {
    const items = all.filter((a) => {
      if (assigned.has(a.id)) return false;
      if (!a.categories.some((c) => s.catIds.includes(c.id))) return false;
      assigned.add(a.id);
      return true;
    });
    return { title: s.title, items };
  });
  const rest = all.filter((a) => !assigned.has(a.id));
  if (rest.length) sections.push({ title: "บทความอื่น ๆ", items: rest });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-gold">บทความและข่าวสาร</h1>
      <p className="mt-1 text-sm text-smoke">
        วิธีบูชา คาถา ดูดวง พิธีกรรมโบราณ และข่าวงานพิธีปลุกเสก — {all.length} เรื่อง
      </p>

      {sections
        .filter((s) => s.items.length > 0)
        .map((s) => (
          <section key={s.title} className="mt-10">
            <h2 className="font-heading border-b border-gold/25 pb-2 text-xl font-semibold text-gold">
              {s.title} <span className="text-sm font-normal text-smoke">({s.items.length})</span>
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {s.items.map((a) => (
                <ArticleCard key={`${a.kind}-${a.id}`} a={a} />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
