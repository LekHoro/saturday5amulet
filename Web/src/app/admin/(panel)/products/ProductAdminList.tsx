"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { categoryGroups } from "@/lib/data";
import { toggleSoldOut } from "../../actions";

export interface AdminProduct {
  id: string;
  title: string;
  priceText: string;
  sku: string | null;
  soldOut: boolean;
  thumb: string | null;
  catIds: string[];
  hasEn: boolean;
}

type Filter = { kind: "all" } | { kind: "cat"; id: string } | { kind: "untagged" } | { kind: "no-en" };

const sameFilter = (a: Filter, b: Filter) =>
  a.kind === b.kind && (a.kind !== "cat" || b.kind !== "cat" || a.id === b.id);

export default function ProductAdminList({
  products,
  catNames,
}: {
  products: AdminProduct[];
  /** id หมวด → ชื่อไทย (จากสินค้าจริงทั้งหมด) */
  catNames: Record<string, string>;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const [menuOpen, setMenuOpen] = useState(false);
  const [items, setItems] = useState(products);
  const [, startTransition] = useTransition();

  const counts = useMemo(() => {
    const byCat: Record<string, number> = {};
    let untagged = 0;
    let noEn = 0;
    for (const p of items) {
      const known = p.catIds.filter((id) => catNames[id]);
      if (known.length === 0) untagged++;
      for (const id of known) byCat[id] = (byCat[id] ?? 0) + 1;
      if (!p.hasEn) noEn++;
    }
    return { byCat, untagged, noEn };
  }, [items, catNames]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((p) => {
      if (filter.kind === "cat" && !p.catIds.includes(filter.id)) return false;
      if (filter.kind === "untagged" && p.catIds.some((id) => catNames[id])) return false;
      if (filter.kind === "no-en" && p.hasEn) return false;
      if (!needle) return true;
      return (
        p.title.toLowerCase().includes(needle) || (p.sku ?? "").toLowerCase().includes(needle)
      );
    });
  }, [items, filter, q, catNames]);

  const filterLabel =
    filter.kind === "all"
      ? "ทั้งหมด"
      : filter.kind === "untagged"
        ? "ยังไม่จัดหมวด"
        : filter.kind === "no-en"
          ? "ยังไม่มีคำแปล EN"
          : (catNames[filter.id] ?? "หมวดหมู่");

  function onToggle(p: AdminProduct) {
    const next = !p.soldOut;
    // อัปเดตหน้าจอทันที แล้วค่อยยิงจริง — ถ้าพลาดค่อยดีดกลับ
    setItems((xs) => xs.map((x) => (x.id === p.id ? { ...x, soldOut: next } : x)));
    startTransition(async () => {
      const { error } = await toggleSoldOut(p.id, next);
      if (error) {
        setItems((xs) => xs.map((x) => (x.id === p.id ? { ...x, soldOut: p.soldOut } : x)));
        alert(`บันทึกไม่สำเร็จ: ${error}`);
      }
    });
  }

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
          <span className="text-xs opacity-70">{items.length}</span>
        </button>
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

      {categoryGroups.map((g) => {
        const ids = g.ids.filter((id) => catNames[id]);
        if (ids.length === 0) return null;
        return (
          <div key={g.slug}>
            <div className="px-3 text-xs font-semibold uppercase tracking-wide text-smoke">
              {g.label}
            </div>
            <div className="mt-1 space-y-0.5">
              {ids.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => pick({ kind: "cat", id })}
                  className={rowCls(sameFilter(filter, { kind: "cat", id }))}
                >
                  <span className="truncate">{catNames[id]}</span>
                  <span className="shrink-0 text-xs opacity-70">{counts.byCat[id] ?? 0}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
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
          placeholder="ค้นหาชื่อรุ่น / รหัสสินค้า..."
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

        <p className="mt-3 text-xs text-smoke">
          {filter.kind === "all" ? `ทั้งหมด ${shown.length} ชิ้น` : `${filterLabel} · ${shown.length} ชิ้น`}
        </p>

        <ul className="mt-2 space-y-2">
          {shown.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-2xl border border-gold/20 bg-night-soft p-3"
            >
              <Link
                href={`/admin/products/${p.id}`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-night">
                  {p.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.thumb} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">🙏</div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="line-clamp-2 text-sm font-medium leading-snug">{p.title}</div>
                  <div className="mt-0.5 text-xs text-smoke">
                    {p.soldOut ? "หมดแล้ว" : p.priceText || "-"}
                    {p.sku ? ` · ${p.sku}` : ""}
                    {p.hasEn ? " · EN" : ""}
                  </div>
                </div>
              </Link>
              <button
                onClick={() => onToggle(p)}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold transition ${
                  p.soldOut
                    ? "bg-night text-smoke ring-1 ring-smoke/40"
                    : "bg-gold/15 text-gold ring-1 ring-gold/50"
                }`}
              >
                {p.soldOut ? "หมดแล้ว" : "พร้อมบูชา"}
              </button>
            </li>
          ))}
        </ul>
        {shown.length === 0 && (
          <p className="mt-8 text-center text-sm text-smoke">ไม่พบรายการที่ค้นหา</p>
        )}
      </div>
    </div>
  );
}
