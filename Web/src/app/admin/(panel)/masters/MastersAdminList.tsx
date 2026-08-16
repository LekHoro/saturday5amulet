"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateMasterPosition } from "../../actions";

export interface AdminMaster {
  slug: string;
  name: string;
  photo: string | null;
  bio: string | null;
  videosCount: number;
  position: number;
}

export default function MastersAdminList({ masters }: { masters: AdminMaster[] }) {
  const [items, setItems] = useState(masters);
  const [, startTransition] = useTransition();

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
        updateMasterPosition(a.slug, b.position),
        updateMasterPosition(b.slug, a.position),
      ]);
      const err = r1.error ?? r2.error;
      if (err) {
        setItems(prev);
        alert(`บันทึกไม่สำเร็จ: ${err}`);
      }
    });
  }

  return (
    <ul className="mt-4 space-y-2">
      {items.map((m, i) => (
        <li
          key={m.slug}
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
          <Link
            href={`/admin/masters/${m.slug}`}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gold/40 bg-night">
              {m.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.photo} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">🙏</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{m.name}</div>
              <div className="mt-0.5 text-xs text-smoke">
                {[
                  m.photo ? "มีรูป" : "ยังไม่มีรูป",
                  m.bio ? "มีประวัติ" : "ยังไม่มีประวัติ",
                  `วิดีโอ ${m.videosCount}`,
                ].join(" · ")}
              </div>
            </div>
            <span className="text-smoke">›</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
