"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { thaiError } from "./adminErrors";

// จัดการรูปของฟอร์มหลังร้าน: อัปโหลดพร้อมตัวนับ "2/6", ไฟล์ไหนพลาดกดลองใหม่เฉพาะไฟล์นั้นได้,
// เลื่อนลำดับด้วยปุ่ม ◀ ▶ (รูปแรก = รูปปกเสมอ), ลบทีละรูป
export default function ImageManager({
  images,
  onChange,
  folder,
  onBusy,
}: {
  images: string[];
  /** อัปเดตแบบ functional กันชนกันตอนอัปโหลดหลายไฟล์ค้างอยู่ */
  onChange: (updater: (prev: string[]) => string[]) => void;
  folder: "products" | "articles";
  onBusy?: (busy: boolean) => void;
}) {
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [failed, setFailed] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: File[]) {
    if (!files.length) return;
    setProgress({ done: 0, total: files.length });
    setError(null);
    onBusy?.(true);
    const sb = createSupabaseBrowser();
    const misses: File[] = [];
    let lastMessage = "";
    for (const [i, file] of files.entries()) {
      setProgress({ done: i, total: files.length });
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await sb.storage.from("images").upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type || undefined,
      });
      if (upErr) {
        // เก็บไฟล์ที่พลาดไว้ให้กดลองใหม่ — ไฟล์อื่นอัปต่อ ไม่หยุดกลางคัน
        misses.push(file);
        lastMessage = upErr.message;
        continue;
      }
      const url = sb.storage.from("images").getPublicUrl(path).data.publicUrl;
      onChange((prev) => [...prev, url]);
    }
    setProgress(null);
    onBusy?.(false);
    setFailed(misses);
    if (misses.length) {
      setError(
        `อัปโหลดไม่สำเร็จ ${misses.length} รูป (${misses.map((f) => f.name).join(", ")}) — ${thaiError(lastMessage, "อัปโหลด")}`
      );
    }
  }

  function move(i: number, dir: -1 | 1) {
    onChange((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  const ctlCls =
    "flex h-8 min-w-8 items-center justify-center rounded-lg bg-night/85 text-sm text-ivory transition hover:bg-night disabled:opacity-30";

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="relative overflow-hidden rounded-xl border border-gold/20 bg-night-soft"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`รูปที่ ${i + 1}`} className="aspect-square w-full object-cover" />
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded-md bg-gold px-1.5 py-0.5 text-xs font-bold text-night">
                ปก
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-night/70 p-1">
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label={`เลื่อนรูปที่ ${i + 1} ไปทางซ้าย`}
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  className={ctlCls}
                >
                  ◀
                </button>
                <button
                  type="button"
                  aria-label={`เลื่อนรูปที่ ${i + 1} ไปทางขวา`}
                  disabled={i === images.length - 1}
                  onClick={() => move(i, 1)}
                  className={ctlCls}
                >
                  ▶
                </button>
              </div>
              <button
                type="button"
                aria-label={`ลบรูปที่ ${i + 1}`}
                onClick={() => onChange((prev) => prev.filter((_, j) => j !== i))}
                className={`${ctlCls} text-ember`}
              >
                ลบ
              </button>
            </div>
          </div>
        ))}
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gold/40 text-smoke transition hover:border-gold hover:text-gold-light">
          <span className="text-2xl">{progress ? "⏳" : "＋"}</span>
          <span className="px-1 text-center text-xs">
            {progress ? `อัปโหลด ${Math.min(progress.done + 1, progress.total)}/${progress.total}…` : "เพิ่มรูป"}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={!!progress}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              upload(files);
            }}
          />
        </label>
      </div>

      {error && (
        <div role="alert" className="mt-2 text-sm text-ember">
          <p>{error}</p>
          {failed.length > 0 && (
            <button
              type="button"
              onClick={() => upload(failed)}
              className="mt-1 rounded-lg border border-gold/40 px-3 py-1.5 text-xs font-semibold text-gold-light transition hover:border-gold"
            >
              ลองอัปโหลด {failed.length} รูปที่พลาดอีกครั้ง
            </button>
          )}
        </div>
      )}
    </div>
  );
}
