import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { articles, news } from "@/lib/data";

export const metadata: Metadata = {
  title: "บทความ วิธีบูชา คาถา และข่าวพิธีปลุกเสก",
  description:
    "รวมบทความสายมู วิธีบูชากุมารทอง คาถาวัตถุมงคล ดูดวง พิธีกรรมโบราณ และข่าวงานพิธีปลุกเสกวัตถุมงคล",
};

export default function ArticlesPage() {
  const all = [...articles, ...news].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-maroon">บทความและข่าวสาร</h1>
      <p className="mt-1 text-sm text-gray-500">
        วิธีบูชา คาถา ดูดวง พิธีกรรมโบราณ และข่าวงานพิธีปลุกเสก — {all.length} เรื่อง
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {all.map((a) => (
          <Link
            key={`${a.kind}-${a.id}`}
            href={`/articles/${a.id}`}
            className="group overflow-hidden rounded-xl border border-gold/25 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            {a.images[0] && (
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-cream">
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
              <div className="text-xs text-gray-400">
                {a.categories[0]?.name ?? (a.kind === "news" ? "ข่าวสาร" : "บทความ")}
                {a.dateText ? ` · ${a.dateText}` : ""}
                {a.views ? ` · อ่าน ${a.views.toLocaleString()}` : ""}
              </div>
              <h2 className="mt-1 line-clamp-2 font-semibold leading-snug">{a.title}</h2>
              {a.contentText && (
                <p className="mt-2 line-clamp-2 text-sm text-gray-500">{a.contentText.slice(0, 140)}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
