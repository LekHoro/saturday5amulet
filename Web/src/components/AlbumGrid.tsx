"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getDict, type Lang } from "@/lib/i18n";

/** กริดรูปในอัลบั้มงานพิธี — กดรูปไหนก็เปิด lightbox ขยายเต็มจอ
 *  เลื่อนด้วยลูกศร/ปุ่ม, ปัดซ้าย-ขวาบนมือถือ, Esc หรือกดพื้นหลังเพื่อปิด */
export default function AlbumGrid({
  images,
  title,
  lang,
}: {
  images: string[];
  title: string;
  lang: Lang;
}) {
  const t = getDict(lang);
  const [open, setOpen] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);

  const step = useCallback(
    (dir: -1 | 1) => setOpen((i) => (i === null ? i : (i + dir + images.length) % images.length)),
    [images.length]
  );

  // lightbox: ปิดด้วย Esc, เลื่อนด้วยลูกศร, ล็อก scroll ของหน้าไว้ข้างหลัง
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, step]);

  const current = open === null ? null : images[open];
  // โหลดรูปถัดไป/ก่อนหน้าล่วงหน้า กดลูกศรแล้วไม่ต้องรอ
  const neighbors =
    open === null || images.length < 2
      ? []
      : [images[(open + 1) % images.length], images[(open - 1 + images.length) % images.length]];

  const navBtnCls =
    "absolute top-1/2 -translate-y-1/2 rounded-full bg-night/60 p-2.5 text-gold-light ring-1 ring-gold/30 transition hover:bg-night/90";

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={t.product.zoomAria}
            className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-xl border border-gold/20 bg-night-soft transition hover:border-gold/60"
          >
            <Image
              src={src}
              alt={t.gallery.photoAlt(title, i + 1)}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {current && open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.product.zoomAria}
          className="fixed inset-0 z-50 bg-night/95 backdrop-blur-sm"
          onClick={() => setOpen(null)}
          onTouchStart={(e) => {
            touchX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const start = touchX.current;
            touchX.current = null;
            const end = e.changedTouches[0]?.clientX;
            if (start === null || end === undefined) return;
            const dx = end - start;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          }}
        >
          <div className="flex h-full w-full items-center justify-center p-2 sm:p-8">
            {/* รูปเต็มความละเอียด — ไม่ผ่าน next/image เพราะขนาดจอเปลี่ยนตามการหมุนเครื่อง */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current}
              src={current}
              alt={t.gallery.photoAlt(title, open + 1)}
              onClick={(e) => e.stopPropagation()}
              className="max-h-full max-w-full rounded-lg object-contain shadow-2xl shadow-black/60"
            />
          </div>
          {neighbors.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" aria-hidden className="hidden" />
          ))}

          <button
            type="button"
            aria-label={t.product.closeZoom}
            onClick={() => setOpen(null)}
            className="absolute right-3 top-3 rounded-full bg-night/70 p-2.5 text-ivory ring-1 ring-gold/30 transition hover:bg-night"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label={t.product.prevMedia}
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className={`${navBtnCls} left-2`}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                  <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                aria-label={t.product.nextMedia}
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className={`${navBtnCls} right-2`}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-night/70 px-3 py-1 text-xs text-ivory ring-1 ring-gold/30">
                {open + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
