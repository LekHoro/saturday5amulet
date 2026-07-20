"use client";

import { useState } from "react";
import Link from "next/link";

export interface AdminArticle {
  id: string;
  kind: "article" | "news";
  title: string;
  dateText: string | null;
  views: number | null;
  category: string | null;
  thumb: string | null;
}

export default function ArticleAdminList({ articles }: { articles: AdminArticle[] }) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "article" | "news">("all");

  const shown = articles.filter((a) => {
    if (kind !== "all" && a.kind !== kind) return false;
    if (!q.trim()) return true;
    return a.title.toLowerCase().includes(q.trim().toLowerCase());
  });

  const filters: { key: "all" | "article" | "news"; label: string }[] = [
    { key: "all", label: "ทั้งหมด" },
    { key: "article", label: "บทความ" },
    { key: "news", label: "ข่าว" },
  ];

  return (
    <div>
      <input
        type="search"
        placeholder="ค้นหาหัวข้อ..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mt-4 w-full rounded-xl border border-gold/30 bg-night-soft px-4 py-3 text-ivory outline-none focus:border-gold"
      />

      <div className="mt-3 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setKind(f.key)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              kind === f.key
                ? "border-gold bg-gold text-night"
                : "border-gold/40 bg-night-soft text-ivory hover:border-gold"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {shown.map((a) => (
          <li
            key={a.id}
            className="rounded-2xl border border-gold/20 bg-night-soft p-3"
          >
            <Link href={`/admin/articles/${a.id}`} className="flex min-w-0 items-center gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-night">
                {a.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.thumb} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">📄</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 text-sm font-medium leading-snug">{a.title}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-smoke">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      a.kind === "news"
                        ? "bg-ember/15 text-ember ring-1 ring-ember/40"
                        : "bg-gold/15 text-gold ring-1 ring-gold/40"
                    }`}
                  >
                    {a.kind === "news" ? "ข่าว" : "บทความ"}
                  </span>
                  {a.category && <span>{a.category}</span>}
                  {a.dateText && <span>· {a.dateText}</span>}
                  {a.views ? <span>· อ่าน {a.views.toLocaleString()}</span> : null}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {shown.length === 0 && (
        <p className="mt-8 text-center text-sm text-smoke">ไม่พบรายการที่ค้นหา</p>
      )}
    </div>
  );
}
