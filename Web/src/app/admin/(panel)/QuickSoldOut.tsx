"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useToast } from "@/components/admin/Toast";
import { toggleSoldOut } from "../actions";

export interface QuickProduct {
  id: string;
  title: string;
  sku: string | null;
  thumb: string | null;
  soldOut: boolean;
}

/** จำนวนที่โชว์ตอนยังไม่ค้นหา — พอให้เห็นตัวล่าสุดโดยไม่ยึดหน้าจอ */
const DEFAULT_SHOWN = 5;

/**
 * ติ๊กหมดจากหน้าหลักได้เลย — งานที่ทำบ่อยสุดหลังปิดการขายใน LINE
 * ไม่ต้องเข้าหน้าวัตถุมงคลแล้วไล่หา พิมพ์ชื่อ/รหัสแล้วติ๊กได้ทันที
 */
export default function QuickSoldOut({ products }: { products: QuickProduct[] }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState(products);
  const [, startTransition] = useTransition();
  const { show: toast, node: toastNode } = useToast();

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items.filter((p) => !p.soldOut).slice(0, DEFAULT_SHOWN);
    return items
      .filter(
        (p) =>
          p.title.toLowerCase().includes(needle) || (p.sku ?? "").toLowerCase().includes(needle)
      )
      .slice(0, 8);
  }, [items, q]);

  function onToggle(p: QuickProduct) {
    const next = !p.soldOut;
    // อัปเดตหน้าจอทันที แล้วค่อยยิงจริง — ถ้าพลาดค่อยดีดกลับพร้อมบอกเหตุ
    setItems((xs) => xs.map((x) => (x.id === p.id ? { ...x, soldOut: next } : x)));
    startTransition(async () => {
      const { error } = await toggleSoldOut(p.id, next);
      if (error) {
        setItems((xs) => xs.map((x) => (x.id === p.id ? { ...x, soldOut: p.soldOut } : x)));
        toast("บันทึกไม่สำเร็จ — เน็ตอาจสะดุด ลองกดอีกครั้ง");
        return;
      }
      toast(next ? `ติ๊กหมดแล้ว ✓ "${p.title}" ขึ้นเว็บเรียบร้อย` : `กลับมาพร้อมบูชา ✓ "${p.title}"`);
    });
  }

  return (
    <section className="rounded-2xl border border-gold/25 bg-night-soft p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-heading font-semibold text-gold-light">ติ๊กหมดไว ๆ</h2>
        <p className="text-xs text-smoke">ขายทาง LINE เสร็จ ติ๊กตรงนี้ได้เลย</p>
      </div>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="ค้นหาสินค้าเพื่อติ๊กหมด"
        placeholder="พิมพ์ชื่อรุ่น / รหัสสินค้า..."
        className="mt-3 w-full rounded-xl border border-gold/30 bg-night px-4 py-2.5 text-sm text-ivory outline-none focus:border-gold"
      />
      <ul className="mt-2 space-y-1.5">
        {shown.map((p) => (
          <li key={p.id} className="flex items-center gap-3 rounded-xl bg-night px-2.5 py-2">
            <Link href={`/admin/products/${p.id}`} className="flex min-w-0 flex-1 items-center gap-2.5">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-night-soft">
                {p.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.thumb} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg">🙏</div>
                )}
              </div>
              <span className="line-clamp-1 min-w-0 text-sm">{p.title}</span>
            </Link>
            <button
              type="button"
              onClick={() => onToggle(p)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
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
        <p className="mt-3 text-center text-sm text-smoke">
          {q.trim() ? "ไม่พบรุ่นที่ค้นหา" : "ยังไม่มีสินค้าพร้อมบูชา"}
        </p>
      )}
      {!q.trim() && items.some((p) => !p.soldOut) && (
        <p className="mt-2 text-right text-xs">
          <Link href="/admin/products" className="text-smoke underline-offset-2 hover:text-gold-light hover:underline">
            ดูทั้งหมดในหน้าวัตถุมงคล ›
          </Link>
        </p>
      )}
      {toastNode}
    </section>
  );
}
