"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/admin/Toast";

export interface AdminArticle {
  id: string;
  kind: "article" | "news";
  title: string;
  dateText: string | null;
  views: number | null;
  /** ชื่อหมวดของบทความนี้ (ตัดช่องว่างหัวท้ายแล้ว) */
  cats: string[];
  thumb: string | null;
  hasEn: boolean;
}

type Filter =
  | { kind: "all" }
  | { kind: "type"; value: "article" | "news" }
  | { kind: "cat"; name: string }
  | { kind: "untagged" }
  | { kind: "no-en" };

type ViewMode = "grid" | "list";
const VIEW_KEY = "admin-articles-view";

const sameFilter = (a: Filter, b: Filter) =>
  a.kind === b.kind &&
  (a.kind !== "cat" || b.kind !== "cat" || a.name === b.name) &&
  (a.kind !== "type" || b.kind !== "type" || a.value === b.value);

export default function ArticleAdminList({
  articles,
  justSaved,
}: {
  articles: AdminArticle[];
  /** เพิ่งกดบันทึกในฟอร์มแล้วเด้งกลับมา — โชว์ toast ยืนยัน */
  justSaved?: boolean;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const { show: toast, node: toastNode } = useToast();

  // เด้งกลับมาจากปุ่มบันทึก — ยืนยันผลแล้วล้าง ?saved=1 ออกจาก URL
  useEffect(() => {
    if (!justSaved) return;
    toast("บันทึกแล้ว ✓ ขึ้นเว็บเรียบร้อย");
    window.history.replaceState(null, "", "/admin/articles");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justSaved]);

  // จำมุมมองที่เลือกไว้ข้ามการเข้าใช้ (อ่านหลัง mount — เลี่ยง hydration mismatch)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const saved = localStorage.getItem(VIEW_KEY);
        if (saved === "grid" || saved === "list") setView(saved);
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, []);

  function chooseView(v: ViewMode) {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {}
  }

  const counts = useMemo(() => {
    const byCat: Record<string, number> = {};
    let untagged = 0;
    let noEn = 0;
    let article = 0;
    let news = 0;
    for (const a of articles) {
      if (a.cats.length === 0) untagged++;
      for (const name of a.cats) byCat[name] = (byCat[name] ?? 0) + 1;
      if (!a.hasEn) noEn++;
      if (a.kind === "news") news++;
      else article++;
    }
    return { byCat, untagged, noEn, article, news };
  }, [articles]);

  // หมวดที่ใช้บ่อยขึ้นก่อน แล้วเรียงชื่อไทย
  const catList = useMemo(
    () =>
      Object.keys(counts.byCat).sort(
        (a, b) => counts.byCat[b] - counts.byCat[a] || a.localeCompare(b, "th")
      ),
    [counts.byCat]
  );

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return articles.filter((a) => {
      if (filter.kind === "type" && a.kind !== filter.value) return false;
      if (filter.kind === "cat" && !a.cats.includes(filter.name)) return false;
      if (filter.kind === "untagged" && a.cats.length > 0) return false;
      if (filter.kind === "no-en" && a.hasEn) return false;
      if (!needle) return true;
      return a.title.toLowerCase().includes(needle);
    });
  }, [articles, filter, q]);

  const filterLabel =
    filter.kind === "all"
      ? "ทั้งหมด"
      : filter.kind === "type"
        ? filter.value === "news"
          ? "ข่าว"
          : "บทความ"
        : filter.kind === "untagged"
          ? "ยังไม่จัดหมวด"
          : filter.kind === "no-en"
            ? "ยังไม่มีคำแปล EN"
            : filter.name;

  function pick(f: Filter) {
    setFilter(f);
    setMenuOpen(false);
  }

  const rowCls = (on: boolean) =>
    `flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
      on ? "bg-gold text-night font-semibold" : "text-ivory hover:bg-gold/15"
    }`;

  // เมนูหมวดหมู่ใช้ร่วมกันระหว่างแถบข้าง (จอใหญ่) กับแผงพับ (มือถือ)
  const menu = (
    <nav aria-label="กรองตามหมวดหมู่" className="space-y-4">
      <div className="space-y-0.5">
        <button type="button" onClick={() => pick({ kind: "all" })} className={rowCls(filter.kind === "all")}>
          <span>ทั้งหมด</span>
          <span className="text-xs opacity-70">{articles.length}</span>
        </button>
        {([
          { value: "article", label: "บทความ", n: counts.article },
          { value: "news", label: "ข่าว", n: counts.news },
        ] as const).map((t) =>
          t.n > 0 ? (
            <button
              key={t.value}
              type="button"
              onClick={() => pick({ kind: "type", value: t.value })}
              className={rowCls(sameFilter(filter, { kind: "type", value: t.value }))}
            >
              <span>{t.label}</span>
              <span className="text-xs opacity-70">{t.n}</span>
            </button>
          ) : null
        )}
        {counts.untagged > 0 && (
          <button
            type="button"
            onClick={() => pick({ kind: "untagged" })}
            className={rowCls(filter.kind === "untagged")}
          >
            <span>ยังไม่จัดหมวด</span>
            <span className="text-xs opacity-70">{counts.untagged}</span>
          </button>
        )}
        {counts.noEn > 0 && (
          <button
            type="button"
            onClick={() => pick({ kind: "no-en" })}
            className={rowCls(filter.kind === "no-en")}
          >
            <span>ยังไม่มีคำแปล EN</span>
            <span className="text-xs opacity-70">{counts.noEn}</span>
          </button>
        )}
      </div>

      {catList.length > 0 && (
        <div>
          <div className="px-3 text-xs font-semibold uppercase tracking-wide text-smoke">
            หมวดหมู่
          </div>
          <div className="mt-1 space-y-0.5">
            {catList.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => pick({ kind: "cat", name })}
                className={rowCls(sameFilter(filter, { kind: "cat", name }))}
              >
                <span className="truncate">{name}</span>
                <span className="shrink-0 text-xs opacity-70">{counts.byCat[name]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );

  const kindBadge = (kind: AdminArticle["kind"]) => (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
        kind === "news"
          ? "bg-ember/15 text-ember ring-1 ring-ember/40"
          : "bg-gold/15 text-gold ring-1 ring-gold/40"
      }`}
    >
      {kind === "news" ? "ข่าว" : "บทความ"}
    </span>
  );

  return (
    <div className="mt-4 lg:flex lg:gap-6">
      {/* แถบข้างบนจอใหญ่ */}
      <aside className="hidden w-52 shrink-0 lg:block">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-gold/20 bg-night-soft p-2">
          {menu}
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <input
          type="search"
          placeholder="ค้นหาหัวข้อ..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-xl border border-gold/30 bg-night-soft px-4 py-3 text-ivory outline-none focus:border-gold"
        />

        {/* ปุ่มเปิดเมนูหมวดบนมือถือ */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          className="mt-2 flex w-full items-center justify-between rounded-xl border border-gold/30 bg-night-soft px-4 py-3 text-sm lg:hidden"
        >
          <span>
            หมวดหมู่: <span className="font-semibold text-gold-light">{filterLabel}</span>
          </span>
          <span className="text-xs text-smoke">{menuOpen ? "▲ ปิด" : "▼ เลือก"}</span>
        </button>
        {menuOpen && (
          <div className="mt-2 rounded-2xl border border-gold/20 bg-night-soft p-2 lg:hidden">
            {menu}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-smoke">
            {filter.kind === "all"
              ? `ทั้งหมด ${shown.length} เรื่อง`
              : `${filterLabel} · ${shown.length} เรื่อง`}
          </p>
          <div className="flex shrink-0 gap-1 rounded-xl border border-gold/25 bg-night-soft p-1">
            {([
              { key: "grid", label: "ตาราง" },
              { key: "list", label: "รายการ" },
            ] as const).map((v) => (
              <button
                key={v.key}
                type="button"
                aria-pressed={view === v.key}
                onClick={() => chooseView(v.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  view === v.key ? "bg-gold text-night" : "text-ivory hover:bg-gold/15"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {view === "grid" ? (
          <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {shown.map((a) => (
              <li
                key={a.id}
                className="overflow-hidden rounded-2xl border border-gold/20 bg-night-soft"
              >
                <Link href={`/admin/articles/${a.id}`} className="block">
                  <div className="relative aspect-square bg-night">
                    {a.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.thumb} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl">
                        📄
                      </div>
                    )}
                    <span className="absolute left-2 top-2">{kindBadge(a.kind)}</span>
                    {a.hasEn && (
                      <span className="absolute right-2 top-2 rounded-md bg-night/85 px-2 py-0.5 text-xs font-bold text-gold-light">
                        EN
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <div className="line-clamp-2 min-h-10 text-sm font-medium leading-snug">
                      {a.title}
                    </div>
                    <div className="mt-1 truncate text-xs text-smoke">
                      {a.cats[0] ?? a.dateText ?? "-"}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="mt-2 space-y-2">
            {shown.map((a) => (
              <li key={a.id} className="rounded-2xl border border-gold/20 bg-night-soft p-3">
                <Link href={`/admin/articles/${a.id}`} className="flex min-w-0 items-center gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-night">
                    {a.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.thumb} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">
                        📄
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-sm font-medium leading-snug">{a.title}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-smoke">
                      {kindBadge(a.kind)}
                      {a.cats.length > 0 && <span>{a.cats.join(" · ")}</span>}
                      {a.dateText && <span>· {a.dateText}</span>}
                      {a.views ? <span>· อ่าน {a.views.toLocaleString()}</span> : null}
                      {a.hasEn && <span className="text-gold-light">· EN</span>}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {shown.length === 0 && (
          <p className="mt-8 text-center text-sm text-smoke">ไม่พบรายการที่ค้นหา</p>
        )}
      </div>
      {toastNode}
    </div>
  );
}
