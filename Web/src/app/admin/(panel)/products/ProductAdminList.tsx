"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleSoldOut } from "../../actions";

export interface AdminProduct {
  id: string;
  title: string;
  priceText: string;
  sku: string | null;
  soldOut: boolean;
  thumb: string | null;
}

export default function ProductAdminList({ products }: { products: AdminProduct[] }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState(products);
  const [, startTransition] = useTransition();

  const shown = q.trim()
    ? items.filter(
        (p) =>
          p.title.toLowerCase().includes(q.trim().toLowerCase()) ||
          (p.sku ?? "").toLowerCase().includes(q.trim().toLowerCase())
      )
    : items;

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

  return (
    <div>
      <input
        type="search"
        placeholder="ค้นหาชื่อรุ่น / รหัสสินค้า..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mt-4 w-full rounded-xl border border-gold/30 bg-night-soft px-4 py-3 text-ivory outline-none focus:border-gold"
      />

      <ul className="mt-4 space-y-2">
        {shown.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-3 rounded-2xl border border-gold/20 bg-night-soft p-3"
          >
            <Link href={`/admin/products/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
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
  );
}
