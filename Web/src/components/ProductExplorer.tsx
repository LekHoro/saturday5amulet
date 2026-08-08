"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import ProductCard, { type ProductCardData } from "./ProductCard";
import { LineInquiryButton } from "./LineButton";
import { lineChatUrl } from "@/lib/line";

/** ข้อมูลการ์ด + ฟิลด์ค้น/เรียงที่ server เตรียมไว้ให้ */
export interface ExplorerItem extends ProductCardData {
  price: number | null;
  /** timestamp จาก updatedAt ไว้เรียง "ใหม่ล่าสุด" */
  ts: number;
  /** ข้อความรวม (ชื่อรุ่น + ชื่อหมวด/เกจิ) ตัวพิมพ์เล็ก ไว้ค้นหา */
  search: string;
}

const PAGE_SIZE = 24;

type SortKey = "recommended" | "new" | "price-asc" | "price-desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recommended", label: "แนะนำ" },
  { value: "new", label: "ใหม่ล่าสุด" },
  { value: "price-asc", label: "ราคาต่ำ → สูง" },
  { value: "price-desc", label: "ราคาสูง → ต่ำ" },
];

const COMPARATORS: Record<SortKey, (a: ExplorerItem, b: ExplorerItem) => number> = {
  recommended: () => 0,
  new: (a, b) => b.ts - a.ts,
  "price-asc": (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
  "price-desc": (a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity),
};

function SearchIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-smoke"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export default function ProductExplorer({ items }: { items: ExplorerItem[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const sortParam = searchParams.get("sort") ?? "";
  const sort: SortKey = SORT_OPTIONS.some((o) => o.value === sortParam)
    ? (sortParam as SortKey)
    : "recommended";
  const cat = searchParams.get("cat") ?? "";

  // input เป็น state ท้องถิ่น (พิมพ์ลื่น) แล้วค่อย sync ลง URL แบบ shallow
  const [inputValue, setInputValue] = useState(q);
  // URL เปลี่ยนจากทางอื่น (back/forward, ลิงก์ header) — ดึงค่ากลับเข้า input ระหว่าง render
  const [prevQ, setPrevQ] = useState(q);
  if (prevQ !== q) {
    setPrevQ(q);
    setInputValue(q);
  }

  const setParam = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  };

  const results = useMemo(() => {
    const tokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const filtered = tokens.length
      ? items.filter((i) => tokens.every((t) => i.search.includes(t)))
      : [...items];
    // พร้อมบูชาก่อนเสมอ — หมดแล้วต่อท้ายในทุกการเรียง (sort เสถียร คงลำดับเดิมภายในกลุ่ม)
    const cmp = COMPARATORS[sort];
    return filtered.sort(
      (a, b) => Number(a.soldOut) - Number(b.soldOut) || cmp(a, b),
    );
  }, [items, q, sort]);

  // จำนวนที่แสดง — จำไว้ใน sessionStorage เพื่อให้กด back จากหน้าสินค้าแล้วรายการยาวเท่าเดิม
  const storageKey = `products-shown:${cat}|${q}|${sort}`;
  const [shown, setShown] = useState(PAGE_SIZE);
  useEffect(() => {
    // sessionStorage อ่านได้หลัง hydration เท่านั้น (อ่านตอน render จะ mismatch กับ HTML จาก server)
    const saved = Number(sessionStorage.getItem(storageKey));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync จาก external store หลัง mount
    setShown(saved >= PAGE_SIZE ? saved : PAGE_SIZE);
  }, [storageKey]);

  const showMore = () => {
    const next = shown + PAGE_SIZE;
    setShown(next);
    sessionStorage.setItem(storageKey, String(next));
  };

  const visible = results.slice(0, shown);
  const searching = q.trim().length > 0;

  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setParam("q", e.target.value.trim());
            }}
            placeholder="ค้นหาชื่อรุ่น เกจิอาจารย์ หรือหมวดหมู่…"
            aria-label="ค้นหาวัตถุมงคล"
            className="w-full rounded-lg border border-gold/30 bg-night-soft py-2 pl-9 pr-9 text-sm text-ivory placeholder:text-smoke/80 focus:border-gold/60 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue("");
                setParam("q", "");
              }}
              aria-label="ล้างคำค้นหา"
              className="absolute inset-y-0 right-2 flex items-center rounded-lg px-1 text-smoke transition hover:text-gold-light"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={(e) => setParam("sort", e.target.value === "recommended" ? "" : e.target.value)}
          aria-label="เรียงลำดับ"
          className="rounded-lg border border-gold/30 bg-night-soft px-3 py-2 text-sm text-ivory focus:border-gold/60 focus:outline-none"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-3 text-sm text-smoke" aria-live="polite">
        {searching
          ? `พบ ${results.length} รายการ`
          : `แสดง ${Math.min(shown, results.length)} จาก ${results.length} รายการ`}
      </p>

      {results.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-gold/20 bg-night-soft px-6 py-12 text-center">
          <p className="font-heading text-lg font-semibold text-ivory">
            ไม่พบ &ldquo;{q}&rdquo;
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-smoke">
            ลองใช้คำสั้นลง เช่น ชื่อรุ่นหรือชื่ออาจารย์
            หรือทักมาสอบถามได้เลย ทางร้านช่วยตามหารุ่นที่ต้องการให้ได้
          </p>
          <div className="mt-6 flex justify-center">
            <LineInquiryButton
              url={lineChatUrl(`สนใจสอบถามวัตถุมงคล: ${q}`)}
              label="สอบถามทาง Line"
            />
          </div>
        </div>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {results.length > shown && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={showMore}
                className="rounded-full border border-gold/40 px-6 py-2.5 text-sm font-semibold text-gold transition hover:bg-gold/10"
              >
                ดูเพิ่มเติม ({Math.min(shown + PAGE_SIZE, results.length)} จาก {results.length})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
