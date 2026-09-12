"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useToast } from "@/components/admin/Toast";
import { updateGalleryPosition } from "../../actions";

export interface AdminGallery {
  id: string;
  title: string;
  cover: string | null;
  count: number;
  cats: string[];
  position: number;
}

/** อัลบั้มที่อยู่ในบล็อกหน้าแรก (หน้าแรกหยิบ 5 อัลบั้มแรกตามลำดับ) */
const HOME_COUNT = 5;

export default function GalleryAdminList({
  galleries,
  flash,
}: {
  galleries: AdminGallery[];
  /** เด้งกลับมาจากฟอร์ม — "saved" / "deleted" */
  flash?: "saved" | "deleted";
}) {
  const [items, setItems] = useState(galleries);
  const [, startTransition] = useTransition();
  const { show: toast, node: toastNode } = useToast();

  // ยืนยันผลจากฟอร์มด้วย toast แล้วล้าง query ออกจาก URL (รีเฟรชแล้วไม่เด้งซ้ำ)
  useEffect(() => {
    if (!flash) return;
    toast(flash === "saved" ? "บันทึกอัลบั้มแล้ว ✓ ขึ้นเว็บเรียบร้อย" : "ลบอัลบั้มแล้ว");
    window.history.replaceState(null, "", "/admin/gallery");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flash]);

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const a = items[i];
    const b = items[j];
    const prev = items;
    const next = [...items];
    next[i] = { ...b, position: a.position };
    next[j] = { ...a, position: b.position };
    setItems(next);
    startTransition(async () => {
      const [r1, r2] = await Promise.all([
        updateGalleryPosition(a.id, b.position),
        updateGalleryPosition(b.id, a.position),
      ]);
      const err = r1.error ?? r2.error;
      if (err) {
        setItems(prev);
        toast("บันทึกลำดับไม่สำเร็จ — เน็ตอาจสะดุด ลองใหม่อีกครั้ง");
      }
    });
  }

  if (items.length === 0) {
    return (
      <p className="mt-6 rounded-2xl border border-gold/20 bg-night-soft p-5 text-center text-sm text-smoke">
        ยังไม่มีอัลบั้ม — กด “เพิ่มอัลบั้มใหม่” แล้วอัปโหลดรูปจากงานพิธีได้เลย
      </p>
    );
  }

  return (
    <>
      <ul className="mt-4 space-y-2">
        {items.map((g, i) => (
          <li
            key={g.id}
            className="flex items-center gap-3 rounded-2xl border border-gold/20 bg-night-soft p-3"
          >
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="เลื่อนขึ้น"
                className="rounded-md border border-gold/30 px-1.5 py-0.5 text-xs text-gold-light transition hover:border-gold disabled:opacity-30"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                aria-label="เลื่อนลง"
                className="rounded-md border border-gold/30 px-1.5 py-0.5 text-xs text-gold-light transition hover:border-gold disabled:opacity-30"
              >
                ▼
              </button>
            </div>
            <Link href={`/admin/gallery/${g.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gold/30 bg-night">
                {g.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.cover} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">📷</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 text-sm font-medium leading-snug">{g.title}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-smoke">
                  <span>{g.count} รูป</span>
                  {g.cats.length > 0 && <span>· {g.cats.join(", ")}</span>}
                  {i < HOME_COUNT && (
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-semibold text-gold-light">
                      อยู่บนหน้าแรก
                    </span>
                  )}
                </div>
              </div>
              <span className="text-smoke">›</span>
            </Link>
          </li>
        ))}
      </ul>
      {toastNode}
    </>
  );
}
